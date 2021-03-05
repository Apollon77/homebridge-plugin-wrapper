/// <reference types="node" />
import { EventEmitter } from "events";
import { SrpServer } from "fast-srp-hap";
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { CharacteristicValue, Nullable, SessionIdentifier } from '../../types';
export declare type HAPUsername = string;
export declare type EventName = string;
/**
 * Simple struct to hold vars needed to support HAP encryption.
 */
export declare class HAPEncryption {
    readonly clientPublicKey: Buffer;
    readonly secretKey: Buffer;
    readonly publicKey: Buffer;
    readonly sharedSecret: Buffer;
    readonly hkdfPairEncryptionKey: Buffer;
    accessoryToControllerCount: number;
    controllerToAccessoryCount: number;
    accessoryToControllerKey: Buffer;
    controllerToAccessoryKey: Buffer;
    incompleteFrame?: Buffer;
    constructor(clientPublicKey: Buffer, secretKey: Buffer, publicKey: Buffer, sharedSecret: Buffer, hkdfPairEncryptionKey: Buffer);
}
export declare const enum EventedHTTPServerEvent {
    LISTENING = "listening",
    CONNECTION_OPENED = "connection-opened",
    REQUEST = "request",
    CONNECTION_CLOSED = "connection-closed"
}
export declare interface EventedHTTPServer {
    on(event: "listening", listener: (port: number, address: string) => void): this;
    on(event: "connection-opened", listener: (connection: HAPConnection) => void): this;
    on(event: "request", listener: (connection: HAPConnection, request: IncomingMessage, response: ServerResponse) => void): this;
    on(event: "connection-closed", listener: (connection: HAPConnection) => void): this;
    emit(event: "listening", port: number, address: string): boolean;
    emit(event: "connection-opened", connection: HAPConnection): boolean;
    emit(event: "request", connection: HAPConnection, request: IncomingMessage, response: ServerResponse): boolean;
    emit(event: "connection-closed", connection: HAPConnection): boolean;
}
/**
 * EventedHTTPServer provides an HTTP-like server that supports HAP "extensions" for security and events.
 *
 * Implementation
 * --------------
 * In order to implement the "custom HTTP" server required by the HAP protocol (see HAPServer.js) without completely
 * reinventing the wheel, we create both a generic TCP socket server as well as a standard Node HTTP server.
 * The TCP socket server acts as a proxy, allowing users of this class to transform data (for encryption) as necessary
 * and passing through bytes directly to the HTTP server for processing. This way we get Node to do all
 * the "heavy lifting" of HTTP like parsing headers and formatting responses.
 *
 * Events are sent by simply waiting for current HTTP traffic to subside and then sending a custom response packet
 * directly down the wire via the socket.
 *
 * Each connection to the main TCP server gets its own internal HTTP server, so we can track ongoing requests/responses
 * for safe event insertion.
 */
export declare class EventedHTTPServer extends EventEmitter {
    private static readonly CONNECTION_TIMEOUT_LIMIT;
    private static readonly MAX_CONNECTION_IDLE_TIME;
    private readonly tcpServer;
    /**
     * Set of all currently connected HAP connections.
     */
    private readonly connections;
    /**
     * Session dictionary indexed by username/identifier. The username uniquely identifies every person added to the home.
     * So there can be multiple sessions open for a single username (multiple devices connected to the same Apple ID).
     */
    private readonly connectionsByUsername;
    private connectionIdleTimeout?;
    constructor();
    private scheduleNextConnectionIdleTimeout;
    listen(targetPort: number, hostname?: string): void;
    stop(): void;
    destroy(): void;
    /**
     * Send a even notification for given characteristic and changed value to all connected clients.
     * If {@param originator} is specified, the given {@link HAPConnection} will be excluded from the broadcast.
     *
     * @param aid - The accessory id of the updated characteristic.
     * @param iid - The instance id of the updated characteristic.
     * @param value - The newly set value of the characteristic.
     * @param originator - If specified, the connection will not get a event message.
     * @param immediateDelivery - The HAP spec requires some characteristics to be delivery immediately.
     *   Namely for the {@link ButtonEvent} and the {@link ProgrammableSwitchEvent} characteristics.
     */
    broadcastEvent(aid: number, iid: number, value: Nullable<CharacteristicValue>, originator?: HAPConnection, immediateDelivery?: boolean): void;
    private onConnection;
    private handleConnectionAuthenticated;
    private handleConnectionClose;
    static destroyExistingConnectionsAfterUnpair(initiator: HAPConnection, username: string): void;
}
/**
 * @private
 */
