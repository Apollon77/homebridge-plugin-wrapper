"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStreamConnection = exports.HDSConnectionError = exports.HDSConnectionErrorType = exports.DataStreamConnectionEvent = exports.DataStreamServer = exports.DataStreamServerEvent = exports.HDSProtocolError = exports.HDSProtocolSpecificErrorReason = exports.HDSStatus = exports.Topics = exports.Protocols = void 0;
var tslib_1 = require("tslib");
var assert_1 = (0, tslib_1.__importDefault)(require("assert"));
var crypto_1 = (0, tslib_1.__importDefault)(require("crypto"));
var debug_1 = (0, tslib_1.__importDefault)(require("debug"));
var events_1 = require("events");
var net_1 = (0, tslib_1.__importDefault)(require("net"));
var hapCrypto = (0, tslib_1.__importStar)(require("../util/hapCrypto"));
var DataStreamParser_1 = require("./DataStreamParser");
var debug = (0, debug_1.default)("HAP-NodeJS:DataStream:Server");
var Protocols;
(function (Protocols) {
    Protocols["CONTROL"] = "control";
    Protocols["TARGET_CONTROL"] = "targetControl";
    Protocols["DATA_SEND"] = "dataSend";
})(Protocols = exports.Protocols || (exports.Protocols = {}));
var Topics;
(function (Topics) {
    // control
    Topics["HELLO"] = "hello";
    // targetControl
    Topics["WHOAMI"] = "whoami";
    // dataSend
    Topics["OPEN"] = "open";
    Topics["DATA"] = "data";
    Topics["ACK"] = "ack";
    Topics["CLOSE"] = "close";
})(Topics = exports.Topics || (exports.Topics = {}));
var HDSStatus;
(function (HDSStatus) {
    // noinspection JSUnusedGlobalSymbols
    HDSStatus[HDSStatus["SUCCESS"] = 0] = "SUCCESS";
    HDSStatus[HDSStatus["OUT_OF_MEMORY"] = 1] = "OUT_OF_MEMORY";
    HDSStatus[HDSStatus["TIMEOUT"] = 2] = "TIMEOUT";
    HDSStatus[HDSStatus["HEADER_ERROR"] = 3] = "HEADER_ERROR";
    HDSStatus[HDSStatus["PAYLOAD_ERROR"] = 4] = "PAYLOAD_ERROR";
    HDSStatus[HDSStatus["MISSING_PROTOCOL"] = 5] = "MISSING_PROTOCOL";
    HDSStatus[HDSStatus["PROTOCOL_SPECIFIC_ERROR"] = 6] = "PROTOCOL_SPECIFIC_ERROR";
})(HDSStatus = exports.HDSStatus || (exports.HDSStatus = {}));
var HDSProtocolSpecificErrorReason;
(function (HDSProtocolSpecificErrorReason) {
    // noinspection JSUnusedGlobalSymbols
    HDSProtocolSpecificErrorReason[HDSProtocolSpecificErrorReason["NORMAL"] = 0] = "NORMAL";
    HDSProtocolSpecificErrorReason[HDSProtocolSpecificErrorReason["NOT_ALLOWED"] = 1] = "NOT_ALLOWED";
    HDSProtocolSpecificErrorReason[HDSProtocolSpecificErrorReason["BUSY"] = 2] = "BUSY";
    HDSProtocolSpecificErrorReason[HDSProtocolSpecificErrorReason["CANCELLED"] = 3] = "CANCELLED";
    HDSProtocolSpecificErrorReason[HDSProtocolSpecificErrorReason["UNSUPPORTED"] = 4] = "UNSUPPORTED";
    HDSProtocolSpecificErrorReason[HDSProtocolSpecificErrorReason["UNEXPECTED_FAILURE"] = 5] = "UNEXPECTED_FAILURE";
    HDSProtocolSpecificErrorReason[HDSProtocolSpecificErrorReason["TIMEOUT"] = 6] = "TIMEOUT";
    HDSProtocolSpecificErrorReason[HDSProtocolSpecificErrorReason["BAD_DATA"] = 7] = "BAD_DATA";
    HDSProtocolSpecificErrorReason[HDSProtocolSpecificErrorReason["PROTOCOL_ERROR"] = 8] = "PROTOCOL_ERROR";
    HDSProtocolSpecificErrorReason[HDSProtocolSpecificErrorReason["INVALID_CONFIGURATION"] = 9] = "INVALID_CONFIGURATION";
})(HDSProtocolSpecificErrorReason = exports.HDSProtocolSpecificErrorReason || (exports.HDSProtocolSpecificErrorReason = {}));
/**
 * An error indicating a protocol level HDS error.
 * E.g. it may be used to encode a {@link HDSStatus.PROTOCOL_SPECIFIC_ERROR} in the {@link Protocols.DATA_SEND} protocol.
 */
