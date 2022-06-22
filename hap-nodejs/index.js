"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.HAPLibraryVersion = exports.LegacyTypes = exports.uuid = exports.AccessoryLoader = void 0;
var tslib_1 = require("tslib");
require("source-map-support/register"); // registering node-source-map-support for typescript stack traces
require("./lib/definitions"); // must be loaded before Characteristic and Service class
var accessoryLoader = (0, tslib_1.__importStar)(require("./lib/AccessoryLoader"));
var uuidFunctions = (0, tslib_1.__importStar)(require("./lib/util/uuid"));
var legacyTypes = (0, tslib_1.__importStar)(require("./accessories/types"));
var HAPStorage_1 = require("./lib/model/HAPStorage");
var debug_1 = (0, tslib_1.__importDefault)(require("debug"));
exports.AccessoryLoader = accessoryLoader;
exports.uuid = uuidFunctions;
(0, tslib_1.__exportStar)(require("./lib/model/HAPStorage"), exports);
(0, tslib_1.__exportStar)(require("./lib/Accessory"), exports);
(0, tslib_1.__exportStar)(require("./lib/Bridge"), exports);
(0, tslib_1.__exportStar)(require("./lib/Service"), exports);
(0, tslib_1.__exportStar)(require("./lib/Characteristic"), exports);
(0, tslib_1.__exportStar)(require("./lib/AccessoryLoader"), exports);
(0, tslib_1.__exportStar)(require("./lib/camera"), exports);
(0, tslib_1.__exportStar)(require("./lib/tv/AccessControlManagement"), exports);
(0, tslib_1.__exportStar)(require("./lib/HAPServer"), exports);
(0, tslib_1.__exportStar)(require("./lib/datastream"), exports);
(0, tslib_1.__exportStar)(require("./lib/controller"), exports);
(0, tslib_1.__exportStar)(require("./lib/util/clone"), exports);
(0, tslib_1.__exportStar)(require("./lib/util/once"), exports);
(0, tslib_1.__exportStar)(require("./lib/util/tlv"), exports);
(0, tslib_1.__exportStar)(require("./lib/util/hapStatusError"), exports);
(0, tslib_1.__exportStar)(require("./lib/util/color-utils"), exports);
(0, tslib_1.__exportStar)(require("./lib/util/time"), exports);
(0, tslib_1.__exportStar)(require("./types"), exports);
exports.LegacyTypes = legacyTypes;
var debug = (0, debug_1.default)("HAP-NodeJS:Advertiser");
/**
 * This method can be used to retrieve the current running library version of the HAP-NodeJS framework.
 * @returns The SemVer version string.
 */
function HAPLibraryVersion() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    var packageJson = require("../package.json");
    return packageJson.version;
}
exports.HAPLibraryVersion = HAPLibraryVersion;
function printInit() {
    debug("Initializing HAP-NodeJS v%s ...", HAPLibraryVersion());
}
printInit();
/**
 *
 * @param {string} storagePath
 * @deprecated the need to manually initialize the internal storage was removed. If you want to set a custom
 *  storage path location, please use {@link HAPStorage.setCustomStoragePath} directly.
 */
function init(storagePath) {
    console.log("DEPRECATED: The need to manually initialize HAP (by calling the init method) was removed. " +
        "If you want to set a custom storage path location, please ust HAPStorage.setCustomStoragePath directly. " +
        "This method will be removed in the next major update!");
    if (storagePath) {
        HAPStorage_1.HAPStorage.setCustomStoragePath(storagePath);
    }
}
exports.init = init;
//# sourceMappingURL=index.js.map