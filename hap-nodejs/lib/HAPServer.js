"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HAPServer = exports.HAPServerEventTypes = exports.HAPPairingHTTPCode = exports.HAPHTTPCode = exports.HAPStatus = exports.TLVErrorCode = void 0;
exports.IsKnownHAPStatusError = IsKnownHAPStatusError;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const events_1 = require("events");
const fast_srp_hap_1 = require("fast-srp-hap");
const tweetnacl_1 = tslib_1.__importDefault(require("tweetnacl"));
const url_1 = require("url");
const internal_types_1 = require("../internal-types");
const eventedhttp_1 = require("./util/eventedhttp");
const hapCrypto = tslib_1.__importStar(require("./util/hapCrypto"));
const once_1 = require("./util/once");
const tlv = tslib_1.__importStar(require("./util/tlv"));
const debug = (0, debug_1.default)("HAP-NodeJS:HAPServer");
/**
 * TLV error codes for the `TLVValues.ERROR_CODE` field.
 *
 * @group HAP Accessory Server
 */
var TLVErrorCode;
(function (TLVErrorCode) {
    // noinspection JSUnusedGlobalSymbols
    TLVErrorCode[TLVErrorCode["UNKNOWN"] = 1] = "UNKNOWN";
    TLVErrorCode[TLVErrorCode["INVALID_REQUEST"] = 2] = "INVALID_REQUEST";
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    TLVErrorCode[TLVErrorCode["AUTHENTICATION"] = 2] = "AUTHENTICATION";
    TLVErrorCode[TLVErrorCode["BACKOFF"] = 3] = "BACKOFF";
    TLVErrorCode[TLVErrorCode["MAX_PEERS"] = 4] = "MAX_PEERS";
    TLVErrorCode[TLVErrorCode["MAX_TRIES"] = 5] = "MAX_TRIES";
    TLVErrorCode[TLVErrorCode["UNAVAILABLE"] = 6] = "UNAVAILABLE";
    TLVErrorCode[TLVErrorCode["BUSY"] = 7] = "BUSY"; // cannot accept pairing request at this time
})(TLVErrorCode || (exports.TLVErrorCode = TLVErrorCode = {}));
/**
 * @group HAP Accessory Server
 */
var HAPStatus;
(function (HAPStatus) {
    // noinspection JSUnusedGlobalSymbols
    /**
     * Success of the request.
     */
    HAPStatus[HAPStatus["SUCCESS"] = 0] = "SUCCESS";
    /**
     * The request was rejected due to insufficient privileges.
     */
    HAPStatus[HAPStatus["INSUFFICIENT_PRIVILEGES"] = -70401] = "INSUFFICIENT_PRIVILEGES";
    /**
     * Operation failed due to some communication failure with the characteristic.
     */
    HAPStatus[HAPStatus["SERVICE_COMMUNICATION_FAILURE"] = -70402] = "SERVICE_COMMUNICATION_FAILURE";
    /**
     * The resource is busy. Try again.
     */
    HAPStatus[HAPStatus["RESOURCE_BUSY"] = -70403] = "RESOURCE_BUSY";
    /**
     * Cannot write a read-only characteristic ({@link Perms.PAIRED_WRITE} not defined).
     */
    HAPStatus[HAPStatus["READ_ONLY_CHARACTERISTIC"] = -70404] = "READ_ONLY_CHARACTERISTIC";
    /**
     * Cannot read from a write-only characteristic ({@link Perms.PAIRED_READ} not defined).
     */
    HAPStatus[HAPStatus["WRITE_ONLY_CHARACTERISTIC"] = -70405] = "WRITE_ONLY_CHARACTERISTIC";
    /**
     * Event notifications are not supported for the requested characteristic ({@link Perms.NOTIFY} not defined).
     */
    HAPStatus[HAPStatus["NOTIFICATION_NOT_SUPPORTED"] = -70406] = "NOTIFICATION_NOT_SUPPORTED";
    /**
     * The device is out of resources to process the request.
     */
    HAPStatus[HAPStatus["OUT_OF_RESOURCE"] = -70407] = "OUT_OF_RESOURCE";
    /**
     * The operation timed out.
     */
    HAPStatus[HAPStatus["OPERATION_TIMED_OUT"] = -70408] = "OPERATION_TIMED_OUT";
    /**
     * The given resource does not exist.
     */
    HAPStatus[HAPStatus["RESOURCE_DOES_NOT_EXIST"] = -70409] = "RESOURCE_DOES_NOT_EXIST";
    /**
     * Received an invalid value in the given request for the given characteristic.
     */
    HAPStatus[HAPStatus["INVALID_VALUE_IN_REQUEST"] = -70410] = "INVALID_VALUE_IN_REQUEST";
    /**
     * Insufficient authorization.
     */
    HAPStatus[HAPStatus["INSUFFICIENT_AUTHORIZATION"] = -70411] = "INSUFFICIENT_AUTHORIZATION";
    /**
     * Operation not allowed in the current state.
     */
    HAPStatus[HAPStatus["NOT_ALLOWED_IN_CURRENT_STATE"] = -70412] = "NOT_ALLOWED_IN_CURRENT_STATE";
    // when adding new status codes, remember to update bounds in IsKnownHAPStatusError below
})(HAPStatus || (exports.HAPStatus = HAPStatus = {}));
/**
 * Determines if the given status code is a known {@link HAPStatus} error code.
 *
 * @group HAP Accessory Server
 */
function IsKnownHAPStatusError(status) {
    return (
    // Lower bound (most negative error code)
    status >= -70412 /* HAPStatus.NOT_ALLOWED_IN_CURRENT_STATE */ &&
        // Upper bound (negative error code closest to zero)
        status <= -70401 /* HAPStatus.INSUFFICIENT_PRIVILEGES */);
}
/**
 * Those status codes are the one listed as appropriate for the HAP spec!
 *
 * When the response is a client error 4xx or server error 5xx, the response
 * must include a status {@link HAPStatus} property.
 *
 * When the response is a MULTI_STATUS EVERY entry in the characteristics property MUST include a status property (even success).
 *
 * @group HAP Accessory Server
 */
