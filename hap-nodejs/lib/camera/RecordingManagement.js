"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordingManagement = exports.PacketDataType = exports.AudioRecordingSamplerate = exports.AudioRecordingCodecType = exports.MediaContainerType = exports.EventTriggerOption = void 0;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const events_1 = require("events");
const Characteristic_1 = require("../Characteristic");
const datastream_1 = require("../datastream");
const Service_1 = require("../Service");
const hapStatusError_1 = require("../util/hapStatusError");
const tlv = tslib_1.__importStar(require("../util/tlv"));
const debug = (0, debug_1.default)("HAP-NodeJS:Camera:RecordingManagement");
const hksvDebug = (0, debug_1.default)("HAP-NodeJS:HKSV");
/**
 * Describes the Event trigger.
 *
 * @group Camera
 */
var EventTriggerOption;
(function (EventTriggerOption) {
    /**
     * The Motion trigger. If enabled motion should trigger the start of a recording.
     */
    EventTriggerOption[EventTriggerOption["MOTION"] = 1] = "MOTION";
    /**
     * The Doorbell trigger. If enabled a doorbell button press should trigger the start of a recording.
     *
     * Note: While the doorbell is defined by the HomeKit specification and HAP-NodeJS supports (and the
     * {@link RecordingManagement} advertises support for it), HomeKit HomeHubs will (as of now, iOS 15-16)
     * never enable Doorbell triggers. Seemingly this is currently unsupported by Apple.
     * See https://github.com/homebridge/HAP-NodeJS/issues/976#issuecomment-1280301989.
     */
    EventTriggerOption[EventTriggerOption["DOORBELL"] = 2] = "DOORBELL";
})(EventTriggerOption || (exports.EventTriggerOption = EventTriggerOption = {}));
/**
 * @group Camera
 */
var MediaContainerType;
(function (MediaContainerType) {
    MediaContainerType[MediaContainerType["FRAGMENTED_MP4"] = 0] = "FRAGMENTED_MP4";
})(MediaContainerType || (exports.MediaContainerType = MediaContainerType = {}));
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
/**
 * @group Camera
 */
var AudioRecordingCodecType;
(function (AudioRecordingCodecType) {
    AudioRecordingCodecType[AudioRecordingCodecType["AAC_LC"] = 0] = "AAC_LC";
    AudioRecordingCodecType[AudioRecordingCodecType["AAC_ELD"] = 1] = "AAC_ELD";
})(AudioRecordingCodecType || (exports.AudioRecordingCodecType = AudioRecordingCodecType = {}));
/**
 * @group Camera
 */
var AudioRecordingSamplerate;
(function (AudioRecordingSamplerate) {
    AudioRecordingSamplerate[AudioRecordingSamplerate["KHZ_8"] = 0] = "KHZ_8";
    AudioRecordingSamplerate[AudioRecordingSamplerate["KHZ_16"] = 1] = "KHZ_16";
    AudioRecordingSamplerate[AudioRecordingSamplerate["KHZ_24"] = 2] = "KHZ_24";
    AudioRecordingSamplerate[AudioRecordingSamplerate["KHZ_32"] = 3] = "KHZ_32";
    AudioRecordingSamplerate[AudioRecordingSamplerate["KHZ_44_1"] = 4] = "KHZ_44_1";
    AudioRecordingSamplerate[AudioRecordingSamplerate["KHZ_48"] = 5] = "KHZ_48";
})(AudioRecordingSamplerate || (exports.AudioRecordingSamplerate = AudioRecordingSamplerate = {}));
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
/**
 * @group Camera
 */
var PacketDataType;
(function (PacketDataType) {
    /**
     * mp4 moov box
     */
    PacketDataType["MEDIA_INITIALIZATION"] = "mediaInitialization";
    /**
     * mp4 moof + mdat boxes
     */
    PacketDataType["MEDIA_FRAGMENT"] = "mediaFragment";
})(PacketDataType || (exports.PacketDataType = PacketDataType = {}));
/**
 * @group Camera
 */
