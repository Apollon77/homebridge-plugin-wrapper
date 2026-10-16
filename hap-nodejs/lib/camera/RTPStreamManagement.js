"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTPStreamManagement = exports.StreamRequestTypes = exports.AudioStreamingSamplerate = exports.AudioStreamingCodecType = exports.SRTPCryptoSuites = exports.AudioSamplerate = exports.AudioBitrate = exports.VideoCodecPacketizationMode = exports.H264Level = exports.H264Profile = exports.VideoCodecType = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const net_1 = tslib_1.__importDefault(require("net"));
const Characteristic_1 = require("../Characteristic");
const controller_1 = require("../controller");
const Service_1 = require("../Service");
const hapStatusError_1 = require("../util/hapStatusError");
const once_1 = require("../util/once");
const tlv = tslib_1.__importStar(require("../util/tlv"));
const uuid = tslib_1.__importStar(require("../util/uuid"));
const RTPProxy_1 = tslib_1.__importDefault(require("./RTPProxy"));
const debug = (0, debug_1.default)("HAP-NodeJS:Camera:RTPStreamManagement");
// ---------------------------------- TLV DEFINITIONS START ----------------------------------
var StreamingStatusTypes;
(function (StreamingStatusTypes) {
    StreamingStatusTypes[StreamingStatusTypes["STATUS"] = 1] = "STATUS";
})(StreamingStatusTypes || (StreamingStatusTypes = {}));
var StreamingStatus;
(function (StreamingStatus) {
    StreamingStatus[StreamingStatus["AVAILABLE"] = 0] = "AVAILABLE";
    StreamingStatus[StreamingStatus["IN_USE"] = 1] = "IN_USE";
    StreamingStatus[StreamingStatus["UNAVAILABLE"] = 2] = "UNAVAILABLE";
})(StreamingStatus || (StreamingStatus = {}));
// ----------
var SupportedVideoStreamConfigurationTypes;
(function (SupportedVideoStreamConfigurationTypes) {
    SupportedVideoStreamConfigurationTypes[SupportedVideoStreamConfigurationTypes["VIDEO_CODEC_CONFIGURATION"] = 1] = "VIDEO_CODEC_CONFIGURATION";
})(SupportedVideoStreamConfigurationTypes || (SupportedVideoStreamConfigurationTypes = {}));
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
    VideoCodecParametersTypes[VideoCodecParametersTypes["PACKETIZATION_MODE"] = 3] = "PACKETIZATION_MODE";
    VideoCodecParametersTypes[VideoCodecParametersTypes["CVO_ENABLED"] = 4] = "CVO_ENABLED";
    VideoCodecParametersTypes[VideoCodecParametersTypes["CVO_ID"] = 5] = "CVO_ID";
})(VideoCodecParametersTypes || (VideoCodecParametersTypes = {}));
var VideoAttributesTypes;
(function (VideoAttributesTypes) {
    VideoAttributesTypes[VideoAttributesTypes["IMAGE_WIDTH"] = 1] = "IMAGE_WIDTH";
    VideoAttributesTypes[VideoAttributesTypes["IMAGE_HEIGHT"] = 2] = "IMAGE_HEIGHT";
    VideoAttributesTypes[VideoAttributesTypes["FRAME_RATE"] = 3] = "FRAME_RATE";
})(VideoAttributesTypes || (VideoAttributesTypes = {}));
/**
 * @group Camera
 */
var VideoCodecType;
(function (VideoCodecType) {
    VideoCodecType[VideoCodecType["H264"] = 0] = "H264";
    // while the namespace is already reserved for H265 it isn't currently supported.
    // H265 = 0x01,
})(VideoCodecType || (exports.VideoCodecType = VideoCodecType = {}));
/**
 * @group Camera
 */
var H264Profile;
(function (H264Profile) {
    H264Profile[H264Profile["BASELINE"] = 0] = "BASELINE";
    H264Profile[H264Profile["MAIN"] = 1] = "MAIN";
    H264Profile[H264Profile["HIGH"] = 2] = "HIGH";
})(H264Profile || (exports.H264Profile = H264Profile = {}));
/**
 * @group Camera
 */
var H264Level;
(function (H264Level) {
    H264Level[H264Level["LEVEL3_1"] = 0] = "LEVEL3_1";
    H264Level[H264Level["LEVEL3_2"] = 1] = "LEVEL3_2";
    H264Level[H264Level["LEVEL4_0"] = 2] = "LEVEL4_0";
})(H264Level || (exports.H264Level = H264Level = {}));
/**
 * @group Camera
 */
var VideoCodecPacketizationMode;
(function (VideoCodecPacketizationMode) {
    VideoCodecPacketizationMode[VideoCodecPacketizationMode["NON_INTERLEAVED"] = 0] = "NON_INTERLEAVED";
})(VideoCodecPacketizationMode || (exports.VideoCodecPacketizationMode = VideoCodecPacketizationMode = {}));
var VideoCodecCVO;
(function (VideoCodecCVO) {
    VideoCodecCVO[VideoCodecCVO["UNSUPPORTED"] = 0] = "UNSUPPORTED";
    VideoCodecCVO[VideoCodecCVO["SUPPORTED"] = 1] = "SUPPORTED";
})(VideoCodecCVO || (VideoCodecCVO = {}));
// ----------
var SupportedAudioStreamConfigurationTypes;
(function (SupportedAudioStreamConfigurationTypes) {
    SupportedAudioStreamConfigurationTypes[SupportedAudioStreamConfigurationTypes["AUDIO_CODEC_CONFIGURATION"] = 1] = "AUDIO_CODEC_CONFIGURATION";
    SupportedAudioStreamConfigurationTypes[SupportedAudioStreamConfigurationTypes["COMFORT_NOISE_SUPPORT"] = 2] = "COMFORT_NOISE_SUPPORT";
})(SupportedAudioStreamConfigurationTypes || (SupportedAudioStreamConfigurationTypes = {}));
var AudioCodecConfigurationTypes;
(function (AudioCodecConfigurationTypes) {
    AudioCodecConfigurationTypes[AudioCodecConfigurationTypes["CODEC_TYPE"] = 1] = "CODEC_TYPE";
    AudioCodecConfigurationTypes[AudioCodecConfigurationTypes["CODEC_PARAMETERS"] = 2] = "CODEC_PARAMETERS";
})(AudioCodecConfigurationTypes || (AudioCodecConfigurationTypes = {}));
var AudioCodecTypes;
(function (AudioCodecTypes) {
    AudioCodecTypes[AudioCodecTypes["PCMU"] = 0] = "PCMU";
    AudioCodecTypes[AudioCodecTypes["PCMA"] = 1] = "PCMA";
    AudioCodecTypes[AudioCodecTypes["AAC_ELD"] = 2] = "AAC_ELD";
    AudioCodecTypes[AudioCodecTypes["OPUS"] = 3] = "OPUS";
    AudioCodecTypes[AudioCodecTypes["MSBC"] = 4] = "MSBC";
    AudioCodecTypes[AudioCodecTypes["AMR"] = 5] = "AMR";
    AudioCodecTypes[AudioCodecTypes["AMR_WB"] = 6] = "AMR_WB";
})(AudioCodecTypes || (AudioCodecTypes = {}));
var AudioCodecParametersTypes;
(function (AudioCodecParametersTypes) {
    AudioCodecParametersTypes[AudioCodecParametersTypes["CHANNEL"] = 1] = "CHANNEL";
    AudioCodecParametersTypes[AudioCodecParametersTypes["BIT_RATE"] = 2] = "BIT_RATE";
    AudioCodecParametersTypes[AudioCodecParametersTypes["SAMPLE_RATE"] = 3] = "SAMPLE_RATE";
    AudioCodecParametersTypes[AudioCodecParametersTypes["PACKET_TIME"] = 4] = "PACKET_TIME"; // only present in selected audio codec parameters tlv
})(AudioCodecParametersTypes || (AudioCodecParametersTypes = {}));
/**
 * @group Camera
 */