var HDSProtocolError = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(HDSProtocolError, _super);
    /**
     * Initializes a new `HDSProtocolError`
     * @param reason - The {@link HDSProtocolSpecificErrorReason}.
     *  Values MUST NOT be {@link HDSProtocolSpecificErrorReason.NORMAL}.
     */
    function HDSProtocolError(reason) {
        var _this = _super.call(this, "HDSProtocolError: " + reason) || this;
        (0, assert_1.default)(reason !== 0 /* NORMAL */, "Cannot initialize a HDSProtocolError with NORMAL!");
        _this.reason = reason;
        return _this;
    }
    return HDSProtocolError;
}(Error));
exports.HDSProtocolError = HDSProtocolError;
var ServerState;
(function (ServerState) {
    ServerState[ServerState["UNINITIALIZED"] = 0] = "UNINITIALIZED";
    ServerState[ServerState["BINDING"] = 1] = "BINDING";
    ServerState[ServerState["LISTENING"] = 2] = "LISTENING";
    ServerState[ServerState["CLOSING"] = 3] = "CLOSING";
})(ServerState || (ServerState = {}));
var ConnectionState;
(function (ConnectionState) {
    ConnectionState[ConnectionState["UNIDENTIFIED"] = 0] = "UNIDENTIFIED";
    ConnectionState[ConnectionState["EXPECTING_HELLO"] = 1] = "EXPECTING_HELLO";
    ConnectionState[ConnectionState["READY"] = 2] = "READY";
    ConnectionState[ConnectionState["CLOSING"] = 3] = "CLOSING";
    ConnectionState[ConnectionState["CLOSED"] = 4] = "CLOSED";
})(ConnectionState || (ConnectionState = {}));
var MessageType;
(function (MessageType) {
    MessageType[MessageType["EVENT"] = 1] = "EVENT";
    MessageType[MessageType["REQUEST"] = 2] = "REQUEST";
    MessageType[MessageType["RESPONSE"] = 3] = "RESPONSE";
})(MessageType || (MessageType = {}));
var DataStreamServerEvent;
(function (DataStreamServerEvent) {
    /**
     * This event is emitted when a new client socket is received. At this point we have no idea to what
     * hap session this connection will be matched.
     */
    DataStreamServerEvent["CONNECTION_OPENED"] = "connection-opened";
    /**
     * This event is emitted when the socket of a connection gets closed.
     */
    DataStreamServerEvent["CONNECTION_CLOSED"] = "connection-closed";
})(DataStreamServerEvent = exports.DataStreamServerEvent || (exports.DataStreamServerEvent = {}));
/**
 * DataStreamServer which listens for incoming tcp connections and handles identification of new connections
 */
