"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.LegacyTypes = exports.uuid = exports.AccessoryLoader = void 0;
var tslib_1 = require("tslib");
require("source-map-support/register"); // registering node-source-map-support for typescript stack traces
require("./lib/definitions"); // must be loaded before Characteristic and Service class
var accessoryLoader = tslib_1.__importStar(require("./lib/AccessoryLoader"));
var uuidFunctions = tslib_1.__importStar(require("./lib/util/uuid"));
var legacyTypes = tslib_1.__importStar(require("./accessories/types"));
var HAPStorage_1 = require("./lib/model/HAPStorage");
exports.AccessoryLoader = accessoryLoader;
exports.uuid = uuidFunctions;
tslib_1.__exportStar(require("./lib/model/HAPStorage"), exports);
tslib_1.__exportStar(require("./lib/Accessory"), exports);
tslib_1.__exportStar(require("./lib/Bridge"), exports);
tslib_1.__exportStar(require("./lib/Service"), exports);
tslib_1.__exportStar(require("./lib/Characteristic"), exports);
tslib_1.__exportStar(require("./lib/AccessoryLoader"), exports);
tslib_1.__exportStar(require("./lib/camera"), exports);
tslib_1.__exportStar(require("./lib/tv/AccessControlManagement"), exports);
tslib_1.__exportStar(require("./lib/HAPServer"), exports);
tslib_1.__exportStar(require("./lib/datastream"), exports);
tslib_1.__exportStar(require("./lib/controller"), exports);
tslib_1.__exportStar(require("./lib/util/clone"), exports);
tslib_1.__exportStar(require("./lib/util/once"), exports);
tslib_1.__exportStar(require("./lib/util/tlv"), exports);
tslib_1.__exportStar(require("./lib/util/hapStatusError"), exports);
tslib_1.__exportStar(require("./lib/util/color-utils"), exports);
tslib_1.__exportStar(require("./lib/util/time"), exports);
tslib_1.__exportStar(require("./types"), exports);
exports.LegacyTypes = legacyTypes;
function printInit() {
    var packageJson = require("../package.json");
    console.log("Initializing HAP-NodeJS v" + packageJson.version + "...");
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