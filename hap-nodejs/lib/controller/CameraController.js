"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraController = exports.CameraControllerEvents = exports.ResourceRequestReason = void 0;
var tslib_1 = require("tslib");
var crypto_1 = (0, tslib_1.__importDefault)(require("crypto"));
var debug_1 = (0, tslib_1.__importDefault)(require("debug"));
var events_1 = require("events");
var camera_1 = require("../camera");
var Characteristic_1 = require("../Characteristic");
var datastream_1 = require("../datastream");
var Service_1 = require("../Service");
var hapStatusError_1 = require("../util/hapStatusError");
var debug = (0, debug_1.default)("HAP-NodeJS:Camera:Controller");
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
})(ResourceRequestReason = exports.ResourceRequestReason || (exports.ResourceRequestReason = {}));
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
})(CameraControllerEvents = exports.CameraControllerEvents || (exports.CameraControllerEvents = {}));
/**
 * Everything needed to expose a HomeKit Camera.
 */
var CameraController = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(CameraController, _super);
    function CameraController(options, legacyMode) {
        if (legacyMode === void 0) { legacyMode = false; }
        var _this = _super.call(this) || this;
        _this.legacyMode = false;
        /**
         * @private
         */
        _this.streamManagements = [];
        _this.microphoneMuted = false;
        _this.microphoneVolume = 100;
        _this.speakerMuted = false;
        _this.speakerVolume = 100;
        _this.motionServiceExternallySupplied = false;
        _this.occupancyServiceExternallySupplied = false;
        _this.streamCount = Math.max(1, options.cameraStreamCount || 1);
        _this.delegate = options.delegate;
        _this.streamingOptions = options.streamingOptions;
        _this.recording = options.recording;
        _this.sensorOptions = options.sensors;
        _this.legacyMode = legacyMode; // legacy mode will prevent from Microphone and Speaker services to get created to avoid collisions
        return _this;
    }
    /**
     * @private
     */
    CameraController.prototype.controllerId = function () {
        return "camera" /* CAMERA */;
    };
    // ----------------------------------- STREAM API ------------------------------------
    /**
     * Call this method if you want to forcefully suspend an ongoing streaming session.
     * This would be adequate if the rtp server or media encoding encountered an unexpected error.
     *
     * @param sessionId {SessionIdentifier} - id of the current ongoing streaming session
     */
    CameraController.prototype.forceStopStreamingSession = function (sessionId) {
        this.streamManagements.forEach(function (management) {
            if (management.sessionIdentifier === sessionId) {
                management.forceStop();
            }
        });
    };
    CameraController.generateSynchronisationSource = function () {
        var ssrc = crypto_1.default.randomBytes(4); // range [-2.14748e+09 - 2.14748e+09]
        ssrc[0] = 0;
        return ssrc.readInt32BE(0);
    };
    // ----------------------------- MICROPHONE/SPEAKER API ------------------------------
    CameraController.prototype.setMicrophoneMuted = function (muted) {
        if (muted === void 0) { muted = true; }
        if (!this.microphoneService) {
            return;
        }
        this.microphoneMuted = muted;
        this.microphoneService.updateCharacteristic(Characteristic_1.Characteristic.Mute, muted);
    };
    CameraController.prototype.setMicrophoneVolume = function (volume) {
        if (!this.microphoneService) {
            return;
        }
        this.microphoneVolume = volume;
        this.microphoneService.updateCharacteristic(Characteristic_1.Characteristic.Volume, volume);
    };
    CameraController.prototype.setSpeakerMuted = function (muted) {
        if (muted === void 0) { muted = true; }
        if (!this.speakerService) {
            return;
        }
        this.speakerMuted = muted;
        this.speakerService.updateCharacteristic(Characteristic_1.Characteristic.Mute, muted);
    };
    CameraController.prototype.setSpeakerVolume = function (volume) {
        if (!this.speakerService) {
            return;
        }
        this.speakerVolume = volume;
        this.speakerService.updateCharacteristic(Characteristic_1.Characteristic.Volume, volume);
    };
    CameraController.prototype.emitMicrophoneChange = function () {
        this.emit("microphone-change" /* MICROPHONE_PROPERTIES_CHANGED */, this.microphoneMuted, this.microphoneVolume);
    };
    CameraController.prototype.emitSpeakerChange = function () {
        this.emit("speaker-change" /* SPEAKER_PROPERTIES_CHANGED */, this.speakerMuted, this.speakerVolume);
    };
    // -----------------------------------------------------------------------------------
    /**
     * @private
     */
    CameraController.prototype.constructServices = function () {
        var _a, _b, _c, _d;
        for (var i = 0; i < this.streamCount; i++) {
            var rtp = new camera_1.RTPStreamManagement(i, this.streamingOptions, this.delegate, undefined, this.rtpStreamManagementDisabledThroughOperatingMode.bind(this));
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
        if ((_a = this.sensorOptions) === null || _a === void 0 ? void 0 : _a.motion) {
            if (typeof this.sensorOptions.motion === "boolean") {
                this.motionService = new Service_1.Service.MotionSensor("", "");
            }
            else {
                this.motionService = this.sensorOptions.motion;
                this.motionServiceExternallySupplied = true;
            }
            this.motionService.setCharacteristic(Characteristic_1.Characteristic.StatusActive, true);
            (_b = this.recordingManagement) === null || _b === void 0 ? void 0 : _b.recordingManagementService.addLinkedService(this.motionService);
        }
        if ((_c = this.sensorOptions) === null || _c === void 0 ? void 0 : _c.occupancy) {
            if (typeof this.sensorOptions.occupancy === "boolean") {
                this.occupancyService = new Service_1.Service.OccupancySensor("", "");
            }
            else {
                this.occupancyService = this.sensorOptions.occupancy;
                this.occupancyServiceExternallySupplied = true;
            }
            this.occupancyService.setCharacteristic(Characteristic_1.Characteristic.StatusActive, true);
            (_d = this.recordingManagement) === null || _d === void 0 ? void 0 : _d.recordingManagementService.addLinkedService(this.occupancyService);
        }
        var serviceMap = {
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
        this.streamManagements.forEach(function (management, index) {
            serviceMap[CameraController.STREAM_MANAGEMENT + index] = management.getService();
        });
        this.recording = undefined;
        this.sensorOptions = undefined;
        return serviceMap;
    };
    /**
     * @private
     */
    CameraController.prototype.initWithServices = function (serviceMap) {
        var result = this._initWithServices(serviceMap);
        if (result.updated) { // serviceMap must only be returned if anything actually changed
            return result.serviceMap;
        }
    };
    CameraController.prototype._initWithServices = function (serviceMap) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var modifiedServiceMap = false;
        // eslint-disable-next-line no-constant-condition
        for (var i = 0; true; i++) {
            var streamManagementService = serviceMap[CameraController.STREAM_MANAGEMENT + i];
            if (i < this.streamCount) {
                var operatingModeClosure = this.rtpStreamManagementDisabledThroughOperatingMode.bind(this);
                if (streamManagementService) { // normal init
                    this.streamManagements.push(new camera_1.RTPStreamManagement(i, this.streamingOptions, this.delegate, streamManagementService, operatingModeClosure));
                }
                else { // stream count got bigger, we need to create a new service
                    var management = new camera_1.RTPStreamManagement(i, this.streamingOptions, this.delegate, undefined, operatingModeClosure);
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
        if (!this.legacyMode && ((_a = this.streamingOptions.audio) === null || _a === void 0 ? void 0 : _a.twoWayAudio)) { // speaker should be present
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
            var eventTriggers = this.retrieveEventTriggerOptions();
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
        if ((_b = this.sensorOptions) === null || _b === void 0 ? void 0 : _b.motion) {
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
                    (_c = this.recordingManagement) === null || _c === void 0 ? void 0 : _c.recordingManagementService.removeLinkedService(serviceMap.motionService);
                    delete serviceMap.motionService;
                    modifiedServiceMap = true;
                }
            }
            this.motionService.setCharacteristic(Characteristic_1.Characteristic.StatusActive, true);
            (_d = this.recordingManagement) === null || _d === void 0 ? void 0 : _d.recordingManagementService.addLinkedService(this.motionService);
        }
        else {
            if (serviceMap.motionService) {
                (_e = this.recordingManagement) === null || _e === void 0 ? void 0 : _e.recordingManagementService.removeLinkedService(serviceMap.motionService);
                delete serviceMap.motionService;
                modifiedServiceMap = true;
            }
        }
        // OCCUPANCY SENSOR
        if ((_f = this.sensorOptions) === null || _f === void 0 ? void 0 : _f.occupancy) {
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
                    (_g = this.recordingManagement) === null || _g === void 0 ? void 0 : _g.recordingManagementService.removeLinkedService(serviceMap.occupancyService);
                    delete serviceMap.occupancyService;
                    modifiedServiceMap = true;
                }
            }
            this.occupancyService.setCharacteristic(Characteristic_1.Characteristic.StatusActive, true);
            (_h = this.recordingManagement) === null || _h === void 0 ? void 0 : _h.recordingManagementService.addLinkedService(this.occupancyService);
        }
        else {
            if (serviceMap.occupancyService) {
                (_j = this.recordingManagement) === null || _j === void 0 ? void 0 : _j.recordingManagementService.removeLinkedService(serviceMap.occupancyService);
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
    };
    // overwritten in DoorbellController (to avoid cyclic dependencies, I hate typescript for that)
    CameraController.prototype.migrateFromDoorbell = function (serviceMap) {
        if (serviceMap.doorbell) { // See NOTICE in DoorbellController
            delete serviceMap.doorbell;
            return true;
        }
        return false;
    };
    CameraController.prototype.retrieveEventTriggerOptions = function () {
        var e_1, _a;
        var _b;
        if (!this.recording) {
            return new Set();
        }
        var triggerOptions = new Set();
        if (this.recording.options.overrideEventTriggerOptions) {
            try {
                for (var _c = (0, tslib_1.__values)(this.recording.options.overrideEventTriggerOptions), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var option = _d.value;
                    triggerOptions.add(option);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        if ((_b = this.sensorOptions) === null || _b === void 0 ? void 0 : _b.motion) {
            triggerOptions.add(1 /* MOTION */);
        }
        // this method is overwritten by the `DoorbellController` to automatically configure EventTriggerOption.DOORBELL
        return triggerOptions;
    };
    /**
     * @private
     */
    CameraController.prototype.configureServices = function () {
        var _this = this;
        var _a, _b;
        if (this.microphoneService) {
            this.microphoneService.getCharacteristic(Characteristic_1.Characteristic.Mute)
                .on("get" /* GET */, function (callback) {
                callback(undefined, _this.microphoneMuted);
            })
                .on("set" /* SET */, function (value, callback) {
                _this.microphoneMuted = value;
                callback();
                _this.emitMicrophoneChange();
            });
            this.microphoneService.getCharacteristic(Characteristic_1.Characteristic.Volume)
                .on("get" /* GET */, function (callback) {
                callback(undefined, _this.microphoneVolume);
            })
                .on("set" /* SET */, function (value, callback) {
                _this.microphoneVolume = value;
                callback();
                _this.emitMicrophoneChange();
            });
        }
        if (this.speakerService) {
            this.speakerService.getCharacteristic(Characteristic_1.Characteristic.Mute)
                .on("get" /* GET */, function (callback) {
                callback(undefined, _this.speakerMuted);
            })
                .on("set" /* SET */, function (value, callback) {
                _this.speakerMuted = value;
                callback();
                _this.emitSpeakerChange();
            });
            this.speakerService.getCharacteristic(Characteristic_1.Characteristic.Volume)
                .on("get" /* GET */, function (callback) {
                callback(undefined, _this.speakerVolume);
            })
                .on("set" /* SET */, function (value, callback) {
                _this.speakerVolume = value;
                callback();
                _this.emitSpeakerChange();
            });
        }
        // make the sensor services available to the RecordingManagement.
        if (this.motionService) {
            (_a = this.recordingManagement) === null || _a === void 0 ? void 0 : _a.sensorServices.push(this.motionService);
        }
        if (this.occupancyService) {
            (_b = this.recordingManagement) === null || _b === void 0 ? void 0 : _b.sensorServices.push(this.occupancyService);
        }
    };
    CameraController.prototype.rtpStreamManagementDisabledThroughOperatingMode = function () {
        return this.recordingManagement
            ? !this.recordingManagement.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive).value
            : false;
    };
    /**
     * @private
     */
    CameraController.prototype.handleControllerRemoved = function () {
        var e_2, _a;
        var _b;
        this.handleFactoryReset();
        try {
            for (var _c = (0, tslib_1.__values)(this.streamManagements), _d = _c.next(); !_d.done; _d = _c.next()) {
                var management = _d.value;
                management.destroy();
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.streamManagements.splice(0, this.streamManagements.length);
        this.microphoneService = undefined;
        this.speakerService = undefined;
        (_b = this.recordingManagement) === null || _b === void 0 ? void 0 : _b.destroy();
        this.recordingManagement = undefined;
        this.removeAllListeners();
    };
    /**
     * @private
     */
    CameraController.prototype.handleFactoryReset = function () {
        var _a;
        this.streamManagements.forEach(function (management) { return management.handleFactoryReset(); });
        (_a = this.recordingManagement) === null || _a === void 0 ? void 0 : _a.handleFactoryReset();
        this.microphoneMuted = false;
        this.microphoneVolume = 100;
        this.speakerMuted = false;
        this.speakerVolume = 100;
    };
    /**
     * @private
     */
    CameraController.prototype.serialize = function () {
        var e_3, _a;
        var _b;
        var streamManagementStates = [];
        try {
            for (var _c = (0, tslib_1.__values)(this.streamManagements), _d = _c.next(); !_d.done; _d = _c.next()) {
                var management = _d.value;
                var serializedState = management.serialize();
                if (serializedState) {
                    streamManagementStates.push(serializedState);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return {
            streamManagements: streamManagementStates,
            recordingManagement: (_b = this.recordingManagement) === null || _b === void 0 ? void 0 : _b.serialize(),
        };
    };
    /**
     * @private
     */
    CameraController.prototype.deserialize = function (serialized) {
        var e_4, _a, e_5, _b;
        var _c;
        try {
            for (var _d = (0, tslib_1.__values)(serialized.streamManagements), _e = _d.next(); !_e.done; _e = _d.next()) {
                var streamManagementState = _e.value;
                var streamManagement = this.streamManagements[streamManagementState.id];
                if (streamManagement) {
                    streamManagement.deserialize(streamManagementState);
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_4) throw e_4.error; }
        }
        if (serialized.recordingManagement) {
            if (this.recordingManagement) {
                this.recordingManagement.deserialize(serialized.recordingManagement);
            }
            else {
                try {
                    // Active characteristic cannot be controlled if removing HSV, ensure they are all active!
                    for (var _f = (0, tslib_1.__values)(this.streamManagements), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var streamManagement = _g.value;
                        streamManagement.service.updateCharacteristic(Characteristic_1.Characteristic.Active, true);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                (_c = this.stateChangeDelegate) === null || _c === void 0 ? void 0 : _c.call(this);
            }
        }
    };
    /**
     * @private
     */
    CameraController.prototype.setupStateChangeDelegate = function (delegate) {
        var e_6, _a;
        var _b;
        this.stateChangeDelegate = delegate;
        try {
            for (var _c = (0, tslib_1.__values)(this.streamManagements), _d = _c.next(); !_d.done; _d = _c.next()) {
                var streamManagement = _d.value;
                streamManagement.setupStateChangeDelegate(delegate);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_6) throw e_6.error; }
        }
        (_b = this.recordingManagement) === null || _b === void 0 ? void 0 : _b.setupStateChangeDelegate(delegate);
    };
    /**
     * @private
     */
    CameraController.prototype.handleSnapshotRequest = function (height, width, accessoryName, reason) {
        var _this = this;
        // first step is to verify that the reason is applicable to our current policy
        var streamingDisabled = this.streamManagements
            .map(function (management) { return !management.getService().getCharacteristic(Characteristic_1.Characteristic.Active).value; })
            .reduce(function (previousValue, currentValue) { return previousValue && currentValue; });
        if (streamingDisabled) {
            debug("[%s] Rejecting snapshot as streaming is disabled.", accessoryName);
            return Promise.reject(-70412 /* NOT_ALLOWED_IN_CURRENT_STATE */);
        }
        if (this.recordingManagement) {
            var operatingModeService = this.recordingManagement.operatingModeService;
            if (!operatingModeService.getCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive).value) {
                debug("[%s] Rejecting snapshot as HomeKit camera is disabled.", accessoryName);
                return Promise.reject(-70412 /* NOT_ALLOWED_IN_CURRENT_STATE */);
            }
            var eventSnapshotsActive = operatingModeService
                .getCharacteristic(Characteristic_1.Characteristic.EventSnapshotsActive)
                .value;
            if (!eventSnapshotsActive) {
                if (reason == null) {
                    debug("[%s] Rejecting snapshot as reason is required due to disabled event snapshots.", accessoryName);
                    return Promise.reject(-70401 /* INSUFFICIENT_PRIVILEGES */);
                }
                else if (reason === 1 /* EVENT */) {
                    debug("[%s] Rejecting snapshot as even snapshots are disabled.", accessoryName);
                    return Promise.reject(-70412 /* NOT_ALLOWED_IN_CURRENT_STATE */);
                }
            }
            var periodicSnapshotsActive = operatingModeService
                .getCharacteristic(Characteristic_1.Characteristic.PeriodicSnapshotsActive)
                .value;
            if (!periodicSnapshotsActive) {
                if (reason == null) {
                    debug("[%s] Rejecting snapshot as reason is required due to disabled periodic snapshots.", accessoryName);
                    return Promise.reject(-70401 /* INSUFFICIENT_PRIVILEGES */);
                }
                else if (reason === 0 /* PERIODIC */) {
                    debug("[%s] Rejecting snapshot as periodic snapshots are disabled.", accessoryName);
                    return Promise.reject(-70412 /* NOT_ALLOWED_IN_CURRENT_STATE */);
                }
            }
        }
        // now do the actual snapshot request.
        return new Promise(function (resolve, reject) {
            var timeout = setTimeout(function () {
                console.warn("[".concat(accessoryName, "] The image snapshot handler for the given accessory is slow to respond! See https://homebridge.io/w/JtMGR for more info."));
                timeout = setTimeout(function () {
                    timeout = undefined;
                    console.warn("[".concat(accessoryName, "] The image snapshot handler for the given accessory didn't respond at all! See https://homebridge.io/w/JtMGR for more info."));
                    reject(-70408 /* OPERATION_TIMED_OUT */);
                }, 17000);
                timeout.unref();
            }, 5000);
            timeout.unref();
            try {
                _this.delegate.handleSnapshotRequest({
                    height: height,
                    width: width,
                    reason: reason,
                }, function (error, buffer) {
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
                            reject(-70402 /* SERVICE_COMMUNICATION_FAILURE */);
                        }
                        return;
                    }
                    if (!buffer || buffer.length === 0) {
                        console.warn("[".concat(accessoryName, "] Snapshot request handler provided empty image buffer!"));
                        reject(-70402 /* SERVICE_COMMUNICATION_FAILURE */);
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
                console.warn("[".concat(accessoryName, "] Unhandled error thrown inside snapshot request handler: ").concat(error.stack));
                reject(error instanceof hapStatusError_1.HapStatusError ? error.hapStatus : -70402 /* SERVICE_COMMUNICATION_FAILURE */);
            }
        });
    };
    /**
     * @private
     */
    CameraController.prototype.handleCloseConnection = function (sessionID) {
        if (this.delegate instanceof camera_1.LegacyCameraSourceAdapter) {
            this.delegate.forwardCloseConnection(sessionID);
        }
    };
    CameraController.STREAM_MANAGEMENT = "streamManagement"; // key to index all RTPStreamManagement services
    return CameraController;
}(events_1.EventEmitter));
exports.CameraController = CameraController;
//# sourceMappingURL=CameraController.js.map