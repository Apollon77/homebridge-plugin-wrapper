'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

module.exports = {
  HAPServer: HAPServer
};


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
 *
 * @event 'listening' => function() { }
 *        Emitted when the server is fully set up and ready to receive connections.
 *
 * @event 'identify' => function(callback(err)) { }
 *        Emitted when a client wishes for this server to identify itself before pairing. You must call the
 *        callback to respond to the client with success.
 *
 * @event 'pair' => function(username, publicKey, callback(err)) { }
 *        This event is emitted when a client completes the "pairing" process and exchanges encryption keys.
 *        Note that this does not mean the "Add Accessory" process in iOS has completed. You must call the
 *        callback to complete the process.
 *
 * @event 'verify' => function() { }
 *        This event is emitted after a client successfully completes the "verify" process, thereby authenticating
 *        itself to an Accessory as a known-paired client.
 *
 * @event 'unpair' => function(username, callback(err)) { }
 *        This event is emitted when a client has requested us to "remove their pairing info", or basically to unpair.
 *        You must call the callback to complete the process.
 *
 * @event 'accessories' => function(callback(err, accessories)) { }
 *        This event is emitted when a client requests the complete representation of Accessory data for
 *        this Accessory (for instance, what services, characteristics, etc. are supported) and any bridged
 *        Accessories in the case of a Bridge Accessory. The listener must call the provided callback function
 *        when the accessory data is ready. We will automatically JSON.stringify the data.
 *
 * @event 'get-characteristics' => function(data, events, callback(err, characteristics), remote, connectionID) { }
 *        This event is emitted when a client wishes to retrieve the current value of one or more characteristics.
 *        The listener must call the provided callback function when the values are ready. iOS clients can typically
 *        wait up to 10 seconds for this call to return. We will automatically JSON.stringify the data (which must
 *        be an array) and wrap it in an object with a top-level "characteristics" property.
 *
 * @event 'set-characteristics' => function(data, events, callback(err), remote, connectionID) { }
 *        This event is emitted when a client wishes to set the current value of one or more characteristics and/or
 *        subscribe to one or more events. The 'events' param is an initially-empty object, associated with the current
 *        connection, on which you may store event registration keys for later processing. The listener must call
 *        the provided callback when the request has been processed.
 */


function HAPServer(accessoryInfo, relayServer) {
  this.accessoryInfo = accessoryInfo;
  this.allowInsecureRequest = false;
}

inherits(HAPServer, EventEmitter);


HAPServer.prototype.listen = function(port) {
};

HAPServer.prototype.stop = function() {
};

HAPServer.prototype.notifyClients = function(event, data, excludeEvents) {
};
