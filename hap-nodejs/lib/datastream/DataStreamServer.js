"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStreamConnection = exports.HDSConnectionError = exports.HDSConnectionErrorType = exports.DataStreamConnectionEvent = exports.DataStreamServer = exports.DataStreamServerEvent = exports.MessageType = exports.HDSProtocolError = exports.HDSProtocolSpecificErrorReason = exports.HDSStatus = exports.Topics = exports.Protocols = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const events_1 = require("events");
const net_1 = tslib_1.__importDefault(require("net"));
const hapCrypto = tslib_1.__importStar(require("../util/hapCrypto"));
const DataStreamParser_1 = require("./DataStreamParser");
const debug = (0, debug_1.default)("HAP-NodeJS:DataStream:Server");
/**
 * @group HomeKit Data Streams (HDS)
 */
var Protocols;
(function (Protocols) {
    Protocols["CONTROL"] = "control";
    Protocols["TARGET_CONTROL"] = "targetControl";
    Protocols["DATA_SEND"] = "dataSend";
})(Protocols || (exports.Protocols = Protocols = {}));
/**
 * @group HomeKit Data Streams (HDS)
 */
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
})(Topics || (exports.Topics = Topics = {}));
/**
 * @group HomeKit Data Streams (HDS)
 */
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
})(HDSStatus || (exports.HDSStatus = HDSStatus = {}));
/**
 * @group HomeKit Data Streams (HDS)
 */
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
})(HDSProtocolSpecificErrorReason || (exports.HDSProtocolSpecificErrorReason = HDSProtocolSpecificErrorReason = {}));
/**
 * An error indicating a protocol level HDS error.
 * E.g. it may be used to encode a {@link HDSStatus.PROTOCOL_SPECIFIC_ERROR} in the {@link Protocols.DATA_SEND} protocol.
 * @group HomeKit Data Streams (HDS)
 */
class HDSProtocolError extends Error {
    reason;
    /**
     * Initializes a new `HDSProtocolError`
     * @param reason - The {@link HDSProtocolSpecificErrorReason}.
     *  Values MUST NOT be {@link HDSProtocolSpecificErrorReason.NORMAL}.
     */
    constructor(reason) {
        super("HDSProtocolError: " + reason);
        (0, assert_1.default)(reason !== 0 /* HDSProtocolSpecificErrorReason.NORMAL */, "Cannot initialize a HDSProtocolError with NORMAL!");
        this.reason = reason;
    }
}
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
/**
 * @group HomeKit Data Streams (HDS)
 */
