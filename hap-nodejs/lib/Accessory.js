"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Accessory = exports.AccessoryEventTypes = exports.MDNSAdvertiser = exports.CharacteristicWarningType = exports.Categories = void 0;
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var crypto_1 = tslib_1.__importDefault(require("crypto"));
var debug_1 = tslib_1.__importDefault(require("debug"));
var events_1 = require("events");
var net_1 = tslib_1.__importDefault(require("net"));
var Advertiser_1 = require("./Advertiser");
// noinspection JSDeprecatedSymbols
var camera_1 = require("./camera");
var Characteristic_1 = require("./Characteristic");
var controller_1 = require("./controller");
var HAPServer_1 = require("./HAPServer");
var AccessoryInfo_1 = require("./model/AccessoryInfo");
var ControllerStorage_1 = require("./model/ControllerStorage");
var IdentifierCache_1 = require("./model/IdentifierCache");
var Service_1 = require("./Service");
var clone_1 = require("./util/clone");
var request_util_1 = require("./util/request-util");
var uuid = tslib_1.__importStar(require("./util/uuid"));
var uuid_1 = require("./util/uuid");
var debug = debug_1.default('HAP-NodeJS:Accessory');
var MAX_ACCESSORIES = 1000000; // Maximum number of bridged accessories per bridge.
var MAX_SERVICES = 1000000;
// Known category values. Category is a hint to iOS clients about what "type" of Accessory this represents, for UI only.
var Categories;
(function (Categories) {
    // noinspection JSUnusedGlobalSymbols
    Categories[Categories["OTHER"] = 1] = "OTHER";
    Categories[Categories["BRIDGE"] = 2] = "BRIDGE";
    Categories[Categories["FAN"] = 3] = "FAN";
    Categories[Categories["GARAGE_DOOR_OPENER"] = 4] = "GARAGE_DOOR_OPENER";
    Categories[Categories["LIGHTBULB"] = 5] = "LIGHTBULB";
    Categories[Categories["DOOR_LOCK"] = 6] = "DOOR_LOCK";
    Categories[Categories["OUTLET"] = 7] = "OUTLET";
    Categories[Categories["SWITCH"] = 8] = "SWITCH";
    Categories[Categories["THERMOSTAT"] = 9] = "THERMOSTAT";
    Categories[Categories["SENSOR"] = 10] = "SENSOR";
    Categories[Categories["ALARM_SYSTEM"] = 11] = "ALARM_SYSTEM";
    Categories[Categories["SECURITY_SYSTEM"] = 11] = "SECURITY_SYSTEM";
    Categories[Categories["DOOR"] = 12] = "DOOR";
    Categories[Categories["WINDOW"] = 13] = "WINDOW";
    Categories[Categories["WINDOW_COVERING"] = 14] = "WINDOW_COVERING";
    Categories[Categories["PROGRAMMABLE_SWITCH"] = 15] = "PROGRAMMABLE_SWITCH";
    Categories[Categories["RANGE_EXTENDER"] = 16] = "RANGE_EXTENDER";
    Categories[Categories["CAMERA"] = 17] = "CAMERA";
    Categories[Categories["IP_CAMERA"] = 17] = "IP_CAMERA";
    Categories[Categories["VIDEO_DOORBELL"] = 18] = "VIDEO_DOORBELL";
    Categories[Categories["AIR_PURIFIER"] = 19] = "AIR_PURIFIER";
    Categories[Categories["AIR_HEATER"] = 20] = "AIR_HEATER";
    Categories[Categories["AIR_CONDITIONER"] = 21] = "AIR_CONDITIONER";
    Categories[Categories["AIR_HUMIDIFIER"] = 22] = "AIR_HUMIDIFIER";
    Categories[Categories["AIR_DEHUMIDIFIER"] = 23] = "AIR_DEHUMIDIFIER";
    Categories[Categories["APPLE_TV"] = 24] = "APPLE_TV";
    Categories[Categories["HOMEPOD"] = 25] = "HOMEPOD";
    Categories[Categories["SPEAKER"] = 26] = "SPEAKER";
    Categories[Categories["AIRPORT"] = 27] = "AIRPORT";
    Categories[Categories["SPRINKLER"] = 28] = "SPRINKLER";
    Categories[Categories["FAUCET"] = 29] = "FAUCET";
    Categories[Categories["SHOWER_HEAD"] = 30] = "SHOWER_HEAD";
    Categories[Categories["TELEVISION"] = 31] = "TELEVISION";
    Categories[Categories["TARGET_CONTROLLER"] = 32] = "TARGET_CONTROLLER";
    Categories[Categories["ROUTER"] = 33] = "ROUTER";
    Categories[Categories["AUDIO_RECEIVER"] = 34] = "AUDIO_RECEIVER";
    Categories[Categories["TV_SET_TOP_BOX"] = 35] = "TV_SET_TOP_BOX";
    Categories[Categories["TV_STREAMING_STICK"] = 36] = "TV_STREAMING_STICK";
})(Categories = exports.Categories || (exports.Categories = {}));
var CharacteristicWarningType;
(function (CharacteristicWarningType) {
    CharacteristicWarningType["SLOW_WRITE"] = "slow-write";
    CharacteristicWarningType["TIMEOUT_WRITE"] = "timeout-write";
    CharacteristicWarningType["SLOW_READ"] = "slow-read";
    CharacteristicWarningType["TIMEOUT_READ"] = "timeout-read";
    CharacteristicWarningType["WARN_MESSAGE"] = "warn-message";
    CharacteristicWarningType["ERROR_MESSAGE"] = "error-message";
    CharacteristicWarningType["DEBUG_MESSAGE"] = "debug-message";
})(CharacteristicWarningType = exports.CharacteristicWarningType || (exports.CharacteristicWarningType = {}));
var MDNSAdvertiser;
(function (MDNSAdvertiser) {
    /**
     * Use the `@homebridge/ciao` module as advertiser.
     */
    MDNSAdvertiser["CIAO"] = "ciao";
    /**
     * Use the `bonjour-hap` module as advertiser.
     */
    MDNSAdvertiser["BONJOUR"] = "bonjour-hap";
})(MDNSAdvertiser = exports.MDNSAdvertiser || (exports.MDNSAdvertiser = {}));
var WriteRequestState;
(function (WriteRequestState) {
    WriteRequestState[WriteRequestState["REGULAR_REQUEST"] = 0] = "REGULAR_REQUEST";
    WriteRequestState[WriteRequestState["TIMED_WRITE_AUTHENTICATED"] = 1] = "TIMED_WRITE_AUTHENTICATED";
    WriteRequestState[WriteRequestState["TIMED_WRITE_REJECTED"] = 2] = "TIMED_WRITE_REJECTED";
})(WriteRequestState || (WriteRequestState = {}));
var AccessoryEventTypes;
(function (AccessoryEventTypes) {
    /**
     * Emitted when an iOS device wishes for this Accessory to identify itself. If `paired` is false, then
     * this device is currently browsing for Accessories in the system-provided "Add Accessory" screen. If
     * `paired` is true, then this is a device that has already paired with us. Note that if `paired` is true,
     * listening for this event is a shortcut for the underlying mechanism of setting the `Identify` Characteristic:
     * `getService(Service.AccessoryInformation).getCharacteristic(Characteristic.Identify).on('set', ...)`
     * You must call the callback for identification to be successful.
     */
    AccessoryEventTypes["IDENTIFY"] = "identify";
    AccessoryEventTypes["LISTENING"] = "listening";
    AccessoryEventTypes["SERVICE_CONFIGURATION_CHANGE"] = "service-configurationChange";
    /**
     * Emitted after a change in the value of one of the provided Service's Characteristics.
     */
    AccessoryEventTypes["SERVICE_CHARACTERISTIC_CHANGE"] = "service-characteristic-change";
    AccessoryEventTypes["PAIRED"] = "paired";
    AccessoryEventTypes["UNPAIRED"] = "unpaired";
    AccessoryEventTypes["CHARACTERISTIC_WARNING"] = "characteristic-warning";
})(AccessoryEventTypes = exports.AccessoryEventTypes || (exports.AccessoryEventTypes = {}));
/**
 * Accessory is a virtual HomeKit device. It can publish an associated HAP server for iOS devices to communicate
 * with - or it can run behind another "Bridge" Accessory server.
 *
 * Bridged Accessories in this implementation must have a UUID that is unique among all other Accessories that
 * are hosted by the Bridge. This UUID must be "stable" and unchanging, even when the server is restarted. This
 * is required so that the Bridge can provide consistent "Accessory IDs" (aid) and "Instance IDs" (iid) for all
 * Accessories, Services, and Characteristics for iOS clients to reference later.
 */
