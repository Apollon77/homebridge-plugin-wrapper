"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = exports.ServerStatus = void 0;
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const mac = __importStar(require("./util/mac"));
const logger_1 = require("./logger");
const user_1 = require("./user");
const childBridgeService_1 = require("./childBridgeService");
const externalPortService_1 = require("./externalPortService");
const ipcService_1 = require("./ipcService");
const pluginManager_1 = require("./pluginManager");
const bridgeService_1 = require("./bridgeService");
const api_1 = require("./api");
const log = logger_1.Logger.internal;
var ServerStatus;
(function (ServerStatus) {
    /**
     * When the server is starting up
     */
    ServerStatus["PENDING"] = "pending";
    /**
     * When the server is online and has published the main bridge
     */
    ServerStatus["OK"] = "ok";
    /**
     * When the server is shutting down
     */
    ServerStatus["DOWN"] = "down";
})(ServerStatus = exports.ServerStatus || (exports.ServerStatus = {}));
class Server {
    constructor(options = {}) {
        this.options = options;
        // used to keep track of child bridges
        this.childBridges = new Map();
        // current server status
        this.serverStatus = "pending" /* PENDING */;
        this.config = Server.loadConfig();
        // object we feed to Plugins and BridgeService
        this.api = new api_1.HomebridgeAPI();
        this.ipcService = new ipcService_1.IpcService();
        this.externalPortService = new externalPortService_1.ExternalPortService(this.config.ports);
        // set status to pending
        this.setServerStatus("pending" /* PENDING */);
        // create new plugin manager
        const pluginManagerOptions = {
            activePlugins: this.config.plugins,
            disabledPlugins: this.config.disabledPlugins,
            customPluginPath: options.customPluginPath,
            strictPluginResolution: options.strictPluginResolution,
        };
        this.pluginManager = new pluginManager_1.PluginManager(this.api, pluginManagerOptions);
        // create new bridge service
        const bridgeConfig = {
            cachedAccessoriesDir: user_1.User.cachedAccessoryPath(),
            cachedAccessoriesItemName: "cachedAccessories",
        };
        // shallow copy the homebridge options to the bridge options object
        Object.assign(bridgeConfig, this.options);
        this.bridgeService = new bridgeService_1.BridgeService(this.api, this.pluginManager, this.externalPortService, bridgeConfig, this.config.bridge, this.config);
        // watch bridge events to check when server is online
        this.bridgeService.bridge.on("advertised" /* ADVERTISED */, () => {
            this.setServerStatus("ok" /* OK */);
        });
        // watch for the paired event to update the server status
        this.bridgeService.bridge.on("paired" /* PAIRED */, () => {
            this.setServerStatus(this.serverStatus);
        });
        // watch for the unpaired event to update the server status
        this.bridgeService.bridge.on("unpaired" /* UNPAIRED */, () => {
            this.setServerStatus(this.serverStatus);
        });
    }
    /**
     * Set the current server status and update parent via IPC
     * @param status
     */
    setServerStatus(status) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        this.serverStatus = status;
        this.ipcService.sendMessage("serverStatusUpdate" /* SERVER_STATUS_UPDATE */, {
            status: this.serverStatus,
            paired: (_d = (_c = (_b = (_a = this.bridgeService) === null || _a === void 0 ? void 0 : _a.bridge) === null || _b === void 0 ? void 0 : _b._accessoryInfo) === null || _c === void 0 ? void 0 : _c.paired()) !== null && _d !== void 0 ? _d : null,
            setupUri: (_g = (_f = (_e = this.bridgeService) === null || _e === void 0 ? void 0 : _e.bridge) === null || _f === void 0 ? void 0 : _f.setupURI()) !== null && _g !== void 0 ? _g : null,
            name: ((_j = (_h = this.bridgeService) === null || _h === void 0 ? void 0 : _h.bridge) === null || _j === void 0 ? void 0 : _j.displayName) || this.config.bridge.name,
            username: this.config.bridge.username,
            pin: this.config.bridge.pin,
        });
    }
    async start() {
        if (this.config.bridge.disableIpc !== true) {
            this.initializeIpcEventHandlers();
        }
        const promises = [];
        // load the cached accessories
        await this.bridgeService.loadCachedPlatformAccessoriesFromDisk();
        // initialize plugins
        await this.pluginManager.initializeInstalledPlugins();
        if (this.config.platforms.length > 0) {
            promises.push(...this.loadPlatforms());
        }
        if (this.config.accessories.length > 0) {
            this.loadAccessories();
        }
        // start child bridges
        for (const childBridge of this.childBridges.values()) {
            childBridge.start();
        }
        // restore cached accessories
        this.bridgeService.restoreCachedPlatformAccessories();
        this.api.signalFinished();
        // wait for all platforms to publish their accessories before we publish the bridge
        await Promise.all(promises)
            .then(() => this.publishBridge());
    }
    teardown() {
        this.bridgeService.teardown();
        this.setServerStatus("down" /* DOWN */);
    }
    publishBridge() {
        this.bridgeService.publishBridge();
        this.printSetupInfo(this.config.bridge.pin);
    }
    static loadConfig() {
        // Look for the configuration file
        const configPath = user_1.User.configPath();
        const defaultBridge = {
            name: "Homebridge",
            username: "CC:22:3D:E3:CE:30",
            pin: "031-45-154",
        };
        if (!fs_1.default.existsSync(configPath)) {
            log.warn("config.json (%s) not found.", configPath);
            return {
                bridge: defaultBridge,
                accessories: [],
                platforms: [],
            };
        }
        let config;
        try {
            config = JSON.parse(fs_1.default.readFileSync(configPath, { encoding: "utf8" }));
        }
        catch (err) {
            log.error("There was a problem reading your config.json file.");
            log.error("Please try pasting your config.json file here to validate it: http://jsonlint.com");
            log.error("");
            throw err;
        }
        if (config.ports !== undefined) {
            if (config.ports.start && config.ports.end) {
                if (config.ports.start > config.ports.end) {
                    log.error("Invalid port pool configuration. End should be greater than or equal to start.");
                    config.ports = undefined;
                }
            }
            else {
                log.error("Invalid configuration for 'ports'. Missing 'start' and 'end' properties! Ignoring it!");
                config.ports = undefined;
            }
        }
        const bridge = config.bridge || defaultBridge;
        bridge.name = bridge.name || defaultBridge.name;
        bridge.username = bridge.username || defaultBridge.username;
        bridge.pin = bridge.pin || defaultBridge.pin;
        config.bridge = bridge;
        const username = config.bridge.username;
        if (!mac.validMacAddress(username)) {
            throw new Error(`Not a valid username: ${username}. Must be 6 pairs of colon-separated hexadecimal chars (A-F 0-9), like a MAC address.`);
        }
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
                "bonjour-hap" /* BONJOUR */,
                "ciao" /* CIAO */,
                "avahi" /* AVAHI */,
            ].includes(config.bridge.advertiser)) {
                config.bridge.advertiser = undefined;
                log.error("Value provided in bridge.advertiser is not valid, reverting to platform default.");
            }
        }
        else {
            config.bridge.advertiser = undefined;
        }
        // Warn existing Homebridge 1.3.0 beta users they need to swap to bridge.advertiser
        if (config.mdns && config.mdns.legacyAdvertiser === false && config.bridge.advertiser === "bonjour-hap" /* BONJOUR */) {
            log.error(`The "mdns"."legacyAdvertiser" = false option has been removed. Please use "bridge"."advertiser" = "${"ciao" /* CIAO */}" to enable the Ciao mDNS advertiser. You should remove the "mdns"."legacyAdvertiser" section from your config.json.`);
        }
        return config;
    }
    loadAccessories() {
        log.info("Loading " + this.config.accessories.length + " accessories...");
        this.config.accessories.forEach((accessoryConfig, index) => {
            if (!accessoryConfig.accessory) {
                log.warn("Your config.json contains an illegal accessory configuration object at position %d. " +
                    "Missing property 'accessory'. Skipping entry...", index + 1); // we rather count from 1 for the normal people?
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
            }
            catch (error) {
                log.error(error.message);
                return;
            }
            // check the plugin is not disabled
            if (plugin.disabled) {
                log.warn(`Ignoring config for the accessory "${accessoryIdentifier}" in your config.json as the plugin "${plugin.getPluginIdentifier()}" has been disabled.`);
                return;
            }
            try {
                constructor = plugin.getAccessoryConstructor(accessoryIdentifier);
            }
            catch (error) {
                log.error(`Error loading the accessory "${accessoryIdentifier}" requested in your config.json at position ${index + 1} - this is likely an issue with the "${plugin.getPluginIdentifier()}" plugin.`);
                log.error(error); // error message contains more information and full stack trace
                return;
            }
            const logger = logger_1.Logger.withPrefix(displayName);
            logger("Initializing %s accessory...", accessoryIdentifier);
            if (accessoryConfig._bridge) {
                // ensure the username is always uppercase
                accessoryConfig._bridge.username = accessoryConfig._bridge.username.toUpperCase();
                try {
                    this.validateChildBridgeConfig("accessory" /* ACCESSORY */, accessoryIdentifier, accessoryConfig._bridge);
                }
                catch (error) {
                    log.error(error.message);
                    return;
                }
                let childBridge;
                if (this.childBridges.has(accessoryConfig._bridge.username)) {
                    childBridge = this.childBridges.get(accessoryConfig._bridge.username);
                    logger(`Adding to existing child bridge ${accessoryConfig._bridge.username}`);
                }
                else {
                    logger(`Initializing child bridge ${accessoryConfig._bridge.username}`);
                    childBridge = new childBridgeService_1.ChildBridgeService("accessory" /* ACCESSORY */, accessoryIdentifier, plugin, accessoryConfig._bridge, this.config, this.options, this.api, this.ipcService, this.externalPortService);
                    this.childBridges.set(accessoryConfig._bridge.username, childBridge);
                }
                // add config to child bridge service
                childBridge.addConfig(accessoryConfig);
                return;
            }
            const accessoryInstance = new constructor(logger, accessoryConfig, this.api);
            //pass accessoryIdentifier for UUID generation, and optional parameter uuid_base which can be used instead of displayName for UUID generation
            const accessory = this.bridgeService.createHAPAccessory(plugin, accessoryInstance, displayName, accessoryIdentifier, accessoryConfig.uuid_base);
            if (accessory) {
                try {
                    this.bridgeService.bridge.addBridgedAccessory(accessory);
                }
                catch (e) {
                    logger.error(`Error loading the accessory "${accessoryIdentifier}" from "${plugin.getPluginIdentifier()}" requested in your config.json:`, e.message);
                    return;
                }
            }
            else {
                logger.info("Accessory %s returned empty set of services; not adding it to the bridge.", accessoryIdentifier);
            }
        });
    }
    loadPlatforms() {
        log.info("Loading " + this.config.platforms.length + " platforms...");
        const promises = [];
        this.config.platforms.forEach((platformConfig, index) => {
            if (!platformConfig.platform) {
                log.warn("Your config.json contains an illegal platform configuration object at position %d. " +
                    "Missing property 'platform'. Skipping entry...", index + 1); // we rather count from 1 for the normal people?
                return;
            }
            const platformIdentifier = platformConfig.platform;
            const displayName = platformConfig.name || platformIdentifier;
            let plugin;
            let constructor;
            // do not load homebridge-config-ui-x when running in service mode
            if (platformIdentifier === "config" && process.env.UIX_SERVICE_MODE === "1") {
                return;
            }
            try {
                plugin = this.pluginManager.getPluginForPlatform(platformIdentifier);
            }
            catch (error) {
                log.error(error.message);
                return;
            }
            // check the plugin is not disabled
            if (plugin.disabled) {
                log.warn(`Ignoring config for the platform "${platformIdentifier}" in your config.json as the plugin "${plugin.getPluginIdentifier()}" has been disabled.`);
                return;
            }
            try {
                constructor = plugin.getPlatformConstructor(platformIdentifier);
            }
            catch (error) {
                log.error(`Error loading the platform "${platformIdentifier}" requested in your config.json at position ${index + 1} - this is likely an issue with the "${plugin.getPluginIdentifier()}" plugin.`);
                log.error(error); // error message contains more information and full stack trace
                return;
            }
            const logger = logger_1.Logger.withPrefix(displayName);
            logger("Initializing %s platform...", platformIdentifier);
            if (platformConfig._bridge) {
                // ensure the username is always uppercase
                platformConfig._bridge.username = platformConfig._bridge.username.toUpperCase();
                try {
                    this.validateChildBridgeConfig("platform" /* PLATFORM */, platformIdentifier, platformConfig._bridge);
                }
                catch (error) {
                    log.error(error.message);
                    return;
                }
                logger(`Initializing child bridge ${platformConfig._bridge.username}`);
                const childBridge = new childBridgeService_1.ChildBridgeService("platform" /* PLATFORM */, platformIdentifier, plugin, platformConfig._bridge, this.config, this.options, this.api, this.ipcService, this.externalPortService);
                this.childBridges.set(platformConfig._bridge.username, childBridge);
                // add config to child bridge service
                childBridge.addConfig(platformConfig);
                return;
            }
            const platform = new constructor(logger, platformConfig, this.api);
            if (api_1.HomebridgeAPI.isDynamicPlatformPlugin(platform)) {
                plugin.assignDynamicPlatform(platformIdentifier, platform);
            }
            else if (api_1.HomebridgeAPI.isStaticPlatformPlugin(platform)) { // Plugin 1.0, load accessories
                promises.push(this.bridgeService.loadPlatformAccessories(plugin, platform, platformIdentifier, logger));
            }
            else {
                // otherwise it's a IndependentPlatformPlugin which doesn't expose any methods at all.
                // We just call the constructor and let it be enabled.
            }
        });
        return promises;
    }
    /**
     * Validate an external bridge config
     */
    validateChildBridgeConfig(type, identifier, bridgeConfig) {
        if (!mac.validMacAddress(bridgeConfig.username)) {
            throw new Error(`Error loading the ${type} "${identifier}" requested in your config.json - ` +
                `not a valid username in _bridge.username: "${bridgeConfig.username}". Must be 6 pairs of colon-separated hexadecimal chars (A-F 0-9), like a MAC address.`);
        }
        if (this.childBridges.has(bridgeConfig.username)) {
            const childBridge = this.childBridges.get(bridgeConfig.username);
            if (type === "platform" /* PLATFORM */) {
                // only a single platform can exist on one child bridge
                throw new Error(`Error loading the ${type} "${identifier}" requested in your config.json - ` +
                    `Duplicate username found in _bridge.username: "${bridgeConfig.username}". Each platform child bridge must have it's own unique username.`);
            }
            else if ((childBridge === null || childBridge === void 0 ? void 0 : childBridge.identifier) !== identifier) {
                // only accessories of the same type can be added to the same child bridge
                throw new Error(`Error loading the ${type} "${identifier}" requested in your config.json - ` +
                    `Duplicate username found in _bridge.username: "${bridgeConfig.username}". You can only group accessories of the same type in a child bridge.`);
            }
        }
        if (bridgeConfig.username === this.config.bridge.username.toUpperCase()) {
            throw new Error(`Error loading the ${type} "${identifier}" requested in your config.json - ` +
                `Username found in _bridge.username: "${bridgeConfig.username}" is the same as the main bridge. Each child bridge platform/accessory must have it's own unique username.`);
        }
    }
    /**
     * Takes care of the IPC Events sent to Homebridge
     */
    initializeIpcEventHandlers() {
        // start ipc service
        this.ipcService.start();
        // handle restart child bridge event
        this.ipcService.on("restartChildBridge" /* RESTART_CHILD_BRIDGE */, (username) => {
            if (typeof username === "string") {
                const childBridge = this.childBridges.get(username.toUpperCase());
                childBridge === null || childBridge === void 0 ? void 0 : childBridge.restartChildBridge();
            }
        });
        // handle stop child bridge event
        this.ipcService.on("stopChildBridge" /* STOP_CHILD_BRIDGE */, (username) => {
            if (typeof username === "string") {
                const childBridge = this.childBridges.get(username.toUpperCase());
                childBridge === null || childBridge === void 0 ? void 0 : childBridge.stopChildBridge();
            }
        });
        // handle start child bridge event
        this.ipcService.on("startChildBridge" /* START_CHILD_BRIDGE */, (username) => {
            if (typeof username === "string") {
                const childBridge = this.childBridges.get(username.toUpperCase());
                childBridge === null || childBridge === void 0 ? void 0 : childBridge.startChildBridge();
            }
        });
        this.ipcService.on("childBridgeMetadataRequest" /* CHILD_BRIDGE_METADATA_REQUEST */, () => {
            this.ipcService.sendMessage("childBridgeMetadataResponse" /* CHILD_BRIDGE_METADATA_RESPONSE */, Array.from(this.childBridges.values()).map(x => x.getMetadata()));
        });
    }
    printSetupInfo(pin) {
        console.log("Setup Payload:");
        console.log(this.bridgeService.bridge.setupURI());
        if (!this.options.hideQRCode) {
            console.log("Scan this code with your HomeKit app on your iOS device to pair with Homebridge:");
            qrcode_terminal_1.default.setErrorLevel("M"); // HAP specifies level M or higher for ECC
            qrcode_terminal_1.default.generate(this.bridgeService.bridge.setupURI());
            console.log("Or enter this code with your HomeKit app on your iOS device to pair with Homebridge:");
        }
        else {
            console.log("Enter this code with your HomeKit app on your iOS device to pair with Homebridge:");
        }
        console.log(chalk_1.default.black.bgWhite("                       "));
        console.log(chalk_1.default.black.bgWhite("    ┌────────────┐     "));
        console.log(chalk_1.default.black.bgWhite("    │ " + pin + " │     "));
        console.log(chalk_1.default.black.bgWhite("    └────────────┘     "));
        console.log(chalk_1.default.black.bgWhite("                       "));
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map