export declare const enum HAPConnectionState {
    CONNECTING = 0,
    FULLY_SET_UP = 1,
    AUTHENTICATED = 2,
    TO_BE_TEARED_DOWN = 3,
    CLOSING = 4,
    CLOSED = 5
}
export declare const enum HAPConnectionEvent {
    REQUEST = "request",
    AUTHENTICATED = "authenticated",
    CLOSED = "closed"
}
export declare interface HAPConnection {
    on(event: "request", listener: (request: IncomingMessage, response: ServerResponse) => void): this;
    on(event: "authenticated", listener: (username: HAPUsername) => void): this;
    on(event: "closed", listener: () => void): this;
    emit(event: "request", request: IncomingMessage, response: ServerResponse): boolean;
    emit(event: "authenticated", username: HAPUsername): boolean;
    emit(event: "closed"): boolean;
}
/**
 * Manages a single iOS-initiated HTTP connection during its lifetime.
 * @private
 */
export declare class HAPConnection extends EventEmitter {
    readonly server: EventedHTTPServer;
    readonly sessionID: SessionIdentifier;
    private state;
    readonly localAddress: string;
    readonly remoteAddress: string;
    readonly remotePort: number;
    readonly networkInterface: string;
    private readonly tcpSocket;
    private readonly internalHttpServer;
    private httpSocket?;
    private internalHttpServerPort?;
    private internalHttpServerAddress?;
    lastSocketOperation: number;
    private pendingClientSocketData?;
    private handlingRequest;
    username?: HAPUsername;
    encryption?: HAPEncryption;
    srpServer?: SrpServer;
    _pairSetupState?: number;
    _pairVerifyState?: number;
    private registeredEvents;
    private eventsTimer?;
    private readonly queuedEvents;
    private readonly pendingEventData;
    timedWritePid?: number;
    timedWriteTimeout?: NodeJS.Timeout;
    constructor(server: EventedHTTPServer, clientSocket: Socket);
    /**
     * This method is called once the connection has gone through pair-verify.
     * As any HomeKit controller will initiate a pair-verify after the pair-setup procedure, this method gets
     * not called on the initial pair-setup.
     *
     * Once this method has been called, the connection is authenticated and encryption is turned on.
     */
    connectionAuthenticated(username: HAPUsername): void;
    isAuthenticated(): boolean;
    close(): void;
    closeConnectionAsOfUnpair(initiator: HAPConnection): void;
    sendEvent(aid: number, iid: number, value: Nullable<CharacteristicValue>, immediateDelivery?: boolean): void;
    private handleEventsTimeout;
    private writePendingEventNotifications;
    private writeQueuedEventNotifications;
    /**
     * This will create an EVENT/1.0 notification header with the provided event notification.
     * If currently a HTTP request is in progress the assembled packet will be
     * added to the pending events list.
     *
     * @param notification - The event which should be sent out
     */
    private writeEventNotification;
    enableEventNotifications(aid: number, iid: number): void;
    disableEventNotifications(aid: number, iid: number): void;
    hasEventNotifications(aid: number, iid: number): boolean;
    getRegisteredEvents(): Set<EventName>;
    clearRegisteredEvents(): void;
    private encrypt;
    private decrypt;
    private onHttpServerListening;
    /**
     * This event handler is called when we receive data from a HomeKit controller on our tcp socket.
     * We store the data if the internal http server is not read yet, or forward it to the http server.
     */
    private onTCPSocketData;
    /**
     * This event handler is called when the internal http server receives a request.
     * Meaning we received data from the HomeKit controller in {@link onTCPSocketData}, which then send the
     * data unencrypted to the internal http server. And now it landed here, fully parsed as a http request.
     */
    private handleHttpServerRequest;
    /**
     * This event handler is called by the socket which is connected to our internal http server.
     * It is called with the response returned from the http server.
     * In this method we have to encrypt and forward the message back to the HomeKit controller.
     */
    private handleHttpServerResponse;
    private handleTCPSocketWriteFulfilled;
    private onTCPSocketError;
    private onTCPSocketClose;
    private onHttpServerError;
    private onHttpServerClose;
    private onHttpSocketError;
    private onHttpSocketClose;
    getLocalAddress(ipVersion: "ipv4" | "ipv6"): string;
    private static getLocalNetworkInterface;
}
//# sourceMappingURL=eventedhttp.d.ts.map