const __importMetaUrl = require('node:url').pathToFileURL(__filename).href;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var externalPortService_exports = {};
__export(externalPortService_exports, {
  ChildBridgeExternalPortService: () => ChildBridgeExternalPortService,
  ExternalPortService: () => ExternalPortService
});
module.exports = __toCommonJS(externalPortService_exports);
var import_logger = require("./logger.js");
var import_MatterPortAllocator = require("./matter/MatterPortAllocator.js");
class ExternalPortService {
  externalPorts;
  nextExternalPort;
  allocatedPorts = /* @__PURE__ */ new Map();
  matterPortAllocator;
  constructor(externalPorts, matterPorts, configuredMatterPorts) {
    this.externalPorts = externalPorts;
    this.matterPortAllocator = new import_MatterPortAllocator.MatterPortAllocator(matterPorts, configuredMatterPorts);
  }
  /**
   * Returns the next available HAP port in the external port config.
   * If the external port is not configured by the user it will return undefined.
   * If the port range has been exhausted it will return undefined.
   */
  async requestPort(username) {
    const existingPortAllocation = this.allocatedPorts.get(username);
    if (existingPortAllocation) {
      return existingPortAllocation;
    }
    const port = this.getNextFreePort();
    this.allocatedPorts.set(username, port);
    return port;
  }
  /**
   * Returns the next available Matter port in the Matter port config.
   * Delegates to MatterPortAllocator to keep Matter code in Matter module.
   *
   * @param uuid - Unique identifier for the Matter accessory (can be accessory UUID or other unique string)
   */
  async requestMatterPort(uuid) {
    return await this.matterPortAllocator.requestPort(uuid);
  }
  /**
   * Release a Matter port previously obtained via {@link requestMatterPort}.
   * Call when an external Matter accessory is unregistered or fails to
   * publish — otherwise the pool accumulates dead allocations and
   * eventually exhausts on long-running installs.
   */
  releaseMatterPort(uuid) {
    return this.matterPortAllocator.releasePort(uuid);
  }
  getNextFreePort() {
    if (!this.externalPorts) {
      return void 0;
    }
    if (this.nextExternalPort === void 0) {
      this.nextExternalPort = this.externalPorts.start;
      return this.nextExternalPort;
    }
    this.nextExternalPort++;
    if (this.nextExternalPort <= this.externalPorts.end) {
      return this.nextExternalPort;
    }
    import_logger.Logger.internal.warn("External HAP port pool ran out of ports. Falling back to random port assignment.");
    return void 0;
  }
}
class ChildBridgeExternalPortService extends ExternalPortService {
  childBridge;
  constructor(childBridge) {
    super();
    this.childBridge = childBridge;
  }
  async requestPort(username) {
    return await this.childBridge.requestExternalPort(username);
  }
  async requestMatterPort(uniqueId) {
    return await this.childBridge.requestMatterPort(uniqueId);
  }
  releaseMatterPort(uniqueId) {
    this.childBridge.releaseMatterPort(uniqueId);
    return true;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChildBridgeExternalPortService,
  ExternalPortService
});