var DataStreamServer = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(DataStreamServer, _super);
    function DataStreamServer() {
        var _this = _super.call(this) || this;
        _this.state = 0 /* UNINITIALIZED */;
        _this.preparedSessions = [];
        _this.connections = [];
        _this.removeListenersOnceClosed = false;
        _this.internalEventEmitter = new events_1.EventEmitter(); // used for message event and message request handlers
        return _this;
    }
    /**
     * Registers a new event handler to handle incoming event messages.
     * The handler is only called for a connection if for the give protocol no ProtocolHandler
     * was registered on the connection level.
     *
     * @param protocol {string | Protocols} - name of the protocol to register the handler for
     * @param event {string | Topics} - name of the event (also referred to as topic. See {Topics} for some known ones)
     * @param handler {GlobalEventHandler} - function to be called for every occurring event
     */
    DataStreamServer.prototype.onEventMessage = function (protocol, event, handler) {
        this.internalEventEmitter.on(protocol + "-e-" + event, handler);
        return this;
    };
    /**
     * Removes an registered event handler.
     *
     * @param protocol {string | Protocols} - name of the protocol to unregister the handler for
     * @param event {string | Topics} - name of the event (also referred to as topic. See {Topics} for some known ones)
     * @param handler {GlobalEventHandler} - registered event handler
     */
    DataStreamServer.prototype.removeEventHandler = function (protocol, event, handler) {
        this.internalEventEmitter.removeListener(protocol + "-e-" + event, handler);
        return this;
    };
    /**
     * Registers a new request handler to handle incoming request messages.
     * The handler is only called for a connection if for the give protocol no ProtocolHandler
     * was registered on the connection level.
     *
     * @param protocol {string | Protocols} - name of the protocol to register the handler for
     * @param request {string | Topics} - name of the request (also referred to as topic. See {Topics} for some known ones)
     * @param handler {GlobalRequestHandler} - function to be called for every occurring request
     */
    DataStreamServer.prototype.onRequestMessage = function (protocol, request, handler) {
        this.internalEventEmitter.on(protocol + "-r-" + request, handler);
        return this;
    };
    /**
     * Removes an registered request handler.
     *
     * @param protocol {string | Protocols} - name of the protocol to unregister the handler for
     * @param request {string | Topics} - name of the request (also referred to as topic. See {Topics} for some known ones)
     * @param handler {GlobalRequestHandler} - registered request handler
     */
    DataStreamServer.prototype.removeRequestHandler = function (protocol, request, handler) {
        this.internalEventEmitter.removeListener(protocol + "-r-" + request, handler);
        return this;
    };
    DataStreamServer.prototype.prepareSession = function (connection, controllerKeySalt, callback) {
        var _this = this;
        debug("Preparing for incoming HDS connection from %s", connection.sessionID);
        var accessoryKeySalt = crypto_1.default.randomBytes(32);
        var salt = Buffer.concat([controllerKeySalt, accessoryKeySalt]);
        var accessoryToControllerEncryptionKey = hapCrypto.HKDF("sha512", salt, connection.encryption.sharedSecret, DataStreamServer.accessoryToControllerInfo, 32);
        var controllerToAccessoryEncryptionKey = hapCrypto.HKDF("sha512", salt, connection.encryption.sharedSecret, DataStreamServer.controllerToAccessoryInfo, 32);
        var preparedSession = {
            connection: connection,
            accessoryToControllerEncryptionKey: accessoryToControllerEncryptionKey,
            controllerToAccessoryEncryptionKey: controllerToAccessoryEncryptionKey,
            accessoryKeySalt: accessoryKeySalt,
            connectTimeout: setTimeout(function () { return _this.timeoutPreparedSession(preparedSession); }, 10000),
        };
        preparedSession.connectTimeout.unref();
        this.preparedSessions.push(preparedSession);
        this.checkTCPServerEstablished(preparedSession, function (error) {
            if (error) {
                callback(error);
            }
            else {
                callback(undefined, preparedSession);
            }
        });
    };
    DataStreamServer.prototype.timeoutPreparedSession = function (preparedSession) {
        debug("Prepared HDS session timed out out since no connection was opened for 10 seconds (%s)", preparedSession.connection.sessionID);
        var index = this.preparedSessions.indexOf(preparedSession);
        if (index >= 0) {
            this.preparedSessions.splice(index, 1);
        }
        this.checkCloseable();
    };
    DataStreamServer.prototype.checkTCPServerEstablished = function (preparedSession, callback) {
        var _this = this;
        switch (this.state) {
            case 0 /* UNINITIALIZED */:
                debug("Starting up TCP server.");
                this.tcpServer = net_1.default.createServer();
                this.tcpServer.once("listening", this.listening.bind(this, preparedSession, callback));
                this.tcpServer.on("connection", this.onConnection.bind(this));
                this.tcpServer.on("close", this.closed.bind(this));
                this.tcpServer.listen();
                this.state = 1 /* BINDING */;
                break;
            case 1 /* BINDING */:
                debug("TCP server already running. Waiting for it to bind.");
                this.tcpServer.once("listening", this.listening.bind(this, preparedSession, callback));
                break;
            case 2 /* LISTENING */:
                debug("Instructing client to connect to already running TCP server");
                preparedSession.port = this.tcpPort;
                callback();
                break;
            case 3 /* CLOSING */:
                debug("TCP socket is currently closing. Trying again when server is fully closed and opening a new one then.");
                this.tcpServer.once("close", function () { return setTimeout(function () { return _this.checkTCPServerEstablished(preparedSession, callback); }, 10); });
                break;
        }
    };
    DataStreamServer.prototype.listening = function (preparedSession, callback) {
        this.state = 2 /* LISTENING */;
        var address = this.tcpServer.address();
        if (address && typeof address !== "string") { // address is only typeof string when listening to a pipe or unix socket
            this.tcpPort = address.port;
            preparedSession.port = address.port;
            debug("TCP server is now listening for new data stream connections on port %s", address.port);
            callback();
        }
    };
    DataStreamServer.prototype.onConnection = function (socket) {
        debug("[%s] New DataStream connection was established", socket.remoteAddress);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        var connection = new DataStreamConnection(socket);
        connection.on("identification" /* IDENTIFICATION */, this.handleSessionIdentification.bind(this, connection));
        connection.on("handle-message-globally" /* HANDLE_MESSAGE_GLOBALLY */, this.handleMessageGlobally.bind(this, connection));
        connection.on("closed" /* CLOSED */, this.connectionClosed.bind(this, connection));
        this.connections.push(connection);
        this.emit("connection-opened" /* CONNECTION_OPENED */, connection);
    };
    DataStreamServer.prototype.handleSessionIdentification = function (connection, firstFrame, callback) {
        var identifiedSession = undefined;
        for (var i = 0; i < this.preparedSessions.length; i++) {
            var preparedSession = this.preparedSessions[i];
            // if we successfully decrypt the first frame with this key we know to which session this connection belongs
            if (connection.decryptHDSFrame(firstFrame, preparedSession.controllerToAccessoryEncryptionKey)) {
                identifiedSession = preparedSession;
                break;
            }
        }
        callback(identifiedSession);
        if (identifiedSession) {
            debug("[%s] Connection was successfully identified (linked with sessionId: %s)", connection.remoteAddress, identifiedSession.connection.sessionID);
            var index = this.preparedSessions.indexOf(identifiedSession);
            if (index >= 0) {
                this.preparedSessions.splice(index, 1);
            }
            clearTimeout(identifiedSession.connectTimeout);
            identifiedSession.connectTimeout = undefined;
            // we have currently no experience with data stream connections, maybe it would be good to index active connections
            // by their hap sessionId in order to clear out old but still open connections when the controller opens a new one
            // on the other hand the keepAlive should handle that also :thinking:
        }
        else { // we looped through all session and didn't find anything
            debug("[%s] Could not identify connection. Terminating.", connection.remoteAddress);
            connection.close(); // disconnecting since first message was not a valid hello
        }
    };
    DataStreamServer.prototype.handleMessageGlobally = function (connection, message) {
        var _a;
        assert_1.default.notStrictEqual(message.type, 3 /* RESPONSE */); // responses can't physically get here
        var separator = "";
        var args = [];
        if (message.type === 1 /* EVENT */) {
            separator = "-e-";
        }
        else if (message.type === 2 /* REQUEST */) {
            separator = "-r-";
            args.push(message.id);
        }
        args.push(message.message);
        var hadListeners;
        try {
            hadListeners = (_a = this.internalEventEmitter).emit.apply(_a, (0, tslib_1.__spreadArray)([message.protocol + separator + message.topic, connection], (0, tslib_1.__read)(args), false));
        }
        catch (error) {
            hadListeners = true;
            debug("[%s] Error occurred while dispatching handler for HDS message: %o", connection.remoteAddress, message);
            debug(error.stack);
        }
        if (!hadListeners) {
            debug("[%s] WARNING no handler was found for message: %o", connection.remoteAddress, message);
        }
    };
    DataStreamServer.prototype.connectionClosed = function (connection) {
        debug("[%s] DataStream connection closed", connection.remoteAddress);
        this.connections.splice(this.connections.indexOf(connection), 1);
        this.emit("connection-closed" /* CONNECTION_CLOSED */, connection);
        this.checkCloseable();
        if (this.state === 3 /* CLOSING */ && this.removeListenersOnceClosed && this.connections.length === 0) {
            this.removeAllListeners(); // see this.destroy()
        }
    };
    DataStreamServer.prototype.checkCloseable = function () {
        if (this.connections.length === 0 && this.preparedSessions.length === 0 && this.state < 3 /* CLOSING */) {
            debug("Last connection disconnected. Closing the server now.");
            this.state = 3 /* CLOSING */;
            this.tcpServer.close();
        }
    };
    /**
     * This method will fully stop the DataStreamServer
     */
    DataStreamServer.prototype.destroy = function () {
        var e_1, _a;
        if (this.state > 0 /* UNINITIALIZED */ && this.state < 3 /* CLOSING */) {
            this.tcpServer.close();
            try {
                for (var _b = (0, tslib_1.__values)(this.connections), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var connection = _c.value;
                    connection.close();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        this.state = 3 /* CLOSING */;
        this.removeListenersOnceClosed = true;
        this.internalEventEmitter.removeAllListeners();
    };
    DataStreamServer.prototype.closed = function () {
        this.tcpServer = undefined;
        this.tcpPort = undefined;
        this.state = 0 /* UNINITIALIZED */;
    };
    DataStreamServer.version = "1.0";
    DataStreamServer.accessoryToControllerInfo = Buffer.from("HDS-Read-Encryption-Key");
    DataStreamServer.controllerToAccessoryInfo = Buffer.from("HDS-Write-Encryption-Key");
    return DataStreamServer;
}(events_1.EventEmitter));
exports.DataStreamServer = DataStreamServer;
var DataStreamConnectionEvent;
(function (DataStreamConnectionEvent) {
    /**
     * This event is emitted when the first HDSFrame is received from a new connection.
     * The connection expects the handler to identify the connection by trying to match the decryption keys.
     * If identification was successful the PreparedDataStreamSession should be supplied to the callback,
     * otherwise undefined should be supplied.
     */
    DataStreamConnectionEvent["IDENTIFICATION"] = "identification";
    /**
     * This event is emitted when no handler could be found for the given protocol of a event or request message.
     */
    DataStreamConnectionEvent["HANDLE_MESSAGE_GLOBALLY"] = "handle-message-globally";
    /**
     * This event is emitted when the socket of the connection was closed.
     */
    DataStreamConnectionEvent["CLOSED"] = "closed";
})(DataStreamConnectionEvent = exports.DataStreamConnectionEvent || (exports.DataStreamConnectionEvent = {}));
var HDSConnectionErrorType;
(function (HDSConnectionErrorType) {
    HDSConnectionErrorType[HDSConnectionErrorType["ILLEGAL_STATE"] = 1] = "ILLEGAL_STATE";
    HDSConnectionErrorType[HDSConnectionErrorType["CLOSED_SOCKET"] = 2] = "CLOSED_SOCKET";
    HDSConnectionErrorType[HDSConnectionErrorType["MAX_PAYLOAD_LENGTH"] = 3] = "MAX_PAYLOAD_LENGTH";
})(HDSConnectionErrorType = exports.HDSConnectionErrorType || (exports.HDSConnectionErrorType = {}));
var HDSConnectionError = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(HDSConnectionError, _super);
    function HDSConnectionError(message, type) {
        var _this = _super.call(this, message) || this;
        _this.type = type;
        return _this;
    }
    return HDSConnectionError;
}(Error));
exports.HDSConnectionError = HDSConnectionError;
/**
 * DataStream connection which holds any necessary state information, encryption an decryption keys, manages
 * protocol handlers and also handles sending and receiving of data stream frames.
 */