var MessageType;
(function (MessageType) {
    MessageType[MessageType["EVENT"] = 1] = "EVENT";
    MessageType[MessageType["REQUEST"] = 2] = "REQUEST";
    MessageType[MessageType["RESPONSE"] = 3] = "RESPONSE";
})(MessageType || (exports.MessageType = MessageType = {}));
/**
 * @group HomeKit Data Streams (HDS)
 */
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
})(DataStreamServerEvent || (exports.DataStreamServerEvent = DataStreamServerEvent = {}));
/**
 * DataStreamServer which listens for incoming tcp connections and handles identification of new connections
 * @group HomeKit Data Streams (HDS)
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class DataStreamServer extends events_1.EventEmitter {
    static version = "1.0";
    state = 0 /* ServerState.UNINITIALIZED */;
    static accessoryToControllerInfo = Buffer.from("HDS-Read-Encryption-Key");
    static controllerToAccessoryInfo = Buffer.from("HDS-Write-Encryption-Key");
    tcpServer;
    tcpPort;
    preparedSessions = [];
    connections = [];
    removeListenersOnceClosed = false;
    internalEventEmitter = new events_1.EventEmitter(); // used for message event and message request handlers
    constructor() {
        super();
    }
    /**
     * Registers a new event handler to handle incoming event messages.
     * The handler is only called for a connection if for the give protocol no ProtocolHandler
     * was registered on the connection level.
     *
     * @param protocol - name of the protocol to register the handler for
     * @param event - name of the event (also referred to as topic. See {@link Topics} for some known ones)
     * @param handler - function to be called for every occurring event
     */
    onEventMessage(protocol, event, handler) {
        this.internalEventEmitter.on(protocol + "-e-" + event, handler);
        return this;
    }
    /**
     * Removes a registered event handler.
     *
     * @param protocol - name of the protocol to unregister the handler for
     * @param event - name of the event (also referred to as topic. See {@link Topics} for some known ones)
     * @param handler - registered event handler
     */
    removeEventHandler(protocol, event, handler) {
        this.internalEventEmitter.removeListener(protocol + "-e-" + event, handler);
        return this;
    }
    /**
     * Registers a new request handler to handle incoming request messages.
     * The handler is only called for a connection if for the give protocol no ProtocolHandler
     * was registered on the connection level.
     *
     * @param protocol - name of the protocol to register the handler for
     * @param request - name of the request (also referred to as topic. See {@link Topics} for some known ones)
     * @param handler - function to be called for every occurring request
     */
    onRequestMessage(protocol, request, handler) {
        this.internalEventEmitter.on(protocol + "-r-" + request, handler);
        return this;
    }
    /**
     * Removes a registered request handler.
     *
     * @param protocol - name of the protocol to unregister the handler for
     * @param request - name of the request (also referred to as topic. See {@link Topics} for some known ones)
     * @param handler - registered request handler
     */
    removeRequestHandler(protocol, request, handler) {
        this.internalEventEmitter.removeListener(protocol + "-r-" + request, handler);
        return this;
    }
    prepareSession(connection, controllerKeySalt, callback) {
        debug("Preparing for incoming HDS connection from %s", connection.sessionID);
        const accessoryKeySalt = crypto_1.default.randomBytes(32);
        const salt = Buffer.concat([controllerKeySalt, accessoryKeySalt]);
        const accessoryToControllerEncryptionKey = hapCrypto.HKDF("sha512", salt, connection.encryption.sharedSecret, DataStreamServer.accessoryToControllerInfo, 32);
        const controllerToAccessoryEncryptionKey = hapCrypto.HKDF("sha512", salt, connection.encryption.sharedSecret, DataStreamServer.controllerToAccessoryInfo, 32);
        const preparedSession = {
            connection: connection,
            accessoryToControllerEncryptionKey: accessoryToControllerEncryptionKey,
            controllerToAccessoryEncryptionKey: controllerToAccessoryEncryptionKey,
            accessoryKeySalt: accessoryKeySalt,
            connectTimeout: setTimeout(() => this.timeoutPreparedSession(preparedSession), 10000),
        };
        preparedSession.connectTimeout.unref();
        this.preparedSessions.push(preparedSession);
        this.checkTCPServerEstablished(preparedSession, (error) => {
            if (error) {
                callback(error);
            }
            else {
                callback(undefined, preparedSession);
            }
        });
    }
    timeoutPreparedSession(preparedSession) {
        debug("Prepared HDS session timed out out since no connection was opened for 10 seconds (%s)", preparedSession.connection.sessionID);
        const index = this.preparedSessions.indexOf(preparedSession);
        if (index >= 0) {
            this.preparedSessions.splice(index, 1);
        }
        this.checkCloseable();
    }
    checkTCPServerEstablished(preparedSession, callback) {
        switch (this.state) {
            case 0 /* ServerState.UNINITIALIZED */:
                debug("Starting up TCP server.");
                this.tcpServer = net_1.default.createServer();
                this.tcpServer.once("listening", this.listening.bind(this, preparedSession, callback));
                this.tcpServer.on("connection", this.onConnection.bind(this));
                this.tcpServer.on("close", this.closed.bind(this));
                this.tcpServer.listen();
                this.state = 1 /* ServerState.BINDING */;
                break;
            case 1 /* ServerState.BINDING */:
                debug("TCP server already running. Waiting for it to bind.");
                this.tcpServer.once("listening", this.listening.bind(this, preparedSession, callback));
                break;
            case 2 /* ServerState.LISTENING */:
                debug("Instructing client to connect to already running TCP server");
                preparedSession.port = this.tcpPort;
                callback();
                break;
            case 3 /* ServerState.CLOSING */:
                debug("TCP socket is currently closing. Trying again when server is fully closed and opening a new one then.");
                this.tcpServer.once("close", () => setTimeout(() => this.checkTCPServerEstablished(preparedSession, callback), 10));
                break;
        }
    }
    listening(preparedSession, callback) {
        this.state = 2 /* ServerState.LISTENING */;
        const address = this.tcpServer.address();
        if (address && typeof address !== "string") { // address is only typeof string when listening to a pipe or unix socket
            this.tcpPort = address.port;
            preparedSession.port = address.port;
            debug("TCP server is now listening for new data stream connections on port %s", address.port);
            callback();
        }
    }
    onConnection(socket) {
        debug("[%s] New DataStream connection was established", socket.remoteAddress);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const connection = new DataStreamConnection(socket);
        connection.on("identification" /* DataStreamConnectionEvent.IDENTIFICATION */, this.handleSessionIdentification.bind(this, connection));
        connection.on("handle-message-globally" /* DataStreamConnectionEvent.HANDLE_MESSAGE_GLOBALLY */, this.handleMessageGlobally.bind(this, connection));
        connection.on("closed" /* DataStreamConnectionEvent.CLOSED */, this.connectionClosed.bind(this, connection));
        this.connections.push(connection);
        this.emit("connection-opened" /* DataStreamServerEvent.CONNECTION_OPENED */, connection);
    }
    handleSessionIdentification(connection, firstFrame, callback) {
        let identifiedSession = undefined;
        for (let i = 0; i < this.preparedSessions.length; i++) {
            const preparedSession = this.preparedSessions[i];
            // if we successfully decrypt the first frame with this key we know to which session this connection belongs
            if (connection.decryptHDSFrame(firstFrame, preparedSession.controllerToAccessoryEncryptionKey)) {
                identifiedSession = preparedSession;
                break;
            }
        }
        callback(identifiedSession);
        if (identifiedSession) {
            debug("[%s] Connection was successfully identified (linked with sessionId: %s)", connection.remoteAddress, identifiedSession.connection.sessionID);
            const index = this.preparedSessions.indexOf(identifiedSession);
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
    }
    handleMessageGlobally(connection, message) {
        assert_1.default.notStrictEqual(message.type, 3 /* MessageType.RESPONSE */); // responses can't physically get here
        let separator = "";
        const args = [];
        if (message.type === 1 /* MessageType.EVENT */) {
            separator = "-e-";
        }
        else if (message.type === 2 /* MessageType.REQUEST */) {
            separator = "-r-";
            args.push(message.id);
        }
        args.push(message.message);
        let hadListeners;
        try {
            hadListeners = this.internalEventEmitter.emit(message.protocol + separator + message.topic, connection, ...args);
        }
        catch (error) {
            hadListeners = true;
            debug("[%s] Error occurred while dispatching handler for HDS message: %o", connection.remoteAddress, message);
            debug(error.stack);
        }
        if (!hadListeners) {
            debug("[%s] WARNING no handler was found for message: %o", connection.remoteAddress, message);
        }
    }
    connectionClosed(connection) {
        debug("[%s] DataStream connection closed", connection.remoteAddress);
        this.connections.splice(this.connections.indexOf(connection), 1);
        this.emit("connection-closed" /* DataStreamServerEvent.CONNECTION_CLOSED */, connection);
        this.checkCloseable();
        if (this.state === 3 /* ServerState.CLOSING */ && this.removeListenersOnceClosed && this.connections.length === 0) {
            this.removeAllListeners(); // see this.destroy()
        }
    }
    checkCloseable() {
        if (this.connections.length === 0 && this.preparedSessions.length === 0 && this.state < 3 /* ServerState.CLOSING */) {
            debug("Last connection disconnected. Closing the server now.");
            this.state = 3 /* ServerState.CLOSING */;
            this.tcpServer.close();
        }
    }
    /**
     * This method will fully stop the DataStreamServer
     */
    destroy() {
        if (this.state > 0 /* ServerState.UNINITIALIZED */ && this.state < 3 /* ServerState.CLOSING */) {
            this.tcpServer.close();
            for (const connection of this.connections) {
                connection.close();
            }
        }
        this.state = 3 /* ServerState.CLOSING */;
        this.removeListenersOnceClosed = true;
        this.internalEventEmitter.removeAllListeners();
    }
    closed() {
        this.tcpServer = undefined;
        this.tcpPort = undefined;
        this.state = 0 /* ServerState.UNINITIALIZED */;
    }
}
exports.DataStreamServer = DataStreamServer;
/**
 * @group HomeKit Data Streams (HDS)
 */
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
     * This event is emitted when no handler could be found for the given protocol of an event or request message.
     */
    DataStreamConnectionEvent["HANDLE_MESSAGE_GLOBALLY"] = "handle-message-globally";
    /**
     * This event is emitted when the socket of the connection was closed.
     */
    DataStreamConnectionEvent["CLOSED"] = "closed";
})(DataStreamConnectionEvent || (exports.DataStreamConnectionEvent = DataStreamConnectionEvent = {}));
/**
 * @group HomeKit Data Streams (HDS)
 */
