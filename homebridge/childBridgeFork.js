"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildBridgeFork = void 0;
/**
 * This is a standalone script executed as a child process fork
 */
process.title = "homebridge: child bridge";
// registering node-source-map-support for typescript stack traces
require("source-map-support/register");
const api_1 = require("./api");
const externalPortService_1 = require("./externalPortService");
const pluginManager_1 = require("./pluginManager");
const logger_1 = require("./logger");
const user_1 = require("./user");
const hap_nodejs_1 = require("hap-nodejs");
const bridgeService_1 = require("./bridgeService");
class ChildBridgeFork {
    constructor() {
        this.portRequestCallback = new Map();
        // tell the parent process we are ready to accept plugin config
        this.sendMessage("ready" /* READY */);
    }
    sendMessage(type, data) {
        if (process.send) {
            process.send({
                id: type,
                data,
            });
        }
    }
    async loadPlugin(data) {
        // set data
        this.type = data.type;
        this.identifier = data.identifier;
        this.pluginConfig = data.pluginConfig;
        this.bridgeConfig = data.bridgeConfig;
        this.bridgeOptions = data.bridgeOptions;
        this.homebridgeConfig = data.homebridgeConfig;
        // remove the _bridge key (some plugins do not like unknown config)
        for (const config of this.pluginConfig) {
            delete config._bridge;
        }
        // set bridge settings (inherited from main bridge)
        if (this.bridgeOptions.noLogTimestamps) {
            logger_1.Logger.setTimestampEnabled(false);
        }
        if (this.bridgeOptions.debugModeEnabled) {
            logger_1.Logger.setDebugEnabled(true);
        }
        if (this.bridgeOptions.forceColourLogging) {
            logger_1.Logger.forceColor();
        }
        if (this.bridgeOptions.customStoragePath) {
            user_1.User.setStoragePath(this.bridgeOptions.customStoragePath);
        }
        // Initialize HAP-NodeJS with a custom persist directory
        hap_nodejs_1.HAPStorage.setCustomStoragePath(user_1.User.persistPath());
        // load api
        this.api = new api_1.HomebridgeAPI();
        this.pluginManager = new pluginManager_1.PluginManager(this.api);
        this.externalPortService = new externalPortService_1.ChildBridgeExternalPortService(this);
        // load plugin
        this.plugin = await this.pluginManager.loadPlugin(data.pluginPath);
        await this.plugin.load();
        await this.pluginManager.initializePlugin(this.plugin, data.identifier);
        // change process title to include plugin name
        process.title = `homebridge: ${this.plugin.getPluginIdentifier()}`;
        this.sendMessage("loaded" /* LOADED */, {
            version: this.plugin.version,
        });
    }
    async startBridge() {
        this.bridgeService = new bridgeService_1.BridgeService(this.api, this.pluginManager, this.externalPortService, this.bridgeOptions, this.bridgeConfig, this.homebridgeConfig);
        // watch bridge events to check when server is online
        this.bridgeService.bridge.on("advertised" /* ADVERTISED */, () => {
            this.sendPairedStatusEvent();
        });
        // watch for the paired event to update the server status
        this.bridgeService.bridge.on("paired" /* PAIRED */, () => {
            this.sendPairedStatusEvent();
        });
        // watch for the unpaired event to update the server status
        this.bridgeService.bridge.on("unpaired" /* UNPAIRED */, () => {
            this.sendPairedStatusEvent();
        });
        // load the cached accessories
        await this.bridgeService.loadCachedPlatformAccessoriesFromDisk();
        for (const config of this.pluginConfig) {
            if (this.type === "platform" /* PLATFORM */) {
                const plugin = this.pluginManager.getPluginForPlatform(this.identifier);
                const displayName = config.name || plugin.getPluginIdentifier();
                const logger = logger_1.Logger.withPrefix(displayName);
                const constructor = plugin.getPlatformConstructor(this.identifier);
                const platform = new constructor(logger, config, this.api);
                if (api_1.HomebridgeAPI.isDynamicPlatformPlugin(platform)) {
                    plugin.assignDynamicPlatform(this.identifier, platform);
                }
                else if (api_1.HomebridgeAPI.isStaticPlatformPlugin(platform)) { // Plugin 1.0, load accessories
                    await this.bridgeService.loadPlatformAccessories(plugin, platform, this.identifier, logger);
                }
                else {
                    // otherwise it's a IndependentPlatformPlugin which doesn't expose any methods at all.
                    // We just call the constructor and let it be enabled.
                }
            }
            else if (this.type === "accessory" /* ACCESSORY */) {
                const plugin = this.pluginManager.getPluginForAccessory(this.identifier);
                const displayName = config.name;
                if (!displayName) {
                    logger_1.Logger.internal.warn("Could not load accessory %s as it is missing the required 'name' property!", this.identifier);
                    return;
                }
                const logger = logger_1.Logger.withPrefix(displayName);
                const constructor = plugin.getAccessoryConstructor(this.identifier);
                const accessoryInstance = new constructor(logger, config, this.api);
                //pass accessoryIdentifier for UUID generation, and optional parameter uuid_base which can be used instead of displayName for UUID generation
                const accessory = this.bridgeService.createHAPAccessory(plugin, accessoryInstance, displayName, this.identifier, config.uuid_base);
                if (accessory) {
                    this.bridgeService.bridge.addBridgedAccessory(accessory);
                }
                else {
                    logger("Accessory %s returned empty set of services. Won't adding it to the bridge!", this.identifier);
                }
            }
        }
        // restore the cached accessories
        this.bridgeService.restoreCachedPlatformAccessories();
        this.bridgeService.publishBridge();
        this.api.signalFinished();
        // tell the parent we are online
        this.sendMessage("online" /* ONLINE */);
    }
    /**
     * Request the next available external port from the parent process
     * @param username
     */
    async requestExternalPort(username) {
        return new Promise((resolve) => {
            const requestTimeout = setTimeout(() => {
                logger_1.Logger.internal.warn("Parent process did not respond to port allocation request within 5 seconds - assigning random port.");
                resolve(undefined);
            }, 5000);
            // setup callback
            const callback = (port) => {
                clearTimeout(requestTimeout);
                resolve(port);
                this.portRequestCallback.delete(username);
            };
            this.portRequestCallback.set(username, callback);
            // send port request
            this.sendMessage("portRequest" /* PORT_REQUEST */, { username });
        });
    }
    /**
     * Handles the port allocation response message from the parent process
     * @param data
     */
    handleExternalResponse(data) {
        const callback = this.portRequestCallback.get(data.username);
        if (callback) {
            callback(data.port);
        }
    }
    /**
     * Sends the current pairing status of the child bridge to the parent process
     */
    sendPairedStatusEvent() {
        var _a, _b, _c, _d, _e, _f, _g;
        this.sendMessage("status" /* STATUS_UPDATE */, {
            paired: (_d = (_c = (_b = (_a = this.bridgeService) === null || _a === void 0 ? void 0 : _a.bridge) === null || _b === void 0 ? void 0 : _b._accessoryInfo) === null || _c === void 0 ? void 0 : _c.paired()) !== null && _d !== void 0 ? _d : null,
            setupUri: (_g = (_f = (_e = this.bridgeService) === null || _e === void 0 ? void 0 : _e.bridge) === null || _f === void 0 ? void 0 : _f.setupURI()) !== null && _g !== void 0 ? _g : null,
        });
    }
    shutdown() {
        this.bridgeService.teardown();
    }
}
exports.ChildBridgeFork = ChildBridgeFork;
/**
 * Start Self
 */
