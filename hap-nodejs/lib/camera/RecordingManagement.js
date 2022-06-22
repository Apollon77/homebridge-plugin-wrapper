"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordingManagement = exports.PacketDataType = exports.AudioRecordingSamplerate = exports.AudioRecordingCodecType = exports.MediaContainerType = exports.EventTriggerOption = void 0;
var tslib_1 = require("tslib");
var crypto_1 = (0, tslib_1.__importDefault)(require("crypto"));
var debug_1 = (0, tslib_1.__importDefault)(require("debug"));
var events_1 = require("events");
var Characteristic_1 = require("../Characteristic");
var datastream_1 = require("../datastream");
var Service_1 = require("../Service");
var hapStatusError_1 = require("../util/hapStatusError");
var tlv = (0, tslib_1.__importStar)(require("../util/tlv"));
var debug = (0, debug_1.default)("HAP-NodeJS:Camera:RecordingManagement");
/**
 * Describes the Event trigger.
 */
var EventTriggerOption;
(function (EventTriggerOption) {
    /**
     * The Motion trigger. If enabled motion should trigger the start of a recording.
     */
    EventTriggerOption[EventTriggerOption["MOTION"] = 1] = "MOTION";
    /**
     * The Doorbell trigger. If enabled a doorbell button press should trigger the start of a recording.
     */
    EventTriggerOption[EventTriggerOption["DOORBELL"] = 2] = "DOORBELL";
})(EventTriggerOption = exports.EventTriggerOption || (exports.EventTriggerOption = {}));
var MediaContainerType;
(function (MediaContainerType) {
    MediaContainerType[MediaContainerType["FRAGMENTED_MP4"] = 0] = "FRAGMENTED_MP4";
})(MediaContainerType = exports.MediaContainerType || (exports.MediaContainerType = {}));
var VideoCodecConfigurationTypes;
(function (VideoCodecConfigurationTypes) {
    VideoCodecConfigurationTypes[VideoCodecConfigurationTypes["CODEC_TYPE"] = 1] = "CODEC_TYPE";
    VideoCodecConfigurationTypes[VideoCodecConfigurationTypes["CODEC_PARAMETERS"] = 2] = "CODEC_PARAMETERS";
    VideoCodecConfigurationTypes[VideoCodecConfigurationTypes["ATTRIBUTES"] = 3] = "ATTRIBUTES";
})(VideoCodecConfigurationTypes || (VideoCodecConfigurationTypes = {}));
var VideoCodecParametersTypes;
(function (VideoCodecParametersTypes) {
    VideoCodecParametersTypes[VideoCodecParametersTypes["PROFILE_ID"] = 1] = "PROFILE_ID";
    VideoCodecParametersTypes[VideoCodecParametersTypes["LEVEL"] = 2] = "LEVEL";
    VideoCodecParametersTypes[VideoCodecParametersTypes["BITRATE"] = 3] = "BITRATE";
    VideoCodecParametersTypes[VideoCodecParametersTypes["IFRAME_INTERVAL"] = 4] = "IFRAME_INTERVAL";
})(VideoCodecParametersTypes || (VideoCodecParametersTypes = {}));
var VideoAttributesTypes;
(function (VideoAttributesTypes) {
    VideoAttributesTypes[VideoAttributesTypes["IMAGE_WIDTH"] = 1] = "IMAGE_WIDTH";
    VideoAttributesTypes[VideoAttributesTypes["IMAGE_HEIGHT"] = 2] = "IMAGE_HEIGHT";
    VideoAttributesTypes[VideoAttributesTypes["FRAME_RATE"] = 3] = "FRAME_RATE";
})(VideoAttributesTypes || (VideoAttributesTypes = {}));
var SelectedCameraRecordingConfigurationTypes;
(function (SelectedCameraRecordingConfigurationTypes) {
    SelectedCameraRecordingConfigurationTypes[SelectedCameraRecordingConfigurationTypes["SELECTED_RECORDING_CONFIGURATION"] = 1] = "SELECTED_RECORDING_CONFIGURATION";
    SelectedCameraRecordingConfigurationTypes[SelectedCameraRecordingConfigurationTypes["SELECTED_VIDEO_CONFIGURATION"] = 2] = "SELECTED_VIDEO_CONFIGURATION";
    SelectedCameraRecordingConfigurationTypes[SelectedCameraRecordingConfigurationTypes["SELECTED_AUDIO_CONFIGURATION"] = 3] = "SELECTED_AUDIO_CONFIGURATION";
})(SelectedCameraRecordingConfigurationTypes || (SelectedCameraRecordingConfigurationTypes = {}));
var AudioRecordingCodecType;
(function (AudioRecordingCodecType) {
    AudioRecordingCodecType[AudioRecordingCodecType["AAC_LC"] = 0] = "AAC_LC";
    AudioRecordingCodecType[AudioRecordingCodecType["AAC_ELD"] = 1] = "AAC_ELD";
})(AudioRecordingCodecType = exports.AudioRecordingCodecType || (exports.AudioRecordingCodecType = {}));
var AudioRecordingSamplerate;
(function (AudioRecordingSamplerate) {
    AudioRecordingSamplerate[AudioRecordingSamplerate["KHZ_8"] = 0] = "KHZ_8";
    AudioRecordingSamplerate[AudioRecordingSamplerate["KHZ_16"] = 1] = "KHZ_16";
    AudioRecordingSamplerate[AudioRecordingSamplerate["KHZ_24"] = 2] = "KHZ_24";
    AudioRecordingSamplerate[AudioRecordingSamplerate["KHZ_32"] = 3] = "KHZ_32";
    AudioRecordingSamplerate[AudioRecordingSamplerate["KHZ_44_1"] = 4] = "KHZ_44_1";
    AudioRecordingSamplerate[AudioRecordingSamplerate["KHZ_48"] = 5] = "KHZ_48";
})(AudioRecordingSamplerate = exports.AudioRecordingSamplerate || (exports.AudioRecordingSamplerate = {}));
var SupportedVideoRecordingConfigurationTypes;
(function (SupportedVideoRecordingConfigurationTypes) {
    SupportedVideoRecordingConfigurationTypes[SupportedVideoRecordingConfigurationTypes["VIDEO_CODEC_CONFIGURATION"] = 1] = "VIDEO_CODEC_CONFIGURATION";
})(SupportedVideoRecordingConfigurationTypes || (SupportedVideoRecordingConfigurationTypes = {}));
var SupportedCameraRecordingConfigurationTypes;
(function (SupportedCameraRecordingConfigurationTypes) {
    SupportedCameraRecordingConfigurationTypes[SupportedCameraRecordingConfigurationTypes["PREBUFFER_LENGTH"] = 1] = "PREBUFFER_LENGTH";
    SupportedCameraRecordingConfigurationTypes[SupportedCameraRecordingConfigurationTypes["EVENT_TRIGGER_OPTIONS"] = 2] = "EVENT_TRIGGER_OPTIONS";
    SupportedCameraRecordingConfigurationTypes[SupportedCameraRecordingConfigurationTypes["MEDIA_CONTAINER_CONFIGURATIONS"] = 3] = "MEDIA_CONTAINER_CONFIGURATIONS";
})(SupportedCameraRecordingConfigurationTypes || (SupportedCameraRecordingConfigurationTypes = {}));
var MediaContainerConfigurationTypes;
(function (MediaContainerConfigurationTypes) {
    MediaContainerConfigurationTypes[MediaContainerConfigurationTypes["MEDIA_CONTAINER_TYPE"] = 1] = "MEDIA_CONTAINER_TYPE";
    MediaContainerConfigurationTypes[MediaContainerConfigurationTypes["MEDIA_CONTAINER_PARAMETERS"] = 2] = "MEDIA_CONTAINER_PARAMETERS";
})(MediaContainerConfigurationTypes || (MediaContainerConfigurationTypes = {}));
var MediaContainerParameterTypes;
(function (MediaContainerParameterTypes) {
    MediaContainerParameterTypes[MediaContainerParameterTypes["FRAGMENT_LENGTH"] = 1] = "FRAGMENT_LENGTH";
})(MediaContainerParameterTypes || (MediaContainerParameterTypes = {}));
var AudioCodecParametersTypes;
(function (AudioCodecParametersTypes) {
    AudioCodecParametersTypes[AudioCodecParametersTypes["CHANNEL"] = 1] = "CHANNEL";
    AudioCodecParametersTypes[AudioCodecParametersTypes["BIT_RATE"] = 2] = "BIT_RATE";
    AudioCodecParametersTypes[AudioCodecParametersTypes["SAMPLE_RATE"] = 3] = "SAMPLE_RATE";
    AudioCodecParametersTypes[AudioCodecParametersTypes["MAX_AUDIO_BITRATE"] = 4] = "MAX_AUDIO_BITRATE"; // only present in selected audio codec parameters tlv
})(AudioCodecParametersTypes || (AudioCodecParametersTypes = {}));
var AudioCodecConfigurationTypes;
(function (AudioCodecConfigurationTypes) {
    AudioCodecConfigurationTypes[AudioCodecConfigurationTypes["CODEC_TYPE"] = 1] = "CODEC_TYPE";
    AudioCodecConfigurationTypes[AudioCodecConfigurationTypes["CODEC_PARAMETERS"] = 2] = "CODEC_PARAMETERS";
})(AudioCodecConfigurationTypes || (AudioCodecConfigurationTypes = {}));
var SupportedAudioRecordingConfigurationTypes;
(function (SupportedAudioRecordingConfigurationTypes) {
    SupportedAudioRecordingConfigurationTypes[SupportedAudioRecordingConfigurationTypes["AUDIO_CODEC_CONFIGURATION"] = 1] = "AUDIO_CODEC_CONFIGURATION";
})(SupportedAudioRecordingConfigurationTypes || (SupportedAudioRecordingConfigurationTypes = {}));
var PacketDataType;
(function (PacketDataType) {
    // mp4 moov box
    PacketDataType["MEDIA_INITIALIZATION"] = "mediaInitialization";
    // mp4 moof + mdat boxes
    PacketDataType["MEDIA_FRAGMENT"] = "mediaFragment";
})(PacketDataType = exports.PacketDataType || (exports.PacketDataType = {}));
var RecordingManagement = /** @class */ (function () {
    function RecordingManagement(options, delegate, eventTriggerOptions, services) {
        var e_1, _a;
        /**
         * Array of sensor services (e.g. {@link Service.MotionSensor} or {@link Service.OccupancySensor}).
         * Any service in this array owns a {@link Characteristic.StatusActive} characteristic.
         * The value of the {@link Characteristic.HomeKitCameraActive} is mirrored towards the {@link Characteristic.StatusActive} characteristic.
         * The array is initialized my the caller shortly after calling the constructor.
         */
        this.sensorServices = [];
        this.options = options;
        this.delegate = delegate;
        var recordingServices = services || this.constructService();
        this.recordingManagementService = recordingServices.recordingManagement;
        this.operatingModeService = recordingServices.operatingMode;
        this.dataStreamManagement = recordingServices.dataStreamManagement;
        this.eventTriggerOptions = 0;
        try {
            for (var eventTriggerOptions_1 = (0, tslib_1.__values)(eventTriggerOptions), eventTriggerOptions_1_1 = eventTriggerOptions_1.next(); !eventTriggerOptions_1_1.done; eventTriggerOptions_1_1 = eventTriggerOptions_1.next()) {
                var option = eventTriggerOptions_1_1.value;
                this.eventTriggerOptions |= option; // OR
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (eventTriggerOptions_1_1 && !eventTriggerOptions_1_1.done && (_a = eventTriggerOptions_1.return)) _a.call(eventTriggerOptions_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.supportedCameraRecordingConfiguration = this._supportedCameraRecordingConfiguration(options);
        this.supportedVideoRecordingConfiguration = this._supportedVideoRecordingConfiguration(options.video);
        this.supportedAudioRecordingConfiguration = this._supportedAudioStreamConfiguration(options.audio);
        this.setupServiceHandlers();
    }
    RecordingManagement.prototype.constructService = function () {
        var recordingManagement = new Service_1.Service.CameraRecordingManagement("", "");
        recordingManagement.setCharacteristic(Characteristic_1.Characteristic.Active, false);
        recordingManagement.setCharacteristic(Characteristic_1.Characteristic.RecordingAudioActive, false);
        var operatingMode = new Service_1.Service.CameraOperatingMode("", "");
        operatingMode.setCharacteristic(Characteristic_1.Characteristic.EventSnapshotsActive, true);
        operatingMode.setCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive, true);
        operatingMode.setCharacteristic(Characteristic_1.Characteristic.PeriodicSnapshotsActive, true);
        var dataStreamManagement = new datastream_1.DataStreamManagement();
        recordingManagement.addLinkedService(dataStreamManagement.getService());
        return {
            recordingManagement: recordingManagement,
            operatingMode: operatingMode,
            dataStreamManagement: dataStreamManagement,
        };
    };
    RecordingManagement.prototype.setupServiceHandlers = function () {
        var _this = this;
        // update the current configuration values to the current state.
        this.recordingManagementService.setCharacteristic(Characteristic_1.Characteristic.SupportedCameraRecordingConfiguration, this.supportedCameraRecordingConfiguration);
        this.recordingManagementService.setCharacteristic(Characteristic_1.Characteristic.SupportedVideoRecordingConfiguration, this.supportedVideoRecordingConfiguration);
        this.recordingManagementService.setCharacteristic(Characteristic_1.Characteristic.SupportedAudioRecordingConfiguration, this.supportedAudioRecordingConfiguration);
        this.recordingManagementService.getCharacteristic(Characteristic_1.Characteristic.SelectedCameraRecordingConfiguration)
            .onGet(this.handleSelectedCameraRecordingConfigurationRead.bind(this))
            .onSet(this.handleSelectedCameraRecordingConfigurationWrite.bind(this))
            .setProps({ adminOnlyAccess: [1 /* WRITE */] });
        this.recordingManagementService.getCharacteristic(Characteristic_1.Characteristic.Active)
            .onSet(function (value) { return _this.delegate.updateRecordingActive(!!value); })
            .on("change" /* CHANGE */, function () { var _a; return (_a = _this.stateChangeDelegate) === null || _a === void 0 ? void 0 : _a.call(_this); })
            .setProps({ adminOnlyAccess: [1 /* WRITE */] });
        this.recordingManagementService.getCharacteristic(Characteristic_1.Characteristic.RecordingAudioActive)
            .on("change" /* CHANGE */, function () { var _a; return (_a = _this.stateChangeDelegate) === null || _a === void 0 ? void 0 : _a.call(_this); });
        this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive)
            .on("change" /* CHANGE */, function (change) {
            var e_2, _a;
            var _b;
            try {
                for (var _c = (0, tslib_1.__values)(_this.sensorServices), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var service = _d.value;
                    service.setCharacteristic(Characteristic_1.Characteristic.StatusActive, !!change.newValue);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
            }
            if (!change.newValue && _this.recordingStream) {
                _this.recordingStream.close(1 /* NOT_ALLOWED */);
            }
            (_b = _this.stateChangeDelegate) === null || _b === void 0 ? void 0 : _b.call(_this);
        })
            .setProps({ adminOnlyAccess: [1 /* WRITE */] });
        this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.EventSnapshotsActive)
            .on("change" /* CHANGE */, function () { var _a; return (_a = _this.stateChangeDelegate) === null || _a === void 0 ? void 0 : _a.call(_this); })
            .setProps({ adminOnlyAccess: [1 /* WRITE */] });
        this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.PeriodicSnapshotsActive)
            .on("change" /* CHANGE */, function () { var _a; return (_a = _this.stateChangeDelegate) === null || _a === void 0 ? void 0 : _a.call(_this); })
            .setProps({ adminOnlyAccess: [1 /* WRITE */] });
        this.dataStreamManagement
            .onRequestMessage("dataSend" /* DATA_SEND */, "open" /* OPEN */, this.handleDataSendOpen.bind(this));
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RecordingManagement.prototype.handleDataSendOpen = function (connection, id, message) {
        var _this = this;
        // for message fields see https://github.com/Supereg/secure-video-specification#41-start
        var streamId = message.streamId;
        var type = message.type;
        var target = message.target;
        var reason = message.reason;
        if (target !== "controller" || type !== "ipcamera.recording") {
            debug("[HDS %s] Received data send with unexpected target: %s or type: %d. Rejecting...", connection.remoteAddress, target, type);
            connection.sendResponse("dataSend" /* DATA_SEND */, "open" /* OPEN */, id, datastream_1.HDSStatus.PROTOCOL_SPECIFIC_ERROR, {
                status: 5 /* UNEXPECTED_FAILURE */,
            });
            return;
        }
        if (!this.recordingManagementService.getCharacteristic(Characteristic_1.Characteristic.Active).value) {
            connection.sendResponse("dataSend" /* DATA_SEND */, "open" /* OPEN */, id, datastream_1.HDSStatus.PROTOCOL_SPECIFIC_ERROR, {
                status: 1 /* NOT_ALLOWED */,
            });
            return;
        }
        if (!this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive).value) {
            connection.sendResponse("dataSend" /* DATA_SEND */, "open" /* OPEN */, id, datastream_1.HDSStatus.PROTOCOL_SPECIFIC_ERROR, {
                status: 1 /* NOT_ALLOWED */,
            });
            return;
        }
        if (this.recordingStream) {
            debug("[HDS %s] Rejecting DATA_SEND OPEN as another stream (%s) is already recording with streamId %d!", connection.remoteAddress, this.recordingStream.connection.remoteAddress, this.recordingStream.streamId);
            // there is already a recording stream running.
            connection.sendResponse("dataSend" /* DATA_SEND */, "open" /* OPEN */, id, datastream_1.HDSStatus.PROTOCOL_SPECIFIC_ERROR, {
                status: 2 /* BUSY */,
            });
            return;
        }
        if (!this.selectedConfiguration) {
            connection.sendResponse("dataSend" /* DATA_SEND */, "open" /* OPEN */, id, datastream_1.HDSStatus.PROTOCOL_SPECIFIC_ERROR, {
                status: 9 /* INVALID_CONFIGURATION */,
            });
            return;
        }
        debug("[HDS %s] HDS DATA_SEND Open with reason '%s'.", connection.remoteAddress, reason);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        this.recordingStream = new CameraRecordingStream(connection, this.delegate, id, streamId);
        this.recordingStream.on("closed" /* CLOSED */, function () {
            debug("[HDS %s] Removing active recoding session from recording management!");
            _this.recordingStream = undefined;
        });
        this.recordingStream.startStreaming();
    };
    RecordingManagement.prototype.handleSelectedCameraRecordingConfigurationRead = function () {
        if (!this.selectedConfiguration) {
            throw new hapStatusError_1.HapStatusError(-70402 /* SERVICE_COMMUNICATION_FAILURE */);
        }
        return this.selectedConfiguration.base64;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RecordingManagement.prototype.handleSelectedCameraRecordingConfigurationWrite = function (value) {
        var _a;
        var configuration = this.parseSelectedConfiguration(value);
        this.selectedConfiguration = {
            parsed: configuration,
            base64: value,
        };
        this.delegate.updateRecordingConfiguration(this.selectedConfiguration.parsed);
        // notify controller storage about updated values!
        (_a = this.stateChangeDelegate) === null || _a === void 0 ? void 0 : _a.call(this);
    };
    RecordingManagement.prototype.parseSelectedConfiguration = function (value) {
        var decoded = tlv.decode(Buffer.from(value, "base64"));
        var recording = tlv.decode(decoded[1 /* SELECTED_RECORDING_CONFIGURATION */]);
        var video = tlv.decode(decoded[2 /* SELECTED_VIDEO_CONFIGURATION */]);
        var audio = tlv.decode(decoded[3 /* SELECTED_AUDIO_CONFIGURATION */]);
        var prebufferLength = recording[1 /* PREBUFFER_LENGTH */].readInt32LE(0);
        var eventTriggerOptions = recording[2 /* EVENT_TRIGGER_OPTIONS */].readInt32LE(0);
        var mediaContainerConfiguration = tlv.decode(recording[3 /* MEDIA_CONTAINER_CONFIGURATIONS */]);
        var containerType = mediaContainerConfiguration[1 /* MEDIA_CONTAINER_TYPE */][0];
        var mediaContainerParameters = tlv.decode(mediaContainerConfiguration[2 /* MEDIA_CONTAINER_PARAMETERS */]);
        var fragmentLength = mediaContainerParameters[1 /* FRAGMENT_LENGTH */].readInt32LE(0);
        var videoCodec = video[1 /* CODEC_TYPE */][0];
        var videoParameters = tlv.decode(video[2 /* CODEC_PARAMETERS */]);
        var videoAttributes = tlv.decode(video[3 /* ATTRIBUTES */]);
        var profile = videoParameters[1 /* PROFILE_ID */][0];
        var level = videoParameters[2 /* LEVEL */][0];
        var videoBitrate = videoParameters[3 /* BITRATE */].readInt32LE(0);
        var iFrameInterval = videoParameters[4 /* IFRAME_INTERVAL */].readInt32LE(0);
        var width = videoAttributes[1 /* IMAGE_WIDTH */].readInt16LE(0);
        var height = videoAttributes[2 /* IMAGE_HEIGHT */].readInt16LE(0);
        var framerate = videoAttributes[3 /* FRAME_RATE */][0];
        var audioCodec = audio[1 /* CODEC_TYPE */][0];
        var audioParameters = tlv.decode(audio[2 /* CODEC_PARAMETERS */]);
        var audioChannels = audioParameters[1 /* CHANNEL */][0];
        var samplerate = audioParameters[3 /* SAMPLE_RATE */][0];
        var audioBitrateMode = audioParameters[2 /* BIT_RATE */][0];
        var audioBitrate = audioParameters[4 /* MAX_AUDIO_BITRATE */].readUInt32LE(0);
        var typedEventTriggers = [];
        var bit_index = 0;
        while (eventTriggerOptions > 0) {
            if (eventTriggerOptions & 0x01) { // of the lowest bit is set add the next event trigger option
                typedEventTriggers.push(1 << bit_index);
            }
            eventTriggerOptions = eventTriggerOptions >> 1; // shift to right till we reach zero.
            bit_index += 1; // count our current bit index
        }
        return {
            prebufferLength: prebufferLength,
            eventTriggerTypes: typedEventTriggers,
            mediaContainerConfiguration: {
                type: containerType,
                fragmentLength: fragmentLength,
            },
            videoCodec: {
                type: videoCodec,
                parameters: {
                    profile: profile,
                    level: level,
                    bitRate: videoBitrate,
                    iFrameInterval: iFrameInterval,
                },
                resolution: [width, height, framerate],
            },
            audioCodec: {
                audioChannels: audioChannels,
                type: audioCodec,
                samplerate: samplerate,
                bitrateMode: audioBitrateMode,
                bitrate: audioBitrate,
            },
        };
    };
    RecordingManagement.prototype._supportedCameraRecordingConfiguration = function (options) {
        var mediaContainers = Array.isArray(options.mediaContainerConfiguration)
            ? options.mediaContainerConfiguration
            : [options.mediaContainerConfiguration];
        var prebufferLength = Buffer.alloc(4);
        var eventTriggerOptions = Buffer.alloc(8);
        prebufferLength.writeInt32LE(options.prebufferLength, 0);
        eventTriggerOptions.writeInt32LE(this.eventTriggerOptions, 0);
        return tlv.encode(1 /* PREBUFFER_LENGTH */, prebufferLength, 2 /* EVENT_TRIGGER_OPTIONS */, eventTriggerOptions, 3 /* MEDIA_CONTAINER_CONFIGURATIONS */, mediaContainers.map(function (config) {
            var fragmentLength = Buffer.alloc(4);
            fragmentLength.writeInt32LE(config.fragmentLength, 0);
            return tlv.encode(1 /* MEDIA_CONTAINER_TYPE */, config.type, 2 /* MEDIA_CONTAINER_PARAMETERS */, tlv.encode(1 /* FRAGMENT_LENGTH */, fragmentLength));
        })).toString("base64");
    };
    RecordingManagement.prototype._supportedVideoRecordingConfiguration = function (videoOptions) {
        if (!videoOptions.parameters) {
            throw new Error("Video parameters cannot be undefined");
        }
        if (!videoOptions.resolutions) {
            throw new Error("Video resolutions cannot be undefined");
        }
        var codecParameters = tlv.encode(1 /* PROFILE_ID */, videoOptions.parameters.profiles, 2 /* LEVEL */, videoOptions.parameters.levels);
        var videoStreamConfiguration = tlv.encode(1 /* CODEC_TYPE */, videoOptions.type, 2 /* CODEC_PARAMETERS */, codecParameters, 3 /* ATTRIBUTES */, videoOptions.resolutions.map(function (resolution) {
            if (resolution.length !== 3) {
                throw new Error("Unexpected video resolution");
            }
            var width = Buffer.alloc(2);
            var height = Buffer.alloc(2);
            var frameRate = Buffer.alloc(1);
            width.writeUInt16LE(resolution[0], 0);
            height.writeUInt16LE(resolution[1], 0);
            frameRate.writeUInt8(resolution[2], 0);
            return tlv.encode(1 /* IMAGE_WIDTH */, width, 2 /* IMAGE_HEIGHT */, height, 3 /* FRAME_RATE */, frameRate);
        }));
        return tlv.encode(1 /* VIDEO_CODEC_CONFIGURATION */, videoStreamConfiguration).toString("base64");
    };
    RecordingManagement.prototype._supportedAudioStreamConfiguration = function (audioOptions) {
        var audioCodecs = Array.isArray(audioOptions.codecs)
            ? audioOptions.codecs
            : [audioOptions.codecs];
        if (audioCodecs.length === 0) {
            throw Error("CameraRecordingOptions.audio: At least one audio codec configuration must be specified!");
        }
        var codecConfigurations = audioCodecs.map(function (codec) {
            var providedSamplerates = Array.isArray(codec.samplerate)
                ? codec.samplerate
                : [codec.samplerate];
            if (providedSamplerates.length === 0) {
                throw new Error("CameraRecordingOptions.audio.codecs: Audio samplerate cannot be empty!");
            }
            var audioParameters = tlv.encode(1 /* CHANNEL */, Math.max(1, codec.audioChannels || 1), 2 /* BIT_RATE */, codec.bitrateMode || 0 /* VARIABLE */, 3 /* SAMPLE_RATE */, providedSamplerates);
            return tlv.encode(1 /* CODEC_TYPE */, codec.type, 2 /* CODEC_PARAMETERS */, audioParameters);
        });
        return tlv.encode(1 /* AUDIO_CODEC_CONFIGURATION */, codecConfigurations).toString("base64");
    };
    RecordingManagement.prototype.computeConfigurationHash = function (algorithm) {
        if (algorithm === void 0) { algorithm = "sha256"; }
        var configurationHash = crypto_1.default.createHash(algorithm);
        configurationHash.update(this.supportedCameraRecordingConfiguration);
        configurationHash.update(this.supportedVideoRecordingConfiguration);
        configurationHash.update(this.supportedAudioRecordingConfiguration);
        return configurationHash.digest().toString("hex");
    };
    /**
     * @private
     */
    RecordingManagement.prototype.serialize = function () {
        var _a;
        return {
            configurationHash: {
                algorithm: "sha256",
                hash: this.computeConfigurationHash("sha256"),
            },
            selectedConfiguration: (_a = this.selectedConfiguration) === null || _a === void 0 ? void 0 : _a.base64,
            recordingActive: !!this.recordingManagementService.getCharacteristic(Characteristic_1.Characteristic.Active).value,
            recordingAudioActive: !!this.recordingManagementService.getCharacteristic(Characteristic_1.Characteristic.RecordingAudioActive).value,
            eventSnapshotsActive: !!this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.EventSnapshotsActive).value,
            homeKitCameraActive: !!this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive).value,
            periodicSnapshotsActive: !!this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.PeriodicSnapshotsActive).value,
        };
    };
    /**
     * @private
     */
    RecordingManagement.prototype.deserialize = function (serialized) {
        var e_3, _a;
        var _b;
        var changedState = false;
        // we only restore the `selectedConfiguration` if our supported configuration hasn't changed.
        var currentConfigurationHash = this.computeConfigurationHash(serialized.configurationHash.algorithm);
        if (serialized.selectedConfiguration) {
            if (currentConfigurationHash === serialized.configurationHash.hash) {
                this.selectedConfiguration = {
                    base64: serialized.selectedConfiguration,
                    parsed: this.parseSelectedConfiguration(serialized.selectedConfiguration),
                };
            }
            else {
                changedState = true;
            }
        }
        this.recordingManagementService.updateCharacteristic(Characteristic_1.Characteristic.Active, serialized.recordingActive);
        this.recordingManagementService.updateCharacteristic(Characteristic_1.Characteristic.RecordingAudioActive, serialized.recordingAudioActive);
        this.operatingModeService.updateCharacteristic(Characteristic_1.Characteristic.EventSnapshotsActive, serialized.eventSnapshotsActive);
        this.operatingModeService.updateCharacteristic(Characteristic_1.Characteristic.PeriodicSnapshotsActive, serialized.periodicSnapshotsActive);
        this.operatingModeService.updateCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive, serialized.homeKitCameraActive);
        try {
            for (var _c = (0, tslib_1.__values)(this.sensorServices), _d = _c.next(); !_d.done; _d = _c.next()) {
                var service = _d.value;
                service.setCharacteristic(Characteristic_1.Characteristic.StatusActive, serialized.homeKitCameraActive);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        try {
            if (this.selectedConfiguration) {
                this.delegate.updateRecordingConfiguration(this.selectedConfiguration.parsed);
            }
            if (serialized.recordingActive) {
                this.delegate.updateRecordingActive(serialized.recordingActive);
            }
        }
        catch (error) {
            console.error("Failed to properly initialize CameraRecordingDelegate from persistent storage: " + error.stack);
        }
        if (changedState) {
            (_b = this.stateChangeDelegate) === null || _b === void 0 ? void 0 : _b.call(this);
        }
    };
    /**
     * @private
     */
    RecordingManagement.prototype.setupStateChangeDelegate = function (delegate) {
        this.stateChangeDelegate = delegate;
    };
    RecordingManagement.prototype.destroy = function () {
        this.dataStreamManagement.destroy();
    };
    RecordingManagement.prototype.handleFactoryReset = function () {
        var e_4, _a;
        this.selectedConfiguration = undefined;
        this.recordingManagementService.updateCharacteristic(Characteristic_1.Characteristic.Active, false);
        this.recordingManagementService.updateCharacteristic(Characteristic_1.Characteristic.RecordingAudioActive, false);
        this.operatingModeService.updateCharacteristic(Characteristic_1.Characteristic.EventSnapshotsActive, true);
        this.operatingModeService.updateCharacteristic(Characteristic_1.Characteristic.PeriodicSnapshotsActive, true);
        this.operatingModeService.updateCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive, true);
        try {
            for (var _b = (0, tslib_1.__values)(this.sensorServices), _c = _b.next(); !_c.done; _c = _b.next()) {
                var service = _c.value;
                service.setCharacteristic(Characteristic_1.Characteristic.StatusActive, true);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        try {
            // notifying the delegate about the updated state
            this.delegate.updateRecordingActive(false);
            this.delegate.updateRecordingConfiguration(undefined);
        }
        catch (error) {
            console.error("CameraRecordingDelegate failed to update state after handleFactoryReset: " + error.stack);
        }
    };
    return RecordingManagement;
}());
exports.RecordingManagement = RecordingManagement;
var CameraRecordingStreamEvents;
(function (CameraRecordingStreamEvents) {
    /**
     * This event is fired when the recording stream is closed.
     * Either due to a normal exit (e.g. the HomeKit Controller acknowledging the stream)
     * or due to an erroneous exit (e.g. HDS connection getting closed).
     */
    CameraRecordingStreamEvents["CLOSED"] = "closed";
})(CameraRecordingStreamEvents || (CameraRecordingStreamEvents = {}));
/**
 * A `CameraRecordingStream` represents an ongoing stream request for a HomeKit Secure Video recording.
 * A single camera can only support one ongoing recording at a time.
 */