var AudioBitrate;
(function (AudioBitrate) {
    AudioBitrate[AudioBitrate["VARIABLE"] = 0] = "VARIABLE";
    AudioBitrate[AudioBitrate["CONSTANT"] = 1] = "CONSTANT";
})(AudioBitrate || (exports.AudioBitrate = AudioBitrate = {}));
/**
 * @group Camera
 */
var AudioSamplerate;
(function (AudioSamplerate) {
    AudioSamplerate[AudioSamplerate["KHZ_8"] = 0] = "KHZ_8";
    AudioSamplerate[AudioSamplerate["KHZ_16"] = 1] = "KHZ_16";
    AudioSamplerate[AudioSamplerate["KHZ_24"] = 2] = "KHZ_24";
    // 3, 4, 5 are theoretically defined, but no idea to what kHz value they correspond to
    // probably KHZ_32, KHZ_44_1, KHZ_48 (as supported by Secure Video recordings)
})(AudioSamplerate || (exports.AudioSamplerate = AudioSamplerate = {}));
// ----------
var SupportedRTPConfigurationTypes;
(function (SupportedRTPConfigurationTypes) {
    SupportedRTPConfigurationTypes[SupportedRTPConfigurationTypes["SRTP_CRYPTO_SUITE"] = 2] = "SRTP_CRYPTO_SUITE";
})(SupportedRTPConfigurationTypes || (SupportedRTPConfigurationTypes = {}));
/**
 * @group Camera
 */
var SRTPCryptoSuites;
(function (SRTPCryptoSuites) {
    SRTPCryptoSuites[SRTPCryptoSuites["AES_CM_128_HMAC_SHA1_80"] = 0] = "AES_CM_128_HMAC_SHA1_80";
    SRTPCryptoSuites[SRTPCryptoSuites["AES_CM_256_HMAC_SHA1_80"] = 1] = "AES_CM_256_HMAC_SHA1_80";
    SRTPCryptoSuites[SRTPCryptoSuites["NONE"] = 2] = "NONE";
})(SRTPCryptoSuites || (exports.SRTPCryptoSuites = SRTPCryptoSuites = {}));
// ----------
var SetupEndpointsTypes;
(function (SetupEndpointsTypes) {
    SetupEndpointsTypes[SetupEndpointsTypes["SESSION_ID"] = 1] = "SESSION_ID";
    SetupEndpointsTypes[SetupEndpointsTypes["CONTROLLER_ADDRESS"] = 3] = "CONTROLLER_ADDRESS";
    SetupEndpointsTypes[SetupEndpointsTypes["VIDEO_SRTP_PARAMETERS"] = 4] = "VIDEO_SRTP_PARAMETERS";
    SetupEndpointsTypes[SetupEndpointsTypes["AUDIO_SRTP_PARAMETERS"] = 5] = "AUDIO_SRTP_PARAMETERS";
})(SetupEndpointsTypes || (SetupEndpointsTypes = {}));
var AddressTypes;
(function (AddressTypes) {
    AddressTypes[AddressTypes["ADDRESS_VERSION"] = 1] = "ADDRESS_VERSION";
    AddressTypes[AddressTypes["ADDRESS"] = 2] = "ADDRESS";
    AddressTypes[AddressTypes["VIDEO_RTP_PORT"] = 3] = "VIDEO_RTP_PORT";
    AddressTypes[AddressTypes["AUDIO_RTP_PORT"] = 4] = "AUDIO_RTP_PORT";
})(AddressTypes || (AddressTypes = {}));
var IPAddressVersion;
(function (IPAddressVersion) {
    IPAddressVersion[IPAddressVersion["IPV4"] = 0] = "IPV4";
    IPAddressVersion[IPAddressVersion["IPV6"] = 1] = "IPV6";
})(IPAddressVersion || (IPAddressVersion = {}));
var SRTPParametersTypes;
(function (SRTPParametersTypes) {
    SRTPParametersTypes[SRTPParametersTypes["SRTP_CRYPTO_SUITE"] = 1] = "SRTP_CRYPTO_SUITE";
    SRTPParametersTypes[SRTPParametersTypes["MASTER_KEY"] = 2] = "MASTER_KEY";
    SRTPParametersTypes[SRTPParametersTypes["MASTER_SALT"] = 3] = "MASTER_SALT"; // 14 bytes
})(SRTPParametersTypes || (SRTPParametersTypes = {}));
var SetupEndpointsResponseTypes;
(function (SetupEndpointsResponseTypes) {
    SetupEndpointsResponseTypes[SetupEndpointsResponseTypes["SESSION_ID"] = 1] = "SESSION_ID";
    SetupEndpointsResponseTypes[SetupEndpointsResponseTypes["STATUS"] = 2] = "STATUS";
    SetupEndpointsResponseTypes[SetupEndpointsResponseTypes["ACCESSORY_ADDRESS"] = 3] = "ACCESSORY_ADDRESS";
    SetupEndpointsResponseTypes[SetupEndpointsResponseTypes["VIDEO_SRTP_PARAMETERS"] = 4] = "VIDEO_SRTP_PARAMETERS";
    SetupEndpointsResponseTypes[SetupEndpointsResponseTypes["AUDIO_SRTP_PARAMETERS"] = 5] = "AUDIO_SRTP_PARAMETERS";
    SetupEndpointsResponseTypes[SetupEndpointsResponseTypes["VIDEO_SSRC"] = 6] = "VIDEO_SSRC";
    SetupEndpointsResponseTypes[SetupEndpointsResponseTypes["AUDIO_SSRC"] = 7] = "AUDIO_SSRC";
})(SetupEndpointsResponseTypes || (SetupEndpointsResponseTypes = {}));
var SetupEndpointsStatus;
(function (SetupEndpointsStatus) {
    SetupEndpointsStatus[SetupEndpointsStatus["SUCCESS"] = 0] = "SUCCESS";
    SetupEndpointsStatus[SetupEndpointsStatus["BUSY"] = 1] = "BUSY";
    SetupEndpointsStatus[SetupEndpointsStatus["ERROR"] = 2] = "ERROR";
})(SetupEndpointsStatus || (SetupEndpointsStatus = {}));
// ----------
var SelectedRTPStreamConfigurationTypes;
(function (SelectedRTPStreamConfigurationTypes) {
    SelectedRTPStreamConfigurationTypes[SelectedRTPStreamConfigurationTypes["SESSION_CONTROL"] = 1] = "SESSION_CONTROL";
    SelectedRTPStreamConfigurationTypes[SelectedRTPStreamConfigurationTypes["SELECTED_VIDEO_PARAMETERS"] = 2] = "SELECTED_VIDEO_PARAMETERS";
    SelectedRTPStreamConfigurationTypes[SelectedRTPStreamConfigurationTypes["SELECTED_AUDIO_PARAMETERS"] = 3] = "SELECTED_AUDIO_PARAMETERS";
})(SelectedRTPStreamConfigurationTypes || (SelectedRTPStreamConfigurationTypes = {}));
var SessionControlTypes;
(function (SessionControlTypes) {
    SessionControlTypes[SessionControlTypes["SESSION_IDENTIFIER"] = 1] = "SESSION_IDENTIFIER";
    SessionControlTypes[SessionControlTypes["COMMAND"] = 2] = "COMMAND";
})(SessionControlTypes || (SessionControlTypes = {}));
var SessionControlCommand;
(function (SessionControlCommand) {
    SessionControlCommand[SessionControlCommand["END_SESSION"] = 0] = "END_SESSION";
    SessionControlCommand[SessionControlCommand["START_SESSION"] = 1] = "START_SESSION";
    SessionControlCommand[SessionControlCommand["SUSPEND_SESSION"] = 2] = "SUSPEND_SESSION";
    SessionControlCommand[SessionControlCommand["RESUME_SESSION"] = 3] = "RESUME_SESSION";
    SessionControlCommand[SessionControlCommand["RECONFIGURE_SESSION"] = 4] = "RECONFIGURE_SESSION";
})(SessionControlCommand || (SessionControlCommand = {}));
var SelectedVideoParametersTypes;
(function (SelectedVideoParametersTypes) {
    SelectedVideoParametersTypes[SelectedVideoParametersTypes["CODEC_TYPE"] = 1] = "CODEC_TYPE";
    SelectedVideoParametersTypes[SelectedVideoParametersTypes["CODEC_PARAMETERS"] = 2] = "CODEC_PARAMETERS";
    SelectedVideoParametersTypes[SelectedVideoParametersTypes["ATTRIBUTES"] = 3] = "ATTRIBUTES";
    SelectedVideoParametersTypes[SelectedVideoParametersTypes["RTP_PARAMETERS"] = 4] = "RTP_PARAMETERS";
})(SelectedVideoParametersTypes || (SelectedVideoParametersTypes = {}));
var VideoRTPParametersTypes;
(function (VideoRTPParametersTypes) {
    VideoRTPParametersTypes[VideoRTPParametersTypes["PAYLOAD_TYPE"] = 1] = "PAYLOAD_TYPE";
    VideoRTPParametersTypes[VideoRTPParametersTypes["SYNCHRONIZATION_SOURCE"] = 2] = "SYNCHRONIZATION_SOURCE";
    VideoRTPParametersTypes[VideoRTPParametersTypes["MAX_BIT_RATE"] = 3] = "MAX_BIT_RATE";
    VideoRTPParametersTypes[VideoRTPParametersTypes["MIN_RTCP_INTERVAL"] = 4] = "MIN_RTCP_INTERVAL";
    VideoRTPParametersTypes[VideoRTPParametersTypes["MAX_MTU"] = 5] = "MAX_MTU";
})(VideoRTPParametersTypes || (VideoRTPParametersTypes = {}));
var SelectedAudioParametersTypes;
(function (SelectedAudioParametersTypes) {
    SelectedAudioParametersTypes[SelectedAudioParametersTypes["CODEC_TYPE"] = 1] = "CODEC_TYPE";
    SelectedAudioParametersTypes[SelectedAudioParametersTypes["CODEC_PARAMETERS"] = 2] = "CODEC_PARAMETERS";
    SelectedAudioParametersTypes[SelectedAudioParametersTypes["RTP_PARAMETERS"] = 3] = "RTP_PARAMETERS";
    SelectedAudioParametersTypes[SelectedAudioParametersTypes["COMFORT_NOISE"] = 4] = "COMFORT_NOISE";
})(SelectedAudioParametersTypes || (SelectedAudioParametersTypes = {}));
var AudioRTPParametersTypes;
(function (AudioRTPParametersTypes) {
    AudioRTPParametersTypes[AudioRTPParametersTypes["PAYLOAD_TYPE"] = 1] = "PAYLOAD_TYPE";
    AudioRTPParametersTypes[AudioRTPParametersTypes["SYNCHRONIZATION_SOURCE"] = 2] = "SYNCHRONIZATION_SOURCE";
    AudioRTPParametersTypes[AudioRTPParametersTypes["MAX_BIT_RATE"] = 3] = "MAX_BIT_RATE";
    AudioRTPParametersTypes[AudioRTPParametersTypes["MIN_RTCP_INTERVAL"] = 4] = "MIN_RTCP_INTERVAL";
    AudioRTPParametersTypes[AudioRTPParametersTypes["COMFORT_NOISE_PAYLOAD_TYPE"] = 6] = "COMFORT_NOISE_PAYLOAD_TYPE";
})(AudioRTPParametersTypes || (AudioRTPParametersTypes = {}));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isLegacySRTPOptions(options) {
    return "srtp" in options;
}
/**
 * @group Camera
 */