const childPluginFork = new ChildBridgeFork();
/**
 * Handle incoming IPC messages from the parent Homebridge process
 */
process.on("message", (message) => {
    if (typeof message !== "object" || !message.id) {
        return;
    }
    switch (message.id) {
        case "load" /* LOAD */: {
            childPluginFork.loadPlugin(message.data);
            break;
        }
        case "start" /* START */: {
            childPluginFork.startBridge();
            break;
        }
        case "portAllocated" /* PORT_ALLOCATED */: {
            childPluginFork.handleExternalResponse(message.data);
            break;
        }
    }
});
/**
 * Handle the sigterm shutdown signals
 */
let shuttingDown = false;
const signalHandler = (signal, signalNum) => {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;
    logger_1.Logger.internal.info("Got %s, shutting down child bridge process...", signal);
    try {
        childPluginFork.shutdown();
    }
    catch (e) {
        // do nothing
    }
    setTimeout(() => process.exit(128 + signalNum), 5000);
};
process.on("SIGINT", signalHandler.bind(undefined, "SIGINT", 2));
process.on("SIGTERM", signalHandler.bind(undefined, "SIGTERM", 15));
/**
 * Ensure orphaned processes are cleaned up
 */
setInterval(() => {
    if (!process.connected) {
        logger_1.Logger.internal.info("Parent process not connected, terminating process...");
        process.exit(1);
    }
}, 5000);
//# sourceMappingURL=childBridgeFork.js.map