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
var config_exports = {};
__export(config_exports, {
  MatterConfigCollector: () => MatterConfigCollector,
  isMatterActive: () => isMatterActive,
  isMatterConfigEnabled: () => isMatterConfigEnabled,
  shouldStartMatterServer: () => shouldStartMatterServer,
  stripMatterExternalsOnlyForAccessory: () => stripMatterExternalsOnlyForAccessory,
  validateMatterExternalsOnly: () => validateMatterExternalsOnly
});
module.exports = __toCommonJS(config_exports);
var import_logger = require("../logger.js");
const log = import_logger.Logger.withPrefix("Matter/Config");
function isMatterConfigEnabled(matter) {
  return !!matter && matter.enabled !== false;
}
function shouldStartMatterServer(matter) {
  return isMatterConfigEnabled(matter) && !matter?.externalsOnly;
}
function isMatterActive(matter) {
  return !!matter && (matter.enabled !== false || matter.externalsOnly === true);
}
function validateMatterExternalsOnly(matter, bridgeLabel) {
  if (matter.externalsOnly === true && matter.enabled !== false) {
    log.warn(`${bridgeLabel}: 'matter.externalsOnly: true' was set without 'matter.enabled: false'. Proceeding in externalsOnly mode (the bridge node will not start). Set 'matter.enabled: false' to confirm intent and silence this warning.`);
    matter.enabled = false;
  }
}
function stripMatterExternalsOnlyForAccessory(matter, bridgeLabel) {
  if (matter.externalsOnly === true) {
    log.warn(`${bridgeLabel}: 'matter.externalsOnly' is not supported on accessory child bridges. Ignoring.`);
    delete matter.externalsOnly;
  }
}
class MatterConfigCollector {
  /**
   * Check if any Matter configuration exists in the config
   */
  static hasMatterConfig(config) {
    return isMatterActive(config.bridge.matter) || config.platforms.some((p) => isMatterActive(p._bridge?.matter)) || config.accessories.some((a) => isMatterActive(a._bridge?.matter));
  }
  /**
   * Collect all configured Matter ports from config to avoid conflicts.
   *
   * Ports are collected from every bridge block that declares one, regardless
   * of `enabled`/`externalsOnly` state. This is deliberate: a disabled-in-place
   * bridge (`enabled: false`) keeps its configured port reserved so that
   * re-enabling it later reuses the same port (no re-commissioning) and the
   * allocator never hands that port to an automatic Matter/external allocation
   * in the meantime. The trade-off is that a disabled bridge's port stays
   * unavailable for auto-allocation even though no server currently binds it —
   * that is the cost of the "port preserved" contract on `enabled`.
   */
  static collectConfiguredMatterPorts(config) {
    const configuredMatterPorts = [];
    if (config.bridge.matter?.port) {
      configuredMatterPorts.push(config.bridge.matter.port);
    }
    for (const platform of config.platforms) {
      if (platform._bridge?.matter?.port) {
        configuredMatterPorts.push(platform._bridge.matter.port);
      }
    }
    for (const accessory of config.accessories) {
      if (accessory._bridge?.matter?.port) {
        configuredMatterPorts.push(accessory._bridge.matter.port);
      }
    }
    return configuredMatterPorts;
  }
  /**
   * Validate the matterPorts pool configuration
   * Ensures start and end are defined and start <= end
   *
   * @param config - The Homebridge configuration
   */
  static validateMatterPortsPool(config) {
    if (config.matterPorts !== void 0) {
      if (config.matterPorts.start && config.matterPorts.end) {
        if (config.matterPorts.start > config.matterPorts.end) {
          log.error("Invalid Matter port pool configuration. End should be greater than or equal to start.");
          config.matterPorts = void 0;
        }
      } else {
        log.error("Invalid configuration for 'matterPorts'. Missing 'start' and 'end' properties! Ignoring it!");
        config.matterPorts = void 0;
      }
    }
  }
  /**
   * Validate Matter configuration (lazy-loads validator only when needed)
   * This function dynamically imports the full validator to avoid loading it
   * when Matter is not configured.
   */
  static async validateMatterConfig(config) {
    if (!this.hasMatterConfig(config)) {
      return;
    }
    if (config.bridge.matter) {
      validateMatterExternalsOnly(config.bridge.matter, "main bridge");
    }
    for (const platform of config.platforms) {
      if (platform._bridge?.matter) {
        validateMatterExternalsOnly(platform._bridge.matter, `platform "${platform.platform}" child bridge`);
      }
    }
    for (const accessory of config.accessories) {
      if (accessory._bridge?.matter) {
        stripMatterExternalsOnlyForAccessory(accessory._bridge.matter, `accessory "${accessory.accessory}" child bridge`);
      }
    }
    const { MatterConfigValidator } = await import("./configValidator.js");
    if (config.bridge.matter && shouldStartMatterServer(config.bridge.matter)) {
      const validation = MatterConfigValidator.validate(config.bridge.matter);
      if (!validation.isValid) {
        log.error("Main bridge Matter configuration is invalid. Matter will not be enabled for the main bridge.");
        delete config.bridge.matter;
      }
    }
    const reserved = /* @__PURE__ */ new Set();
    if (shouldStartMatterServer(config.bridge.matter) && config.bridge.matter?.port) {
      reserved.add(config.bridge.matter.port);
    }
    const childMatterValidation = MatterConfigValidator.validateAllChildMatterConfigs(config.platforms, config.accessories, reserved);
    if (!childMatterValidation.isValid) {
      log.error("Some child bridge Matter configurations were invalid and have been disabled. The remaining configuration will start as normal.");
      for (const error of childMatterValidation.errors) {
        log.error(error);
      }
    }
    for (const warning of childMatterValidation.warnings) {
      log.warn(warning);
    }
    if (shouldStartMatterServer(config.bridge.matter) && config.bridge.matter?.port) {
      this.checkPortConflicts(config);
    }
  }
  /**
   * Check for port conflicts between main bridge and child bridges
   *
   * @param config - The Homebridge configuration
   */
  static checkPortConflicts(config) {
    const mainMatterPort = config.bridge.matter?.port;
    if (!mainMatterPort) {
      return;
    }
    const childMatterPorts = [];
    for (const platform of config.platforms) {
      if (platform._bridge?.matter?.port) {
        childMatterPorts.push(platform._bridge.matter.port);
      }
    }
    for (const accessory of config.accessories) {
      if (accessory._bridge?.matter?.port) {
        childMatterPorts.push(accessory._bridge.matter.port);
      }
    }
    if (childMatterPorts.includes(mainMatterPort)) {
      log.error(`Main bridge Matter port ${mainMatterPort} conflicts with a child bridge Matter port. Please use unique ports.`);
    }
    if (config.bridge.port && Math.abs(config.bridge.port - mainMatterPort) < 10) {
      log.warn(`Main bridge HAP port ${config.bridge.port} and Matter port ${mainMatterPort} are very close. Consider spacing them further apart.`);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MatterConfigCollector,
  isMatterActive,
  isMatterConfigEnabled,
  shouldStartMatterServer,
  stripMatterExternalsOnlyForAccessory,
  validateMatterExternalsOnly
});