var DataStreamConnection = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(DataStreamConnection, _super);
    function DataStreamConnection(socket) {
        var _a;
        var _this = _super.call(this) || this;
        /*
              Since our DataStream server does only listen on one port and this port is supplied to every client
              which wants to connect, we do not really know which client is who when we receive a tcp connection.
              Thus, we find the correct PreparedDataStreamSession object by testing the encryption keys of all available
              prepared sessions. Then we can reference this hds connection with the correct hap connection and mark it as identified.
           */
        _this.state = 0 /* UNIDENTIFIED */;
        _this.protocolHandlers = {}; // used to store protocolHandlers identified by their protocol name
        _this.responseHandlers = {}; // used to store responseHandlers indexed by their respective requestId
        _this.responseTimers = {}; // used to store response timeouts indexed by their respective requestId
        _this.socket = socket;
        _this.remoteAddress = socket.remoteAddress;
        _this.socket.setNoDelay(true); // disable Nagle algorithm
        _this.socket.setKeepAlive(true);
        _this.accessoryToControllerNonce = 0;
        _this.accessoryToControllerNonceBuffer = Buffer.alloc(8);
        _this.controllerToAccessoryNonce = 0;
        _this.controllerToAccessoryNonceBuffer = Buffer.alloc(8);
        _this.hapConnectionClosedListener = _this.onHAPSessionClosed.bind(_this);
        _this.addProtocolHandler("control" /* CONTROL */, {
            requestHandler: (_a = {},
                _a["hello" /* HELLO */] = _this.handleHello.bind(_this),
                _a),
        });
        _this.helloTimer = setTimeout(function () {
            debug("[%s] Hello message did not arrive in time. Killing the connection", _this.remoteAddress);
            _this.close();
        }, 10000);
        _this.socket.on("data", _this.onSocketData.bind(_this));
        _this.socket.on("error", _this.onSocketError.bind(_this));
        _this.socket.on("close", _this.onSocketClose.bind(_this));
        // this is to mitigate the event emitter "memory leak warning".
        // e.g. with HSV there might be multiple cameras subscribing to the CLOSE event. one subscription for
        // every active recording stream on a camera. The default limit of 10 might be easily reached.
        // Setting a high limit isn't the prefect solution, but will avoid false positives but ensures that
        // a warning is still be printed if running long enough.
        _this.setMaxListeners(100);
        return _this;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DataStreamConnection.prototype.handleHello = function (id, message) {
        // that hello is indeed the _first_ message received is verified in onSocketData(...)
        debug("[%s] Received hello message from client: %o", this.remoteAddress, message);
        clearTimeout(this.helloTimer);
        this.helloTimer = undefined;
        this.state = 2 /* READY */;
        this.sendResponse("control" /* CONTROL */, "hello" /* HELLO */, id);
    };
    /**
     * Registers a new protocol handler to handle incoming messages.
     * The same protocol cannot be registered multiple times.
     *
     * @param protocol {string | Protocols} - name of the protocol to register the handler for
     * @param protocolHandler {DataStreamProtocolHandler} - object to be registered as protocol handler
     */
    DataStreamConnection.prototype.addProtocolHandler = function (protocol, protocolHandler) {
        if (this.protocolHandlers[protocol] !== undefined) {
            return false;
        }
        this.protocolHandlers[protocol] = protocolHandler;
        return true;
    };
    /**
     * Removes a protocol handler if it is registered.
     *
     * @param protocol {string | Protocols} - name of the protocol to unregister the handler for
     * @param protocolHandler {DataStreamProtocolHandler} - object which will be unregistered
     */
    DataStreamConnection.prototype.removeProtocolHandler = function (protocol, protocolHandler) {
        var current = this.protocolHandlers[protocol];
        if (current === protocolHandler) {
            delete this.protocolHandlers[protocol];
        }
    };
    /**
     * Sends a new event message to the connected client.
     *
     * @param protocol {string | Protocols} - name of the protocol
     * @param event {string | Topics} - name of the event (also referred to as topic. See {Topics} for some known ones)
     * @param message {Record<any, any>} - message dictionary which gets sent along the event
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DataStreamConnection.prototype.sendEvent = function (protocol, event, message) {
        if (message === void 0) { message = {}; }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var header = {};
        header.protocol = protocol;
        header.event = event;
        this.sendHDSFrame(header, message);
    };
    /**
     * Sends a new request message to the connected client.
     *
     * @param protocol {string | Protocols} - name of the protocol
     * @param request {string | Topics} - name of the request (also referred to as topic. See {Topics} for some known ones)
     * @param message {Record<any, any>} - message dictionary which gets sent along the request
     * @param callback {ResponseHandler} - handler which gets supplied with an error object if the response didn't
     *                                     arrive in time or the status and the message dictionary from the response
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DataStreamConnection.prototype.sendRequest = function (protocol, request, message, callback) {
        var _this = this;
        if (message === void 0) { message = {}; }
        var requestId;
        do { // generate unused requestId
            // currently writing int64 to data stream is not really supported, so 32-bit int will be the max
            requestId = Math.floor(Math.random() * 4294967295);
        } while (this.responseHandlers[requestId] !== undefined);
        this.responseHandlers[requestId] = callback;
        this.responseTimers[requestId] = setTimeout(function () {
            // we did not receive a response => close socket
            _this.close();
            var handler = _this.responseHandlers[requestId];
            delete _this.responseHandlers[requestId];
            delete _this.responseTimers[requestId];
            // handler should be able to clean up their stuff
            handler(new Error("timeout"), undefined, {});
        }, 10000); // 10s timer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var header = {};
        header.protocol = protocol;
        header.request = request;
        header.id = new DataStreamParser_1.Int64(requestId);
        this.sendHDSFrame(header, message);
    };
    /**
     * Send a new response message to a received request message to the client.
     *
     * @param protocol {string | Protocols} - name of the protocol
     * @param response {string | Topics} - name of the response (also referred to as topic. See {Topics} for some known ones)
     * @param id {number} - id from the request, to associate the response to the request
     * @param status {HDSStatus} - status indication if the request was successful. A status of zero indicates success.
     * @param message {Record<any, any>} - message dictionary which gets sent along the response
     */
    DataStreamConnection.prototype.sendResponse = function (protocol, response, id, status, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message) {
        if (status === void 0) { status = HDSStatus.SUCCESS; }
        if (message === void 0) { message = {}; }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var header = {};
        header.protocol = protocol;
        header.response = response;
        header.id = new DataStreamParser_1.Int64(id);
        header.status = new DataStreamParser_1.Int64(status);
        this.sendHDSFrame(header, message);
    };
    DataStreamConnection.prototype.onSocketData = function (data) {
        var _this = this;
        if (this.state >= 3 /* CLOSING */) {
            return;
        }
        var frameIndex = 0;
        var frames = this.decodeHDSFrames(data);
        if (frames.length === 0) { // not enough data
            return;
        }
        if (this.state === 0 /* UNIDENTIFIED */) {
            // at the beginning we are only interested in trying to decrypt the first frame in order to test decryption keys
            var firstFrame = frames[frameIndex++];
            this.emit("identification" /* IDENTIFICATION */, firstFrame, function (identifiedSession) {
                if (identifiedSession) {
                    // horray, we found our connection
                    _this.connection = identifiedSession.connection;
                    _this.accessoryToControllerEncryptionKey = identifiedSession.accessoryToControllerEncryptionKey;
                    _this.controllerToAccessoryEncryptionKey = identifiedSession.controllerToAccessoryEncryptionKey;
                    _this.state = 1 /* EXPECTING_HELLO */;
                    // below listener is removed in .close()
                    _this.connection.on("closed" /* CLOSED */, _this.hapConnectionClosedListener); // register close listener
                    debug("[%s] Registering CLOSED handler to HAP connection. Connection currently has %d close handlers!", _this.remoteAddress, _this.connection.listeners("closed" /* CLOSED */).length);
                }
            });
            if (this.state === 0 /* UNIDENTIFIED */) {
                // did not find a prepared connection, server already closed this connection; nothing to do here
                return;
            }
        }
        for (; frameIndex < frames.length; frameIndex++) { // decrypt all remaining frames
            if (!this.decryptHDSFrame(frames[frameIndex])) {
                debug("[%s] HDS frame decryption or authentication failed. Connection will be terminated!", this.remoteAddress);
                this.close();
                return;
            }
        }
        var messages = this.decodePayloads(frames); // decode contents of payload
        if (this.state === 1 /* EXPECTING_HELLO */) {
            var firstMessage = messages[0];
            if (firstMessage.protocol !== "control" /* CONTROL */ || firstMessage.type !== 2 /* REQUEST */ || firstMessage.topic !== "hello" /* HELLO */) {
                // first message is not the expected hello request
                debug("[%s] First message received was not the expected hello message. Instead got: %o", this.remoteAddress, firstMessage);
                this.close();
                return;
            }
        }
        messages.forEach(function (message) {
            if (message.type === 3 /* RESPONSE */) {
                // protocol and topic are currently not tested here; just assumed their are correct;
                // probably they are as the requestId is unique per connection no matter what protocol is used
                var responseHandler = _this.responseHandlers[message.id];
                var responseTimer = _this.responseTimers[message.id];
                if (responseTimer) {
                    clearTimeout(responseTimer);
                    delete _this.responseTimers[message.id];
                }
                if (!responseHandler) {
                    // we got a response to a request we did not send; we ignore it for now, since nobody will be hurt
                    debug("WARNING we received a response to a request we have not sent: %o", message);
                    return;
                }
                try {
                    responseHandler(undefined, message.status, message.message);
                }
                catch (error) {
                    debug("[%s] Error occurred while dispatching response handler for HDS message: %o", _this.remoteAddress, message);
                    debug(error.stack);
                }
                delete _this.responseHandlers[message.id];
            }
            else {
                var handler = _this.protocolHandlers[message.protocol];
                if (handler === undefined) {
                    // send message to the server to check if there are some global handlers for it
                    _this.emit("handle-message-globally" /* HANDLE_MESSAGE_GLOBALLY */, message);
                    return;
                }
                if (message.type === 1 /* EVENT */) {
                    var eventHandler = void 0;
                    if (!handler.eventHandler || !(eventHandler = handler.eventHandler[message.topic])) {
                        debug("[%s] WARNING no event handler was found for message: %o", _this.remoteAddress, message);
                        return;
                    }
                    try {
                        eventHandler(message.message);
                    }
                    catch (error) {
                        debug("[%s] Error occurred while dispatching event handler for HDS message: %o", _this.remoteAddress, message);
                        debug(error.stack);
                    }
                }
                else if (message.type === 2 /* REQUEST */) {
                    var requestHandler = void 0;
                    if (!handler.requestHandler || !(requestHandler = handler.requestHandler[message.topic])) {
                        debug("[%s] WARNING no request handler was found for message: %o", _this.remoteAddress, message);
                        return;
                    }
                    try {
                        requestHandler(message.id, message.message);
                    }
                    catch (error) {
                        debug("[%s] Error occurred while dispatching request handler for HDS message: %o", _this.remoteAddress, message);
                        debug(error.stack);
                    }
                }
                else {
                    debug("[%s] Encountered unknown message type with id %d", _this.remoteAddress, message.type);
                }
            }
        });
    };
    DataStreamConnection.prototype.decodeHDSFrames = function (data) {
        if (this.frameBuffer !== undefined) {
            data = Buffer.concat([this.frameBuffer, data]);
            this.frameBuffer = undefined;
        }
        var totalBufferLength = data.length;
        var frames = [];
        for (var frameBegin = 0; frameBegin < totalBufferLength;) {
            if (frameBegin + 4 > totalBufferLength) {
                // we don't have enough data in the buffer for the next header
                this.frameBuffer = data.slice(frameBegin);
                break;
            }
            var payloadType = data.readUInt8(frameBegin); // type defining structure of payload; 8-bit; currently expected to be 1
            var payloadLength = data.readUIntBE(frameBegin + 1, 3); // read 24-bit big-endian uint length field
            if (payloadLength > DataStreamConnection.MAX_PAYLOAD_LENGTH) {
                debug("[%s] Connection send payload with size bigger than the maximum allow for data stream", this.remoteAddress);
                this.close();
                return [];
            }
            var remainingBufferLength = totalBufferLength - frameBegin - 4; // subtract 4 for payloadType (1-byte) and payloadLength (3-byte)
            // check if the data from this frame is already there (payload + 16-byte authTag)
            if (payloadLength + 16 > remainingBufferLength) {
                // Frame is fragmented, so we wait until we receive more
                this.frameBuffer = data.slice(frameBegin);
                break;
            }
            var payloadBegin = frameBegin + 4;
            var authTagBegin = payloadBegin + payloadLength;
            var header = data.slice(frameBegin, payloadBegin); // header is also authenticated using authTag
            var cipheredPayload = data.slice(payloadBegin, authTagBegin);
            var plaintextPayload = Buffer.alloc(payloadLength);
            var authTag = data.slice(authTagBegin, authTagBegin + 16);
            frameBegin = authTagBegin + 16; // move to next frame
            if (payloadType === 1) {
                var hdsFrame = {
                    header: header,
                    cipheredPayload: cipheredPayload,
                    authTag: authTag,
                };
                frames.push(hdsFrame);
            }
            else {
                debug("[%s] Encountered unknown payload type %d for payload: %s", this.remoteAddress, plaintextPayload.toString("hex"));
            }
        }
        return frames;
    };
    DataStreamConnection.prototype.decryptHDSFrame = function (frame, keyOverwrite) {
        hapCrypto.writeUInt64LE(this.controllerToAccessoryNonce, this.controllerToAccessoryNonceBuffer, 0); // update nonce buffer
        var key = keyOverwrite || this.controllerToAccessoryEncryptionKey;
        try {
            frame.plaintextPayload = hapCrypto.chacha20_poly1305_decryptAndVerify(key, this.controllerToAccessoryNonceBuffer, frame.header, frame.cipheredPayload, frame.authTag);
            this.controllerToAccessoryNonce++; // we had a successful encryption, increment the nonce
            return true;
        }
        catch (error) {
            // frame decryption or authentication failed. Could happen when our guess for a PreparedDataStreamSession is wrong
            return false;
        }
    };
    DataStreamConnection.prototype.decodePayloads = function (frames) {
        var _this = this;
        var messages = [];
        frames.forEach(function (frame) {
            var payload = frame.plaintextPayload;
            if (!payload) {
                throw new HDSConnectionError("Reached illegal state. Encountered HDSFrame with wasn't decrypted yet!", 1 /* ILLEGAL_STATE */);
            }
            var headerLength = payload.readUInt8(0);
            var messageLength = payload.length - headerLength - 1;
            var headerBegin = 1;
            var messageBegin = headerBegin + headerLength;
            var headerPayload = new DataStreamParser_1.DataStreamReader(payload.slice(headerBegin, headerBegin + headerLength));
            var messagePayload = new DataStreamParser_1.DataStreamReader(payload.slice(messageBegin, messageBegin + messageLength));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            var headerDictionary;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            var messageDictionary;
            try {
                headerDictionary = DataStreamParser_1.DataStreamParser.decode(headerPayload);
                headerPayload.finished();
            }
            catch (error) {
                debug("[%s] Failed to decode header payload: %s", _this.remoteAddress, error.message);
                return;
            }
            try {
                messageDictionary = DataStreamParser_1.DataStreamParser.decode(messagePayload);
                messagePayload.finished();
            }
            catch (error) {
                debug("[%s] Failed to decode message payload: %s (header: %o)", _this.remoteAddress, error.message, headerDictionary);
                return;
            }
            var type;
            var protocol = headerDictionary.protocol;
            var topic;
            var id = undefined;
            var status = undefined;
            if (headerDictionary.event !== undefined) {
                type = 1 /* EVENT */;
                topic = headerDictionary.event;
            }
            else if (headerDictionary.request !== undefined) {
                type = 2 /* REQUEST */;
                topic = headerDictionary.request;
                id = headerDictionary.id;
            }
            else if (headerDictionary.response !== undefined) {
                type = 3 /* RESPONSE */;
                topic = headerDictionary.response;
                id = headerDictionary.id;
                status = headerDictionary.status;
            }
            else {
                debug("[%s] Encountered unknown payload header format: %o (message: %o)", _this.remoteAddress, headerDictionary, messageDictionary);
                return;
            }
            var message = {
                type: type,
                protocol: protocol,
                topic: topic,
                id: id,
                status: status,
                message: messageDictionary,
            };
            messages.push(message);
        });
        return messages;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DataStreamConnection.prototype.sendHDSFrame = function (header, message) {
        if (this.state >= 3 /* CLOSING */) {
            throw new HDSConnectionError("Cannot send message on closing/closed socket!", 2 /* CLOSED_SOCKET */);
        }
        var headerWriter = new DataStreamParser_1.DataStreamWriter();
        var messageWriter = new DataStreamParser_1.DataStreamWriter();
        DataStreamParser_1.DataStreamParser.encode(header, headerWriter);
        DataStreamParser_1.DataStreamParser.encode(message, messageWriter);
        var payloadHeaderBuffer = Buffer.alloc(1);
        payloadHeaderBuffer.writeUInt8(headerWriter.length(), 0);
        var payloadBuffer = Buffer.concat([payloadHeaderBuffer, headerWriter.getData(), messageWriter.getData()]);
        if (payloadBuffer.length > DataStreamConnection.MAX_PAYLOAD_LENGTH) {
            throw new HDSConnectionError("Tried sending payload with length larger than the maximum allowed for data stream", 3 /* MAX_PAYLOAD_LENGTH */);
        }
        var frameTypeBuffer = Buffer.alloc(1);
        frameTypeBuffer.writeUInt8(1, 0);
        var frameLengthBuffer = Buffer.alloc(4);
        frameLengthBuffer.writeUInt32BE(payloadBuffer.length, 0);
        frameLengthBuffer = frameLengthBuffer.slice(1, 4); // a bit hacky but the only real way to write 24-bit int in node
        var frameHeader = Buffer.concat([frameTypeBuffer, frameLengthBuffer]);
        hapCrypto.writeUInt64LE(this.accessoryToControllerNonce++, this.accessoryToControllerNonceBuffer);
        var encrypted = hapCrypto.chacha20_poly1305_encryptAndSeal(this.accessoryToControllerEncryptionKey, this.accessoryToControllerNonceBuffer, frameHeader, payloadBuffer);
        this.socket.write(Buffer.concat([frameHeader, encrypted.ciphertext, encrypted.authTag]));
        /* Useful for debugging outgoing packages and detecting encoding errors
            console.log("SENT DATA: " + payloadBuffer.toString("hex"));
            const frame: HDSFrame = {
                header: frameHeader,
                plaintextPayload: payloadBuffer,
                cipheredPayload: cipheredPayload,
                authTag: authTag,
            };
            const sentMessage = this.decodePayloads([frame])[0];
            console.log("Sent message: " + JSON.stringify(sentMessage, null, 4));
            //*/
    };
    DataStreamConnection.prototype.close = function () {
        if (this.state >= 3 /* CLOSING */) {
            return; // connection is already closing/closed
        }
        this.state = 3 /* CLOSING */;
        this.socket.end();
    };
    DataStreamConnection.prototype.isConsideredClosed = function () {
        return this.state >= 3 /* CLOSING */;
    };
    DataStreamConnection.prototype.onHAPSessionClosed = function () {
        // If the hap connection is closed it is probably also a good idea to close the data stream connection
        debug("[%s] HAP connection disconnected. Also closing DataStream connection now.", this.remoteAddress);
        this.close();
    };
    DataStreamConnection.prototype.onSocketError = function (error) {
        debug("[%s] Encountered socket error: %s", this.remoteAddress, error.message);
        // onSocketClose will be called next
    };
    DataStreamConnection.prototype.onSocketClose = function () {
        var _a;
        // this instance is now considered completely dead
        this.state = 4 /* CLOSED */;
        this.emit("closed" /* CLOSED */);
        (_a = this.connection) === null || _a === void 0 ? void 0 : _a.removeListener("closed" /* CLOSED */, this.hapConnectionClosedListener);
        this.removeAllListeners();
    };
    DataStreamConnection.MAX_PAYLOAD_LENGTH = 1048575;
    return DataStreamConnection;
}(events_1.EventEmitter));
exports.DataStreamConnection = DataStreamConnection;
//# sourceMappingURL=DataStreamServer.js.map