var Accessory = /** @class */ (function (_super) {
    tslib_1.__extends(Accessory, _super);
    function Accessory(displayName, UUID) {
        var _this = _super.call(this) || this;
        _this.displayName = displayName;
        _this.UUID = UUID;
        // NOTICE: when adding/changing properties, remember to possibly adjust the serialize/deserialize functions
        _this.aid = null; // assigned by us in assignIDs() or by a Bridge
        _this._isBridge = false; // true if we are a Bridge (creating a new instance of the Bridge subclass sets this to true)
        _this.bridged = false; // true if we are hosted "behind" a Bridge Accessory
        _this.bridgedAccessories = []; // If we are a Bridge, these are the Accessories we are bridging
        _this.reachable = true;
        _this.category = 1 /* OTHER */;
        _this.services = [];
        _this.shouldPurgeUnusedIDs = true; // Purge unused ids by default
        _this.controllers = {};
        _this._setupID = null;
        _this.controllerStorage = new ControllerStorage_1.ControllerStorage(_this);
        /**
         * This property captures the time when we last server a /accessories request.
         * For multiple bursts of /accessories request we don't want to always contact GET handlers
         */
        _this.lastAccessoriesRequest = 0;
        /**
         * Returns the bridging accessory if this accessory is bridged.
         * Otherwise returns itself.
         *
         * @returns the primary accessory
         */
        _this.getPrimaryAccessory = function () {
            return _this.bridged ? _this.bridge : _this;
        };
        _this.disableUnusedIDPurge = function () {
            _this.shouldPurgeUnusedIDs = false;
        };
        _this.enableUnusedIDPurge = function () {
            _this.shouldPurgeUnusedIDs = true;
        };
        /**
         * Manually purge the unused ids if you like, comes handy
         * when you have disabled auto purge so you can do it manually
         */
        _this.purgeUnusedIDs = function () {
            //Cache the state of the purge mechanism and set it to true
            var oldValue = _this.shouldPurgeUnusedIDs;
            _this.shouldPurgeUnusedIDs = true;
            //Reassign all ids
            _this._assignIDs(_this._identifierCache);
            //Revert back the purge mechanism state
            _this.shouldPurgeUnusedIDs = oldValue;
        };
        assert_1.default(displayName, "Accessories must be created with a non-empty displayName.");
        assert_1.default(UUID, "Accessories must be created with a valid UUID.");
        assert_1.default(uuid.isValid(UUID), "UUID '" + UUID + "' is not a valid UUID. Try using the provided 'generateUUID' function to create a valid UUID from any arbitrary string, like a serial number.");
        // create our initial "Accessory Information" Service that all Accessories are expected to have
        _this.addService(Service_1.Service.AccessoryInformation)
            .setCharacteristic(Characteristic_1.Characteristic.Name, displayName);
        // sign up for when iOS attempts to "set" the Identify characteristic - this means a paired device wishes
        // for us to identify ourselves (as opposed to an unpaired device - that case is handled by HAPServer 'identify' event)
        _this.getService(Service_1.Service.AccessoryInformation)
            .getCharacteristic(Characteristic_1.Characteristic.Identify)
            .on("set" /* SET */, function (value, callback) {
            if (value) {
                var paired = true;
                _this.identificationRequest(paired, callback);
            }
        });
        return _this;
    }
    Accessory.prototype.identificationRequest = function (paired, callback) {
        debug("[%s] Identification request", this.displayName);
        if (this.listeners("identify" /* IDENTIFY */).length > 0) {
            // allow implementors to identify this Accessory in whatever way is appropriate, and pass along
            // the standard callback for completion.
            this.emit("identify" /* IDENTIFY */, paired, callback);
        }
        else {
            debug("[%s] Identification request ignored; no listeners to 'identify' event", this.displayName);
            callback();
        }
    };
    Accessory.prototype.addService = function (serviceParam) {
        var e_1, _a;
        var constructorArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            constructorArgs[_i - 1] = arguments[_i];
        }
        // service might be a constructor like `Service.AccessoryInformation` instead of an instance
        // of Service. Coerce if necessary.
        var service = typeof serviceParam === 'function'
            ? new serviceParam(constructorArgs[0], constructorArgs[1], constructorArgs[2])
            : serviceParam;
        try {
            // check for UUID+subtype conflict
            for (var _b = tslib_1.__values(this.services), _c = _b.next(); !_c.done; _c = _b.next()) {
                var existing = _c.value;
                if (existing.UUID === service.UUID) {
                    // OK we have two Services with the same UUID. Check that each defines a `subtype` property and that each is unique.
                    if (!service.subtype)
                        throw new Error("Cannot add a Service with the same UUID '" + existing.UUID + "' as another Service in this Accessory without also defining a unique 'subtype' property.");
                    if (service.subtype === existing.subtype)
                        throw new Error("Cannot add a Service with the same UUID '" + existing.UUID + "' and subtype '" + existing.subtype + "' as another Service in this Accessory.");
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (this.services.length >= MAX_SERVICES) {
            throw new Error("Cannot add more than " + MAX_SERVICES + " services to a single accessory!");
        }
        this.services.push(service);
        if (service.isPrimaryService) { // check if a primary service was added
            if (this.primaryService !== undefined) {
                this.primaryService.isPrimaryService = false;
            }
            this.primaryService = service;
        }
        if (!this.bridged) {
            this.enqueueConfigurationUpdate();
        }
        else {
            this.emit("service-configurationChange" /* SERVICE_CONFIGURATION_CHANGE */, { service: service });
        }
        this.setupServiceEventHandlers(service);
        return service;
    };
    /**
     * @deprecated use {@link Service.setPrimaryService} directly
     */
    Accessory.prototype.setPrimaryService = function (service) {
        service.setPrimaryService();
    };
    Accessory.prototype.removeService = function (service) {
        var index = this.services.indexOf(service);
        if (index >= 0) {
            this.services.splice(index, 1);
            if (this.primaryService === service) { // check if we are removing out primary service
                this.primaryService = undefined;
            }
            this.removeLinkedService(service); // remove it from linked service entries on the local accessory
            if (!this.bridged) {
                this.enqueueConfigurationUpdate();
            }
            else {
                this.emit("service-configurationChange" /* SERVICE_CONFIGURATION_CHANGE */, { service: service });
            }
            service.removeAllListeners();
        }
    };
    Accessory.prototype.removeLinkedService = function (removed) {
        var e_2, _a;
        try {
            for (var _b = tslib_1.__values(this.services), _c = _b.next(); !_c.done; _c = _b.next()) {
                var service = _c.value;
                service.removeLinkedService(removed);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    Accessory.prototype.getService = function (name) {
        var e_3, _a;
        try {
            for (var _b = tslib_1.__values(this.services), _c = _b.next(); !_c.done; _c = _b.next()) {
                var service = _c.value;
                if (typeof name === 'string' && (service.displayName === name || service.name === name || service.subtype === name)) {
                    return service;
                }
                else if (typeof name === 'function' && ((service instanceof name) || (name.UUID === service.UUID))) {
                    return service;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return undefined;
    };
    Accessory.prototype.getServiceById = function (uuid, subType) {
        var e_4, _a;
        try {
            for (var _b = tslib_1.__values(this.services), _c = _b.next(); !_c.done; _c = _b.next()) {
                var service = _c.value;
                if (typeof uuid === "string" && (service.displayName === uuid || service.name === uuid) && service.subtype === subType) {
                    return service;
                }
                else if (typeof uuid === "function" && ((service instanceof uuid) || (uuid.UUID === service.UUID)) && service.subtype === subType) {
                    return service;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return undefined;
    };
    /**
     * @deprecated Not supported anymore
     */
    Accessory.prototype.updateReachability = function (reachable) {
        if (!this.bridged)
            throw new Error("Cannot update reachability on non-bridged accessory!");
        this.reachable = reachable;
        debug('Reachability update is no longer being supported.');
    };
    Accessory.prototype.addBridgedAccessory = function (accessory, deferUpdate) {
        var e_5, _a;
        var _this = this;
        if (deferUpdate === void 0) { deferUpdate = false; }
        if (accessory._isBridge) {
            throw new Error("Cannot Bridge another Bridge!");
        }
        try {
            // check for UUID conflict
            for (var _b = tslib_1.__values(this.bridgedAccessories), _c = _b.next(); !_c.done; _c = _b.next()) {
                var existing = _c.value;
                if (existing.UUID === accessory.UUID) {
                    throw new Error("Cannot add a bridged Accessory with the same UUID as another bridged Accessory: " + existing.UUID);
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        if (this.bridgedAccessories.length >= MAX_ACCESSORIES) {
            throw new Error("Cannot Bridge more than " + MAX_ACCESSORIES + " Accessories");
        }
        // listen for changes in ANY characteristics of ANY services on this Accessory
        accessory.on("service-characteristic-change" /* SERVICE_CHARACTERISTIC_CHANGE */, function (change) { return _this.handleCharacteristicChangeEvent(accessory, change.service, change); });
        accessory.on("service-configurationChange" /* SERVICE_CONFIGURATION_CHANGE */, this.enqueueConfigurationUpdate.bind(this));
        accessory.on("characteristic-warning" /* CHARACTERISTIC_WARNING */, this.handleCharacteristicWarning.bind(this));
        accessory.bridged = true;
        accessory.bridge = this;
        this.bridgedAccessories.push(accessory);
        this.controllerStorage.linkAccessory(accessory); // init controllers of bridged accessory
        if (!deferUpdate) {
            this.enqueueConfigurationUpdate();
        }
        return accessory;
    };
    Accessory.prototype.addBridgedAccessories = function (accessories) {
        var e_6, _a;
        try {
            for (var accessories_1 = tslib_1.__values(accessories), accessories_1_1 = accessories_1.next(); !accessories_1_1.done; accessories_1_1 = accessories_1.next()) {
                var accessory = accessories_1_1.value;
                this.addBridgedAccessory(accessory, true);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (accessories_1_1 && !accessories_1_1.done && (_a = accessories_1.return)) _a.call(accessories_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        this.enqueueConfigurationUpdate();
    };
    Accessory.prototype.removeBridgedAccessory = function (accessory, deferUpdate) {
        if (accessory._isBridge)
            throw new Error("Cannot Bridge another Bridge!");
        // check for UUID conflict
        var foundMatchAccessory = this.bridgedAccessories.findIndex(function (existing) {
            return existing.UUID === accessory.UUID;
        });
        if (foundMatchAccessory === -1)
            throw new Error("Cannot find the bridged Accessory to remove.");
        this.bridgedAccessories.splice(foundMatchAccessory, 1);
        accessory.removeAllListeners();
        if (!deferUpdate) {
            this.enqueueConfigurationUpdate();
        }
    };
    Accessory.prototype.removeBridgedAccessories = function (accessories) {
        var e_7, _a;
        try {
            for (var accessories_2 = tslib_1.__values(accessories), accessories_2_1 = accessories_2.next(); !accessories_2_1.done; accessories_2_1 = accessories_2.next()) {
                var accessory = accessories_2_1.value;
                this.removeBridgedAccessory(accessory, true);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (accessories_2_1 && !accessories_2_1.done && (_a = accessories_2.return)) _a.call(accessories_2);
            }
            finally { if (e_7) throw e_7.error; }
        }
        this.enqueueConfigurationUpdate();
    };
    Accessory.prototype.removeAllBridgedAccessories = function () {
        for (var i = this.bridgedAccessories.length - 1; i >= 0; i--) {
            this.removeBridgedAccessory(this.bridgedAccessories[i], true);
        }
        this.enqueueConfigurationUpdate();
    };
    Accessory.prototype.getCharacteristicByIID = function (iid) {
        var e_8, _a;
        try {
            for (var _b = tslib_1.__values(this.services), _c = _b.next(); !_c.done; _c = _b.next()) {
                var service = _c.value;
                var characteristic = service.getCharacteristicByIID(iid);
                if (characteristic) {
                    return characteristic;
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_8) throw e_8.error; }
        }
    };
    Accessory.prototype.getAccessoryByAID = function (aid) {
        var e_9, _a;
        if (aid === 1) {
            return this;
        }
        try {
            for (var _b = tslib_1.__values(this.bridgedAccessories), _c = _b.next(); !_c.done; _c = _b.next()) {
                var accessory = _c.value;
                if (accessory.aid === aid) {
                    return accessory;
                }
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_9) throw e_9.error; }
        }
        return undefined;
    };
    Accessory.prototype.findCharacteristic = function (aid, iid) {
        var accessory = this.getAccessoryByAID(aid);
        return accessory && accessory.getCharacteristicByIID(iid);
    };
    // noinspection JSDeprecatedSymbols
    /**
     * Method is used to configure an old style CameraSource.
     * The CameraSource API was fully replaced by the new Controller API used by {@link CameraController}.
     * The {@link CameraStreamingDelegate} used by the CameraController is the equivalent to the old CameraSource.
     *
     * The new Controller API is much more refined and robust way of "grouping" services together.
     * It especially is intended to fully support serialization/deserialization to/from persistent storage.
     * This feature is also gained when using the old style CameraSource API.
     * The {@link CameraStreamingDelegate} improves on the overall camera API though and provides some reworked
     * type definitions and a refined callback interface to better signal errors to the requesting HomeKit device.
     * It is advised to update to it.
     *
     * Full backwards compatibility is currently maintained. A legacy CameraSource will be wrapped into an Adapter.
     * All legacy StreamControllers in the "streamControllers" property will be replaced by CameraRTPManagement instances.
     * Any services in the "services" property which are one of the following are ignored:
     *     - CameraRTPStreamManagement
     *     - CameraOperatingMode
     *     - CameraEventRecordingManagement
     *
     * @param cameraSource {LegacyCameraSource}
     * @deprecated please refer to the new {@see CameraController} API and {@link configureController}
     */
    Accessory.prototype.configureCameraSource = function (cameraSource) {
        var _this = this;
        if (cameraSource.streamControllers.length === 0) {
            throw new Error("Malformed legacy CameraSource. Did not expose any StreamControllers!");
        }
        var options = cameraSource.streamControllers[0].options; // grab options from one of the StreamControllers
        var cameraControllerOptions = {
            cameraStreamCount: cameraSource.streamControllers.length,
            streamingOptions: options,
            delegate: new camera_1.LegacyCameraSourceAdapter(cameraSource),
        };
        var cameraController = new controller_1.CameraController(cameraControllerOptions, true); // create CameraController in legacy mode
        this.configureController(cameraController);
        // we try here to be as good as possibly of keeping current behaviour
        cameraSource.services.forEach(function (service) {
            if (service.UUID === Service_1.Service.CameraRTPStreamManagement.UUID || service.UUID === Service_1.Service.CameraOperatingMode.UUID
                || service.UUID === Service_1.Service.CameraRecordingManagement.UUID) {
                return; // ignore those services, as they get replaced by the RTPStreamManagement
            }
            // all other services get added. We can't really control possibly linking to any of those ignored services
            // so this is really only half baked stuff.
            _this.addService(service);
        });
        // replace stream controllers; basically only to still support the "forceStop" call
        // noinspection JSDeprecatedSymbols
        cameraSource.streamControllers = cameraController.streamManagements;
        return cameraController; // return the reference for the controller (maybe this could be useful?)
    };
    /**
     * This method is used to setup a new Controller for this accessory. See {@see Controller} for a more detailed
     * explanation what a Controller is and what it is capable of.
     *
     * The controller can be passed as an instance of the class or as a constructor (without any necessary parameters)
     * for a new Controller.
     * Only one Controller of a given {@link ControllerIdentifier} can be configured for a given Accessory.
     *
     * When called, it will be checked if there are any services and persistent data the Controller (for the given
     * {@link ControllerIdentifier}) can be restored from. Otherwise the Controller will be created with new services.
     *
     *
     * @param controllerConstructor {Controller | ControllerConstructor}
     */
    Accessory.prototype.configureController = function (controllerConstructor) {
        var _this = this;
        var controller = typeof controllerConstructor === "function"
            ? new controllerConstructor() // any custom constructor arguments should be passed before using .bind(...)
            : controllerConstructor;
        var id = controller.controllerId();
        if (this.controllers[id]) {
            throw new Error("A Controller with the type/id '" + id + "' was already added to the accessory " + this.displayName);
        }
        var savedServiceMap = this.serializedControllers && this.serializedControllers[id];
        var serviceMap;
        if (savedServiceMap) { // we found data to restore from
            var clonedServiceMap = clone_1.clone(savedServiceMap);
            var updatedServiceMap = controller.initWithServices(savedServiceMap); // init controller with existing services
            serviceMap = updatedServiceMap || savedServiceMap; // initWithServices could return a updated serviceMap, otherwise just use the existing one
            if (updatedServiceMap) { // controller returned a ServiceMap and thus signaled a updated set of services
                // clonedServiceMap is altered by this method, should not be touched again after this call (for the future people)
                this.handleUpdatedControllerServiceMap(clonedServiceMap, updatedServiceMap);
            }
            controller.configureServices(); // let the controller setup all its handlers
            // remove serialized data from our dictionary:
            delete this.serializedControllers[id];
            if (Object.entries(this.serializedControllers).length === 0) {
                this.serializedControllers = undefined;
            }
        }
        else {
            serviceMap = controller.constructServices(); // let the controller create his services
            controller.configureServices(); // let the controller setup all its handlers
            Object.values(serviceMap).forEach(function (service) {
                if (service && !_this.services.includes(service)) {
                    _this.addService(service);
                }
            });
        }
        // --- init handlers and setup context ---
        var context = {
            controller: controller,
            serviceMap: serviceMap,
        };
        if (controller_1.isSerializableController(controller)) {
            this.controllerStorage.trackController(controller);
        }
        this.controllers[id] = context;
        if (controller instanceof controller_1.CameraController) { // save CameraController for Snapshot handling
            this.activeCameraController = controller;
        }
    };
    /**
     * This method will remove a given Controller from this accessory.
     * The controller object will be restored to its initial state.
     * This also means that any event handlers setup for the controller will be removed.
     *
     * @param controller - The controller which should be removed from the accessory.
     */
    Accessory.prototype.removeController = function (controller) {
        var _this = this;
        var id = controller.controllerId();
        var storedController = this.controllers[id];
        if (storedController) {
            if (storedController.controller !== controller) {
                throw new Error("[" + this.displayName + "] tried removing a controller with the id/type '" + id + "' though provided controller isn't the same which is registered!");
            }
            if (controller_1.isSerializableController(controller)) {
                // this will reset the state change delegate before we call handleControllerRemoved()
                this.controllerStorage.untrackController(controller);
            }
            if (controller.handleFactoryReset) {
                controller.handleFactoryReset();
            }
            controller.handleControllerRemoved();
            delete this.controllers[id];
            if (this.activeCameraController === controller) {
                this.activeCameraController = undefined;
            }
            Object.values(storedController.serviceMap).forEach(function (service) {
                if (service) {
                    _this.removeService(service);
                }
            });
        }
        if (this.serializedControllers) {
            delete this.serializedControllers[id];
        }
    };
    Accessory.prototype.handleAccessoryUnpairedForControllers = function () {
        var e_10, _a;
        try {
            for (var _b = tslib_1.__values(Object.values(this.controllers)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var context = _c.value;
                var controller = context.controller;
                if (controller.handleFactoryReset) { // if the controller implements handleFactoryReset, setup event handlers for this controller
                    controller.handleFactoryReset();
                }
                if (controller_1.isSerializableController(controller)) {
                    this.controllerStorage.purgeControllerData(controller);
                }
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_10) throw e_10.error; }
        }
    };
    Accessory.prototype.handleUpdatedControllerServiceMap = function (originalServiceMap, updatedServiceMap) {
        var _this = this;
        updatedServiceMap = clone_1.clone(updatedServiceMap); // clone it so we can alter it
        Object.keys(originalServiceMap).forEach(function (name) {
            var service = originalServiceMap[name];
            var updatedService = updatedServiceMap[name];
            if (service && updatedService) { // we check all names contained in both ServiceMaps for changes
                delete originalServiceMap[name]; // delete from original ServiceMap so it will only contain deleted services at the end
                delete updatedServiceMap[name]; // delete from updated ServiceMap so it will only contain added services at the end
                if (service !== updatedService) {
                    _this.removeService(service);
                    _this.addService(updatedService);
                }
            }
        });
        // now originalServiceMap contains only deleted services and updateServiceMap only added services
        Object.values(originalServiceMap).forEach(function (service) {
            if (service) {
                _this.removeService(service);
            }
        });
        Object.values(updatedServiceMap).forEach(function (service) {
            if (service) {
                _this.addService(service);
            }
        });
    };
    Accessory.prototype.setupURI = function () {
        if (this._setupURI) {
            return this._setupURI;
        }
        var buffer = Buffer.alloc(8);
        var setupCode = this._accessoryInfo && parseInt(this._accessoryInfo.pincode.replace(/-/g, ''), 10);
        var value_low = setupCode;
        var value_high = this._accessoryInfo && this._accessoryInfo.category >> 1;
        value_low |= 1 << 28; // Supports IP;
        buffer.writeUInt32BE(value_low, 4);
        if (this._accessoryInfo && this._accessoryInfo.category & 1) {
            buffer[4] = buffer[4] | 1 << 7;
        }
        buffer.writeUInt32BE(value_high, 0);
        var encodedPayload = (buffer.readUInt32BE(4) + (buffer.readUInt32BE(0) * Math.pow(2, 32))).toString(36).toUpperCase();
        if (encodedPayload.length != 9) {
            for (var i = 0; i <= 9 - encodedPayload.length; i++) {
                encodedPayload = "0" + encodedPayload;
            }
        }
        this._setupURI = "X-HM://" + encodedPayload + this._setupID;
        return this._setupURI;
    };
    /**
     * This method is called right before the accessory is published. It should be used to check for common
     * mistakes in Accessory structured, which may lead to HomeKit rejecting the accessory when pairing.
     * If it is called on a bridge it will call this method for all bridged accessories.
     */
    Accessory.prototype.validateAccessory = function (mainAccessory) {
        var _this = this;
        var service = this.getService(Service_1.Service.AccessoryInformation);
        if (!service) {
            console.log("HAP-NodeJS WARNING: The accessory '" + this.displayName + "' is getting published without a AccessoryInformation service. " +
                "This might prevent the accessory from being added to the Home app or leading to the accessory being unresponsive!");
        }
        else {
            var checkValue = function (name, value) {
                if (!value) {
                    console.log("HAP-NodeJS WARNING: The accessory '" + _this.displayName + "' is getting published with the characteristic '" + name + "'" +
                        " (of the AccessoryInformation service) not having a value set. " +
                        "This might prevent the accessory from being added to the Home App or leading to the accessory being unresponsive!");
                }
            };
            var model = service.getCharacteristic(Characteristic_1.Characteristic.Model).value;
            var serialNumber = service.getCharacteristic(Characteristic_1.Characteristic.SerialNumber).value;
            var firmwareRevision = service.getCharacteristic(Characteristic_1.Characteristic.FirmwareRevision).value;
            var name = service.getCharacteristic(Characteristic_1.Characteristic.Name).value;
            checkValue("Model", model);
            checkValue("SerialNumber", serialNumber);
            checkValue("FirmwareRevision", firmwareRevision);
            checkValue("Name", name);
        }
        if (mainAccessory) {
            // the main accessory which is advertised via bonjour must have a name with length <= 63 (limitation of DNS FQDN names)
            assert_1.default(Buffer.from(this.displayName, "utf8").length <= 63, "Accessory displayName cannot be longer than 63 bytes!");
        }
        if (this.bridged) {
            this.bridgedAccessories.forEach(function (accessory) { return accessory.validateAccessory(); });
        }
    };
    /**
     * Assigns aid/iid to ourselves, any Accessories we are bridging, and all associated Services+Characteristics. Uses
     * the provided identifierCache to keep IDs stable.
     */
    Accessory.prototype._assignIDs = function (identifierCache) {
        var e_11, _a, e_12, _b;
        // if we are responsible for our own identifierCache, start the expiration process
        // also check weather we want to have an expiration process
        if (this._identifierCache && this.shouldPurgeUnusedIDs) {
            this._identifierCache.startTrackingUsage();
        }
        if (this.bridged) {
            // This Accessory is bridged, so it must have an aid > 1. Use the provided identifierCache to
            // fetch or assign one based on our UUID.
            this.aid = identifierCache.getAID(this.UUID);
        }
        else {
            // Since this Accessory is the server (as opposed to any Accessories that may be bridged behind us),
            // we must have aid = 1
            this.aid = 1;
        }
        try {
            for (var _c = tslib_1.__values(this.services), _d = _c.next(); !_d.done; _d = _c.next()) {
                var service = _d.value;
                if (this._isBridge) {
                    service._assignIDs(identifierCache, this.UUID, 2000000000);
                }
                else {
                    service._assignIDs(identifierCache, this.UUID);
                }
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_11) throw e_11.error; }
        }
        try {
            // now assign IDs for any Accessories we are bridging
            for (var _e = tslib_1.__values(this.bridgedAccessories), _f = _e.next(); !_f.done; _f = _e.next()) {
                var accessory = _f.value;
                accessory._assignIDs(identifierCache);
            }
        }
        catch (e_12_1) { e_12 = { error: e_12_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_12) throw e_12.error; }
        }
        // expire any now-unused cache keys (for Accessories, Services, or Characteristics
        // that have been removed since the last call to assignIDs())
        if (this._identifierCache) {
            //Check weather we want to purge the unused ids
            if (this.shouldPurgeUnusedIDs)
                this._identifierCache.stopTrackingUsageAndExpireUnused();
            //Save in case we have new ones
            this._identifierCache.save();
        }
    };
    /**
     * Returns a JSON representation of this accessory suitable for delivering to HAP clients.
     */
    Accessory.prototype.toHAP = function (connection, contactGetHandlers) {
        if (contactGetHandlers === void 0) { contactGetHandlers = true; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var accessory, accessories, _a, _b, _c;
            var _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        assert_1.default(this.aid, "aid cannot be undefined for accessory '" + this.displayName + "'");
                        assert_1.default(this.services.length, "accessory '" + this.displayName + "' does not have any services!");
                        _d = {
                            aid: this.aid
                        };
                        return [4 /*yield*/, Promise.all(this.services.map(function (service) { return service.toHAP(connection, contactGetHandlers); }))];
                    case 1:
                        accessory = (_d.services = _e.sent(),
                            _d);
                        accessories = [accessory];
                        if (!!this.bridged) return [3 /*break*/, 3];
                        _b = (_a = accessories.push).apply;
                        _c = [accessories];
                        return [4 /*yield*/, Promise.all(this.bridgedAccessories
                                .map(function (accessory) { return accessory.toHAP(connection, contactGetHandlers).then(function (value) { return value[0]; }); }))];
                    case 2:
                        _b.apply(_a, _c.concat([tslib_1.__spread.apply(void 0, [_e.sent()])]));
                        _e.label = 3;
                    case 3: return [2 /*return*/, accessories];
                }
            });
        });
    };
    /**
     * Returns a JSON representation of this accessory without characteristic values.
     */
    Accessory.prototype.internalHAPRepresentation = function (assignIds) {
        var e_13, _a;
        if (assignIds === void 0) { assignIds = true; }
        if (assignIds) {
            this._assignIDs(this._identifierCache); // make sure our aid/iid's are all assigned
        }
        assert_1.default(this.aid, "aid cannot be undefined for accessory '" + this.displayName + "'");
        assert_1.default(this.services.length, "accessory '" + this.displayName + "' does not have any services!");
        var accessory = {
            aid: this.aid,
            services: this.services.map(function (service) { return service.internalHAPRepresentation(); }),
        };
        var accessories = [accessory];
        if (!this.bridged) {
            try {
                for (var _b = tslib_1.__values(this.bridgedAccessories), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var accessory_1 = _c.value;
                    accessories.push(accessory_1.internalHAPRepresentation(false)[0]);
                }
            }
            catch (e_13_1) { e_13 = { error: e_13_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_13) throw e_13.error; }
            }
        }
        return accessories;
    };
    /**
     * Publishes this Accessory on the local network for iOS clients to communicate with.
     *
     * @param {Object} info - Required info for publishing.
     * @param allowInsecureRequest - Will allow unencrypted and unauthenticated access to the http server
     * @param {string} info.username - The "username" (formatted as a MAC address - like "CC:22:3D:E3:CE:F6") of
     *                                this Accessory. Must be globally unique from all Accessories on your local network.
     * @param {string} info.pincode - The 8-digit pincode for clients to use when pairing this Accessory. Must be formatted
     *                               as a string like "031-45-154".
     * @param {string} info.category - One of the values of the Accessory.Category enum, like Accessory.Category.SWITCH.
     *                                This is a hint to iOS clients about what "type" of Accessory this represents, so
     *                                that for instance an appropriate icon can be drawn for the user while adding a
     *                                new Accessory.
     */
    Accessory.prototype.publish = function (info, allowInsecureRequest) {
        var _this = this;
        var _a, _b;
        // noinspection JSDeprecatedSymbols
        if (!info.advertiser && info.useLegacyAdvertiser != null) {
            // noinspection JSDeprecatedSymbols
            info.advertiser = info.useLegacyAdvertiser ? "bonjour-hap" /* BONJOUR */ : "ciao" /* CIAO */;
            console.warn('DEPRECATED The PublishInfo.useLegacyAdvertiser option has been removed. Please use the PublishInfo.advertiser property to enable "ciao" (useLegacyAdvertiser=false) ' +
                'or "bonjour-hap" (useLegacyAdvertiser=true) mdns advertiser libraries!');
        }
        // noinspection JSDeprecatedSymbols
        if (info.mdns && info.advertiser !== "bonjour-hap" /* BONJOUR */) {
            console.log("DEPRECATED user supplied a custom 'mdns' option. This option is deprecated and ignored. " +
                "Please move to the new 'bind' option.");
        }
        var service = this.getService(Service_1.Service.ProtocolInformation);
        if (!service) {
            service = this.addService(Service_1.Service.ProtocolInformation); // add the protocol information service to the primary accessory
        }
        service.setCharacteristic(Characteristic_1.Characteristic.Version, Advertiser_1.CiaoAdvertiser.protocolVersionService);
        if (this.lastKnownUsername && this.lastKnownUsername !== info.username) { // username changed since last publish
            Accessory.cleanupAccessoryData(this.lastKnownUsername); // delete old Accessory data
        }
        if ((_a = info.addIdentifyingMaterial) !== null && _a !== void 0 ? _a : true) {
            // adding some identifying material to our displayName
            this.displayName = this.displayName + " " + crypto_1.default.createHash('sha512')
                .update(info.username, 'utf8')
                .digest('hex').slice(0, 4).toUpperCase();
            this.getService(Service_1.Service.AccessoryInformation).updateCharacteristic(Characteristic_1.Characteristic.Name, this.displayName);
        }
        // attempt to load existing AccessoryInfo from disk
        this._accessoryInfo = AccessoryInfo_1.AccessoryInfo.load(info.username);
        // if we don't have one, create a new one.
        if (!this._accessoryInfo) {
            debug("[%s] Creating new AccessoryInfo for our HAP server", this.displayName);
            this._accessoryInfo = AccessoryInfo_1.AccessoryInfo.create(info.username);
        }
        if (info.setupID) {
            this._setupID = info.setupID;
        }
        else if (this._accessoryInfo.setupID === undefined || this._accessoryInfo.setupID === "") {
            this._setupID = Accessory._generateSetupID();
        }
        else {
            this._setupID = this._accessoryInfo.setupID;
        }
        this._accessoryInfo.setupID = this._setupID;
        // make sure we have up-to-date values in AccessoryInfo, then save it in case they changed (or if we just created it)
        this._accessoryInfo.displayName = this.displayName;
        this._accessoryInfo.model = this.getService(Service_1.Service.AccessoryInformation).getCharacteristic(Characteristic_1.Characteristic.Model).value;
        this._accessoryInfo.category = info.category || 1 /* OTHER */;
        this._accessoryInfo.pincode = info.pincode;
        this._accessoryInfo.save();
        // create our IdentifierCache so we can provide clients with stable aid/iid's
        this._identifierCache = IdentifierCache_1.IdentifierCache.load(info.username);
        // if we don't have one, create a new one.
        if (!this._identifierCache) {
            debug("[%s] Creating new IdentifierCache", this.displayName);
            this._identifierCache = new IdentifierCache_1.IdentifierCache(info.username);
        }
        //If it's bridge and there are not accessories already assigned to the bridge
        //probably purge is not needed since it's going to delete all the ids
        //of accessories that might be added later. Useful when dynamically adding
        //accessories.
        if (this._isBridge && this.bridgedAccessories.length == 0) {
            this.disableUnusedIDPurge();
            this.controllerStorage.purgeUnidentifiedAccessoryData = false;
        }
        this.controllerStorage.load(info.username); // initializing controller data
        // assign aid/iid
        this._assignIDs(this._identifierCache);
        // get our accessory information in HAP format and determine if our configuration (that is, our
        // Accessories/Services/Characteristics) has changed since the last time we were published. make
        // sure to omit actual values since these are not part of the "configuration".
        var config = this.internalHAPRepresentation(false); // TODO ensure this stuff is ordered
        // TODO queue this check until about 5 seconds after startup, allowing some last changes after the publish call
        //   without constantly incrementing the current config number
        this._accessoryInfo.checkForCurrentConfigurationNumberIncrement(config, true);
        this.validateAccessory(true);
        // create our Advertiser which broadcasts our presence over mdns
        var parsed = Accessory.parseBindOption(info);
        switch ((_b = info.advertiser) !== null && _b !== void 0 ? _b : "bonjour-hap" /* BONJOUR */) {
            case "ciao" /* CIAO */:
                this._advertiser = new Advertiser_1.CiaoAdvertiser(this._accessoryInfo, {
                    interface: parsed.advertiserAddress
                }, {
                    restrictedAddresses: parsed.serviceRestrictedAddress,
                    disabledIpv6: parsed.serviceDisableIpv6,
                });
                break;
            case "bonjour-hap" /* BONJOUR */:
                // noinspection JSDeprecatedSymbols
                this._advertiser = new Advertiser_1.BonjourHAPAdvertiser(this._accessoryInfo, info.mdns, {
                    restrictedAddresses: parsed.serviceRestrictedAddress,
                    disabledIpv6: parsed.serviceDisableIpv6,
                });
                break;
            default:
                throw new Error("Unsupported advertiser setting: '" + info.advertiser + "'");
        }
        this._advertiser.on("updated-name" /* UPDATED_NAME */, function (name) {
            _this.displayName = name;
            if (_this._accessoryInfo) {
                _this._accessoryInfo.displayName = name;
                _this._accessoryInfo.save();
            }
            // bonjour service name MUST match the name in the accessory information service
            _this.getService(Service_1.Service.AccessoryInformation)
                .updateCharacteristic(Characteristic_1.Characteristic.Name, name);
        });
        // create our HAP server which handles all communication between iOS devices and us
        this._server = new HAPServer_1.HAPServer(this._accessoryInfo);
        this._server.allowInsecureRequest = !!allowInsecureRequest;
        this._server.on("listening" /* LISTENING */, this.onListening.bind(this));
        this._server.on("identify" /* IDENTIFY */, this.identificationRequest.bind(this, false));
        this._server.on("pair" /* PAIR */, this.handleInitialPairSetupFinished.bind(this));
        this._server.on("add-pairing" /* ADD_PAIRING */, this.handleAddPairing.bind(this));
        this._server.on("remove-pairing" /* REMOVE_PAIRING */, this.handleRemovePairing.bind(this));
        this._server.on("list-pairings" /* LIST_PAIRINGS */, this.handleListPairings.bind(this));
        this._server.on("accessories" /* ACCESSORIES */, this.handleAccessories.bind(this));
        this._server.on("get-characteristics" /* GET_CHARACTERISTICS */, this.handleGetCharacteristics.bind(this));
        this._server.on("set-characteristics" /* SET_CHARACTERISTICS */, this.handleSetCharacteristics.bind(this));
        this._server.on("connection-closed" /* CONNECTION_CLOSED */, this.handleHAPConnectionClosed.bind(this));
        this._server.on("request-resource" /* REQUEST_RESOURCE */, this.handleResource.bind(this));
        this._server.listen(info.port, parsed.serverAddress);
    };
    /**
     * Removes this Accessory from the local network
     * Accessory object will no longer valid after invoking this method
     * Trying to invoke publish() on the object will result undefined behavior
     */
    Accessory.prototype.destroy = function () {
        this.unpublish();
        if (this._accessoryInfo) {
            Accessory.cleanupAccessoryData(this._accessoryInfo.username);
            this._accessoryInfo = undefined;
            this._identifierCache = undefined;
            this.controllerStorage = new ControllerStorage_1.ControllerStorage(this);
        }
        this.removeAllListeners();
    };
    Accessory.prototype.unpublish = function () {
        if (this._server) {
            this._server.destroy();
            this._server = undefined;
        }
        if (this._advertiser) {
            // noinspection JSIgnoredPromiseFromCall
            this._advertiser.destroy();
            this._advertiser = undefined;
        }
    };
    Accessory.prototype.enqueueConfigurationUpdate = function () {
        var _this = this;
        if (this.configurationChangeDebounceTimeout) {
            return; // already enqueued
        }
        this.configurationChangeDebounceTimeout = setTimeout(function () {
            var _a;
            _this.configurationChangeDebounceTimeout = undefined;
            if (_this._advertiser && _this._advertiser) {
                // get our accessory information in HAP format and determine if our configuration (that is, our
                // Accessories/Services/Characteristics) has changed since the last time we were published. make
                // sure to omit actual values since these are not part of the "configuration".
                var config = _this.internalHAPRepresentation(); // TODO ensure this stuff is ordered
                if ((_a = _this._accessoryInfo) === null || _a === void 0 ? void 0 : _a.checkForCurrentConfigurationNumberIncrement(config)) {
                    _this._advertiser.updateAdvertisement();
                }
            }
        }, 1000);
        this.configurationChangeDebounceTimeout.unref();
        // 1d is fine, HomeKit is built that with configuration updates no iid or aid conflicts occur.
        // Thus the only thing happening when the txt update arrives late is already removed accessories/services
        // not responding or new accessories/services not yet shown
    };
    Accessory.prototype.onListening = function (port, hostname) {
        assert_1.default(this._advertiser, "Advertiser wasn't created at onListening!");
        // the HAP server is listening, so we can now start advertising our presence.
        this._advertiser.initPort(port);
        // noinspection JSIgnoredPromiseFromCall
        this._advertiser.startAdvertising();
        this.emit("listening" /* LISTENING */, port, hostname);
    };
    Accessory.prototype.handleInitialPairSetupFinished = function (username, publicKey, callback) {
        debug("[%s] Paired with client %s", this.displayName, username);
        this._accessoryInfo && this._accessoryInfo.addPairedClient(username, publicKey, 1 /* ADMIN */);
        this._accessoryInfo && this._accessoryInfo.save();
        // update our advertisement so it can pick up on the paired status of AccessoryInfo
        this._advertiser && this._advertiser.updateAdvertisement();
        callback();
        this.emit("paired" /* PAIRED */);
    };
    Accessory.prototype.handleAddPairing = function (connection, username, publicKey, permission, callback) {
        if (!this._accessoryInfo) {
            callback(6 /* UNAVAILABLE */);
            return;
        }
        if (!this._accessoryInfo.hasAdminPermissions(connection.username)) {
            callback(2 /* AUTHENTICATION */);
            return;
        }
        var existingKey = this._accessoryInfo.getClientPublicKey(username);
        if (existingKey) {
            if (existingKey.toString() !== publicKey.toString()) {
                callback(1 /* UNKNOWN */);
                return;
            }
            this._accessoryInfo.updatePermission(username, permission);
        }
        else {
            this._accessoryInfo.addPairedClient(username, publicKey, permission);
        }
        this._accessoryInfo.save();
        // there should be no need to update advertisement
        callback(0);
    };
    Accessory.prototype.handleRemovePairing = function (connection, username, callback) {
        var e_14, _a;
        if (!this._accessoryInfo) {
            callback(6 /* UNAVAILABLE */);
            return;
        }
        if (!this._accessoryInfo.hasAdminPermissions(connection.username)) {
            callback(2 /* AUTHENTICATION */);
            return;
        }
        this._accessoryInfo.removePairedClient(connection, username);
        this._accessoryInfo.save();
        callback(0); // first of all ensure the pairing is removed before we advertise availability again
        if (!this._accessoryInfo.paired()) {
            this._advertiser && this._advertiser.updateAdvertisement();
            this.emit("unpaired" /* UNPAIRED */);
            this.handleAccessoryUnpairedForControllers();
            try {
                for (var _b = tslib_1.__values(this.bridgedAccessories), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var accessory = _c.value;
                    accessory.handleAccessoryUnpairedForControllers();
                }
            }
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_14) throw e_14.error; }
            }
        }
    };
    Accessory.prototype.handleListPairings = function (connection, callback) {
        if (!this._accessoryInfo) {
            callback(6 /* UNAVAILABLE */);
            return;
        }
        if (!this._accessoryInfo.hasAdminPermissions(connection.username)) {
            callback(2 /* AUTHENTICATION */);
            return;
        }
        callback(0, this._accessoryInfo.listPairings());
    };
    Accessory.prototype.handleAccessories = function (connection, callback) {
        var _this = this;
        this._assignIDs(this._identifierCache); // make sure our aid/iid's are all assigned
        var now = Date.now();
        var contactGetHandlers = now - this.lastAccessoriesRequest > 5000; // we query latest value if last /accessories was more than 5s ago
        this.lastAccessoriesRequest = now;
        this.toHAP(connection, contactGetHandlers).then(function (value) {
            callback(undefined, {
                accessories: value,
            });
        }, function (reason) {
            console.error("[" + _this.displayName + "] /accessories request error with: " + reason.stack);
            callback({ httpCode: 500 /* INTERNAL_SERVER_ERROR */, status: -70402 /* SERVICE_COMMUNICATION_FAILURE */ });
        });
    };
    Accessory.prototype.handleGetCharacteristics = function (connection, request, callback) {
        var e_15, _a;
        var _this = this;
        var characteristics = [];
        var response = { characteristics: characteristics };
        var missingCharacteristics = new Set(request.ids.map(function (id) { return id.aid + "." + id.iid; }));
        if (missingCharacteristics.size !== request.ids.length) {
            // if those sizes differ, we have duplicates and can't properly handle that
            callback({ httpCode: 422 /* UNPROCESSABLE_ENTITY */, status: -70410 /* INVALID_VALUE_IN_REQUEST */ });
            return;
        }
        var timeout = setTimeout(function () {
            var e_16, _a;
            try {
                for (var missingCharacteristics_1 = tslib_1.__values(missingCharacteristics), missingCharacteristics_1_1 = missingCharacteristics_1.next(); !missingCharacteristics_1_1.done; missingCharacteristics_1_1 = missingCharacteristics_1.next()) {
                    var id = missingCharacteristics_1_1.value;
                    var split = id.split(".");
                    var aid = parseInt(split[0], 10);
                    var iid = parseInt(split[1], 10);
                    var accessory = _this.getAccessoryByAID(aid);
                    var characteristic = accessory.getCharacteristicByIID(iid);
                    _this.sendCharacteristicWarning(characteristic, "slow-read" /* SLOW_READ */, "The read handler for the characteristic '" +
                        characteristic.displayName + "' on the accessory '" + accessory.displayName + "' was slow to respond!");
                }
            }
            catch (e_16_1) { e_16 = { error: e_16_1 }; }
            finally {
                try {
                    if (missingCharacteristics_1_1 && !missingCharacteristics_1_1.done && (_a = missingCharacteristics_1.return)) _a.call(missingCharacteristics_1);
                }
                finally { if (e_16) throw e_16.error; }
            }
            // after a total of 10s we do not longer wait for a request to appear and just return status code timeout
            timeout = setTimeout(function () {
                var e_17, _a;
                timeout = undefined;
                try {
                    for (var missingCharacteristics_2 = tslib_1.__values(missingCharacteristics), missingCharacteristics_2_1 = missingCharacteristics_2.next(); !missingCharacteristics_2_1.done; missingCharacteristics_2_1 = missingCharacteristics_2.next()) {
                        var id = missingCharacteristics_2_1.value;
                        var split = id.split(".");
                        var aid = parseInt(split[0], 10);
                        var iid = parseInt(split[1], 10);
                        var accessory = _this.getAccessoryByAID(aid);
                        var characteristic = accessory.getCharacteristicByIID(iid);
                        _this.sendCharacteristicWarning(characteristic, "timeout-read" /* TIMEOUT_READ */, "The read handler for the characteristic '" +
                            characteristic.displayName + "' on the accessory '" + accessory.displayName + "' didn't respond at all!. Please check that you properly call the callback!");
                        characteristics.push({
                            aid: aid,
                            iid: iid,
                            status: -70408 /* OPERATION_TIMED_OUT */,
                        });
                    }
                }
                catch (e_17_1) { e_17 = { error: e_17_1 }; }
                finally {
                    try {
                        if (missingCharacteristics_2_1 && !missingCharacteristics_2_1.done && (_a = missingCharacteristics_2.return)) _a.call(missingCharacteristics_2);
                    }
                    finally { if (e_17) throw e_17.error; }
                }
                missingCharacteristics.clear();
                callback(undefined, response);
            }, 6000);
            timeout.unref();
        }, 3000);
        timeout.unref();
        var _loop_1 = function (id) {
            var name = id.aid + "." + id.iid;
            this_1.handleCharacteristicRead(connection, id, request).then(function (value) {
                return tslib_1.__assign({ aid: id.aid, iid: id.iid }, value);
            }, function (reason) {
                console.error("[" + _this.displayName + "] Read request for characteristic " + name + " encountered an error: " + reason.stack);
                return {
                    aid: id.aid,
                    iid: id.iid,
                    status: -70402 /* SERVICE_COMMUNICATION_FAILURE */,
                };
            }).then(function (value) {
                if (!timeout) {
                    return; // if timeout is undefined, response was already sent out
                }
                missingCharacteristics.delete(name);
                characteristics.push(value);
                if (missingCharacteristics.size === 0) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = undefined;
                    }
                    callback(undefined, response);
                }
            });
        };
        var this_1 = this;
        try {
            for (var _b = tslib_1.__values(request.ids), _c = _b.next(); !_c.done; _c = _b.next()) {
                var id = _c.value;
                _loop_1(id);
            }
        }
        catch (e_15_1) { e_15 = { error: e_15_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_15) throw e_15.error; }
        }
    };
    Accessory.prototype.handleCharacteristicRead = function (connection, id, request) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var characteristic, verifiable;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                characteristic = this.findCharacteristic(id.aid, id.iid);
                if (!characteristic) {
                    debug('[%s] Could not find a Characteristic with aid of %s and iid of %s', this.displayName, id.aid, id.iid);
                    return [2 /*return*/, { status: -70410 /* INVALID_VALUE_IN_REQUEST */ }];
                }
                if (!characteristic.props.perms.includes("pr" /* PAIRED_READ */)) { // check if read is allowed for this characteristic
                    debug('[%s] Tried reading from characteristic which does not allow reading (aid of %s and iid of %s)', this.displayName, id.aid, id.iid);
                    return [2 /*return*/, { status: -70405 /* WRITE_ONLY_CHARACTERISTIC */ }];
                }
                if (characteristic.props.adminOnlyAccess && characteristic.props.adminOnlyAccess.includes(0 /* READ */)) {
                    verifiable = true;
                    if (!connection.username || !this._accessoryInfo) {
                        verifiable = false;
                        debug('[%s] Could not verify admin permissions for Characteristic which requires admin permissions for reading (aid of %s and iid of %s)', this.displayName, id.aid, id.iid);
                    }
                    if (!verifiable || !this._accessoryInfo.hasAdminPermissions(connection.username)) {
                        return [2 /*return*/, { status: -70401 /* INSUFFICIENT_PRIVILEGES */ }];
                    }
                }
                return [2 /*return*/, characteristic.handleGetRequest(connection).then(function (value) {
                        value = request_util_1.formatOutgoingCharacteristicValue(value, characteristic.props);
                        debug('[%s] Got Characteristic "%s" value: "%s"', _this.displayName, characteristic.displayName, value);
                        var data = {
                            value: value == undefined ? null : value,
                        };
                        if (request.includeMeta) {
                            data.format = characteristic.props.format;
                            data.unit = characteristic.props.unit;
                            data.minValue = characteristic.props.minValue;
                            data.maxValue = characteristic.props.maxValue;
                            data.minStep = characteristic.props.minStep;
                            data.maxLen = characteristic.props.maxLen || characteristic.props.maxDataLen;
                        }
                        if (request.includePerms) {
                            data.perms = characteristic.props.perms;
                        }
                        if (request.includeType) {
                            data.type = uuid_1.toShortForm(_this.UUID);
                        }
                        if (request.includeEvent) {
                            data.ev = connection.hasEventNotifications(id.aid, id.iid);
                        }
                        return data;
                    }, function (reason) {
                        // @ts-expect-error
                        debug('[%s] Error getting value for characteristic "%s": %s', _this.displayName, characteristic.displayName, HAPServer_1.HAPStatus[reason]);
                        return { status: reason };
                    })];
            });
        });
    };
    Accessory.prototype.handleSetCharacteristics = function (connection, writeRequest, callback) {
        var e_18, _a;
        var _this = this;
        debug("[%s] Processing characteristic set: %s", this.displayName, JSON.stringify(writeRequest));
        var writeState = 0 /* REGULAR_REQUEST */;
        if (writeRequest.pid !== undefined) { // check for timed writes
            if (connection.timedWritePid === writeRequest.pid) {
                writeState = 1 /* TIMED_WRITE_AUTHENTICATED */;
                clearTimeout(connection.timedWriteTimeout);
                connection.timedWritePid = undefined;
                connection.timedWriteTimeout = undefined;
                debug("[%s] Timed write request got acknowledged for pid %d", this.displayName, writeRequest.pid);
            }
            else {
                writeState = 2 /* TIMED_WRITE_REJECTED */;
                debug("[%s] TTL for timed write request has probably expired for pid %d", this.displayName, writeRequest.pid);
            }
        }
        var characteristics = [];
        var response = { characteristics: characteristics };
        var missingCharacteristics = new Set(writeRequest.characteristics
            .map(function (characteristic) { return characteristic.aid + "." + characteristic.iid; }));
        if (missingCharacteristics.size !== writeRequest.characteristics.length) {
            // if those sizes differ, we have duplicates and can't properly handle that
            callback({ httpCode: 422 /* UNPROCESSABLE_ENTITY */, status: -70410 /* INVALID_VALUE_IN_REQUEST */ });
            return;
        }
        var timeout = setTimeout(function () {
            var e_19, _a;
            try {
                for (var missingCharacteristics_3 = tslib_1.__values(missingCharacteristics), missingCharacteristics_3_1 = missingCharacteristics_3.next(); !missingCharacteristics_3_1.done; missingCharacteristics_3_1 = missingCharacteristics_3.next()) {
                    var id = missingCharacteristics_3_1.value;
                    var split = id.split(".");
                    var aid = parseInt(split[0], 10);
                    var iid = parseInt(split[1], 10);
                    var accessory = _this.getAccessoryByAID(aid);
                    var characteristic = accessory.getCharacteristicByIID(iid);
                    _this.sendCharacteristicWarning(characteristic, "slow-write" /* SLOW_WRITE */, "The write handler for the characteristic '" +
                        characteristic.displayName + "' on the accessory '" + accessory.displayName + "' was slow to respond!");
                }
            }
            catch (e_19_1) { e_19 = { error: e_19_1 }; }
            finally {
                try {
                    if (missingCharacteristics_3_1 && !missingCharacteristics_3_1.done && (_a = missingCharacteristics_3.return)) _a.call(missingCharacteristics_3);
                }
                finally { if (e_19) throw e_19.error; }
            }
            // after a total of 10s we do not longer wait for a request to appear and just return status code timeout
            timeout = setTimeout(function () {
                var e_20, _a;
                timeout = undefined;
                try {
                    for (var missingCharacteristics_4 = tslib_1.__values(missingCharacteristics), missingCharacteristics_4_1 = missingCharacteristics_4.next(); !missingCharacteristics_4_1.done; missingCharacteristics_4_1 = missingCharacteristics_4.next()) {
                        var id = missingCharacteristics_4_1.value;
                        var split = id.split(".");
                        var aid = parseInt(split[0], 10);
                        var iid = parseInt(split[1], 10);
                        var accessory = _this.getAccessoryByAID(aid);
                        var characteristic = accessory.getCharacteristicByIID(iid);
                        _this.sendCharacteristicWarning(characteristic, "timeout-write" /* TIMEOUT_WRITE */, "The write handler for the characteristic '" +
                            characteristic.displayName + "' on the accessory '" + accessory.displayName + "' didn't respond at all!. Please check that you properly call the callback!");
                        characteristics.push({
                            aid: aid,
                            iid: iid,
                            status: -70408 /* OPERATION_TIMED_OUT */,
                        });
                    }
                }
                catch (e_20_1) { e_20 = { error: e_20_1 }; }
                finally {
                    try {
                        if (missingCharacteristics_4_1 && !missingCharacteristics_4_1.done && (_a = missingCharacteristics_4.return)) _a.call(missingCharacteristics_4);
                    }
                    finally { if (e_20) throw e_20.error; }
                }
                missingCharacteristics.clear();
                callback(undefined, response);
            }, 6000);
            timeout.unref();
        }, 3000);
        timeout.unref();
        var _loop_2 = function (data) {
            var name = data.aid + "." + data.iid;
            this_2.handleCharacteristicWrite(connection, data, writeState).then(function (value) {
                return tslib_1.__assign({ aid: data.aid, iid: data.iid }, value);
            }, function (reason) {
                console.error("[" + _this.displayName + "] Write request for characteristic " + name + " encountered an error: " + reason.stack);
                return {
                    aid: data.aid,
                    iid: data.iid,
                    status: -70402 /* SERVICE_COMMUNICATION_FAILURE */,
                };
            }).then(function (value) {
                if (!timeout) {
                    return; // if timeout is undefined, response was already sent out
                }
                missingCharacteristics.delete(name);
                characteristics.push(value);
                if (missingCharacteristics.size === 0) { // if everything returned send the response
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = undefined;
                    }
                    callback(undefined, response);
                }
            });
        };
        var this_2 = this;
        try {
            for (var _b = tslib_1.__values(writeRequest.characteristics), _c = _b.next(); !_c.done; _c = _b.next()) {
                var data = _c.value;
                _loop_2(data);
            }
        }
        catch (e_18_1) { e_18 = { error: e_18_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_18) throw e_18.error; }
        }
    };
    Accessory.prototype.handleCharacteristicWrite = function (connection, data, writeState) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var characteristic, evResponse, notificationsEnabled, verifiable, verifiable, allowWrite;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                characteristic = this.findCharacteristic(data.aid, data.iid);
                evResponse = undefined;
                if (!characteristic) {
                    debug('[%s] Could not find a Characteristic with aid of %s and iid of %s', this.displayName, data.aid, data.iid);
                    return [2 /*return*/, { status: -70410 /* INVALID_VALUE_IN_REQUEST */ }];
                }
                if (writeState === 2 /* TIMED_WRITE_REJECTED */) {
                    return [2 /*return*/, { status: -70410 /* INVALID_VALUE_IN_REQUEST */ }];
                }
                if (data.ev != undefined) { // register/unregister event notifications
                    notificationsEnabled = connection.hasEventNotifications(data.aid, data.iid);
                    // it seems like the Home App sends unregister requests for characteristics which don't have notify permissions
                    // see https://github.com/homebridge/HAP-NodeJS/issues/868
                    if (notificationsEnabled != data.ev) {
                        if (!characteristic.props.perms.includes("ev" /* NOTIFY */)) { // check if notify is allowed for this characteristic
                            debug('[%s] Tried %s notifications for Characteristic which does not allow notify (aid of %s and iid of %s)', this.displayName, data.ev ? "enabling" : "disabling", data.aid, data.iid);
                            return [2 /*return*/, { status: -70406 /* NOTIFICATION_NOT_SUPPORTED */ }];
                        }
                        if (characteristic.props.adminOnlyAccess && characteristic.props.adminOnlyAccess.includes(2 /* NOTIFY */)) {
                            verifiable = true;
                            if (!connection.username || !this._accessoryInfo) {
                                verifiable = false;
                                debug('[%s] Could not verify admin permissions for Characteristic which requires admin permissions for notify (aid of %s and iid of %s)', this.displayName, data.aid, data.iid);
                            }
                            if (!verifiable || !this._accessoryInfo.hasAdminPermissions(connection.username)) {
                                return [2 /*return*/, { status: -70401 /* INSUFFICIENT_PRIVILEGES */ }];
                            }
                        }
                        // we already checked that data.ev != notificationsEnabled, thus just do whatever the connection asks for
                        if (data.ev) {
                            connection.enableEventNotifications(data.aid, data.iid);
                            characteristic.subscribe();
                            evResponse = true;
                            debug('[%s] Registered Characteristic "%s" on "%s" for events', connection.remoteAddress, characteristic.displayName, this.displayName);
                        }
                        else {
                            characteristic.unsubscribe();
                            connection.disableEventNotifications(data.aid, data.iid);
                            evResponse = false;
                            debug('[%s] Unregistered Characteristic "%s" on "%s" for events', connection.remoteAddress, characteristic.displayName, this.displayName);
                        }
                    }
                    // response is returned below in the else block
                }
                if (data.value != undefined) {
                    if (!characteristic.props.perms.includes("pw" /* PAIRED_WRITE */)) { // check if write is allowed for this characteristic
                        debug('[%s] Tried writing to Characteristic which does not allow writing (aid of %s and iid of %s)', this.displayName, data.aid, data.iid);
                        return [2 /*return*/, { status: -70404 /* READ_ONLY_CHARACTERISTIC */ }];
                    }
                    if (characteristic.props.adminOnlyAccess && characteristic.props.adminOnlyAccess.includes(1 /* WRITE */)) {
                        verifiable = true;
                        if (!connection.username || !this._accessoryInfo) {
                            verifiable = false;
                            debug('[%s] Could not verify admin permissions for Characteristic which requires admin permissions for write (aid of %s and iid of %s)', this.displayName, data.aid, data.iid);
                        }
                        if (!verifiable || !this._accessoryInfo.hasAdminPermissions(connection.username)) {
                            return [2 /*return*/, { status: -70401 /* INSUFFICIENT_PRIVILEGES */ }];
                        }
                    }
                    if (characteristic.props.perms.includes("aa" /* ADDITIONAL_AUTHORIZATION */) && characteristic.additionalAuthorizationHandler) {
                        allowWrite = void 0;
                        try {
                            allowWrite = characteristic.additionalAuthorizationHandler(data.authData);
                        }
                        catch (error) {
                            console.log("[" + this.displayName + "] Additional authorization handler has thrown an error when checking authData: " + error.stack);
                            allowWrite = false;
                        }
                        if (!allowWrite) {
                            return [2 /*return*/, { status: -70411 /* INSUFFICIENT_AUTHORIZATION */ }];
                        }
                    }
                    if (characteristic.props.perms.includes("tw" /* TIMED_WRITE */) && writeState !== 1 /* TIMED_WRITE_AUTHENTICATED */) {
                        debug('[%s] Tried writing to a timed write only Characteristic without properly preparing (iid of %s and aid of %s)', this.displayName, data.aid, data.iid);
                        return [2 /*return*/, { status: -70410 /* INVALID_VALUE_IN_REQUEST */ }];
                    }
                    return [2 /*return*/, characteristic.handleSetRequest(data.value, connection).then(function (value) {
                            debug('[%s] Setting Characteristic "%s" to value %s', _this.displayName, characteristic.displayName, data.value);
                            return {
                                value: data.r && value ? request_util_1.formatOutgoingCharacteristicValue(value, characteristic.props) : undefined,
                                ev: evResponse,
                            };
                        }, function (status) {
                            // @ts-expect-error
                            debug('[%s] Error setting Characteristic "%s" to value %s: ', _this.displayName, characteristic.displayName, data.value, HAPServer_1.HAPStatus[status]);
                            return { status: status };
                        })];
                }
                else {
                    return [2 /*return*/, { ev: evResponse }];
                }
                return [2 /*return*/];
            });
        });
    };
    Accessory.prototype.handleResource = function (data, callback) {
        var _a;
        if (data["resource-type"] === "image" /* IMAGE */) {
            var aid = data.aid; // aid is optionally supplied by HomeKit (for example when camera is bridged, multiple cams, etc)
            var accessory = undefined;
            var controller = undefined;
            if (aid) {
                accessory = this.getAccessoryByAID(aid);
                if (accessory && accessory.activeCameraController) {
                    controller = accessory.activeCameraController;
                }
            }
            else if (this.activeCameraController) { // aid was not supplied, check if this accessory is a camera
                accessory = this;
                controller = this.activeCameraController;
            }
            if (!controller) {
                debug("[%s] received snapshot request though no camera controller was associated!");
                callback({ httpCode: 404 /* NOT_FOUND */, status: -70409 /* RESOURCE_DOES_NOT_EXIST */ });
                return;
            }
            controller.handleSnapshotRequest(data["image-height"], data["image-width"], accessory === null || accessory === void 0 ? void 0 : accessory.displayName).then(function (buffer) {
                callback(undefined, buffer);
            }, function (status) {
                callback({ httpCode: 200 /* OK */, status: status });
            });
            return;
        }
        debug("[%s] received request for unsupported image type: " + data["resource-type"], (_a = this._accessoryInfo) === null || _a === void 0 ? void 0 : _a.username);
        callback({ httpCode: 404 /* NOT_FOUND */, status: -70409 /* RESOURCE_DOES_NOT_EXIST */ });
    };
    Accessory.prototype.handleHAPConnectionClosed = function (connection) {
        var e_21, _a;
        if (this.activeCameraController) {
            this.activeCameraController.handleCloseConnection(connection.sessionID);
        }
        try {
            for (var _b = tslib_1.__values(connection.getRegisteredEvents()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var event = _c.value;
                var ids = event.split(".");
                var aid = parseInt(ids[0], 10);
                var iid = parseInt(ids[1], 10);
                var characteristic = this.findCharacteristic(aid, iid);
                if (characteristic) {
                    characteristic.unsubscribe();
                }
            }
        }
        catch (e_21_1) { e_21 = { error: e_21_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_21) throw e_21.error; }
        }
        connection.clearRegisteredEvents();
    };
    Accessory.prototype.handleServiceConfigurationChangeEvent = function (service) {
        if (!service.isPrimaryService && service === this.primaryService) {
            // service changed form primary to non primary service
            this.primaryService = undefined;
        }
        else if (service.isPrimaryService && service !== this.primaryService) {
            // service changed from non primary to primary service
            if (this.primaryService !== undefined) {
                this.primaryService.isPrimaryService = false;
            }
            this.primaryService = service;
        }
        if (this.bridged) {
            this.emit("service-configurationChange" /* SERVICE_CONFIGURATION_CHANGE */, { service: service });
        }
        else {
            this.enqueueConfigurationUpdate();
        }
    };
    Accessory.prototype.handleCharacteristicChangeEvent = function (accessory, service, change) {
        if (this.bridged) { // forward this to our main accessory
            this.emit("service-characteristic-change" /* SERVICE_CHARACTERISTIC_CHANGE */, tslib_1.__assign(tslib_1.__assign({}, change), { service: service }));
        }
        else {
            if (!this._server) {
                return; // we're not running a HAPServer, so there's no one to notify about this event
            }
            if (accessory.aid == undefined || change.characteristic.iid == undefined) {
                debug("[%s] Muting event notification for %s as ids aren't yet assigned!", accessory.displayName, change.characteristic.displayName);
                return;
            }
            if (change.context != undefined && typeof change.context === "object" && change.context.omitEventUpdate) {
                debug("[%s] Omitting event updates for %s as specified in the context object!", accessory.displayName, change.characteristic.displayName);
                return;
            }
            if (!(change.reason === "event" /* EVENT */ || change.oldValue !== change.newValue
                || change.characteristic.UUID === Characteristic_1.Characteristic.ProgrammableSwitchEvent.UUID // those specific checks are out of backwards compatibility
                || change.characteristic.UUID === Characteristic_1.Characteristic.ButtonEvent.UUID // new characteristics should use sendEventNotification call
            )) {
                // we only emit a change event if the reason was a call to sendEventNotification, if the value changed
                // as of a write request or a read request or if the change happened on dedicated event characteristics
                // otherwise we ignore this change event (with the return below)
                return;
            }
            var uuid_2 = change.characteristic.UUID;
            var immediateDelivery = uuid_2 === Characteristic_1.Characteristic.ButtonEvent.UUID || uuid_2 === Characteristic_1.Characteristic.ProgrammableSwitchEvent.UUID
                || uuid_2 === Characteristic_1.Characteristic.MotionDetected.UUID || uuid_2 === Characteristic_1.Characteristic.ContactSensorState.UUID;
            var value = request_util_1.formatOutgoingCharacteristicValue(change.newValue, change.characteristic.props);
            this._server.sendEventNotifications(accessory.aid, change.characteristic.iid, value, change.originator, immediateDelivery);
        }
    };
    Accessory.prototype.sendCharacteristicWarning = function (characteristic, type, message) {
        this.handleCharacteristicWarning({
            characteristic: characteristic,
            type: type,
            message: message,
            originatorChain: [characteristic.displayName],
            stack: new Error().stack,
        });
    };
    Accessory.prototype.handleCharacteristicWarning = function (warning) {
        var _a;
        warning.originatorChain = tslib_1.__spread([this.displayName], warning.originatorChain);
        var emitted = this.emit("characteristic-warning" /* CHARACTERISTIC_WARNING */, warning);
        if (!emitted) {
            var message = "[" + warning.originatorChain.join("@") + "] " + warning.message;
            if (warning.type === "error-message" /* ERROR_MESSAGE */
                || warning.type === "timeout-read" /* TIMEOUT_READ */ || warning.type === "timeout-write" /* TIMEOUT_WRITE */) {
                console.error(message);
            }
            else {
                console.warn(message);
            }
            debug("[%s] Above characteristic warning was thrown at: %s", this.displayName, (_a = warning.stack) !== null && _a !== void 0 ? _a : "unknown");
        }
    };
    Accessory.prototype.setupServiceEventHandlers = function (service) {
        service.on("service-configurationChange" /* SERVICE_CONFIGURATION_CHANGE */, this.handleServiceConfigurationChangeEvent.bind(this, service));
        service.on("characteristic-change" /* CHARACTERISTIC_CHANGE */, this.handleCharacteristicChangeEvent.bind(this, this, service));
        service.on("characteristic-warning" /* CHARACTERISTIC_WARNING */, this.handleCharacteristicWarning.bind(this));
    };
    Accessory.prototype._sideloadServices = function (targetServices) {
        var e_22, _a;
        var _this = this;
        try {
            for (var targetServices_1 = tslib_1.__values(targetServices), targetServices_1_1 = targetServices_1.next(); !targetServices_1_1.done; targetServices_1_1 = targetServices_1.next()) {
                var service = targetServices_1_1.value;
                this.setupServiceEventHandlers(service);
            }
        }
        catch (e_22_1) { e_22 = { error: e_22_1 }; }
        finally {
            try {
                if (targetServices_1_1 && !targetServices_1_1.done && (_a = targetServices_1.return)) _a.call(targetServices_1);
            }
            finally { if (e_22) throw e_22.error; }
        }
        this.services = targetServices.slice();
        // Fix Identify
        this
            .getService(Service_1.Service.AccessoryInformation)
            .getCharacteristic(Characteristic_1.Characteristic.Identify)
            .on("set" /* SET */, function (value, callback) {
            if (value) {
                var paired = true;
                _this.identificationRequest(paired, callback);
            }
        });
    };
    Accessory._generateSetupID = function () {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var max = chars.length;
        var setupID = '';
        for (var i = 0; i < 4; i++) {
            var index = Math.floor(Math.random() * max);
            setupID += chars.charAt(index);
        }
        return setupID;
    };
    // serialization and deserialization functions, mainly designed for homebridge to create a json copy to store on disk
    Accessory.serialize = function (accessory) {
        var json = {
            displayName: accessory.displayName,
            UUID: accessory.UUID,
            lastKnownUsername: accessory._accessoryInfo ? accessory._accessoryInfo.username : undefined,
            category: accessory.category,
            services: [],
        };
        var linkedServices = {};
        var hasLinkedServices = false;
        accessory.services.forEach(function (service) {
            json.services.push(Service_1.Service.serialize(service));
            var linkedServicesPresentation = [];
            service.linkedServices.forEach(function (linkedService) {
                linkedServicesPresentation.push(linkedService.getServiceId());
            });
            if (linkedServicesPresentation.length > 0) {
                linkedServices[service.getServiceId()] = linkedServicesPresentation;
                hasLinkedServices = true;
            }
        });
        if (hasLinkedServices) {
            json.linkedServices = linkedServices;
        }
        var controllers = [];
        // save controllers
        Object.values(accessory.controllers).forEach(function (context) {
            controllers.push({
                type: context.controller.controllerId(),
                services: Accessory.serializeServiceMap(context.serviceMap),
            });
        });
        // also save controller which didn't get initialized (could lead to service duplication if we throw that data away)
        accessory.serializedControllers && Object.entries(accessory.serializedControllers).forEach(function (_a) {
            var _b = tslib_1.__read(_a, 2), id = _b[0], serviceMap = _b[1];
            controllers.push({
                type: id,
                services: Accessory.serializeServiceMap(serviceMap),
            });
        });
        if (controllers.length > 0) {
            json.controllers = controllers;
        }
        return json;
    };
    Accessory.deserialize = function (json) {
        var e_23, _a;
        var accessory = new Accessory(json.displayName, json.UUID);
        accessory.lastKnownUsername = json.lastKnownUsername;
        accessory.category = json.category;
        var services = [];
        var servicesMap = {};
        json.services.forEach(function (serialized) {
            var service = Service_1.Service.deserialize(serialized);
            services.push(service);
            servicesMap[service.getServiceId()] = service;
        });
        if (json.linkedServices) {
            var _loop_3 = function (serviceId, linkedServicesKeys) {
                var primaryService = servicesMap[serviceId];
                if (!primaryService) {
                    return "continue";
                }
                linkedServicesKeys.forEach(function (linkedServiceKey) {
                    var linkedService = servicesMap[linkedServiceKey];
                    if (linkedService) {
                        primaryService.addLinkedService(linkedService);
                    }
                });
            };
            try {
                for (var _b = tslib_1.__values(Object.entries(json.linkedServices)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 2), serviceId = _d[0], linkedServicesKeys = _d[1];
                    _loop_3(serviceId, linkedServicesKeys);
                }
            }
            catch (e_23_1) { e_23 = { error: e_23_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_23) throw e_23.error; }
            }
        }
        if (json.controllers) { // just save it for later if it exists {@see configureController}
            accessory.serializedControllers = {};
            json.controllers.forEach(function (serializedController) {
                accessory.serializedControllers[serializedController.type] = Accessory.deserializeServiceMap(serializedController.services, servicesMap);
            });
        }
        accessory._sideloadServices(services);
        return accessory;
    };
    Accessory.cleanupAccessoryData = function (username) {
        IdentifierCache_1.IdentifierCache.remove(username);
        AccessoryInfo_1.AccessoryInfo.remove(username);
        ControllerStorage_1.ControllerStorage.remove(username);
    };
    Accessory.serializeServiceMap = function (serviceMap) {
        var serialized = {};
        Object.entries(serviceMap).forEach(function (_a) {
            var _b = tslib_1.__read(_a, 2), name = _b[0], service = _b[1];
            if (!service) {
                return;
            }
            serialized[name] = service.getServiceId();
        });
        return serialized;
    };
    Accessory.deserializeServiceMap = function (serializedServiceMap, servicesMap) {
        var controllerServiceMap = {};
        Object.entries(serializedServiceMap).forEach(function (_a) {
            var _b = tslib_1.__read(_a, 2), name = _b[0], serviceId = _b[1];
            var service = servicesMap[serviceId];
            if (service) {
                controllerServiceMap[name] = service;
            }
        });
        return controllerServiceMap;
    };
    Accessory.parseBindOption = function (info) {
        var e_24, _a;
        var advertiserAddress = undefined;
        var disableIpv6 = false;
        var serverAddress = undefined;
        if (info.bind) {
            var entries = new Set(Array.isArray(info.bind) ? info.bind : [info.bind]);
            if (entries.has("::")) {
                serverAddress = "::";
                entries.delete("::");
                if (entries.size) {
                    advertiserAddress = Array.from(entries);
                }
            }
            else if (entries.has("0.0.0.0")) {
                disableIpv6 = true;
                serverAddress = "0.0.0.0";
                entries.delete("0.0.0.0");
                if (entries.size) {
                    advertiserAddress = Array.from(entries);
                }
            }
            else if (entries.size === 1) {
                advertiserAddress = Array.from(entries);
                var entry = entries.values().next().value; // grab the first one
                var version = net_1.default.isIP(entry); // check if ip address was specified or a interface name
                if (version) {
                    serverAddress = version === 4 ? "0.0.0.0" : "::"; // we currently bind to unspecified addresses so config-ui always has a connection via loopback
                }
                else {
                    serverAddress = "::"; // the interface could have both ipv4 and ipv6 addresses
                }
            }
            else if (entries.size > 1) {
                advertiserAddress = Array.from(entries);
                var bindUnspecifiedIpv6 = false; // we bind on "::" if there are interface names, or we detect ipv6 addresses
                try {
                    for (var entries_1 = tslib_1.__values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
                        var entry = entries_1_1.value;
                        var version = net_1.default.isIP(entry);
                        if (version === 0 || version === 6) {
                            bindUnspecifiedIpv6 = true;
                            break;
                        }
                    }
                }
                catch (e_24_1) { e_24 = { error: e_24_1 }; }
                finally {
                    try {
                        if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                    }
                    finally { if (e_24) throw e_24.error; }
                }
                if (bindUnspecifiedIpv6) {
                    serverAddress = "::";
                }
                else {
                    serverAddress = "0.0.0.0";
                }
            }
        }
        return {
            advertiserAddress: advertiserAddress,
            serviceRestrictedAddress: advertiserAddress,
            serviceDisableIpv6: disableIpv6,
            serverAddress: serverAddress,
        };
    };
    /**
     * @deprecated Please use the Categories const enum above. Scheduled to be removed in 2021-06.
     */
    // @ts-ignore
    Accessory.Categories = Categories;
    return Accessory;
}(events_1.EventEmitter));
exports.Accessory = Accessory;
//# sourceMappingURL=Accessory.js.map