var AudioStreamingCodecType;
(function (AudioStreamingCodecType) {
    AudioStreamingCodecType["PCMU"] = "PCMU";
    AudioStreamingCodecType["PCMA"] = "PCMA";
    AudioStreamingCodecType["AAC_ELD"] = "AAC-eld";
    AudioStreamingCodecType["OPUS"] = "OPUS";
    AudioStreamingCodecType["MSBC"] = "mSBC";
    AudioStreamingCodecType["AMR"] = "AMR";
    AudioStreamingCodecType["AMR_WB"] = "AMR-WB";
})(AudioStreamingCodecType || (exports.AudioStreamingCodecType = AudioStreamingCodecType = {}));
/**
 * @group Camera
 */
var AudioStreamingSamplerate;
(function (AudioStreamingSamplerate) {
    AudioStreamingSamplerate[AudioStreamingSamplerate["KHZ_8"] = 8] = "KHZ_8";
    AudioStreamingSamplerate[AudioStreamingSamplerate["KHZ_16"] = 16] = "KHZ_16";
    AudioStreamingSamplerate[AudioStreamingSamplerate["KHZ_24"] = 24] = "KHZ_24";
})(AudioStreamingSamplerate || (exports.AudioStreamingSamplerate = AudioStreamingSamplerate = {}));
/**
 * @group Camera
 */
var StreamRequestTypes;
(function (StreamRequestTypes) {
    StreamRequestTypes["RECONFIGURE"] = "reconfigure";
    StreamRequestTypes["START"] = "start";
    StreamRequestTypes["STOP"] = "stop";
})(StreamRequestTypes || (exports.StreamRequestTypes = StreamRequestTypes = {}));
/**
 * @group Camera
 */
