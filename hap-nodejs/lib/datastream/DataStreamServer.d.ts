/// <reference types="node" />
import { EventEmitter } from "events";
import { Socket } from 'net';
import { HAPConnection } from "../util/eventedhttp";
import Timeout = NodeJS.Timeout;
export declare type PreparedDataStreamSession = {
    connection: HAPConnection;
    accessoryToControllerEncryptionKey: Buffer;
    controllerToAccessoryEncryptionKey: Buffer;
    accessoryKeySalt: Buffer;
    port?: number;
    connectTimeout?: Timeout;
};
export declare type PrepareSessionCallback = (error?: Error, preparedSession?: PreparedDataStreamSession) => void;
export declare type EventHandler = (message: Record<any, any>) => void;
export declare type RequestHandler = (id: number, message: Record<any, any>) => void;
export declare type ResponseHandler = (error: Error | undefined, status: HDSStatus | undefined, message: Record<any, any>) => void;
export declare type GlobalEventHandler = (connection: DataStreamConnection, message: Record<any, any>) => void;
export declare type GlobalRequestHandler = (connection: DataStreamConnection, id: number, message: Record<any, any>) => void;
export interface DataStreamProtocolHandler {
    eventHandler?: Record<string, EventHandler>;
    requestHandler?: Record<string, RequestHandler>;
}
export declare const enum Protocols {
    CONTROL = "control",
    TARGET_CONTROL = "targetControl",
    DATA_SEND = "dataSend"
}
export declare const enum Topics {
    HELLO = "hello",
    WHOAMI = "whoami",
    OPEN = "open",
    DATA = "data",
    ACK = "ack",
    CLOSE = "close"
}
export declare enum HDSStatus {
    SUCCESS = 0,
    OUT_OF_MEMORY = 1,
    TIMEOUT = 2,
    HEADER_ERROR = 3,
    PAYLOAD_ERROR = 4,
    MISSING_PROTOCOL = 5,
    PROTOCOL_SPECIFIC_ERROR = 6
}
export declare enum DataSendCloseReason {
    NORMAL = 0,
    NOT_ALLOWED = 1,
    BUSY = 2,
    CANCELLED = 3,
    UNSUPPORTED = 4,
    UNEXPECTED_FAILURE = 5,
    TIMEOUT = 6
}
declare type HDSFrame = {
    header: Buffer;
    cipheredPayload: Buffer;
    authTag: Buffer;
    plaintextPayload?: Buffer;
};
declare const enum MessageType {
    EVENT = 1,
    REQUEST = 2,
    RESPONSE = 3
}
declare type DataStreamMessage = {
    type: MessageType;
    protocol: string;
    topic: string;
    id?: number;
    status?: HDSStatus;
    message: Record<any, any>;
};
export declare const enum DataStreamServerEvent {
    /**
     * This event is emitted when a new client socket is received. At this point we have no idea to what
     * hap session this connection will be matched.
     */
    CONNECTION_OPENED = "connection-opened",
    /**
     * This event is emitted when the socket of a connection gets closed.
     */
    CONNECTION_CLOSED = "connection-closed"
}
export declare interface DataStreamServer {
    on(event: "connection-opened", listener: (connection: DataStreamConnection) => void): this;
    on(event: "connection-closed", listener: (connection: DataStreamConnection) => void): this;
    emit(event: "connection-opened", connection: DataStreamConnection): boolean;
    emit(event: "connection-closed", connection: DataStreamConnection): boolean;
}
/**
 * DataStreamServer which listens for incoming tcp connections and handles identification of new connections
 */
