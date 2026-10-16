"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStreamManagement = exports.DataStreamStatus = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const Characteristic_1 = require("../Characteristic");
const Service_1 = require("../Service");
const tlv = tslib_1.__importStar(require("../util/tlv"));
const DataStreamServer_1 = require("./DataStreamServer");
const debug = (0, debug_1.default)("HAP-NodeJS:DataStream:Management");
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
/**
 * @group HomeKit Data Streams (HDS)
 */
var DataStreamStatus;
(function (DataStreamStatus) {
    DataStreamStatus[DataStreamStatus["SUCCESS"] = 0] = "SUCCESS";
    DataStreamStatus[DataStreamStatus["GENERIC_ERROR"] = 1] = "GENERIC_ERROR";
    DataStreamStatus[DataStreamStatus["BUSY"] = 2] = "BUSY";
})(DataStreamStatus || (exports.DataStreamStatus = DataStreamStatus = {}));
/**
 * @group HomeKit Data Streams (HDS)
 */
class DataStreamManagement {
    // one server per accessory is probably the best practice
    dataStreamServer = new DataStreamServer_1.DataStreamServer(); // TODO how to handle Remote+future HKSV controller at the same time?
    dataStreamTransportManagementService;
    supportedDataStreamTransportConfiguration;
    lastSetupDataStreamTransportResponse = ""; // stripped. excludes ACCESSORY_KEY_SALT
    constructor(service) {
        const supportedConfiguration = [TransportType.HOMEKIT_DATA_STREAM];
        this.supportedDataStreamTransportConfiguration = this.buildSupportedDataStreamTransportConfigurationTLV(supportedConfiguration);
        this.dataStreamTransportManagementService = service || this.constructService();
        this.setupServiceHandlers();
    }
    destroy() {
        this.dataStreamServer.destroy(); // removes ALL listeners
        this.dataStreamTransportManagementService.getCharacteristic(Characteristic_1.Characteristic.SetupDataStreamTransport)
            .removeOnGet()
            .removeAllListeners("set" /* CharacteristicEventTypes.SET */);
        this.lastSetupDataStreamTransportResponse = "";
    }
    /**
     * @returns the DataStreamTransportManagement service
     */
    getService() {
        return this.dataStreamTransportManagementService;
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
        this.dataStreamServer.onEventMessage(protocol, event, handler);
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
        this.dataStreamServer.removeEventHandler(protocol, event, handler);
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
        this.dataStreamServer.onRequestMessage(protocol, request, handler);
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
        this.dataStreamServer.removeRequestHandler(protocol, request, handler);
        return this;
    }
    /**
     * Forwards any event listener for an DataStreamServer event to the DataStreamServer instance
     *
     * @param event - the event to register for
     * @param listener - the event handler
     */
    onServerEvent(event, listener) {
        // @ts-expect-error: event type
        this.dataStreamServer.on(event, listener);
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleSetupDataStreamTransportWrite(value, callback, connection) {
        const data = Buffer.from(value, "base64");
        const objects = tlv.decode(data);
        const sessionCommandType = objects[1 /* SetupDataStreamSessionTypes.SESSION_COMMAND_TYPE */][0];
        const transportType = objects[2 /* SetupDataStreamSessionTypes.TRANSPORT_TYPE */][0];
        const controllerKeySalt = objects[3 /* SetupDataStreamSessionTypes.CONTROLLER_KEY_SALT */];
        debug("Received setup write with command %s and transport type %s", SessionCommandType[sessionCommandType], TransportType[transportType]);
        if (sessionCommandType === SessionCommandType.START_SESSION) {
            if (transportType !== TransportType.HOMEKIT_DATA_STREAM || controllerKeySalt.length !== 32) {
                callback(-70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */);
                return;
            }
            this.dataStreamServer.prepareSession(connection, controllerKeySalt, (error, preparedSession) => {
                if (error || !preparedSession) {
                    callback(error ?? new Error("PreparedSession was undefined!"));
                    return;
                }
                const listeningPort = tlv.encode(1 /* TransportSessionConfiguration.TCP_LISTENING_PORT */, tlv.writeUInt16(preparedSession.port));
                let response = Buffer.concat([
                    tlv.encode(1 /* SetupDataStreamWriteResponseTypes.STATUS */, 0 /* DataStreamStatus.SUCCESS */),
                    tlv.encode(2 /* SetupDataStreamWriteResponseTypes.TRANSPORT_TYPE_SESSION_PARAMETERS */, listeningPort),
                ]);
                this.lastSetupDataStreamTransportResponse = response.toString("base64"); // save last response without accessory key salt
                response = Buffer.concat([
                    response,
                    tlv.encode(3 /* SetupDataStreamWriteResponseTypes.ACCESSORY_KEY_SALT */, preparedSession.accessoryKeySalt),
                ]);
                callback(null, response.toString("base64"));
            });
        }
        else {
            callback(-70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */);
            return;
        }
    }
    buildSupportedDataStreamTransportConfigurationTLV(supportedConfiguration) {
        const buffers = [];
        supportedConfiguration.forEach(type => {
            const transportType = tlv.encode(1 /* TransportTypeTypes.TRANSPORT_TYPE */, type);
            const transferTransportConfiguration = tlv.encode(1 /* TransferTransportConfigurationTypes.TRANSFER_TRANSPORT_CONFIGURATION */, transportType);
            buffers.push(transferTransportConfiguration);
        });
        return Buffer.concat(buffers).toString("base64");
    }
    constructService() {
        const dataStreamTransportManagement = new Service_1.Service.DataStreamTransportManagement("", "");
        dataStreamTransportManagement.setCharacteristic(Characteristic_1.Characteristic.SupportedDataStreamTransportConfiguration, this.supportedDataStreamTransportConfiguration);
        dataStreamTransportManagement.setCharacteristic(Characteristic_1.Characteristic.Version, DataStreamServer_1.DataStreamServer.version);
        return dataStreamTransportManagement;
    }
    setupServiceHandlers() {
        this.dataStreamTransportManagementService.getCharacteristic(Characteristic_1.Characteristic.SetupDataStreamTransport)
            .onGet(() => this.lastSetupDataStreamTransportResponse)
            .on("set" /* CharacteristicEventTypes.SET */, (value, callback, context, connection) => {
            if (!connection) {
                debug("Set event handler for SetupDataStreamTransport cannot be called from plugin! Connection undefined!");
                callback(-70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */);
                return;
            }
            this.handleSetupDataStreamTransportWrite(value, callback, connection);
        })
            .updateValue(this.lastSetupDataStreamTransportResponse);
    }
}
exports.DataStreamManagement = DataStreamManagement;
//# sourceMappingURL=DataStreamManagement.js.map