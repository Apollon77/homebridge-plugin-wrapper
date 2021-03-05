/// <reference types="node" />
import { EventEmitter } from "events";
import { SessionIdentifier } from "../../types";
import { CameraStreamingOptions, PrepareStreamRequest, PrepareStreamResponse, RTPStreamManagement, SnapshotRequest, StreamingRequest } from "../camera";
import type { Doorbell, Microphone, Speaker } from "../definitions";
import { HAPStatus } from "../HAPServer";
import { Controller, ControllerIdentifier, ControllerServiceMap } from "./Controller";
export interface CameraControllerOptions {
    /**
     * Amount of parallel camera streams the accessory is capable of running.
     * As of the official HAP specification non Secure Video cameras have a minimum required amount of 2 (but 1 is also fine).
     * Secure Video cameras just expose 1 stream.
     *
     * Default value: 1
     */
    cameraStreamCount?: number;
    /**
     * Delegate which handles the actual RTP/RTCP video/audio streaming and Snapshot requests.
     */
    delegate: CameraStreamingDelegate;
    /**
     * Options regarding video/audio streaming
     */
    streamingOptions: CameraStreamingOptions;
}
export declare type SnapshotRequestCallback = (error?: Error | HAPStatus, buffer?: Buffer) => void;
export declare type PrepareStreamCallback = (error?: Error, response?: PrepareStreamResponse) => void;
export declare type StreamRequestCallback = (error?: Error) => void;
export interface CameraStreamingDelegate {
    /**
     * This method is called when a HomeKit controller requests a snapshot image for the given camera.
     * The handler must respect the desired image height and width given in the {@link SnapshotRequest}.
     * The returned Buffer (via the callback) must be encoded in jpeg.
     *
     * HAP-NodeJS will complain about slow running handlers after 5 seconds and terminate the request after 15 seconds.
     *
     * @param request - Request containing image size.
     * @param callback - Callback supplied with the resulting Buffer
     */
    handleSnapshotRequest(request: SnapshotRequest, callback: SnapshotRequestCallback): void;
    prepareStream(request: PrepareStreamRequest, callback: PrepareStreamCallback): void;
    handleStreamRequest(request: StreamingRequest, callback: StreamRequestCallback): void;
}
/**
 * @private
 */
export interface CameraControllerServiceMap extends ControllerServiceMap {
    microphone?: Microphone;
    speaker?: Speaker;
    doorbell?: Doorbell;
}
export declare const enum CameraControllerEvents {
    /**
     *  Emitted when the mute state or the volume changed. The Apple Home App typically does not set those values
     *  except the mute state. When you adjust the volume in the Camera view it will reset the muted state if it was set previously.
     *  The value of volume has nothing to do with the volume slider in the Camera view of the Home app.
     */
    MICROPHONE_PROPERTIES_CHANGED = "microphone-change",
    /**
     * Emitted when the mute state or the volume changed. The Apple Home App typically does not set those values
     * except the mute state. When you unmute the device microphone it will reset the mute state if it was set previously.
     */
    SPEAKER_PROPERTIES_CHANGED = "speaker-change"
}
export declare interface CameraController {
    on(event: "microphone-change", listener: (muted: boolean, volume: number) => void): this;
    on(event: "speaker-change", listener: (muted: boolean, volume: number) => void): this;
    emit(event: "microphone-change", muted: boolean, volume: number): boolean;
    emit(event: "speaker-change", muted: boolean, volume: number): boolean;
}
/**
 * Everything needed to expose a HomeKit Camera.
 */
export declare class CameraController extends EventEmitter implements Controller<CameraControllerServiceMap> {
    private static readonly STREAM_MANAGEMENT;
    private readonly streamCount;
    private readonly delegate;
    private readonly streamingOptions;
    private readonly legacyMode;
    /**
     * @private
     */
    streamManagements: RTPStreamManagement[];
    private microphoneService?;
    private speakerService?;
    private microphoneMuted;
    private microphoneVolume;
    private speakerMuted;
    private speakerVolume;
    constructor(options: CameraControllerOptions, legacyMode?: boolean);
    /**
     * @private
     */
    controllerId(): ControllerIdentifier;
    /**
     * Call this method if you want to forcefully suspend an ongoing streaming session.
     * This would be adequate if the the rtp server or media encoding encountered an unexpected error.
     *
     * @param sessionId {SessionIdentifier} - id of the current ongoing streaming session
     */
    forceStopStreamingSession(sessionId: SessionIdentifier): void;
    static generateSynchronisationSource(): number;
    setMicrophoneMuted(muted?: boolean): void;
    setMicrophoneVolume(volume: number): void;
    setSpeakerMuted(muted?: boolean): void;
    setSpeakerVolume(volume: number): void;
    private emitMicrophoneChange;
    private emitSpeakerChange;
    /**
     * @private
     */
    constructServices(): CameraControllerServiceMap;
    /**
     * @private
     */
    initWithServices(serviceMap: CameraControllerServiceMap): void | CameraControllerServiceMap;
    protected migrateFromDoorbell(serviceMap: ControllerServiceMap): boolean;
    /**
     * @private
     */
    configureServices(): void;
    /**
     * @private
     */
    handleControllerRemoved(): void;
    /**
     * @private
     */
    handleFactoryReset(): void;
    /**
     * @private
     */
    handleSnapshotRequest(height: number, width: number, accessoryName?: string): Promise<Buffer>;
    /**
     * @private
     */
    handleCloseConnection(sessionID: SessionIdentifier): void;
}
//# sourceMappingURL=CameraController.d.ts.map