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
var api_exports = {};
__export(api_exports, {
  APIEvent: () => APIEvent,
  HomebridgeAPI: () => HomebridgeAPI,
  InternalAPIEvent: () => InternalAPIEvent,
  PluginType: () => PluginType
});
module.exports = __toCommonJS(api_exports);
var import_node_events = require("node:events");
var import_hap_nodejs = __toESM(require("../hap-nodejs"), 1);
var import_semver = __toESM(require("semver"), 1);
var import_logger = require("./logger.js");
var import_platformAccessory = require("./platformAccessory.js");
var import_pluginManager = require("./pluginManager.js");
var import_user = require("./user.js");
var import_version = __toESM(require("./version.js"));
const log = import_logger.Logger.internal;
var PluginType;
(function(PluginType2) {
  PluginType2["ACCESSORY"] = "accessory";
  PluginType2["PLATFORM"] = "platform";
})(PluginType || (PluginType = {}));
var APIEvent;
(function(APIEvent2) {
  APIEvent2["DID_FINISH_LAUNCHING"] = "didFinishLaunching";
  APIEvent2["SHUTDOWN"] = "shutdown";
})(APIEvent || (APIEvent = {}));
var InternalAPIEvent;
(function(InternalAPIEvent2) {
  InternalAPIEvent2["REGISTER_ACCESSORY"] = "registerAccessory";
  InternalAPIEvent2["REGISTER_PLATFORM"] = "registerPlatform";
  InternalAPIEvent2["PUBLISH_EXTERNAL_ACCESSORIES"] = "publishExternalAccessories";
  InternalAPIEvent2["REGISTER_PLATFORM_ACCESSORIES"] = "registerPlatformAccessories";
  InternalAPIEvent2["UPDATE_PLATFORM_ACCESSORIES"] = "updatePlatformAccessories";
  InternalAPIEvent2["UNREGISTER_PLATFORM_ACCESSORIES"] = "unregisterPlatformAccessories";
  InternalAPIEvent2["PUBLISH_EXTERNAL_MATTER_ACCESSORIES"] = "publishExternalMatterAccessories";
  InternalAPIEvent2["REGISTER_MATTER_PLATFORM_ACCESSORIES"] = "registerMatterPlatformAccessories";
  InternalAPIEvent2["UPDATE_MATTER_PLATFORM_ACCESSORIES"] = "updateMatterPlatformAccessories";
  InternalAPIEvent2["UNREGISTER_MATTER_PLATFORM_ACCESSORIES"] = "unregisterMatterPlatformAccessories";
  InternalAPIEvent2["UNREGISTER_EXTERNAL_MATTER_ACCESSORIES"] = "unregisterExternalMatterAccessories";
  InternalAPIEvent2["UPDATE_MATTER_ACCESSORY_STATE"] = "updateMatterAccessoryState";
})(InternalAPIEvent || (InternalAPIEvent = {}));
class HomebridgeAPI extends import_node_events.EventEmitter {
  version = 2.7;
  // homebridge API version
  serverVersion = (0, import_version.default)();
  // homebridge node module version
  // ------------------ LEGACY EXPORTS FOR PRE TYPESCRIPT  ------------------
  user = import_user.User;
  hap = import_hap_nodejs.default;
  hapLegacyTypes = import_hap_nodejs.default.LegacyTypes;
  // used for older accessories/platforms
  platformAccessory = import_platformAccessory.PlatformAccessory;
  // ------------------------------------------------------------------------
  /**
   * Internal state tracking whether Matter is enabled for this bridge
   */
  matterEnabled = false;
  /**
   * Internal reference to MatterServer for API methods that need return values
   * @internal
   */
  _matterServer = null;
  /**
   * Internal reference to MatterBridgeManager for checking external servers
   * @internal
   */
  _matterManager = null;
  /**
   * Pending external accessory registrations
   * Map of registration ID to resolve function
   * @internal
   */
  _pendingExternalRegistrations = /* @__PURE__ */ new Map();
  /**
   * Lazy-loaded Matter API implementation
   */
  _matterAPI;
  /**
   * Matter Protocol API (lazy-loaded).
   *
   * Returns the loaded MatterAPI instance, or `undefined` when Matter is not
   * configured for this bridge. Server / ChildBridgeFork call
   * {@link loadMatterAPI} before plugins run on Matter-enabled bridges, so
   * plugins observe a defined value here whenever {@link isMatterEnabled}
   * returns true.
   */
  get matter() {
    return this._matterAPI;
  }
  /**
   * In-flight loadMatterAPI promise. Cached so concurrent callers share a
   * single dynamic-import + construction; otherwise both could observe
   * `!this._matterAPI`, both await the import, and the second call's
   * MatterAPIImpl would clobber the first (along with anything wired into
   * `_pendingExternalRegistrations`).
   */
  _matterAPILoadPromise;
  /**
   * Load Matter API implementation. Idempotent.
   *
   * Called by Server / ChildBridgeFork during startup when Matter is
   * configured for the bridge, before plugin initialization. Plugins should
   * not call this directly — use {@link matter} instead.
   *
   * @internal
   */
  async loadMatterAPI() {
    if (this._matterAPI) {
      return;
    }
    if (!this._matterAPILoadPromise) {
      this._matterAPILoadPromise = (async () => {
        const { MatterAPIImpl } = await import("./matter/MatterAPIImpl.js");
        this._matterAPI = new MatterAPIImpl(this);
        this.matterEnabled = true;
      })();
    }
    return this._matterAPILoadPromise;
  }
  constructor() {
    super();
  }
  /**
   * Internal method to set Matter enabled status
   * Called by Server or ChildBridgeFork after Matter initialization
   * @internal
   */
  _setMatterEnabled(enabled) {
    this.matterEnabled = enabled;
  }
  /**
   * Internal method to set MatterServer reference
   * Called by Server or ChildBridgeFork after creating MatterServer
   * @internal
   */
  _setMatterServer(server) {
    this._matterServer = server;
  }
  /**
   * Internal method to set MatterBridgeManager reference
   * Called by Server or ChildBridgeFork to allow API access to external servers
   * @internal
   */
  _setMatterManager(manager) {
    this._matterManager = manager;
  }
  /**
   * Internal method to resolve pending external accessory registrations
   * Called by MatterBridgeManager when external accessories finish publishing
   * @internal
   */
  _resolveExternalRegistration(registrationId) {
    const resolve = this._pendingExternalRegistrations.get(registrationId);
    if (resolve) {
      resolve();
      this._pendingExternalRegistrations.delete(registrationId);
    }
  }
  versionGreaterOrEqual(version) {
    return import_semver.default.gte(this.serverVersion, version);
  }
  static isDynamicPlatformPlugin(platformPlugin) {
    return "configureAccessory" in platformPlugin;
  }
  static isStaticPlatformPlugin(platformPlugin) {
    return "accessories" in platformPlugin;
  }
  signalFinished() {
    this.emit(
      "didFinishLaunching"
      /* APIEvent.DID_FINISH_LAUNCHING */
    );
  }
  signalShutdown() {
    this.emit(
      "shutdown"
      /* APIEvent.SHUTDOWN */
    );
  }
  registerAccessory(pluginIdentifier, accessoryName, constructor) {
    if (typeof accessoryName === "function") {
      constructor = accessoryName;
      accessoryName = pluginIdentifier;
      this.emit("registerAccessory", accessoryName, constructor);
    } else {
      this.emit("registerAccessory", accessoryName, constructor, pluginIdentifier);
    }
  }
  registerPlatform(pluginIdentifier, platformName, constructor) {
    if (typeof platformName === "function") {
      constructor = platformName;
      platformName = pluginIdentifier;
      this.emit("registerPlatform", platformName, constructor);
    } else {
      this.emit("registerPlatform", platformName, constructor, pluginIdentifier);
    }
  }
  publishExternalAccessories(pluginIdentifier, accessories) {
    if (!import_pluginManager.PluginManager.isQualifiedPluginIdentifier(pluginIdentifier)) {
      log.info(`One of your plugins incorrectly registered an external accessory using the platform name (${pluginIdentifier}) and not the plugin identifier. Please report this to the developer!`);
    }
    accessories.forEach((accessory) => {
      if (!(accessory instanceof import_platformAccessory.PlatformAccessory)) {
        throw new TypeError(`${pluginIdentifier} attempt to register an accessory that isn't PlatformAccessory!`);
      }
      accessory._associatedPlugin = pluginIdentifier;
    });
    this.emit("publishExternalAccessories", accessories);
  }
  registerPlatformAccessories(pluginIdentifier, platformName, accessories) {
    accessories.forEach((accessory) => {
      if (!(accessory instanceof import_platformAccessory.PlatformAccessory)) {
        throw new TypeError(`${pluginIdentifier} - ${platformName} attempt to register an accessory that isn't PlatformAccessory!`);
      }
      accessory._associatedPlugin = pluginIdentifier;
      accessory._associatedPlatform = platformName;
    });
    this.emit("registerPlatformAccessories", accessories);
  }
  updatePlatformAccessories(accessories) {
    this.emit("updatePlatformAccessories", accessories);
  }
  unregisterPlatformAccessories(pluginIdentifier, platformName, accessories) {
    accessories.forEach((accessory) => {
      if (!(accessory instanceof import_platformAccessory.PlatformAccessory)) {
        throw new TypeError(`${pluginIdentifier} - ${platformName} attempt to unregister an accessory that isn't PlatformAccessory!`);
      }
    });
    this.emit("unregisterPlatformAccessories", accessories);
  }
  /**
   * Check if Matter is available in this version of Homebridge
   * @returns true if Homebridge version satisfies >= 2.0.0-alpha.0
   */
  isMatterAvailable() {
    return import_semver.default.gte(this.serverVersion, "2.0.0-alpha.0");
  }
  /**
   * Check if Matter is enabled for this bridge
   * For main bridge: returns true if Matter is enabled in `bridge.matter` config
   * For child bridge: returns true if Matter is enabled in the `_bridge.matter` config
   * @returns true if Matter is enabled
   */
  isMatterEnabled() {
    return this.matterEnabled;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  APIEvent,
  HomebridgeAPI,
  InternalAPIEvent,
  PluginType
});
