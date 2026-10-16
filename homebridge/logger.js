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
var logger_exports = {};
__export(logger_exports, {
  LogLevel: () => LogLevel,
  Logger: () => Logger,
  getLogPrefix: () => getLogPrefix
});
module.exports = __toCommonJS(logger_exports);
var import_node_util = __toESM(require("node:util"), 1);
var import_chalk = __toESM(require("chalk"), 1);
var LogLevel;
(function(LogLevel2) {
  LogLevel2["INFO"] = "info";
  LogLevel2["SUCCESS"] = "success";
  LogLevel2["WARN"] = "warn";
  LogLevel2["ERROR"] = "error";
  LogLevel2["DEBUG"] = "debug";
})(LogLevel || (LogLevel = {}));
class Logger {
  static internal = new Logger();
  static loggerCache = /* @__PURE__ */ new Map();
  // global cache of logger instances by plugin name
  static debugEnabled = false;
  static timestampEnabled = true;
  prefix;
  constructor(prefix) {
    this.prefix = prefix;
  }
  /**
   * Creates a new Logging device with a specified prefix.
   *
   * @param prefix {string} - the prefix of the logger
   */
  static withPrefix(prefix) {
    const loggerStuff = Logger.loggerCache.get(prefix);
    if (loggerStuff) {
      return loggerStuff;
    } else {
      const logger = new Logger(prefix);
      const log = logger.info.bind(logger);
      log.info = logger.info;
      log.success = logger.success;
      log.warn = logger.warn;
      log.error = logger.error;
      log.debug = logger.debug;
      log.log = logger.log;
      log.prefix = logger.prefix;
      const logging = log;
      Logger.loggerCache.set(prefix, logging);
      return logging;
    }
  }
  /**
   * Turns on debug level logging. Off by default.
   *
   * @param enabled {boolean}
   */
  static setDebugEnabled(enabled = true) {
    Logger.debugEnabled = enabled;
  }
  /**
   * Turns on inclusion of timestamps in log messages. On by default.
   *
   * @param enabled {boolean}
   */
  static setTimestampEnabled(enabled = true) {
    Logger.timestampEnabled = enabled;
  }
  /**
   * Check if timestamps are enabled in log messages.
   *
   * @returns {boolean} true if timestamps are enabled
   */
  static isTimestampEnabled() {
    return Logger.timestampEnabled;
  }
  /**
   * Forces color in logging output, even if it seems like color is unsupported.
   */
  static forceColor() {
    import_chalk.default.level = 1;
  }
  info(message, ...parameters) {
    this.log("info", message, ...parameters);
  }
  success(message, ...parameters) {
    this.log("success", message, ...parameters);
  }
  warn(message, ...parameters) {
    this.log("warn", message, ...parameters);
  }
  error(message, ...parameters) {
    this.log("error", message, ...parameters);
  }
  debug(message, ...parameters) {
    this.log("debug", message, ...parameters);
  }
  log(level, message, ...parameters) {
    if (level === "debug" && !Logger.debugEnabled) {
      return;
    }
    message = import_node_util.default.format(message, ...parameters);
    let loggingFunction = console.log;
    switch (level) {
      case "success":
        message = import_chalk.default.green(message);
        break;
      case "warn":
        message = import_chalk.default.yellow(message);
        loggingFunction = console.error;
        break;
      case "error":
        message = import_chalk.default.red(message);
        loggingFunction = console.error;
        break;
      case "debug":
        message = import_chalk.default.gray(message);
        break;
    }
    if (this.prefix) {
      message = `${getLogPrefix(this.prefix)} ${message}`;
    }
    if (Logger.timestampEnabled) {
      const date = /* @__PURE__ */ new Date();
      message = import_chalk.default.white(`[${date.toLocaleString()}] `) + message;
    }
    loggingFunction(message);
  }
}
function getLogPrefix(prefix) {
  return import_chalk.default.cyan(`[${prefix}]`);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LogLevel,
  Logger,
  getLogPrefix
});
