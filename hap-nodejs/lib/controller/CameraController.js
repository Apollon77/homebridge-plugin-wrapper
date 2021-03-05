"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraController = exports.CameraControllerEvents = void 0;
var tslib_1 = require("tslib");
var crypto_1 = tslib_1.__importDefault(require("crypto"));
var debug_1 = tslib_1.__importDefault(require("debug"));
var events_1 = require("events");
var camera_1 = require("../camera");
var Characteristic_1 = require("../Characteristic");
var Service_1 = require("../Service");
var debug = debug_1.default("HAP-NodeJS:Camera:Controller");
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
    tslib_1.__extends(CameraController, _super);
    function CameraController(options, legacyMode) {
        if (legacyMode === void 0) { legacyMode = false; }
        var _this = _super.call(this) || this;
        // private readonly recordingOptions: CameraRecordingOptions, // soon
        _this.legacyMode = false;
        /**
         * @private
         */
        _this.streamManagements = [];
        _this.microphoneMuted = false;
        _this.microphoneVolume = 100;
        _this.speakerMuted = false;
        _this.speakerVolume = 100;
        _this.streamCount = Math.max(1, options.cameraStreamCount || 1);
        _this.delegate = options.delegate;
        _this.streamingOptions = options.streamingOptions;
        _this.legacyMode = legacyMode; // legacy mode will prent from Microphone and Speaker services to get created to avoid collisions
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
     * This would be adequate if the the rtp server or media encoding encountered an unexpected error.
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
        for (var i = 0; i < this.streamCount; i++) {
            this.streamManagements.push(new camera_1.RTPStreamManagement(i, this.streamingOptions, this.delegate));
        }
        if (!this.legacyMode && this.streamingOptions.audio) {
            // In theory the Microphone Service is a necessity. In practice its not. lol. So we just add it if the user wants to support audio
            this.microphoneService = new Service_1.Service.Microphone('', '');
            this.microphoneService.setCharacteristic(Characteristic_1.Characteristic.Volume, this.microphoneVolume);
            if (this.streamingOptions.audio.twoWayAudio) {
                this.speakerService = new Service_1.Service.Speaker('', '');
                this.speakerService.setCharacteristic(Characteristic_1.Characteristic.Volume, this.speakerVolume);
            }
        }
        var serviceMap = {
            microphone: this.microphoneService,
            speaker: this.speakerService,
        };
        this.streamManagements.forEach(function (management, index) { return serviceMap[CameraController.STREAM_MANAGEMENT + index] = management.getService(); });
        return serviceMap;
    };
    /**
     * @private
     */
    CameraController.prototype.initWithServices = function (serviceMap) {
        var _a;
        var modifiedServiceMap = false;
        for (var i = 0; true; i++) {
            var streamManagementService = serviceMap[CameraController.STREAM_MANAGEMENT + i];
            if (i < this.streamCount) {
                if (streamManagementService) { // normal init
                    this.streamManagements.push(new camera_1.RTPStreamManagement(i, this.streamingOptions, this.delegate, streamManagementService));
                }
                else { // stream count got bigger, we need to create a new service
                    var management = new camera_1.RTPStreamManagement(i, this.streamingOptions, this.delegate);
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
                    break; // we finished counting and we got no saved service; we are finished
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
                this.microphoneService = new Service_1.Service.Microphone('', '');
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
                this.speakerService = new Service_1.Service.Speaker('', '');
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
        if (this.migrateFromDoorbell(serviceMap)) {
            modifiedServiceMap = true;
        }
        if (modifiedServiceMap) { // serviceMap must only be returned if anything actually changed
            return serviceMap;
        }
    };
    // overwritten in DoorbellController (to avoid cyclic dependencies, i hate typescript for that)
    CameraController.prototype.migrateFromDoorbell = function (serviceMap) {
        if (serviceMap.doorbell) { // See NOTICE in DoorbellController
            delete serviceMap.doorbell;
            return true;
        }
        return false;
    };
    /**
     * @private
     */
    CameraController.prototype.configureServices = function () {
        var _this = this;
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
    };
    /**
     * @private
     */
    CameraController.prototype.handleControllerRemoved = function () {
        var e_1, _a;
        this.handleFactoryReset();
        try {
            for (var _b = tslib_1.__values(this.streamManagements), _c = _b.next(); !_c.done; _c = _b.next()) {
                var management = _c.value;
                management.destroy();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.streamManagements.splice(0, this.streamManagements.length);
        this.microphoneService = undefined;
        this.speakerService = undefined;
        this.removeAllListeners();
    };
    /**
     * @private
     */
    CameraController.prototype.handleFactoryReset = function () {
        this.streamManagements.forEach(function (management) { return management.handleFactoryReset(); });
        this.microphoneMuted = false;
        this.microphoneVolume = 100;
        this.speakerMuted = false;
        this.speakerVolume = 100;
    };
    /**
     * @private
     */
    CameraController.prototype.handleSnapshotRequest = function (height, width, accessoryName) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var timeout = setTimeout(function () {
                console.warn("[" + accessoryName + "] The image snapshot handler for the given accessory is slow to respond! See https://git.io/JtMGR for more info.");
                timeout = setTimeout(function () {
                    timeout = undefined;
                    console.warn("[" + accessoryName + "] The image snapshot handler for the given accessory didn't respond at all! See https://git.io/JtMGR for more info.");
                    reject(-70408 /* OPERATION_TIMED_OUT */);
                }, 17000);
                timeout.unref();
            }, 5000);
            timeout.unref();
            try {
                _this.delegate.handleSnapshotRequest({
                    height: height,
                    width: width,
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
                        console.warn("[" + accessoryName + "] Snapshot request handler provided empty image buffer!");
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
                console.warn("[" + accessoryName + "] Unhandled error thrown inside snapshot request handler: " + error.stack);
                reject(-70402 /* SERVICE_COMMUNICATION_FAILURE */);
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