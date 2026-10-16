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
var plugin_exports = {};
__export(plugin_exports, {
  Plugin: () => Plugin
});
module.exports = __toCommonJS(plugin_exports);
var import_node_assert = __toESM(require("node:assert"), 1);
var import_node_path = require("node:path");
var import_node_process = __toESM(require("node:process"), 1);
var import_node_url = require("node:url");
var import_semver = require("semver");
var import_logger = require("./logger.js");
var import_pluginManager = require("./pluginManager.js");
var import_version = __toESM(require("./version.js"));
const log = import_logger.Logger.internal;
class Plugin {
  pluginName;
  scope;
  // npm package scope
  pluginPath;
  // like "/usr/local/lib/node_modules/homebridge-lockitron"
  disabled = false;
  // mark the plugin as disabled
  // ------------------ package.json content ------------------
  version;
  main;
  loadContext;
  // ----------------------------------------------------------
  pluginInitializer;
  // default exported function from the plugin that initializes it
  registeredAccessories = /* @__PURE__ */ new Map();
  registeredPlatforms = /* @__PURE__ */ new Map();
  activeDynamicPlatforms = /* @__PURE__ */ new Map();
  constructor(name, path, packageJSON, scope) {
    this.pluginName = name;
    this.scope = scope;
    this.pluginPath = path;
    this.version = packageJSON.version || "0.0.0";
    this.main = "";
    if (packageJSON.exports) {
      if (typeof packageJSON.exports === "string") {
        this.main = packageJSON.exports;
      } else {
        const exports2 = packageJSON.exports.import || packageJSON.exports.require || packageJSON.exports.node || packageJSON.exports.default || packageJSON.exports["."];
        if (typeof exports2 !== "string") {
          if (exports2.import) {
            this.main = exports2.import;
          } else {
            this.main = exports2.require || exports2.node || exports2.default;
          }
        } else {
          this.main = exports2;
        }
      }
    }
    if (!this.main) {
      this.main = packageJSON.main || "./index.js";
    }
    if (packageJSON.peerDependencies && (!packageJSON.engines || !packageJSON.engines.homebridge)) {
      packageJSON.engines = packageJSON.engines || {};
      packageJSON.engines.homebridge = packageJSON.peerDependencies.homebridge;
    }
    this.loadContext = {
      engines: packageJSON.engines,
      dependencies: packageJSON.dependencies
    };
  }
  getPluginIdentifier() {
    return (this.scope ? `${this.scope}/` : "") + this.pluginName;
  }
  getPluginPath() {
    return this.pluginPath;
  }
  registerAccessory(name, constructor) {
    if (this.registeredAccessories.has(name)) {
      throw new Error(`Plugin '${this.getPluginIdentifier()}' tried to register an accessory '${name}' which has already been registered!`);
    }
    if (!this.disabled) {
      log.info("Registering accessory '%s'", `${this.getPluginIdentifier()}.${name}`);
    }
    this.registeredAccessories.set(name, constructor);
  }
  registerPlatform(name, constructor) {
    if (this.registeredPlatforms.has(name)) {
      throw new Error(`Plugin '${this.getPluginIdentifier()}' tried to register a platform '${name}' which has already been registered!`);
    }
    if (!this.disabled) {
      log.info("Registering platform '%s'", `${this.getPluginIdentifier()}.${name}`);
    }
    this.registeredPlatforms.set(name, constructor);
  }
  getAccessoryConstructor(accessoryIdentifier) {
    const name = import_pluginManager.PluginManager.getAccessoryName(accessoryIdentifier);
    const constructor = this.registeredAccessories.get(name);
    if (!constructor) {
      throw new Error(`The requested accessory '${name}' was not registered by the plugin '${this.getPluginIdentifier()}'.`);
    }
    return constructor;
  }
  getPlatformConstructor(platformIdentifier) {
    const name = import_pluginManager.PluginManager.getPlatformName(platformIdentifier);
    const constructor = this.registeredPlatforms.get(name);
    if (!constructor) {
      throw new Error(`The requested platform '${name}' was not registered by the plugin '${this.getPluginIdentifier()}'.`);
    }
    if (this.activeDynamicPlatforms.has(name)) {
      throw new Error(`The dynamic platform ${name} from the plugin ${this.getPluginIdentifier()} is configured multiple times in your config.json.`);
    }
    return constructor;
  }
  assignDynamicPlatform(platformIdentifier, platformPlugin) {
    const name = import_pluginManager.PluginManager.getPlatformName(platformIdentifier);
    let platforms = this.activeDynamicPlatforms.get(name);
    if (!platforms) {
      platforms = [];
      this.activeDynamicPlatforms.set(name, platforms);
    }
    platforms.unshift(platformPlugin);
  }
  getActiveDynamicPlatform(platformName) {
    const platforms = this.activeDynamicPlatforms.get(platformName);
    return platforms && platforms[0];
  }
  async load() {
    const context = this.loadContext;
    (0, import_node_assert.default)(context, "Reached illegal state. Plugin state is undefined!");
    this.loadContext = void 0;
    if (!context.engines || !context.engines.homebridge) {
      throw new Error(`Plugin ${this.pluginPath} does not contain the 'homebridge' package in 'engines'.`);
    }
    const versionRequired = context.engines.homebridge;
    const nodeVersionRequired = context.engines.node;
    if (!(0, import_semver.satisfies)((0, import_version.default)(), versionRequired, { includePrerelease: true })) {
      log.warn(`The plugin "${this.pluginName}" requires a Homebridge version of ${versionRequired} which does not satisfy the current Homebridge version of v${(0, import_version.default)()}. You may need to update this plugin (or Homebridge) to a newer version. You may face unexpected issues or stability problems running this plugin.`);
    }
    if (nodeVersionRequired && !(0, import_semver.satisfies)(import_node_process.default.version, nodeVersionRequired)) {
      log.warn(`The plugin "${this.pluginName}" requires a Node.js version of ${nodeVersionRequired} which does not satisfy the current Node.js version of ${import_node_process.default.version}. You may need to upgrade your installation of Node.js - see https://homebridge.io/w/JTKEF`);
    }
    const dependencies = context.dependencies || {};
    if (dependencies.homebridge || dependencies["hap-nodejs"] || dependencies["@homebridge/hap-nodejs"]) {
      log.error(`The plugin "${this.pluginName}" defines 'homebridge' and/or 'hap-nodejs' in their 'dependencies' section, meaning they carry an additional copy of homebridge and hap-nodejs. This not only wastes disk space, but also can cause major incompatibility issues and thus is considered bad practice. Please inform the developer to update their plugin!`);
    }
    const mainPath = (0, import_node_path.join)(this.pluginPath, this.main);
    const pluginModule = await import((0, import_node_url.pathToFileURL)(mainPath).href);
    const pluginModules = pluginModule.default;
    if (typeof pluginModules === "function") {
      this.pluginInitializer = pluginModules;
    } else if (pluginModules && typeof pluginModules.default === "function") {
      this.pluginInitializer = pluginModules.default;
    } else {
      const exportedKeys = pluginModule && typeof pluginModule === "object" ? Object.keys(pluginModule).filter((k) => k !== "default").slice(0, 10) : [];
      const defaultKeys = pluginModules && typeof pluginModules === "object" ? Object.keys(pluginModules).slice(0, 10) : [];
      const defaultKeysStr = defaultKeys.length > 0 ? ` with keys [${defaultKeys.join(", ")}]` : "";
      const exportedKeysStr = exportedKeys.length > 0 ? `; named exports: [${exportedKeys.join(", ")}]` : "";
      throw new Error(`Plugin ${this.pluginPath} does not export an initializer function from ${this.main}. Found default export of type '${typeof pluginModules}'${defaultKeysStr}${exportedKeysStr}. The plugin must default-export a function that takes the homebridge api object.`);
    }
  }
  initialize(api) {
    if (!this.pluginInitializer) {
      throw new Error("Tried to initialize a plugin which hasn't been loaded yet!");
    }
    return this.pluginInitializer(api);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Plugin
});
