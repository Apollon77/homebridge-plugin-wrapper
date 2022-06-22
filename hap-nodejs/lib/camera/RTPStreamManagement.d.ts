/// <reference types="node" />
import { LegacyCameraSource, ResourceRequestReason, StateChangeDelegate } from "../../index";
import { SessionIdentifier } from "../../types";
import { CameraStreamingDelegate } from "../controller";
import type { CameraRTPStreamManagement } from "../definitions";
import RTPProxy from "./RTPProxy";
declare const enum StreamingStatus {
    AVAILABLE = 0,
    IN_USE = 1,
    UNAVAILABLE = 2
}
export declare const enum VideoCodecType {
    H264 = 0
}
export declare const enum H264Profile {
    BASELINE = 0,
    MAIN = 1,
    HIGH = 2
}
export declare const enum H264Level {
    LEVEL3_1 = 0,
    LEVEL3_2 = 1,
    LEVEL4_0 = 2
}
declare const enum VideoCodecPacketizationMode {
    NON_INTERLEAVED = 0
}
declare const enum AudioBitrate {
    VARIABLE = 0,
    CONSTANT = 1
}
export declare const enum SRTPCryptoSuites {
    AES_CM_128_HMAC_SHA1_80 = 0,
    AES_CM_256_HMAC_SHA1_80 = 1,
    NONE = 2
}
/**
 * @deprecated renamed to {@see CameraStreamingOptions}
 */
export declare type StreamControllerOptions = CameraStreamingOptions;
export declare type CameraStreamingOptions = CameraStreamingOptionsBase & (CameraStreamingOptionsLegacySRTP | CameraStreamingOptionsSupportedCryptoSuites);
interface CameraStreamingOptionsBase {
    proxy?: boolean;
    disable_audio_proxy?: boolean;
    video: VideoStreamingOptions;
    /**
     * "audio" is optional and only needs to be declared if audio streaming is supported.
     * If defined the Microphone service will be added and Microphone volume control will be made available.
     * If not defined hap-nodejs will expose a default codec in order for the video stream to work
     */
    audio?: AudioStreamingOptions;
}
interface CameraStreamingOptionsLegacySRTP {
    srtp: boolean;
}
interface CameraStreamingOptionsSupportedCryptoSuites {
    supportedCryptoSuites: SRTPCryptoSuites[];
}
export declare type VideoStreamingOptions = {
    codec: H264CodecParameters;
    resolutions: Resolution[];
    cvoId?: number;
};
export interface H264CodecParameters {
    levels: H264Level[];
    profiles: H264Profile[];
}
export declare type Resolution = [number, number, number];
export declare type AudioStreamingOptions = {
    codecs: AudioStreamingCodec[];
    twoWayAudio?: boolean;
    comfort_noise?: boolean;
};
export declare type AudioStreamingCodec = {
    type: AudioStreamingCodecType | string;
    audioChannels?: number;
    bitrate?: AudioBitrate;
    samplerate: AudioStreamingSamplerate[] | AudioStreamingSamplerate;
};
export declare const enum AudioStreamingCodecType {
    PCMU = "PCMU",
    PCMA = "PCMA",
    AAC_ELD = "AAC-eld",
    OPUS = "OPUS",
    MSBC = "mSBC",
    AMR = "AMR",
    AMR_WB = "AMR-WB"
}
export declare const enum AudioStreamingSamplerate {
    KHZ_8 = 8,
    KHZ_16 = 16,
    KHZ_24 = 24
}
export declare type StreamSessionIdentifier = string;
export declare type SnapshotRequest = {
    height: number;
    width: number;
    /**
     * An optional {@link ResourceRequestReason}. The client decides if it wants to send this value. It is typically
     * only sent in the context of HomeKit Secure Video Cameras.
     * This value might be used by a `CameraStreamingDelegate` for informational purposes.
     * When `handleSnapshotRequest` is called, it is already checked if the respective reason is allowed in the current camera configuration.
     */
    reason?: ResourceRequestReason;
};
export declare type PrepareStreamRequest = {
    sessionID: StreamSessionIdentifier;
    targetAddress: string;
    addressVersion: "ipv4" | "ipv6";
    audio: Source;
    video: Source;
};
export declare type Source = {
    port: number;
    srtpCryptoSuite: SRTPCryptoSuites;
    srtp_key: Buffer;
    srtp_salt: Buffer;
    proxy_rtp?: number;
    proxy_rtcp?: number;
};
export declare type PrepareStreamResponse = {
    /**
     * @deprecated The local ip address will be automatically determined by HAP-NodeJS.
     *   Any value set will be ignored. You may only still set a value to support version prior to 0.7.9
     */
    address?: string | Address;
    /**
     * Any value set to this optional property will overwrite the automatically determined local address,
     * which is sent as RTP endpoint to the iOS device.
     */
    addressOverride?: string;
    video: SourceResponse | ProxiedSourceResponse;
    audio?: SourceResponse | ProxiedSourceResponse;
};
/**
 * @deprecated just supply the address directly in {@link PrepareStreamRequest}
 */
export declare type Address = {
    address: string;
    type?: "v4" | "v6";
};
export interface SourceResponse {
    port: number;
    ssrc: number;
    srtp_key?: Buffer;
    srtp_salt?: Buffer;
}
export interface ProxiedSourceResponse {
    proxy_pt: number;
    proxy_server_address: string;
    proxy_server_rtp: number;
    proxy_server_rtcp: number;
}
export declare const enum StreamRequestTypes {
    RECONFIGURE = "reconfigure",
    START = "start",
    STOP = "stop"
}
export declare type StreamingRequest = StartStreamRequest | ReconfigureStreamRequest | StopStreamRequest;
/**
 * @deprecated replaced by {@link StreamingRequest}
 */
