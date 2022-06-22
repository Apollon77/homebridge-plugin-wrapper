"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcService = exports.IpcOutgoingEvent = exports.IpcIncomingEvent = void 0;
const events_1 = require("events");
var IpcIncomingEvent;
(function (IpcIncomingEvent) {
    IpcIncomingEvent["RESTART_CHILD_BRIDGE"] = "restartChildBridge";
    IpcIncomingEvent["STOP_CHILD_BRIDGE"] = "stopChildBridge";
    IpcIncomingEvent["START_CHILD_BRIDGE"] = "startChildBridge";
    IpcIncomingEvent["CHILD_BRIDGE_METADATA_REQUEST"] = "childBridgeMetadataRequest";
})(IpcIncomingEvent = exports.IpcIncomingEvent || (exports.IpcIncomingEvent = {}));
var IpcOutgoingEvent;
(function (IpcOutgoingEvent) {
    IpcOutgoingEvent["SERVER_STATUS_UPDATE"] = "serverStatusUpdate";
    IpcOutgoingEvent["CHILD_BRIDGE_METADATA_RESPONSE"] = "childBridgeMetadataResponse";
    IpcOutgoingEvent["CHILD_BRIDGE_STATUS_UPDATE"] = "childBridgeStatusUpdate";
})(IpcOutgoingEvent = exports.IpcOutgoingEvent || (exports.IpcOutgoingEvent = {}));
class IpcService extends events_1.EventEmitter {
    constructor() {
        super();
    }
    /**
     * Start the IPC service listeners/
     * Currently this will only listen for messages from a parent process.
     */
    start() {
        process.on("message", (message) => {
            if (typeof message !== "object" || !message.id) {
                return;
            }
            this.emit(message.id, message.data);
        });
    }
    /**
     * Send a message to connected IPC clients.
     * Currently this will only send messages if Homebridge was launched as a child_process.fork()
     * from another Node.js process (such as hb-service).
     */
    sendMessage(id, data) {
        if (process.send) {
            process.send({
                id,
                data,
            });
        }
    }
}
exports.IpcService = IpcService;
//# sourceMappingURL=ipcService.js.map