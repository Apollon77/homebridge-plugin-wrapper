"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HAPServer = exports.HAPServerEventTypes = exports.HAPPairingHTTPCode = exports.HAPHTTPCode = exports.Status = exports.Codes = exports.IsKnownHAPStatusError = exports.HAPStatus = exports.TLVErrorCode = void 0;
var tslib_1 = require("tslib");
var crypto_1 = (0, tslib_1.__importDefault)(require("crypto"));
var debug_1 = (0, tslib_1.__importDefault)(require("debug"));
var events_1 = require("events");
var fast_srp_hap_1 = require("fast-srp-hap");
var tweetnacl_1 = (0, tslib_1.__importDefault)(require("tweetnacl"));
var url_1 = require("url");
var internal_types_1 = require("../internal-types");
var eventedhttp_1 = require("./util/eventedhttp");
var hapCrypto = (0, tslib_1.__importStar)(require("./util/hapCrypto"));
var once_1 = require("./util/once");
var tlv = (0, tslib_1.__importStar)(require("./util/tlv"));
var debug = (0, debug_1.default)("HAP-NodeJS:HAPServer");
var TLVValues;
(function (TLVValues) {
    // noinspection JSUnusedGlobalSymbols
    TLVValues[TLVValues["REQUEST_TYPE"] = 0] = "REQUEST_TYPE";
    TLVValues[TLVValues["METHOD"] = 0] = "METHOD";
    TLVValues[TLVValues["USERNAME"] = 1] = "USERNAME";
    TLVValues[TLVValues["IDENTIFIER"] = 1] = "IDENTIFIER";
    TLVValues[TLVValues["SALT"] = 2] = "SALT";
    TLVValues[TLVValues["PUBLIC_KEY"] = 3] = "PUBLIC_KEY";
    TLVValues[TLVValues["PASSWORD_PROOF"] = 4] = "PASSWORD_PROOF";
    TLVValues[TLVValues["ENCRYPTED_DATA"] = 5] = "ENCRYPTED_DATA";
    TLVValues[TLVValues["SEQUENCE_NUM"] = 6] = "SEQUENCE_NUM";
    TLVValues[TLVValues["STATE"] = 6] = "STATE";
    TLVValues[TLVValues["ERROR_CODE"] = 7] = "ERROR_CODE";
    TLVValues[TLVValues["RETRY_DELAY"] = 8] = "RETRY_DELAY";
    TLVValues[TLVValues["CERTIFICATE"] = 9] = "CERTIFICATE";
    TLVValues[TLVValues["PROOF"] = 10] = "PROOF";
    TLVValues[TLVValues["SIGNATURE"] = 10] = "SIGNATURE";
    TLVValues[TLVValues["PERMISSIONS"] = 11] = "PERMISSIONS";
    TLVValues[TLVValues["FRAGMENT_DATA"] = 12] = "FRAGMENT_DATA";
    TLVValues[TLVValues["FRAGMENT_LAST"] = 13] = "FRAGMENT_LAST";
    TLVValues[TLVValues["SEPARATOR"] = 255] = "SEPARATOR"; // Zero-length TLV that separates different TLVs in a list.
})(TLVValues || (TLVValues = {}));
var PairMethods;
(function (PairMethods) {
    // noinspection JSUnusedGlobalSymbols
    PairMethods[PairMethods["PAIR_SETUP"] = 0] = "PAIR_SETUP";
    PairMethods[PairMethods["PAIR_SETUP_WITH_AUTH"] = 1] = "PAIR_SETUP_WITH_AUTH";
    PairMethods[PairMethods["PAIR_VERIFY"] = 2] = "PAIR_VERIFY";
    PairMethods[PairMethods["ADD_PAIRING"] = 3] = "ADD_PAIRING";
    PairMethods[PairMethods["REMOVE_PAIRING"] = 4] = "REMOVE_PAIRING";
    PairMethods[PairMethods["LIST_PAIRINGS"] = 5] = "LIST_PAIRINGS";
})(PairMethods || (PairMethods = {}));
/**
 * Pairing states (pair-setup or pair-verify). Encoded in {@link TLVValues.SEQUENCE_NUM}.
 */
var PairingStates;
(function (PairingStates) {
    PairingStates[PairingStates["M1"] = 1] = "M1";
    PairingStates[PairingStates["M2"] = 2] = "M2";
    PairingStates[PairingStates["M3"] = 3] = "M3";
    PairingStates[PairingStates["M4"] = 4] = "M4";
    PairingStates[PairingStates["M5"] = 5] = "M5";
    PairingStates[PairingStates["M6"] = 6] = "M6";
})(PairingStates || (PairingStates = {}));
/**
 * TLV error codes for the {@link TLVValues.ERROR_CODE} field.
 */
