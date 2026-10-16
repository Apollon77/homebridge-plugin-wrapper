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
var server_exports = {};
__export(server_exports, {
  Server: () => Server,
  ServerStatus: () => ServerStatus
});
module.exports = __toCommonJS(server_exports);
var import_node_fs = require("node:fs");
var import_node_process = __toESM(require("node:process"), 1);
var import_chalk = __toESM(require("chalk"), 1);
var import_qrcode_terminal = __toESM(require("qrcode-terminal"), 1);
var import_api = require("./api.js");
var import_bridgeService = require("./bridgeService.js");
var import_childBridgeService = require("./childBridgeService.js");
var import_externalPortService = require("./externalPortService.js");
var import_ipcService = require("./ipcService.js");
var import_logger = require("./logger.js");
var import_config = require("./matter/config.js");
var import_pluginManager = require("./pluginManager.js");
var import_user = require("./user.js");
var import_mac = require("./util/mac.js");
import_qrcode_terminal.default.setErrorLevel("M");
const log = import_logger.Logger.internal;
const matterLogger = import_logger.Logger.withPrefix("Matter/MainManager");
var ServerStatus;
(function(ServerStatus2) {
  ServerStatus2["PENDING"] = "pending";
  ServerStatus2["OK"] = "ok";
  ServerStatus2["DOWN"] = "down";
})(ServerStatus || (ServerStatus = {}));
class Server {
  options;
  api;
  pluginManager;
  bridgeService;
  externalPortService;
  ipcService;
  config;
  // used to keep track of child bridges
  // Key is HAP username (MAC address)
  childBridges = /* @__PURE__ */ new Map();
  // Matter bridge manager (handles Matter server lifecycle)
  // Lazy-loaded only when Matter is configured to avoid loading heavy Matter.js libraries
  matterManager;
  // Registry of external Matter bridge usernames to their owning bridge
  // Key: external Matter bridge username (e.g., CE:65:F2:E2:D5:98)
  // Value: owner bridge username (main bridge or child bridge MAC address)
  externalMatterBridgeRegistry = /* @__PURE__ */ new Map();
  // Matter monitoring state (for UI accessories page)
  matterMonitoringActive = false;
  matterMonitoringClients = 0;
  // Fallback timers for child-bridge Matter accessory lookups. Keyed by uuid
  // so that a child's accessoryInfoData (success or error) can cancel the
  // timer before it fires a spurious "Timed out" event at the UI.
  pendingMatterAccessoryInfoLookups = /* @__PURE__ */ new Map();
  // The same fallback, for control requests broadcast to the child bridges.
  // Keyed by correlationId: a child that does not own the accessory stays
  // silent by design (every matter child is asked, only the owner answers), so
  // without this a control for an unknown uuid produced no response at all.
  pendingMatterControlRequests = /* @__PURE__ */ new Map();
  // current server status
  serverStatus = "pending";
  constructor(options = {}) {
    this.options = options;
    this.config = Server.loadConfig();
    this.api = new import_api.HomebridgeAPI();
    this.ipcService = new import_ipcService.IpcService();
    const configuredMatterPorts = import_config.MatterConfigCollector.collectConfiguredMatterPorts(this.config);
    this.externalPortService = new import_externalPortService.ExternalPortService(this.config.ports, this.config.matterPorts, configuredMatterPorts);
    this.setServerStatus(
      "pending"
      /* ServerStatus.PENDING */
    );
    const pluginManagerOptions = {
      activePlugins: this.config.plugins,
      disabledPlugins: this.config.disabledPlugins,
      customPluginPath: options.customPluginPath,
      strictPluginResolution: options.strictPluginResolution
    };
    this.pluginManager = new import_pluginManager.PluginManager(this.api, pluginManagerOptions);
    const bridgeConfig = {
      cachedAccessoriesDir: import_user.User.cachedAccessoryPath(),
      cachedAccessoriesItemName: "cachedAccessories",
      externalAccessoriesItemName: "externalAccessories"
    };
    Object.assign(bridgeConfig, this.options);
    this.bridgeService = new import_bridgeService.BridgeService(this.api, this.pluginManager, this.externalPortService, bridgeConfig, this.config.bridge);
    this.bridgeService.bridge.on("advertised", () => {
      this.setServerStatus(
        "ok"
        /* ServerStatus.OK */
      );
    });
    this.bridgeService.bridge.on("paired", () => {
      this.setServerStatus(this.serverStatus);
    });
    this.bridgeService.bridge.on("unpaired", () => {
      this.setServerStatus(this.serverStatus);
    });
  }
  /**
   * Set the current server status and update parent via IPC
   * @param status
   */
  setServerStatus(status) {
    this.serverStatus = status;
    const bridge = this.bridgeService?.bridge;
    const isPublished = !!bridge?._accessoryInfo;
    const statusUpdate = {
      status: this.serverStatus,
      paired: isPublished ? bridge?._accessoryInfo?.paired() ?? null : null,
      setupUri: isPublished ? bridge?.setupURI() ?? null : null,
      name: this.config.bridge.name,
      username: this.config.bridge.username,
      pin: this.config.bridge.pin,
      matter: this.matterManager?.getMatterStatus() ?? { enabled: false }
    };
    this.ipcService.sendMessage("serverStatusUpdate", statusUpdate);
  }
  async start() {
    if (this.config.bridge.disableIpc !== true) {
      this.initializeIpcEventHandlers();
    }
    const promises = [];
    await this.bridgeService.loadCachedPlatformAccessoriesFromDisk();
    let matterIsConfigured = import_config.MatterConfigCollector.hasMatterConfig(this.config);
    if (matterIsConfigured) {
      await import_config.MatterConfigCollector.validateMatterConfig(this.config);
      matterIsConfigured = import_config.MatterConfigCollector.hasMatterConfig(this.config);
    }
    if (matterIsConfigured) {
      await this.api.loadMatterAPI();
    }
    await this.pluginManager.initializeInstalledPlugins();
    if (matterIsConfigured) {
      const { MatterBridgeManager } = await import("./matter/MatterBridgeManager.js");
      this.matterManager = new MatterBridgeManager(this.config, this.api, this.externalPortService, this.pluginManager, this.options, this);
      this.api._setMatterManager(this.matterManager);
      await this.matterManager.initialize();
    }
    if (this.config.platforms.length > 0) {
      promises.push(...this.loadPlatforms());
    }
    if (this.config.accessories.length > 0) {
      this.loadAccessories();
    }
    for (const childBridge of this.childBridges.values()) {
      childBridge.start();
    }
    this.bridgeService.restoreCachedPlatformAccessories();
    this.matterManager?.restoreCachedAccessories(this.options.keepOrphanedCachedAccessories ?? false);
    this.api.signalFinished();
    await Promise.all(promises);
    if (Server.isHapEnabled(this.config.bridge)) {
      this.publishBridge();
    } else {
      if ((0, import_bridgeService.isHapExternalsOnly)(this.config.bridge.hap)) {
        log.info("HAP externalsOnly mode for the main bridge; bridge accessory will not publish but external accessories will.");
      } else {
        log.info("HAP is disabled for the main bridge (bridge.hap.enabled=false); skipping HAP publish.");
      }
      this.setServerStatus(
        "ok"
        /* ServerStatus.OK */
      );
    }
  }
  async teardown() {
    this.bridgeService.teardown();
    await this.matterManager?.teardown();
    for (const timer of this.pendingMatterAccessoryInfoLookups.values()) {
      clearTimeout(timer);
    }
    this.pendingMatterAccessoryInfoLookups.clear();
    for (const timer of this.pendingMatterControlRequests.values()) {
      clearTimeout(timer);
    }
    this.pendingMatterControlRequests.clear();
    this.ipcService.stop();
    this.setServerStatus(
      "down"
      /* ServerStatus.DOWN */
    );
  }
  publishBridge() {
    this.bridgeService.publishBridge();
    this.printSetupInfo(this.config.bridge.pin);
  }
  /**
   * Handle Matter command trigger from IPC (for UI control)
   * This is called by IPC handlers, not API events
   */
  async handleTriggerMatterCommand(uuid, cluster, attributes, partId) {
    if (!this.matterManager) {
      throw new Error("Matter manager not initialized");
    }
    await this.matterManager.handleTriggerCommand(uuid, cluster, attributes, partId);
  }
  /**
   * Whether HAP should be published for the given bridge configuration.
   * HAP is on by default; users opt out via `bridge.hap.enabled: false`.
   * In externalsOnly mode the bridge accessory itself is not published, so
   * this returns false there too — externals are handled separately by
   * BridgeService.
   */
  static isHapEnabled(bridgeConfig) {
    return (0, import_bridgeService.isHapConfigEnabled)(bridgeConfig.hap) && !(0, import_bridgeService.isHapExternalsOnly)(bridgeConfig.hap);
  }
  /**
   * Whether Matter is enabled for the given bridge.
   * Matter is opt-in: a `bridge.matter` block must be present and not
   * explicitly disabled via `bridge.matter.enabled: false`.
   */
  static isMatterEnabledForBridge(bridgeConfig) {
    return (0, import_config.isMatterConfigEnabled)(bridgeConfig.matter);
  }
  static loadConfig() {
    const configPath = import_user.User.configPath();
    const defaultBridge = {
      name: "Homebridge",
      username: "CC:22:3D:E3:CE:30",
      pin: "031-45-154"
    };
    if (!(0, import_node_fs.existsSync)(configPath)) {
      log.warn("config.json (%s) not found.", configPath);
      return {
        bridge: defaultBridge,
        accessories: [],
        platforms: []
      };
    }
    let config;
    try {
      config = JSON.parse((0, import_node_fs.readFileSync)(configPath, { encoding: "utf8" }));
    } catch (error) {
      log.error("There was a problem reading your config.json file.");
      log.error("Please try pasting your config.json file here to validate it: https://jsonlint.com");
      log.error("");
      throw error;
    }
    if (config.ports !== void 0) {
      if (config.ports.start && config.ports.end) {
        if (config.ports.start > config.ports.end) {
          log.error("Invalid port pool configuration. End should be greater than or equal to start.");
          config.ports = void 0;
        }
      } else {
        log.error("Invalid configuration for 'ports'. Missing 'start' and 'end' properties! Ignoring it!");
        config.ports = void 0;
      }
    }
    const bridge = config.bridge || defaultBridge;
    bridge.name = bridge.name || defaultBridge.name;
    bridge.username = bridge.username || defaultBridge.username;
    bridge.pin = bridge.pin || defaultBridge.pin;
    config.bridge = bridge;
    import_config.MatterConfigCollector.validateMatterPortsPool(config);
    if (typeof config.bridge.username === "string") {
      config.bridge.username = config.bridge.username.toUpperCase();
    }
    const username = config.bridge.username;
    if (!(0, import_mac.validMacAddress)(username)) {
      throw new Error(`Not a valid username: ${username}. Must be 6 pairs of colon-separated hexadecimal chars (A-F 0-9), like a MAC address.`);
    }
    (0, import_bridgeService.validateHapConfig)(config.bridge, { bridgeLabel: "main bridge" });
    config.accessories = config.accessories || [];
    config.platforms = config.platforms || [];
    if (!Array.isArray(config.accessories)) {
      log.error("Value provided for accessories must be an array[]");
      config.accessories = [];
    }
    if (!Array.isArray(config.platforms)) {
      log.error("Value provided for platforms must be an array[]");
      config.platforms = [];
    }
    log.info("Loaded config.json with %s accessories and %s platforms.", config.accessories.length, config.platforms.length);
    if (config.bridge.advertiser) {
      if (![
        "bonjour-hap",
        "ciao",
        "avahi",
        "resolved"
      ].includes(config.bridge.advertiser)) {
        config.bridge.advertiser = void 0;
        log.error("Value provided in bridge.advertiser is not valid, reverting to platform default.");
      }
    } else {
      config.bridge.advertiser = void 0;
    }
    return config;
  }
  loadAccessories() {
    log.info(`Loading ${this.config.accessories.length} accessories...`);
    this.config.accessories.forEach((accessoryConfig, index) => {
      if (!accessoryConfig.accessory) {
        log.warn("Your config.json contains an illegal accessory configuration object at position %d. Missing property 'accessory'. Skipping entry...", index + 1);
        return;
      }
      const accessoryIdentifier = accessoryConfig.accessory;
      const displayName = accessoryConfig.name;
      if (!displayName) {
        log.warn("Could not load accessory %s at position %d as it is missing the required 'name' property!", accessoryIdentifier, index + 1);
        return;
      }
      let plugin;
      let constructor;
      try {
        plugin = this.pluginManager.getPluginForAccessory(accessoryIdentifier);
      } catch (error) {
        log.error(error.message);
        return;
      }
      if (plugin.disabled) {
        log.warn(`Ignoring config for the accessory "${accessoryIdentifier}" in your config.json as the plugin "${plugin.getPluginIdentifier()}" has been disabled.`);
        return;
      }
      try {
        constructor = plugin.getAccessoryConstructor(accessoryIdentifier);
      } catch (error) {
        log.error(`Error loading the accessory "${accessoryIdentifier}" requested in your config.json at position ${index + 1} - this is likely an issue with the "${plugin.getPluginIdentifier()}" plugin.`);
        log.error(error);
        return;
      }
      const logger = import_logger.Logger.withPrefix(displayName);
      logger("Initializing %s accessory...", accessoryIdentifier);
      if (accessoryConfig._bridge) {
        accessoryConfig._bridge.username = accessoryConfig._bridge.username.toUpperCase();
        try {
          this.validateChildBridgeConfig("accessory", accessoryIdentifier, accessoryConfig._bridge);
        } catch (error) {
          log.error(error.message);
          return;
        }
        let childBridge;
        if (this.childBridges.has(accessoryConfig._bridge.username)) {
          childBridge = this.childBridges.get(accessoryConfig._bridge.username);
          logger(`Adding to existing child bridge ${accessoryConfig._bridge.username}`);
        } else {
          logger(`Initializing child bridge ${accessoryConfig._bridge.username}`);
          childBridge = new import_childBridgeService.ChildBridgeService("accessory", accessoryIdentifier, plugin, accessoryConfig._bridge, this.config, this.options, this.api, this.ipcService, this.externalPortService);
          childBridge.onExternalBridgeRegistered = this.registerExternalMatterBridge.bind(this);
          childBridge.onAccessoryInfoResponse = this.cancelPendingMatterAccessoryInfoLookup.bind(this);
          childBridge.onAccessoryControlResponse = this.cancelPendingMatterControlRequest.bind(this);
          this.childBridges.set(accessoryConfig._bridge.username, childBridge);
        }
        childBridge.addConfig(accessoryConfig);
        return;
      }
      const accessoryInstance = new constructor(logger, accessoryConfig, this.api);
      const accessory = this.bridgeService.createHAPAccessory(plugin, accessoryInstance, displayName, accessoryIdentifier, accessoryConfig.uuid_base);
      if (accessory) {
        try {
          this.bridgeService.bridge.addBridgedAccessory(accessory);
        } catch (error) {
          logger.error(`Error loading the accessory "${accessoryIdentifier}" from "${plugin.getPluginIdentifier()}" requested in your config.json:`, error.message);
        }
      } else {
        logger.info("Accessory %s returned empty set of services; not adding it to the bridge.", accessoryIdentifier);
      }
    });
  }
  loadPlatforms() {
    log.info(`Loading ${this.config.platforms.length} platforms...`);
    const promises = [];
    this.config.platforms.forEach((platformConfig, index) => {
      if (!platformConfig.platform) {
        log.warn("Your config.json contains an illegal platform configuration object at position %d. Missing property 'platform'. Skipping entry...", index + 1);
        return;
      }
      const platformIdentifier = platformConfig.platform;
      const displayName = platformConfig.name || platformIdentifier;
      let plugin;
      let constructor;
      if (platformIdentifier === "config" && import_node_process.default.env.UIX_SERVICE_MODE === "1") {
        return;
      }
      try {
        plugin = this.pluginManager.getPluginForPlatform(platformIdentifier);
      } catch (error) {
        log.error(error.message);
        return;
      }
      if (plugin.disabled) {
        log.warn(`Ignoring config for the platform "${platformIdentifier}" in your config.json as the plugin "${plugin.getPluginIdentifier()}" has been disabled.`);
        return;
      }
      try {
        constructor = plugin.getPlatformConstructor(platformIdentifier);
      } catch (error) {
        log.error(`Error loading the platform "${platformIdentifier}" requested in your config.json at position ${index + 1} - this is likely an issue with the "${plugin.getPluginIdentifier()}" plugin.`);
        log.error(error);
        return;
      }
      const logger = import_logger.Logger.withPrefix(displayName);
      logger("Initializing %s platform...", platformIdentifier);
      if (platformConfig._bridge) {
        platformConfig._bridge.username = platformConfig._bridge.username.toUpperCase();
        try {
          this.validateChildBridgeConfig("platform", platformIdentifier, platformConfig._bridge);
        } catch (error) {
          log.error(error.message);
          return;
        }
        logger(`Initializing child bridge ${platformConfig._bridge.username}`);
        const childBridge = new import_childBridgeService.ChildBridgeService("platform", platformIdentifier, plugin, platformConfig._bridge, this.config, this.options, this.api, this.ipcService, this.externalPortService);
        childBridge.onExternalBridgeRegistered = this.registerExternalMatterBridge.bind(this);
        childBridge.onAccessoryInfoResponse = this.cancelPendingMatterAccessoryInfoLookup.bind(this);
        childBridge.onAccessoryControlResponse = this.cancelPendingMatterControlRequest.bind(this);
        this.childBridges.set(platformConfig._bridge.username, childBridge);
        childBridge.addConfig(platformConfig);
        return;
      }
      const platform = new constructor(logger, platformConfig, this.api);
      if (import_api.HomebridgeAPI.isDynamicPlatformPlugin(platform)) {
        plugin.assignDynamicPlatform(platformIdentifier, platform);
      } else if (import_api.HomebridgeAPI.isStaticPlatformPlugin(platform)) {
        promises.push(this.bridgeService.loadPlatformAccessories(plugin, platform, platformIdentifier, logger));
      } else {
      }
    });
    return promises;
  }
  /**
   * Validate an external bridge config
   */
  validateChildBridgeConfig(type, identifier, bridgeConfig) {
    if (!bridgeConfig.username) {
      throw new Error(`Error loading the ${type} "${identifier}" requested in your config.json - Missing required field "_bridge.username".`);
    }
    if (typeof bridgeConfig.username === "string") {
      bridgeConfig.username = bridgeConfig.username.toUpperCase();
    }
    if (!(0, import_mac.validMacAddress)(bridgeConfig.username)) {
      throw new Error(`Error loading the ${type} "${identifier}" requested in your config.json - not a valid username in _bridge.username: "${bridgeConfig.username}". Must be 6 pairs of colon-separated hexadecimal chars (A-F 0-9), like a MAC address.`);
    }
    if (this.childBridges.has(bridgeConfig.username)) {
      const childBridge = this.childBridges.get(bridgeConfig.username);
      if (type === "platform") {
        throw new Error(`Error loading the ${type} "${identifier}" requested in your config.json - Duplicate username found in _bridge.username: "${bridgeConfig.username}". Each platform child bridge must have it's own unique username.`);
      } else if (childBridge?.identifier !== identifier) {
        throw new Error(`Error loading the ${type} "${identifier}" requested in your config.json - Duplicate username found in _bridge.username: "${bridgeConfig.username}". You can only group accessories of the same type in a child bridge.`);
      }
    }
    if (bridgeConfig.username === this.config.bridge.username) {
      throw new Error(`Error loading the ${type} "${identifier}" requested in your config.json - Username found in _bridge.username: "${bridgeConfig.username}" is the same as the main bridge. Each child bridge platform/accessory must have it's own unique username.`);
    }
    (0, import_bridgeService.validateHapConfig)(bridgeConfig, {
      bridgeLabel: `${type} "${identifier}" child bridge`,
      isAccessoryPlugin: type === "accessory"
    });
  }
  /**
   * Takes care of the IPC Events sent to Homebridge
   */
  initializeIpcEventHandlers() {
    this.ipcService.start();
    this.ipcService.on("restartChildBridge", (username) => {
      if (typeof username === "string") {
        const childBridge = this.childBridges.get(username.toUpperCase());
        childBridge?.restartChildBridge();
      }
    });
    this.ipcService.on("stopChildBridge", (username) => {
      if (typeof username === "string") {
        const childBridge = this.childBridges.get(username.toUpperCase());
        childBridge?.stopChildBridge();
      }
    });
    this.ipcService.on("startChildBridge", (username) => {
      if (typeof username === "string") {
        const childBridge = this.childBridges.get(username.toUpperCase());
        childBridge?.startChildBridge();
      }
    });
    this.ipcService.on("childBridgeMetadataRequest", () => {
      this.ipcService.sendMessage("childBridgeMetadataResponse", Array.from(this.childBridges.values(), (x) => x.getMetadata()));
    });
    this.ipcService.on("startMatterMonitoring", (data) => {
      this.handleStartMatterMonitoring(data);
    });
    this.ipcService.on("stopMatterMonitoring", (data) => {
      this.handleStopMatterMonitoring(data);
    });
    this.ipcService.on("getMatterAccessories", (data) => {
      void this.handleGetMatterAccessories(data);
    });
    this.ipcService.on("getMatterAccessoryInfo", (data) => {
      this.handleGetMatterAccessoryInfo(data?.uuid);
    });
    this.ipcService.on("matterAccessoryControl", (data) => {
      void this.handleMatterAccessoryControl(data);
    });
  }
  /**
   * Handle start Matter monitoring request from UI
   * Only starts monitoring if this is the first client.
   *
   * The UI parks each `startMatterMonitoring` request under a `correlationId`
   * so it can route the ack back to the matching waiter and gate its first
   * `getMatterAccessories` on it; echo it on the reply so the UI's dispatcher
   * (which drops events without a correlationId) can deliver it.
   */
  handleStartMatterMonitoring(data) {
    const correlationId = data?.correlationId;
    this.matterMonitoringClients++;
    if (this.matterMonitoringClients === 1) {
      this.matterMonitoringActive = true;
      this.matterManager?.enableStateMonitoring();
      for (const childBridge of this.childBridges.values()) {
        childBridge.startMatterMonitoring();
      }
      const event = {
        type: "monitoringStarted",
        correlationId,
        data: { success: true }
      };
      this.ipcService.sendMessage("matterEvent", event);
    } else {
      const event = {
        type: "monitoringStarted",
        correlationId,
        data: { success: true, alreadyActive: true }
      };
      this.ipcService.sendMessage("matterEvent", event);
    }
  }
  /**
   * Handle stop Matter monitoring request from UI
   * Only stops monitoring when no more clients.
   *
   * Echo the request's `correlationId` for the same reason as
   * `handleStartMatterMonitoring`.
   */
  handleStopMatterMonitoring(data) {
    const correlationId = data?.correlationId;
    if (this.matterMonitoringClients <= 0) {
      const event = {
        type: "monitoringStopped",
        correlationId,
        data: { success: true, alreadyStopped: true }
      };
      this.ipcService.sendMessage("matterEvent", event);
      return;
    }
    this.matterMonitoringClients--;
    if (this.matterMonitoringClients === 0) {
      this.matterMonitoringActive = false;
      this.matterManager?.disableStateMonitoring();
      for (const childBridge of this.childBridges.values()) {
        childBridge.stopMatterMonitoring();
      }
      const event = {
        type: "monitoringStopped",
        correlationId,
        data: { success: true }
      };
      this.ipcService.sendMessage("matterEvent", event);
    } else {
      const event = {
        type: "monitoringStopped",
        correlationId,
        data: { success: true, othersActive: true }
      };
      this.ipcService.sendMessage("matterEvent", event);
    }
  }
  /**
   * Register an external Matter bridge (e.g., robot vacuum with own bridge)
   * This allows routing control commands directly to the correct owner
   * @param externalBridgeUsername - Username of the external Matter bridge
   * @param ownerUsername - Username of the bridge that owns it (main bridge or child bridge username)
   */
  registerExternalMatterBridge(externalBridgeUsername, ownerUsername) {
    const normalizedExternal = externalBridgeUsername.toUpperCase();
    const normalizedOwner = ownerUsername.toUpperCase();
    matterLogger.debug(`Registering external Matter bridge ${normalizedExternal} \u2192 owner: ${normalizedOwner}`);
    this.externalMatterBridgeRegistry.set(normalizedExternal, normalizedOwner);
  }
  /**
   * Cancel the pending fallback timer for a forwarded Matter accessory lookup.
   * Called by ChildBridgeService when a child responds with accessoryInfoData
   * so the 2s "Timed out" event isn't sent after a successful response.
   */
  cancelPendingMatterAccessoryInfoLookup(uuid) {
    const timer = this.pendingMatterAccessoryInfoLookups.get(uuid);
    if (timer) {
      clearTimeout(timer);
      this.pendingMatterAccessoryInfoLookups.delete(uuid);
    }
  }
  /**
   * Cancel the fallback for a broadcast control request, because the child
   * that owns the accessory has answered it.
   */
  cancelPendingMatterControlRequest(correlationId) {
    const timer = this.pendingMatterControlRequests.get(correlationId);
    if (timer) {
      clearTimeout(timer);
      this.pendingMatterControlRequests.delete(correlationId);
    }
  }
  /**
   * Get Matter accessories for a specific bridge or all bridges.
   *
   * The UI parks each request under a `correlationId` and routes responses
   * back to the matching waiter; events without the original correlationId
   * are dropped, so every emitted `accessoriesData` event must echo it.
   */
  async handleGetMatterAccessories(data) {
    const bridgeUsername = data?.bridgeUsername;
    const correlationId = data?.correlationId;
    if (!this.matterMonitoringActive) {
      matterLogger.warn("Matter monitoring not active - cannot get accessories");
      const event = {
        type: "accessoriesData",
        correlationId,
        data: {
          bridgeUsername,
          error: "Matter monitoring not active"
        }
      };
      this.ipcService.sendMessage("matterEvent", event);
      return;
    }
    if (!this.api.isMatterEnabled() && this.childBridges.size === 0) {
      const event = {
        type: "accessoriesData",
        correlationId,
        data: {
          bridgeUsername,
          accessories: []
        }
      };
      this.ipcService.sendMessage("matterEvent", event);
      return;
    }
    try {
      const allAccessories = this.matterManager?.collectAllAccessories(bridgeUsername) || [];
      if (this.childBridges.size > 0) {
        const results = await Promise.allSettled(Array.from(this.childBridges.values(), (childBridge) => childBridge.requestMatterAccessories()));
        for (const result of results) {
          if (result.status === "fulfilled" && result.value?.accessories) {
            allAccessories.push(...result.value.accessories);
          }
        }
      }
      const event = {
        type: "accessoriesData",
        correlationId,
        data: {
          bridgeUsername: bridgeUsername || "all",
          accessories: allAccessories
        }
      };
      this.ipcService.sendMessage("matterEvent", event);
    } catch (error) {
      matterLogger.error("Failed to get Matter accessories:", error);
      const event = {
        type: "accessoriesData",
        correlationId,
        data: {
          bridgeUsername,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
      this.ipcService.sendMessage("matterEvent", event);
    }
  }
  /**
   * Get detailed info for a specific Matter accessory
   */
  handleGetMatterAccessoryInfo(uuid) {
    if (!uuid) {
      const event = {
        type: "accessoryInfoData",
        data: {
          error: "UUID is required"
        }
      };
      this.ipcService.sendMessage("matterEvent", event);
      return;
    }
    try {
      const accessoryInfo = this.matterManager?.getAccessoryInfo(uuid);
      if (accessoryInfo) {
        const event = {
          type: "accessoryInfoData",
          data: accessoryInfo
        };
        this.ipcService.sendMessage("matterEvent", event);
        return;
      }
      let forwardedToChildren = false;
      for (const childBridge of this.childBridges.values()) {
        if ((0, import_config.isMatterActive)(childBridge.getMetadata().matterConfig)) {
          childBridge.getMatterAccessoryInfo(uuid);
          forwardedToChildren = true;
        }
      }
      if (!forwardedToChildren) {
        this.ipcService.sendMessage("matterEvent", {
          type: "accessoryInfoData",
          data: { error: `Accessory ${uuid} not found`, uuid }
        });
        return;
      }
      const existing = this.pendingMatterAccessoryInfoLookups.get(uuid);
      if (existing) {
        clearTimeout(existing);
      }
      const fallback = setTimeout(() => {
        this.pendingMatterAccessoryInfoLookups.delete(uuid);
        this.ipcService.sendMessage("matterEvent", {
          type: "accessoryInfoData",
          data: {
            error: `Timed out looking up Matter accessory ${uuid}; it may not be registered.`,
            uuid,
            timedOut: true
          }
        });
      }, 2e3);
      fallback.unref();
      this.pendingMatterAccessoryInfoLookups.set(uuid, fallback);
    } catch (error) {
      matterLogger.error("Failed to get Matter accessory info:", error);
      const event = {
        type: "accessoryInfoData",
        data: {
          error: error instanceof Error ? error.message : "Unknown error"
        }
      };
      this.ipcService.sendMessage("matterEvent", event);
    }
  }
  /**
   * Handle Matter accessory control command
   */
  /**
   * Send an `accessoryControlResponse` back over IPC, echoing the request's
   * `correlationId` when one was given. The UI parks each control request
   * under its correlationId and its dispatcher only delivers events that
   * carry it — a response without one is dropped, so the request would sit
   * through a 10s timeout, be retried (running the command a second time),
   * and then be reported as failed even though the control succeeded.
   */
  sendMatterControlResponse(data, correlationId) {
    this.ipcService.sendMessage("matterEvent", {
      type: "accessoryControlResponse",
      correlationId,
      data
    });
  }
  async handleMatterAccessoryControl(data) {
    matterLogger.debug(`Matter control request: uuid=${data?.uuid}, cluster=${data?.cluster}, bridge=${data?.bridgeUsername || "auto"}, part=${data?.partId || "main"}`);
    const correlationId = data?.correlationId;
    if (!data?.uuid || !data?.cluster || !data?.attributes) {
      matterLogger.error("Missing required parameters for Matter control");
      this.sendMatterControlResponse({
        success: false,
        error: "Missing required parameters"
      }, correlationId);
      return;
    }
    if (data.bridgeUsername) {
      const targetUsername = data.bridgeUsername.toUpperCase();
      if (targetUsername === this.config.bridge.username.toUpperCase()) {
        matterLogger.debug(`Routing to main bridge (${targetUsername})`);
        try {
          await this.handleTriggerMatterCommand(data.uuid, data.cluster, data.attributes, data.partId);
          matterLogger.debug(`Main bridge successfully controlled accessory ${data.uuid}`);
          this.sendMatterControlResponse({ success: true, uuid: data.uuid }, correlationId);
        } catch (error) {
          matterLogger.error(`Main bridge failed to control ${data.uuid}: ${error.message}`);
          this.sendMatterControlResponse({ success: false, error: error.message, uuid: data.uuid }, correlationId);
        }
        return;
      }
      for (const childBridge of this.childBridges.values()) {
        if (childBridge.getMetadata().username.toUpperCase() === targetUsername) {
          matterLogger.debug(`Routing to child bridge ${childBridge.identifier} (${targetUsername})`);
          childBridge.controlMatterAccessory(data);
          return;
        }
      }
      const ownerUsername = this.externalMatterBridgeRegistry.get(targetUsername);
      if (ownerUsername) {
        matterLogger.debug(`Found external bridge ${targetUsername} in registry, owned by ${ownerUsername}`);
        if (ownerUsername === this.config.bridge.username.toUpperCase()) {
          matterLogger.debug(`Routing to main bridge's external accessories for ${data.uuid}`);
          try {
            await this.handleTriggerMatterCommand(data.uuid, data.cluster, data.attributes, data.partId);
            matterLogger.debug(`External accessory ${data.uuid} successfully controlled via main bridge`);
            this.sendMatterControlResponse({ success: true, uuid: data.uuid }, correlationId);
          } catch (error) {
            matterLogger.error(`Main bridge failed to control external accessory ${data.uuid}: ${error.message}`);
            this.sendMatterControlResponse({ success: false, error: error.message, uuid: data.uuid }, correlationId);
          }
        } else {
          const childBridge = this.childBridges.get(ownerUsername);
          if (childBridge) {
            matterLogger.debug(`Routing to child bridge ${childBridge.identifier} (${ownerUsername}) for external accessory ${data.uuid}`);
            childBridge.controlMatterAccessory(data);
          } else {
            matterLogger.error(`Owner bridge ${ownerUsername} not found for external bridge ${targetUsername}`);
            this.sendMatterControlResponse({ success: false, error: `Owner bridge ${ownerUsername} not found`, uuid: data.uuid }, correlationId);
          }
        }
        return;
      }
      matterLogger.error(`Bridge ${targetUsername} not found in main/child bridges or registry`);
      this.sendMatterControlResponse({ success: false, error: `Bridge ${targetUsername} not found`, uuid: data.uuid }, correlationId);
      return;
    }
    matterLogger.debug(`Broadcast mode: trying main bridge for accessory ${data.uuid}`);
    try {
      await this.handleTriggerMatterCommand(data.uuid, data.cluster, data.attributes, data.partId);
      matterLogger.debug(`Main bridge successfully controlled accessory ${data.uuid}`);
      this.sendMatterControlResponse({ success: true, uuid: data.uuid }, correlationId);
    } catch (error) {
      const matterChildBridges = [...this.childBridges.values()].filter((bridge) => (0, import_config.isMatterActive)(bridge.getMetadata().matterConfig));
      if (matterChildBridges.length > 0) {
        matterLogger.debug(`Main bridge doesn't have accessory ${data.uuid}, forwarding to ${matterChildBridges.length} child bridge(s) with Matter enabled`);
        for (const childBridge of matterChildBridges) {
          childBridge.controlMatterAccessory(data);
        }
        if (correlationId) {
          const existing = this.pendingMatterControlRequests.get(correlationId);
          if (existing) {
            clearTimeout(existing);
          }
          const fallback = setTimeout(() => {
            this.pendingMatterControlRequests.delete(correlationId);
            matterLogger.warn(`Accessory ${data.uuid} not found - no child bridge with Matter claimed it`);
            this.sendMatterControlResponse({ success: false, error: "Accessory not found", uuid: data.uuid }, correlationId);
          }, 2e3);
          fallback.unref();
          this.pendingMatterControlRequests.set(correlationId, fallback);
        }
      } else {
        matterLogger.warn(`Accessory ${data.uuid} not found - not on main bridge and no child bridges with Matter available`);
        this.sendMatterControlResponse({ success: false, error: "Accessory not found", uuid: data.uuid }, correlationId);
      }
    }
  }
  printSetupInfo(pin) {
    console.log("Setup Payload:");
    console.log(this.bridgeService.bridge.setupURI());
    if (!this.options.hideQRCode) {
      console.log("Scan this code with your HomeKit app on your iOS device to pair with Homebridge:");
      import_qrcode_terminal.default.generate(this.bridgeService.bridge.setupURI());
      console.log("Or enter this code with your HomeKit app on your iOS device to pair with Homebridge:");
    } else {
      console.log("Enter this code with your HomeKit app on your iOS device to pair with Homebridge:");
    }
    console.log(import_chalk.default.black.bgWhite("                       "));
    console.log(import_chalk.default.black.bgWhite("    \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510     "));
    console.log(import_chalk.default.black.bgWhite(`    \u2502 ${pin} \u2502     `));
    console.log(import_chalk.default.black.bgWhite("    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518     "));
    console.log(import_chalk.default.black.bgWhite("                       "));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Server,
  ServerStatus
});
