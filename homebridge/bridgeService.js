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
var bridgeService_exports = {};
__export(bridgeService_exports, {
  BridgeService: () => BridgeService,
  DEFAULT_BRIDGE_DEFAULTS: () => DEFAULT_BRIDGE_DEFAULTS,
  isHapConfigEnabled: () => isHapConfigEnabled,
  isHapExternalsOnly: () => isHapExternalsOnly,
  shouldAddIdentifyingMaterial: () => shouldAddIdentifyingMaterial,
  validateHapConfig: () => validateHapConfig
});
module.exports = __toCommonJS(bridgeService_exports);
var import_hap_nodejs = require("../hap-nodejs");
var import_logger = require("./logger.js");
var import_platformAccessory = require("./platformAccessory.js");
var import_pluginManager = require("./pluginManager.js");
var import_storageService = require("./storageService.js");
var import_mac = require("./util/mac.js");
var import_version = __toESM(require("./version.js"));
const DEFAULT_BRIDGE_DEFAULTS = {
  vendorName: "Homebridge",
  manufacturer: "homebridge.io",
  model: "homebridge"
};
const log = import_logger.Logger.internal;
function isHapConfigEnabled(hap) {
  if (typeof hap === "boolean") {
    return hap;
  }
  return !hap || hap.enabled !== false;
}
function isHapExternalsOnly(hap) {
  return typeof hap === "object" && hap.externalsOnly === true;
}
function shouldAddIdentifyingMaterial(hap) {
  return typeof hap !== "object" || !hap?.disableIdentifyingMaterial;
}
function validateHapConfig(bridgeConfig, opts) {
  const hap = bridgeConfig.hap;
  if (hap === void 0) {
    return;
  }
  if (typeof hap === "boolean") {
    bridgeConfig.hap = { enabled: hap };
    log.warn(`${opts.bridgeLabel}: 'hap: ${hap}' is deprecated; treating it as 'hap: { enabled: ${hap} }'. Please update your config to the object form.`);
    return;
  }
  if (typeof hap !== "object" || hap === null || Array.isArray(hap)) {
    throw new Error(`${opts.bridgeLabel}: 'hap' must be a boolean or an object with optional 'enabled', 'externalsOnly', and 'disableIdentifyingMaterial' fields, not a ${Array.isArray(hap) ? "array" : typeof hap}.`);
  }
  const hapBlock = hap;
  if (hapBlock.disableIdentifyingMaterial !== void 0 && typeof hapBlock.disableIdentifyingMaterial !== "boolean") {
    throw new Error(`${opts.bridgeLabel}: 'hap.disableIdentifyingMaterial' must be a boolean.`);
  }
  if (hapBlock.disableIdentifyingMaterial === true) {
    log.warn(`${opts.bridgeLabel}: HAP identifying material is disabled. Ensure bridge names are unique on your network to avoid mDNS name collisions and pairing instability.`);
  }
  if (hapBlock.externalsOnly === true) {
    if (opts.isAccessoryPlugin) {
      log.warn(`${opts.bridgeLabel}: 'hap.externalsOnly' is not supported on accessory child bridges. Ignoring.`);
      delete hapBlock.externalsOnly;
      return;
    }
    if (hapBlock.enabled !== false) {
      log.warn(`${opts.bridgeLabel}: 'hap.externalsOnly: true' was set without 'hap.enabled: false'. Proceeding in externalsOnly mode (the bridge accessory will not publish). Set 'hap.enabled: false' to confirm intent and silence this warning.`);
      hapBlock.enabled = false;
    }
  }
}
class BridgeService {
  api;
  pluginManager;
  externalPortService;
  bridgeOptions;
  bridgeConfig;
  bridge;
  storageService;
  allowInsecureAccess;
  cachedPlatformAccessories = [];
  cachedAccessoriesFileLoaded = false;
  publishedExternalAccessories = /* @__PURE__ */ new Map();
  publishedExternalAccessoriesMetadata = /* @__PURE__ */ new Map();
  constructor(api, pluginManager, externalPortService, bridgeOptions, bridgeConfig) {
    this.api = api;
    this.pluginManager = pluginManager;
    this.externalPortService = externalPortService;
    this.bridgeOptions = bridgeOptions;
    this.bridgeConfig = bridgeConfig;
    this.storageService = new import_storageService.StorageService(this.bridgeOptions.cachedAccessoriesDir);
    this.storageService.initSync();
    try {
      this.storageService.removeItemSync(this.bridgeOptions.externalAccessoriesItemName);
    } catch (error) {
      log.warn("Failed to clear stale external accessories metadata file:", error.message);
    }
    this.allowInsecureAccess = this.bridgeOptions.insecureAccess || false;
    this.api.on("registerPlatformAccessories", this.handleRegisterPlatformAccessories.bind(this));
    this.api.on("updatePlatformAccessories", this.handleUpdatePlatformAccessories.bind(this));
    this.api.on("unregisterPlatformAccessories", this.handleUnregisterPlatformAccessories.bind(this));
    this.api.on("publishExternalAccessories", this.handlePublishExternalAccessories.bind(this));
    this.bridge = new import_hap_nodejs.Bridge(bridgeConfig.name, import_hap_nodejs.uuid.generate("HomeBridge"));
    this.bridge.on("characteristic-warning", () => {
    });
  }
  // characteristic warning event has additional parameter originatorChain: string[] which is currently unused
  static printCharacteristicWriteWarning(plugin, accessory, opts, warning) {
    const wikiInfo = "See https://homebridge.io/w/JtMGR for more info.";
    switch (warning.type) {
      case "slow-read":
      case "slow-write":
        if (!opts.ignoreSlow) {
          log.info((0, import_logger.getLogPrefix)(plugin.getPluginIdentifier()), "This plugin slows down Homebridge.", warning.message, wikiInfo);
        }
        break;
      case "timeout-read":
      case "timeout-write":
        log.error((0, import_logger.getLogPrefix)(plugin.getPluginIdentifier()), "This plugin slows down Homebridge.", warning.message, wikiInfo);
        break;
      case "warn-message":
        log.info((0, import_logger.getLogPrefix)(plugin.getPluginIdentifier()), `This plugin generated a warning from the characteristic '${warning.characteristic.displayName}':`, `${warning.message}.`, wikiInfo);
        break;
      case "error-message":
        log.error((0, import_logger.getLogPrefix)(plugin.getPluginIdentifier()), `This plugin threw an error from the characteristic '${warning.characteristic.displayName}':`, `${warning.message}.`, wikiInfo);
        break;
      case "debug-message":
        log.debug((0, import_logger.getLogPrefix)(plugin.getPluginIdentifier()), `Characteristic '${warning.characteristic.displayName}':`, `${warning.message}.`, wikiInfo);
        break;
      default:
        log.info((0, import_logger.getLogPrefix)(plugin.getPluginIdentifier()), `This plugin generated a warning from the characteristic '${warning.characteristic.displayName}':`, `${warning.message}.`, wikiInfo);
        break;
    }
    if (warning.stack) {
      log.debug((0, import_logger.getLogPrefix)(plugin.getPluginIdentifier()), warning.stack);
    }
  }
  publishBridge() {
    const bridgeConfig = this.bridgeConfig;
    const info = this.bridge.getService(import_hap_nodejs.Service.AccessoryInformation);
    info.setCharacteristic(import_hap_nodejs.Characteristic.Manufacturer, bridgeConfig.manufacturer || DEFAULT_BRIDGE_DEFAULTS.manufacturer);
    info.setCharacteristic(import_hap_nodejs.Characteristic.Model, bridgeConfig.model || DEFAULT_BRIDGE_DEFAULTS.model);
    info.setCharacteristic(import_hap_nodejs.Characteristic.SerialNumber, bridgeConfig.serialNumber || bridgeConfig.username);
    info.setCharacteristic(import_hap_nodejs.Characteristic.FirmwareRevision, bridgeConfig.firmwareRevision || (0, import_version.default)());
    this.bridge.on("listening", (port) => {
      log.success("Homebridge v%s (HAP v%s) (%s) is running on port %s.", (0, import_version.default)(), (0, import_hap_nodejs.HAPLibraryVersion)(), bridgeConfig.name, port);
    });
    const publishInfo = {
      username: bridgeConfig.username,
      port: bridgeConfig.port,
      pincode: bridgeConfig.pin,
      category: 2,
      bind: bridgeConfig.bind,
      addIdentifyingMaterial: shouldAddIdentifyingMaterial(bridgeConfig.hap),
      advertiser: bridgeConfig.advertiser
    };
    if (bridgeConfig.setupID && bridgeConfig.setupID.length === 4) {
      publishInfo.setupID = bridgeConfig.setupID;
    }
    log.debug("Publishing bridge accessory (name: %s, publishInfo: %o).", this.bridge.displayName, BridgeService.strippingPinCode(publishInfo));
    this.bridge.publish(publishInfo, this.allowInsecureAccess).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      log.error("Failed to publish bridge accessory '%s': %s", this.bridge.displayName, message);
    });
  }
  /**
   * Attempt to load the cached accessories from disk.
   */
  async loadCachedPlatformAccessoriesFromDisk() {
    let cachedAccessories = null;
    try {
      cachedAccessories = await this.storageService.getItem(this.bridgeOptions.cachedAccessoriesItemName);
    } catch (error) {
      log.error("Failed to load cached accessories from disk:", error.message);
      if (error instanceof SyntaxError) {
        cachedAccessories = await this.restoreCachedAccessoriesBackup();
      } else {
        log.error("Not restoring cached accessories - some accessories may be reset.");
      }
    }
    if (cachedAccessories) {
      log.info(`Loaded ${cachedAccessories.length} cached accessories from ${this.bridgeOptions.cachedAccessoriesItemName}.`);
      this.cachedPlatformAccessories = cachedAccessories.map((serialized) => {
        return import_platformAccessory.PlatformAccessory.deserialize(serialized);
      });
      if (cachedAccessories.length) {
        await this.createCachedAccessoriesBackup();
      }
    }
    this.cachedAccessoriesFileLoaded = true;
  }
  /**
   * Return the name of the backup cache file
   */
  get backupCacheFileName() {
    return `.${this.bridgeOptions.cachedAccessoriesItemName}.bak`;
  }
  /**
   * Create a backup of the cached file
   * This is used if we ever have trouble reading the main cache file
   */
  async createCachedAccessoriesBackup() {
    try {
      await this.storageService.copyItem(this.bridgeOptions.cachedAccessoriesItemName, this.backupCacheFileName);
    } catch (error) {
      log.warn(`Failed to create a backup of the ${this.bridgeOptions.cachedAccessoriesItemName} cached accessories file:`, error.message);
    }
  }
  /**
   * Restore a cached accessories backup
   * This is used if the main cache file has a JSON syntax error / is corrupted
   */
  async restoreCachedAccessoriesBackup() {
    try {
      const cachedAccessories = await this.storageService.getItem(this.backupCacheFileName);
      if (cachedAccessories && cachedAccessories.length) {
        log.warn(`Recovered ${cachedAccessories.length} accessories from ${this.bridgeOptions.cachedAccessoriesItemName} cache backup.`);
      }
      return cachedAccessories;
    } catch (error) {
      return null;
    }
  }
  restoreCachedPlatformAccessories() {
    const accessoriesToRestore = [...this.cachedPlatformAccessories];
    const orphanedAccessories = /* @__PURE__ */ new Set();
    for (const accessory of accessoriesToRestore) {
      if (!this.cachedPlatformAccessories.includes(accessory)) {
        continue;
      }
      let plugin = this.pluginManager.getPlugin(accessory._associatedPlugin);
      if (!plugin) {
        try {
          plugin = this.pluginManager.getPluginByActiveDynamicPlatform(accessory._associatedPlatform);
          if (plugin) {
            log.info(`When searching for the associated plugin of the accessory '${accessory.displayName}' it seems like the plugin name changed from '${accessory._associatedPlugin}' to '${plugin.getPluginIdentifier()}'. Plugin association is now being transformed!`);
            accessory._associatedPlugin = plugin.getPluginIdentifier();
          }
        } catch (error) {
          log.info(`Could not find the associated plugin for the accessory '${accessory.displayName}'. Tried to find the plugin by the platform name but ${error.message}`);
        }
      }
      const platformPlugins = plugin && plugin.getActiveDynamicPlatform(accessory._associatedPlatform);
      if (plugin) {
        accessory._associatedHAPAccessory.on("characteristic-warning", BridgeService.printCharacteristicWriteWarning.bind(this, plugin, accessory._associatedHAPAccessory, {}));
      }
      if (!platformPlugins) {
        log.info(`Failed to find plugin to handle accessory ${accessory._associatedHAPAccessory.displayName}`);
        if (!this.bridgeOptions.keepOrphanedCachedAccessories) {
          log.info(`Removing orphaned accessory ${accessory._associatedHAPAccessory.displayName}`);
          orphanedAccessories.add(accessory);
          continue;
        }
      } else {
        accessory.getService(import_hap_nodejs.Service.AccessoryInformation)?.setCharacteristic(import_hap_nodejs.Characteristic.FirmwareRevision, "0");
        platformPlugins.configureAccessory(accessory);
      }
      try {
        this.bridge.addBridgedAccessory(accessory._associatedHAPAccessory);
      } catch (error) {
        log.warn(`${accessory._associatedPlugin ? (0, import_logger.getLogPrefix)(accessory._associatedPlugin) : ""} Could not restore cached accessory '${accessory._associatedHAPAccessory.displayName}':`, error.message);
        orphanedAccessories.add(accessory);
      }
    }
    if (orphanedAccessories.size > 0) {
      this.cachedPlatformAccessories = this.cachedPlatformAccessories.filter((accessory) => !orphanedAccessories.has(accessory));
    }
  }
  /**
   * Save the cached accessories back to disk.
   */
  saveCachedPlatformAccessoriesOnDisk() {
    try {
      if (this.cachedAccessoriesFileLoaded) {
        const serializedAccessories = this.cachedPlatformAccessories.map((accessory) => import_platformAccessory.PlatformAccessory.serialize(accessory));
        this.storageService.setItemSync(this.bridgeOptions.cachedAccessoriesItemName, serializedAccessories);
      }
    } catch (error) {
      log.error("Failed to save cached accessories to disk:", error.message);
      log.error("Your accessories will not persist between restarts until this issue is resolved.");
    }
  }
  /**
   * Save metadata for currently published external accessories so external tools (e.g. the
   * Homebridge UI) can attribute each accessory to the plugin that published it. The
   * underlying HAP `AccessoryInfo` files do not store plugin attribution.
   */
  saveExternalAccessoriesMetadataOnDisk() {
    try {
      const entries = Array.from(this.publishedExternalAccessoriesMetadata.values());
      if (entries.length === 0) {
        this.storageService.removeItemSync(this.bridgeOptions.externalAccessoriesItemName);
        return;
      }
      this.storageService.setItemSync(this.bridgeOptions.externalAccessoriesItemName, entries);
    } catch (error) {
      log.error("Failed to save external accessories metadata to disk:", error.message);
    }
  }
  handleRegisterPlatformAccessories(accessories) {
    if (isHapExternalsOnly(this.bridgeConfig.hap)) {
      log.debug(`HAP externalsOnly mode: ${accessories.length} bridged accessor${accessories.length === 1 ? "y" : "ies"} registered to this bridge will not be advertised (only external accessories publish).`);
    }
    const hapAccessories = accessories.map((accessory) => {
      const newUUID = accessory._associatedHAPAccessory.UUID;
      const cachedCollision = this.cachedPlatformAccessories.find((cached) => cached._associatedHAPAccessory.UUID === newUUID);
      if (cachedCollision) {
        log.warn("Accessory '%s' has the same UUID as existing accessory '%s' (UUID: %s). Skipping duplicate.", accessory.displayName, cachedCollision.displayName, newUUID);
        return void 0;
      }
      const bridgedCollision = this.bridge.bridgedAccessories.find((bridged) => bridged.UUID === newUUID);
      if (bridgedCollision) {
        log.warn("Accessory '%s' has the same UUID as existing bridged accessory '%s' (UUID: %s). Skipping duplicate.", accessory.displayName, bridgedCollision.displayName, newUUID);
        return void 0;
      }
      this.cachedPlatformAccessories.push(accessory);
      const plugin = this.pluginManager.getPlugin(accessory._associatedPlugin);
      if (plugin) {
        const platforms = plugin.getActiveDynamicPlatform(accessory._associatedPlatform);
        if (!platforms) {
          log.warn("The plugin '%s' registered a new accessory for the platform '%s'. The platform couldn't be found though!", accessory._associatedPlugin, accessory._associatedPlatform);
        }
        accessory._associatedHAPAccessory.on("characteristic-warning", BridgeService.printCharacteristicWriteWarning.bind(this, plugin, accessory._associatedHAPAccessory, {}));
      } else {
        log.warn("A platform configured a new accessory under the plugin name '%s'. However no loaded plugin could be found for the name!", accessory._associatedPlugin);
      }
      return accessory._associatedHAPAccessory;
    }).filter((hapAccessory) => hapAccessory !== void 0);
    this.bridge.addBridgedAccessories(hapAccessories);
    this.saveCachedPlatformAccessoriesOnDisk();
  }
  handleUpdatePlatformAccessories(accessories) {
    if (!Array.isArray(accessories)) {
      return;
    }
    const nonUpdatedPlugins = this.cachedPlatformAccessories.filter((cachedPlatformAccessory) => !accessories.some((accessory) => accessory.UUID === cachedPlatformAccessory._associatedHAPAccessory.UUID));
    this.cachedPlatformAccessories = [...nonUpdatedPlugins, ...accessories];
    this.saveCachedPlatformAccessoriesOnDisk();
  }
  handleUnregisterPlatformAccessories(accessories) {
    const hapAccessories = accessories.map((accessory) => {
      const index = this.cachedPlatformAccessories.indexOf(accessory);
      if (index >= 0) {
        this.cachedPlatformAccessories.splice(index, 1);
      }
      return accessory._associatedHAPAccessory;
    });
    this.bridge.removeBridgedAccessories(hapAccessories);
    this.saveCachedPlatformAccessoriesOnDisk();
  }
  async handlePublishExternalAccessories(accessories) {
    const hap = this.bridgeConfig.hap;
    if (!isHapConfigEnabled(hap) && !isHapExternalsOnly(hap)) {
      log.debug("Skipping external accessory HAP publish: HAP is disabled for this bridge (hap.enabled=false).");
      return;
    }
    const accessoryPin = this.bridgeConfig.pin;
    for (const accessory of accessories) {
      const hapAccessory = accessory._associatedHAPAccessory;
      const advertiseAddress = (0, import_mac.generate)(hapAccessory.UUID);
      const accessoryPort = await this.externalPortService.requestPort(advertiseAddress);
      if (this.publishedExternalAccessories.has(advertiseAddress)) {
        throw new Error(`Accessory ${hapAccessory.displayName} experienced an address collision.`);
      } else {
        this.publishedExternalAccessories.set(advertiseAddress, accessory);
        this.publishedExternalAccessoriesMetadata.set(advertiseAddress, {
          username: advertiseAddress,
          plugin: accessory._associatedPlugin,
          displayName: hapAccessory.displayName,
          category: accessory.category,
          port: accessoryPort
        });
      }
      const plugin = this.pluginManager.getPlugin(accessory._associatedPlugin);
      if (plugin) {
        hapAccessory.on("characteristic-warning", BridgeService.printCharacteristicWriteWarning.bind(this, plugin, hapAccessory, { ignoreSlow: true }));
      } else if (import_pluginManager.PluginManager.isQualifiedPluginIdentifier(accessory._associatedPlugin)) {
        log.warn("A platform configured a external accessory under the plugin name '%s'. However no loaded plugin could be found for the name!", accessory._associatedPlugin);
      }
      hapAccessory.on("listening", (port) => {
        log.success("%s is running on port %s.", hapAccessory.displayName, port);
        log.info("Please add [%s] manually in Home app. Setup Code: %s", hapAccessory.displayName, accessoryPin);
      });
      const publishInfo = {
        username: advertiseAddress,
        pincode: accessoryPin,
        category: accessory.category,
        port: accessoryPort,
        bind: this.bridgeConfig.bind,
        addIdentifyingMaterial: shouldAddIdentifyingMaterial(this.bridgeConfig.hap),
        advertiser: this.bridgeConfig.advertiser
      };
      log.debug("Publishing external accessory (name: %s, publishInfo: %o).", hapAccessory.displayName, BridgeService.strippingPinCode(publishInfo));
      hapAccessory.publish(publishInfo, this.allowInsecureAccess).catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        log.error("Failed to publish external accessory '%s': %s", hapAccessory.displayName, message);
      });
    }
    this.saveExternalAccessoriesMetadataOnDisk();
  }
  createHAPAccessory(plugin, accessoryInstance, displayName, accessoryType, uuidBase) {
    const services = (accessoryInstance.getServices() || []).filter((service) => !!service);
    const controllers = (accessoryInstance.getControllers && accessoryInstance.getControllers() || []).filter((controller) => !!controller);
    if (services.length === 0 && controllers.length === 0) {
      return void 0;
    }
    const accessoryUUID = import_hap_nodejs.uuid.generate(`${accessoryType}:${uuidBase || displayName}`);
    const accessory = new import_hap_nodejs.Accessory(displayName, accessoryUUID);
    if (accessoryInstance.identify) {
      accessory.on("identify", (paired, callback) => {
        accessoryInstance.identify(() => {
        });
        callback();
      });
    }
    const informationService = accessory.getService(import_hap_nodejs.Service.AccessoryInformation);
    services.forEach((service) => {
      if (service instanceof import_hap_nodejs.Service.AccessoryInformation) {
        service.setCharacteristic(import_hap_nodejs.Characteristic.Name, displayName);
        service.getCharacteristic(import_hap_nodejs.Characteristic.Identify).removeAllListeners(
          "set"
          /* CharacteristicEventTypes.SET */
        );
        informationService.replaceCharacteristicsFromService(service);
      } else {
        accessory.addService(service);
      }
    });
    accessory.on("characteristic-warning", BridgeService.printCharacteristicWriteWarning.bind(this, plugin, accessory, {}));
    controllers.forEach((controller) => {
      accessory.configureController(controller);
    });
    return accessory;
  }
  async loadPlatformAccessories(plugin, platformInstance, platformType, logger) {
    return new Promise((resolve) => {
      const loadDelayWarningInterval = setInterval(() => {
        log.warn((0, import_logger.getLogPrefix)(plugin.getPluginIdentifier()), "This plugin is taking long time to load and preventing Homebridge from starting. See https://homebridge.io/w/JtMGR for more info.");
      }, 2e4);
      platformInstance.accessories((0, import_hap_nodejs.once)((accessories) => {
        clearInterval(loadDelayWarningInterval);
        accessories.forEach((accessoryInstance, index) => {
          const accessoryName = accessoryInstance.name;
          const uuidBase = accessoryInstance.uuid_base;
          log.info("Initializing platform accessory '%s'...", accessoryName);
          const accessory = this.createHAPAccessory(plugin, accessoryInstance, accessoryName, platformType, uuidBase);
          if (accessory) {
            this.bridge.addBridgedAccessory(accessory);
          } else {
            logger("Platform %s returned an accessory at index %d with an empty set of services. Won't adding it to the bridge!", platformType, index);
          }
        });
        resolve();
      }));
    });
  }
  teardown() {
    void this.bridge.unpublish();
    for (const accessory of this.publishedExternalAccessories.values()) {
      void accessory._associatedHAPAccessory.unpublish();
    }
    this.saveCachedPlatformAccessoriesOnDisk();
    this.api.signalShutdown();
  }
  static strippingPinCode(publishInfo) {
    const info = {
      ...publishInfo
    };
    info.pincode = "***-**-***";
    return info;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BridgeService,
  DEFAULT_BRIDGE_DEFAULTS,
  isHapConfigEnabled,
  isHapExternalsOnly,
  shouldAddIdentifyingMaterial,
  validateHapConfig
});
