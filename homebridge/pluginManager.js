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
var pluginManager_exports = {};
__export(pluginManager_exports, {
  PluginManager: () => PluginManager
});
module.exports = __toCommonJS(pluginManager_exports);
var import_node_child_process = require("node:child_process");
var import_node_fs = require("node:fs");
var import_node_module = require("node:module");
var import_node_path = require("node:path");
var import_node_process = __toESM(require("node:process"), 1);
var import_logger = require("./logger.js");
var import_plugin = require("./plugin.js");
const log = import_logger.Logger.internal;
const require2 = (0, import_node_module.createRequire)(__importMetaUrl);
const paths = [...require2.main?.paths ?? [], ...require2.resolve.paths("") ?? []];
class PluginManager {
  // name must be prefixed with 'homebridge-' or '@scope/homebridge-'
  static PLUGIN_IDENTIFIER_PATTERN = /^((@[\w-]+(\.[\w-]+)*)\/)?(homebridge-[\w-]+)$/;
  api;
  searchPaths = /* @__PURE__ */ new Set();
  // unique set of search paths we will use to discover installed plugins
  strictPluginResolution = false;
  activePlugins;
  disabledPlugins;
  plugins = /* @__PURE__ */ new Map();
  // we have some plugins which simply pass a wrong or misspelled plugin name to the api calls, this translation tries to mitigate this
  pluginIdentifierTranslation = /* @__PURE__ */ new Map();
  accessoryToPluginMap = /* @__PURE__ */ new Map();
  platformToPluginMap = /* @__PURE__ */ new Map();
  currentInitializingPlugin;
  // used to match registering plugins, see handleRegisterAccessory and handleRegisterPlatform
  constructor(api, options) {
    this.api = api;
    if (options) {
      if (options.customPluginPath) {
        this.searchPaths.add((0, import_node_path.resolve)(import_node_process.default.cwd(), options.customPluginPath));
      }
      this.strictPluginResolution = options.strictPluginResolution || false;
      this.activePlugins = PluginManager.coerceIdentifierList(options.activePlugins, "plugins");
      this.disabledPlugins = PluginManager.coerceIdentifierList(options.disabledPlugins, "disabledPlugins");
    }
    this.api.on("registerAccessory", this.handleRegisterAccessory.bind(this));
    this.api.on("registerPlatform", this.handleRegisterPlatform.bind(this));
  }
  /**
   * Coerce an options value to a `PluginIdentifier[]` or undefined.
   * Used for `activePlugins` and `disabledPlugins`: a stray string would
   * otherwise pass through and turn later `.includes(pluginIdentifier)`
   * calls into substring matches. Emits a warning so the typo isn't
   * silently swallowed into the "load everything" fallback.
   *
   * Exposed so tests can exercise the warning path without standing up a
   * full PluginManager.
   */
  static coerceIdentifierList(value, fieldName) {
    if (value === void 0 || value === null) {
      return void 0;
    }
    if (Array.isArray(value)) {
      return value;
    }
    log.warn(`config.${fieldName} must be an array of plugin identifiers; got ${typeof value} \u2014 ignoring this setting.`);
    return void 0;
  }
  static isQualifiedPluginIdentifier(identifier) {
    return PluginManager.PLUGIN_IDENTIFIER_PATTERN.test(identifier);
  }
  static extractPluginName(name) {
    const match = name.match(PluginManager.PLUGIN_IDENTIFIER_PATTERN);
    if (!match) {
      throw new Error(`Cannot extract plugin name from invalid identifier: '${name}'`);
    }
    return match[4];
  }
  static extractPluginScope(name) {
    const match = name.match(PluginManager.PLUGIN_IDENTIFIER_PATTERN);
    if (!match) {
      throw new Error(`Cannot extract plugin scope from invalid identifier: '${name}'`);
    }
    return match[2];
  }
  static getAccessoryName(identifier) {
    if (!identifier.includes(".")) {
      return identifier;
    }
    return identifier.split(".")[1];
  }
  static getPlatformName(identifier) {
    if (!identifier.includes(".")) {
      return identifier;
    }
    return identifier.split(".")[1];
  }
  static getPluginIdentifier(identifier) {
    return identifier.split(".")[0];
  }
  async initializeInstalledPlugins() {
    log.info("---");
    this.loadInstalledPlugins();
    for (const [identifier, plugin] of this.plugins) {
      try {
        await plugin.load();
      } catch (error) {
        log.error("====================");
        log.error(`ERROR LOADING PLUGIN ${identifier}:`);
        log.error(error.stack);
        log.error("====================");
        this.plugins.delete(identifier);
        continue;
      }
      if (this.disabledPlugins && this.disabledPlugins.includes(plugin.getPluginIdentifier())) {
        plugin.disabled = true;
      }
      if (plugin.disabled) {
        log.warn(`Disabled plugin: ${identifier}@${plugin.version}`);
      } else {
        log.info(`Loaded plugin: ${identifier}@${plugin.version}`);
      }
      await this.initializePlugin(plugin, identifier);
      log.info("---");
    }
    this.currentInitializingPlugin = void 0;
  }
  async initializePlugin(plugin, identifier) {
    try {
      this.currentInitializingPlugin = plugin;
      await plugin.initialize(this.api);
    } catch (error) {
      log.error("====================");
      log.error(`ERROR INITIALIZING PLUGIN ${identifier}:`);
      log.error(error.stack);
      log.error("====================");
      this.plugins.delete(identifier);
    } finally {
      this.currentInitializingPlugin = void 0;
    }
  }
  handleRegisterAccessory(name, constructor, pluginIdentifier) {
    if (!this.currentInitializingPlugin) {
      throw new Error(`Unexpected accessory registration. Plugin ${pluginIdentifier ? `'${pluginIdentifier}' ` : ""}tried to register outside the initializer function!`);
    }
    if (pluginIdentifier && pluginIdentifier !== this.currentInitializingPlugin.getPluginIdentifier()) {
      log.info(`Plugin '${this.currentInitializingPlugin.getPluginIdentifier()}' tried to register with an incorrect plugin identifier: '${pluginIdentifier}'. Please report this to the developer!`);
      this.pluginIdentifierTranslation.set(pluginIdentifier, this.currentInitializingPlugin.getPluginIdentifier());
    }
    this.currentInitializingPlugin.registerAccessory(name, constructor);
    let plugins = this.accessoryToPluginMap.get(name);
    if (!plugins) {
      plugins = [];
      this.accessoryToPluginMap.set(name, plugins);
    }
    plugins.push(this.currentInitializingPlugin);
  }
  handleRegisterPlatform(name, constructor, pluginIdentifier) {
    if (!this.currentInitializingPlugin) {
      throw new Error(`Unexpected platform registration. Plugin ${pluginIdentifier ? `'${pluginIdentifier}' ` : ""}tried to register outside the initializer function!`);
    }
    if (pluginIdentifier && pluginIdentifier !== this.currentInitializingPlugin.getPluginIdentifier()) {
      log.debug(`Plugin '${this.currentInitializingPlugin.getPluginIdentifier()}' tried to register with an incorrect plugin identifier: '${pluginIdentifier}'. Please report this to the developer!`);
      this.pluginIdentifierTranslation.set(pluginIdentifier, this.currentInitializingPlugin.getPluginIdentifier());
    }
    this.currentInitializingPlugin.registerPlatform(name, constructor);
    let plugins = this.platformToPluginMap.get(name);
    if (!plugins) {
      plugins = [];
      this.platformToPluginMap.set(name, plugins);
    }
    plugins.push(this.currentInitializingPlugin);
  }
  getPluginForAccessory(accessoryIdentifier) {
    let plugin;
    if (!accessoryIdentifier.includes(".")) {
      let found = this.accessoryToPluginMap.get(accessoryIdentifier);
      if (!found) {
        throw new Error(`No plugin was found for the accessory "${accessoryIdentifier}" in your config.json. Please make sure the corresponding plugin is installed correctly.`);
      }
      if (found.length > 1) {
        const options = found.map((plugin2) => `${plugin2.getPluginIdentifier()}.${accessoryIdentifier}`).join(", ");
        found = found.filter((plugin2) => !plugin2.disabled);
        if (found.length !== 1) {
          throw new Error(`The requested accessory '${accessoryIdentifier}' has been registered multiple times. Please be more specific by writing one of: ${options}`);
        }
      }
      plugin = found[0];
      accessoryIdentifier = `${plugin.getPluginIdentifier()}.${accessoryIdentifier}`;
    } else {
      const pluginIdentifier = PluginManager.getPluginIdentifier(accessoryIdentifier);
      if (!this.hasPluginRegistered(pluginIdentifier)) {
        throw new Error(`The requested plugin '${pluginIdentifier}' was not registered.`);
      }
      plugin = this.getPlugin(pluginIdentifier);
    }
    return plugin;
  }
  getPluginForPlatform(platformIdentifier) {
    let plugin;
    if (!platformIdentifier.includes(".")) {
      let found = this.platformToPluginMap.get(platformIdentifier);
      if (!found) {
        throw new Error(`No plugin was found for the platform "${platformIdentifier}" in your config.json. Please make sure the corresponding plugin is installed correctly.`);
      }
      if (found.length > 1) {
        const options = found.map((plugin2) => `${plugin2.getPluginIdentifier()}.${platformIdentifier}`).join(", ");
        found = found.filter((plugin2) => !plugin2.disabled);
        if (found.length !== 1) {
          throw new Error(`The requested platform '${platformIdentifier}' has been registered multiple times. Please be more specific by writing one of: ${options}`);
        }
      }
      plugin = found[0];
      platformIdentifier = `${plugin.getPluginIdentifier()}.${platformIdentifier}`;
    } else {
      const pluginIdentifier = PluginManager.getPluginIdentifier(platformIdentifier);
      if (!this.hasPluginRegistered(pluginIdentifier)) {
        throw new Error(`The requested plugin '${pluginIdentifier}' was not registered.`);
      }
      plugin = this.getPlugin(pluginIdentifier);
    }
    return plugin;
  }
  hasPluginRegistered(pluginIdentifier) {
    return this.plugins.has(pluginIdentifier) || this.pluginIdentifierTranslation.has(pluginIdentifier);
  }
  getPlugin(pluginIdentifier) {
    const plugin = this.plugins.get(pluginIdentifier);
    if (plugin) {
      return plugin;
    } else {
      const translation = this.pluginIdentifierTranslation.get(pluginIdentifier);
      if (translation) {
        return this.plugins.get(translation);
      }
    }
    return void 0;
  }
  getPluginByActiveDynamicPlatform(platformName) {
    const found = (this.platformToPluginMap.get(platformName) || []).filter((plugin) => !!plugin.getActiveDynamicPlatform(platformName));
    if (found.length === 0) {
      return void 0;
    } else if (found.length > 1) {
      const plugins = found.map((plugin) => plugin.getPluginIdentifier()).join(", ");
      throw new Error(`'${platformName}' is an ambiguous platform name. It was registered by multiple plugins: ${plugins}`);
    } else {
      return found[0];
    }
  }
  /**
   * Gets all plugins installed on the local system
   */
  loadInstalledPlugins() {
    this.loadDefaultPaths();
    this.searchPaths.forEach((searchPath) => {
      if (!(0, import_node_fs.existsSync)(searchPath)) {
        return;
      }
      if ((0, import_node_fs.existsSync)((0, import_node_path.join)(searchPath, "package.json"))) {
        try {
          this.loadPlugin(searchPath);
        } catch (error) {
          log.warn(error.message);
        }
      } else {
        let relativePluginPaths = (0, import_node_fs.readdirSync)(searchPath).filter((relativePath) => {
          try {
            return (0, import_node_fs.statSync)((0, import_node_path.resolve)(searchPath, relativePath)).isDirectory();
          } catch (error) {
            log.debug(`Ignoring path ${(0, import_node_path.resolve)(searchPath, relativePath)} - ${error.message}`);
            return false;
          }
        });
        const scopeDirectories = relativePluginPaths.filter((path) => path.startsWith("@"));
        relativePluginPaths = relativePluginPaths.filter((path) => !path.startsWith("@"));
        for (const scopeDirectory of scopeDirectories) {
          const absolutePath = (0, import_node_path.join)(searchPath, scopeDirectory);
          (0, import_node_fs.readdirSync)(absolutePath).filter((name) => PluginManager.isQualifiedPluginIdentifier(name)).filter((name) => {
            try {
              return (0, import_node_fs.statSync)((0, import_node_path.resolve)(absolutePath, name)).isDirectory();
            } catch (error) {
              log.debug(`Ignoring path ${(0, import_node_path.resolve)(absolutePath, name)} - ${error.message}`);
              return false;
            }
          }).forEach((name) => relativePluginPaths.push(`${scopeDirectory}/${name}`));
        }
        relativePluginPaths.filter((pluginIdentifier) => {
          return PluginManager.isQualifiedPluginIdentifier(pluginIdentifier) && (!this.activePlugins || this.activePlugins.includes(pluginIdentifier));
        }).forEach((pluginIdentifier) => {
          try {
            const absolutePath = (0, import_node_path.resolve)(searchPath, pluginIdentifier);
            this.loadPlugin(absolutePath);
          } catch (error) {
            log.warn(error.message);
          }
        });
      }
    });
    if (this.plugins.size === 0) {
      log.warn("No plugins found.");
    }
  }
  loadPlugin(absolutePath) {
    const packageJson = PluginManager.loadPackageJSON(absolutePath);
    const identifier = packageJson.name;
    const name = PluginManager.extractPluginName(identifier);
    const scope = PluginManager.extractPluginScope(identifier);
    const alreadyInstalled = this.plugins.get(identifier);
    if (alreadyInstalled) {
      throw new Error(`Warning: skipping plugin found at '${absolutePath}' since we already loaded the same plugin from '${alreadyInstalled.getPluginPath()}'.`);
    }
    const plugin = new import_plugin.Plugin(name, absolutePath, packageJson, scope);
    this.plugins.set(identifier, plugin);
    return plugin;
  }
  static loadPackageJSON(pluginPath) {
    const packageJsonPath = (0, import_node_path.join)(pluginPath, "package.json");
    let packageJson;
    if (!(0, import_node_fs.existsSync)(packageJsonPath)) {
      throw new Error(`Plugin ${pluginPath} does not contain a package.json.`);
    }
    try {
      packageJson = JSON.parse((0, import_node_fs.readFileSync)(packageJsonPath, { encoding: "utf8" }));
    } catch (error) {
      throw new Error(`Plugin ${pluginPath} contains an invalid package.json. Error: ${error}`);
    }
    if (!packageJson.name || !PluginManager.isQualifiedPluginIdentifier(packageJson.name)) {
      throw new Error(`Plugin ${pluginPath} does not have a package name that begins with 'homebridge-' or '@scope/homebridge-.`);
    }
    if (!packageJson.keywords || !packageJson.keywords.includes("homebridge-plugin")) {
      throw new Error(`Plugin ${pluginPath} package.json does not contain the keyword 'homebridge-plugin'.`);
    }
    return packageJson;
  }
  loadDefaultPaths() {
    if (this.strictPluginResolution) {
      if (this.searchPaths.size === 0) {
        this.addNpmPrefixToSearchPaths();
      }
      return;
    }
    if (paths) {
      paths.forEach((path) => this.searchPaths.add(path));
    }
    if (import_node_process.default.env.NODE_PATH) {
      import_node_process.default.env.NODE_PATH.split(import_node_path.delimiter).filter((path) => !!path).forEach((path) => this.searchPaths.add(path));
    } else {
      if (import_node_process.default.platform !== "win32") {
        this.searchPaths.add("/usr/local/lib/node_modules");
        this.searchPaths.add("/usr/lib/node_modules");
      }
      this.addNpmPrefixToSearchPaths();
    }
  }
  addNpmPrefixToSearchPaths() {
    if (import_node_process.default.platform === "win32") {
      this.searchPaths.add((0, import_node_path.join)(import_node_process.default.env.APPDATA, "npm/node_modules"));
    } else {
      this.searchPaths.add((0, import_node_child_process.execSync)('/bin/echo -n "$(npm -g prefix)/lib/node_modules"', {
        env: {
          ...import_node_process.default.env,
          npm_config_loglevel: "silent",
          npm_update_notifier: "false"
        }
      }).toString("utf8"));
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PluginManager
});