export declare type StreamRequest = {
    sessionID: SessionIdentifier;
    type: StreamRequestTypes;
    video?: VideoInfo;
    audio?: AudioInfo;
};
export declare type StartStreamRequest = {
    sessionID: StreamSessionIdentifier;
    type: StreamRequestTypes.START;
    video: VideoInfo;
    audio: AudioInfo;
};
export declare type ReconfigureStreamRequest = {
    sessionID: StreamSessionIdentifier;
    type: StreamRequestTypes.RECONFIGURE;
    video: ReconfiguredVideoInfo;
};
export declare type StopStreamRequest = {
    sessionID: StreamSessionIdentifier;
    type: StreamRequestTypes.STOP;
};
export declare type AudioInfo = {
    codec: AudioStreamingCodecType;
    channel: number;
    bit_rate: number;
    sample_rate: AudioStreamingSamplerate;
    packet_time: number;
    pt: number;
    ssrc: number;
    max_bit_rate: number;
    rtcp_interval: number;
    comfort_pt: number;
    comfortNoiseEnabled: boolean;
};
export declare type VideoInfo = {
    codec: VideoCodecType;
    profile: H264Profile;
    level: H264Level;
    packetizationMode: VideoCodecPacketizationMode;
    cvoId?: number;
    width: number;
    height: number;
    fps: number;
    pt: number;
    ssrc: number;
    max_bit_rate: number;
    rtcp_interval: number;
    mtu: number;
};
export declare type ReconfiguredVideoInfo = {
    width: number;
    height: number;
    fps: number;
    max_bit_rate: number;
    rtcp_interval: number;
};
export interface RTPStreamManagementState {
    id: number;
    active: boolean;
}
export declare class RTPStreamManagement {
    /**
     * @deprecated Please use the SRTPCryptoSuites const enum above.
     */
    static SRTPCryptoSuites: typeof SRTPCryptoSuites;
    /**
     * @deprecated Please use the H264Profile const enum above.
     */
    static VideoCodecParamProfileIDTypes: typeof H264Profile;
    /**
     * @deprecated won't be updated anymore. Please use the H264Level const enum above.
     */
    static VideoCodecParamLevelTypes: Readonly<{
        TYPE3_1: number;
        TYPE3_2: number;
        TYPE4_0: number;
    }>;
    private readonly id;
    private readonly delegate;
    readonly service: CameraRTPStreamManagement;
    private stateChangeDelegate?;
    requireProxy: boolean;
    disableAudioProxy: boolean;
    supportedCryptoSuites: SRTPCryptoSuites[];
    videoOnly: boolean;
    readonly supportedRTPConfiguration: string;
    readonly supportedVideoStreamConfiguration: string;
    readonly supportedAudioStreamConfiguration: string;
    /**
     * @deprecated
     */
    connectionID?: SessionIdentifier;
    private activeConnection?;
    private activeConnectionClosedListener?;
    sessionIdentifier?: StreamSessionIdentifier;
    streamStatus: StreamingStatus;
    private ipVersion?;
    selectedConfiguration: string;
    setupEndpointsResponse: string;
    audioProxy?: RTPProxy;
    videoProxy?: RTPProxy;
    /**
     * A RTPStreamManagement is considered disabled if `HomeKitCameraActive` is set to false.
     * We use a closure based approach to retrieve the value of this characteristic.
     * The characteristic is managed by the RecordingManagement.
     */
    private readonly disabledThroughOperatingMode?;
    constructor(id: number, options: CameraStreamingOptions, delegate: CameraStreamingDelegate, service?: CameraRTPStreamManagement, disabledThroughOperatingMode?: () => boolean);
    forceStop(): void;
    getService(): CameraRTPStreamManagement;
    /**
     * @deprecated
     */
    handleCloseConnection(connectionID: SessionIdentifier): void;
    handleFactoryReset(): void;
    destroy(): void;
    private constructService;
    private setupServiceHandlers;
    private handleSessionClosed;
    private streamingIsDisabled;
    private _handleSelectedStreamConfigurationWrite;
    private _handleStartStream;
    private handleReconfigureStream;
    private _handleStopStream;
    private handleSetupEndpoints;
    private generateSetupEndpointResponse;
    private _updateStreamStatus;
    private static _supportedRTPConfiguration;
    private static _supportedVideoStreamConfiguration;
    private checkForLegacyAudioCodecRepresentation;
    private _supportedAudioStreamConfiguration;
    private resetSetupEndpointsResponse;
    private resetSelectedStreamConfiguration;
    /**
     * @private
     */
    serialize(): RTPStreamManagementState | undefined;
    /**
     * @private
     */
    deserialize(serialized: RTPStreamManagementState): void;
    /**
     * @private
     */
    setupStateChangeDelegate(delegate?: StateChangeDelegate): void;
}
/**
 * @deprecated - only there for backwards compatibility, please use {@see RTPStreamManagement} directly
 */
export declare class StreamController extends RTPStreamManagement {
    /**
     *  options get saved so we can still support {@link configureCameraSource}
     */
    options: CameraStreamingOptions;
    constructor(id: number, options: CameraStreamingOptions, delegate: LegacyCameraSource, service?: CameraRTPStreamManagement);
}
export {};
//# sourceMappingURL=RTPStreamManagement.d.ts.map