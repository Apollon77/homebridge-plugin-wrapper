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
require("source-map-support/register"); // registering node-source-map-support for typescript stack traces
const commander_1 = __importDefault(require("commander"));
const hap_nodejs_1 = require("hap-nodejs");
const version_1 = __importStar(require("./version"));
const user_1 = require("./user");
const logger_1 = require("./logger");
const server_1 = require("./server");
const semver_1 = require("semver");
const log = logger_1.Logger.internal;
const requiredNodeVersion = (0, version_1.getRequiredNodeVersion)();
if (requiredNodeVersion && !(0, semver_1.satisfies)(process.version, requiredNodeVersion)) {
    log.warn(`Homebridge requires Node.js version of ${requiredNodeVersion} which does \
not satisfy the current Node.js version of ${process.version}. You may need to upgrade your installation of Node.js - see https://homebridge.io/w/JTKEF`);
}
module.exports = function cli() {
    let insecureAccess = false;
    let hideQRCode = false;
    let keepOrphans = false;
    let customPluginPath = undefined;
    let strictPluginResolution = false;
    let noLogTimestamps = false;
    let debugModeEnabled = false;
    let forceColourLogging = false;
    let customStoragePath = undefined;
    let shuttingDown = false;
    commander_1.default
        .version((0, version_1.default)())
        .option("-C, --color", "force color in logging", () => forceColourLogging = true)
        .option("-D, --debug", "turn on debug level logging", () => debugModeEnabled = true)
        .option("-I, --insecure", "allow unauthenticated requests (for easier hacking)", () => insecureAccess = true)
        .option("-P, --plugin-path [path]", "look for plugins installed at [path] as well as the default locations ([path] can also point to a single plugin)", path => customPluginPath = path)
        .option("-Q, --no-qrcode", "do not issue QRcode in logging", () => hideQRCode = true)
        .option("-R, --remove-orphans", "remove cached accessories for which plugin is not loaded (deprecated)", () => {
        console.warn("The cli option '-R' or '--remove-orphans' is deprecated and has no effect anymore. " +
            "Removing orphans is now the default behavior and can be turned off by supplying '-K' or '--keep-orphans'.");
    })
        .option("-K, --keep-orphans", "keep cached accessories for which the associated plugin is not loaded", () => keepOrphans = true)
        .option("-T, --no-timestamp", "do not issue timestamps in logging", () => noLogTimestamps = true)
        .option("-U, --user-storage-path [path]", "look for homebridge user files at [path] instead of the default location (~/.homebridge)", path => customStoragePath = path)
        .option("--strict-plugin-resolution", "only load plugins from the --plugin-path if set, otherwise from the primary global node_modules", () => strictPluginResolution = true)
        .parse(process.argv);
    if (noLogTimestamps) {
        logger_1.Logger.setTimestampEnabled(false);
    }
    if (debugModeEnabled) {
        logger_1.Logger.setDebugEnabled(true);
    }
    if (forceColourLogging) {
        logger_1.Logger.forceColor();
    }
    if (customStoragePath) {
        user_1.User.setStoragePath(customStoragePath);
    }
    // Initialize HAP-NodeJS with a custom persist directory
    hap_nodejs_1.HAPStorage.setCustomStoragePath(user_1.User.persistPath());
    const options = {
        keepOrphanedCachedAccessories: keepOrphans,
        insecureAccess: insecureAccess,
        hideQRCode: hideQRCode,
        customPluginPath: customPluginPath,
        noLogTimestamps: noLogTimestamps,
        debugModeEnabled: debugModeEnabled,
        forceColourLogging: forceColourLogging,
        customStoragePath: customStoragePath,
        strictPluginResolution: strictPluginResolution,
    };
    const server = new server_1.Server(options);
    const signalHandler = (signal, signalNum) => {
        if (shuttingDown) {
            return;
        }
        shuttingDown = true;
        log.info("Got %s, shutting down Homebridge...", signal);
        setTimeout(() => process.exit(128 + signalNum), 5000);
        server.teardown();
    };
    process.on("SIGINT", signalHandler.bind(undefined, "SIGINT", 2));
    process.on("SIGTERM", signalHandler.bind(undefined, "SIGTERM", 15));
    const errorHandler = (error) => {
        if (error.stack) {
            log.error(error.stack);
        }
        if (!shuttingDown) {
            process.kill(process.pid, "SIGTERM");
        }
    };
    process.on("uncaughtException", errorHandler);
    server.start().catch(errorHandler);
};
//# sourceMappingURL=cli.js.map