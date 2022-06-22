"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDirectory = exports.parseAccessoryJSON = exports.parseServiceJSON = exports.parseCharacteristicJSON = void 0;
var tslib_1 = require("tslib");
var debug_1 = (0, tslib_1.__importDefault)(require("debug"));
var fs_1 = (0, tslib_1.__importDefault)(require("fs"));
var path_1 = (0, tslib_1.__importDefault)(require("path"));
var Accessory_1 = require("./Accessory");
var Characteristic_1 = require("./Characteristic");
var Service_1 = require("./Service");
var uuid = (0, tslib_1.__importStar)(require("./util/uuid"));
var debug = (0, debug_1.default)("HAP-NodeJS:AccessoryLoader");
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
function parseCharacteristicJSON(json) {
    var characteristicUUID = json.cType;
    var characteristic = new Characteristic_1.Characteristic(json.manfDescription || characteristicUUID, characteristicUUID, {
        format: json.format,
        minValue: json.designedMinValue,
        maxValue: json.designedMaxValue,
        minStep: json.designedMinStep,
        unit: json.unit,
        perms: json.perms, // example: ["pw","pr","ev"]
    });
    // copy simple properties
    characteristic.value = json.initialValue;
    // @ts-expect-error: monkey-patch legacy "locals" property which used to exist.
    characteristic.locals = json.locals;
    var updateFunc = json.onUpdate; // optional function(value)
    var readFunc = json.onRead; // optional function(callback(value))
    var registerFunc = json.onRegister; // optional function
    if (updateFunc) {
        characteristic.on("set" /* SET */, function (value, callback) {
            updateFunc(value);
            callback && callback();
        });
    }
    if (readFunc) {
        characteristic.on("get" /* GET */, function (callback) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            readFunc(function (value) {
                callback(null, value); // old onRead callbacks don't use Error as first param
            });
        });
    }
    if (registerFunc) {
        registerFunc(characteristic);
    }
    return characteristic;
}
exports.parseCharacteristicJSON = parseCharacteristicJSON;
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
function parseServiceJSON(json) {
    var serviceUUID = json.sType;
    // build characteristics first, so we can extract the Name (if present)
    var characteristics = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json.characteristics.forEach(function (characteristicJSON) {
        var characteristic = parseCharacteristicJSON(characteristicJSON);
        characteristics.push(characteristic);
    });
    var displayName = null;
    // extract the "Name" characteristic to use for 'type' discrimination if necessary
    characteristics.forEach(function (characteristic) {
        if (characteristic.UUID === "00000023-0000-1000-8000-0026BB765291") { // Characteristic.Name.UUID
            displayName = characteristic.value;
        }
    });
    // Use UUID for "displayName" if necessary, as the JSON structures don't have a value for this
    var service = new Service_1.Service(displayName || serviceUUID, serviceUUID, "".concat(displayName));
    characteristics.forEach(function (characteristic) {
        if (characteristic.UUID !== "00000023-0000-1000-8000-0026BB765291") { // Characteristic.Name.UUID, already present in all Services
            service.addCharacteristic(characteristic);
        }
    });
    return service;
}
exports.parseServiceJSON = parseServiceJSON;
/**
 * Accepts object-literal JSON structures from previous versions of HAP-NodeJS and parses them into
 * newer-style structures of Accessory/Service/Characteristic objects.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
function parseAccessoryJSON(json) {
    // parse services first so we can extract the accessory name
    var services = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json.services.forEach(function (serviceJSON) {
        var service = parseServiceJSON(serviceJSON);
        services.push(service);
    });
    var displayName = json.displayName;
    services.forEach(function (service) {
        if (service.UUID === "0000003E-0000-1000-8000-0026BB765291") { // Service.AccessoryInformation.UUID
            service.characteristics.forEach(function (characteristic) {
                if (characteristic.UUID === "00000023-0000-1000-8000-0026BB765291") { // Characteristic.Name.UUID
                    displayName = characteristic.value;
                }
            });
        }
    });
    var accessory = new Accessory_1.Accessory(displayName, uuid.generate(displayName));
    // create custom properties for "username" and "pincode" for Core.js to find later (if using Core.js)
    // @ts-expect-error: Core/BridgeCore API
    accessory.username = json.username;
    // @ts-expect-error: Core/BridgeCore API
    accessory.pincode = json.pincode;
    // clear out the default services
    accessory.services.length = 0;
    // add services
    services.forEach(function (service) {
        accessory.addService(service);
    });
    return accessory;
}
exports.parseAccessoryJSON = parseAccessoryJSON;
/**
 * Loads all accessories from the given folder. Handles object-literal-style accessories, "accessory factories",
 * and new-API style modules.
 */
function loadDirectory(dir) {
    // exported accessory objects loaded from this dir
    var accessories = [];
    fs_1.default.readdirSync(dir).forEach(function (file) {
        var suffix = file.split("_").pop();
        // "Accessories" are modules that export a single accessory.
        if (suffix === "accessory.js" || suffix === "accessory.ts") {
            debug("Parsing accessory: %s", file);
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            var loadedAccessory = require(path_1.default.join(dir, file)).accessory;
            accessories.push(loadedAccessory);
        }
        else if (suffix === "accfactory.js" || suffix === "accfactory.ts") { // "Accessory Factories" are modules that export an array of accessories.
            debug("Parsing accessory factory: %s", file);
            // should return an array of objects { accessory: accessory-json }
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            var loadedAccessories = require(path_1.default.join(dir, file));
            accessories = accessories.concat(loadedAccessories);
        }
    });
    // now we need to coerce all accessory objects into instances of Accessory (some or all of them may
    // be object-literal JSON-style accessories)
    return accessories.map(function (accessory) {
        if (accessory === null || accessory === undefined) { //check if accessory is not empty
            console.log("Invalid accessory!");
            return false;
        }
        else {
            return (accessory instanceof Accessory_1.Accessory) ? accessory : parseAccessoryJSON(accessory);
        }
    }).filter(function (accessory) {
        return !!accessory;
    });
}
exports.loadDirectory = loadDirectory;
//# sourceMappingURL=AccessoryLoader.js.map