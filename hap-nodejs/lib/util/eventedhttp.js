"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HAPConnection = exports.HAPConnectionEvent = exports.HAPConnectionState = exports.EventedHTTPServer = exports.EventedHTTPServerEvent = exports.HAPEncryption = void 0;
var tslib_1 = require("tslib");
var domain_formatter_1 = require("@homebridge/ciao/lib/util/domain-formatter");
var assert_1 = tslib_1.__importDefault(require("assert"));
var debug_1 = tslib_1.__importDefault(require("debug"));
var events_1 = require("events");
var http_1 = tslib_1.__importDefault(require("http"));
var net_1 = tslib_1.__importDefault(require("net"));
var os_1 = tslib_1.__importDefault(require("os"));
var hapCrypto = tslib_1.__importStar(require("./hapCrypto"));
var net_utils_1 = require("./net-utils");
var uuid = tslib_1.__importStar(require("./uuid"));
var debug = debug_1.default('HAP-NodeJS:EventedHTTPServer');
var debugCon = debug_1.default("HAP-NodeJS:EventedHTTPServer:Connection");
/**
 * Simple struct to hold vars needed to support HAP encryption.
 */
var HAPEncryption = /** @class */ (function () {
    function HAPEncryption(clientPublicKey, secretKey, publicKey, sharedSecret, hkdfPairEncryptionKey) {
        this.accessoryToControllerCount = 0;
        this.controllerToAccessoryCount = 0;
        this.clientPublicKey = clientPublicKey;
        this.secretKey = secretKey;
        this.publicKey = publicKey;
        this.sharedSecret = sharedSecret;
        this.hkdfPairEncryptionKey = hkdfPairEncryptionKey;
        this.accessoryToControllerKey = Buffer.alloc(0);
        this.controllerToAccessoryKey = Buffer.alloc(0);
    }
    return HAPEncryption;
}());
exports.HAPEncryption = HAPEncryption;
var EventedHTTPServerEvent;
(function (EventedHTTPServerEvent) {
    EventedHTTPServerEvent["LISTENING"] = "listening";
    EventedHTTPServerEvent["CONNECTION_OPENED"] = "connection-opened";
    EventedHTTPServerEvent["REQUEST"] = "request";
    EventedHTTPServerEvent["CONNECTION_CLOSED"] = "connection-closed";
})(EventedHTTPServerEvent = exports.EventedHTTPServerEvent || (exports.EventedHTTPServerEvent = {}));
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
var EventedHTTPServer = /** @class */ (function (_super) {
    tslib_1.__extends(EventedHTTPServer, _super);
    function EventedHTTPServer() {
        var _this = _super.call(this) || this;
        /**
         * Set of all currently connected HAP connections.
         */
        _this.connections = new Set();
        /**
         * Session dictionary indexed by username/identifier. The username uniquely identifies every person added to the home.
         * So there can be multiple sessions open for a single username (multiple devices connected to the same Apple ID).
         */
        _this.connectionsByUsername = new Map();
        _this.tcpServer = net_1.default.createServer();
        var interval = setInterval(function () {
            var e_1, _a;
            var connectionString = "";
            try {
                for (var _b = tslib_1.__values(_this.connections), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var connection = _c.value;
                    if (connectionString) {
                        connectionString += ", ";
                    }
                    connectionString += connection.remoteAddress + ":" + connection.remotePort;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            debug("Currently " + _this.connections.size + " hap connections open: " + connectionString);
        }, 60000);
        interval.unref();
        return _this;
    }
    EventedHTTPServer.prototype.scheduleNextConnectionIdleTimeout = function () {
        var e_2, _a;
        this.connectionIdleTimeout = undefined;
        if (!this.tcpServer.listening) {
            return;
        }
        debug("Running idle timeout timer...");
        var currentTime = new Date().getTime();
        var nextTimeout = -1;
        try {
            for (var _b = tslib_1.__values(this.connections), _c = _b.next(); !_c.done; _c = _b.next()) {
                var connection = _c.value;
                var timeDelta = currentTime - connection.lastSocketOperation;
                if (timeDelta >= EventedHTTPServer.MAX_CONNECTION_IDLE_TIME) {
                    debug("[%s] Closing connection as it was inactive for " + timeDelta + "ms");
                    connection.close();
                }
                else {
                    nextTimeout = Math.max(nextTimeout, EventedHTTPServer.MAX_CONNECTION_IDLE_TIME - timeDelta);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (this.connections.size >= EventedHTTPServer.CONNECTION_TIMEOUT_LIMIT) {
            this.connectionIdleTimeout = setTimeout(this.scheduleNextConnectionIdleTimeout.bind(this), nextTimeout);
        }
    };
    EventedHTTPServer.prototype.listen = function (targetPort, hostname) {
        var _this = this;
        this.tcpServer.listen(targetPort, hostname, function () {
            var address = _this.tcpServer.address(); // address() is only a string when listening to unix domain sockets
            debug("Server listening on %s:%s", address.family === "IPv6" ? "[" + address.address + "]" : address.address, address.port);
            _this.emit("listening" /* LISTENING */, address.port, address.address);
        });
        this.tcpServer.on("connection", this.onConnection.bind(this));
    };
    EventedHTTPServer.prototype.stop = function () {
        var e_3, _a;
        this.tcpServer.close();
        try {
            for (var _b = tslib_1.__values(this.connections), _c = _b.next(); !_c.done; _c = _b.next()) {
                var connection = _c.value;
                connection.close();
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    EventedHTTPServer.prototype.destroy = function () {
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
    EventedHTTPServer.prototype.broadcastEvent = function (aid, iid, value, originator, immediateDelivery) {
        var e_4, _a;
        try {
            for (var _b = tslib_1.__values(this.connections), _c = _b.next(); !_c.done; _c = _b.next()) {
                var connection = _c.value;
                if (connection === originator) {
                    debug("[%s] Muting event '%s' notification for this connection since it originated here.", connection.remoteAddress, aid + "." + iid);
                    continue;
                }
                connection.sendEvent(aid, iid, value, immediateDelivery);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    EventedHTTPServer.prototype.onConnection = function (socket) {
        var _this = this;
        var connection = new HAPConnection(this, socket);
        connection.on("request" /* REQUEST */, function (request, response) {
            _this.emit("request" /* REQUEST */, connection, request, response);
        });
        connection.on("authenticated" /* AUTHENTICATED */, this.handleConnectionAuthenticated.bind(this, connection));
        connection.on("closed" /* CLOSED */, this.handleConnectionClose.bind(this, connection));
        this.connections.add(connection);
        debug("[%s] New connection from client on interface %s (%s)", connection.remoteAddress, connection.networkInterface, connection.localAddress);
        this.emit("connection-opened" /* CONNECTION_OPENED */, connection);
        if (this.connections.size >= EventedHTTPServer.CONNECTION_TIMEOUT_LIMIT && !this.connectionIdleTimeout) {
            this.scheduleNextConnectionIdleTimeout();
        }
    };
    EventedHTTPServer.prototype.handleConnectionAuthenticated = function (connection, username) {
        var connections = this.connectionsByUsername.get(username);
        if (!connections) {
            this.connectionsByUsername.set(username, [connection]);
        }
        else if (!connections.includes(connection)) { // ensure this doesn't get added more than one time
            connections.push(connection);
        }
    };
    EventedHTTPServer.prototype.handleConnectionClose = function (connection) {
        this.emit("connection-closed" /* CONNECTION_CLOSED */, connection);
        this.connections.delete(connection);
        if (connection.username) { // aka connection was authenticated
            var connections = this.connectionsByUsername.get(connection.username);
            if (connections) {
                var index = connections.indexOf(connection);
                if (index !== -1) {
                    connections.splice(index, 1);
                }
                if (connections.length === 0) {
                    this.connectionsByUsername.delete(connection.username);
                }
            }
        }
    };
    EventedHTTPServer.destroyExistingConnectionsAfterUnpair = function (initiator, username) {
        var e_5, _a;
        var connections = initiator.server.connectionsByUsername.get(username);
        if (connections) {
            try {
                for (var connections_1 = tslib_1.__values(connections), connections_1_1 = connections_1.next(); !connections_1_1.done; connections_1_1 = connections_1.next()) {
                    var connection = connections_1_1.value;
                    connection.closeConnectionAsOfUnpair(initiator);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (connections_1_1 && !connections_1_1.done && (_a = connections_1.return)) _a.call(connections_1);
                }
                finally { if (e_5) throw e_5.error; }
            }
        }
    };
    EventedHTTPServer.CONNECTION_TIMEOUT_LIMIT = 16; // if we have more (or equal) # connections we start the timeout
    EventedHTTPServer.MAX_CONNECTION_IDLE_TIME = 60 * 60 * 1000; // 1h
    return EventedHTTPServer;
}(events_1.EventEmitter));
exports.EventedHTTPServer = EventedHTTPServer;
/**
 * @private
 */
var HAPConnectionState;
(function (HAPConnectionState) {
    HAPConnectionState[HAPConnectionState["CONNECTING"] = 0] = "CONNECTING";
    HAPConnectionState[HAPConnectionState["FULLY_SET_UP"] = 1] = "FULLY_SET_UP";
    HAPConnectionState[HAPConnectionState["AUTHENTICATED"] = 2] = "AUTHENTICATED";
    // above signals are represent a alive connection
    // below states are considered "closed or soon closed"
    HAPConnectionState[HAPConnectionState["TO_BE_TEARED_DOWN"] = 3] = "TO_BE_TEARED_DOWN";
    HAPConnectionState[HAPConnectionState["CLOSING"] = 4] = "CLOSING";
    HAPConnectionState[HAPConnectionState["CLOSED"] = 5] = "CLOSED";
})(HAPConnectionState = exports.HAPConnectionState || (exports.HAPConnectionState = {}));
var HAPConnectionEvent;
(function (HAPConnectionEvent) {
    HAPConnectionEvent["REQUEST"] = "request";
    HAPConnectionEvent["AUTHENTICATED"] = "authenticated";
    HAPConnectionEvent["CLOSED"] = "closed";
})(HAPConnectionEvent = exports.HAPConnectionEvent || (exports.HAPConnectionEvent = {}));
/**
 * Manages a single iOS-initiated HTTP connection during its lifetime.
 * @private
 */
var HAPConnection = /** @class */ (function (_super) {
    tslib_1.__extends(HAPConnection, _super);
    function HAPConnection(server, clientSocket) {
        var _this = _super.call(this) || this;
        _this.state = 0 /* CONNECTING */;
        _this.lastSocketOperation = new Date().getTime();
        _this.pendingClientSocketData = Buffer.alloc(0); // data received from client before HTTP proxy is fully setup
        _this.handlingRequest = false; // true while we are composing an HTTP response (so events can wait)
        _this.registeredEvents = new Set();
        _this.queuedEvents = new Map();
        _this.pendingEventData = []; // queue of unencrypted event data waiting to be sent until after an in-progress HTTP response is being written
        _this.server = server;
        _this.sessionID = uuid.generate(clientSocket.remoteAddress + ':' + clientSocket.remotePort);
        _this.localAddress = clientSocket.localAddress;
        _this.remoteAddress = clientSocket.remoteAddress; // cache because it becomes undefined in 'onClientSocketClose'
        _this.remotePort = clientSocket.remotePort;
        _this.networkInterface = HAPConnection.getLocalNetworkInterface(clientSocket);
        // clientSocket is the socket connected to the actual iOS device
        _this.tcpSocket = clientSocket;
        _this.tcpSocket.on('data', _this.onTCPSocketData.bind(_this));
        _this.tcpSocket.on('close', _this.onTCPSocketClose.bind(_this));
        _this.tcpSocket.on('error', _this.onTCPSocketError.bind(_this)); // we MUST register for this event, otherwise the error will bubble up to the top and crash the node process entirely.
        _this.tcpSocket.setNoDelay(true); // disable Nagle algorithm
        // "HAP accessory servers must not use keepalive messages, which periodically wake up iOS devices".
        // Thus we don't configure any tcp keepalive
        // create our internal HTTP server for this connection that we will proxy data to and from
        _this.internalHttpServer = http_1.default.createServer();
        _this.internalHttpServer.timeout = 0; // clients expect to hold connections open as long as they want
        _this.internalHttpServer.keepAliveTimeout = 0; // workaround for https://github.com/nodejs/node/issues/13391
        _this.internalHttpServer.on("listening", _this.onHttpServerListening.bind(_this));
        _this.internalHttpServer.on('request', _this.handleHttpServerRequest.bind(_this));
        _this.internalHttpServer.on('error', _this.onHttpServerError.bind(_this));
        // close event is added later on the "connect" event as possible listen retries would throw unnecessary close events
        _this.internalHttpServer.listen(0, _this.internalHttpServerAddress = net_utils_1.getOSLoopbackAddressIfAvailable());
        return _this;
    }
    /**
     * This method is called once the connection has gone through pair-verify.
     * As any HomeKit controller will initiate a pair-verify after the pair-setup procedure, this method gets
     * not called on the initial pair-setup.
     *
     * Once this method has been called, the connection is authenticated and encryption is turned on.
     */
    HAPConnection.prototype.connectionAuthenticated = function (username) {
        this.state = 2 /* AUTHENTICATED */;
        this.username = username;
        this.emit("authenticated" /* AUTHENTICATED */, username);
    };
    HAPConnection.prototype.isAuthenticated = function () {
        return this.state === 2 /* AUTHENTICATED */;
    };
    HAPConnection.prototype.close = function () {
        if (this.state >= 4 /* CLOSING */) {
            return; // already closed/closing
        }
        this.state = 4 /* CLOSING */;
        this.tcpSocket.destroy();
    };
    HAPConnection.prototype.closeConnectionAsOfUnpair = function (initiator) {
        if (this === initiator) {
            // the initiator of the unpair request is this connection, meaning it unpaired itself.
            // we still need to send the response packet to the unpair request.
            this.state = 3 /* TO_BE_TEARED_DOWN */;
        }
        else {
            // as HomeKit requires it, destroy any active session which got unpaired
            this.close();
        }
    };
    HAPConnection.prototype.sendEvent = function (aid, iid, value, immediateDelivery) {
        assert_1.default(aid != undefined, "HAPConnection.sendEvent: aid must be defined!");
        assert_1.default(iid != undefined, "HAPConnection.sendEvent: iid must be defined!");
        var eventName = aid + "." + iid;
        if (!this.registeredEvents.has(eventName)) {
            return;
        }
        if (immediateDelivery) {
            // some characteristics are required to deliver notifications immediately
            this.writeEventNotification({
                characteristics: [{
                        aid: aid,
                        iid: iid,
                        value: value,
                    }],
            });
        }
        else {
            // TODO should a new event not remove a previous event (to support censor open -> censor closed :thinking:)
            //   any only remove previous events if the same value was set?
            this.queuedEvents.set(eventName, {
                aid: aid,
                iid: iid,
                value: value,
            });
            if (!this.handlingRequest && !this.eventsTimer) { // if we are handling a request or there is already a timer running we just add it in the queue
                this.eventsTimer = setTimeout(this.handleEventsTimeout.bind(this), 250);
                this.eventsTimer.unref();
            }
        }
    };
    HAPConnection.prototype.handleEventsTimeout = function () {
        this.eventsTimer = undefined;
        if (this.state > 2 /* AUTHENTICATED */ || this.handlingRequest) {
            // connection is closed or about to be closed. no need to send any further events
            // OR we are currently sending a response
            return;
        }
        this.writeQueuedEventNotifications();
    };
    HAPConnection.prototype.writePendingEventNotifications = function () {
        var e_6, _a;
        try {
            for (var _b = tslib_1.__values(this.pendingEventData), _c = _b.next(); !_c.done; _c = _b.next()) {
                var buffer = _c.value;
                this.tcpSocket.write(this.encrypt(buffer));
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        this.pendingEventData.splice(0, this.pendingEventData.length);
    };
    HAPConnection.prototype.writeQueuedEventNotifications = function () {
        var e_7, _a;
        if (this.queuedEvents.size === 0 || this.eventsTimer) {
            return; // don't send empty event notifications or if there is a timeout running
        }
        var eventData = { characteristics: [] };
        try {
            for (var _b = tslib_1.__values(this.queuedEvents), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = tslib_1.__read(_c.value, 2), eventName = _d[0], characteristic = _d[1];
                if (!this.registeredEvents.has(eventName)) { // client unregistered events in the mean time
                    continue;
                }
                eventData.characteristics.push(characteristic);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
        this.queuedEvents.clear();
        this.writeEventNotification(eventData);
    };
    /**
     * This will create an EVENT/1.0 notification header with the provided event notification.
     * If currently a HTTP request is in progress the assembled packet will be
     * added to the pending events list.
     *
     * @param notification - The event which should be sent out
     */
    HAPConnection.prototype.writeEventNotification = function (notification) {
        debugCon("[%s] Sending HAP event notifications %o", this.remoteAddress, notification.characteristics);
        var dataBuffer = Buffer.from(JSON.stringify(notification), "utf8");
        var header = Buffer.from("EVENT/1.0 200 OK\r\n" +
            "Content-Type: application/hap+json\r\n" +
            "Content-Length: " + dataBuffer.length + "\r\n" +
            "\r\n", "utf8" // buffer encoding
        );
        var buffer = Buffer.concat([header, dataBuffer]);
        if (this.handlingRequest) {
            // it is important that we not encrypt the pending event data. This would increment the nonce used in encryption
            this.pendingEventData.push(buffer);
        }
        else {
            this.tcpSocket.write(this.encrypt(buffer), this.handleTCPSocketWriteFulfilled.bind(this));
        }
    };
    HAPConnection.prototype.enableEventNotifications = function (aid, iid) {
        this.registeredEvents.add(aid + "." + iid);
    };
    HAPConnection.prototype.disableEventNotifications = function (aid, iid) {
        this.registeredEvents.delete(aid + "." + iid);
    };
    HAPConnection.prototype.hasEventNotifications = function (aid, iid) {
        return this.registeredEvents.has(aid + "." + iid);
    };
    HAPConnection.prototype.getRegisteredEvents = function () {
        return this.registeredEvents;
    };
    HAPConnection.prototype.clearRegisteredEvents = function () {
        this.registeredEvents.clear();
    };
    HAPConnection.prototype.encrypt = function (data) {
        // if accessoryToControllerKey is not empty, then encryption is enabled for this connection. However, we'll
        // need to be careful to ensure that we don't encrypt the last few bytes of the response from handlePairVerifyStepTwo.
        // Since all communication calls are asynchronous, we could easily receive this 'encrypt' event for those bytes.
        // So we want to make sure that we aren't encrypting data until we have *received* some encrypted data from the client first.
        if (this.encryption && this.encryption.accessoryToControllerKey.length > 0 && this.encryption.controllerToAccessoryCount > 0) {
            return hapCrypto.layerEncrypt(data, this.encryption);
        }
        return data; // otherwise we don't encrypt and return plaintext
    };
    HAPConnection.prototype.decrypt = function (data) {
        if (this.encryption && this.encryption.controllerToAccessoryKey.length > 0) {
            // below call may throw an error if decryption failed
            return hapCrypto.layerDecrypt(data, this.encryption);
        }
        return data; // otherwise we don't decrypt and return plaintext
    };
    HAPConnection.prototype.onHttpServerListening = function () {
        var _this = this;
        var addressInfo = this.internalHttpServer.address(); // address() is only a string when listening to unix domain sockets
        var addressString = addressInfo.family === "IPv6" ? "[" + addressInfo.address + "]" : addressInfo.address;
        this.internalHttpServerPort = addressInfo.port;
        debugCon("[%s] Internal HTTP server listening on %s:%s", this.remoteAddress, addressString, addressInfo.port);
        this.internalHttpServer.on('close', this.onHttpServerClose.bind(this));
        // now we can establish a connection to this running HTTP server for proxying data
        this.httpSocket = net_1.default.createConnection(this.internalHttpServerPort, this.internalHttpServerAddress); // previously we used addressInfo.address
        this.httpSocket.setNoDelay(true); // disable Nagle algorithm
        this.httpSocket.on('data', this.handleHttpServerResponse.bind(this));
        this.httpSocket.on('error', this.onHttpSocketError.bind(this)); // we MUST register for this event, otherwise the error will bubble up to the top and crash the node process entirely.
        this.httpSocket.on('close', this.onHttpSocketClose.bind(this));
        this.httpSocket.on('connect', function () {
            // we are now fully set up:
            //  - clientSocket is connected to the iOS device
            //  - serverSocket is connected to the httpServer
            //  - ready to proxy data!
            _this.state = 1 /* FULLY_SET_UP */;
            debugCon("[%s] Internal HTTP socket connected. HAPConnection now fully set up!", _this.remoteAddress);
            // start by flushing any pending buffered data received from the client while we were setting up
            if (_this.pendingClientSocketData && _this.pendingClientSocketData.length > 0) {
                _this.httpSocket.write(_this.pendingClientSocketData);
            }
            _this.pendingClientSocketData = undefined;
        });
    };
    /**
     * This event handler is called when we receive data from a HomeKit controller on our tcp socket.
     * We store the data if the internal http server is not read yet, or forward it to the http server.
     */
    HAPConnection.prototype.onTCPSocketData = function (data) {
        if (this.state > 2 /* AUTHENTICATED */) {
            // don't accept data of a connection which is about to be closed or already closed
            return;
        }
        this.handlingRequest = true; // reverted to false once response was sent out
        this.lastSocketOperation = new Date().getTime();
        try {
            data = this.decrypt(data);
        }
        catch (error) { // decryption and/or verification failed, disconnect the client
            debugCon("[%s] Error occurred trying to decrypt incoming packet: %s", this.remoteAddress, error.message);
            this.close();
            return;
        }
        if (this.state < 1 /* FULLY_SET_UP */) { // we're not setup yet, so add this data to our intermediate buffer
            this.pendingClientSocketData = Buffer.concat([this.pendingClientSocketData, data]);
        }
        else {
            this.httpSocket.write(data); // proxy it along to the HTTP server
        }
    };
    /**
     * This event handler is called when the internal http server receives a request.
     * Meaning we received data from the HomeKit controller in {@link onTCPSocketData}, which then send the
     * data unencrypted to the internal http server. And now it landed here, fully parsed as a http request.
     */
    HAPConnection.prototype.handleHttpServerRequest = function (request, response) {
        if (this.state > 2 /* AUTHENTICATED */) {
            // don't accept data of a connection which is about to be closed or already closed
            return;
        }
        request.socket.setNoDelay(true);
        response.connection.setNoDelay(true); // deprecated since 13.0.0
        debugCon("[%s] HTTP request: %s", this.remoteAddress, request.url);
        this.emit("request" /* REQUEST */, request, response);
    };
    /**
     * This event handler is called by the socket which is connected to our internal http server.
     * It is called with the response returned from the http server.
     * In this method we have to encrypt and forward the message back to the HomeKit controller.
     */
    HAPConnection.prototype.handleHttpServerResponse = function (data) {
        var _this = this;
        data = this.encrypt(data);
        this.tcpSocket.write(data, this.handleTCPSocketWriteFulfilled.bind(this));
        debugCon("[%s] HTTP Response is finished", this.remoteAddress);
        this.handlingRequest = false;
        if (this.state === 3 /* TO_BE_TEARED_DOWN */) {
            setTimeout(function () { return _this.close(); }, 10);
        }
        else if (this.state < 3 /* TO_BE_TEARED_DOWN */) {
            this.writePendingEventNotifications();
            this.writeQueuedEventNotifications();
        }
    };
    HAPConnection.prototype.handleTCPSocketWriteFulfilled = function () {
        this.lastSocketOperation = new Date().getTime();
    };
    HAPConnection.prototype.onTCPSocketError = function (err) {
        debugCon("[%s] Client connection error: %s", this.remoteAddress, err.message);
        // onTCPSocketClose will be called next
    };
    HAPConnection.prototype.onTCPSocketClose = function () {
        this.state = 5 /* CLOSED */;
        debugCon("[%s] Client connection closed", this.remoteAddress);
        if (this.httpSocket) {
            this.httpSocket.destroy();
        }
        this.internalHttpServer.close();
        this.emit("closed" /* CLOSED */); // sending final closed event
        this.removeAllListeners(); // cleanup listeners, we are officially dead now
    };
    HAPConnection.prototype.onHttpServerError = function (err) {
        debugCon("[%s] HTTP server error: %s", this.remoteAddress, err.message);
        if (err.code === 'EADDRINUSE') {
            this.internalHttpServerPort = undefined;
            this.internalHttpServer.close();
            this.internalHttpServer.listen(0, this.internalHttpServerAddress = net_utils_1.getOSLoopbackAddressIfAvailable());
        }
    };
    HAPConnection.prototype.onHttpServerClose = function () {
        debugCon("[%s] HTTP server was closed", this.remoteAddress);
        // make sure the iOS side is closed as well
        this.close();
    };
    HAPConnection.prototype.onHttpSocketError = function (err) {
        debugCon("[%s] HTTP connection error: ", this.remoteAddress, err.message);
        // onHttpSocketClose will be called next
    };
    HAPConnection.prototype.onHttpSocketClose = function () {
        debugCon("[%s] HTTP connection was closed", this.remoteAddress);
        // we only support a single long-lived connection to our internal HTTP server. Since it's closed,
        // we'll need to shut it down entirely.
        this.internalHttpServer.close();
    };
    HAPConnection.prototype.getLocalAddress = function (ipVersion) {
        var e_8, _a, e_9, _b;
        var infos = os_1.default.networkInterfaces()[this.networkInterface];
        if (ipVersion === "ipv4") {
            try {
                for (var infos_1 = tslib_1.__values(infos), infos_1_1 = infos_1.next(); !infos_1_1.done; infos_1_1 = infos_1.next()) {
                    var info = infos_1_1.value;
                    if (info.family === "IPv4") {
                        return info.address;
                    }
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (infos_1_1 && !infos_1_1.done && (_a = infos_1.return)) _a.call(infos_1);
                }
                finally { if (e_8) throw e_8.error; }
            }
            throw new Error("Could not find " + ipVersion + " address for interface " + this.networkInterface);
        }
        else {
            var localUniqueAddress = undefined;
            try {
                for (var infos_2 = tslib_1.__values(infos), infos_2_1 = infos_2.next(); !infos_2_1.done; infos_2_1 = infos_2.next()) {
                    var info = infos_2_1.value;
                    if (info.family === "IPv6") {
                        if (!info.scopeid) {
                            return info.address;
                        }
                        else if (!localUniqueAddress) {
                            localUniqueAddress = info.address;
                        }
                    }
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (infos_2_1 && !infos_2_1.done && (_b = infos_2.return)) _b.call(infos_2);
                }
                finally { if (e_9) throw e_9.error; }
            }
            if (!localUniqueAddress) {
                throw new Error("Could not find " + ipVersion + " address for interface " + this.networkInterface);
            }
            return localUniqueAddress;
        }
    };
    HAPConnection.getLocalNetworkInterface = function (socket) {
        var e_10, _a, e_11, _b, e_12, _c, e_13, _d;
        var localAddress = socket.localAddress;
        if (localAddress.startsWith("::ffff:")) { // IPv4-Mapped IPv6 Address https://tools.ietf.org/html/rfc4291#section-2.5.5.2
            localAddress = localAddress.substring(7);
        }
        else {
            var index = localAddress.indexOf("%");
            if (index !== -1) { // link-local ipv6
                localAddress = localAddress.substring(0, index);
            }
        }
        var interfaces = os_1.default.networkInterfaces();
        try {
            for (var _e = tslib_1.__values(Object.entries(interfaces)), _f = _e.next(); !_f.done; _f = _e.next()) {
                var _g = tslib_1.__read(_f.value, 2), name = _g[0], infos = _g[1];
                try {
                    for (var infos_3 = (e_11 = void 0, tslib_1.__values(infos)), infos_3_1 = infos_3.next(); !infos_3_1.done; infos_3_1 = infos_3.next()) {
                        var info = infos_3_1.value;
                        if (info.address === localAddress) {
                            return name;
                        }
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (infos_3_1 && !infos_3_1.done && (_b = infos_3.return)) _b.call(infos_3);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
            }
            finally { if (e_10) throw e_10.error; }
        }
        // we couldn't map the address from above, we try now to match subnets (see https://github.com/homebridge/HAP-NodeJS/issues/847)
        var family = net_1.default.isIPv4(localAddress) ? "IPv4" : "IPv6";
        try {
            for (var _h = tslib_1.__values(Object.entries(interfaces)), _j = _h.next(); !_j.done; _j = _h.next()) {
                var _k = tslib_1.__read(_j.value, 2), name = _k[0], infos = _k[1];
                try {
                    for (var infos_4 = (e_13 = void 0, tslib_1.__values(infos)), infos_4_1 = infos_4.next(); !infos_4_1.done; infos_4_1 = infos_4.next()) {
                        var info = infos_4_1.value;
                        if (info.family !== family) {
                            continue;
                        }
                        // check if the localAddress is in the same subnet
                        if (domain_formatter_1.getNetAddress(localAddress, info.netmask) === domain_formatter_1.getNetAddress(info.address, info.netmask)) {
                            return name;
                        }
                    }
                }
                catch (e_13_1) { e_13 = { error: e_13_1 }; }
                finally {
                    try {
                        if (infos_4_1 && !infos_4_1.done && (_d = infos_4.return)) _d.call(infos_4);
                    }
                    finally { if (e_13) throw e_13.error; }
                }
            }
        }
        catch (e_12_1) { e_12 = { error: e_12_1 }; }
        finally {
            try {
                if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
            }
            finally { if (e_12) throw e_12.error; }
        }
        console.log("WARNING couldn't map socket coming from remote address " + socket.remoteAddress + ":" + socket.remotePort + " at local address " + socket.localAddress + " to a interface!");
        return Object.keys(interfaces)[1]; // just use the first interface after the loopback interface as fallback
    };
    return HAPConnection;
}(events_1.EventEmitter));
exports.HAPConnection = HAPConnection;
//# sourceMappingURL=eventedhttp.js.map