var HDSConnectionErrorType;
(function (HDSConnectionErrorType) {
    HDSConnectionErrorType[HDSConnectionErrorType["ILLEGAL_STATE"] = 1] = "ILLEGAL_STATE";
    HDSConnectionErrorType[HDSConnectionErrorType["CLOSED_SOCKET"] = 2] = "CLOSED_SOCKET";
    HDSConnectionErrorType[HDSConnectionErrorType["MAX_PAYLOAD_LENGTH"] = 3] = "MAX_PAYLOAD_LENGTH";
})(HDSConnectionErrorType || (exports.HDSConnectionErrorType = HDSConnectionErrorType = {}));
/**
 * @group HomeKit Data Streams (HDS)
 */
class HDSConnectionError extends Error {
    type;
    constructor(message, type) {
        super(message);
        this.type = type;
    }
}
exports.HDSConnectionError = HDSConnectionError;
/**
 * DataStream connection which holds any necessary state information, encryption and decryption keys, manages
 * protocol handlers and also handles sending and receiving of data stream frames.
 *
 * @group HomeKit Data Streams (HDS)
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class DataStreamConnection extends events_1.EventEmitter {
    static MAX_PAYLOAD_LENGTH = 0b11111111111111111111;
    socket;
    connection; // reference to the hap connection. is present when state > UNIDENTIFIED
    remoteAddress;
    /*
          Since our DataStream server does only listen on one port and this port is supplied to every client
          which wants to connect, we do not really know which client is who when we receive a tcp connection.
          Thus, we find the correct PreparedDataStreamSession object by testing the encryption keys of all available
          prepared sessions. Then we can reference this hds connection with the correct hap connection and mark it as identified.
       */
    state = 0 /* ConnectionState.UNIDENTIFIED */;
    accessoryToControllerEncryptionKey;
    controllerToAccessoryEncryptionKey;
    accessoryToControllerNonce;
    accessoryToControllerNonceBuffer;
    controllerToAccessoryNonce;
    controllerToAccessoryNonceBuffer;
    frameBuffer; // used to store incomplete HDS frames
    hapConnectionClosedListener;
    protocolHandlers = {}; // used to store protocolHandlers identified by their protocol name
    responseHandlers = {}; // used to store responseHandlers indexed by their respective requestId
    responseTimers = {}; // used to store response timeouts indexed by their respective requestId
    helloTimer;
    constructor(socket) {
        super();
        this.socket = socket;
        this.remoteAddress = socket.remoteAddress;
        this.socket.setNoDelay(true); // disable Nagle algorithm
        this.socket.setKeepAlive(true);
        this.accessoryToControllerNonce = 0;
        this.accessoryToControllerNonceBuffer = Buffer.alloc(8);
        this.controllerToAccessoryNonce = 0;
        this.controllerToAccessoryNonceBuffer = Buffer.alloc(8);
        this.hapConnectionClosedListener = this.onHAPSessionClosed.bind(this);
        this.addProtocolHandler("control" /* Protocols.CONTROL */, {
            requestHandler: {
                ["hello" /* Topics.HELLO */]: this.handleHello.bind(this),
            },
        });
        this.helloTimer = setTimeout(() => {
            debug("[%s] Hello message did not arrive in time. Killing the connection", this.remoteAddress);
            this.close();
        }, 10000);
        this.socket.on("data", this.onSocketData.bind(this));
        this.socket.on("error", this.onSocketError.bind(this));
        this.socket.on("close", this.onSocketClose.bind(this));
        // this is to mitigate the event emitter "memory leak warning".
        // e.g. with HSV there might be multiple cameras subscribing to the CLOSE event. one subscription for
        // every active recording stream on a camera. The default limit of 10 might be easily reached.
        // Setting a high limit isn't the prefect solution, but will avoid false positives but ensures that
        // a warning is still be printed if running long enough.
        this.setMaxListeners(100);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleHello(id, message) {
        // that hello is indeed the _first_ message received is verified in onSocketData(...)
        debug("[%s] Received hello message from client: %o", this.remoteAddress, message);
        clearTimeout(this.helloTimer);
        this.helloTimer = undefined;
        this.state = 2 /* ConnectionState.READY */;
        this.sendResponse("control" /* Protocols.CONTROL */, "hello" /* Topics.HELLO */, id);
    }
    /**
     * Registers a new protocol handler to handle incoming messages.
     * The same protocol cannot be registered multiple times.
     *
     * @param protocol - name of the protocol to register the handler for
     * @param protocolHandler - object to be registered as protocol handler
     */
    addProtocolHandler(protocol, protocolHandler) {
        if (this.protocolHandlers[protocol] !== undefined) {
            return false;
        }
        this.protocolHandlers[protocol] = protocolHandler;
        return true;
    }
    /**
     * Removes a protocol handler if it is registered.
     *
     * @param protocol - name of the protocol to unregister the handler for
     * @param protocolHandler - object which will be unregistered
     */
    removeProtocolHandler(protocol, protocolHandler) {
        const current = this.protocolHandlers[protocol];
        if (current === protocolHandler) {
            delete this.protocolHandlers[protocol];
        }
    }
    /**
     * Sends a new event message to the connected client.
     *
     * @param protocol - name of the protocol
     * @param event - name of the event (also referred to as topic. See {@link Topics} for some known ones)
     * @param message - message dictionary which gets sent along the event
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendEvent(protocol, event, message = {}) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const header = {};
        header.protocol = protocol;
        header.event = event;
        if (this.state === 2 /* ConnectionState.READY */) {
            this.sendHDSFrame(header, message);
        }
    }
    /**
     * Sends a new request message to the connected client.
     *
     * @param protocol - name of the protocol
     * @param request - name of the request (also referred to as topic. See {@link Topics} for some known ones)
     * @param message - message dictionary which gets sent along the request
     * @param callback - handler which gets supplied with an error object if the response didn't
     *                   arrive in time or the status and the message dictionary from the response
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendRequest(protocol, request, message = {}, callback) {
        let requestId;
        do { // generate unused requestId
            // currently writing int64 to data stream is not really supported, so 32-bit int will be the max
            requestId = Math.floor(Math.random() * 4294967295);
        } while (this.responseHandlers[requestId] !== undefined);
        this.responseHandlers[requestId] = callback;
        this.responseTimers[requestId] = setTimeout(() => {
            // we did not receive a response => close socket
            this.close();
            const handler = this.responseHandlers[requestId];
            delete this.responseHandlers[requestId];
            delete this.responseTimers[requestId];
            // handler should be able to clean up their stuff
            handler(new Error("timeout"), undefined, {});
        }, 10000); // 10s timer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const header = {};
        header.protocol = protocol;
        header.request = request;
        header.id = new DataStreamParser_1.Int64(requestId);
        this.sendHDSFrame(header, message);
    }
    /**
     * Send a new response message to a received request message to the client.
     *
     * @param protocol - name of the protocol
     * @param response - name of the response (also referred to as topic. See {@link Topics} for some known ones)
     * @param id - id from the request, to associate the response to the request
     * @param status - status indication if the request was successful. A status of zero indicates success.
     * @param message - message dictionary which gets sent along the response
     */
    sendResponse(protocol, response, id, status = HDSStatus.SUCCESS, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message = {}) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const header = {};
        header.protocol = protocol;
        header.response = response;
        header.id = new DataStreamParser_1.Int64(id);
        header.status = new DataStreamParser_1.Int64(status);
        this.sendHDSFrame(header, message);
    }
    onSocketData(data) {
        if (this.state >= 3 /* ConnectionState.CLOSING */) {
            return;
        }
        let frameIndex = 0;
        const frames = this.decodeHDSFrames(data);
        if (frames.length === 0) { // not enough data
            return;
        }
        if (this.state === 0 /* ConnectionState.UNIDENTIFIED */) {
            // at the beginning we are only interested in trying to decrypt the first frame in order to test decryption keys
            const firstFrame = frames[frameIndex++];
            this.emit("identification" /* DataStreamConnectionEvent.IDENTIFICATION */, firstFrame, (identifiedSession) => {
                if (identifiedSession) {
                    // horray, we found our connection
                    this.connection = identifiedSession.connection;
                    this.accessoryToControllerEncryptionKey = identifiedSession.accessoryToControllerEncryptionKey;
                    this.controllerToAccessoryEncryptionKey = identifiedSession.controllerToAccessoryEncryptionKey;
                    this.state = 1 /* ConnectionState.EXPECTING_HELLO */;
                    // below listener is removed in .close()
                    this.connection.setMaxListeners(this.connection.getMaxListeners() + 1);
                    this.connection.on("closed" /* HAPConnectionEvent.CLOSED */, this.hapConnectionClosedListener); // register close listener
                    debug("[%s] Registering CLOSED handler to HAP connection. Connection currently has %d close handlers!", this.remoteAddress, this.connection.listeners("closed" /* HAPConnectionEvent.CLOSED */).length);
                }
            });
            if (this.state === 0 /* ConnectionState.UNIDENTIFIED */) {
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
        const messages = this.decodePayloads(frames); // decode contents of payload
        if (this.state === 1 /* ConnectionState.EXPECTING_HELLO */) {
            const firstMessage = messages[0];
            if (firstMessage.protocol !== "control" /* Protocols.CONTROL */ || firstMessage.type !== 2 /* MessageType.REQUEST */ || firstMessage.topic !== "hello" /* Topics.HELLO */) {
                // first message is not the expected hello request
                debug("[%s] First message received was not the expected hello message. Instead got: %o", this.remoteAddress, firstMessage);
                this.close();
                return;
            }
        }
        messages.forEach(message => {
            if (message.type === 3 /* MessageType.RESPONSE */) {
                // protocol and topic are currently not tested here; just assumed they are correct;
                // probably they are as the requestId is unique per connection no matter what protocol is used
                const responseHandler = this.responseHandlers[message.id];
                const responseTimer = this.responseTimers[message.id];
                if (responseTimer) {
                    clearTimeout(responseTimer);
                    delete this.responseTimers[message.id];
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
                    debug("[%s] Error occurred while dispatching response handler for HDS message: %o", this.remoteAddress, message);
                    debug(error.stack);
                }
                delete this.responseHandlers[message.id];
            }
            else {
                const handler = this.protocolHandlers[message.protocol];
                if (handler === undefined) {
                    // send message to the server to check if there are some global handlers for it
                    this.emit("handle-message-globally" /* DataStreamConnectionEvent.HANDLE_MESSAGE_GLOBALLY */, message);
                    return;
                }
                if (message.type === 1 /* MessageType.EVENT */) {
                    let eventHandler;
                    if (!handler.eventHandler || !(eventHandler = handler.eventHandler[message.topic])) {
                        debug("[%s] WARNING no event handler was found for message: %o", this.remoteAddress, message);
                        return;
                    }
                    try {
                        eventHandler(message.message);
                    }
                    catch (error) {
                        debug("[%s] Error occurred while dispatching event handler for HDS message: %o", this.remoteAddress, message);
                        debug(error.stack);
                    }
                }
                else if (message.type === 2 /* MessageType.REQUEST */) {
                    let requestHandler;
                    if (!handler.requestHandler || !(requestHandler = handler.requestHandler[message.topic])) {
                        debug("[%s] WARNING no request handler was found for message: %o", this.remoteAddress, message);
                        return;
                    }
                    try {
                        requestHandler(message.id, message.message);
                    }
                    catch (error) {
                        debug("[%s] Error occurred while dispatching request handler for HDS message: %o", this.remoteAddress, message);
                        debug(error.stack);
                    }
                }
                else {
                    debug("[%s] Encountered unknown message type with id %d", this.remoteAddress, message.type);
                }
            }
        });
    }
    decodeHDSFrames(data) {
        if (this.frameBuffer !== undefined) {
            data = Buffer.concat([this.frameBuffer, data]);
            this.frameBuffer = undefined;
        }
        const totalBufferLength = data.length;
        const frames = [];
        for (let frameBegin = 0; frameBegin < totalBufferLength;) {
            if (frameBegin + 4 > totalBufferLength) {
                // we don't have enough data in the buffer for the next header
                this.frameBuffer = data.subarray(frameBegin);
                break;
            }
            const payloadType = data.readUInt8(frameBegin); // type defining structure of payload; 8-bit; currently expected to be 1
            const payloadLength = data.readUIntBE(frameBegin + 1, 3); // read 24-bit big-endian uint length field
            if (payloadLength > DataStreamConnection.MAX_PAYLOAD_LENGTH) {
                debug("[%s] Connection send payload with size bigger than the maximum allow for data stream", this.remoteAddress);
                this.close();
                return [];
            }
            const remainingBufferLength = totalBufferLength - frameBegin - 4; // subtract 4 for payloadType (1-byte) and payloadLength (3-byte)
            // check if the data from this frame is already there (payload + 16-byte authTag)
            if (payloadLength + 16 > remainingBufferLength) {
                // Frame is fragmented, so we wait until we receive more
                this.frameBuffer = data.subarray(frameBegin);
                break;
            }
            const payloadBegin = frameBegin + 4;
            const authTagBegin = payloadBegin + payloadLength;
            const header = data.subarray(frameBegin, payloadBegin); // header is also authenticated using authTag
            const cipheredPayload = data.subarray(payloadBegin, authTagBegin);
            const plaintextPayload = Buffer.alloc(payloadLength);
            const authTag = data.subarray(authTagBegin, authTagBegin + 16);
            frameBegin = authTagBegin + 16; // move to next frame
            if (payloadType === 1) {
                const hdsFrame = {
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
    }
    /**
     * @private file-private API
     */
    decryptHDSFrame(frame, keyOverwrite) {
        hapCrypto.writeUInt64LE(this.controllerToAccessoryNonce, this.controllerToAccessoryNonceBuffer, 0); // update nonce buffer
        const key = keyOverwrite || this.controllerToAccessoryEncryptionKey;
        try {
            frame.plaintextPayload = hapCrypto.chacha20_poly1305_decryptAndVerify(key, this.controllerToAccessoryNonceBuffer, frame.header, frame.cipheredPayload, frame.authTag);
            this.controllerToAccessoryNonce++; // we had a successful encryption, increment the nonce
            return true;
        }
        catch (error) {
            // frame decryption or authentication failed. Could happen when our guess for a PreparedDataStreamSession is wrong
            return false;
        }
    }
    decodePayloads(frames) {
        const messages = [];
        frames.forEach(frame => {
            const payload = frame.plaintextPayload;
            if (!payload) {
                throw new HDSConnectionError("Reached illegal state. Encountered HDSFrame with wasn't decrypted yet!", 1 /* HDSConnectionErrorType.ILLEGAL_STATE */);
            }
            const headerLength = payload.readUInt8(0);
            const messageLength = payload.length - headerLength - 1;
            const headerBegin = 1;
            const messageBegin = headerBegin + headerLength;
            const headerPayload = new DataStreamParser_1.DataStreamReader(payload.subarray(headerBegin, headerBegin + headerLength));
            const messagePayload = new DataStreamParser_1.DataStreamReader(payload.subarray(messageBegin, messageBegin + messageLength));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let headerDictionary;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let messageDictionary;
            try {
                headerDictionary = DataStreamParser_1.DataStreamParser.decode(headerPayload);
                headerPayload.finished();
            }
            catch (error) {
                debug("[%s] Failed to decode header payload: %s", this.remoteAddress, error.message);
                return;
            }
            try {
                messageDictionary = DataStreamParser_1.DataStreamParser.decode(messagePayload);
                messagePayload.finished();
            }
            catch (error) {
                debug("[%s] Failed to decode message payload: %s (header: %o)", this.remoteAddress, error.message, headerDictionary);
                return;
            }
            let type;
            const protocol = headerDictionary.protocol;
            let topic;
            let id = undefined;
            let status = undefined;
            if (headerDictionary.event !== undefined) {
                type = 1 /* MessageType.EVENT */;
                topic = headerDictionary.event;
            }
            else if (headerDictionary.request !== undefined) {
                type = 2 /* MessageType.REQUEST */;
                topic = headerDictionary.request;
                id = headerDictionary.id;
            }
            else if (headerDictionary.response !== undefined) {
                type = 3 /* MessageType.RESPONSE */;
                topic = headerDictionary.response;
                id = headerDictionary.id;
                status = headerDictionary.status;
            }
            else {
                debug("[%s] Encountered unknown payload header format: %o (message: %o)", this.remoteAddress, headerDictionary, messageDictionary);
                return;
            }
            const message = {
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
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendHDSFrame(header, message) {
        if (this.state >= 3 /* ConnectionState.CLOSING */) {
            throw new HDSConnectionError("Cannot send message on closing/closed socket!", 2 /* HDSConnectionErrorType.CLOSED_SOCKET */);
        }
        const headerWriter = new DataStreamParser_1.DataStreamWriter();
        const messageWriter = new DataStreamParser_1.DataStreamWriter();
        DataStreamParser_1.DataStreamParser.encode(header, headerWriter);
        DataStreamParser_1.DataStreamParser.encode(message, messageWriter);
        const payloadHeaderBuffer = Buffer.alloc(1);
        payloadHeaderBuffer.writeUInt8(headerWriter.length(), 0);
        const payloadBuffer = Buffer.concat([payloadHeaderBuffer, headerWriter.getData(), messageWriter.getData()]);
        if (payloadBuffer.length > DataStreamConnection.MAX_PAYLOAD_LENGTH) {
            throw new HDSConnectionError("Tried sending payload with length larger than the maximum allowed for data stream", 3 /* HDSConnectionErrorType.MAX_PAYLOAD_LENGTH */);
        }
        const frameTypeBuffer = Buffer.alloc(1);
        frameTypeBuffer.writeUInt8(1, 0);
        let frameLengthBuffer = Buffer.alloc(4);
        frameLengthBuffer.writeUInt32BE(payloadBuffer.length, 0);
        frameLengthBuffer = frameLengthBuffer.subarray(1, 4); // a bit hacky but the only real way to write 24-bit int in node
        const frameHeader = Buffer.concat([frameTypeBuffer, frameLengthBuffer]);
        hapCrypto.writeUInt64LE(this.accessoryToControllerNonce++, this.accessoryToControllerNonceBuffer);
        const encrypted = hapCrypto.chacha20_poly1305_encryptAndSeal(this.accessoryToControllerEncryptionKey, this.accessoryToControllerNonceBuffer, frameHeader, payloadBuffer);
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
    }
    close() {
        if (this.state >= 3 /* ConnectionState.CLOSING */) {
            return; // connection is already closing/closed
        }
        this.state = 3 /* ConnectionState.CLOSING */;
        this.socket.end();
    }
    isConsideredClosed() {
        return this.state >= 3 /* ConnectionState.CLOSING */;
    }
    onHAPSessionClosed() {
        // If the hap connection is closed it is probably also a good idea to close the data stream connection
        debug("[%s] HAP connection disconnected. Also closing DataStream connection now.", this.remoteAddress);
        this.close();
    }
    onSocketError(error) {
        debug("[%s] Encountered socket error: %s", this.remoteAddress, error.message);
        // onSocketClose will be called next
    }
    onSocketClose() {
        // this instance is now considered completely dead
        this.state = 4 /* ConnectionState.CLOSED */;
        this.emit("closed" /* DataStreamConnectionEvent.CLOSED */);
        this.connection?.removeListener("closed" /* HAPConnectionEvent.CLOSED */, this.hapConnectionClosedListener);
        this.connection?.setMaxListeners(this.connection.getMaxListeners() - 1);
        this.removeAllListeners();
    }
}
exports.DataStreamConnection = DataStreamConnection;
//# sourceMappingURL=DataStreamServer.js.map