/// <reference types="node" />
import { EventEmitter } from "events";
import { AccessoriesResponse, CharacteristicsReadRequest, CharacteristicsReadResponse, CharacteristicsWriteRequest, CharacteristicsWriteResponse, ResourceRequest } from "../internal-types";
import { CharacteristicValue, Nullable, VoidCallback } from "../types";
import { AccessoryInfo, PairingInformation, PermissionTypes } from "./model/AccessoryInfo";
import { HAPConnection, HAPUsername } from "./util/eventedhttp";
/**
 * TLV error codes for the {@link TLVValues.ERROR_CODE} field.
 */
export declare const enum TLVErrorCode {
    UNKNOWN = 1,
    INVALID_REQUEST = 2,
    AUTHENTICATION = 2,
    BACKOFF = 3,
    MAX_PEERS = 4,
    MAX_TRIES = 5,
    UNAVAILABLE = 6,
    BUSY = 7
}
export declare const enum HAPStatus {
    SUCCESS = 0,
    INSUFFICIENT_PRIVILEGES = -70401,
    SERVICE_COMMUNICATION_FAILURE = -70402,
    RESOURCE_BUSY = -70403,
    READ_ONLY_CHARACTERISTIC = -70404,
    WRITE_ONLY_CHARACTERISTIC = -70405,
    NOTIFICATION_NOT_SUPPORTED = -70406,
    OUT_OF_RESOURCE = -70407,
    OPERATION_TIMED_OUT = -70408,
    RESOURCE_DOES_NOT_EXIST = -70409,
    INVALID_VALUE_IN_REQUEST = -70410,
    INSUFFICIENT_AUTHORIZATION = -70411,
    NOT_ALLOWED_IN_CURRENT_STATE = -70412
}
/**
 * Determines if the given status code is a known {@link HAPStatus} error code.
 */
export declare function IsKnownHAPStatusError(status: HAPStatus): boolean;
/**
 * @deprecated please use {@link TLVErrorCode} as naming is more precise
 */
export declare const Codes: typeof TLVErrorCode;
/**
 * @deprecated please use {@link HAPStatus} as naming is more precise
 */
export declare const Status: typeof HAPStatus;
/**
 * Those status codes are the one listed as appropriate for the HAP spec!
 *
 * When the response is a client error 4xx or server error 5xx, the response
 * must include a status {@link HAPStatus} property.
 *
 * When the response is a MULTI_STATUS EVERY entry in the characteristics property MUST include a status property (even success).
 */
export declare const enum HAPHTTPCode {
    OK = 200,
    NO_CONTENT = 204,
    MULTI_STATUS = 207,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503
}
/**
 * When in a request is made to the pairing endpoints, and mime type is 'application/pairing+tlv8'
 * one should use the below status codes.
 */