class RecordingManagement {
    options;
    delegate;
    stateChangeDelegate;
    supportedCameraRecordingConfiguration;
    supportedVideoRecordingConfiguration;
    supportedAudioRecordingConfiguration;
    /**
     * 32 bit mask of enabled {@link EventTriggerOption}s.
     */
    eventTriggerOptions;
    recordingManagementService;
    operatingModeService;
    dataStreamManagement;
    /**
     * The currently active recording stream.
     * Any camera only supports one stream at a time.
     */
    recordingStream;
    selectedConfiguration;
    /**
     * Array of sensor services (e.g. {@link Service.MotionSensor} or {@link Service.OccupancySensor}).
     * Any service in this array owns a {@link Characteristic.StatusActive} characteristic.
     * The value of the {@link Characteristic.HomeKitCameraActive} is mirrored towards the {@link Characteristic.StatusActive} characteristic.
     * The array is initialized my the caller shortly after calling the constructor.
     */
    sensorServices = [];
    /**
     * Defines if recording is enabled for this recording management.
     */
    recordingActive = false;
    constructor(options, delegate, eventTriggerOptions, services) {
        this.options = options;
        this.delegate = delegate;
        const recordingServices = services || this.constructService();
        this.recordingManagementService = recordingServices.recordingManagement;
        this.operatingModeService = recordingServices.operatingMode;
        this.dataStreamManagement = recordingServices.dataStreamManagement;
        this.eventTriggerOptions = 0;
        for (const option of eventTriggerOptions) {
            this.eventTriggerOptions |= option; // OR
        }
        this.supportedCameraRecordingConfiguration = this._supportedCameraRecordingConfiguration(options);
        this.supportedVideoRecordingConfiguration = this._supportedVideoRecordingConfiguration(options.video);
        this.supportedAudioRecordingConfiguration = this._supportedAudioStreamConfiguration(options.audio);
        this.setupServiceHandlers();
        hksvDebug("RecordingManagement created (eventTriggers=0x%s)", this.eventTriggerOptions.toString(16));
    }
    constructService() {
        const recordingManagement = new Service_1.Service.CameraRecordingManagement("", "");
        recordingManagement.setCharacteristic(Characteristic_1.Characteristic.Active, false);
        recordingManagement.setCharacteristic(Characteristic_1.Characteristic.RecordingAudioActive, false);
        const operatingMode = new Service_1.Service.CameraOperatingMode("", "");
        operatingMode.setCharacteristic(Characteristic_1.Characteristic.EventSnapshotsActive, true);
        operatingMode.setCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive, true);
        operatingMode.setCharacteristic(Characteristic_1.Characteristic.PeriodicSnapshotsActive, true);
        const dataStreamManagement = new datastream_1.DataStreamManagement();
        recordingManagement.addLinkedService(dataStreamManagement.getService());
        return {
            recordingManagement: recordingManagement,
            operatingMode: operatingMode,
            dataStreamManagement: dataStreamManagement,
        };
    }
    setupServiceHandlers() {
        // update the current configuration values to the current state.
        this.recordingManagementService.setCharacteristic(Characteristic_1.Characteristic.SupportedCameraRecordingConfiguration, this.supportedCameraRecordingConfiguration);
        this.recordingManagementService.setCharacteristic(Characteristic_1.Characteristic.SupportedVideoRecordingConfiguration, this.supportedVideoRecordingConfiguration);
        this.recordingManagementService.setCharacteristic(Characteristic_1.Characteristic.SupportedAudioRecordingConfiguration, this.supportedAudioRecordingConfiguration);
        this.recordingManagementService.getCharacteristic(Characteristic_1.Characteristic.SelectedCameraRecordingConfiguration)
            .onGet(this.handleSelectedCameraRecordingConfigurationRead.bind(this))
            .onSet(this.handleSelectedCameraRecordingConfigurationWrite.bind(this))
            .setProps({ adminOnlyAccess: [1 /* Access.WRITE */] });
        this.recordingManagementService.getCharacteristic(Characteristic_1.Characteristic.Active)
            .onSet(value => {
            if (!!value === this.recordingActive) {
                return; // skip delegate call if state didn't change!
            }
            this.recordingActive = !!value;
            hksvDebug("Active onSet: recordingActive -> %s", this.recordingActive);
            this.delegate.updateRecordingActive(this.recordingActive);
        })
            .on("change" /* CharacteristicEventTypes.CHANGE */, () => this.stateChangeDelegate?.())
            .setProps({ adminOnlyAccess: [1 /* Access.WRITE */] });
        this.recordingManagementService.getCharacteristic(Characteristic_1.Characteristic.RecordingAudioActive)
            .on("change" /* CharacteristicEventTypes.CHANGE */, () => this.stateChangeDelegate?.());
        this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive)
            .on("change" /* CharacteristicEventTypes.CHANGE */, change => {
            for (const service of this.sensorServices) {
                service.setCharacteristic(Characteristic_1.Characteristic.StatusActive, !!change.newValue);
            }
            if (!change.newValue && this.recordingStream) {
                this.recordingStream.close(1 /* HDSProtocolSpecificErrorReason.NOT_ALLOWED */);
            }
            this.stateChangeDelegate?.();
        })
            .setProps({ adminOnlyAccess: [1 /* Access.WRITE */] });
        this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.EventSnapshotsActive)
            .on("change" /* CharacteristicEventTypes.CHANGE */, () => this.stateChangeDelegate?.())
            .setProps({ adminOnlyAccess: [1 /* Access.WRITE */] });
        this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.PeriodicSnapshotsActive)
            .on("change" /* CharacteristicEventTypes.CHANGE */, () => this.stateChangeDelegate?.())
            .setProps({ adminOnlyAccess: [1 /* Access.WRITE */] });
        this.dataStreamManagement
            .onRequestMessage("dataSend" /* Protocols.DATA_SEND */, "open" /* Topics.OPEN */, this.handleDataSendOpen.bind(this));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleDataSendOpen(connection, id, message) {
        // for message fields see https://github.com/Supereg/secure-video-specification#41-start
        const streamId = message.streamId;
        const type = message.type;
        const target = message.target;
        const reason = message.reason;
        if (target !== "controller" || type !== "ipcamera.recording") {
            debug("[HDS %s] Received data send with unexpected target: %s or type: %d. Rejecting...", connection.remoteAddress, target, type);
            connection.sendResponse("dataSend" /* Protocols.DATA_SEND */, "open" /* Topics.OPEN */, id, datastream_1.HDSStatus.PROTOCOL_SPECIFIC_ERROR, {
                status: 5 /* HDSProtocolSpecificErrorReason.UNEXPECTED_FAILURE */,
            });
            return;
        }
        if (!this.recordingActive) {
            hksvDebug("[HDS %s] rejecting DATA_SEND OPEN: recordingActive=false", connection.remoteAddress);
            connection.sendResponse("dataSend" /* Protocols.DATA_SEND */, "open" /* Topics.OPEN */, id, datastream_1.HDSStatus.PROTOCOL_SPECIFIC_ERROR, {
                status: 1 /* HDSProtocolSpecificErrorReason.NOT_ALLOWED */,
            });
            return;
        }
        if (!this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive).value) {
            hksvDebug("[HDS %s] rejecting DATA_SEND OPEN: HomeKitCameraActive=false", connection.remoteAddress);
            connection.sendResponse("dataSend" /* Protocols.DATA_SEND */, "open" /* Topics.OPEN */, id, datastream_1.HDSStatus.PROTOCOL_SPECIFIC_ERROR, {
                status: 1 /* HDSProtocolSpecificErrorReason.NOT_ALLOWED */,
            });
            return;
        }
        if (this.recordingStream) {
            debug("[HDS %s] Rejecting DATA_SEND OPEN as another stream (%s) is already recording with streamId %d!", connection.remoteAddress, this.recordingStream.connection.remoteAddress, this.recordingStream.streamId);
            // there is already a recording stream running.
            connection.sendResponse("dataSend" /* Protocols.DATA_SEND */, "open" /* Topics.OPEN */, id, datastream_1.HDSStatus.PROTOCOL_SPECIFIC_ERROR, {
                status: 2 /* HDSProtocolSpecificErrorReason.BUSY */,
            });
            return;
        }
        if (!this.selectedConfiguration) {
            hksvDebug("[HDS %s] rejecting DATA_SEND OPEN: no selectedConfiguration (homebridge#3928)", connection.remoteAddress);
            connection.sendResponse("dataSend" /* Protocols.DATA_SEND */, "open" /* Topics.OPEN */, id, datastream_1.HDSStatus.PROTOCOL_SPECIFIC_ERROR, {
                status: 9 /* HDSProtocolSpecificErrorReason.INVALID_CONFIGURATION */,
            });
            return;
        }
        debug("[HDS %s] HDS DATA_SEND Open with reason '%s'.", connection.remoteAddress, reason);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        this.recordingStream = new CameraRecordingStream(connection, this.delegate, id, streamId);
        this.recordingStream.on("closed" /* CameraRecordingStreamEvents.CLOSED */, () => {
            debug("[HDS %s] Removing active recoding session from recording management!", connection.remoteAddress);
            this.recordingStream = undefined;
        });
        this.recordingStream.startStreaming();
    }
    handleSelectedCameraRecordingConfigurationRead() {
        if (!this.selectedConfiguration) {
            throw new hapStatusError_1.HapStatusError(-70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
        }
        return this.selectedConfiguration.base64;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleSelectedCameraRecordingConfigurationWrite(value) {
        const configuration = this.parseSelectedConfiguration(value);
        const changed = this.selectedConfiguration?.base64 !== value;
        hksvDebug("SelectedRecordingConfiguration write: changed=%s hasStateChangeDelegate=%s base64Len=%d", changed, !!this.stateChangeDelegate, typeof value === "string" ? value.length : -1);
        this.selectedConfiguration = {
            parsed: configuration,
            base64: value,
        };
        if (changed) {
            this.delegate.updateRecordingConfiguration(this.selectedConfiguration.parsed);
            // notify controller storage about updated values!
            this.stateChangeDelegate?.();
        }
    }
    parseSelectedConfiguration(value) {
        const decoded = tlv.decode(Buffer.from(value, "base64"));
        const recording = tlv.decode(decoded[1 /* SelectedCameraRecordingConfigurationTypes.SELECTED_RECORDING_CONFIGURATION */]);
        const video = tlv.decode(decoded[2 /* SelectedCameraRecordingConfigurationTypes.SELECTED_VIDEO_CONFIGURATION */]);
        const audio = tlv.decode(decoded[3 /* SelectedCameraRecordingConfigurationTypes.SELECTED_AUDIO_CONFIGURATION */]);
        const prebufferLength = recording[1 /* SupportedCameraRecordingConfigurationTypes.PREBUFFER_LENGTH */].readInt32LE(0);
        let eventTriggerOptions = recording[2 /* SupportedCameraRecordingConfigurationTypes.EVENT_TRIGGER_OPTIONS */].readInt32LE(0);
        const mediaContainerConfiguration = tlv.decode(recording[3 /* SupportedCameraRecordingConfigurationTypes.MEDIA_CONTAINER_CONFIGURATIONS */]);
        const containerType = mediaContainerConfiguration[1 /* MediaContainerConfigurationTypes.MEDIA_CONTAINER_TYPE */][0];
        const mediaContainerParameters = tlv.decode(mediaContainerConfiguration[2 /* MediaContainerConfigurationTypes.MEDIA_CONTAINER_PARAMETERS */]);
        const fragmentLength = mediaContainerParameters[1 /* MediaContainerParameterTypes.FRAGMENT_LENGTH */].readInt32LE(0);
        const videoCodec = video[1 /* VideoCodecConfigurationTypes.CODEC_TYPE */][0];
        const videoParameters = tlv.decode(video[2 /* VideoCodecConfigurationTypes.CODEC_PARAMETERS */]);
        const videoAttributes = tlv.decode(video[3 /* VideoCodecConfigurationTypes.ATTRIBUTES */]);
        const profile = videoParameters[1 /* VideoCodecParametersTypes.PROFILE_ID */][0];
        const level = videoParameters[2 /* VideoCodecParametersTypes.LEVEL */][0];
        const videoBitrate = videoParameters[3 /* VideoCodecParametersTypes.BITRATE */].readInt32LE(0);
        const iFrameInterval = videoParameters[4 /* VideoCodecParametersTypes.IFRAME_INTERVAL */].readInt32LE(0);
        const width = videoAttributes[1 /* VideoAttributesTypes.IMAGE_WIDTH */].readInt16LE(0);
        const height = videoAttributes[2 /* VideoAttributesTypes.IMAGE_HEIGHT */].readInt16LE(0);
        const framerate = videoAttributes[3 /* VideoAttributesTypes.FRAME_RATE */][0];
        const audioCodec = audio[1 /* AudioCodecConfigurationTypes.CODEC_TYPE */][0];
        const audioParameters = tlv.decode(audio[2 /* AudioCodecConfigurationTypes.CODEC_PARAMETERS */]);
        const audioChannels = audioParameters[1 /* AudioCodecParametersTypes.CHANNEL */][0];
        const samplerate = audioParameters[3 /* AudioCodecParametersTypes.SAMPLE_RATE */][0];
        const audioBitrateMode = audioParameters[2 /* AudioCodecParametersTypes.BIT_RATE */][0];
        const audioBitrate = audioParameters[4 /* AudioCodecParametersTypes.MAX_AUDIO_BITRATE */].readUInt32LE(0);
        const typedEventTriggers = [];
        let bit_index = 0;
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
                fragmentLength,
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
                audioChannels,
                type: audioCodec,
                samplerate,
                bitrateMode: audioBitrateMode,
                bitrate: audioBitrate,
            },
        };
    }
    _supportedCameraRecordingConfiguration(options) {
        const mediaContainers = Array.isArray(options.mediaContainerConfiguration)
            ? options.mediaContainerConfiguration
            : [options.mediaContainerConfiguration];
        const prebufferLength = Buffer.alloc(4);
        const eventTriggerOptions = Buffer.alloc(8);
        prebufferLength.writeInt32LE(options.prebufferLength, 0);
        eventTriggerOptions.writeInt32LE(this.eventTriggerOptions, 0);
        return tlv.encode(1 /* SupportedCameraRecordingConfigurationTypes.PREBUFFER_LENGTH */, prebufferLength, 2 /* SupportedCameraRecordingConfigurationTypes.EVENT_TRIGGER_OPTIONS */, eventTriggerOptions, 3 /* SupportedCameraRecordingConfigurationTypes.MEDIA_CONTAINER_CONFIGURATIONS */, mediaContainers.map(config => {
            const fragmentLength = Buffer.alloc(4);
            fragmentLength.writeInt32LE(config.fragmentLength, 0);
            return tlv.encode(1 /* MediaContainerConfigurationTypes.MEDIA_CONTAINER_TYPE */, config.type, 2 /* MediaContainerConfigurationTypes.MEDIA_CONTAINER_PARAMETERS */, tlv.encode(1 /* MediaContainerParameterTypes.FRAGMENT_LENGTH */, fragmentLength));
        })).toString("base64");
    }
    _supportedVideoRecordingConfiguration(videoOptions) {
        if (!videoOptions.parameters) {
            throw new Error("Video parameters cannot be undefined");
        }
        if (!videoOptions.resolutions) {
            throw new Error("Video resolutions cannot be undefined");
        }
        const codecParameters = tlv.encode(1 /* VideoCodecParametersTypes.PROFILE_ID */, videoOptions.parameters.profiles, 2 /* VideoCodecParametersTypes.LEVEL */, videoOptions.parameters.levels);
        const videoStreamConfiguration = tlv.encode(1 /* VideoCodecConfigurationTypes.CODEC_TYPE */, videoOptions.type, 2 /* VideoCodecConfigurationTypes.CODEC_PARAMETERS */, codecParameters, 3 /* VideoCodecConfigurationTypes.ATTRIBUTES */, videoOptions.resolutions.map(resolution => {
            if (resolution.length !== 3) {
                throw new Error("Unexpected video resolution");
            }
            const width = Buffer.alloc(2);
            const height = Buffer.alloc(2);
            const frameRate = Buffer.alloc(1);
            width.writeUInt16LE(resolution[0], 0);
            height.writeUInt16LE(resolution[1], 0);
            frameRate.writeUInt8(resolution[2], 0);
            return tlv.encode(1 /* VideoAttributesTypes.IMAGE_WIDTH */, width, 2 /* VideoAttributesTypes.IMAGE_HEIGHT */, height, 3 /* VideoAttributesTypes.FRAME_RATE */, frameRate);
        }));
        return tlv.encode(1 /* SupportedVideoRecordingConfigurationTypes.VIDEO_CODEC_CONFIGURATION */, videoStreamConfiguration).toString("base64");
    }
    _supportedAudioStreamConfiguration(audioOptions) {
        const audioCodecs = Array.isArray(audioOptions.codecs)
            ? audioOptions.codecs
            : [audioOptions.codecs];
        if (audioCodecs.length === 0) {
            throw Error("CameraRecordingOptions.audio: At least one audio codec configuration must be specified!");
        }
        const codecConfigurations = audioCodecs.map(codec => {
            const providedSamplerates = Array.isArray(codec.samplerate)
                ? codec.samplerate
                : [codec.samplerate];
            if (providedSamplerates.length === 0) {
                throw new Error("CameraRecordingOptions.audio.codecs: Audio samplerate cannot be empty!");
            }
            const audioParameters = tlv.encode(1 /* AudioCodecParametersTypes.CHANNEL */, Math.max(1, codec.audioChannels || 1), 2 /* AudioCodecParametersTypes.BIT_RATE */, codec.bitrateMode || 0 /* AudioBitrate.VARIABLE */, 3 /* AudioCodecParametersTypes.SAMPLE_RATE */, providedSamplerates);
            return tlv.encode(1 /* AudioCodecConfigurationTypes.CODEC_TYPE */, codec.type, 2 /* AudioCodecConfigurationTypes.CODEC_PARAMETERS */, audioParameters);
        });
        return tlv.encode(1 /* SupportedAudioRecordingConfigurationTypes.AUDIO_CODEC_CONFIGURATION */, codecConfigurations).toString("base64");
    }
    computeConfigurationHash(algorithm = "sha256") {
        const configurationHash = crypto_1.default.createHash(algorithm);
        configurationHash.update(this.supportedCameraRecordingConfiguration);
        configurationHash.update(this.supportedVideoRecordingConfiguration);
        configurationHash.update(this.supportedAudioRecordingConfiguration);
        return configurationHash.digest().toString("hex");
    }
    /**
     * @private
     */
    serialize() {
        return {
            configurationHash: {
                algorithm: "sha256",
                hash: this.computeConfigurationHash("sha256"),
            },
            selectedConfiguration: this.selectedConfiguration?.base64,
            recordingActive: this.recordingActive,
            recordingAudioActive: !!this.recordingManagementService.getCharacteristic(Characteristic_1.Characteristic.RecordingAudioActive).value,
            eventSnapshotsActive: !!this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.EventSnapshotsActive).value,
            homeKitCameraActive: !!this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive).value,
            periodicSnapshotsActive: !!this.operatingModeService.getCharacteristic(Characteristic_1.Characteristic.PeriodicSnapshotsActive).value,
        };
    }
    /**
     * @private
     */
    deserialize(serialized) {
        let changedState = false;
        // we only restore the `selectedConfiguration` if our supported configuration hasn't changed.
        const currentConfigurationHash = this.computeConfigurationHash(serialized.configurationHash.algorithm);
        hksvDebug("deserialize: hasSavedSelectedConfig=%s savedHash=%s currentHash=%s hashMatch=%s recordingActive=%s", !!serialized.selectedConfiguration, serialized.configurationHash?.hash?.slice(0, 12), currentConfigurationHash.slice(0, 12), currentConfigurationHash === serialized.configurationHash?.hash, serialized.recordingActive);
        if (serialized.selectedConfiguration) {
            if (currentConfigurationHash === serialized.configurationHash.hash) {
                this.selectedConfiguration = {
                    base64: serialized.selectedConfiguration,
                    parsed: this.parseSelectedConfiguration(serialized.selectedConfiguration),
                };
            }
            else {
                hksvDebug("deserialize: discarding saved selectedConfiguration — supportedConfiguration hash changed since last run");
                changedState = true;
            }
        }
        this.recordingActive = serialized.recordingActive;
        this.recordingManagementService.updateCharacteristic(Characteristic_1.Characteristic.Active, serialized.recordingActive);
        this.recordingManagementService.updateCharacteristic(Characteristic_1.Characteristic.RecordingAudioActive, serialized.recordingAudioActive);
        this.operatingModeService.updateCharacteristic(Characteristic_1.Characteristic.EventSnapshotsActive, serialized.eventSnapshotsActive);
        this.operatingModeService.updateCharacteristic(Characteristic_1.Characteristic.PeriodicSnapshotsActive, serialized.periodicSnapshotsActive);
        this.operatingModeService.updateCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive, serialized.homeKitCameraActive);
        for (const service of this.sensorServices) {
            service.setCharacteristic(Characteristic_1.Characteristic.StatusActive, serialized.homeKitCameraActive);
        }
        try {
            if (this.selectedConfiguration) {
                hksvDebug("deserialize: replaying updateRecordingConfiguration to delegate");
                this.delegate.updateRecordingConfiguration(this.selectedConfiguration.parsed);
            }
            else {
                hksvDebug("deserialize: no selectedConfiguration to restore");
            }
            if (serialized.recordingActive) {
                this.delegate.updateRecordingActive(serialized.recordingActive);
            }
        }
        catch (error) {
            console.error("Failed to properly initialize CameraRecordingDelegate from persistent storage: " + error.stack);
        }
        if (changedState) {
            this.stateChangeDelegate?.();
        }
    }
    /**
     * @private
     */
    setupStateChangeDelegate(delegate) {
        this.stateChangeDelegate = delegate;
    }
    destroy() {
        this.dataStreamManagement.destroy();
    }
    handleFactoryReset() {
        hksvDebug("handleFactoryReset: clearing selectedConfiguration and resetting recording state");
        this.selectedConfiguration = undefined;
        this.recordingManagementService.updateCharacteristic(Characteristic_1.Characteristic.Active, false);
        this.recordingManagementService.updateCharacteristic(Characteristic_1.Characteristic.RecordingAudioActive, false);
        this.operatingModeService.updateCharacteristic(Characteristic_1.Characteristic.EventSnapshotsActive, true);
        this.operatingModeService.updateCharacteristic(Characteristic_1.Characteristic.PeriodicSnapshotsActive, true);
        this.operatingModeService.updateCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive, true);
        for (const service of this.sensorServices) {
            service.setCharacteristic(Characteristic_1.Characteristic.StatusActive, true);
        }
        try {
            // notifying the delegate about the updated state
            this.delegate.updateRecordingActive(false);
            this.delegate.updateRecordingConfiguration(undefined);
        }
        catch (error) {
            console.error("CameraRecordingDelegate failed to update state after handleFactoryReset: " + error.stack);
        }
    }
}
exports.RecordingManagement = RecordingManagement;
/**
 * @group Camera
 */
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
 *
 * @group Camera
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class CameraRecordingStream extends events_1.EventEmitter {
    connection;
    delegate;
    hdsRequestId;
    streamId;
    abortController;
    closed = false;
    eventHandler = {
        ["close" /* Topics.CLOSE */]: this.handleDataSendClose.bind(this),
        ["ack" /* Topics.ACK */]: this.handleDataSendAck.bind(this),
    };
    requestHandler = undefined;
    closeListener;
    generator;
    /**
     * This timeout is used to detect non-returning generators.
     * When we signal the delegate that it is being closed its generator must return withing 10s.
     */
    generatorTimeout;
    /**
     * This timer is used to check if the stream is properly closed when we expect it to do so.
     * When we expect a close signal from the remote, we wait 12s for it. Otherwise, we abort and close it ourselves.
     * This ensures memory is freed, and that we recover fast from erroneous states.
     */
    closingTimeout;
    constructor(connection, delegate, requestId, streamId) {
        super();
        this.connection = connection;
        this.delegate = delegate;
        this.hdsRequestId = requestId;
        this.streamId = streamId;
        this.connection.on("closed" /* DataStreamConnectionEvent.CLOSED */, this.closeListener = this.handleDataStreamConnectionClosed.bind(this));
        this.connection.addProtocolHandler("dataSend" /* Protocols.DATA_SEND */, this);
    }
    startStreaming() {
        // noinspection JSIgnoredPromiseFromCall
        this._startStreaming();
    }
    async _startStreaming() {
        debug("[HDS %s] Sending DATA_SEND OPEN response for streamId %d", this.connection.remoteAddress, this.streamId);
        this.connection.sendResponse("dataSend" /* Protocols.DATA_SEND */, "open" /* Topics.OPEN */, this.hdsRequestId, datastream_1.HDSStatus.SUCCESS, {
            status: datastream_1.HDSStatus.SUCCESS,
        });
        // 256 KiB (1KiB to 900 KiB)
        const maxChunk = 0x40000;
        // The first buffer which we receive from the generator is always the `mediaInitialization` packet (mp4 `moov` box).
        let initialization = true;
        let dataSequenceNumber = 1;
        // tracks if the last received RecordingPacket was yielded with `isLast=true`.
        let lastFragmentWasMarkedLast = false;
        try {
            this.abortController = new AbortController();
            this.generator = this.delegate.handleRecordingStreamRequest(this.streamId, this.abortController.signal);
            for await (const packet of this.generator) {
                if (this.closed) {
                    debug("[HDS %s] Delegate yielded fragment after stream %d was already closed.", this.connection.remoteAddress, this.streamId);
                    break;
                }
                if (lastFragmentWasMarkedLast) {
                    console.error(`[HDS ${this.connection.remoteAddress}] Delegate yielded fragment for stream ${this.streamId} after already signaling end of stream!`);
                    break;
                }
                const fragment = packet.data;
                let offset = 0;
                let dataChunkSequenceNumber = 1;
                while (offset < fragment.length) {
                    if (this.closed) {
                        break;
                    }
                    const data = fragment.subarray(offset, offset + maxChunk);
                    offset += data.length;
                    // see https://github.com/Supereg/secure-video-specification#42-binary-data
                    const event = {
                        streamId: this.streamId,
                        packets: [{
                                data: data,
                                metadata: {
                                    dataType: initialization ? "mediaInitialization" /* PacketDataType.MEDIA_INITIALIZATION */ : "mediaFragment" /* PacketDataType.MEDIA_FRAGMENT */,
                                    dataSequenceNumber: dataSequenceNumber,
                                    dataChunkSequenceNumber: dataChunkSequenceNumber,
                                    isLastDataChunk: offset >= fragment.length,
                                    dataTotalSize: dataChunkSequenceNumber === 1 ? fragment.length : undefined,
                                },
                            }],
                        endOfStream: offset >= fragment.length ? Boolean(packet.isLast).valueOf() : undefined,
                    };
                    debug("[HDS %s] Sending DATA_SEND DATA for stream %d with metadata: %o and length %d; EoS: %s", this.connection.remoteAddress, this.streamId, event.packets[0].metadata, data.length, event.endOfStream);
                    this.connection.sendEvent("dataSend" /* Protocols.DATA_SEND */, "data" /* Topics.DATA */, event);
                    dataChunkSequenceNumber++;
                    initialization = false;
                }
                lastFragmentWasMarkedLast = packet.isLast;
                if (packet.isLast) {
                    break;
                }
                dataSequenceNumber++;
            }
            if (!lastFragmentWasMarkedLast && !this.closed) {
                // Delegate violates the contract. Exited normally on a non-closed stream without properly setting `isLast`.
                console.warn(`[HDS ${this.connection.remoteAddress}] Delegate finished streaming for ${this.streamId} without setting RecordingPacket.isLast. ` +
                    "Can't notify Controller about endOfStream!");
            }
        }
        catch (error) {
            if (this.closed) {
                console.warn(`[HDS ${this.connection.remoteAddress}] Encountered unexpected error on already closed recording stream ${this.streamId}: ${error.stack}`);
            }
            else {
                let closeReason = 5 /* HDSProtocolSpecificErrorReason.UNEXPECTED_FAILURE */;
                if (error instanceof datastream_1.HDSProtocolError) {
                    closeReason = error.reason;
                    debug("[HDS %s] Delegate signaled to close the recording stream %d.", this.connection.remoteAddress, this.streamId);
                }
                else if (error instanceof datastream_1.HDSConnectionError && error.type === 2 /* HDSConnectionErrorType.CLOSED_SOCKET */) {
                    // we are probably on a shutdown or just late. Connection is dead. End the stream!
                    debug("[HDS %s] Exited recording stream due to closed HDS socket: stream id %d.", this.connection.remoteAddress, this.streamId);
                    return; // execute finally and then exit (we want to skip the `sendEvent` below)
                }
                else {
                    console.error(`[HDS ${this.connection.remoteAddress}] Encountered unexpected error for recording stream ${this.streamId}: ${error.stack}`);
                }
                // call close to go through standard close routine!
                this.close(closeReason);
            }
            return;
        }
        finally {
            this.abortController = undefined;
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
        }
        debug("[HDS %s] Finished DATA_SEND transmission for stream %d!", this.connection.remoteAddress, this.streamId);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleDataSendAck(message) {
        const streamId = message.streamId;
        const endOfStream = message.endOfStream;
        // The HomeKit Controller will send a DATA_SEND ACK if we set the `endOfStream` flag in the last packet
        // of our DATA_SEND DATA packet.
        // To my testing the session is then considered complete and the HomeKit controller will close the HDS Connection after 5 seconds.
        debug("[HDS %s] Received DATA_SEND ACK packet for streamId %s. Acknowledged %s.", this.connection.remoteAddress, streamId, endOfStream);
        this.handleClosed(() => this.delegate.acknowledgeStream?.(this.streamId));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleDataSendClose(message) {
        // see https://github.com/Supereg/secure-video-specification#43-close
        const streamId = message.streamId;
        const reason = message.reason;
        if (streamId !== this.streamId) {
            return;
        }
        debug("[HDS %s] Received DATA_SEND CLOSE for streamId %d with reason %s", 
        // @ts-expect-error: forceConsistentCasingInFileNames compiler option
        this.connection.remoteAddress, streamId, datastream_1.HDSProtocolSpecificErrorReason[reason]);
        this.handleClosed(() => this.delegate.closeRecordingStream(streamId, reason));
    }
    handleDataStreamConnectionClosed() {
        debug("[HDS %s] The HDS connection of the stream %d closed.", this.connection.remoteAddress, this.streamId);
        this.handleClosed(() => this.delegate.closeRecordingStream(this.streamId, undefined));
    }
    handleClosed(closure) {
        if (this.closed) {
            return;
        }
        this.closed = true;
        // Signal the delegate's generator to stop immediately. This allows delegates with abortable async operations (e.g. pacing delays) to interrupt them and
        // return without yielding to a closed stream.
        this.abortController?.abort();
        if (this.closingTimeout) {
            clearTimeout(this.closingTimeout);
            this.closingTimeout = undefined;
        }
        this.connection.removeProtocolHandler("dataSend" /* Protocols.DATA_SEND */, this);
        this.connection.removeListener("closed" /* DataStreamConnectionEvent.CLOSED */, this.closeListener);
        if (this.generator) {
            // Signal the generator to terminate via the async generator protocol. The return is queued and takes effect
            // after the generator's current await completes. Combined with the AbortSignal above, this ensures the
            // generator terminates promptly even if the delegate doesn't check the signal. We catch rejections
            // to prevent unhandled promise warnings if the generator's cleanup throws.
            // @ts-expect-error: AsyncGenerator.return() requires a value parameter, but we're signaling termination.
            void this.generator.return().catch((error) => debug("[HDS %s] Error while closing recording generator for stream %d: %s", this.connection.remoteAddress, this.streamId, error.stack ?? String(error)));
            // when this variable is defined, the generator hasn't returned yet.
            // we start a timeout to uncover potential programming mistakes where we await forever and can't free resources.
            this.generatorTimeout = setTimeout(() => {
                console.error("[HDS %s] Recording download stream %d is still awaiting generator although stream was closed 10s ago! " +
                    "This is a programming mistake by the camera implementation which prevents freeing up resources.", this.connection.remoteAddress, this.streamId);
            }, 10000);
        }
        try {
            closure();
        }
        catch (error) {
            console.error(`[HDS ${this.connection.remoteAddress}] CameraRecordingDelegated failed to handle closing the stream ${this.streamId}: ${error.stack}`);
        }
        this.emit("closed" /* CameraRecordingStreamEvents.CLOSED */);
    }
    /**
     * This method can be used to close a recording session from the outside.
     * @param reason - The reason to close the stream with.
     */
    close(reason) {
        if (this.closed) {
            return;
        }
        debug("[HDS %s] Recording stream %d was closed manually with reason %s.", 
        // @ts-expect-error: forceConsistentCasingInFileNames compiler option
        this.connection.remoteAddress, this.streamId, reason ? datastream_1.HDSProtocolSpecificErrorReason[reason] : "CLOSED");
        // the `isConsideredClosed` check just ensures that the won't ever throw here and that `handledClosed` is always executed.
        if (!this.connection.isConsideredClosed()) {
            this.connection.sendEvent("dataSend" /* Protocols.DATA_SEND */, "close" /* Topics.CLOSE */, {
                streamId: this.streamId,
                reason: reason,
            });
        }
        this.handleClosed(() => this.delegate.closeRecordingStream(this.streamId, reason));
    }
    kickOffCloseTimeout() {
        if (this.closingTimeout) {
            clearTimeout(this.closingTimeout);
        }
        this.closingTimeout = setTimeout(() => {
            if (this.closed) {
                return;
            }
            debug("[HDS %s] Recording stream %d took longer than expected to fully close. Force closing now!", this.connection.remoteAddress, this.streamId);
            this.close(3 /* HDSProtocolSpecificErrorReason.CANCELLED */);
        }, 12000);
    }
}
//# sourceMappingURL=RecordingManagement.js.map