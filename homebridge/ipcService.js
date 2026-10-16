const __importMetaUrl = require('node:url').pathToFileURL(__filename).href;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var ipcService_exports = {};
__export(ipcService_exports, {
  IpcIncomingEvent: () => IpcIncomingEvent,
  IpcOutgoingEvent: () => IpcOutgoingEvent,
  IpcService: () => IpcService
});
module.exports = __toCommonJS(ipcService_exports);
var import_node_events = require("node:events");
var import_node_process = __toESM(require("node:process"), 1);
var IpcIncomingEvent;
(function(IpcIncomingEvent2) {
  IpcIncomingEvent2["RESTART_CHILD_BRIDGE"] = "restartChildBridge";
  IpcIncomingEvent2["STOP_CHILD_BRIDGE"] = "stopChildBridge";
  IpcIncomingEvent2["START_CHILD_BRIDGE"] = "startChildBridge";
  IpcIncomingEvent2["CHILD_BRIDGE_METADATA_REQUEST"] = "childBridgeMetadataRequest";
  IpcIncomingEvent2["START_MATTER_MONITORING"] = "startMatterMonitoring";
  IpcIncomingEvent2["STOP_MATTER_MONITORING"] = "stopMatterMonitoring";
  IpcIncomingEvent2["GET_MATTER_ACCESSORIES"] = "getMatterAccessories";
  IpcIncomingEvent2["GET_MATTER_ACCESSORY_INFO"] = "getMatterAccessoryInfo";
  IpcIncomingEvent2["MATTER_ACCESSORY_CONTROL"] = "matterAccessoryControl";
})(IpcIncomingEvent || (IpcIncomingEvent = {}));
var IpcOutgoingEvent;
(function(IpcOutgoingEvent2) {
  IpcOutgoingEvent2["SERVER_STATUS_UPDATE"] = "serverStatusUpdate";
  IpcOutgoingEvent2["CHILD_BRIDGE_METADATA_RESPONSE"] = "childBridgeMetadataResponse";
  IpcOutgoingEvent2["CHILD_BRIDGE_STATUS_UPDATE"] = "childBridgeStatusUpdate";
  IpcOutgoingEvent2["MATTER_EVENT"] = "matterEvent";
})(IpcOutgoingEvent || (IpcOutgoingEvent = {}));
class IpcService extends import_node_events.EventEmitter {
  messageHandler = (message) => {
    if (!message || typeof message !== "object" || !message.id) {
      return;
    }
    this.emit(message.id, message.data);
  };
  constructor() {
    super();
  }
  /**
   * Start the IPC service listeners.
   * Currently this will only listen for messages from a parent process.
   */
  start() {
    import_node_process.default.on("message", this.messageHandler);
  }
  /**
   * Stop the IPC service listeners.
   */
  stop() {
    import_node_process.default.removeListener("message", this.messageHandler);
    this.removeAllListeners();
  }
  /**
   * Send a message to connected IPC clients.
   * Currently, this will only send messages if Homebridge was launched as a child_process.fork()
   * from another Node.js process (such as hb-service).
   */
  sendMessage(id, data) {
    if (import_node_process.default.send) {
      import_node_process.default.send({
        id,
        data
      });
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IpcIncomingEvent,
  IpcOutgoingEvent,
  IpcService
});