class RTPStreamManagement {
    id;
    delegate;
    service;
    stateChangeDelegate;
    requireProxy;
    disableAudioProxy;
    supportedCryptoSuites;
    videoOnly = false;
    supportedRTPConfiguration;
    supportedVideoStreamConfiguration;
    supportedAudioStreamConfiguration;
    activeConnection;
    activeConnectionClosedListener;
    sessionIdentifier = undefined;
    /**
     * @private private API
     */
    streamStatus = 0 /* StreamingStatus.AVAILABLE */; // use _updateStreamStatus to update this property
    ipVersion; // ip version for the current session
    selectedConfiguration = ""; // base64 representation of the currently selected configuration
    setupEndpointsResponse = ""; // response of the SetupEndpoints Characteristic
    /**
     * @private deprecated API
     */
    audioProxy;
    /**
     * @private deprecated API
     */
    videoProxy;
    /**
     * A RTPStreamManagement is considered disabled if `HomeKitCameraActive` is set to false.
     * We use a closure based approach to retrieve the value of this characteristic.
     * The characteristic is managed by the RecordingManagement.
     */
    disabledThroughOperatingMode;
    constructor(id, options, delegate, service, disabledThroughOperatingMode) {
        this.id = id;
        this.delegate = delegate;
        this.requireProxy = options.proxy || false;
        this.disableAudioProxy = options.disable_audio_proxy || false;
        if (isLegacySRTPOptions(options)) {
            this.supportedCryptoSuites = [options.srtp ? 0 /* SRTPCryptoSuites.AES_CM_128_HMAC_SHA1_80 */ : 2 /* SRTPCryptoSuites.NONE */];
        }
        else {
            this.supportedCryptoSuites = options.supportedCryptoSuites;
        }
        if (this.supportedCryptoSuites.length === 0) {
            this.supportedCryptoSuites.push(2 /* SRTPCryptoSuites.NONE */);
        }
        if (!options.video) {
            throw new Error("Video parameters cannot be undefined in options");
        }
        this.supportedRTPConfiguration = RTPStreamManagement._supportedRTPConfiguration(this.supportedCryptoSuites);
        this.supportedVideoStreamConfiguration = RTPStreamManagement._supportedVideoStreamConfiguration(options.video);
        this.supportedAudioStreamConfiguration = this._supportedAudioStreamConfiguration(options.audio);
        this.activeConnectionClosedListener = this._handleStopStream.bind(this);
        this.service = service || this.constructService(id);
        this.setupServiceHandlers();
        this.resetSetupEndpointsResponse();
        this.resetSelectedStreamConfiguration();
        this.disabledThroughOperatingMode = disabledThroughOperatingMode;
    }
    forceStop() {
        this.handleSessionClosed();
    }
    getService() {
        return this.service;
    }
    handleFactoryReset() {
        this.resetSelectedStreamConfiguration();
        this.resetSetupEndpointsResponse();
        this.service.updateCharacteristic(Characteristic_1.Characteristic.Active, true);
        // on a factory reset the assumption is that all connections were already terminated and thus "handleStopStream" was already called
    }
    destroy() {
        if (this.activeConnection) {
            this._handleStopStream();
        }
    }
    constructService(id) {
        const managementService = new Service_1.Service.CameraRTPStreamManagement("", id.toString());
        // this service is required only when recording is enabled. We don't really have access to this info here,
        // so we just add the characteristic. Doesn't really hurt.
        managementService.setCharacteristic(Characteristic_1.Characteristic.Active, true);
        return managementService;
    }
    setupServiceHandlers() {
        if (!this.service.testCharacteristic(Characteristic_1.Characteristic.Active)) {
            // the active characteristic might not be present on some older configurations.
            this.service.setCharacteristic(Characteristic_1.Characteristic.Active, true);
        }
        this.service.getCharacteristic(Characteristic_1.Characteristic.Active)
            .on("change" /* CharacteristicEventTypes.CHANGE */, () => this.stateChangeDelegate?.())
            .setProps({ adminOnlyAccess: [1 /* Access.WRITE */] });
        // ensure that configurations are up-to-date and reflected in the characteristic values
        this.service.setCharacteristic(Characteristic_1.Characteristic.SupportedRTPConfiguration, this.supportedRTPConfiguration);
        this.service.setCharacteristic(Characteristic_1.Characteristic.SupportedVideoStreamConfiguration, this.supportedVideoStreamConfiguration);
        this.service.setCharacteristic(Characteristic_1.Characteristic.SupportedAudioStreamConfiguration, this.supportedAudioStreamConfiguration);
        this._updateStreamStatus(0 /* StreamingStatus.AVAILABLE */); // reset streaming status to available
        this.service.setCharacteristic(Characteristic_1.Characteristic.SetupEndpoints, this.setupEndpointsResponse); // reset SetupEndpoints to default
        this.service.getCharacteristic(Characteristic_1.Characteristic.SelectedRTPStreamConfiguration)
            .on("get" /* CharacteristicEventTypes.GET */, callback => {
            if (this.streamingIsDisabled()) {
                callback(null, tlv.encode(1 /* SelectedRTPStreamConfigurationTypes.SESSION_CONTROL */, tlv.encode(2 /* SessionControlTypes.COMMAND */, SessionControlCommand.SUSPEND_SESSION)).toString("base64"));
                return;
            }
            callback(null, this.selectedConfiguration);
        })
            .on("set" /* CharacteristicEventTypes.SET */, this._handleSelectedStreamConfigurationWrite.bind(this));
        this.service.getCharacteristic(Characteristic_1.Characteristic.SetupEndpoints)
            .on("get" /* CharacteristicEventTypes.GET */, callback => {
            if (this.streamingIsDisabled()) {
                callback(null, tlv.encode(2 /* SetupEndpointsResponseTypes.STATUS */, 2 /* SetupEndpointsStatus.ERROR */).toString("base64"));
                return;
            }
            callback(null, this.setupEndpointsResponse);
        })
            .on("set" /* CharacteristicEventTypes.SET */, (value, callback, context, connection) => {
            if (!connection) {
                debug("Set event handler for SetupEndpoints cannot be called from plugin. Connection undefined!");
                callback(-70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */);
                return;
            }
            this.handleSetupEndpoints(value, callback, connection);
        });
    }
    handleSessionClosed() {
        this.resetSelectedStreamConfiguration();
        this.resetSetupEndpointsResponse();
        if (this.activeConnection) {
            this.activeConnection.removeListener("closed" /* HAPConnectionEvent.CLOSED */, this.activeConnectionClosedListener);
            this.activeConnection.setMaxListeners(this.activeConnection.getMaxListeners() - 1);
            this.activeConnection = undefined;
        }
        this._updateStreamStatus(0 /* StreamingStatus.AVAILABLE */);
        this.sessionIdentifier = undefined;
        this.ipVersion = undefined;
        if (this.videoProxy) {
            this.videoProxy.destroy();
            this.videoProxy = undefined;
        }
        if (this.audioProxy) {
            this.audioProxy.destroy();
            this.audioProxy = undefined;
        }
    }
    streamingIsDisabled(callback) {
        if (!this.service.getCharacteristic(Characteristic_1.Characteristic.Active).value) {
            if (callback) {
                callback(new hapStatusError_1.HapStatusError(-70412 /* HAPStatus.NOT_ALLOWED_IN_CURRENT_STATE */));
            }
            return true;
        }
        if (this.disabledThroughOperatingMode?.()) {
            if (callback) {
                callback(new hapStatusError_1.HapStatusError(-70412 /* HAPStatus.NOT_ALLOWED_IN_CURRENT_STATE */));
            }
            return true;
        }
        return false;
    }
    _handleSelectedStreamConfigurationWrite(value, callback) {
        if (this.streamingIsDisabled(callback)) {
            return;
        }
        const data = Buffer.from(value, "base64");
        const objects = tlv.decode(data);
        const sessionControl = tlv.decode(objects[1 /* SelectedRTPStreamConfigurationTypes.SESSION_CONTROL */]);
        const sessionIdentifier = uuid.unparse(sessionControl[1 /* SessionControlTypes.SESSION_IDENTIFIER */]);
        const requestType = sessionControl[2 /* SessionControlTypes.COMMAND */][0];
        if (sessionIdentifier !== this.sessionIdentifier) {
            debug(`Received unknown session Identifier with request to ${SessionControlCommand[requestType]}`);
            callback(-70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */);
            return;
        }
        this.selectedConfiguration = value;
        // intercept the callback chain to check if an error occurred.
        const streamCallback = (error, writeResponse) => {
            callback(error, writeResponse); // does not support writeResponse, but how knows what comes in the future.
            if (error) {
                this.handleSessionClosed();
            }
        };
        switch (requestType) {
            case SessionControlCommand.START_SESSION: {
                const selectedVideoParameters = tlv.decode(objects[2 /* SelectedRTPStreamConfigurationTypes.SELECTED_VIDEO_PARAMETERS */]);
                const selectedAudioParameters = tlv.decode(objects[3 /* SelectedRTPStreamConfigurationTypes.SELECTED_AUDIO_PARAMETERS */]);
                this._handleStartStream(selectedVideoParameters, selectedAudioParameters, streamCallback);
                break;
            }
            case SessionControlCommand.RECONFIGURE_SESSION: {
                const reconfiguredVideoParameters = tlv.decode(objects[2 /* SelectedRTPStreamConfigurationTypes.SELECTED_VIDEO_PARAMETERS */]);
                this.handleReconfigureStream(reconfiguredVideoParameters, streamCallback);
                break;
            }
            case SessionControlCommand.END_SESSION:
                this._handleStopStream(streamCallback);
                break;
            case SessionControlCommand.RESUME_SESSION:
            case SessionControlCommand.SUSPEND_SESSION:
            default:
                debug(`Unhandled request type ${SessionControlCommand[requestType]}`);
                callback(-70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */);
                return;
        }
    }
    _handleStartStream(videoConfiguration, audioConfiguration, callback) {
        try {
            this._handleStartStreamInner(videoConfiguration, audioConfiguration, callback);
        }
        catch (error) {
            debug("Failed to parse stream start request: %s", error.message);
            callback(-70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */);
        }
    }
    _handleStartStreamInner(videoConfiguration, audioConfiguration, callback) {
        // selected video configuration
        // noinspection JSUnusedLocalSymbols
        const videoCodec = videoConfiguration[1 /* SelectedVideoParametersTypes.CODEC_TYPE */]; // always 0x00 for h264
        const videoParametersTLV = videoConfiguration[2 /* SelectedVideoParametersTypes.CODEC_PARAMETERS */];
        const videoAttributesTLV = videoConfiguration[3 /* SelectedVideoParametersTypes.ATTRIBUTES */];
        const videoRTPParametersTLV = videoConfiguration[4 /* SelectedVideoParametersTypes.RTP_PARAMETERS */];
        // video parameters
        const videoParameters = tlv.decode(videoParametersTLV);
        const h264Profile = videoParameters[1 /* VideoCodecParametersTypes.PROFILE_ID */][0];
        const h264Level = videoParameters[2 /* VideoCodecParametersTypes.LEVEL */][0];
        const packetizationMode = videoParameters[3 /* VideoCodecParametersTypes.PACKETIZATION_MODE */][0];
        const cvoEnabled = videoParameters[4 /* VideoCodecParametersTypes.CVO_ENABLED */];
        let cvoId = undefined;
        if (cvoEnabled && cvoEnabled[0] === 1 /* VideoCodecCVO.SUPPORTED */) {
            cvoId = videoParameters[5 /* VideoCodecParametersTypes.CVO_ID */].readUInt8(0);
        }
        // video attributes
        const videoAttributes = tlv.decode(videoAttributesTLV);
        const width = videoAttributes[1 /* VideoAttributesTypes.IMAGE_WIDTH */].readUInt16LE(0);
        const height = videoAttributes[2 /* VideoAttributesTypes.IMAGE_HEIGHT */].readUInt16LE(0);
        const frameRate = videoAttributes[3 /* VideoAttributesTypes.FRAME_RATE */].readUInt8(0);
        // video rtp parameters
        const videoRTPParameters = tlv.decode(videoRTPParametersTLV);
        const videoPayloadType = videoRTPParameters[1 /* VideoRTPParametersTypes.PAYLOAD_TYPE */].readUInt8(0); // 99
        const videoSSRC = videoRTPParameters[2 /* VideoRTPParametersTypes.SYNCHRONIZATION_SOURCE */].readUInt32LE(0);
        const videoMaximumBitrate = videoRTPParameters[3 /* VideoRTPParametersTypes.MAX_BIT_RATE */].readUInt16LE(0);
        const videoRTCPInterval = videoRTPParameters[4 /* VideoRTPParametersTypes.MIN_RTCP_INTERVAL */].readFloatLE(0);
        let maxMTU = this.ipVersion === "ipv6" ? 1228 : 1378; // default values ipv4: 1378 bytes; ipv6: 1228 bytes
        if (videoRTPParameters[5 /* VideoRTPParametersTypes.MAX_MTU */]) {
            maxMTU = videoRTPParameters[5 /* VideoRTPParametersTypes.MAX_MTU */].readUInt16LE(0);
        }
        // selected audio configuration
        const audioCodec = audioConfiguration[1 /* SelectedAudioParametersTypes.CODEC_TYPE */][0];
        const audioParametersTLV = audioConfiguration[2 /* SelectedAudioParametersTypes.CODEC_PARAMETERS */];
        const audioRTPParametersTLV = audioConfiguration[3 /* SelectedAudioParametersTypes.RTP_PARAMETERS */];
        const comfortNoise = !!audioConfiguration[4 /* SelectedAudioParametersTypes.COMFORT_NOISE */].readUInt8(0);
        // audio parameters
        const audioParameters = tlv.decode(audioParametersTLV);
        const channels = audioParameters[1 /* AudioCodecParametersTypes.CHANNEL */][0];
        const audioBitrate = audioParameters[2 /* AudioCodecParametersTypes.BIT_RATE */][0];
        const samplerate = audioParameters[3 /* AudioCodecParametersTypes.SAMPLE_RATE */][0];
        const rtpPacketTime = audioParameters[4 /* AudioCodecParametersTypes.PACKET_TIME */].readUInt8(0);
        // audio rtp parameters
        const audioRTPParameters = tlv.decode(audioRTPParametersTLV);
        const audioPayloadType = audioRTPParameters[1 /* AudioRTPParametersTypes.PAYLOAD_TYPE */].readUInt8(0); // 110
        const audioSSRC = audioRTPParameters[2 /* AudioRTPParametersTypes.SYNCHRONIZATION_SOURCE */].readUInt32LE(0);
        const audioMaximumBitrate = audioRTPParameters[3 /* AudioRTPParametersTypes.MAX_BIT_RATE */].readUInt16LE(0);
        const audioRTCPInterval = audioRTPParameters[4 /* AudioRTPParametersTypes.MIN_RTCP_INTERVAL */].readFloatLE(0);
        const comfortNoisePayloadType = audioRTPParameters[6 /* AudioRTPParametersTypes.COMFORT_NOISE_PAYLOAD_TYPE */].readUInt8(0); // 13
        if (this.requireProxy) {
            this.videoProxy.setOutgoingPayloadType(videoPayloadType);
            if (!this.disableAudioProxy) {
                this.audioProxy.setOutgoingPayloadType(audioPayloadType);
            }
        }
        const videoInfo = {
            codec: videoCodec.readUInt8(0),
            profile: h264Profile,
            level: h264Level,
            packetizationMode: packetizationMode,
            cvoId: cvoId,
            width: width,
            height: height,
            fps: frameRate,
            pt: videoPayloadType,
            ssrc: videoSSRC,
            max_bit_rate: videoMaximumBitrate,
            rtcp_interval: videoRTCPInterval,
            mtu: maxMTU,
        };
        let audioCodecName;
        let samplerateNum;
        switch (audioCodec) {
            case 0 /* AudioCodecTypes.PCMU */:
                audioCodecName = "PCMU" /* AudioStreamingCodecType.PCMU */;
                break;
            case 1 /* AudioCodecTypes.PCMA */:
                audioCodecName = "PCMA" /* AudioStreamingCodecType.PCMA */;
                break;
            case 2 /* AudioCodecTypes.AAC_ELD */:
                audioCodecName = "AAC-eld" /* AudioStreamingCodecType.AAC_ELD */;
                break;
            case 3 /* AudioCodecTypes.OPUS */:
                audioCodecName = "OPUS" /* AudioStreamingCodecType.OPUS */;
                break;
            case 4 /* AudioCodecTypes.MSBC */:
                audioCodecName = "mSBC" /* AudioStreamingCodecType.MSBC */;
                break;
            case 5 /* AudioCodecTypes.AMR */:
                audioCodecName = "AMR" /* AudioStreamingCodecType.AMR */;
                break;
            case 6 /* AudioCodecTypes.AMR_WB */:
                audioCodecName = "AMR-WB" /* AudioStreamingCodecType.AMR_WB */;
                break;
            default:
                throw new Error(`Encountered unknown selected audio codec ${audioCodec}`);
        }
        switch (samplerate) {
            case 0 /* AudioSamplerate.KHZ_8 */:
                samplerateNum = 8;
                break;
            case 1 /* AudioSamplerate.KHZ_16 */:
                samplerateNum = 16;
                break;
            case 2 /* AudioSamplerate.KHZ_24 */:
                samplerateNum = 24;
                break;
            default:
                throw new Error(`Encountered unknown selected audio samplerate ${samplerate}`);
        }
        const audioInfo = {
            codec: audioCodecName,
            channel: channels,
            bit_rate: audioBitrate,
            sample_rate: samplerateNum,
            packet_time: rtpPacketTime,
            pt: audioPayloadType,
            ssrc: audioSSRC,
            max_bit_rate: audioMaximumBitrate,
            rtcp_interval: audioRTCPInterval,
            comfort_pt: comfortNoisePayloadType,
            comfortNoiseEnabled: comfortNoise,
        };
        const request = {
            sessionID: this.sessionIdentifier,
            type: "start" /* StreamRequestTypes.START */,
            video: videoInfo,
            audio: audioInfo,
        };
        this.delegate.handleStreamRequest(request, error => callback(error));
    }
    handleReconfigureStream(videoConfiguration, callback) {
        // selected video configuration
        const videoAttributesTLV = videoConfiguration[3 /* SelectedVideoParametersTypes.ATTRIBUTES */];
        const videoRTPParametersTLV = videoConfiguration[4 /* SelectedVideoParametersTypes.RTP_PARAMETERS */];
        // video attributes
        const videoAttributes = tlv.decode(videoAttributesTLV);
        const width = videoAttributes[1 /* VideoAttributesTypes.IMAGE_WIDTH */].readUInt16LE(0);
        const height = videoAttributes[2 /* VideoAttributesTypes.IMAGE_HEIGHT */].readUInt16LE(0);
        const frameRate = videoAttributes[3 /* VideoAttributesTypes.FRAME_RATE */].readUInt8(0);
        // video rtp parameters
        const videoRTPParameters = tlv.decode(videoRTPParametersTLV);
        const videoMaximumBitrate = videoRTPParameters[3 /* VideoRTPParametersTypes.MAX_BIT_RATE */].readUInt16LE(0);
        // seems to be always zero, use default of 0.5
        const videoRTCPInterval = videoRTPParameters[4 /* VideoRTPParametersTypes.MIN_RTCP_INTERVAL */].readFloatLE(0) || 0.5;
        const reconfiguredVideoInfo = {
            width: width,
            height: height,
            fps: frameRate,
            max_bit_rate: videoMaximumBitrate,
            rtcp_interval: videoRTCPInterval,
        };
        const request = {
            sessionID: this.sessionIdentifier,
            type: "reconfigure" /* StreamRequestTypes.RECONFIGURE */,
            video: reconfiguredVideoInfo,
        };
        this.delegate.handleStreamRequest(request, error => callback(error));
    }
    _handleStopStream(callback) {
        const request = {
            sessionID: this.sessionIdentifier, // save sessionIdentifier before handleSessionClosed is called
            type: "stop" /* StreamRequestTypes.STOP */,
        };
        this.handleSessionClosed();
        this.delegate.handleStreamRequest(request, error => callback ? callback(error) : undefined);
    }
    handleSetupEndpoints(value, callback, connection) {
        if (this.streamingIsDisabled(callback)) {
            return;
        }
        const data = Buffer.from(value, "base64");
        const objects = tlv.decode(data);
        const sessionIdentifier = uuid.unparse(objects[1 /* SetupEndpointsTypes.SESSION_ID */]);
        if (this.streamStatus !== 0 /* StreamingStatus.AVAILABLE */) {
            this.setupEndpointsResponse = tlv.encode(1 /* SetupEndpointsResponseTypes.SESSION_ID */, uuid.write(sessionIdentifier), 2 /* SetupEndpointsResponseTypes.STATUS */, 1 /* SetupEndpointsStatus.BUSY */).toString("base64");
            callback();
            return;
        }
        (0, assert_1.default)(this.activeConnection == null, "Found non-nil `activeConnection` when trying to setup streaming endpoints, even though streamStatus is reported to be AVAILABLE!");
        this.activeConnection = connection;
        this.activeConnection.setMaxListeners(this.activeConnection.getMaxListeners() + 1);
        this.activeConnection.on("closed" /* HAPConnectionEvent.CLOSED */, this.activeConnectionClosedListener);
        this.sessionIdentifier = sessionIdentifier;
        this._updateStreamStatus(1 /* StreamingStatus.IN_USE */);
        // Address
        const targetAddressPayload = objects[3 /* SetupEndpointsTypes.CONTROLLER_ADDRESS */];
        const processedAddressInfo = tlv.decode(targetAddressPayload);
        const addressVersion = processedAddressInfo[1 /* AddressTypes.ADDRESS_VERSION */][0];
        const controllerAddress = processedAddressInfo[2 /* AddressTypes.ADDRESS */].toString("utf8");
        const targetVideoPort = processedAddressInfo[3 /* AddressTypes.VIDEO_RTP_PORT */].readUInt16LE(0);
        const targetAudioPort = processedAddressInfo[4 /* AddressTypes.AUDIO_RTP_PORT */].readUInt16LE(0);
        // Video SRTP Params
        const videoSRTPPayload = objects[4 /* SetupEndpointsTypes.VIDEO_SRTP_PARAMETERS */];
        const processedVideoInfo = tlv.decode(videoSRTPPayload);
        const videoCryptoSuite = processedVideoInfo[1 /* SRTPParametersTypes.SRTP_CRYPTO_SUITE */][0];
        const videoMasterKey = processedVideoInfo[2 /* SRTPParametersTypes.MASTER_KEY */];
        const videoMasterSalt = processedVideoInfo[3 /* SRTPParametersTypes.MASTER_SALT */];
        // Audio SRTP Params
        const audioSRTPPayload = objects[5 /* SetupEndpointsTypes.AUDIO_SRTP_PARAMETERS */];
        const processedAudioInfo = tlv.decode(audioSRTPPayload);
        const audioCryptoSuite = processedAudioInfo[1 /* SRTPParametersTypes.SRTP_CRYPTO_SUITE */][0];
        const audioMasterKey = processedAudioInfo[2 /* SRTPParametersTypes.MASTER_KEY */];
        const audioMasterSalt = processedAudioInfo[3 /* SRTPParametersTypes.MASTER_SALT */];
        debug("Session: ", sessionIdentifier, "\nControllerAddress: ", controllerAddress, "\nVideoPort: ", targetVideoPort, "\nAudioPort: ", targetAudioPort, "\nVideo Crypto: ", videoCryptoSuite, "\nVideo Master Key: ", videoMasterKey, "\nVideo Master Salt: ", videoMasterSalt, "\nAudio Crypto: ", audioCryptoSuite, "\nAudio Master Key: ", audioMasterKey, "\nAudio Master Salt: ", audioMasterSalt);
        const prepareRequest = {
            sessionID: sessionIdentifier,
            sourceAddress: connection.localAddress,
            targetAddress: controllerAddress,
            addressVersion: addressVersion === 1 /* IPAddressVersion.IPV6 */ ? "ipv6" : "ipv4",
            video: {
                port: targetVideoPort,
                srtpCryptoSuite: videoCryptoSuite,
                srtp_key: videoMasterKey,
                srtp_salt: videoMasterSalt,
            },
            audio: {
                port: targetAudioPort,
                srtpCryptoSuite: audioCryptoSuite,
                srtp_key: audioMasterKey,
                srtp_salt: audioMasterSalt,
            },
        };
        const promises = [];
        if (this.requireProxy) {
            prepareRequest.targetAddress = connection.getLocalAddress(addressVersion === 1 /* IPAddressVersion.IPV6 */ ? "ipv6" : "ipv4"); // ip versions must be the same
            this.videoProxy = new RTPProxy_1.default({
                outgoingAddress: controllerAddress,
                outgoingPort: targetVideoPort,
                outgoingSSRC: crypto_1.default.randomBytes(4).readUInt32LE(0), // videoSSRC
                disabled: false,
            });
            promises.push(this.videoProxy.setup().then(() => {
                prepareRequest.video.proxy_rtp = this.videoProxy.incomingRTPPort();
                prepareRequest.video.proxy_rtcp = this.videoProxy.incomingRTCPPort();
            }));
            if (!this.disableAudioProxy) {
                this.audioProxy = new RTPProxy_1.default({
                    outgoingAddress: controllerAddress,
                    outgoingPort: targetAudioPort,
                    outgoingSSRC: crypto_1.default.randomBytes(4).readUInt32LE(0), // audioSSRC
                    disabled: this.videoOnly,
                });
                promises.push(this.audioProxy.setup().then(() => {
                    prepareRequest.audio.proxy_rtp = this.audioProxy.incomingRTPPort();
                    prepareRequest.audio.proxy_rtcp = this.audioProxy.incomingRTCPPort();
                }));
            }
        }
        Promise.all(promises).then(() => {
            this.delegate.prepareStream(prepareRequest, (0, once_1.once)((error, response) => {
                if (error || !response) {
                    debug(`PrepareStream request encountered an error: ${error ? error.message : undefined}`);
                    this.setupEndpointsResponse = tlv.encode(1 /* SetupEndpointsResponseTypes.SESSION_ID */, uuid.write(sessionIdentifier), 2 /* SetupEndpointsResponseTypes.STATUS */, 2 /* SetupEndpointsStatus.ERROR */).toString("base64");
                    this.handleSessionClosed();
                    callback(error);
                }
                else {
                    this.generateSetupEndpointResponse(connection, sessionIdentifier, prepareRequest, response, callback);
                }
            }));
        }).catch((error) => {
            debug(`RTP proxy setup failed: ${error.message}`);
            this.setupEndpointsResponse = tlv.encode(1 /* SetupEndpointsResponseTypes.SESSION_ID */, uuid.write(sessionIdentifier), 2 /* SetupEndpointsResponseTypes.STATUS */, 2 /* SetupEndpointsStatus.ERROR */).toString("base64");
            this.handleSessionClosed();
            callback(error);
        });
    }
    generateSetupEndpointResponse(connection, identifier, request, response, callback) {
        let address;
        let addressVersion = request.addressVersion;
        let videoPort;
        let audioPort;
        let videoCryptoSuite;
        let videoSRTPKey;
        let videoSRTPSalt;
        let audioCryptoSuite;
        let audioSRTPKey;
        let audioSRTPSalt;
        let videoSSRC;
        let audioSSRC;
        if (!this.videoOnly && !response.audio) {
            throw new Error("Audio was enabled but not supplied in PrepareStreamResponse!");
        }
        // Provide default values if audio was not supplied
        const audio = response.audio || {
            port: request.audio.port,
            ssrc: controller_1.CameraController.generateSynchronisationSource(),
            srtp_key: request.audio.srtp_key,
            srtp_salt: request.audio.srtp_salt,
        };
        if (!this.requireProxy) {
            const videoInfo = response.video;
            const audioInfo = audio;
            if (response.addressOverride) {
                addressVersion = net_1.default.isIPv4(response.addressOverride) ? "ipv4" : "ipv6";
                address = response.addressOverride;
            }
            else {
                address = connection.getLocalAddress(addressVersion);
            }
            if (request.addressVersion !== addressVersion) {
                throw new Error(`Incoming and outgoing ip address versions must match! Expected ${request.addressVersion} but got ${addressVersion}`);
            }
            videoPort = videoInfo.port;
            audioPort = audioInfo.port;
            if (request.video.srtpCryptoSuite !== 2 /* SRTPCryptoSuites.NONE */
                && (videoInfo.srtp_key === undefined || videoInfo.srtp_salt === undefined)) {
                throw new Error("SRTP was selected for the prepared video stream, but no 'srtp_key' or 'srtp_salt' was specified!");
            }
            if (request.audio.srtpCryptoSuite !== 2 /* SRTPCryptoSuites.NONE */
                && (audioInfo.srtp_key === undefined || audioInfo.srtp_salt === undefined)) {
                throw new Error("SRTP was selected for the prepared audio stream, but no 'srtp_key' or 'srtp_salt' was specified!");
            }
            videoCryptoSuite = request.video.srtpCryptoSuite;
            videoSRTPKey = videoInfo.srtp_key || Buffer.alloc(0); // key and salt are zero-length for cryptoSuite = NONE
            videoSRTPSalt = videoInfo.srtp_salt || Buffer.alloc(0);
            audioCryptoSuite = request.audio.srtpCryptoSuite;
            audioSRTPKey = audioInfo.srtp_key || Buffer.alloc(0); // key and salt are zero-length for cryptoSuite = NONE
            audioSRTPSalt = audioInfo.srtp_salt || Buffer.alloc(0);
            videoSSRC = videoInfo.ssrc;
            audioSSRC = audioInfo.ssrc;
        }
        else {
            const videoInfo = response.video;
            address = connection.getLocalAddress(request.addressVersion);
            videoCryptoSuite = 2 /* SRTPCryptoSuites.NONE */;
            videoSRTPKey = Buffer.alloc(0);
            videoSRTPSalt = Buffer.alloc(0);
            audioCryptoSuite = 2 /* SRTPCryptoSuites.NONE */;
            audioSRTPKey = Buffer.alloc(0);
            audioSRTPSalt = Buffer.alloc(0);
            this.videoProxy.setIncomingPayloadType(videoInfo.proxy_pt);
            this.videoProxy.setServerAddress(videoInfo.proxy_server_address);
            this.videoProxy.setServerRTPPort(videoInfo.proxy_server_rtp);
            this.videoProxy.setServerRTCPPort(videoInfo.proxy_server_rtcp);
            videoPort = this.videoProxy.outgoingLocalPort();
            videoSSRC = this.videoProxy.outgoingSSRC;
            if (!this.disableAudioProxy) {
                const audioInfo = response.audio;
                this.audioProxy.setIncomingPayloadType(audioInfo.proxy_pt);
                this.audioProxy.setServerAddress(audioInfo.proxy_server_address);
                this.audioProxy.setServerRTPPort(audioInfo.proxy_server_rtp);
                this.audioProxy.setServerRTCPPort(audioInfo.proxy_server_rtcp);
                audioPort = this.audioProxy.outgoingLocalPort();
                audioSSRC = this.audioProxy.outgoingSSRC;
            }
            else {
                const audioInfo = response.audio;
                audioPort = audioInfo.port;
                audioSSRC = audioInfo.ssrc;
            }
        }
        this.ipVersion = addressVersion; // we need to save this in order to calculate some default mtu values later
        const accessoryAddress = tlv.encode(1 /* AddressTypes.ADDRESS_VERSION */, addressVersion === "ipv4" ? 0 /* IPAddressVersion.IPV4 */ : 1 /* IPAddressVersion.IPV6 */, 2 /* AddressTypes.ADDRESS */, address, 3 /* AddressTypes.VIDEO_RTP_PORT */, tlv.writeUInt16(videoPort), 4 /* AddressTypes.AUDIO_RTP_PORT */, tlv.writeUInt16(audioPort));
        const videoSRTPParameters = tlv.encode(1 /* SRTPParametersTypes.SRTP_CRYPTO_SUITE */, videoCryptoSuite, 2 /* SRTPParametersTypes.MASTER_KEY */, videoSRTPKey, 3 /* SRTPParametersTypes.MASTER_SALT */, videoSRTPSalt);
        const audioSRTPParameters = tlv.encode(1 /* SRTPParametersTypes.SRTP_CRYPTO_SUITE */, audioCryptoSuite, 2 /* SRTPParametersTypes.MASTER_KEY */, audioSRTPKey, 3 /* SRTPParametersTypes.MASTER_SALT */, audioSRTPSalt);
        this.setupEndpointsResponse = tlv.encode(1 /* SetupEndpointsResponseTypes.SESSION_ID */, uuid.write(identifier), 2 /* SetupEndpointsResponseTypes.STATUS */, 0 /* SetupEndpointsStatus.SUCCESS */, 3 /* SetupEndpointsResponseTypes.ACCESSORY_ADDRESS */, accessoryAddress, 4 /* SetupEndpointsResponseTypes.VIDEO_SRTP_PARAMETERS */, videoSRTPParameters, 5 /* SetupEndpointsResponseTypes.AUDIO_SRTP_PARAMETERS */, audioSRTPParameters, 6 /* SetupEndpointsResponseTypes.VIDEO_SSRC */, tlv.writeUInt32(videoSSRC), 7 /* SetupEndpointsResponseTypes.AUDIO_SSRC */, tlv.writeUInt32(audioSSRC)).toString("base64");
        callback();
    }
    _updateStreamStatus(status) {
        this.streamStatus = status;
        this.service.updateCharacteristic(Characteristic_1.Characteristic.StreamingStatus, tlv.encode(1 /* StreamingStatusTypes.STATUS */, this.streamStatus).toString("base64"));
    }
    static _supportedRTPConfiguration(supportedCryptoSuites) {
        if (supportedCryptoSuites.length === 1 && supportedCryptoSuites[0] === 2 /* SRTPCryptoSuites.NONE */) {
            debug("Client claims it doesn't support SRTP. The stream may stops working with future iOS releases.");
        }
        return tlv.encode(2 /* SupportedRTPConfigurationTypes.SRTP_CRYPTO_SUITE */, supportedCryptoSuites).toString("base64");
    }
    static _supportedVideoStreamConfiguration(videoOptions) {
        if (!videoOptions.codec) {
            throw new Error("Video codec cannot be undefined");
        }
        if (!videoOptions.resolutions) {
            throw new Error("Video resolutions cannot be undefined");
        }
        let codecParameters = tlv.encode(1 /* VideoCodecParametersTypes.PROFILE_ID */, videoOptions.codec.profiles, 2 /* VideoCodecParametersTypes.LEVEL */, videoOptions.codec.levels, 3 /* VideoCodecParametersTypes.PACKETIZATION_MODE */, 0 /* VideoCodecPacketizationMode.NON_INTERLEAVED */);
        if (videoOptions.cvoId != null) {
            codecParameters = Buffer.concat([
                codecParameters,
                tlv.encode(4 /* VideoCodecParametersTypes.CVO_ENABLED */, 1 /* VideoCodecCVO.SUPPORTED */, 5 /* VideoCodecParametersTypes.CVO_ID */, videoOptions.cvoId),
            ]);
        }
        const videoStreamConfiguration = tlv.encode(1 /* VideoCodecConfigurationTypes.CODEC_TYPE */, 0 /* VideoCodecType.H264 */, 2 /* VideoCodecConfigurationTypes.CODEC_PARAMETERS */, codecParameters, 3 /* VideoCodecConfigurationTypes.ATTRIBUTES */, videoOptions.resolutions.map(resolution => {
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
        return tlv.encode(1 /* SupportedVideoStreamConfigurationTypes.VIDEO_CODEC_CONFIGURATION */, videoStreamConfiguration).toString("base64");
    }
    checkForLegacyAudioCodecRepresentation(codecs) {
        const codecMap = {};
        codecs.slice().forEach(codec => {
            const previous = codecMap[codec.type];
            if (previous) {
                if (typeof previous.samplerate === "number") {
                    previous.samplerate = [previous.samplerate];
                }
                previous.samplerate = previous.samplerate.concat(codec.samplerate);
                const index = codecs.indexOf(codec);
                if (index >= 0) {
                    codecs.splice(index, 1);
                }
            }
            else {
                codecMap[codec.type] = codec;
            }
        });
    }
    _supportedAudioStreamConfiguration(audioOptions) {
        // Only AAC-ELD and OPUS are accepted by iOS currently, and we need to give it something it will accept
        // for it to start the video stream.
        const comfortNoise = audioOptions && !!audioOptions.comfort_noise;
        const supportedCodecs = (audioOptions && audioOptions.codecs) || [];
        this.checkForLegacyAudioCodecRepresentation(supportedCodecs);
        if (supportedCodecs.length === 0) { // Fake a Codec if we haven't got anything
            debug("Client doesn't support any audio codec that HomeKit supports.");
            this.videoOnly = true;
            supportedCodecs.push({
                type: "OPUS" /* AudioStreamingCodecType.OPUS */, // Opus @16K required by Apple Watch AFAIK
                samplerate: [16 /* AudioStreamingSamplerate.KHZ_16 */, 24 /* AudioStreamingSamplerate.KHZ_24 */], // 16 and 24 must be supported
            });
        }
        const codecConfigurations = supportedCodecs.map(codec => {
            let type;
            switch (codec.type) {
                case "OPUS" /* AudioStreamingCodecType.OPUS */:
                    type = 3 /* AudioCodecTypes.OPUS */;
                    break;
                case "AAC-eld" /* AudioStreamingCodecType.AAC_ELD */:
                    type = 2 /* AudioCodecTypes.AAC_ELD */;
                    break;
                case "PCMA" /* AudioStreamingCodecType.PCMA */:
                    type = 1 /* AudioCodecTypes.PCMA */;
                    break;
                case "PCMU" /* AudioStreamingCodecType.PCMU */:
                    type = 0 /* AudioCodecTypes.PCMU */;
                    break;
                case "mSBC" /* AudioStreamingCodecType.MSBC */:
                    type = 4 /* AudioCodecTypes.MSBC */;
                    break;
                case "AMR" /* AudioStreamingCodecType.AMR */:
                    type = 5 /* AudioCodecTypes.AMR */;
                    break;
                case "AMR-WB" /* AudioStreamingCodecType.AMR_WB */:
                    type = 6 /* AudioCodecTypes.AMR_WB */;
                    break;
                default:
                    throw new Error("Unsupported codec: " + codec.type);
            }
            const providedSamplerates = (typeof codec.samplerate === "number" ? [codec.samplerate] : codec.samplerate).map(rate => {
                let samplerate;
                switch (rate) {
                    case 8 /* AudioStreamingSamplerate.KHZ_8 */:
                        samplerate = 0 /* AudioSamplerate.KHZ_8 */;
                        break;
                    case 16 /* AudioStreamingSamplerate.KHZ_16 */:
                        samplerate = 1 /* AudioSamplerate.KHZ_16 */;
                        break;
                    case 24 /* AudioStreamingSamplerate.KHZ_24 */:
                        samplerate = 2 /* AudioSamplerate.KHZ_24 */;
                        break;
                    default:
                        console.log("Unsupported sample rate: ", codec.samplerate);
                        samplerate = -1;
                }
                return samplerate;
            }).filter(rate => rate !== -1);
            if (providedSamplerates.length === 0) {
                throw new Error("Audio samplerate cannot be empty!");
            }
            const audioParameters = tlv.encode(1 /* AudioCodecParametersTypes.CHANNEL */, Math.max(1, codec.audioChannels || 1), 2 /* AudioCodecParametersTypes.BIT_RATE */, codec.bitrate || 0 /* AudioBitrate.VARIABLE */, 3 /* AudioCodecParametersTypes.SAMPLE_RATE */, providedSamplerates);
            return tlv.encode(1 /* AudioCodecConfigurationTypes.CODEC_TYPE */, type, 2 /* AudioCodecConfigurationTypes.CODEC_PARAMETERS */, audioParameters);
        });
        return tlv.encode(1 /* SupportedAudioStreamConfigurationTypes.AUDIO_CODEC_CONFIGURATION */, codecConfigurations, 2 /* SupportedAudioStreamConfigurationTypes.COMFORT_NOISE_SUPPORT */, comfortNoise ? 1 : 0).toString("base64");
    }
    resetSetupEndpointsResponse() {
        this.setupEndpointsResponse = tlv.encode(2 /* SetupEndpointsResponseTypes.STATUS */, 2 /* SetupEndpointsStatus.ERROR */).toString("base64");
        this.service.updateCharacteristic(Characteristic_1.Characteristic.SetupEndpoints, this.setupEndpointsResponse);
    }
    resetSelectedStreamConfiguration() {
        this.selectedConfiguration = tlv.encode(1 /* SelectedRTPStreamConfigurationTypes.SESSION_CONTROL */, tlv.encode(2 /* SessionControlTypes.COMMAND */, SessionControlCommand.SUSPEND_SESSION)).toString("base64");
        this.service.updateCharacteristic(Characteristic_1.Characteristic.SelectedRTPStreamConfiguration, this.selectedConfiguration);
    }
    /**
     * @private
     */
    serialize() {
        const characteristicValue = this.service.getCharacteristic(Characteristic_1.Characteristic.Active).value;
        if (characteristicValue === true) {
            return undefined;
        }
        return {
            id: this.id,
            active: !!characteristicValue,
        };
    }
    /**
     * @private
     */
    deserialize(serialized) {
        (0, assert_1.default)(serialized.id === this.id, `Tried to initialize RTPStreamManagement ${this.id} with data from management with id ${serialized.id}!`);
        this.service.updateCharacteristic(Characteristic_1.Characteristic.Active, serialized.active);
    }
    /**
     * @private
     */
    setupStateChangeDelegate(delegate) {
        this.stateChangeDelegate = delegate;
    }
}
exports.RTPStreamManagement = RTPStreamManagement;
//# sourceMappingURL=RTPStreamManagement.js.map