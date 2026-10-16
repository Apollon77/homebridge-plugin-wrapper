"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraController = exports.CameraControllerEvents = exports.ResourceRequestReason = void 0;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const events_1 = require("events");
const camera_1 = require("../camera");
const Characteristic_1 = require("../Characteristic");
const datastream_1 = require("../datastream");
const Service_1 = require("../Service");
const hapStatusError_1 = require("../util/hapStatusError");
const debug = (0, debug_1.default)("HAP-NodeJS:Camera:Controller");
/**
 * @group Camera
 */
var ResourceRequestReason;
(function (ResourceRequestReason) {
    /**
     * The reason describes periodic resource requests.
     * In the example of camera image snapshots those are the typical preview images every 10 seconds.
     */
    ResourceRequestReason[ResourceRequestReason["PERIODIC"] = 0] = "PERIODIC";
    /**
     * The resource request is the result of some event.
     * In the example of camera image snapshots, requests are made due to e.g. a motion event or similar.
     */
    ResourceRequestReason[ResourceRequestReason["EVENT"] = 1] = "EVENT";
})(ResourceRequestReason || (exports.ResourceRequestReason = ResourceRequestReason = {}));
/**
 * @group Camera
 */
var CameraControllerEvents;
(function (CameraControllerEvents) {
    /**
     *  Emitted when the mute state or the volume changed. The Apple Home App typically does not set those values
     *  except the mute state. When you adjust the volume in the Camera view it will reset the muted state if it was set previously.
     *  The value of volume has nothing to do with the volume slider in the Camera view of the Home app.
     */
    CameraControllerEvents["MICROPHONE_PROPERTIES_CHANGED"] = "microphone-change";
    /**
     * Emitted when the mute state or the volume changed. The Apple Home App typically does not set those values
     * except the mute state. When you unmute the device microphone it will reset the mute state if it was set previously.
     */
    CameraControllerEvents["SPEAKER_PROPERTIES_CHANGED"] = "speaker-change";
})(CameraControllerEvents || (exports.CameraControllerEvents = CameraControllerEvents = {}));
/**
 * Everything needed to expose a HomeKit Camera.
 *
 * @group Camera
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class CameraController extends events_1.EventEmitter {
    static STREAM_MANAGEMENT = "streamManagement"; // key to index all RTPStreamManagement services
    stateChangeDelegate;
    streamCount;
    delegate;
    streamingOptions;
    /**
     * **Temporary** storage for {@link CameraRecordingOptions} and {@link CameraRecordingDelegate}.
     * This property is reset to `undefined` after the CameraController was fully initialized.
     * You can still access those values via the {@link CameraController.recordingManagement}.
     */
    recording;
    /**
     * Temporary storage for the sensor option.
     */
    sensorOptions;
    legacyMode = false;
    /**
     * @private
     */
    streamManagements = [];
    /**
     * The {@link RecordingManagement} which is responsible for handling HomeKit Secure Video.
     * This property is only present if recording was configured.
     */
    recordingManagement;
    microphoneService;
    speakerService;
    microphoneMuted = false;
    microphoneVolume = 100;
    speakerMuted = false;
    speakerVolume = 100;
    motionService;
    motionServiceExternallySupplied = false;
    occupancyService;
    occupancyServiceExternallySupplied = false;
    constructor(options, legacyMode = false) {
        super();
        this.streamCount = Math.max(1, options.cameraStreamCount || 1);
        this.delegate = options.delegate;
        this.streamingOptions = options.streamingOptions;
        this.recording = options.recording;
        this.sensorOptions = options.sensors;
        this.legacyMode = legacyMode; // legacy mode will prevent from Microphone and Speaker services to get created to avoid collisions
    }
    /**
     * @private
     */
    controllerId() {
        return "camera" /* DefaultControllerType.CAMERA */;
    }
    // ----------------------------------- STREAM API ------------------------------------
    /**
     * Call this method if you want to forcefully suspend an ongoing streaming session.
     * This would be adequate if the rtp server or media encoding encountered an unexpected error.
     *
     * @param sessionId - id of the current ongoing streaming session
     */
    forceStopStreamingSession(sessionId) {
        this.streamManagements.forEach(management => {
            if (management.sessionIdentifier === sessionId) {
                management.forceStop();
            }
        });
    }
    static generateSynchronisationSource() {
        const ssrc = crypto_1.default.randomBytes(4); // range [-2.14748e+09 - 2.14748e+09]
        ssrc[0] = 0;
        return ssrc.readInt32BE(0);
    }
    // ----------------------------- MICROPHONE/SPEAKER API ------------------------------
    setMicrophoneMuted(muted = true) {
        if (!this.microphoneService) {
            return;
        }
        this.microphoneMuted = muted;
        this.microphoneService.updateCharacteristic(Characteristic_1.Characteristic.Mute, muted);
    }
    setMicrophoneVolume(volume) {
        if (!this.microphoneService) {
            return;
        }
        this.microphoneVolume = volume;
        this.microphoneService.updateCharacteristic(Characteristic_1.Characteristic.Volume, volume);
    }
    setSpeakerMuted(muted = true) {
        if (!this.speakerService) {
            return;
        }
        this.speakerMuted = muted;
        this.speakerService.updateCharacteristic(Characteristic_1.Characteristic.Mute, muted);
    }
    setSpeakerVolume(volume) {
        if (!this.speakerService) {
            return;
        }
        this.speakerVolume = volume;
        this.speakerService.updateCharacteristic(Characteristic_1.Characteristic.Volume, volume);
    }
    emitMicrophoneChange() {
        this.emit("microphone-change" /* CameraControllerEvents.MICROPHONE_PROPERTIES_CHANGED */, this.microphoneMuted, this.microphoneVolume);
    }
    emitSpeakerChange() {
        this.emit("speaker-change" /* CameraControllerEvents.SPEAKER_PROPERTIES_CHANGED */, this.speakerMuted, this.speakerVolume);
    }
    // -----------------------------------------------------------------------------------
    /**
     * @private
     */
    constructServices() {
        for (let i = 0; i < this.streamCount; i++) {
            const rtp = new camera_1.RTPStreamManagement(i, this.streamingOptions, this.delegate, undefined, this.rtpStreamManagementDisabledThroughOperatingMode.bind(this));
            this.streamManagements.push(rtp);
        }
        if (!this.legacyMode && this.streamingOptions.audio) {
            // In theory the Microphone Service is a necessity. In practice, it's not. lol.
            // So we just add it if the user wants to support audio
            this.microphoneService = new Service_1.Service.Microphone("", "");
            this.microphoneService.setCharacteristic(Characteristic_1.Characteristic.Volume, this.microphoneVolume);
            if (this.streamingOptions.audio.twoWayAudio) {
                this.speakerService = new Service_1.Service.Speaker("", "");
                this.speakerService.setCharacteristic(Characteristic_1.Characteristic.Volume, this.speakerVolume);
            }
        }
        if (this.recording) {
            this.recordingManagement = new camera_1.RecordingManagement(this.recording.options, this.recording.delegate, this.retrieveEventTriggerOptions());
        }
        if (this.sensorOptions?.motion) {
            if (typeof this.sensorOptions.motion === "boolean") {
                this.motionService = new Service_1.Service.MotionSensor("", "");
            }
            else {
                this.motionService = this.sensorOptions.motion;
                this.motionServiceExternallySupplied = true;
            }
            this.motionService.setCharacteristic(Characteristic_1.Characteristic.StatusActive, true);
            this.recordingManagement?.recordingManagementService.addLinkedService(this.motionService);
        }
        if (this.sensorOptions?.occupancy) {
            if (typeof this.sensorOptions.occupancy === "boolean") {
                this.occupancyService = new Service_1.Service.OccupancySensor("", "");
            }
            else {
                this.occupancyService = this.sensorOptions.occupancy;
                this.occupancyServiceExternallySupplied = true;
            }
            this.occupancyService.setCharacteristic(Characteristic_1.Characteristic.StatusActive, true);
            this.recordingManagement?.recordingManagementService.addLinkedService(this.occupancyService);
        }
        const serviceMap = {
            microphone: this.microphoneService,
            speaker: this.speakerService,
            motionService: !this.motionServiceExternallySupplied ? this.motionService : undefined,
            occupancyService: !this.occupancyServiceExternallySupplied ? this.occupancyService : undefined,
        };
        if (this.recordingManagement) {
            serviceMap.cameraEventRecordingManagement = this.recordingManagement.recordingManagementService;
            serviceMap.cameraOperatingMode = this.recordingManagement.operatingModeService;
            serviceMap.dataStreamTransportManagement = this.recordingManagement.dataStreamManagement.getService();
        }
        this.streamManagements.forEach((management, index) => {
            serviceMap[CameraController.STREAM_MANAGEMENT + index] = management.getService();
        });
        this.recording = undefined;
        this.sensorOptions = undefined;
        return serviceMap;
    }
    /**
     * @private
     */
    initWithServices(serviceMap) {
        const result = this._initWithServices(serviceMap);
        if (result.updated) { // serviceMap must only be returned if anything actually changed
            return result.serviceMap;
        }
    }
    _initWithServices(serviceMap) {
        let modifiedServiceMap = false;
        // eslint-disable-next-line no-constant-condition
        for (let i = 0; true; i++) {
            const streamManagementService = serviceMap[CameraController.STREAM_MANAGEMENT + i];
            if (i < this.streamCount) {
                const operatingModeClosure = this.rtpStreamManagementDisabledThroughOperatingMode.bind(this);
                if (streamManagementService) { // normal init
                    this.streamManagements.push(new camera_1.RTPStreamManagement(i, this.streamingOptions, this.delegate, streamManagementService, operatingModeClosure));
                }
                else { // stream count got bigger, we need to create a new service
                    const management = new camera_1.RTPStreamManagement(i, this.streamingOptions, this.delegate, undefined, operatingModeClosure);
                    this.streamManagements.push(management);
                    serviceMap[CameraController.STREAM_MANAGEMENT + i] = management.getService();
                    modifiedServiceMap = true;
                }
            }
            else {
                if (streamManagementService) { // stream count got reduced, we need to remove old service
                    delete serviceMap[CameraController.STREAM_MANAGEMENT + i];
                    modifiedServiceMap = true;
                }
                else {
                    break; // we finished counting, and we got no saved service; we are finished
                }
            }
        }
        // MICROPHONE
        if (!this.legacyMode && this.streamingOptions.audio) { // microphone should be present
            if (serviceMap.microphone) {
                this.microphoneService = serviceMap.microphone;
            }
            else {
                // microphone wasn't created yet => create a new one
                this.microphoneService = new Service_1.Service.Microphone("", "");
                this.microphoneService.setCharacteristic(Characteristic_1.Characteristic.Volume, this.microphoneVolume);
                serviceMap.microphone = this.microphoneService;
                modifiedServiceMap = true;
            }
        }
        else if (serviceMap.microphone) { // microphone service supplied, though settings seemed to have changed
            // we need to remove it
            delete serviceMap.microphone;
            modifiedServiceMap = true;
        }
        // SPEAKER
        if (!this.legacyMode && this.streamingOptions.audio?.twoWayAudio) { // speaker should be present
            if (serviceMap.speaker) {
                this.speakerService = serviceMap.speaker;
            }
            else {
                // speaker wasn't created yet => create a new one
                this.speakerService = new Service_1.Service.Speaker("", "");
                this.speakerService.setCharacteristic(Characteristic_1.Characteristic.Volume, this.speakerVolume);
                serviceMap.speaker = this.speakerService;
                modifiedServiceMap = true;
            }
        }
        else if (serviceMap.speaker) { // speaker service supplied, though settings seemed to have changed
            // we need to remove it
            delete serviceMap.speaker;
            modifiedServiceMap = true;
        }
        // RECORDING
        if (this.recording) {
            const eventTriggers = this.retrieveEventTriggerOptions();
            // RECORDING MANAGEMENT
            if (serviceMap.cameraEventRecordingManagement && serviceMap.cameraOperatingMode && serviceMap.dataStreamTransportManagement) {
                this.recordingManagement = new camera_1.RecordingManagement(this.recording.options, this.recording.delegate, eventTriggers, {
                    recordingManagement: serviceMap.cameraEventRecordingManagement,
                    operatingMode: serviceMap.cameraOperatingMode,
                    dataStreamManagement: new datastream_1.DataStreamManagement(serviceMap.dataStreamTransportManagement),
                });
            }
            else {
                this.recordingManagement = new camera_1.RecordingManagement(this.recording.options, this.recording.delegate, eventTriggers);
                serviceMap.cameraEventRecordingManagement = this.recordingManagement.recordingManagementService;
                serviceMap.cameraOperatingMode = this.recordingManagement.operatingModeService;
                serviceMap.dataStreamTransportManagement = this.recordingManagement.dataStreamManagement.getService();
                modifiedServiceMap = true;
            }
        }
        else {
            if (serviceMap.cameraEventRecordingManagement) {
                delete serviceMap.cameraEventRecordingManagement;
                modifiedServiceMap = true;
            }
            if (serviceMap.cameraOperatingMode) {
                delete serviceMap.cameraOperatingMode;
                modifiedServiceMap = true;
            }
            if (serviceMap.dataStreamTransportManagement) {
                delete serviceMap.dataStreamTransportManagement;
                modifiedServiceMap = true;
            }
        }
        // MOTION SENSOR
        if (this.sensorOptions?.motion) {
            if (typeof this.sensorOptions.motion === "boolean") {
                if (serviceMap.motionService) {
                    this.motionService = serviceMap.motionService;
                }
                else {
                    // it could be the case that we previously had a manually supplied motion service
                    // at this point we can't remove the iid from the list of linked services from the recording management!
                    this.motionService = new Service_1.Service.MotionSensor("", "");
                }
            }
            else {
                this.motionService = this.sensorOptions.motion;
                this.motionServiceExternallySupplied = true;
                if (serviceMap.motionService) { // motion service previously supplied as bool option
                    this.recordingManagement?.recordingManagementService.removeLinkedService(serviceMap.motionService);
                    delete serviceMap.motionService;
                    modifiedServiceMap = true;
                }
            }
            this.motionService.setCharacteristic(Characteristic_1.Characteristic.StatusActive, true);
            this.recordingManagement?.recordingManagementService.addLinkedService(this.motionService);
        }
        else {
            if (serviceMap.motionService) {
                this.recordingManagement?.recordingManagementService.removeLinkedService(serviceMap.motionService);
                delete serviceMap.motionService;
                modifiedServiceMap = true;
            }
        }
        // OCCUPANCY SENSOR
        if (this.sensorOptions?.occupancy) {
            if (typeof this.sensorOptions.occupancy === "boolean") {
                if (serviceMap.occupancyService) {
                    this.occupancyService = serviceMap.occupancyService;
                }
                else {
                    // it could be the case that we previously had a manually supplied occupancy service
                    // at this point we can't remove the iid from the list of linked services from the recording management!
                    this.occupancyService = new Service_1.Service.OccupancySensor("", "");
                }
            }
            else {
                this.occupancyService = this.sensorOptions.occupancy;
                this.occupancyServiceExternallySupplied = true;
                if (serviceMap.occupancyService) { // occupancy service previously supplied as bool option
                    this.recordingManagement?.recordingManagementService.removeLinkedService(serviceMap.occupancyService);
                    delete serviceMap.occupancyService;
                    modifiedServiceMap = true;
                }
            }
            this.occupancyService.setCharacteristic(Characteristic_1.Characteristic.StatusActive, true);
            this.recordingManagement?.recordingManagementService.addLinkedService(this.occupancyService);
        }
        else {
            if (serviceMap.occupancyService) {
                this.recordingManagement?.recordingManagementService.removeLinkedService(serviceMap.occupancyService);
                delete serviceMap.occupancyService;
                modifiedServiceMap = true;
            }
        }
        if (this.migrateFromDoorbell(serviceMap)) {
            modifiedServiceMap = true;
        }
        this.recording = undefined;
        this.sensorOptions = undefined;
        return {
            serviceMap: serviceMap,
            updated: modifiedServiceMap,
        };
    }
    // overwritten in DoorbellController (to avoid cyclic dependencies, I hate typescript for that)
    migrateFromDoorbell(serviceMap) {
        if (serviceMap.doorbell) { // See NOTICE in DoorbellController
            delete serviceMap.doorbell;
            return true;
        }
        return false;
    }
    retrieveEventTriggerOptions() {
        if (!this.recording) {
            return new Set();
        }
        const triggerOptions = new Set();
        if (this.recording.options.overrideEventTriggerOptions) {
            for (const option of this.recording.options.overrideEventTriggerOptions) {
                triggerOptions.add(option);
            }
        }
        if (this.sensorOptions?.motion) {
            triggerOptions.add(1 /* EventTriggerOption.MOTION */);
        }
        // this method is overwritten by the `DoorbellController` to automatically configure EventTriggerOption.DOORBELL
        return triggerOptions;
    }
    /**
     * @private
     */
    configureServices() {
        if (this.microphoneService) {
            this.microphoneService.getCharacteristic(Characteristic_1.Characteristic.Mute)
                .on("get" /* CharacteristicEventTypes.GET */, (callback) => {
                callback(undefined, this.microphoneMuted);
            })
                .on("set" /* CharacteristicEventTypes.SET */, (value, callback) => {
                this.microphoneMuted = value;
                callback();
                this.emitMicrophoneChange();
            });
            this.microphoneService.getCharacteristic(Characteristic_1.Characteristic.Volume)
                .on("get" /* CharacteristicEventTypes.GET */, (callback) => {
                callback(undefined, this.microphoneVolume);
            })
                .on("set" /* CharacteristicEventTypes.SET */, (value, callback) => {
                this.microphoneVolume = value;
                callback();
                this.emitMicrophoneChange();
            });
        }
        if (this.speakerService) {
            this.speakerService.getCharacteristic(Characteristic_1.Characteristic.Mute)
                .on("get" /* CharacteristicEventTypes.GET */, (callback) => {
                callback(undefined, this.speakerMuted);
            })
                .on("set" /* CharacteristicEventTypes.SET */, (value, callback) => {
                this.speakerMuted = value;
                callback();
                this.emitSpeakerChange();
            });
            this.speakerService.getCharacteristic(Characteristic_1.Characteristic.Volume)
                .on("get" /* CharacteristicEventTypes.GET */, (callback) => {
                callback(undefined, this.speakerVolume);
            })
                .on("set" /* CharacteristicEventTypes.SET */, (value, callback) => {
                this.speakerVolume = value;
                callback();
                this.emitSpeakerChange();
            });
        }
        // make the sensor services available to the RecordingManagement.
        if (this.motionService) {
            this.recordingManagement?.sensorServices.push(this.motionService);
        }
        if (this.occupancyService) {
            this.recordingManagement?.sensorServices.push(this.occupancyService);
        }
    }
    rtpStreamManagementDisabledThroughOperatingMode() {
        return this.recordingManagement
            ? !this.recordingManagement.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive).value
            : false;
    }
    /**
     * @private
     */
    handleControllerRemoved() {
        this.handleFactoryReset();
        for (const management of this.streamManagements) {
            management.destroy();
        }
        this.streamManagements.splice(0, this.streamManagements.length);
        this.microphoneService = undefined;
        this.speakerService = undefined;
        this.recordingManagement?.destroy();
        this.recordingManagement = undefined;
        this.removeAllListeners();
    }
    /**
     * @private
     */
    handleFactoryReset() {
        this.streamManagements.forEach(management => management.handleFactoryReset());
        this.recordingManagement?.handleFactoryReset();
        this.microphoneMuted = false;
        this.microphoneVolume = 100;
        this.speakerMuted = false;
        this.speakerVolume = 100;
    }
    /**
     * @private
     */
    serialize() {
        const streamManagementStates = [];
        for (const management of this.streamManagements) {
            const serializedState = management.serialize();
            if (serializedState) {
                streamManagementStates.push(serializedState);
            }
        }
        return {
            streamManagements: streamManagementStates,
            recordingManagement: this.recordingManagement?.serialize(),
        };
    }
    /**
     * @private
     */
    deserialize(serialized) {
        for (const streamManagementState of serialized.streamManagements) {
            const streamManagement = this.streamManagements[streamManagementState.id];
            if (streamManagement) {
                streamManagement.deserialize(streamManagementState);
            }
        }
        if (serialized.recordingManagement) {
            if (this.recordingManagement) {
                this.recordingManagement.deserialize(serialized.recordingManagement);
            }
            else {
                // Active characteristic cannot be controlled if removing HSV, ensure they are all active!
                for (const streamManagement of this.streamManagements) {
                    streamManagement.service.updateCharacteristic(Characteristic_1.Characteristic.Active, true);
                }
                this.stateChangeDelegate?.();
            }
        }
    }
    /**
     * @private
     */
    setupStateChangeDelegate(delegate) {
        this.stateChangeDelegate = delegate;
        for (const streamManagement of this.streamManagements) {
            streamManagement.setupStateChangeDelegate(delegate);
        }
        this.recordingManagement?.setupStateChangeDelegate(delegate);
    }
    /**
     * @private
     */
    handleSnapshotRequest(height, width, accessoryName, reason) {
        // first step is to verify that the reason is applicable to our current policy
        const streamingDisabled = this.streamManagements
            .map(management => !management.getService().getCharacteristic(Characteristic_1.Characteristic.Active).value)
            .reduce((previousValue, currentValue) => previousValue && currentValue);
        if (streamingDisabled) {
            debug("[%s] Rejecting snapshot as streaming is disabled.", accessoryName);
            return Promise.reject(-70412 /* HAPStatus.NOT_ALLOWED_IN_CURRENT_STATE */);
        }
        if (this.recordingManagement) {
            const operatingModeService = this.recordingManagement.operatingModeService;
            if (!operatingModeService.getCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive).value) {
                debug("[%s] Rejecting snapshot as HomeKit camera is disabled.", accessoryName);
                return Promise.reject(-70412 /* HAPStatus.NOT_ALLOWED_IN_CURRENT_STATE */);
            }
            const eventSnapshotsActive = operatingModeService
                .getCharacteristic(Characteristic_1.Characteristic.EventSnapshotsActive)
                .value;
            if (!eventSnapshotsActive) {
                if (reason == null) {
                    debug("[%s] Rejecting snapshot as reason is required due to disabled event snapshots.", accessoryName);
                    return Promise.reject(-70401 /* HAPStatus.INSUFFICIENT_PRIVILEGES */);
                }
                else if (reason === 1 /* ResourceRequestReason.EVENT */) {
                    debug("[%s] Rejecting snapshot as even snapshots are disabled.", accessoryName);
                    return Promise.reject(-70412 /* HAPStatus.NOT_ALLOWED_IN_CURRENT_STATE */);
                }
            }
            const periodicSnapshotsActive = operatingModeService
                .getCharacteristic(Characteristic_1.Characteristic.PeriodicSnapshotsActive)
                .value;
            if (!periodicSnapshotsActive) {
                if (reason == null) {
                    debug("[%s] Rejecting snapshot as reason is required due to disabled periodic snapshots.", accessoryName);
                    return Promise.reject(-70401 /* HAPStatus.INSUFFICIENT_PRIVILEGES */);
                }
                else if (reason === 0 /* ResourceRequestReason.PERIODIC */) {
                    debug("[%s] Rejecting snapshot as periodic snapshots are disabled.", accessoryName);
                    return Promise.reject(-70412 /* HAPStatus.NOT_ALLOWED_IN_CURRENT_STATE */);
                }
            }
        }
        // now do the actual snapshot request.
        return new Promise((resolve, reject) => {
            // TODO test and make timeouts configurable!
            let timeout = setTimeout(() => {
                console.warn(`[${accessoryName}] The image snapshot handler for the given accessory is slow to respond! See https://homebridge.io/w/JtMGR for more info.`);
                timeout = setTimeout(() => {
                    timeout = undefined;
                    console.warn(`[${accessoryName}] The image snapshot handler for the given accessory didn't respond at all! See https://homebridge.io/w/JtMGR for more info.`);
                    reject(-70408 /* HAPStatus.OPERATION_TIMED_OUT */);
                }, 17000);
                timeout.unref();
            }, 8000);
            timeout.unref();
            try {
                this.delegate.handleSnapshotRequest({
                    height: height,
                    width: width,
                    reason: reason,
                }, (error, buffer) => {
                    if (!timeout) {
                        return;
                    }
                    else {
                        clearTimeout(timeout);
                        timeout = undefined;
                    }
                    if (error) {
                        if (typeof error === "number") {
                            reject(error);
                        }
                        else {
                            debug("[%s] Error getting snapshot: %s", accessoryName, error.stack);
                            reject(-70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
                        }
                        return;
                    }
                    if (!buffer || buffer.length === 0) {
                        console.warn(`[${accessoryName}] Snapshot request handler provided empty image buffer!`);
                        reject(-70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
                    }
                    else {
                        resolve(buffer);
                    }
                });
            }
            catch (error) {
                if (!timeout) {
                    return;
                }
                else {
                    clearTimeout(timeout);
                    timeout = undefined;
                }
                console.warn(`[${accessoryName}] Unhandled error thrown inside snapshot request handler: ${error.stack}`);
                reject(error instanceof hapStatusError_1.HapStatusError ? error.hapStatus : -70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
            }
        });
    }
}
exports.CameraController = CameraController;
//# sourceMappingURL=CameraController.js.map