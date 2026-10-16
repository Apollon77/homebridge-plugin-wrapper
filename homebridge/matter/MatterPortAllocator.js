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
var MatterPortAllocator_exports = {};
__export(MatterPortAllocator_exports, {
  MatterPortAllocator: () => MatterPortAllocator
});
module.exports = __toCommonJS(MatterPortAllocator_exports);
var import_logger = require("../logger.js");
const log = import_logger.Logger.withPrefix("Matter/PortAllocator");
class MatterPortAllocator {
  matterPorts;
  allocatedPorts = /* @__PURE__ */ new Map();
  configuredPorts = /* @__PURE__ */ new Set();
  constructor(matterPorts, configuredMatterPorts) {
    this.matterPorts = matterPorts;
    if (configuredMatterPorts) {
      this.configuredPorts = new Set(configuredMatterPorts);
    }
  }
  /**
   * Returns the next available Matter port in the Matter port config.
   * If Matter ports are not configured, falls back to range 5530-5541.
   * If the port range has been exhausted it will return undefined.
   *
   * @param uuid - Unique identifier for the Matter accessory (can be accessory UUID or other unique string)
   */
  async requestPort(uuid) {
    const existingPortAllocation = this.allocatedPorts.get(uuid);
    if (existingPortAllocation !== void 0) {
      return existingPortAllocation;
    }
    const port = this.getNextFreePort();
    if (port !== void 0) {
      this.allocatedPorts.set(uuid, port);
    }
    return port;
  }
  /**
   * Get the next free Matter port from the configured range
   */
  getNextFreePort() {
    const rangeStart = this.matterPorts?.start || 5530;
    const rangeEnd = this.matterPorts?.end || 5541;
    if (rangeStart > rangeEnd) {
      log.error(`Invalid Matter port range: start (${rangeStart}) is greater than end (${rangeEnd}).`);
      return void 0;
    }
    const allocatedPortValues = /* @__PURE__ */ new Set([
      ...this.configuredPorts,
      ...[...this.allocatedPorts.values()].filter((p) => p !== void 0)
    ]);
    for (let port = rangeStart; port <= rangeEnd; port += 1) {
      if (!allocatedPortValues.has(port)) {
        return port;
      }
    }
    log.warn(`Matter port range ${rangeStart}-${rangeEnd} exhausted, allocating from extended range.`);
    for (let port = rangeEnd + 1; port <= 65535; port += 1) {
      if (!allocatedPortValues.has(port)) {
        return port;
      }
    }
    log.error("No available ports remaining for Matter allocation.");
    return void 0;
  }
  /**
   * Release a previously allocated port back into the pool. Called when an
   * external Matter accessory is unregistered or its publish fails — without
   * this, allocations accumulate forever and the pool eventually exhausts on
   * a long-running install that adds and removes accessories.
   *
   * @param uuid - Same key originally passed to requestPort
   * @returns true if a port was released, false if no allocation existed
   */
  releasePort(uuid) {
    return this.allocatedPorts.delete(uuid);
  }
  /**
   * Get statistics about port allocation
   */
  getStats() {
    return {
      allocatedCount: this.allocatedPorts.size,
      configuredPortsCount: this.configuredPorts.size
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MatterPortAllocator
});
