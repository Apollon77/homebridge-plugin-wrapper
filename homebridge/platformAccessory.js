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
var platformAccessory_exports = {};
__export(platformAccessory_exports, {
  PlatformAccessory: () => PlatformAccessory,
  PlatformAccessoryEvent: () => PlatformAccessoryEvent
});
module.exports = __toCommonJS(platformAccessory_exports);
var import_node_events = require("node:events");
var import_hap_nodejs = require("../hap-nodejs");
var PlatformAccessoryEvent;
(function(PlatformAccessoryEvent2) {
  PlatformAccessoryEvent2["IDENTIFY"] = "identify";
})(PlatformAccessoryEvent || (PlatformAccessoryEvent = {}));
class PlatformAccessory extends import_node_events.EventEmitter {
  // somewhat ugly way to inject custom Accessory object, while not changing the publicly exposed constructor signature
  static injectedAccessory;
  _associatedPlugin;
  // present as soon as it is registered
  _associatedPlatform;
  // not present for external accessories
  _associatedHAPAccessory;
  // ---------------- HAP Accessory mirror ----------------
  displayName;
  UUID;
  category;
  services = [];
  // ------------------------------------------------------
  /**
   * This is a way for Plugin developers to store custom data with their accessory
   */
  context = {};
  // providing something to store
  constructor(displayName, uuid, category) {
    super();
    this._associatedHAPAccessory = PlatformAccessory.injectedAccessory ? PlatformAccessory.injectedAccessory : new import_hap_nodejs.Accessory(displayName, uuid);
    if (category) {
      this._associatedHAPAccessory.category = category;
    }
    this.displayName = this._associatedHAPAccessory.displayName;
    this.UUID = this._associatedHAPAccessory.UUID;
    this.category = category || 1;
    this.services = this._associatedHAPAccessory.services;
    this._associatedHAPAccessory.on("identify", (paired, callback) => {
      this.emit("identify", paired, () => {
      });
      callback();
    });
  }
  updateDisplayName(name) {
    if (name) {
      this.displayName = name;
      this._associatedHAPAccessory.displayName = name;
    }
  }
  addService(service, ...constructorArgs) {
    return this._associatedHAPAccessory.addService(service, ...constructorArgs);
  }
  removeService(service) {
    this._associatedHAPAccessory.removeService(service);
  }
  getService(name) {
    return this._associatedHAPAccessory.getService(name);
  }
  getServiceById(uuid, subType) {
    return this._associatedHAPAccessory.getServiceById(uuid, subType);
  }
  /**
   * Configures a new controller for the given accessory.
   * See {@link https://developers.homebridge.io/HAP-NodeJS/classes/accessory.html#configurecontroller | Accessory.configureController}.
   *
   * @param controller
   */
  configureController(controller) {
    this._associatedHAPAccessory.configureController(controller);
  }
  /**
   * Removes a configured controller from the given accessory.
   * See {@link https://developers.homebridge.io/HAP-NodeJS/classes/accessory.html#removecontroller | Accessory.removeController}.
   *
   * @param controller
   */
  removeController(controller) {
    this._associatedHAPAccessory.removeController(controller);
  }
  // private
  static serialize(accessory) {
    if (!accessory._associatedPlugin) {
      throw new Error(`Cannot serialize accessory '${accessory.displayName}' - missing associated plugin`);
    }
    if (!accessory._associatedPlatform) {
      throw new Error(`Cannot serialize accessory '${accessory.displayName}' - missing associated platform`);
    }
    accessory._associatedHAPAccessory.displayName = accessory.displayName;
    return {
      plugin: accessory._associatedPlugin,
      platform: accessory._associatedPlatform,
      context: accessory.context,
      ...import_hap_nodejs.Accessory.serialize(accessory._associatedHAPAccessory)
    };
  }
  static deserialize(json) {
    const accessory = import_hap_nodejs.Accessory.deserialize(json);
    PlatformAccessory.injectedAccessory = accessory;
    const platformAccessory = new PlatformAccessory(accessory.displayName, accessory.UUID);
    PlatformAccessory.injectedAccessory = void 0;
    platformAccessory._associatedPlugin = json.plugin;
    platformAccessory._associatedPlatform = json.platform;
    platformAccessory.context = json.context;
    platformAccessory.category = json.category;
    return platformAccessory;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PlatformAccessory,
  PlatformAccessoryEvent
});