var TLVErrorCode;
(function (TLVErrorCode) {
    // noinspection JSUnusedGlobalSymbols
    TLVErrorCode[TLVErrorCode["UNKNOWN"] = 1] = "UNKNOWN";
    TLVErrorCode[TLVErrorCode["INVALID_REQUEST"] = 2] = "INVALID_REQUEST";
    TLVErrorCode[TLVErrorCode["AUTHENTICATION"] = 2] = "AUTHENTICATION";
    TLVErrorCode[TLVErrorCode["BACKOFF"] = 3] = "BACKOFF";
    TLVErrorCode[TLVErrorCode["MAX_PEERS"] = 4] = "MAX_PEERS";
    TLVErrorCode[TLVErrorCode["MAX_TRIES"] = 5] = "MAX_TRIES";
    TLVErrorCode[TLVErrorCode["UNAVAILABLE"] = 6] = "UNAVAILABLE";
    TLVErrorCode[TLVErrorCode["BUSY"] = 7] = "BUSY"; // cannot accept pairing request at this time
})(TLVErrorCode = exports.TLVErrorCode || (exports.TLVErrorCode = {}));
var HAPStatus;
(function (HAPStatus) {
    // noinspection JSUnusedGlobalSymbols
    HAPStatus[HAPStatus["SUCCESS"] = 0] = "SUCCESS";
    HAPStatus[HAPStatus["INSUFFICIENT_PRIVILEGES"] = -70401] = "INSUFFICIENT_PRIVILEGES";
    HAPStatus[HAPStatus["SERVICE_COMMUNICATION_FAILURE"] = -70402] = "SERVICE_COMMUNICATION_FAILURE";
    HAPStatus[HAPStatus["RESOURCE_BUSY"] = -70403] = "RESOURCE_BUSY";
    HAPStatus[HAPStatus["READ_ONLY_CHARACTERISTIC"] = -70404] = "READ_ONLY_CHARACTERISTIC";
    HAPStatus[HAPStatus["WRITE_ONLY_CHARACTERISTIC"] = -70405] = "WRITE_ONLY_CHARACTERISTIC";
    HAPStatus[HAPStatus["NOTIFICATION_NOT_SUPPORTED"] = -70406] = "NOTIFICATION_NOT_SUPPORTED";
    HAPStatus[HAPStatus["OUT_OF_RESOURCE"] = -70407] = "OUT_OF_RESOURCE";
    HAPStatus[HAPStatus["OPERATION_TIMED_OUT"] = -70408] = "OPERATION_TIMED_OUT";
    HAPStatus[HAPStatus["RESOURCE_DOES_NOT_EXIST"] = -70409] = "RESOURCE_DOES_NOT_EXIST";
    HAPStatus[HAPStatus["INVALID_VALUE_IN_REQUEST"] = -70410] = "INVALID_VALUE_IN_REQUEST";
    HAPStatus[HAPStatus["INSUFFICIENT_AUTHORIZATION"] = -70411] = "INSUFFICIENT_AUTHORIZATION";
    HAPStatus[HAPStatus["NOT_ALLOWED_IN_CURRENT_STATE"] = -70412] = "NOT_ALLOWED_IN_CURRENT_STATE";
    // when adding new status codes, remember to update bounds in IsKnownHAPStatusError below
})(HAPStatus = exports.HAPStatus || (exports.HAPStatus = {}));
/**
 * Determines if the given status code is a known {@link HAPStatus} error code.
 */
function IsKnownHAPStatusError(status) {
    return (
    // Lower bound (most negative error code)
    status >= -70412 /* NOT_ALLOWED_IN_CURRENT_STATE */ &&
        // Upper bound (negative error code closest to zero)
        status <= -70401 /* INSUFFICIENT_PRIVILEGES */);
}
exports.IsKnownHAPStatusError = IsKnownHAPStatusError;
// noinspection JSUnusedGlobalSymbols
/**
 * @deprecated please use {@link TLVErrorCode} as naming is more precise
 */
// @ts-expect-error (as we use const enums with --preserveConstEnums)
exports.Codes = TLVErrorCode;
// noinspection JSUnusedGlobalSymbols
/**
 * @deprecated please use {@link HAPStatus} as naming is more precise
 */