var HAPHTTPCode;
(function (HAPHTTPCode) {
    // noinspection JSUnusedGlobalSymbols
    HAPHTTPCode[HAPHTTPCode["OK"] = 200] = "OK";
    HAPHTTPCode[HAPHTTPCode["NO_CONTENT"] = 204] = "NO_CONTENT";
    HAPHTTPCode[HAPHTTPCode["MULTI_STATUS"] = 207] = "MULTI_STATUS";
    // client error
    HAPHTTPCode[HAPHTTPCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HAPHTTPCode[HAPHTTPCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    HAPHTTPCode[HAPHTTPCode["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    // server error
    HAPHTTPCode[HAPHTTPCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HAPHTTPCode[HAPHTTPCode["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
})(HAPHTTPCode || (exports.HAPHTTPCode = HAPHTTPCode = {}));
/**
 * When in a request is made to the pairing endpoints, and mime type is 'application/pairing+tlv8'
 * one should use the below status codes.
 *
 * @group HAP Accessory Server
 */
var HAPPairingHTTPCode;
(function (HAPPairingHTTPCode) {
    // noinspection JSUnusedGlobalSymbols
    HAPPairingHTTPCode[HAPPairingHTTPCode["OK"] = 200] = "OK";
    HAPPairingHTTPCode[HAPPairingHTTPCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HAPPairingHTTPCode[HAPPairingHTTPCode["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    HAPPairingHTTPCode[HAPPairingHTTPCode["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    HAPPairingHTTPCode[HAPPairingHTTPCode["CONNECTION_AUTHORIZATION_REQUIRED"] = 470] = "CONNECTION_AUTHORIZATION_REQUIRED";
    HAPPairingHTTPCode[HAPPairingHTTPCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HAPPairingHTTPCode || (exports.HAPPairingHTTPCode = HAPPairingHTTPCode = {}));
/**
 * @group HAP Accessory Server
 */
var HAPServerEventTypes;
(function (HAPServerEventTypes) {
    /**
     * Emitted when the server is fully set up and ready to receive connections.
     */
    HAPServerEventTypes["LISTENING"] = "listening";
    /**
     * Emitted when a client wishes for this server to identify itself before pairing. You must call the
     * callback to respond to the client with success.
     */
    HAPServerEventTypes["IDENTIFY"] = "identify";
    HAPServerEventTypes["ADD_PAIRING"] = "add-pairing";
    HAPServerEventTypes["REMOVE_PAIRING"] = "remove-pairing";
    HAPServerEventTypes["LIST_PAIRINGS"] = "list-pairings";
    /**
     * This event is emitted when a client completes the "pairing" process and exchanges encryption keys.
     * Note that this does not mean the "Add Accessory" process in iOS has completed.
     * You must call the callback to complete the process.
     */
    HAPServerEventTypes["PAIR"] = "pair";
    /**
     * This event is emitted when a client requests the complete representation of Accessory data for
     * this Accessory (for instance, what services, characteristics, etc. are supported) and any bridged
     * Accessories in the case of a Bridge Accessory. The listener must call the provided callback function
     * when the accessory data is ready. We will automatically JSON.stringify the data.
     */
    HAPServerEventTypes["ACCESSORIES"] = "accessories";
    /**
     * This event is emitted when a client wishes to retrieve the current value of one or more characteristics.
     * The listener must call the provided callback function when the values are ready. iOS clients can typically
     * wait up to 10 seconds for this call to return. We will automatically JSON.stringify the data (which must
     * be an array) and wrap it in an object with a top-level "characteristics" property.
     */
    HAPServerEventTypes["GET_CHARACTERISTICS"] = "get-characteristics";
    /**
     * This event is emitted when a client wishes to set the current value of one or more characteristics and/or
     * subscribe to one or more events. The 'events' param is an initially-empty object, associated with the current
     * connection, on which you may store event registration keys for later processing. The listener must call
     * the provided callback when the request has been processed.
     */
    HAPServerEventTypes["SET_CHARACTERISTICS"] = "set-characteristics";
    HAPServerEventTypes["REQUEST_RESOURCE"] = "request-resource";
    HAPServerEventTypes["CONNECTION_CLOSED"] = "connection-closed";
})(HAPServerEventTypes || (exports.HAPServerEventTypes = HAPServerEventTypes = {}));
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
 * See {@link EventedHTTPServer} for more detail on the implementation of this protocol.
 *
 * @group HAP Accessory Server
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class HAPServer extends events_1.EventEmitter {
    accessoryInfo;
    httpServer;
    unsuccessfulPairAttempts = 0; // after 100 unsuccessful attempts the server won't accept any further attempts. Will currently be reset on a reboot
    allowInsecureRequest;
    constructor(accessoryInfo) {
        super();
        this.accessoryInfo = accessoryInfo;
        this.allowInsecureRequest = false;
        // internal server that does all the actual communication
        this.httpServer = new eventedhttp_1.EventedHTTPServer();
        this.httpServer.on("listening" /* EventedHTTPServerEvent.LISTENING */, this.onListening.bind(this));
        this.httpServer.on("request" /* EventedHTTPServerEvent.REQUEST */, this.handleRequestOnHAPConnection.bind(this));
        this.httpServer.on("connection-closed" /* EventedHTTPServerEvent.CONNECTION_CLOSED */, this.handleConnectionClosed.bind(this));
    }
    listen(port = 0, host) {
        if (host === "::") {
            // this will work around "EAFNOSUPPORT: address family not supported" errors
            // on systems where IPv6 is not supported/enabled, we just use the node default then by supplying undefined
            host = undefined;
        }
        this.httpServer.listen(port, host);
    }
    stop() {
        this.httpServer.stop();
    }
    destroy() {
        this.stop();
        this.removeAllListeners();
    }
    /**
     * Send an even notification for given characteristic and changed value to all connected clients.
     * If `originator` is specified, the given {@link HAPConnection} will be excluded from the broadcast.
     *
     * @param aid - The accessory id of the updated characteristic.
     * @param iid - The instance id of the updated characteristic.
     * @param value - The newly set value of the characteristic.
     * @param originator - If specified, the connection will not get an event message.
     * @param immediateDelivery - The HAP spec requires some characteristics to be delivery immediately.
     *   Namely, for the {@link Characteristic.ButtonEvent} and the {@link Characteristic.ProgrammableSwitchEvent} characteristics.
     */
    sendEventNotifications(aid, iid, value, originator, immediateDelivery) {
        try {
            this.httpServer.broadcastEvent(aid, iid, value, originator, immediateDelivery);
        }
        catch (error) {
            console.warn("[" + this.accessoryInfo.username + "] Error when sending event notifications: " + error.message);
        }
    }
    onListening(port, hostname) {
        this.emit("listening" /* HAPServerEventTypes.LISTENING */, port, hostname);
    }
    // Called when an HTTP request was detected.
    handleRequestOnHAPConnection(connection, request, response) {
        debug("[%s] HAP Request: %s %s", this.accessoryInfo.username, request.method, request.url);
        const buffers = [];
        request.on("data", data => buffers.push(data));
        request.on("end", () => {
            const url = new url_1.URL(request.url, "http://hap-nodejs.local"); // parse the url (query strings etc)
            const handler = this.getHandler(url);
            if (!handler) {
                debug("[%s] WARNING: Handler for %s not implemented", this.accessoryInfo.username, request.url);
                response.writeHead(404 /* HAPHTTPCode.NOT_FOUND */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                response.end(JSON.stringify({ status: -70409 /* HAPStatus.RESOURCE_DOES_NOT_EXIST */ }));
            }
            else {
                const data = Buffer.concat(buffers);
                try {
                    handler(connection, url, request, data, response);
                }
                catch (error) {
                    debug("[%s] Error executing route handler: %s", this.accessoryInfo.username, error.stack);
                    response.writeHead(500 /* HAPHTTPCode.INTERNAL_SERVER_ERROR */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                    response.end(JSON.stringify({ status: -70403 /* HAPStatus.RESOURCE_BUSY */ })); // resource busy try again, does somehow fit?
                }
            }
        });
    }
    handleConnectionClosed(connection) {
        this.emit("connection-closed" /* HAPServerEventTypes.CONNECTION_CLOSED */, connection);
    }
    getHandler(url) {
        switch (url.pathname.toLowerCase()) {
            case "/identify":
                return this.handleIdentifyRequest.bind(this);
            case "/pair-setup":
                return this.handlePairSetup.bind(this);
            case "/pair-verify":
                return this.handlePairVerify.bind(this);
            case "/pairings":
                return this.handlePairings.bind(this);
            case "/accessories":
                return this.handleAccessories.bind(this);
            case "/characteristics":
                return this.handleCharacteristics.bind(this);
            case "/prepare":
                return this.handlePrepareWrite.bind(this);
            case "/resource":
                return this.handleResource.bind(this);
            default:
                return undefined;
        }
    }
    /**
     * UNPAIRED Accessory identification.
     */
    handleIdentifyRequest(connection, url, request, data, response) {
        // POST body is empty
        if (this.accessoryInfo.paired() && !this.allowInsecureRequest) {
            response.writeHead(400 /* HAPHTTPCode.BAD_REQUEST */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
            response.end(JSON.stringify({ status: -70401 /* HAPStatus.INSUFFICIENT_PRIVILEGES */ }));
            return;
        }
        this.emit("identify" /* HAPServerEventTypes.IDENTIFY */, (0, once_1.once)(err => {
            if (!err) {
                debug("[%s] Identification success", this.accessoryInfo.username);
                response.writeHead(204 /* HAPHTTPCode.NO_CONTENT */);
                response.end();
            }
            else {
                debug("[%s] Identification error: %s", this.accessoryInfo.username, err.message);
                response.writeHead(500 /* HAPHTTPCode.INTERNAL_SERVER_ERROR */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                response.end(JSON.stringify({ status: -70403 /* HAPStatus.RESOURCE_BUSY */ }));
            }
        }));
    }
    handlePairSetup(connection, url, request, data, response) {
        // Can only be directly paired with one iOS device
        if (!this.allowInsecureRequest && this.accessoryInfo.paired()) {
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, 6 /* TLVErrorCode.UNAVAILABLE */));
            return;
        }
        if (this.unsuccessfulPairAttempts > 100) {
            debug("[%s] Reached maximum amount of unsuccessful pair attempts!", this.accessoryInfo.username);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, 5 /* TLVErrorCode.MAX_TRIES */));
            return;
        }
        let tlvData;
        try {
            tlvData = tlv.decode(data);
        }
        catch (error) {
            debug("[%s] Pair-Setup: failed to decode TLV request: %s", this.accessoryInfo.username, error.message);
            response.writeHead(400 /* HAPPairingHTTPCode.BAD_REQUEST */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
            return;
        }
        if (!tlvData[6 /* TLVValues.SEQUENCE_NUM */]) {
            response.writeHead(400 /* HAPPairingHTTPCode.BAD_REQUEST */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
            return;
        }
        const sequence = tlvData[6 /* TLVValues.SEQUENCE_NUM */][0]; // value is single byte with sequence number
        if (sequence === 1 /* PairingStates.M1 */ && !connection._pairSetupState) {
            this.handlePairSetupM1(connection, request, response);
        }
        else if (sequence === 3 /* PairingStates.M3 */ && connection._pairSetupState === 2 /* PairingStates.M2 */) {
            this.handlePairSetupM3(connection, request, response, tlvData);
        }
        else if (sequence === 5 /* PairingStates.M5 */ && connection._pairSetupState === 4 /* PairingStates.M4 */) {
            this.handlePairSetupM5(connection, request, response, tlvData);
        }
        else {
            // Invalid state/sequence number
            response.writeHead(400 /* HAPPairingHTTPCode.BAD_REQUEST */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, sequence + 1, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
            return;
        }
    }
    handlePairSetupM1(connection, request, response) {
        debug("[%s] Pair step 1/5", this.accessoryInfo.username);
        const salt = crypto_1.default.randomBytes(16);
        const srpParams = fast_srp_hap_1.SRP.params.hap;
        fast_srp_hap_1.SRP.genKey(32).then(key => {
            // create a new SRP server
            const srpServer = new fast_srp_hap_1.SrpServer(srpParams, salt, Buffer.from("Pair-Setup"), Buffer.from(this.accessoryInfo.pincode), key);
            const srpB = srpServer.computeB();
            // attach it to the current TCP session
            connection.srpServer = srpServer;
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.SEQUENCE_NUM */, 2 /* PairingStates.M2 */, 2 /* TLVValues.SALT */, salt, 3 /* TLVValues.PUBLIC_KEY */, srpB));
            connection._pairSetupState = 2 /* PairingStates.M2 */;
        }).catch(error => {
            debug("[%s] Error occurred when generating srp key: %s", this.accessoryInfo.username, error.message);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
            return;
        });
    }
    handlePairSetupM3(connection, request, response, tlvData) {
        debug("[%s] Pair step 2/5", this.accessoryInfo.username);
        const A = tlvData[3 /* TLVValues.PUBLIC_KEY */]; // "A is a public key that exists only for a single login session."
        const M1 = tlvData[4 /* TLVValues.PASSWORD_PROOF */]; // "M1 is the proof that you actually know your own password."
        // pull the SRP server we created in stepOne out of the current session
        const srpServer = connection.srpServer;
        srpServer.setA(A);
        try {
            srpServer.checkM1(M1);
        }
        catch (err) {
            // most likely the client supplied an incorrect pincode.
            this.unsuccessfulPairAttempts++;
            debug("[%s] Error while checking pincode: %s", this.accessoryInfo.username, err.message);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.SEQUENCE_NUM */, 4 /* PairingStates.M4 */, 7 /* TLVValues.ERROR_CODE */, 2 /* TLVErrorCode.AUTHENTICATION */));
            connection._pairSetupState = undefined;
            return;
        }
        // "M2 is the proof that the server actually knows your password."
        const M2 = srpServer.computeM2();
        response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
        response.end(tlv.encode(6 /* TLVValues.SEQUENCE_NUM */, 4 /* PairingStates.M4 */, 4 /* TLVValues.PASSWORD_PROOF */, M2));
        connection._pairSetupState = 4 /* PairingStates.M4 */;
    }
    handlePairSetupM5(connection, request, response, tlvData) {
        debug("[%s] Pair step 3/5", this.accessoryInfo.username);
        // pull the SRP server we created in stepOne out of the current session
        const srpServer = connection.srpServer;
        const encryptedData = tlvData[5 /* TLVValues.ENCRYPTED_DATA */];
        if (!encryptedData || encryptedData.length < 16) {
            debug("[%s] M5: Encrypted data missing or too short", this.accessoryInfo.username);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.SEQUENCE_NUM */, 4 /* PairingStates.M4 */, 7 /* TLVValues.ERROR_CODE */, 2 /* TLVErrorCode.AUTHENTICATION */));
            connection._pairSetupState = undefined;
            return;
        }
        const messageData = Buffer.alloc(encryptedData.length - 16);
        const authTagData = Buffer.alloc(16);
        encryptedData.copy(messageData, 0, 0, encryptedData.length - 16);
        encryptedData.copy(authTagData, 0, encryptedData.length - 16, encryptedData.length);
        const S_private = srpServer.computeK();
        const encSalt = Buffer.from("Pair-Setup-Encrypt-Salt");
        const encInfo = Buffer.from("Pair-Setup-Encrypt-Info");
        const outputKey = hapCrypto.HKDF("sha512", encSalt, S_private, encInfo, 32);
        let plaintext;
        try {
            plaintext = hapCrypto.chacha20_poly1305_decryptAndVerify(outputKey, Buffer.from("PS-Msg05"), null, messageData, authTagData);
        }
        catch (error) {
            debug("[%s] Error while decrypting and verifying M5 subTlv: %s", this.accessoryInfo.username, error);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.SEQUENCE_NUM */, 4 /* PairingStates.M4 */, 7 /* TLVValues.ERROR_CODE */, 2 /* TLVErrorCode.AUTHENTICATION */));
            connection._pairSetupState = undefined;
            return;
        }
        // decode the client payload and pass it on to the next step
        let M5Packet;
        try {
            M5Packet = tlv.decode(plaintext);
        }
        catch (error) {
            debug("[%s] M5: Failed to decode decrypted TLV payload: %s", this.accessoryInfo.username, error.message);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.SEQUENCE_NUM */, 4 /* PairingStates.M4 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
            connection._pairSetupState = undefined;
            return;
        }
        const clientUsername = M5Packet[1 /* TLVValues.USERNAME */];
        const clientLTPK = M5Packet[3 /* TLVValues.PUBLIC_KEY */];
        const clientProof = M5Packet[10 /* TLVValues.PROOF */];
        if (!clientUsername || !clientLTPK || !clientProof) {
            debug("[%s] M5: Missing required TLV fields in decrypted payload", this.accessoryInfo.username);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.SEQUENCE_NUM */, 4 /* PairingStates.M4 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
            connection._pairSetupState = undefined;
            return;
        }
        this.handlePairSetupM5_2(connection, request, response, clientUsername, clientLTPK, clientProof, outputKey);
    }
    // M5-2
    handlePairSetupM5_2(connection, request, response, clientUsername, clientLTPK, clientProof, hkdfEncKey) {
        debug("[%s] Pair step 4/5", this.accessoryInfo.username);
        const S_private = connection.srpServer.computeK();
        const controllerSalt = Buffer.from("Pair-Setup-Controller-Sign-Salt");
        const controllerInfo = Buffer.from("Pair-Setup-Controller-Sign-Info");
        const outputKey = hapCrypto.HKDF("sha512", controllerSalt, S_private, controllerInfo, 32);
        const completeData = Buffer.concat([outputKey, clientUsername, clientLTPK]);
        if (!tweetnacl_1.default.sign.detached.verify(completeData, clientProof, clientLTPK)) {
            debug("[%s] Invalid signature", this.accessoryInfo.username);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.SEQUENCE_NUM */, 6 /* PairingStates.M6 */, 7 /* TLVValues.ERROR_CODE */, 2 /* TLVErrorCode.AUTHENTICATION */));
            connection._pairSetupState = undefined;
            return;
        }
        this.handlePairSetupM5_3(connection, request, response, clientUsername, clientLTPK, hkdfEncKey);
    }
    // M5 - F + M6
    handlePairSetupM5_3(connection, request, response, clientUsername, clientLTPK, hkdfEncKey) {
        debug("[%s] Pair step 5/5", this.accessoryInfo.username);
        const S_private = connection.srpServer.computeK();
        const accessorySalt = Buffer.from("Pair-Setup-Accessory-Sign-Salt");
        const accessoryInfo = Buffer.from("Pair-Setup-Accessory-Sign-Info");
        const outputKey = hapCrypto.HKDF("sha512", accessorySalt, S_private, accessoryInfo, 32);
        const serverLTPK = this.accessoryInfo.signPk;
        const usernameData = Buffer.from(this.accessoryInfo.username);
        const material = Buffer.concat([outputKey, usernameData, serverLTPK]);
        const privateKey = Buffer.from(this.accessoryInfo.signSk);
        const serverProof = tweetnacl_1.default.sign.detached(material, privateKey);
        const message = tlv.encode(1 /* TLVValues.USERNAME */, usernameData, 3 /* TLVValues.PUBLIC_KEY */, serverLTPK, 10 /* TLVValues.PROOF */, serverProof);
        const encrypted = hapCrypto.chacha20_poly1305_encryptAndSeal(hkdfEncKey, Buffer.from("PS-Msg06"), null, message);
        // finally, notify listeners that we have been paired with a client
        this.emit("pair" /* HAPServerEventTypes.PAIR */, clientUsername.toString(), clientLTPK, (0, once_1.once)(err => {
            if (err) {
                debug("[%s] Error adding pairing info: %s", this.accessoryInfo.username, err.message);
                response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
                response.end(tlv.encode(6 /* TLVValues.SEQUENCE_NUM */, 6 /* PairingStates.M6 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
                connection._pairSetupState = undefined;
                return;
            }
            // send final pairing response to client
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.SEQUENCE_NUM */, 6 /* PairingStates.M6 */, 5 /* TLVValues.ENCRYPTED_DATA */, Buffer.concat([encrypted.ciphertext, encrypted.authTag])));
            connection._pairSetupState = undefined;
        }));
    }
    handlePairVerify(connection, url, request, data, response) {
        let tlvData;
        try {
            tlvData = tlv.decode(data);
        }
        catch (error) {
            debug("[%s] Pair-Verify: failed to decode TLV request: %s", this.accessoryInfo.username, error.message);
            response.writeHead(400 /* HAPPairingHTTPCode.BAD_REQUEST */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
            return;
        }
        if (!tlvData[6 /* TLVValues.SEQUENCE_NUM */]) {
            response.writeHead(400 /* HAPPairingHTTPCode.BAD_REQUEST */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
            return;
        }
        const sequence = tlvData[6 /* TLVValues.SEQUENCE_NUM */][0]; // value is single byte with sequence number
        if (sequence === 1 /* PairingStates.M1 */) {
            this.handlePairVerifyM1(connection, request, response, tlvData);
        }
        else if (sequence === 3 /* PairingStates.M3 */ && connection._pairVerifyState === 2 /* PairingStates.M2 */) {
            this.handlePairVerifyM3(connection, request, response, tlvData);
        }
        else {
            // Invalid state/sequence number
            response.writeHead(400 /* HAPPairingHTTPCode.BAD_REQUEST */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, sequence + 1, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
            return;
        }
    }
    handlePairVerifyM1(connection, request, response, tlvData) {
        debug("[%s] Pair verify step 1/2", this.accessoryInfo.username);
        const clientPublicKey = tlvData[3 /* TLVValues.PUBLIC_KEY */]; // Buffer
        // generate new encryption keys for this session
        const keyPair = hapCrypto.generateCurve25519KeyPair();
        const secretKey = Buffer.from(keyPair.secretKey);
        const publicKey = Buffer.from(keyPair.publicKey);
        const sharedSec = Buffer.from(hapCrypto.generateCurve25519SharedSecKey(secretKey, clientPublicKey));
        const usernameData = Buffer.from(this.accessoryInfo.username);
        const material = Buffer.concat([publicKey, usernameData, clientPublicKey]);
        const privateKey = Buffer.from(this.accessoryInfo.signSk);
        const serverProof = tweetnacl_1.default.sign.detached(material, privateKey);
        const encSalt = Buffer.from("Pair-Verify-Encrypt-Salt");
        const encInfo = Buffer.from("Pair-Verify-Encrypt-Info");
        const outputKey = hapCrypto.HKDF("sha512", encSalt, sharedSec, encInfo, 32).subarray(0, 32);
        connection.encryption = new eventedhttp_1.HAPEncryption(clientPublicKey, secretKey, publicKey, sharedSec, outputKey);
        // compose the response data in TLV format
        const message = tlv.encode(1 /* TLVValues.USERNAME */, usernameData, 10 /* TLVValues.PROOF */, serverProof);
        const encrypted = hapCrypto.chacha20_poly1305_encryptAndSeal(outputKey, Buffer.from("PV-Msg02"), null, message);
        response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
        response.end(tlv.encode(6 /* TLVValues.SEQUENCE_NUM */, 2 /* PairingStates.M2 */, 5 /* TLVValues.ENCRYPTED_DATA */, Buffer.concat([encrypted.ciphertext, encrypted.authTag]), 3 /* TLVValues.PUBLIC_KEY */, publicKey));
        connection._pairVerifyState = 2 /* PairingStates.M2 */;
    }
    handlePairVerifyM3(connection, request, response, objects) {
        debug("[%s] Pair verify step 2/2", this.accessoryInfo.username);
        const encryptedData = objects[5 /* TLVValues.ENCRYPTED_DATA */];
        if (!encryptedData || encryptedData.length < 16) {
            debug("[%s] M3: Encrypted data missing or too short", this.accessoryInfo.username);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 4 /* PairingStates.M4 */, 7 /* TLVValues.ERROR_CODE */, 2 /* TLVErrorCode.AUTHENTICATION */));
            connection._pairVerifyState = undefined;
            return;
        }
        const messageData = Buffer.alloc(encryptedData.length - 16);
        const authTagData = Buffer.alloc(16);
        encryptedData.copy(messageData, 0, 0, encryptedData.length - 16);
        encryptedData.copy(authTagData, 0, encryptedData.length - 16, encryptedData.length);
        // instance of HAPEncryption (created in handlePairVerifyStepOne)
        const enc = connection.encryption;
        let plaintext;
        try {
            plaintext = hapCrypto.chacha20_poly1305_decryptAndVerify(enc.hkdfPairEncryptionKey, Buffer.from("PV-Msg03"), null, messageData, authTagData);
        }
        catch (error) {
            debug("[%s] M3: Failed to decrypt and/or verify: %s", this.accessoryInfo.username, error);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 4 /* PairingStates.M4 */, 7 /* TLVValues.ERROR_CODE */, 2 /* TLVErrorCode.AUTHENTICATION */));
            connection._pairVerifyState = undefined;
            return;
        }
        let decoded;
        try {
            decoded = tlv.decode(plaintext);
        }
        catch (error) {
            debug("[%s] M3: Failed to decode decrypted TLV payload: %s", this.accessoryInfo.username, error.message);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 4 /* PairingStates.M4 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
            connection._pairVerifyState = undefined;
            return;
        }
        const clientUsername = decoded[1 /* TLVValues.USERNAME */];
        const proof = decoded[10 /* TLVValues.PROOF */];
        if (!clientUsername || !proof) {
            debug("[%s] M3: Missing required TLV fields in decrypted payload", this.accessoryInfo.username);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 4 /* PairingStates.M4 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
            connection._pairVerifyState = undefined;
            return;
        }
        const material = Buffer.concat([enc.clientPublicKey, clientUsername, enc.publicKey]);
        // since we're paired, we should have the public key stored for this client
        const clientPublicKey = this.accessoryInfo.getClientPublicKey(clientUsername.toString());
        // if we're not actually paired, then there's nothing to verify - this client thinks it's paired with us, but we
        // disagree. Respond with invalid request (seems to match HomeKit Accessory Simulator behavior)
        if (!clientPublicKey) {
            debug("[%s] Client %s attempting to verify, but we are not paired; rejecting client", this.accessoryInfo.username, clientUsername);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 4 /* PairingStates.M4 */, 7 /* TLVValues.ERROR_CODE */, 2 /* TLVErrorCode.AUTHENTICATION */));
            connection._pairVerifyState = undefined;
            return;
        }
        if (!tweetnacl_1.default.sign.detached.verify(material, proof, clientPublicKey)) {
            debug("[%s] Client %s provided an invalid signature", this.accessoryInfo.username, clientUsername);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 4 /* PairingStates.M4 */, 7 /* TLVValues.ERROR_CODE */, 2 /* TLVErrorCode.AUTHENTICATION */));
            connection._pairVerifyState = undefined;
            return;
        }
        debug("[%s] Client %s verification complete", this.accessoryInfo.username, clientUsername);
        response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
        response.end(tlv.encode(6 /* TLVValues.SEQUENCE_NUM */, 4 /* PairingStates.M4 */));
        // now that the client has been verified, we must "upgrade" our pseudo-HTTP connection to include
        // TCP-level encryption. We'll do this by adding some more encryption vars to the session, and using them
        // in future calls to onEncrypt, onDecrypt.
        const encSalt = Buffer.from("Control-Salt");
        const infoRead = Buffer.from("Control-Read-Encryption-Key");
        const infoWrite = Buffer.from("Control-Write-Encryption-Key");
        enc.accessoryToControllerKey = hapCrypto.HKDF("sha512", encSalt, enc.sharedSecret, infoRead, 32);
        enc.controllerToAccessoryKey = hapCrypto.HKDF("sha512", encSalt, enc.sharedSecret, infoWrite, 32);
        // Our connection is now completely setup. We now want to subscribe this connection to special
        connection.connectionAuthenticated(clientUsername.toString());
        connection._pairVerifyState = undefined;
    }
    handlePairings(connection, url, request, data, response) {
        // Only accept /pairing request if there is a secure session
        if (!this.allowInsecureRequest && !connection.isAuthenticated()) {
            response.writeHead(470 /* HAPPairingHTTPCode.CONNECTION_AUTHORIZATION_REQUIRED */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
            response.end(JSON.stringify({ status: -70401 /* HAPStatus.INSUFFICIENT_PRIVILEGES */ }));
            return;
        }
        let objects;
        try {
            objects = tlv.decode(data);
        }
        catch (error) {
            debug("[%s] Pairings: failed to decode TLV request: %s", this.accessoryInfo.username, error.message);
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
            return;
        }
        if (!objects[0 /* TLVValues.METHOD */] || !objects[6 /* TLVValues.STATE */]) {
            response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
            return;
        }
        const method = objects[0 /* TLVValues.METHOD */][0]; // value is single byte with request type
        const state = objects[6 /* TLVValues.STATE */][0];
        if (state !== 1 /* PairingStates.M1 */) {
            return;
        }
        if (method === 3 /* PairMethods.ADD_PAIRING */) {
            if (!objects[1 /* TLVValues.IDENTIFIER */] || !objects[3 /* TLVValues.PUBLIC_KEY */] || !objects[11 /* TLVValues.PERMISSIONS */]) {
                response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
                response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
                return;
            }
            const identifier = objects[1 /* TLVValues.IDENTIFIER */].toString();
            const publicKey = objects[3 /* TLVValues.PUBLIC_KEY */];
            const permissions = objects[11 /* TLVValues.PERMISSIONS */][0];
            this.emit("add-pairing" /* HAPServerEventTypes.ADD_PAIRING */, connection, identifier, publicKey, permissions, (0, once_1.once)((error) => {
                if (error > 0) {
                    debug("[%s] Pairings: failed ADD_PAIRING with code %d", this.accessoryInfo.username, error);
                    response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
                    response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, error));
                    return;
                }
                response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
                response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */));
                debug("[%s] Pairings: successfully executed ADD_PAIRING", this.accessoryInfo.username);
            }));
        }
        else if (method === 4 /* PairMethods.REMOVE_PAIRING */) {
            if (!objects[1 /* TLVValues.IDENTIFIER */]) {
                response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
                response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, 1 /* TLVErrorCode.UNKNOWN */));
                return;
            }
            const identifier = objects[1 /* TLVValues.IDENTIFIER */].toString();
            this.emit("remove-pairing" /* HAPServerEventTypes.REMOVE_PAIRING */, connection, identifier, (0, once_1.once)((error) => {
                if (error > 0) {
                    debug("[%s] Pairings: failed REMOVE_PAIRING with code %d", this.accessoryInfo.username, error);
                    response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
                    response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, error));
                    return;
                }
                response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
                response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */));
                debug("[%s] Pairings: successfully executed REMOVE_PAIRING", this.accessoryInfo.username);
            }));
        }
        else if (method === 5 /* PairMethods.LIST_PAIRINGS */) {
            this.emit("list-pairings" /* HAPServerEventTypes.LIST_PAIRINGS */, connection, (0, once_1.once)((error, data) => {
                if (error > 0) {
                    debug("[%s] Pairings: failed LIST_PAIRINGS with code %d", this.accessoryInfo.username, error);
                    response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" });
                    response.end(tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, 7 /* TLVValues.ERROR_CODE */, error));
                    return;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const tlvList = [];
                data.forEach((value, index) => {
                    if (index > 0) {
                        tlvList.push(255 /* TLVValues.SEPARATOR */, Buffer.alloc(0));
                    }
                    tlvList.push(1 /* TLVValues.IDENTIFIER */, value.username, 3 /* TLVValues.PUBLIC_KEY */, value.publicKey, 11 /* TLVValues.PERMISSIONS */, value.permission);
                });
                const list = tlv.encode(6 /* TLVValues.STATE */, 2 /* PairingStates.M2 */, ...tlvList);
                response.writeHead(200 /* HAPPairingHTTPCode.OK */, { "Content-Type": "application/pairing+tlv8" /* HAPMimeTypes.PAIRING_TLV8 */ });
                response.end(list);
                debug("[%s] Pairings: successfully executed LIST_PAIRINGS", this.accessoryInfo.username);
            }));
        }
    }
    handleAccessories(connection, url, request, data, response) {
        if (!this.allowInsecureRequest && !connection.isAuthenticated()) {
            response.writeHead(470 /* HAPPairingHTTPCode.CONNECTION_AUTHORIZATION_REQUIRED */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
            response.end(JSON.stringify({ status: -70401 /* HAPStatus.INSUFFICIENT_PRIVILEGES */ }));
            return;
        }
        // call out to listeners to retrieve the latest accessories JSON
        this.emit("accessories" /* HAPServerEventTypes.ACCESSORIES */, connection, (0, once_1.once)((error, result) => {
            if (error) {
                response.writeHead(error.httpCode, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                response.end(JSON.stringify({ status: error.status }));
            }
            else {
                response.writeHead(200 /* HAPHTTPCode.OK */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                response.end(JSON.stringify(result));
            }
        }));
    }
    handleCharacteristics(connection, url, request, data, response) {
        if (!this.allowInsecureRequest && !connection.isAuthenticated()) {
            response.writeHead(470 /* HAPPairingHTTPCode.CONNECTION_AUTHORIZATION_REQUIRED */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
            response.end(JSON.stringify({ status: -70401 /* HAPStatus.INSUFFICIENT_PRIVILEGES */ }));
            return;
        }
        if (request.method === "GET") {
            const searchParams = url.searchParams;
            const idParam = searchParams.get("id");
            if (!idParam) {
                response.writeHead(400 /* HAPHTTPCode.BAD_REQUEST */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                response.end(JSON.stringify({ status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ }));
                return;
            }
            const ids = [];
            for (const entry of idParam.split(",")) { // ["1.9","2.14"]
                const split = entry.split("."); // ["1","9"]
                if (split.length !== 2 || !/^\d+$/.test(split[0]) || !/^\d+$/.test(split[1])) {
                    response.writeHead(400 /* HAPHTTPCode.BAD_REQUEST */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                    response.end(JSON.stringify({ status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ }));
                    return;
                }
                ids.push({
                    aid: parseInt(split[0], 10), // accessory id
                    iid: parseInt(split[1], 10), // (characteristic) instance id
                });
            }
            const readRequest = {
                ids: ids,
                includeMeta: (0, internal_types_1.consideredTrue)(searchParams.get("meta")),
                includePerms: (0, internal_types_1.consideredTrue)(searchParams.get("perms")),
                includeType: (0, internal_types_1.consideredTrue)(searchParams.get("type")),
                includeEvent: (0, internal_types_1.consideredTrue)(searchParams.get("ev")),
            };
            this.emit("get-characteristics" /* HAPServerEventTypes.GET_CHARACTERISTICS */, connection, readRequest, (0, once_1.once)((error, readResponse) => {
                if (error) {
                    response.writeHead(error.httpCode, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                    response.end(JSON.stringify({ status: error.status }));
                    return;
                }
                const characteristics = readResponse.characteristics;
                let errorOccurred = false; // determine if we send a 207 Multi-Status
                for (const data of characteristics) {
                    if (data.status) {
                        errorOccurred = true;
                        break;
                    }
                }
                if (errorOccurred) { // on a 207 Multi-Status EVERY characteristic MUST include a status property
                    for (const data of characteristics) {
                        if (!data.status) { // a status is undefined if the request was successful
                            data.status = 0 /* HAPStatus.SUCCESS */; // a value of zero indicates success
                        }
                    }
                }
                // 207 "multi-status" is returned when an error occurs reading a characteristic. otherwise 200 is returned
                response.writeHead(errorOccurred ? 207 /* HAPHTTPCode.MULTI_STATUS */ : 200 /* HAPHTTPCode.OK */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                response.end(JSON.stringify({ characteristics: characteristics }));
            }));
        }
        else if (request.method === "PUT") {
            if (!connection.isAuthenticated()) {
                const authorization = request.headers?.authorization;
                const authorizationBuffer = authorization ? Buffer.from(authorization) : undefined;
                const pincodeBuffer = Buffer.from(this.accessoryInfo.pincode);
                if (!authorizationBuffer
                    || authorizationBuffer.length !== pincodeBuffer.length
                    || !crypto_1.default.timingSafeEqual(authorizationBuffer, pincodeBuffer)) {
                    response.writeHead(470 /* HAPPairingHTTPCode.CONNECTION_AUTHORIZATION_REQUIRED */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                    response.end(JSON.stringify({ status: -70401 /* HAPStatus.INSUFFICIENT_PRIVILEGES */ }));
                    return;
                }
            }
            if (data.length === 0) {
                response.writeHead(400 /* HAPHTTPCode.BAD_REQUEST */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                response.end(JSON.stringify({ status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ }));
                return;
            }
            const writeRequest = JSON.parse(data.toString("utf8"));
            this.emit("set-characteristics" /* HAPServerEventTypes.SET_CHARACTERISTICS */, connection, writeRequest, (0, once_1.once)((error, writeResponse) => {
                if (error) {
                    response.writeHead(error.httpCode, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                    response.end(JSON.stringify({ status: error.status }));
                    return;
                }
                const characteristics = writeResponse.characteristics;
                let multiStatus = false;
                for (const data of characteristics) {
                    if (data.status || data.value !== undefined) {
                        // also send multiStatus on write response requests
                        multiStatus = true;
                        break;
                    }
                }
                if (multiStatus) {
                    // 207 is "multi-status" since HomeKit may be setting multiple things and any one can fail independently
                    response.writeHead(207 /* HAPHTTPCode.MULTI_STATUS */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                    response.end(JSON.stringify({ characteristics: characteristics }));
                }
                else {
                    // if everything went fine send 204 no content response
                    response.writeHead(204 /* HAPHTTPCode.NO_CONTENT */);
                    response.end();
                }
            }));
        }
        else {
            response.writeHead(400 /* HAPHTTPCode.BAD_REQUEST */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ }); // method not allowed
            response.end(JSON.stringify({ status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ }));
        }
    }
    handlePrepareWrite(connection, url, request, data, response) {
        if (!this.allowInsecureRequest && !connection.isAuthenticated()) {
            response.writeHead(470 /* HAPPairingHTTPCode.CONNECTION_AUTHORIZATION_REQUIRED */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
            response.end(JSON.stringify({ status: -70401 /* HAPStatus.INSUFFICIENT_PRIVILEGES */ }));
            return;
        }
        if (request.method === "PUT") {
            if (data.length === 0) {
                response.writeHead(400 /* HAPHTTPCode.BAD_REQUEST */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                response.end(JSON.stringify({ status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ }));
                return;
            }
            const prepareRequest = JSON.parse(data.toString());
            if (prepareRequest.pid && prepareRequest.ttl) {
                debug("[%s] Received prepare write request with pid %d and ttl %d", this.accessoryInfo.username, prepareRequest.pid, prepareRequest.ttl);
                if (connection.timedWriteTimeout) { // clear any currently existing timeouts
                    clearTimeout(connection.timedWriteTimeout);
                }
                connection.timedWritePid = prepareRequest.pid;
                connection.timedWriteTimeout = setTimeout(() => {
                    debug("[%s] Timed write request timed out for pid %d", this.accessoryInfo.username, prepareRequest.pid);
                    connection.timedWritePid = undefined;
                    connection.timedWriteTimeout = undefined;
                }, prepareRequest.ttl);
                response.writeHead(200 /* HAPHTTPCode.OK */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                response.end(JSON.stringify({ status: 0 /* HAPStatus.SUCCESS */ }));
                return;
            }
            else {
                response.writeHead(400 /* HAPHTTPCode.BAD_REQUEST */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                response.end(JSON.stringify({ status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ }));
            }
        }
        else {
            response.writeHead(400 /* HAPHTTPCode.BAD_REQUEST */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
            response.end(JSON.stringify({ status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ }));
        }
    }
    handleResource(connection, url, request, data, response) {
        if (!connection.isAuthenticated()) {
            const authorization = request.headers?.authorization;
            const authorizationBuffer = authorization ? Buffer.from(authorization) : undefined;
            const pincodeBuffer = Buffer.from(this.accessoryInfo.pincode);
            if (!(this.allowInsecureRequest && authorizationBuffer
                && authorizationBuffer.length === pincodeBuffer.length
                && crypto_1.default.timingSafeEqual(authorizationBuffer, pincodeBuffer))) {
                response.writeHead(470 /* HAPPairingHTTPCode.CONNECTION_AUTHORIZATION_REQUIRED */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                response.end(JSON.stringify({ status: -70401 /* HAPStatus.INSUFFICIENT_PRIVILEGES */ }));
                return;
            }
        }
        if (request.method === "POST") {
            if (data.length === 0) {
                response.writeHead(400 /* HAPHTTPCode.BAD_REQUEST */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                response.end(JSON.stringify({ status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ }));
                return;
            }
            const resourceRequest = JSON.parse(data.toString());
            // call out to listeners to retrieve the resource, snapshot only right now
            this.emit("request-resource" /* HAPServerEventTypes.REQUEST_RESOURCE */, resourceRequest, (0, once_1.once)((error, resource) => {
                if (error) {
                    response.writeHead(error.httpCode, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ });
                    response.end(JSON.stringify({ status: error.status }));
                }
                else {
                    response.writeHead(200 /* HAPHTTPCode.OK */, { "Content-Type": "image/jpeg" /* HAPMimeTypes.IMAGE_JPEG */ });
                    response.end(resource);
                }
            }));
        }
        else {
            response.writeHead(400 /* HAPHTTPCode.BAD_REQUEST */, { "Content-Type": "application/hap+json" /* HAPMimeTypes.HAP_JSON */ }); // method not allowed
            response.end(JSON.stringify({ status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ }));
        }
    }
}
exports.HAPServer = HAPServer;
//# sourceMappingURL=HAPServer.js.map