var CameraRecordingStream = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(CameraRecordingStream, _super);
    function CameraRecordingStream(connection, delegate, requestId, streamId) {
        var _a;
        var _this = _super.call(this) || this;
        _this.closed = false;
        _this.eventHandler = (_a = {},
            _a["close" /* CLOSE */] = _this.handleDataSendClose.bind(_this),
            _a["ack" /* ACK */] = _this.handleDataSendAck.bind(_this),
            _a);
        _this.requestHandler = undefined;
        _this.connection = connection;
        _this.delegate = delegate;
        _this.hdsRequestId = requestId;
        _this.streamId = streamId;
        _this.connection.on("closed" /* CLOSED */, _this.closeListener = _this.handleDataStreamConnectionClosed.bind(_this));
        _this.connection.addProtocolHandler("dataSend" /* DATA_SEND */, _this);
        return _this;
    }
    CameraRecordingStream.prototype.startStreaming = function () {
        // noinspection JSIgnoredPromiseFromCall
        this._startStreaming();
    };
    CameraRecordingStream.prototype._startStreaming = function () {
        var e_5, _a;
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var maxChunk, initialization, dataSequenceNumber, lastFragmentWasMarkedLast, _b, _c, packet, fragment, offset, dataChunkSequenceNumber, data, event, e_5_1, error_1, closeReason;
            return (0, tslib_1.__generator)(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        debug("[HDS %s] Sending DATA_SEND OPEN response for streamId %d", this.connection.remoteAddress, this.streamId);
                        this.connection.sendResponse("dataSend" /* DATA_SEND */, "open" /* OPEN */, this.hdsRequestId, datastream_1.HDSStatus.SUCCESS, {
                            status: datastream_1.HDSStatus.SUCCESS,
                        });
                        maxChunk = 0x40000;
                        initialization = true;
                        dataSequenceNumber = 1;
                        lastFragmentWasMarkedLast = false;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 14, 15, 16]);
                        this.generator = this.delegate.handleRecordingStreamRequest(this.streamId);
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 7, 8, 13]);
                        _b = (0, tslib_1.__asyncValues)(this.generator);
                        _d.label = 3;
                    case 3: return [4 /*yield*/, _b.next()];
                    case 4:
                        if (!(_c = _d.sent(), !_c.done)) return [3 /*break*/, 6];
                        packet = _c.value;
                        if (this.closed) {
                            console.error("[HDS ".concat(this.connection.remoteAddress, "] Delegate yielded fragment after stream ").concat(this.streamId, " was already closed!"));
                            return [3 /*break*/, 6];
                        }
                        if (lastFragmentWasMarkedLast) {
                            console.error("[HDS ".concat(this.connection.remoteAddress, "] Delegate yielded fragment for stream ").concat(this.streamId, " after already signaling end of stream!"));
                            return [3 /*break*/, 6];
                        }
                        fragment = packet.data;
                        offset = 0;
                        dataChunkSequenceNumber = 1;
                        while (offset < fragment.length) {
                            data = fragment.slice(offset, offset + maxChunk);
                            offset += data.length;
                            event = {
                                streamId: this.streamId,
                                packets: [{
                                        data: data,
                                        metadata: {
                                            dataType: initialization ? "mediaInitialization" /* MEDIA_INITIALIZATION */ : "mediaFragment" /* MEDIA_FRAGMENT */,
                                            dataSequenceNumber: dataSequenceNumber,
                                            dataChunkSequenceNumber: dataChunkSequenceNumber,
                                            isLastDataChunk: offset >= fragment.length,
                                            dataTotalSize: dataChunkSequenceNumber === 1 ? fragment.length : undefined,
                                        },
                                    }],
                                endOfStream: offset >= fragment.length ? Boolean(packet.isLast).valueOf() : undefined,
                            };
                            debug("[HDS %s] Sending DATA_SEND DATA for stream %d with metadata: %o and length %d; EoS: %s", this.connection.remoteAddress, this.streamId, event.packets[0].metadata, data.length, event.endOfStream);
                            this.connection.sendEvent("dataSend" /* DATA_SEND */, "data" /* DATA */, event);
                            dataChunkSequenceNumber++;
                            initialization = false;
                        }
                        lastFragmentWasMarkedLast = packet.isLast;
                        if (packet.isLast) {
                            return [3 /*break*/, 6];
                        }
                        dataSequenceNumber++;
                        _d.label = 5;
                    case 5: return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_5_1 = _d.sent();
                        e_5 = { error: e_5_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _d.trys.push([8, , 11, 12]);
                        if (!(_c && !_c.done && (_a = _b.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _a.call(_b)];
                    case 9:
                        _d.sent();
                        _d.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_5) throw e_5.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13:
                        if (!lastFragmentWasMarkedLast && !this.closed) {
                            // Delegate violates the contract. Exited normally on a non-closed stream without properly setting `isLast`.
                            console.warn("[HDS ".concat(this.connection.remoteAddress, "] Delegate finished streaming for ").concat(this.streamId, " without setting RecordingPacket.isLast.         Can't notify Controller about endOfStream!"));
                        }
                        return [3 /*break*/, 16];
                    case 14:
                        error_1 = _d.sent();
                        if (this.closed) {
                            console.warn("[HDS ".concat(this.connection.remoteAddress, "] Encountered unexpected error on already closed recording stream ").concat(this.streamId, ": ").concat(error_1.stack));
                        }
                        else {
                            closeReason = 5 /* UNEXPECTED_FAILURE */;
                            if (error_1 instanceof datastream_1.HDSProtocolError) {
                                closeReason = error_1.reason;
                                debug("[HDS %s] Delegate signaled to close the recording stream %d.", this.connection.remoteAddress, this.streamId);
                            }
                            else if (error_1 instanceof datastream_1.HDSConnectionError && error_1.type === 2 /* CLOSED_SOCKET */) {
                                // we are probably on a shutdown or just late. Connection is dead. End the stream!
                                debug("[HDS %s] Exited recording stream due to closed HDS socket: stream id %d.", this.connection.remoteAddress, this.streamId);
                                return [2 /*return*/]; // execute finally and then exit (we want to skip the `sendEvent` below)
                            }
                            else {
                                console.error("[HDS ".concat(this.connection.remoteAddress, "] Encountered unexpected error for recording stream ").concat(this.streamId, ": ").concat(error_1.stack));
                            }
                            // call close to go through standard close routine!
                            this.close(closeReason);
                        }
                        return [2 /*return*/];
                    case 15:
                        this.generator = undefined;
                        if (this.generatorTimeout) {
                            clearTimeout(this.generatorTimeout);
                        }
                        if (!this.closed) {
                            // e.g. when returning with `endOfStream` we rely on the HomeHub to send an ACK event to close the recording.
                            // With this timer we ensure that the HomeHub has the chance to close the stream gracefully but at the same time
                            // ensure that if something fails the recording stream is freed nonetheless.
                            this.kickOffCloseTimeout();
                        }
                        return [7 /*endfinally*/];
                    case 16:
                        if (initialization) { // we never actually sent anything out there!
                            console.warn("[HDS ".concat(this.connection.remoteAddress, "] Delegate finished recording stream ").concat(this.streamId, " without sending anything out.       Controller will CANCEL."));
                        }
                        debug("[HDS %s] Finished DATA_SEND transmission for stream %d!", this.connection.remoteAddress, this.streamId);
                        return [2 /*return*/];
                }
            });
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CameraRecordingStream.prototype.handleDataSendAck = function (message) {
        var _this = this;
        var streamId = message.streamId;
        var endOfStream = message.endOfStream;
        // The HomeKit Controller will send a DATA_SEND ACK if we set the `endOfStream` flag in the last packet
        // of our DATA_SEND DATA packet.
        // To my testing the session is then considered complete and the HomeKit controller will close the HDS Connection after 5 seconds.
        debug("[HDS %s] Received DATA_SEND ACK packet for streamId %s. Acknowledged %s.", this.connection.remoteAddress, streamId, endOfStream);
        this.handleClosed(function () { var _a, _b; return (_b = (_a = _this.delegate).acknowledgeStream) === null || _b === void 0 ? void 0 : _b.call(_a, _this.streamId); });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CameraRecordingStream.prototype.handleDataSendClose = function (message) {
        var _this = this;
        // see https://github.com/Supereg/secure-video-specification#43-close
        var streamId = message.streamId;
        var reason = message.reason;
        if (streamId !== this.streamId) {
            return;
        }
        debug("[HDS %s] Received DATA_SEND CLOSE for streamId %d with reason %s", 
        // @ts-expect-error: forceConsistentCasingInFileNames compiler option
        this.connection.remoteAddress, streamId, datastream_1.HDSProtocolSpecificErrorReason[reason]);
        this.handleClosed(function () { return _this.delegate.closeRecordingStream(streamId, reason); });
    };
    CameraRecordingStream.prototype.handleDataStreamConnectionClosed = function () {
        var _this = this;
        debug("[HDS %s] The HDS connection of the stream %d closed.", this.connection.remoteAddress, this.streamId);
        this.handleClosed(function () { return _this.delegate.closeRecordingStream(_this.streamId, undefined); });
    };
    CameraRecordingStream.prototype.handleClosed = function (closure) {
        var _this = this;
        this.closed = true;
        if (this.closingTimeout) {
            clearTimeout(this.closingTimeout);
            this.closingTimeout = undefined;
        }
        this.connection.removeProtocolHandler("dataSend" /* DATA_SEND */, this);
        this.connection.removeListener("closed" /* CLOSED */, this.closeListener);
        if (this.generator) {
            // when this variable is defined, the generator hasn't returned yet.
            // we start a timeout to uncover potential programming mistakes where we await forever and can't free resources.
            this.generatorTimeout = setTimeout(function () {
                console.error("[HDS %s] Recording download stream %d is still awaiting generator although stream was closed 10s ago! " +
                    "This is a programming mistake by the camera implementation which prevents freeing up resources.", _this.connection.remoteAddress, _this.streamId);
            }, 10000);
        }
        try {
            closure();
        }
        catch (error) {
            console.error("[HDS ".concat(this.connection.remoteAddress, "] CameraRecordingDelegated failed to handle closing the stream ").concat(this.streamId, ": ").concat(error.stack));
        }
        this.emit("closed" /* CLOSED */);
    };
    /**
     * This method can be used to close a recording session from the outside.
     * @param reason - The reason to close the stream with.
     */
    CameraRecordingStream.prototype.close = function (reason) {
        var _this = this;
        if (this.closed) {
            return;
        }
        debug("[HDS %s] Recording stream %d was closed manually with reason %s.", 
        // @ts-expect-error: forceConsistentCasingInFileNames compiler option
        this.connection.remoteAddress, this.streamId, reason ? datastream_1.HDSProtocolSpecificErrorReason[reason] : "CLOSED");
        // the `isConsideredClosed` check just ensures that the won't ever throw here and that `handledClosed` is always executed.
        if (!this.connection.isConsideredClosed()) {
            this.connection.sendEvent("dataSend" /* DATA_SEND */, "close" /* CLOSE */, {
                streamId: this.streamId,
                reason: reason,
            });
        }
        this.handleClosed(function () { return _this.delegate.closeRecordingStream(_this.streamId, reason); });
    };
    CameraRecordingStream.prototype.kickOffCloseTimeout = function () {
        var _this = this;
        if (this.closingTimeout) {
            clearTimeout(this.closingTimeout);
        }
        this.closingTimeout = setTimeout(function () {
            if (_this.closed) {
                return;
            }
            debug("[HDS %s] Recording stream %d took longer than expected to fully close. Force closing now!", _this.connection.remoteAddress, _this.streamId);
            _this.close(3 /* CANCELLED */);
        }, 12000);
    };
    return CameraRecordingStream;
}(events_1.EventEmitter));
//# sourceMappingURL=RecordingManagement.js.map