// @ts-expect-error (as we use const enums with --preserveConstEnums)
exports.Status = HAPStatus;
/**
 * Those status codes are the one listed as appropriate for the HAP spec!
 *
 * When the response is a client error 4xx or server error 5xx, the response
 * must include a status {@link HAPStatus} property.
 *
 * When the response is a MULTI_STATUS EVERY entry in the characteristics property MUST include a status property (even success).
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
})(HAPHTTPCode = exports.HAPHTTPCode || (exports.HAPHTTPCode = {}));
/**
 * When in a request is made to the pairing endpoints, and mime type is 'application/pairing+tlv8'
 * one should use the below status codes.
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
})(HAPPairingHTTPCode = exports.HAPPairingHTTPCode || (exports.HAPPairingHTTPCode = {}));
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
})(HAPServerEventTypes = exports.HAPServerEventTypes || (exports.HAPServerEventTypes = {}));
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
var HAPServer = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(HAPServer, _super);
    function HAPServer(accessoryInfo) {
        var _this = _super.call(this) || this;
        _this.unsuccessfulPairAttempts = 0; // after 100 unsuccessful attempts the server won't accept any further attempts. Will currently be reset on a reboot
        _this.accessoryInfo = accessoryInfo;
        _this.allowInsecureRequest = false;
        // internal server that does all the actual communication
        _this.httpServer = new eventedhttp_1.EventedHTTPServer();
        _this.httpServer.on("listening" /* LISTENING */, _this.onListening.bind(_this));
        _this.httpServer.on("request" /* REQUEST */, _this.handleRequestOnHAPConnection.bind(_this));
        _this.httpServer.on("connection-closed" /* CONNECTION_CLOSED */, _this.handleConnectionClosed.bind(_this));
        return _this;
    }
    HAPServer.prototype.listen = function (port, host) {
        if (port === void 0) { port = 0; }
        if (host === "::") {
            // this will workaround "EAFNOSUPPORT: address family not supported" errors
            // on systems where IPv6 is not supported/enabled, we just use the node default then by supplying undefined
            host = undefined;
        }
        this.httpServer.listen(port, host);
    };
    HAPServer.prototype.stop = function () {
        this.httpServer.stop();
    };
    HAPServer.prototype.destroy = function () {
        this.stop();
        this.removeAllListeners();
    };
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
    HAPServer.prototype.sendEventNotifications = function (aid, iid, value, originator, immediateDelivery) {
        try {
            this.httpServer.broadcastEvent(aid, iid, value, originator, immediateDelivery);
        }
        catch (error) {
            console.warn("[" + this.accessoryInfo.username + "] Error when sending event notifications: " + error.message);
        }
    };
    HAPServer.prototype.onListening = function (port, hostname) {
        this.emit("listening" /* LISTENING */, port, hostname);
    };
    // Called when an HTTP request was detected.
    HAPServer.prototype.handleRequestOnHAPConnection = function (connection, request, response) {
        var _this = this;
        debug("[%s] HAP Request: %s %s", this.accessoryInfo.username, request.method, request.url);
        var buffers = [];
        request.on("data", function (data) { return buffers.push(data); });
        request.on("end", function () {
            var url = new url_1.URL(request.url, "http://hap-nodejs.local"); // parse the url (query strings etc)
            var handler = _this.getHandler(url); // TODO check that content-type is supported by the handler?
            if (!handler) {
                debug("[%s] WARNING: Handler for %s not implemented", _this.accessoryInfo.username, request.url);
                response.writeHead(404 /* NOT_FOUND */, { "Content-Type": "application/hap+json" });
                response.end(JSON.stringify({ status: -70409 /* RESOURCE_DOES_NOT_EXIST */ }));
            }
            else {
                var data = Buffer.concat(buffers);
                try {
                    handler(connection, url, request, data, response);
                }
                catch (error) {
                    debug("[%s] Error executing route handler: %s", _this.accessoryInfo.username, error.stack);
                    response.writeHead(500 /* INTERNAL_SERVER_ERROR */, { "Content-Type": "application/hap+json" });
                    response.end(JSON.stringify({ status: -70403 /* RESOURCE_BUSY */ })); // resource busy try again, does somehow fit?
                }
            }
        });
    };
    HAPServer.prototype.handleConnectionClosed = function (connection) {
        this.emit("connection-closed" /* CONNECTION_CLOSED */, connection);
    };
    HAPServer.prototype.getHandler = function (url) {
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
    };
    /**
     * UNPAIRED Accessory identification.
     */
    HAPServer.prototype.handleIdentifyRequest = function (connection, url, request, data, response) {
        var _this = this;
        // POST body is empty
        if (!this.allowInsecureRequest && this.accessoryInfo.paired()) {
            response.writeHead(400 /* BAD_REQUEST */, { "Content-Type": "application/hap+json" });
            response.end(JSON.stringify({ status: -70401 /* INSUFFICIENT_PRIVILEGES */ }));
            return;
        }
        this.emit("identify" /* IDENTIFY */, (0, once_1.once)(function (err) {
            if (!err) {
                debug("[%s] Identification success", _this.accessoryInfo.username);
                response.writeHead(204 /* NO_CONTENT */);
                response.end();
            }
            else {
                debug("[%s] Identification error: %s", _this.accessoryInfo.username, err.message);
                response.writeHead(500 /* INTERNAL_SERVER_ERROR */, { "Content-Type": "application/hap+json" });
                response.end(JSON.stringify({ status: -70403 /* RESOURCE_BUSY */ }));
            }
        }));
    };
    HAPServer.prototype.handlePairSetup = function (connection, url, request, data, response) {
        // Can only be directly paired with one iOS device
        if (!this.allowInsecureRequest && this.accessoryInfo.paired()) {
            response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* STATE */, 2 /* M2 */, 7 /* ERROR_CODE */, 6 /* UNAVAILABLE */));
            return;
        }
        if (this.unsuccessfulPairAttempts > 100) {
            debug("[%s] Reached maximum amount of unsuccessful pair attempts!", this.accessoryInfo.username);
            response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* STATE */, 2 /* M2 */, 7 /* ERROR_CODE */, 5 /* MAX_TRIES */));
            return;
        }
        var tlvData = tlv.decode(data);
        var sequence = tlvData[6 /* SEQUENCE_NUM */][0]; // value is single byte with sequence number
        if (sequence === 1 /* M1 */) {
            this.handlePairSetupM1(connection, request, response);
        }
        else if (sequence === 3 /* M3 */ && connection._pairSetupState === 2 /* M2 */) {
            this.handlePairSetupM3(connection, request, response, tlvData);
        }
        else if (sequence === 5 /* M5 */ && connection._pairSetupState === 4 /* M4 */) {
            this.handlePairSetupM5(connection, request, response, tlvData);
        }
        else {
            // Invalid state/sequence number
            response.writeHead(400 /* BAD_REQUEST */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* STATE */, sequence + 1, 7 /* ERROR_CODE */, 1 /* UNKNOWN */));
            return;
        }
    };
    HAPServer.prototype.handlePairSetupM1 = function (connection, request, response) {
        var _this = this;
        debug("[%s] Pair step 1/5", this.accessoryInfo.username);
        var salt = crypto_1.default.randomBytes(16);
        var srpParams = fast_srp_hap_1.SRP.params.hap;
        fast_srp_hap_1.SRP.genKey(32).then(function (key) {
            // create a new SRP server
            var srpServer = new fast_srp_hap_1.SrpServer(srpParams, salt, Buffer.from("Pair-Setup"), Buffer.from(_this.accessoryInfo.pincode), key);
            var srpB = srpServer.computeB();
            // attach it to the current TCP session
            connection.srpServer = srpServer;
            response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* SEQUENCE_NUM */, 2 /* M2 */, 2 /* SALT */, salt, 3 /* PUBLIC_KEY */, srpB));
            connection._pairSetupState = 2 /* M2 */;
        }).catch(function (error) {
            debug("[%s] Error occurred when generating srp key: %s", _this.accessoryInfo.username, error.message);
            response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* STATE */, 2 /* M2 */, 7 /* ERROR_CODE */, 1 /* UNKNOWN */));
            return;
        });
    };
    HAPServer.prototype.handlePairSetupM3 = function (connection, request, response, tlvData) {
        debug("[%s] Pair step 2/5", this.accessoryInfo.username);
        var A = tlvData[3 /* PUBLIC_KEY */]; // "A is a public key that exists only for a single login session."
        var M1 = tlvData[4 /* PASSWORD_PROOF */]; // "M1 is the proof that you actually know your own password."
        // pull the SRP server we created in stepOne out of the current session
        var srpServer = connection.srpServer;
        srpServer.setA(A);
        try {
            srpServer.checkM1(M1);
        }
        catch (err) {
            // most likely the client supplied an incorrect pincode.
            this.unsuccessfulPairAttempts++;
            debug("[%s] Error while checking pincode: %s", this.accessoryInfo.username, err.message);
            response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* SEQUENCE_NUM */, 4 /* M4 */, 7 /* ERROR_CODE */, 2 /* AUTHENTICATION */));
            connection._pairSetupState = undefined;
            return;
        }
        // "M2 is the proof that the server actually knows your password."
        var M2 = srpServer.computeM2();
        response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
        response.end(tlv.encode(6 /* SEQUENCE_NUM */, 4 /* M4 */, 4 /* PASSWORD_PROOF */, M2));
        connection._pairSetupState = 4 /* M4 */;
    };
    HAPServer.prototype.handlePairSetupM5 = function (connection, request, response, tlvData) {
        debug("[%s] Pair step 3/5", this.accessoryInfo.username);
        // pull the SRP server we created in stepOne out of the current session
        var srpServer = connection.srpServer;
        var encryptedData = tlvData[5 /* ENCRYPTED_DATA */];
        var messageData = Buffer.alloc(encryptedData.length - 16);
        var authTagData = Buffer.alloc(16);
        encryptedData.copy(messageData, 0, 0, encryptedData.length - 16);
        encryptedData.copy(authTagData, 0, encryptedData.length - 16, encryptedData.length);
        var S_private = srpServer.computeK();
        var encSalt = Buffer.from("Pair-Setup-Encrypt-Salt");
        var encInfo = Buffer.from("Pair-Setup-Encrypt-Info");
        var outputKey = hapCrypto.HKDF("sha512", encSalt, S_private, encInfo, 32);
        var plaintext;
        try {
            plaintext = hapCrypto.chacha20_poly1305_decryptAndVerify(outputKey, Buffer.from("PS-Msg05"), null, messageData, authTagData);
        }
        catch (error) {
            debug("[%s] Error while decrypting and verifying M5 subTlv: %s", this.accessoryInfo.username);
            response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* SEQUENCE_NUM */, 4 /* M4 */, 7 /* ERROR_CODE */, 2 /* AUTHENTICATION */));
            connection._pairSetupState = undefined;
            return;
        }
        // decode the client payload and pass it on to the next step
        var M5Packet = tlv.decode(plaintext);
        var clientUsername = M5Packet[1 /* USERNAME */];
        var clientLTPK = M5Packet[3 /* PUBLIC_KEY */];
        var clientProof = M5Packet[10 /* PROOF */];
        this.handlePairSetupM5_2(connection, request, response, clientUsername, clientLTPK, clientProof, outputKey);
    };
    // M5-2
    HAPServer.prototype.handlePairSetupM5_2 = function (connection, request, response, clientUsername, clientLTPK, clientProof, hkdfEncKey) {
        debug("[%s] Pair step 4/5", this.accessoryInfo.username);
        var S_private = connection.srpServer.computeK();
        var controllerSalt = Buffer.from("Pair-Setup-Controller-Sign-Salt");
        var controllerInfo = Buffer.from("Pair-Setup-Controller-Sign-Info");
        var outputKey = hapCrypto.HKDF("sha512", controllerSalt, S_private, controllerInfo, 32);
        var completeData = Buffer.concat([outputKey, clientUsername, clientLTPK]);
        if (!tweetnacl_1.default.sign.detached.verify(completeData, clientProof, clientLTPK)) {
            debug("[%s] Invalid signature", this.accessoryInfo.username);
            response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* SEQUENCE_NUM */, 6 /* M6 */, 7 /* ERROR_CODE */, 2 /* AUTHENTICATION */));
            connection._pairSetupState = undefined;
            return;
        }
        this.handlePairSetupM5_3(connection, request, response, clientUsername, clientLTPK, hkdfEncKey);
    };
    // M5 - F + M6
    HAPServer.prototype.handlePairSetupM5_3 = function (connection, request, response, clientUsername, clientLTPK, hkdfEncKey) {
        var _this = this;
        debug("[%s] Pair step 5/5", this.accessoryInfo.username);
        var S_private = connection.srpServer.computeK();
        var accessorySalt = Buffer.from("Pair-Setup-Accessory-Sign-Salt");
        var accessoryInfo = Buffer.from("Pair-Setup-Accessory-Sign-Info");
        var outputKey = hapCrypto.HKDF("sha512", accessorySalt, S_private, accessoryInfo, 32);
        var serverLTPK = this.accessoryInfo.signPk;
        var usernameData = Buffer.from(this.accessoryInfo.username);
        var material = Buffer.concat([outputKey, usernameData, serverLTPK]);
        var privateKey = Buffer.from(this.accessoryInfo.signSk);
        var serverProof = tweetnacl_1.default.sign.detached(material, privateKey);
        var message = tlv.encode(1 /* USERNAME */, usernameData, 3 /* PUBLIC_KEY */, serverLTPK, 10 /* PROOF */, serverProof);
        var encrypted = hapCrypto.chacha20_poly1305_encryptAndSeal(hkdfEncKey, Buffer.from("PS-Msg06"), null, message);
        // finally, notify listeners that we have been paired with a client
        this.emit("pair" /* PAIR */, clientUsername.toString(), clientLTPK, (0, once_1.once)(function (err) {
            if (err) {
                debug("[%s] Error adding pairing info: %s", _this.accessoryInfo.username, err.message);
                response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
                response.end(tlv.encode(6 /* SEQUENCE_NUM */, 6 /* M6 */, 7 /* ERROR_CODE */, 1 /* UNKNOWN */));
                connection._pairSetupState = undefined;
                return;
            }
            // send final pairing response to client
            response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* SEQUENCE_NUM */, 6 /* M6 */, 5 /* ENCRYPTED_DATA */, Buffer.concat([encrypted.ciphertext, encrypted.authTag])));
            connection._pairSetupState = undefined;
        }));
    };
    HAPServer.prototype.handlePairVerify = function (connection, url, request, data, response) {
        var tlvData = tlv.decode(data);
        var sequence = tlvData[6 /* SEQUENCE_NUM */][0]; // value is single byte with sequence number
        if (sequence === 1 /* M1 */) {
            this.handlePairVerifyM1(connection, request, response, tlvData);
        }
        else if (sequence === 3 /* M3 */ && connection._pairVerifyState === 2 /* M2 */) {
            this.handlePairVerifyM2(connection, request, response, tlvData);
        }
        else {
            // Invalid state/sequence number
            response.writeHead(400 /* BAD_REQUEST */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* STATE */, sequence + 1, 7 /* ERROR_CODE */, 1 /* UNKNOWN */));
            return;
        }
    };
    HAPServer.prototype.handlePairVerifyM1 = function (connection, request, response, tlvData) {
        debug("[%s] Pair verify step 1/2", this.accessoryInfo.username);
        var clientPublicKey = tlvData[3 /* PUBLIC_KEY */]; // Buffer
        // generate new encryption keys for this session
        var keyPair = hapCrypto.generateCurve25519KeyPair();
        var secretKey = Buffer.from(keyPair.secretKey);
        var publicKey = Buffer.from(keyPair.publicKey);
        var sharedSec = Buffer.from(hapCrypto.generateCurve25519SharedSecKey(secretKey, clientPublicKey));
        var usernameData = Buffer.from(this.accessoryInfo.username);
        var material = Buffer.concat([publicKey, usernameData, clientPublicKey]);
        var privateKey = Buffer.from(this.accessoryInfo.signSk);
        var serverProof = tweetnacl_1.default.sign.detached(material, privateKey);
        var encSalt = Buffer.from("Pair-Verify-Encrypt-Salt");
        var encInfo = Buffer.from("Pair-Verify-Encrypt-Info");
        var outputKey = hapCrypto.HKDF("sha512", encSalt, sharedSec, encInfo, 32).slice(0, 32);
        connection.encryption = new eventedhttp_1.HAPEncryption(clientPublicKey, secretKey, publicKey, sharedSec, outputKey);
        // compose the response data in TLV format
        var message = tlv.encode(1 /* USERNAME */, usernameData, 10 /* PROOF */, serverProof);
        var encrypted = hapCrypto.chacha20_poly1305_encryptAndSeal(outputKey, Buffer.from("PV-Msg02"), null, message);
        response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
        response.end(tlv.encode(6 /* SEQUENCE_NUM */, 2 /* M2 */, 5 /* ENCRYPTED_DATA */, Buffer.concat([encrypted.ciphertext, encrypted.authTag]), 3 /* PUBLIC_KEY */, publicKey));
        connection._pairVerifyState = 2 /* M2 */;
    };
    HAPServer.prototype.handlePairVerifyM2 = function (connection, request, response, objects) {
        debug("[%s] Pair verify step 2/2", this.accessoryInfo.username);
        var encryptedData = objects[5 /* ENCRYPTED_DATA */];
        var messageData = Buffer.alloc(encryptedData.length - 16);
        var authTagData = Buffer.alloc(16);
        encryptedData.copy(messageData, 0, 0, encryptedData.length - 16);
        encryptedData.copy(authTagData, 0, encryptedData.length - 16, encryptedData.length);
        // instance of HAPEncryption (created in handlePairVerifyStepOne)
        var enc = connection.encryption;
        var plaintext;
        try {
            plaintext = hapCrypto.chacha20_poly1305_decryptAndVerify(enc.hkdfPairEncryptionKey, Buffer.from("PV-Msg03"), null, messageData, authTagData);
        }
        catch (error) {
            debug("[%s] M3: Failed to decrypt and/or verify", this.accessoryInfo.username);
            response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* STATE */, 4 /* M4 */, 7 /* ERROR_CODE */, 2 /* AUTHENTICATION */));
            connection._pairVerifyState = undefined;
            return;
        }
        var decoded = tlv.decode(plaintext);
        var clientUsername = decoded[1 /* USERNAME */];
        var proof = decoded[10 /* PROOF */];
        var material = Buffer.concat([enc.clientPublicKey, clientUsername, enc.publicKey]);
        // since we're paired, we should have the public key stored for this client
        var clientPublicKey = this.accessoryInfo.getClientPublicKey(clientUsername.toString());
        // if we're not actually paired, then there's nothing to verify - this client thinks it's paired with us but we
        // disagree. Respond with invalid request (seems to match HomeKit Accessory Simulator behavior)
        if (!clientPublicKey) {
            debug("[%s] Client %s attempting to verify, but we are not paired; rejecting client", this.accessoryInfo.username, clientUsername);
            response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* STATE */, 4 /* M4 */, 7 /* ERROR_CODE */, 2 /* AUTHENTICATION */));
            connection._pairVerifyState = undefined;
            return;
        }
        if (!tweetnacl_1.default.sign.detached.verify(material, proof, clientPublicKey)) {
            debug("[%s] Client %s provided an invalid signature", this.accessoryInfo.username, clientUsername);
            response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
            response.end(tlv.encode(6 /* STATE */, 4 /* M4 */, 7 /* ERROR_CODE */, 2 /* AUTHENTICATION */));
            connection._pairVerifyState = undefined;
            return;
        }
        debug("[%s] Client %s verification complete", this.accessoryInfo.username, clientUsername);
        response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
        response.end(tlv.encode(6 /* SEQUENCE_NUM */, 4 /* M4 */));
        // now that the client has been verified, we must "upgrade" our pseudo-HTTP connection to include
        // TCP-level encryption. We'll do this by adding some more encryption vars to the session, and using them
        // in future calls to onEncrypt, onDecrypt.
        var encSalt = Buffer.from("Control-Salt");
        var infoRead = Buffer.from("Control-Read-Encryption-Key");
        var infoWrite = Buffer.from("Control-Write-Encryption-Key");
        enc.accessoryToControllerKey = hapCrypto.HKDF("sha512", encSalt, enc.sharedSecret, infoRead, 32);
        enc.controllerToAccessoryKey = hapCrypto.HKDF("sha512", encSalt, enc.sharedSecret, infoWrite, 32);
        // Our connection is now completely setup. We now want to subscribe this connection to special
        connection.connectionAuthenticated(clientUsername.toString());
        connection._pairVerifyState = undefined;
    };
    HAPServer.prototype.handlePairings = function (connection, url, request, data, response) {
        var _this = this;
        // Only accept /pairing request if there is a secure session
        if (!this.allowInsecureRequest && !connection.isAuthenticated()) {
            response.writeHead(470 /* CONNECTION_AUTHORIZATION_REQUIRED */, { "Content-Type": "application/hap+json" });
            response.end(JSON.stringify({ status: -70401 /* INSUFFICIENT_PRIVILEGES */ }));
            return;
        }
        var objects = tlv.decode(data);
        var method = objects[0 /* METHOD */][0]; // value is single byte with request type
        var state = objects[6 /* STATE */][0];
        if (state !== 1 /* M1 */) {
            return;
        }
        if (method === 3 /* ADD_PAIRING */) {
            var identifier = objects[1 /* IDENTIFIER */].toString();
            var publicKey = objects[3 /* PUBLIC_KEY */];
            var permissions = objects[11 /* PERMISSIONS */][0];
            this.emit("add-pairing" /* ADD_PAIRING */, connection, identifier, publicKey, permissions, (0, once_1.once)(function (error) {
                if (error > 0) {
                    debug("[%s] Pairings: failed ADD_PAIRING with code %d", _this.accessoryInfo.username, error);
                    response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
                    response.end(tlv.encode(6 /* STATE */, 2 /* M2 */, 7 /* ERROR_CODE */, error));
                    return;
                }
                response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
                response.end(tlv.encode(6 /* STATE */, 2 /* M2 */));
                debug("[%s] Pairings: successfully executed ADD_PAIRING", _this.accessoryInfo.username);
            }));
        }
        else if (method === 4 /* REMOVE_PAIRING */) {
            var identifier = objects[1 /* IDENTIFIER */].toString();
            this.emit("remove-pairing" /* REMOVE_PAIRING */, connection, identifier, (0, once_1.once)(function (error) {
                if (error > 0) {
                    debug("[%s] Pairings: failed REMOVE_PAIRING with code %d", _this.accessoryInfo.username, error);
                    response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
                    response.end(tlv.encode(6 /* STATE */, 2 /* M2 */, 7 /* ERROR_CODE */, error));
                    return;
                }
                response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
                response.end(tlv.encode(6 /* STATE */, 2 /* M2 */));
                debug("[%s] Pairings: successfully executed REMOVE_PAIRING", _this.accessoryInfo.username);
            }));
        }
        else if (method === 5 /* LIST_PAIRINGS */) {
            this.emit("list-pairings" /* LIST_PAIRINGS */, connection, (0, once_1.once)(function (error, data) {
                if (error > 0) {
                    debug("[%s] Pairings: failed LIST_PAIRINGS with code %d", _this.accessoryInfo.username, error);
                    response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
                    response.end(tlv.encode(6 /* STATE */, 2 /* M2 */, 7 /* ERROR_CODE */, error));
                    return;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                var tlvList = [];
                data.forEach(function (value, index) {
                    if (index > 0) {
                        tlvList.push(255 /* SEPARATOR */, Buffer.alloc(0));
                    }
                    tlvList.push(1 /* IDENTIFIER */, value.username, 3 /* PUBLIC_KEY */, value.publicKey, 11 /* PERMISSIONS */, value.permission);
                });
                var list = tlv.encode.apply(tlv, (0, tslib_1.__spreadArray)([6 /* STATE */, 2 /* M2 */], (0, tslib_1.__read)(tlvList), false));
                response.writeHead(200 /* OK */, { "Content-Type": "application/pairing+tlv8" });
                response.end(list);
                debug("[%s] Pairings: successfully executed LIST_PAIRINGS", _this.accessoryInfo.username);
            }));
        }
    };
    HAPServer.prototype.handleAccessories = function (connection, url, request, data, response) {
        if (!this.allowInsecureRequest && !connection.isAuthenticated()) {
            response.writeHead(470 /* CONNECTION_AUTHORIZATION_REQUIRED */, { "Content-Type": "application/hap+json" });
            response.end(JSON.stringify({ status: -70401 /* INSUFFICIENT_PRIVILEGES */ }));
            return;
        }
        // call out to listeners to retrieve the latest accessories JSON
        this.emit("accessories" /* ACCESSORIES */, connection, (0, once_1.once)(function (error, result) {
            if (error) {
                response.writeHead(error.httpCode, { "Content-Type": "application/hap+json" });
                response.end(JSON.stringify({ status: error.status }));
            }
            else {
                response.writeHead(200 /* OK */, { "Content-Type": "application/hap+json" });
                response.end(JSON.stringify(result));
            }
        }));
    };
    HAPServer.prototype.handleCharacteristics = function (connection, url, request, data, response) {
        var e_1, _a;
        if (!this.allowInsecureRequest && !connection.isAuthenticated()) {
            response.writeHead(470 /* CONNECTION_AUTHORIZATION_REQUIRED */, { "Content-Type": "application/hap+json" });
            response.end(JSON.stringify({ status: -70401 /* INSUFFICIENT_PRIVILEGES */ }));
            return;
        }
        if (request.method === "GET") {
            var searchParams = url.searchParams;
            var idParam = searchParams.get("id");
            if (!idParam) {
                response.writeHead(400 /* BAD_REQUEST */, { "Content-Type": "application/hap+json" });
                response.end(JSON.stringify({ status: -70410 /* INVALID_VALUE_IN_REQUEST */ }));
                return;
            }
            var ids = [];
            try {
                for (var _b = (0, tslib_1.__values)(idParam.split(",")), _c = _b.next(); !_c.done; _c = _b.next()) { // ["1.9","2.14"]
                    var entry = _c.value;
                    var split = entry.split("."); // ["1","9"]
                    ids.push({
                        aid: parseInt(split[0], 10),
                        iid: parseInt(split[1], 10), // (characteristic) instance Id
                    });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var readRequest = {
                ids: ids,
                includeMeta: (0, internal_types_1.consideredTrue)(searchParams.get("meta")),
                includePerms: (0, internal_types_1.consideredTrue)(searchParams.get("perms")),
                includeType: (0, internal_types_1.consideredTrue)(searchParams.get("type")),
                includeEvent: (0, internal_types_1.consideredTrue)(searchParams.get("ev")),
            };
            this.emit("get-characteristics" /* GET_CHARACTERISTICS */, connection, readRequest, (0, once_1.once)(function (error, readResponse) {
                var e_2, _a, e_3, _b;
                if (error) {
                    response.writeHead(error.httpCode, { "Content-Type": "application/hap+json" });
                    response.end(JSON.stringify({ status: error.status }));
                    return;
                }
                // typescript can't type that this exists if error doesnt
                var characteristics = readResponse.characteristics;
                var errorOccurred = false; // determine if we send a 207 Multi-Status
                try {
                    for (var characteristics_1 = (0, tslib_1.__values)(characteristics), characteristics_1_1 = characteristics_1.next(); !characteristics_1_1.done; characteristics_1_1 = characteristics_1.next()) {
                        var data_1 = characteristics_1_1.value;
                        if (data_1.status) {
                            errorOccurred = true;
                            break;
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (characteristics_1_1 && !characteristics_1_1.done && (_a = characteristics_1.return)) _a.call(characteristics_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                if (errorOccurred) { // on a 207 Multi-Status EVERY characteristic MUST include a status property
                    try {
                        for (var characteristics_2 = (0, tslib_1.__values)(characteristics), characteristics_2_1 = characteristics_2.next(); !characteristics_2_1.done; characteristics_2_1 = characteristics_2.next()) {
                            var data_2 = characteristics_2_1.value;
                            if (!data_2.status) { // a status is undefined if the request was successful
                                data_2.status = 0 /* SUCCESS */; // a value of zero indicates success
                            }
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (characteristics_2_1 && !characteristics_2_1.done && (_b = characteristics_2.return)) _b.call(characteristics_2);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                }
                // 207 "multi-status" is returned when an error occurs reading a characteristic. otherwise 200 is returned
                response.writeHead(errorOccurred ? 207 /* MULTI_STATUS */ : 200 /* OK */, { "Content-Type": "application/hap+json" });
                response.end(JSON.stringify({ characteristics: characteristics }));
            }));
        }
        else if (request.method === "PUT") {
            if (!connection.isAuthenticated()) {
                if (!request.headers || (request.headers && request.headers.authorization !== this.accessoryInfo.pincode)) {
                    response.writeHead(470 /* CONNECTION_AUTHORIZATION_REQUIRED */, { "Content-Type": "application/hap+json" });
                    response.end(JSON.stringify({ status: -70401 /* INSUFFICIENT_PRIVILEGES */ }));
                    return;
                }
            }
            if (data.length === 0) {
                response.writeHead(400, { "Content-Type": "application/hap+json" });
                response.end(JSON.stringify({ status: -70410 /* INVALID_VALUE_IN_REQUEST */ }));
                return;
            }
            var writeRequest = JSON.parse(data.toString("utf8"));
            this.emit("set-characteristics" /* SET_CHARACTERISTICS */, connection, writeRequest, (0, once_1.once)(function (error, writeResponse) {
                var e_4, _a, e_5, _b;
                if (error) {
                    response.writeHead(error.httpCode, { "Content-Type": "application/hap+json" });
                    response.end(JSON.stringify({ status: error.status }));
                    return;
                }
                // typescript can't type that this exists if error doesnt
                var characteristics = writeResponse.characteristics;
                var multiStatus = false;
                try {
                    for (var characteristics_3 = (0, tslib_1.__values)(characteristics), characteristics_3_1 = characteristics_3.next(); !characteristics_3_1.done; characteristics_3_1 = characteristics_3.next()) {
                        var data_3 = characteristics_3_1.value;
                        if (data_3.status || data_3.value !== undefined) {
                            // also send multiStatus on write response requests
                            multiStatus = true;
                            break;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (characteristics_3_1 && !characteristics_3_1.done && (_a = characteristics_3.return)) _a.call(characteristics_3);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                if (multiStatus) {
                    try {
                        for (var characteristics_4 = (0, tslib_1.__values)(characteristics), characteristics_4_1 = characteristics_4.next(); !characteristics_4_1.done; characteristics_4_1 = characteristics_4.next()) { // on a 207 Multi-Status EVERY characteristic MUST include a status property
                            var data_4 = characteristics_4_1.value;
                            if (data_4.status === undefined) {
                                data_4.status = 0 /* SUCCESS */;
                            }
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (characteristics_4_1 && !characteristics_4_1.done && (_b = characteristics_4.return)) _b.call(characteristics_4);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                    // 207 is "multi-status" since HomeKit may be setting multiple things and any one can fail independently
                    response.writeHead(207 /* MULTI_STATUS */, { "Content-Type": "application/hap+json" });
                    response.end(JSON.stringify({ characteristics: characteristics }));
                }
                else {
                    // if everything went fine send 204 no content response
                    response.writeHead(204 /* NO_CONTENT */);
                    response.end();
                }
            }));
        }
        else {
            response.writeHead(400 /* BAD_REQUEST */, { "Content-Type": "application/hap+json" }); // method not allowed
            response.end(JSON.stringify({ status: -70410 /* INVALID_VALUE_IN_REQUEST */ }));
        }
    };
    HAPServer.prototype.handlePrepareWrite = function (connection, url, request, data, response) {
        var _this = this;
        if (!this.allowInsecureRequest && !connection.isAuthenticated()) {
            response.writeHead(470 /* CONNECTION_AUTHORIZATION_REQUIRED */, { "Content-Type": "application/hap+json" });
            response.end(JSON.stringify({ status: -70401 /* INSUFFICIENT_PRIVILEGES */ }));
            return;
        }
        if (request.method === "PUT") {
            if (data.length === 0) {
                response.writeHead(400 /* BAD_REQUEST */, { "Content-Type": "application/hap+json" });
                response.end(JSON.stringify({ status: -70410 /* INVALID_VALUE_IN_REQUEST */ }));
                return;
            }
            var prepareRequest_1 = JSON.parse(data.toString());
            if (prepareRequest_1.pid && prepareRequest_1.ttl) {
                debug("[%s] Received prepare write request with pid %d and ttl %d", this.accessoryInfo.username, prepareRequest_1.pid, prepareRequest_1.ttl);
                if (connection.timedWriteTimeout) { // clear any currently existing timeouts
                    clearTimeout(connection.timedWriteTimeout);
                }
                connection.timedWritePid = prepareRequest_1.pid;
                connection.timedWriteTimeout = setTimeout(function () {
                    debug("[%s] Timed write request timed out for pid %d", _this.accessoryInfo.username, prepareRequest_1.pid);
                    connection.timedWritePid = undefined;
                    connection.timedWriteTimeout = undefined;
                }, prepareRequest_1.ttl);
                response.writeHead(200 /* OK */, { "Content-Type": "application/hap+json" });
                response.end(JSON.stringify({ status: 0 /* SUCCESS */ }));
                return;
            }
            else {
                response.writeHead(400 /* BAD_REQUEST */, { "Content-Type": "application/hap+json" });
                response.end(JSON.stringify({ status: -70410 /* INVALID_VALUE_IN_REQUEST */ }));
            }
        }
        else {
            response.writeHead(400 /* BAD_REQUEST */, { "Content-Type": "application/hap+json" });
            response.end(JSON.stringify({ status: -70410 /* INVALID_VALUE_IN_REQUEST */ }));
        }
    };
    HAPServer.prototype.handleResource = function (connection, url, request, data, response) {
        if (!connection.isAuthenticated()) {
            if (!(this.allowInsecureRequest && request.headers && request.headers.authorization === this.accessoryInfo.pincode)) {
                response.writeHead(470 /* CONNECTION_AUTHORIZATION_REQUIRED */, { "Content-Type": "application/hap+json" });
                response.end(JSON.stringify({ status: -70401 /* INSUFFICIENT_PRIVILEGES */ }));
                return;
            }
        }
        if (request.method === "POST") {
            if (data.length === 0) {
                response.writeHead(400 /* BAD_REQUEST */, { "Content-Type": "application/hap+json" });
                response.end(JSON.stringify({ status: -70410 /* INVALID_VALUE_IN_REQUEST */ }));
                return;
            }
            var resourceRequest = JSON.parse(data.toString());
            // call out to listeners to retrieve the resource, snapshot only right now
            this.emit("request-resource" /* REQUEST_RESOURCE */, resourceRequest, (0, once_1.once)(function (error, resource) {
                if (error) {
                    response.writeHead(error.httpCode, { "Content-Type": "application/hap+json" });
                    response.end(JSON.stringify({ status: error.status }));
                }
                else {
                    response.writeHead(200 /* OK */, { "Content-Type": "image/jpeg" });
                    response.end(resource);
                }
            }));
        }
        else {
            response.writeHead(400 /* BAD_REQUEST */, { "Content-Type": "application/hap+json" }); // method not allowed
            response.end(JSON.stringify({ status: -70410 /* INVALID_VALUE_IN_REQUEST */ }));
        }
    };
    return HAPServer;
}(events_1.EventEmitter));
exports.HAPServer = HAPServer;
//# sourceMappingURL=HAPServer.js.map