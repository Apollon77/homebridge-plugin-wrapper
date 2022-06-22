"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
const path_1 = __importDefault(require("path"));
const assert_1 = __importDefault(require("assert"));
const url_1 = require("url");
const semver_1 = require("semver");
const version_1 = __importDefault(require("./version"));
const logger_1 = require("./logger");
const pluginManager_1 = require("./pluginManager");
const log = logger_1.Logger.internal;
// Workaround for https://github.com/microsoft/TypeScript/issues/43329
const _importDynamic = new Function("modulePath", "return import(modulePath)");
/**
 * Represents a loaded Homebridge plugin.
 */
class Plugin {
    constructor(name, path, packageJSON, scope) {
        this.disabled = false; // mark the plugin as disabled
        this.registeredAccessories = new Map();
        this.registeredPlatforms = new Map();
        this.activeDynamicPlatforms = new Map();
        this.pluginName = name;
        this.scope = scope;
        this.pluginPath = path;
        this.version = packageJSON.version || "0.0.0";
        this.main = "";
        // figure out the main module
        // exports is available - https://nodejs.org/dist/latest-v14.x/docs/api/packages.html#packages_package_entry_points
        if (packageJSON.exports) {
            // main entrypoint - https://nodejs.org/dist/latest-v14.x/docs/api/packages.html#packages_main_entry_point_export
            if (typeof packageJSON.exports === "string") {
                this.main = packageJSON.exports;
            }
            else { // subpath export - https://nodejs.org/dist/latest-v14.x/docs/api/packages.html#packages_subpath_exports
                // conditional exports - https://nodejs.org/dist/latest-v14.x/docs/api/packages.html#packages_conditional_exports
                const exports = packageJSON.exports.import || packageJSON.exports.require || packageJSON.exports.node || packageJSON.exports.default || packageJSON.exports["."];
                // check if conditional export is nested
                if (typeof exports !== "string") {
                    if (exports.import) {
                        this.main = exports.import;
                    }
                    else {
                        this.main = exports.require || exports.node || exports.default;
                    }
                }
                else {
                    this.main = exports;
                }
            }
        }
        // exports search was not successful, fallback to package.main, using index.js as fallback
        if (!this.main) {
            this.main = packageJSON.main || "./index.js";
        }
        // check if it is a ESM module
        this.isESM = this.main.endsWith(".mjs") || (this.main.endsWith(".js") && packageJSON.type === "module");
        // very temporary fix for first wave of plugins
        if (packageJSON.peerDependencies && (!packageJSON.engines || !packageJSON.engines.homebridge)) {
            packageJSON.engines = packageJSON.engines || {};
            packageJSON.engines.homebridge = packageJSON.peerDependencies.homebridge;
        }
        this.loadContext = {
            engines: packageJSON.engines,
            dependencies: packageJSON.dependencies,
        };
    }
    getPluginIdentifier() {
        return (this.scope ? this.scope + "/" : "") + this.pluginName;
    }
    getPluginPath() {
        return this.pluginPath;
    }
    registerAccessory(name, constructor) {
        if (this.registeredAccessories.has(name)) {
            throw new Error(`Plugin '${this.getPluginIdentifier()}' tried to register an accessory '${name}' which has already been registered!`);
        }
        if (!this.disabled) {
            log.info("Registering accessory '%s'", this.getPluginIdentifier() + "." + name);
        }
        this.registeredAccessories.set(name, constructor);
    }
    registerPlatform(name, constructor) {
        if (this.registeredPlatforms.has(name)) {
            throw new Error(`Plugin '${this.getPluginIdentifier()}' tried to register a platform '${name}' which has already been registered!`);
        }
        if (!this.disabled) {
            log.info("Registering platform '%s'", this.getPluginIdentifier() + "." + name);
        }
        this.registeredPlatforms.set(name, constructor);
    }
    getAccessoryConstructor(accessoryIdentifier) {
        const name = pluginManager_1.PluginManager.getAccessoryName(accessoryIdentifier);
        const constructor = this.registeredAccessories.get(name);
        if (!constructor) {
            throw new Error(`The requested accessory '${name}' was not registered by the plugin '${this.getPluginIdentifier()}'.`);
        }
        return constructor;
    }
    getPlatformConstructor(platformIdentifier) {
        const name = pluginManager_1.PluginManager.getPlatformName(platformIdentifier);
        const constructor = this.registeredPlatforms.get(name);
        if (!constructor) {
            throw new Error(`The requested platform '${name}' was not registered by the plugin '${this.getPluginIdentifier()}'.`);
        }
        if (this.activeDynamicPlatforms.has(name)) { // if it's a dynamic platform check that it is not enabled multiple times
            log.error("The dynamic platform " + name + " from the plugin " + this.getPluginIdentifier() + " seems to be configured " +
                "multiple times in your config.json. This behaviour was deprecated in homebridge v1.0.0 and will be removed in v2.0.0!");
        }
        return constructor;
    }
    assignDynamicPlatform(platformIdentifier, platformPlugin) {
        const name = pluginManager_1.PluginManager.getPlatformName(platformIdentifier);
        let platforms = this.activeDynamicPlatforms.get(name);
        if (!platforms) {
            platforms = [];
            this.activeDynamicPlatforms.set(name, platforms);
        }
        // the last platform published should be at the first position for easy access
        // we just try to mimic pre 1.0.0 behavior
        platforms.unshift(platformPlugin);
    }
    getActiveDynamicPlatform(platformName) {
        const platforms = this.activeDynamicPlatforms.get(platformName);
        // we always use the last registered
        return platforms && platforms[0];
    }
    async load() {
        const context = this.loadContext;
        (0, assert_1.default)(context, "Reached illegal state. Plugin state is undefined!");
        this.loadContext = undefined; // free up memory
        // pluck out the HomeBridge version requirement
        if (!context.engines || !context.engines.homebridge) {
            throw new Error(`Plugin ${this.pluginPath} does not contain the 'homebridge' package in 'engines'.`);
        }
        const versionRequired = context.engines.homebridge;
        const nodeVersionRequired = context.engines.node;
        // make sure the version is satisfied by the currently running version of HomeBridge
        if (!(0, semver_1.satisfies)((0, version_1.default)(), versionRequired, { includePrerelease: true })) {
            // TODO - change this back to an error
            log.error(`The plugin "${this.pluginName}" requires a Homebridge version of ${versionRequired} which does \
not satisfy the current Homebridge version of ${(0, version_1.default)()}. You may need to update this plugin (or Homebridge) to a newer version. \
You may face unexpected issues or stability problems running this plugin.`);
        }
        // make sure the version is satisfied by the currently running version of Node
        if (nodeVersionRequired && !(0, semver_1.satisfies)(process.version, nodeVersionRequired)) {
            log.warn(`The plugin "${this.pluginName}" requires Node.js version of ${nodeVersionRequired} which does \
not satisfy the current Node.js version of ${process.version}. You may need to upgrade your installation of Node.js - see https://homebridge.io/w/JTKEF`);
        }
        const dependencies = context.dependencies || {};
        if (dependencies.homebridge || dependencies["hap-nodejs"]) {
            log.error(`The plugin "${this.pluginName}" defines 'homebridge' and/or 'hap-nodejs' in their 'dependencies' section, \
meaning they carry an additional copy of homebridge and hap-nodejs. This not only wastes disk space, but also can cause \
major incompatibility issues and thus is considered bad practice. Please inform the developer to update their plugin!`);
        }
        const mainPath = path_1.default.join(this.pluginPath, this.main);
        // try to require() it and grab the exported initialization hook
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        // pathToFileURL(specifier).href to turn a path into a "file url"
        // see https://github.com/nodejs/node/issues/31710
        const pluginModules = this.isESM ? await _importDynamic((0, url_1.pathToFileURL)(mainPath).href) : require(mainPath);
        if (typeof pluginModules === "function") {
            this.pluginInitializer = pluginModules;
        }
        else if (pluginModules && typeof pluginModules.default === "function") {
            this.pluginInitializer = pluginModules.default;
        }
        else {
            throw new Error(`Plugin ${this.pluginPath} does not export a initializer function from main.`);
        }
    }
    initialize(api) {
        if (!this.pluginInitializer) {
            throw new Error("Tried to initialize a plugin which hasn't been loaded yet!");
        }
        return this.pluginInitializer(api);
    }
}
exports.Plugin = Plugin;
//# sourceMappingURL=plugin.js.map