export declare class DataStreamServer extends EventEmitter {
    static readonly version = "1.0";
    private state;
    private static accessoryToControllerInfo;
    private static controllerToAccessoryInfo;
    private tcpServer?;
    private tcpPort?;
    preparedSessions: PreparedDataStreamSession[];
    private readonly connections;
    private removeListenersOnceClosed;
    private readonly internalEventEmitter;
    constructor();
    /**
     * Registers a new event handler to handle incoming event messages.
     * The handler is only called for a connection if for the give protocol no ProtocolHandler
     * was registered on the connection level.
     *
     * @param protocol {string | Protocols} - name of the protocol to register the handler for
     * @param event {string | Topics} - name of the event (also referred to as topic. See {Topics} for some known ones)
     * @param handler {GlobalEventHandler} - function to be called for every occurring event
     */
    onEventMessage(protocol: string | Protocols, event: string | Topics, handler: GlobalEventHandler): this;
    /**
     * Removes an registered event handler.
     *
     * @param protocol {string | Protocols} - name of the protocol to unregister the handler for
     * @param event {string | Topics} - name of the event (also referred to as topic. See {Topics} for some known ones)
     * @param handler {GlobalEventHandler} - registered event handler
     */
    removeEventHandler(protocol: string | Protocols, event: string | Topics, handler: GlobalEventHandler): this;
    /**
     * Registers a new request handler to handle incoming request messages.
     * The handler is only called for a connection if for the give protocol no ProtocolHandler
     * was registered on the connection level.
     *
     * @param protocol {string | Protocols} - name of the protocol to register the handler for
     * @param request {string | Topics} - name of the request (also referred to as topic. See {Topics} for some known ones)
     * @param handler {GlobalRequestHandler} - function to be called for every occurring request
     */
    onRequestMessage(protocol: string | Protocols, request: string | Topics, handler: GlobalRequestHandler): this;
    /**
     * Removes an registered request handler.
     *
     * @param protocol {string | Protocols} - name of the protocol to unregister the handler for
     * @param request {string | Topics} - name of the request (also referred to as topic. See {Topics} for some known ones)
     * @param handler {GlobalRequestHandler} - registered request handler
     */
    removeRequestHandler(protocol: string | Protocols, request: string | Topics, handler: GlobalRequestHandler): this;
    prepareSession(connection: HAPConnection, controllerKeySalt: Buffer, callback: PrepareSessionCallback): void;
    private timeoutPreparedSession;
    private checkTCPServerEstablished;
    private listening;
    private onConnection;
    private handleSessionIdentification;
    private handleMessageGlobally;
    private connectionClosed;
    private checkCloseable;
    /**
     * This method will fully stop the DataStreamServer
     */
    destroy(): void;
    private closed;
}
export declare type IdentificationCallback = (identifiedSession?: PreparedDataStreamSession) => void;
export declare const enum DataStreamConnectionEvent {
    /**
     * This event is emitted when the first HDSFrame is received from a new connection.
     * The connection expects the handler to identify the connection by trying to match the decryption keys.
     * If identification was successful the PreparedDataStreamSession should be supplied to the callback,
     * otherwise undefined should be supplied.
     */
    IDENTIFICATION = "identification",
    /**
     * This event is emitted when no handler could be found for the given protocol of a event or request message.
     */
    HANDLE_MESSAGE_GLOBALLY = "handle-message-globally",
    /**
     * This event is emitted when the socket of the connection was closed.
     */
    CLOSED = "closed"
}
export declare interface DataStreamConnection {
    on(event: "identification", listener: (frame: HDSFrame, callback: IdentificationCallback) => void): this;
    on(event: "handle-message-globally", listener: (message: DataStreamMessage) => void): this;
    on(event: "closed", listener: () => void): this;
    emit(event: "identification", frame: HDSFrame, callback: IdentificationCallback): boolean;
    emit(event: "handle-message-globally", message: DataStreamMessage): boolean;
    emit(event: "closed"): boolean;
}
/**
 * DataStream connection which holds any necessary state information, encryption an decryption keys, manages
 * protocol handlers and also handles sending and receiving of data stream frames.
 */
export declare class DataStreamConnection extends EventEmitter {
    private static readonly MAX_PAYLOAD_LENGTH;
    private socket;
    private connection?;
    readonly remoteAddress: string;
    private state;
    private accessoryToControllerEncryptionKey?;
    private controllerToAccessoryEncryptionKey?;
    private accessoryToControllerNonce;
    private readonly accessoryToControllerNonceBuffer;
    private controllerToAccessoryNonce;
    private readonly controllerToAccessoryNonceBuffer;
    private frameBuffer?;
    private readonly hapConnectionClosedListener;
    private protocolHandlers;
    private responseHandlers;
    private responseTimers;
    private helloTimer?;
    constructor(socket: Socket);
    private handleHello;
    /**
     * Registers a new protocol handler to handle incoming messages.
     * The same protocol cannot be registered multiple times.
     *
     * @param protocol {string | Protocols} - name of the protocol to register the handler for
     * @param protocolHandler {DataStreamProtocolHandler} - object to be registered as protocol handler
     */
    addProtocolHandler(protocol: string | Protocols, protocolHandler: DataStreamProtocolHandler): boolean;
    /**
     * Removes a protocol handler if it is registered.
     *
     * @param protocol {string | Protocols} - name of the protocol to unregister the handler for
     * @param protocolHandler {DataStreamProtocolHandler} - object which will be unregistered
     */
    removeProtocolHandler(protocol: string | Protocols, protocolHandler: DataStreamProtocolHandler): void;
    /**
     * Sends a new event message to the connected client.
     *
     * @param protocol {string | Protocols} - name of the protocol
     * @param event {string | Topics} - name of the event (also referred to as topic. See {Topics} for some known ones)
     * @param message {Record<any, any>} - message dictionary which gets sent along the event
     */
    sendEvent(protocol: string | Protocols, event: string | Topics, message?: Record<any, any>): void;
    /**
     * Sends a new request message to the connected client.
     *
     * @param protocol {string | Protocols} - name of the protocol
     * @param request {string | Topics} - name of the request (also referred to as topic. See {Topics} for some known ones)
     * @param message {Record<any, any>} - message dictionary which gets sent along the request
     * @param callback {ResponseHandler} - handler which gets supplied with an error object if the response didn't
     *                                     arrive in time or the status and the message dictionary from the response
     */
    sendRequest(protocol: string | Protocols, request: string | Topics, message: Record<any, any> | undefined, callback: ResponseHandler): void;
    /**
     * Send a new response message to a received request message to the client.
     *
     * @param protocol {string | Protocols} - name of the protocol
     * @param response {string | Topics} - name of the response (also referred to as topic. See {Topics} for some known ones)
     * @param id {number} - id from the request, to associate the response to the request
     * @param status {HDSStatus} - status indication if the request was successful. A status of zero indicates success.
     * @param message {Record<any, any>} - message dictionary which gets sent along the response
     */
    sendResponse(protocol: string | Protocols, response: string | Topics, id: number, status?: HDSStatus, message?: Record<any, any>): void;
    private onSocketData;
    private decodeHDSFrames;
    decryptHDSFrame(frame: HDSFrame, keyOverwrite?: Buffer): boolean;
    private decodePayloads;
    private sendHDSFrame;
    close(): void;
    private onHAPSessionClosed;
    private onSocketError;
    private onSocketClose;
}
export {};
//# sourceMappingURL=DataStreamServer.d.ts.map