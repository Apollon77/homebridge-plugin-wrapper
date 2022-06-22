"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStreamManagement = exports.DataStreamStatus = void 0;
var tslib_1 = require("tslib");
var debug_1 = (0, tslib_1.__importDefault)(require("debug"));
var Characteristic_1 = require("../Characteristic");
var Service_1 = require("../Service");
var tlv = (0, tslib_1.__importStar)(require("../util/tlv"));
var DataStreamServer_1 = require("./DataStreamServer");
var debug = (0, debug_1.default)("HAP-NodeJS:DataStream:Management");
var TransferTransportConfigurationTypes;
(function (TransferTransportConfigurationTypes) {
    TransferTransportConfigurationTypes[TransferTransportConfigurationTypes["TRANSFER_TRANSPORT_CONFIGURATION"] = 1] = "TRANSFER_TRANSPORT_CONFIGURATION";
})(TransferTransportConfigurationTypes || (TransferTransportConfigurationTypes = {}));
var TransportTypeTypes;
(function (TransportTypeTypes) {
    TransportTypeTypes[TransportTypeTypes["TRANSPORT_TYPE"] = 1] = "TRANSPORT_TYPE";
})(TransportTypeTypes || (TransportTypeTypes = {}));
var SetupDataStreamSessionTypes;
(function (SetupDataStreamSessionTypes) {
    SetupDataStreamSessionTypes[SetupDataStreamSessionTypes["SESSION_COMMAND_TYPE"] = 1] = "SESSION_COMMAND_TYPE";
    SetupDataStreamSessionTypes[SetupDataStreamSessionTypes["TRANSPORT_TYPE"] = 2] = "TRANSPORT_TYPE";
    SetupDataStreamSessionTypes[SetupDataStreamSessionTypes["CONTROLLER_KEY_SALT"] = 3] = "CONTROLLER_KEY_SALT";
})(SetupDataStreamSessionTypes || (SetupDataStreamSessionTypes = {}));
var SetupDataStreamWriteResponseTypes;
(function (SetupDataStreamWriteResponseTypes) {
    SetupDataStreamWriteResponseTypes[SetupDataStreamWriteResponseTypes["STATUS"] = 1] = "STATUS";
    SetupDataStreamWriteResponseTypes[SetupDataStreamWriteResponseTypes["TRANSPORT_TYPE_SESSION_PARAMETERS"] = 2] = "TRANSPORT_TYPE_SESSION_PARAMETERS";
    SetupDataStreamWriteResponseTypes[SetupDataStreamWriteResponseTypes["ACCESSORY_KEY_SALT"] = 3] = "ACCESSORY_KEY_SALT";
})(SetupDataStreamWriteResponseTypes || (SetupDataStreamWriteResponseTypes = {}));
var TransportSessionConfiguration;
(function (TransportSessionConfiguration) {
    TransportSessionConfiguration[TransportSessionConfiguration["TCP_LISTENING_PORT"] = 1] = "TCP_LISTENING_PORT";
})(TransportSessionConfiguration || (TransportSessionConfiguration = {}));
var TransportType;
(function (TransportType) {
    TransportType[TransportType["HOMEKIT_DATA_STREAM"] = 0] = "HOMEKIT_DATA_STREAM";
})(TransportType || (TransportType = {}));
var SessionCommandType;
(function (SessionCommandType) {
    SessionCommandType[SessionCommandType["START_SESSION"] = 0] = "START_SESSION";
})(SessionCommandType || (SessionCommandType = {}));
var DataStreamStatus;
(function (DataStreamStatus) {
    DataStreamStatus[DataStreamStatus["SUCCESS"] = 0] = "SUCCESS";
    DataStreamStatus[DataStreamStatus["GENERIC_ERROR"] = 1] = "GENERIC_ERROR";
    DataStreamStatus[DataStreamStatus["BUSY"] = 2] = "BUSY";
})(DataStreamStatus = exports.DataStreamStatus || (exports.DataStreamStatus = {}));
var DataStreamManagement = /** @class */ (function () {
    function DataStreamManagement(service) {
        // one server per accessory is probably the best practice
        this.dataStreamServer = new DataStreamServer_1.DataStreamServer(); // TODO how to handle Remote+future HKSV controller at the same time?
        this.lastSetupDataStreamTransportResponse = ""; // stripped. excludes ACCESSORY_KEY_SALT
        var supportedConfiguration = [TransportType.HOMEKIT_DATA_STREAM];
        this.supportedDataStreamTransportConfiguration = this.buildSupportedDataStreamTransportConfigurationTLV(supportedConfiguration);
        this.dataStreamTransportManagementService = service || this.constructService();
        this.setupServiceHandlers();
    }
    DataStreamManagement.prototype.destroy = function () {
        this.dataStreamServer.destroy(); // removes ALL listeners
        this.dataStreamTransportManagementService.getCharacteristic(Characteristic_1.Characteristic.SetupDataStreamTransport)
            .removeOnGet()
            .removeAllListeners("set" /* SET */);
        this.lastSetupDataStreamTransportResponse = "";
    };
    /**
     * @returns the DataStreamTransportManagement service
     */
    DataStreamManagement.prototype.getService = function () {
        return this.dataStreamTransportManagementService;
    };
    /**
     * Registers a new event handler to handle incoming event messages.
     * The handler is only called for a connection if for the give protocol no ProtocolHandler
     * was registered on the connection level.
     *
     * @param protocol {string | Protocols} - name of the protocol to register the handler for
     * @param event {string | Topics} - name of the event (also referred to as topic. See {Topics} for some known ones)
     * @param handler {GlobalEventHandler} - function to be called for every occurring event
     */
    DataStreamManagement.prototype.onEventMessage = function (protocol, event, handler) {
        this.dataStreamServer.onEventMessage(protocol, event, handler);
        return this;
    };
    /**
     * Removes an registered event handler.
     *
     * @param protocol {string | Protocols} - name of the protocol to unregister the handler for
     * @param event {string | Topics} - name of the event (also referred to as topic. See {Topics} for some known ones)
     * @param handler {GlobalEventHandler} - registered event handler
     */
    DataStreamManagement.prototype.removeEventHandler = function (protocol, event, handler) {
        this.dataStreamServer.removeEventHandler(protocol, event, handler);
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
    DataStreamManagement.prototype.onRequestMessage = function (protocol, request, handler) {
        this.dataStreamServer.onRequestMessage(protocol, request, handler);
        return this;
    };
    /**
     * Removes an registered request handler.
     *
     * @param protocol {string | Protocols} - name of the protocol to unregister the handler for
     * @param request {string | Topics} - name of the request (also referred to as topic. See {Topics} for some known ones)
     * @param handler {GlobalRequestHandler} - registered request handler
     */
    DataStreamManagement.prototype.removeRequestHandler = function (protocol, request, handler) {
        this.dataStreamServer.removeRequestHandler(protocol, request, handler);
        return this;
    };
    /**
     * Forwards any event listener for an DataStreamServer event to the DataStreamServer instance
     *
     * @param event - the event to register for
     * @param listener - the event handler
     */
    DataStreamManagement.prototype.onServerEvent = function (event, listener) {
        // @ts-expect-error: event type
        this.dataStreamServer.on(event, listener);
        return this;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DataStreamManagement.prototype.handleSetupDataStreamTransportWrite = function (value, callback, connection) {
        var _this = this;
        var data = Buffer.from(value, "base64");
        var objects = tlv.decode(data);
        var sessionCommandType = objects[1 /* SESSION_COMMAND_TYPE */][0];
        var transportType = objects[2 /* TRANSPORT_TYPE */][0];
        var controllerKeySalt = objects[3 /* CONTROLLER_KEY_SALT */];
        debug("Received setup write with command %s and transport type %s", SessionCommandType[sessionCommandType], TransportType[transportType]);
        if (sessionCommandType === SessionCommandType.START_SESSION) {
            if (transportType !== TransportType.HOMEKIT_DATA_STREAM || controllerKeySalt.length !== 32) {
                callback(-70410 /* INVALID_VALUE_IN_REQUEST */);
                return;
            }
            this.dataStreamServer.prepareSession(connection, controllerKeySalt, function (error, preparedSession) {
                if (error || !preparedSession) {
                    callback(error !== null && error !== void 0 ? error : new Error("PreparedSession was undefined!"));
                    return;
                }
                var listeningPort = tlv.encode(1 /* TCP_LISTENING_PORT */, tlv.writeUInt16(preparedSession.port));
                var response = Buffer.concat([
                    tlv.encode(1 /* STATUS */, 0 /* SUCCESS */),
                    tlv.encode(2 /* TRANSPORT_TYPE_SESSION_PARAMETERS */, listeningPort),
                ]);
                _this.lastSetupDataStreamTransportResponse = response.toString("base64"); // save last response without accessory key salt
                response = Buffer.concat([
                    response,
                    tlv.encode(3 /* ACCESSORY_KEY_SALT */, preparedSession.accessoryKeySalt),
                ]);
                callback(null, response.toString("base64"));
            });
        }
        else {
            callback(-70410 /* INVALID_VALUE_IN_REQUEST */);
            return;
        }
    };
    DataStreamManagement.prototype.buildSupportedDataStreamTransportConfigurationTLV = function (supportedConfiguration) {
        var buffers = [];
        supportedConfiguration.forEach(function (type) {
            var transportType = tlv.encode(1 /* TRANSPORT_TYPE */, type);
            var transferTransportConfiguration = tlv.encode(1 /* TRANSFER_TRANSPORT_CONFIGURATION */, transportType);
            buffers.push(transferTransportConfiguration);
        });
        return Buffer.concat(buffers).toString("base64");
    };
    DataStreamManagement.prototype.constructService = function () {
        var dataStreamTransportManagement = new Service_1.Service.DataStreamTransportManagement("", "");
        dataStreamTransportManagement.setCharacteristic(Characteristic_1.Characteristic.SupportedDataStreamTransportConfiguration, this.supportedDataStreamTransportConfiguration);
        dataStreamTransportManagement.setCharacteristic(Characteristic_1.Characteristic.Version, DataStreamServer_1.DataStreamServer.version);
        return dataStreamTransportManagement;
    };
    DataStreamManagement.prototype.setupServiceHandlers = function () {
        var _this = this;
        this.dataStreamTransportManagementService.getCharacteristic(Characteristic_1.Characteristic.SetupDataStreamTransport)
            .onGet(function () { return _this.lastSetupDataStreamTransportResponse; })
            .on("set" /* SET */, function (value, callback, context, connection) {
            if (!connection) {
                debug("Set event handler for SetupDataStreamTransport cannot be called from plugin! Connection undefined!");
                callback(-70410 /* INVALID_VALUE_IN_REQUEST */);
                return;
            }
            _this.handleSetupDataStreamTransportWrite(value, callback, connection);
        })
            .updateValue(this.lastSetupDataStreamTransportResponse);
    };
    return DataStreamManagement;
}());
exports.DataStreamManagement = DataStreamManagement;
//# sourceMappingURL=DataStreamManagement.js.map