export declare const enum HAPPairingHTTPCode {
    OK = 200,
    BAD_REQUEST = 400,
    METHOD_NOT_ALLOWED = 405,
    TOO_MANY_REQUESTS = 429,
    CONNECTION_AUTHORIZATION_REQUIRED = 470,
    INTERNAL_SERVER_ERROR = 500
}
export declare type IdentifyCallback = VoidCallback;
export declare type HAPHttpError = {
    httpCode: HAPHTTPCode;
    status: HAPStatus;
};
export declare type PairingsCallback<T = void> = (error: TLVErrorCode | 0, data?: T) => void;
export declare type AddPairingCallback = PairingsCallback;
export declare type RemovePairingCallback = PairingsCallback;
export declare type ListPairingsCallback = PairingsCallback<PairingInformation[]>;
export declare type PairCallback = VoidCallback;
export declare type AccessoriesCallback = (error: HAPHttpError | undefined, result?: AccessoriesResponse) => void;
export declare type ReadCharacteristicsCallback = (error: HAPHttpError | undefined, response?: CharacteristicsReadResponse) => void;
export declare type WriteCharacteristicsCallback = (error: HAPHttpError | undefined, response?: CharacteristicsWriteResponse) => void;
export declare type ResourceRequestCallback = (error: HAPHttpError | undefined, resource?: Buffer) => void;
export declare const enum HAPServerEventTypes {
    /**
     * Emitted when the server is fully set up and ready to receive connections.
     */
    LISTENING = "listening",
    /**
     * Emitted when a client wishes for this server to identify itself before pairing. You must call the
     * callback to respond to the client with success.
     */
    IDENTIFY = "identify",
    ADD_PAIRING = "add-pairing",
    REMOVE_PAIRING = "remove-pairing",
    LIST_PAIRINGS = "list-pairings",
    /**
     * This event is emitted when a client completes the "pairing" process and exchanges encryption keys.
     * Note that this does not mean the "Add Accessory" process in iOS has completed.
     * You must call the callback to complete the process.
     */
    PAIR = "pair",
    /**
     * This event is emitted when a client requests the complete representation of Accessory data for
     * this Accessory (for instance, what services, characteristics, etc. are supported) and any bridged
     * Accessories in the case of a Bridge Accessory. The listener must call the provided callback function
     * when the accessory data is ready. We will automatically JSON.stringify the data.
     */
    ACCESSORIES = "accessories",
    /**
     * This event is emitted when a client wishes to retrieve the current value of one or more characteristics.
     * The listener must call the provided callback function when the values are ready. iOS clients can typically
     * wait up to 10 seconds for this call to return. We will automatically JSON.stringify the data (which must
     * be an array) and wrap it in an object with a top-level "characteristics" property.
     */
    GET_CHARACTERISTICS = "get-characteristics",
    /**
     * This event is emitted when a client wishes to set the current value of one or more characteristics and/or
     * subscribe to one or more events. The 'events' param is an initially-empty object, associated with the current
     * connection, on which you may store event registration keys for later processing. The listener must call
     * the provided callback when the request has been processed.
     */
    SET_CHARACTERISTICS = "set-characteristics",
    REQUEST_RESOURCE = "request-resource",
    CONNECTION_CLOSED = "connection-closed"
}
export declare interface HAPServer {
    on(event: "listening", listener: (port: number, address: string) => void): this;
    on(event: "identify", listener: (callback: IdentifyCallback) => void): this;
    on(event: "add-pairing", listener: (connection: HAPConnection, username: HAPUsername, publicKey: Buffer, permission: PermissionTypes, callback: AddPairingCallback) => void): this;
    on(event: "remove-pairing", listener: (connection: HAPConnection, username: HAPUsername, callback: RemovePairingCallback) => void): this;
    on(event: "list-pairings", listener: (connection: HAPConnection, callback: ListPairingsCallback) => void): this;
    on(event: "pair", listener: (username: HAPUsername, clientLTPK: Buffer, callback: PairCallback) => void): this;
    on(event: "accessories", listener: (connection: HAPConnection, callback: AccessoriesCallback) => void): this;
    on(event: "get-characteristics", listener: (connection: HAPConnection, request: CharacteristicsReadRequest, callback: ReadCharacteristicsCallback) => void): this;
    on(event: "set-characteristics", listener: (connection: HAPConnection, request: CharacteristicsWriteRequest, callback: WriteCharacteristicsCallback) => void): this;
    on(event: "request-resource", listener: (resource: ResourceRequest, callback: ResourceRequestCallback) => void): this;
    on(event: "connection-closed", listener: (connection: HAPConnection) => void): this;
    emit(event: "listening", port: number, address: string): boolean;
    emit(event: "identify", callback: IdentifyCallback): boolean;
    emit(event: "add-pairing", connection: HAPConnection, username: HAPUsername, publicKey: Buffer, permission: PermissionTypes, callback: AddPairingCallback): boolean;
    emit(event: "remove-pairing", connection: HAPConnection, username: HAPUsername, callback: RemovePairingCallback): boolean;
    emit(event: "list-pairings", connection: HAPConnection, callback: ListPairingsCallback): boolean;
    emit(event: "pair", username: HAPUsername, clientLTPK: Buffer, callback: PairCallback): boolean;
    emit(event: "accessories", connection: HAPConnection, callback: AccessoriesCallback): boolean;
    emit(event: "get-characteristics", connection: HAPConnection, request: CharacteristicsReadRequest, callback: ReadCharacteristicsCallback): boolean;
    emit(event: "set-characteristics", connection: HAPConnection, request: CharacteristicsWriteRequest, callback: WriteCharacteristicsCallback): boolean;
    emit(event: "request-resource", resource: ResourceRequest, callback: ResourceRequestCallback): boolean;
    emit(event: "connection-closed", connection: HAPConnection): boolean;
}
/**
 * The actual HAP server that iOS devices talk to.
 *
 * Notes
 * -----
 * It turns out that the IP-based version of HomeKit's HAP protocol operates over a sort of pseudo-HTTP.
 * Accessories are meant to host a TCP socket server that initially behaves exactly as an HTTP/1.1 server.
 * So iOS devices will open up a long-lived connection to this server and begin issuing HTTP requests.
 * So far, this conforms with HTTP/1.1 Keepalive. However, after the "pairing" process is complete, the
 * connection is expected to be "upgraded" to support full-packet encryption of both HTTP headers and data.
 * This encryption is NOT SSL. It is a customized ChaCha20+Poly1305 encryption layer.
 *
 * Additionally, this "HTTP Server" supports sending "event" responses at any time without warning. The iOS
 * device simply keeps the connection open after it's finished with HTTP request/response traffic, and while
 * the connection is open, the server can elect to issue "EVENT/1.0 200 OK" HTTP-style responses. These are
 * typically sent to inform the iOS device of a characteristic change for the accessory (like "Door was Unlocked").
 *
 * See eventedhttp.js for more detail on the implementation of this protocol.
 */
export declare class HAPServer extends EventEmitter {
    private accessoryInfo;
    private httpServer;
    private unsuccessfulPairAttempts;
    allowInsecureRequest: boolean;
    constructor(accessoryInfo: AccessoryInfo);
    listen(port?: number, host?: string): void;
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
    sendEventNotifications(aid: number, iid: number, value: Nullable<CharacteristicValue>, originator?: HAPConnection, immediateDelivery?: boolean): void;
    private onListening;
    private handleRequestOnHAPConnection;
    private handleConnectionClosed;
    private getHandler;
    /**
     * UNPAIRED Accessory identification.
     */
    private handleIdentifyRequest;
    private handlePairSetup;
    private handlePairSetupM1;
    private handlePairSetupM3;
    private handlePairSetupM5;
    private handlePairSetupM5_2;
    private handlePairSetupM5_3;
    private handlePairVerify;
    private handlePairVerifyM1;
    private handlePairVerifyM2;
    private handlePairings;
    private handleAccessories;
    private handleCharacteristics;
    private handlePrepareWrite;
    private handleResource;
}
//# sourceMappingURL=HAPServer.d.ts.map