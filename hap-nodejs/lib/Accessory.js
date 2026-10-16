"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Accessory = exports.AccessoryEventTypes = exports.MDNSAdvertiser = exports.CharacteristicWarningType = exports.Categories = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const events_1 = require("events");
const net_1 = tslib_1.__importDefault(require("net"));
const Advertiser_1 = require("./Advertiser");
// noinspection JSDeprecatedSymbols
const Characteristic_1 = require("./Characteristic");
const controller_1 = require("./controller");
const HAPServer_1 = require("./HAPServer");
const AccessoryInfo_1 = require("./model/AccessoryInfo");
const ControllerStorage_1 = require("./model/ControllerStorage");
const IdentifierCache_1 = require("./model/IdentifierCache");
const Service_1 = require("./Service");
const clone_1 = require("./util/clone");
const request_util_1 = require("./util/request-util");
const uuid = tslib_1.__importStar(require("./util/uuid"));
const uuid_1 = require("./util/uuid");
const checkName_1 = require("./util/checkName");
const debug = (0, debug_1.default)("HAP-NodeJS:Accessory");
const hksvDebug = (0, debug_1.default)("HAP-NodeJS:HKSV");
const MAX_ACCESSORIES = 1000000; // Maximum number of bridged accessories per bridge.
const MAX_SERVICES = 1000000;
/**
 * Known category values. Category is a hint to iOS clients about what "type" of Accessory this represents, for UI only.
 *
 * @group Accessory
 */
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
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    Categories[Categories["SECURITY_SYSTEM"] = 11] = "SECURITY_SYSTEM";
    Categories[Categories["DOOR"] = 12] = "DOOR";
    Categories[Categories["WINDOW"] = 13] = "WINDOW";
    Categories[Categories["WINDOW_COVERING"] = 14] = "WINDOW_COVERING";
    Categories[Categories["PROGRAMMABLE_SWITCH"] = 15] = "PROGRAMMABLE_SWITCH";
    Categories[Categories["RANGE_EXTENDER"] = 16] = "RANGE_EXTENDER";
    Categories[Categories["CAMERA"] = 17] = "CAMERA";
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
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
})(Categories || (exports.Categories = Categories = {}));
/**
 * @group Accessory
 */
var CharacteristicWarningType;
(function (CharacteristicWarningType) {
    CharacteristicWarningType["SLOW_WRITE"] = "slow-write";
    CharacteristicWarningType["TIMEOUT_WRITE"] = "timeout-write";
    CharacteristicWarningType["SLOW_READ"] = "slow-read";
    CharacteristicWarningType["TIMEOUT_READ"] = "timeout-read";
    CharacteristicWarningType["WARN_MESSAGE"] = "warn-message";
    CharacteristicWarningType["ERROR_MESSAGE"] = "error-message";
    CharacteristicWarningType["DEBUG_MESSAGE"] = "debug-message";
})(CharacteristicWarningType || (exports.CharacteristicWarningType = CharacteristicWarningType = {}));
/**
 * @group Accessory
 */
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
    /**
     * Use Avahi/D-Bus as advertiser.
     */
    MDNSAdvertiser["AVAHI"] = "avahi";
    /**
     * Use systemd-resolved/D-Bus as advertiser.
     *
     * Note: The systemd-resolved D-Bus interface doesn't provide means to detect restarts of the service.
     * Therefore, we can't detect if our advertisement might be lost due to a restart of the systemd-resolved daemon restart.
     * Consequentially, treat this feature as an experimental feature.
     */
    MDNSAdvertiser["RESOLVED"] = "resolved";
})(MDNSAdvertiser || (exports.MDNSAdvertiser = MDNSAdvertiser = {}));
var WriteRequestState;
(function (WriteRequestState) {
    WriteRequestState[WriteRequestState["REGULAR_REQUEST"] = 0] = "REGULAR_REQUEST";
    WriteRequestState[WriteRequestState["TIMED_WRITE_AUTHENTICATED"] = 1] = "TIMED_WRITE_AUTHENTICATED";
    WriteRequestState[WriteRequestState["TIMED_WRITE_REJECTED"] = 2] = "TIMED_WRITE_REJECTED";
})(WriteRequestState || (WriteRequestState = {}));
/**
 * @group Accessory
 */
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
    /**
     * This event is emitted once the HAP TCP socket is bound.
     * At this point the mdns advertisement isn't yet available. Use the {@link ADVERTISED} if you require the accessory to be discoverable.
     */
    AccessoryEventTypes["LISTENING"] = "listening";
    /**
     * This event is emitted once the mDNS suite has fully advertised the presence of the accessory.
     * This event is guaranteed to be called after {@link LISTENING}.
     */
    AccessoryEventTypes["ADVERTISED"] = "advertised";
    AccessoryEventTypes["SERVICE_CONFIGURATION_CHANGE"] = "service-configurationChange";
    /**
     * Emitted after a change in the value of one of the provided Service's Characteristics.
     */
    AccessoryEventTypes["SERVICE_CHARACTERISTIC_CHANGE"] = "service-characteristic-change";
    AccessoryEventTypes["PAIRED"] = "paired";
    AccessoryEventTypes["UNPAIRED"] = "unpaired";
    AccessoryEventTypes["CHARACTERISTIC_WARNING"] = "characteristic-warning";
})(AccessoryEventTypes || (exports.AccessoryEventTypes = AccessoryEventTypes = {}));
/**
 * Accessory is a virtual HomeKit device. It can publish an associated HAP server for iOS devices to communicate
 * with - or it can run behind another "Bridge" Accessory server.
 *
 * Bridged Accessories in this implementation must have a UUID that is unique among all other Accessories that
 * are hosted by the Bridge. This UUID must be "stable" and unchanging, even when the server is restarted. This
 * is required so that the Bridge can provide consistent "Accessory IDs" (aid) and "Instance IDs" (iid) for all
 * Accessories, Services, and Characteristics for iOS clients to reference later.
 *
 * @group Accessory
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class Accessory extends events_1.EventEmitter {
    displayName;
    UUID;
    // Timeout in milliseconds until a characteristic warning is issue
    static TIMEOUT_WARNING = 3000;
    // Timeout in milliseconds after `TIMEOUT_WARNING` until the operation on the characteristic is considered timed out.
    static TIMEOUT_AFTER_WARNING = 6000;
    // NOTICE: when adding/changing properties, remember to possibly adjust the serialize/deserialize functions
    aid = null; // assigned by us in assignIDs() or by a Bridge
    _isBridge = false; // true if we are a Bridge (creating a new instance of the Bridge subclass sets this to true)
    bridged = false; // true if we are hosted "behind" a Bridge Accessory
    bridge; // if accessory is bridged, this property points to the bridge which bridges this accessory
    bridgedAccessories = []; // If we are a Bridge, these are the Accessories we are bridging
    reachable = true;
    lastKnownUsername;
    category = 1 /* Categories.OTHER */;
    services = [];
    primaryService;
    shouldPurgeUnusedIDs = true; // Purge unused ids by default
    /**
     * Captures if initialization steps inside {@link publish} have been called.
     * This is important when calling {@link publish} multiple times (e.g. after calling {@link unpublish}).
     * @private Private API
     */
    initialized = false;
    controllers = {};
    serializedControllers; // store uninitialized controller data after a Accessory.deserialize call
    activeCameraController;
    /**
     * @private Private API.
     */
    _accessoryInfo;
    /**
     * @private Private API.
     */
    _setupID = null;
    /**
     * @private Private API.
     */
    _identifierCache;
    /**
     * @private Private API.
     */
    controllerStorage;
    /**
     * @private Private API.
     */
    _advertiser;
    /**
     * @private Private API.
     */
    _server;
    /**
     * @private Private API.
     */
    _setupURI;
    configurationChangeDebounceTimeout;
    /**
     * This property captures the time when we last served a /accessories request.
     * For multiple bursts of /accessories request we don't want to always contact GET handlers
     */
    lastAccessoriesRequest = 0;
    constructor(displayName, UUID) {
        super();
        this.displayName = displayName;
        this.UUID = UUID;
        (0, assert_1.default)(displayName, "Accessories must be created with a non-empty displayName.");
        (0, assert_1.default)(UUID, "Accessories must be created with a valid UUID.");
        (0, assert_1.default)(uuid.isValid(UUID), "UUID '" + UUID + "' is not a valid UUID. Try using the provided 'generateUUID' function to create a " +
            "valid UUID from any arbitrary string, like a serial number.");
        this.controllerStorage = new ControllerStorage_1.ControllerStorage(this);
        // create our initial "Accessory Information" Service that all Accessories are expected to have
        (0, checkName_1.checkName)(this.displayName, "Name", displayName);
        this.addService(Service_1.Service.AccessoryInformation)
            .setCharacteristic(Characteristic_1.Characteristic.Name, displayName);
        // sign up for when iOS attempts to "set" the `Identify` characteristic - this means a paired device wishes
        // for us to identify ourselves (as opposed to an unpaired device - that case is handled by HAPServer 'identify' event)
        this.getService(Service_1.Service.AccessoryInformation)
            .getCharacteristic(Characteristic_1.Characteristic.Identify)
            .on("set" /* CharacteristicEventTypes.SET */, (value, callback) => {
            if (value) {
                const paired = true;
                this.identificationRequest(paired, callback);
            }
        });
    }
    identificationRequest(paired, callback) {
        debug("[%s] Identification request", this.displayName);
        if (this.listeners("identify" /* AccessoryEventTypes.IDENTIFY */).length > 0) {
            // allow implementors to identify this Accessory in whatever way is appropriate, and pass along
            // the standard callback for completion.
            this.emit("identify" /* AccessoryEventTypes.IDENTIFY */, paired, callback);
        }
        else {
            debug("[%s] Identification request ignored; no listeners to 'identify' event", this.displayName);
            callback();
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addService(serviceParam, ...constructorArgs) {
        // service might be a constructor like `Service.AccessoryInformation` instead of an instance
        // of Service. Coerce if necessary.
        const service = typeof serviceParam === "function"
            ? new serviceParam(constructorArgs[0], constructorArgs[1], constructorArgs[2])
            : serviceParam;
        // check for UUID+subtype conflict
        for (const existing of this.services) {
            if (existing.UUID === service.UUID) {
                // OK we have two Services with the same UUID. Check that each defines a `subtype` property and that each is unique.
                if (!service.subtype) {
                    throw new Error("Cannot add a Service with the same UUID '" + existing.UUID +
                        "' as another Service in this Accessory without also defining a unique 'subtype' property.");
                }
                if (service.subtype === existing.subtype) {
                    throw new Error("Cannot add a Service with the same UUID '" + existing.UUID +
                        "' and subtype '" + existing.subtype + "' as another Service in this Accessory.");
                }
            }
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
            this.emit("service-configurationChange" /* AccessoryEventTypes.SERVICE_CONFIGURATION_CHANGE */, { service: service });
        }
        this.setupServiceEventHandlers(service);
        return service;
    }
    removeService(service) {
        const index = this.services.indexOf(service);
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
                this.emit("service-configurationChange" /* AccessoryEventTypes.SERVICE_CONFIGURATION_CHANGE */, { service: service });
            }
            service.removeAllListeners();
        }
    }
    removeLinkedService(removed) {
        for (const service of this.services) {
            service.removeLinkedService(removed);
        }
    }
    getService(name) {
        for (const service of this.services) {
            if (typeof name === "string" && (service.displayName === name || service.name === name || service.subtype === name)) {
                return service;
            }
            else {
                // @ts-expect-error ('UUID' does not exist on type 'never')
                if (typeof name === "function" && ((service instanceof name) || (name.UUID === service.UUID))) {
                    return service;
                }
            }
        }
        return undefined;
    }
    getServiceById(uuid, subType) {
        for (const service of this.services) {
            if (typeof uuid === "string" && (service.displayName === uuid || service.name === uuid) && service.subtype === subType) {
                return service;
            }
            else {
                // @ts-expect-error ('UUID' does not exist on type 'never')
                if (typeof uuid === "function" && ((service instanceof uuid) || (uuid.UUID === service.UUID)) && service.subtype === subType) {
                    return service;
                }
            }
        }
        return undefined;
    }
    /**
     * Returns the bridging accessory if this accessory is bridged.
     * Otherwise, returns itself.
     *
     * @returns the primary accessory
     */
    getPrimaryAccessory = () => {
        return this.bridged ? this.bridge : this;
    };
    addBridgedAccessory(accessory, deferUpdate = false) {
        if (accessory._isBridge || accessory === this) {
            throw new Error("Illegal state: either trying to bridge a bridge or trying to bridge itself!");
        }
        if (accessory.initialized) {
            throw new Error("Tried to bridge an accessory which was already published once!");
        }
        if (accessory.bridge != null) {
            // this also prevents that we bridge the same accessory twice!
            throw new Error("Tried to bridge " + accessory.displayName + " while it was already bridged by " + accessory.bridge.displayName);
        }
        if (this.bridgedAccessories.length >= MAX_ACCESSORIES) {
            throw new Error("Cannot Bridge more than " + MAX_ACCESSORIES + " Accessories");
        }
        // listen for changes in ANY characteristics of ANY services on this Accessory
        accessory.on("service-characteristic-change" /* AccessoryEventTypes.SERVICE_CHARACTERISTIC_CHANGE */, change => this.handleCharacteristicChangeEvent(accessory, change.service, change));
        accessory.on("service-configurationChange" /* AccessoryEventTypes.SERVICE_CONFIGURATION_CHANGE */, this.enqueueConfigurationUpdate.bind(this));
        accessory.on("characteristic-warning" /* AccessoryEventTypes.CHARACTERISTIC_WARNING */, this.handleCharacteristicWarning.bind(this));
        accessory.bridged = true;
        accessory.bridge = this;
        this.bridgedAccessories.push(accessory);
        this.controllerStorage.linkAccessory(accessory); // init controllers of bridged accessory
        if (!deferUpdate) {
            this.enqueueConfigurationUpdate();
        }
        return accessory;
    }
    addBridgedAccessories(accessories) {
        for (const accessory of accessories) {
            this.addBridgedAccessory(accessory, true);
        }
        this.enqueueConfigurationUpdate();
    }
    removeBridgedAccessory(accessory, deferUpdate = false) {
        // check for UUID conflict
        const accessoryIndex = this.bridgedAccessories.indexOf(accessory);
        if (accessoryIndex === -1) {
            throw new Error("Cannot find the bridged Accessory to remove.");
        }
        this.bridgedAccessories.splice(accessoryIndex, 1);
        accessory.bridged = false;
        accessory.bridge = undefined;
        accessory.removeAllListeners();
        if (!deferUpdate) {
            this.enqueueConfigurationUpdate();
        }
    }
    removeBridgedAccessories(accessories) {
        for (const accessory of accessories) {
            this.removeBridgedAccessory(accessory, true);
        }
        this.enqueueConfigurationUpdate();
    }
    removeAllBridgedAccessories() {
        for (let i = this.bridgedAccessories.length - 1; i >= 0; i--) {
            this.removeBridgedAccessory(this.bridgedAccessories[i], true);
        }
        this.enqueueConfigurationUpdate();
    }
    getCharacteristicByIID(iid) {
        for (const service of this.services) {
            const characteristic = service.getCharacteristicByIID(iid);
            if (characteristic) {
                return characteristic;
            }
        }
    }
    getAccessoryByAID(aid) {
        if (this.aid === aid) {
            return this;
        }
        return this.bridgedAccessories.find(value => value.aid === aid);
    }
    findCharacteristic(aid, iid) {
        const accessory = this.getAccessoryByAID(aid);
        return accessory && accessory.getCharacteristicByIID(iid);
    }
    /**
     * This method is used to set up a new Controller for this accessory. See {@link Controller} for a more detailed
     * explanation what a Controller is and what it is capable of.
     *
     * The controller can be passed as an instance of the class or as a constructor (without any necessary parameters)
     * for a new Controller.
     * Only one Controller of a given {@link ControllerIdentifier} can be configured for a given Accessory.
     *
     * When called, it will be checked if there are any services and persistent data the Controller (for the given
     * {@link ControllerIdentifier}) can be restored from. Otherwise, the Controller will be created with new services.
     *
     *
     * @param controllerConstructor - The Controller instance or constructor to the Controller with no required arguments.
     */
    configureController(controllerConstructor) {
        const controller = typeof controllerConstructor === "function"
            ? new controllerConstructor() // any custom constructor arguments should be passed before using .bind(...)
            : controllerConstructor;
        const id = controller.controllerId();
        if (this.controllers[id]) {
            throw new Error(`A Controller with the type/id '${id}' was already added to the accessory ${this.displayName}`);
        }
        const savedServiceMap = this.serializedControllers && this.serializedControllers[id];
        let serviceMap;
        if (savedServiceMap) { // we found data to restore from
            const clonedServiceMap = (0, clone_1.clone)(savedServiceMap);
            const updatedServiceMap = controller.initWithServices(savedServiceMap); // init controller with existing services
            serviceMap = updatedServiceMap || savedServiceMap; // initWithServices could return an updated serviceMap, otherwise just use the existing one
            if (updatedServiceMap) { // controller returned a ServiceMap and thus signaled an updated set of services
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
            Object.values(serviceMap).forEach(service => {
                if (service && !this.services.includes(service)) {
                    this.addService(service);
                }
            });
        }
        // --- init handlers and setup context ---
        const context = {
            controller: controller,
            serviceMap: serviceMap,
        };
        if ((0, controller_1.isSerializableController)(controller)) {
            this.controllerStorage.trackController(controller);
        }
        this.controllers[id] = context;
        if (controller instanceof controller_1.CameraController) { // save CameraController for Snapshot handling
            this.activeCameraController = controller;
        }
    }
    /**
     * This method will remove a given Controller from this accessory.
     * The controller object will be restored to its initial state.
     * This also means that any event handlers setup for the controller will be removed.
     *
     * @param controller - The controller which should be removed from the accessory.
     */
    removeController(controller) {
        const id = controller.controllerId();
        const storedController = this.controllers[id];
        if (storedController) {
            if (storedController.controller !== controller) {
                throw new Error("[" + this.displayName + "] tried removing a controller with the id/type '" + id +
                    "' though provided controller isn't the same instance that is registered!");
            }
            if ((0, controller_1.isSerializableController)(controller)) {
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
            Object.values(storedController.serviceMap).forEach(service => {
                if (service) {
                    this.removeService(service);
                }
            });
        }
        if (this.serializedControllers) {
            delete this.serializedControllers[id];
        }
    }
    handleAccessoryUnpairedForControllers() {
        for (const context of Object.values(this.controllers)) {
            const controller = context.controller;
            if (controller.handleFactoryReset) { // if the controller implements handleFactoryReset, setup event handlers for this controller
                controller.handleFactoryReset();
            }
            if ((0, controller_1.isSerializableController)(controller)) {
                this.controllerStorage.purgeControllerData(controller);
            }
        }
    }
    handleUpdatedControllerServiceMap(originalServiceMap, updatedServiceMap) {
        updatedServiceMap = (0, clone_1.clone)(updatedServiceMap); // clone it so we can alter it
        Object.keys(originalServiceMap).forEach(name => {
            const service = originalServiceMap[name];
            const updatedService = updatedServiceMap[name];
            if (service && updatedService) { // we check all names contained in both ServiceMaps for changes
                delete originalServiceMap[name]; // delete from original ServiceMap, so it will only contain deleted services at the end
                delete updatedServiceMap[name]; // delete from updated ServiceMap, so it will only contain added services at the end
                if (service !== updatedService) {
                    this.removeService(service);
                    this.addService(updatedService);
                }
            }
        });
        // now originalServiceMap contains only deleted services and updateServiceMap only added services
        Object.values(originalServiceMap).forEach(service => {
            if (service) {
                this.removeService(service);
            }
        });
        Object.values(updatedServiceMap).forEach(service => {
            if (service) {
                this.addService(service);
            }
        });
    }
    setupURI() {
        if (this._setupURI) {
            return this._setupURI;
        }
        (0, assert_1.default)(!!this._accessoryInfo, "Cannot generate setupURI on an accessory that isn't published yet!");
        const buffer = Buffer.alloc(8);
        let value_low = parseInt(this._accessoryInfo.pincode.replace(/-/g, ""), 10);
        const value_high = this._accessoryInfo.category >> 1;
        value_low |= 1 << 28; // Supports IP;
        buffer.writeUInt32BE(value_low, 4);
        if (this._accessoryInfo.category & 1) {
            buffer[4] = buffer[4] | 1 << 7;
        }
        buffer.writeUInt32BE(value_high, 0);
        let encodedPayload = (buffer.readUInt32BE(4) + (buffer.readUInt32BE(0) * 0x100000000)).toString(36).toUpperCase();
        if (encodedPayload.length !== 9) {
            for (let i = 0; i <= 9 - encodedPayload.length; i++) {
                encodedPayload = "0" + encodedPayload;
            }
        }
        this._setupURI = "X-HM://" + encodedPayload + this._setupID;
        return this._setupURI;
    }
    /**
     * This method is called right before the accessory is published. It should be used to check for common
     * mistakes in Accessory structured, which may lead to HomeKit rejecting the accessory when pairing.
     * If it is called on a bridge it will call this method for all bridged accessories.
     */
    validateAccessory(mainAccessory) {
        const service = this.getService(Service_1.Service.AccessoryInformation);
        if (!service) {
            console.log("HAP-NodeJS WARNING: The accessory '" + this.displayName + "' is getting published without a AccessoryInformation service. " +
                "This might prevent the accessory from being added to the Home app or leading to the accessory being unresponsive!");
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const checkValue = (name, value) => {
                if (!value) {
                    console.log("HAP-NodeJS WARNING: The accessory '" + this.displayName + "' is getting published with the characteristic '" + name + "'" +
                        " (of the AccessoryInformation service) not having a value set. " +
                        "This might prevent the accessory from being added to the Home App or leading to the accessory being unresponsive!");
                }
            };
            (0, checkName_1.checkName)(this.displayName, "Name", service.getCharacteristic(Characteristic_1.Characteristic.Name).value);
            checkValue("FirmwareRevision", service.getCharacteristic(Characteristic_1.Characteristic.FirmwareRevision).value);
            checkValue("Manufacturer", service.getCharacteristic(Characteristic_1.Characteristic.Manufacturer).value);
            checkValue("Model", service.getCharacteristic(Characteristic_1.Characteristic.Model).value);
            checkValue("Name", service.getCharacteristic(Characteristic_1.Characteristic.Name).value);
            checkValue("SerialNumber", service.getCharacteristic(Characteristic_1.Characteristic.SerialNumber).value);
        }
        if (mainAccessory) {
            // the main accessory which is advertised via bonjour must have a name with length <= 63 (limitation of DNS FQDN names)
            (0, assert_1.default)(Buffer.from(this.displayName, "utf8").length <= 63, "Accessory displayName cannot be longer than 63 bytes!");
        }
        if (this.bridged) {
            this.bridgedAccessories.forEach(accessory => accessory.validateAccessory());
        }
    }
    /**
     * Assigns aid/iid to ourselves, any Accessories we are bridging, and all associated Services+Characteristics. Uses
     * the provided identifierCache to keep IDs stable.
     * @private Private API
     */
    _assignIDs(identifierCache) {
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
        for (const service of this.services) {
            if (this._isBridge) {
                service._assignIDs(identifierCache, this.UUID, 2000000000);
            }
            else {
                service._assignIDs(identifierCache, this.UUID);
            }
        }
        // now assign IDs for any Accessories we are bridging
        for (const accessory of this.bridgedAccessories) {
            accessory._assignIDs(identifierCache);
        }
        // expire any now-unused cache keys (for Accessories, Services, or Characteristics
        // that have been removed since the last call to assignIDs())
        if (this._identifierCache) {
            //Check weather we want to purge the unused ids
            if (this.shouldPurgeUnusedIDs) {
                this._identifierCache.stopTrackingUsageAndExpireUnused();
            }
            //Save in case we have new ones
            this._identifierCache.save();
        }
    }
    disableUnusedIDPurge() {
        this.shouldPurgeUnusedIDs = false;
    }
    enableUnusedIDPurge() {
        this.shouldPurgeUnusedIDs = true;
    }
    /**
     * Manually purge the unused ids if you like, comes handy
     * when you have disabled auto purge, so you can do it manually
     */
    purgeUnusedIDs() {
        //Cache the state of the purge mechanism and set it to true
        const oldValue = this.shouldPurgeUnusedIDs;
        this.shouldPurgeUnusedIDs = true;
        //Reassign all ids
        this._assignIDs(this._identifierCache);
        // Revert the purge mechanism state
        this.shouldPurgeUnusedIDs = oldValue;
    }
    /**
     * Returns a JSON representation of this accessory suitable for delivering to HAP clients.
     */
    async toHAP(connection, contactGetHandlers = true) {
        (0, assert_1.default)(this.aid, "aid cannot be undefined for accessory '" + this.displayName + "'");
        (0, assert_1.default)(this.services.length, "accessory '" + this.displayName + "' does not have any services!");
        const accessory = {
            aid: this.aid,
            services: await Promise.all(this.services.map(service => service.toHAP(connection, contactGetHandlers))),
        };
        const accessories = [accessory];
        if (!this.bridged) {
            accessories.push(...await Promise.all(this.bridgedAccessories
                .map(accessory => accessory.toHAP(connection, contactGetHandlers).then(value => value[0]))));
        }
        return accessories;
    }
    /**
     * Returns a JSON representation of this accessory without characteristic values.
     */
    internalHAPRepresentation(assignIds = true) {
        if (assignIds) {
            this._assignIDs(this._identifierCache); // make sure our aid/iid's are all assigned
        }
        (0, assert_1.default)(this.aid, "aid cannot be undefined for accessory '" + this.displayName + "'");
        (0, assert_1.default)(this.services.length, "accessory '" + this.displayName + "' does not have any services!");
        const accessory = {
            aid: this.aid,
            services: this.services.map(service => service.internalHAPRepresentation()),
        };
        const accessories = [accessory];
        if (!this.bridged) {
            for (const accessory of this.bridgedAccessories) {
                accessories.push(accessory.internalHAPRepresentation(false)[0]);
            }
        }
        return accessories;
    }
    /**
     * Publishes this accessory on the local network for iOS clients to communicate with.
     * - `info.username` - formatted as a MAC address, like `CC:22:3D:E3:CE:F6`, of this accessory.
     *   Must be globally unique from all Accessories on your local network.
     * - `info.pincode` - the 8-digit pin code for clients to use when pairing this Accessory.
     *   Must be formatted as a string like `031-45-154`.
     * - `info.category` - one of the values of the `Accessory.Category` enum, like `Accessory.Category.SWITCH`.
     *   This is a hint to iOS clients about what "type" of Accessory this represents, so
     *   that for instance an appropriate icon can be drawn for the user while adding a
     *   new Accessory.
     * @param {{
     *   username: string;
     *   pincode: string;
     *   category: Accessory.Categories;
     * }} info - Required info for publishing.
     * @param {boolean} allowInsecureRequest - Will allow unencrypted and unauthenticated access to the http server
     */
    async publish(info, allowInsecureRequest) {
        if (this.bridged) {
            throw new Error("Can't publish in accessory which is bridged by another accessory. Bridged by " + this.bridge?.displayName);
        }
        let service = this.getService(Service_1.Service.ProtocolInformation);
        if (!service) {
            service = this.addService(Service_1.Service.ProtocolInformation); // add the protocol information service to the primary accessory
        }
        service.setCharacteristic(Characteristic_1.Characteristic.Version, Advertiser_1.CiaoAdvertiser.protocolVersionService);
        hksvDebug("[%s] publish: UUID=%s lastKnownUsername=%s newUsername=%s", this.displayName, this.UUID, this.lastKnownUsername, info.username);
        if (this.lastKnownUsername && this.lastKnownUsername !== info.username) { // username changed since last publish
            hksvDebug("[%s] publish: wiping data for previous username %s", this.displayName, this.lastKnownUsername);
            Accessory.cleanupAccessoryData(this.lastKnownUsername); // delete old Accessory data
        }
        if (!this.initialized && (info.addIdentifyingMaterial ?? true)) {
            // adding some identifying material to our displayName if it's our first publish() call
            this.displayName = this.displayName + " " + crypto_1.default.createHash("sha512")
                .update(info.username, "utf8")
                .digest("hex").slice(0, 4).toUpperCase();
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
        this._accessoryInfo.category = info.category || 1 /* Categories.OTHER */;
        this._accessoryInfo.pincode = info.pincode;
        this._accessoryInfo.save();
        // create our IdentifierCache, so we can provide clients with stable aid/iid's
        this._identifierCache = IdentifierCache_1.IdentifierCache.load(info.username);
        // if we don't have one, create a new one.
        if (!this._identifierCache) {
            debug("[%s] Creating new IdentifierCache", this.displayName);
            this._identifierCache = new IdentifierCache_1.IdentifierCache(info.username);
        }
        // If it's bridge and there are no accessories already assigned to the bridge
        // probably purge is not needed since it's going to delete all the ids
        // of accessories that might be added later. Useful when dynamically adding
        // accessories.
        if (this._isBridge && this.bridgedAccessories.length === 0) {
            this.disableUnusedIDPurge();
            this.controllerStorage.purgeUnidentifiedAccessoryData = false;
        }
        if (!this.initialized) { // controller storage is only loaded from disk the first time we publish!
            this.controllerStorage.load(info.username); // initializing controller data
        }
        // assign aid/iid
        this._assignIDs(this._identifierCache);
        // get our accessory information in HAP format and determine if our configuration (that is, our
        // Accessories/Services/Characteristics) has changed since the last time we were published. make
        // sure to omit actual values since these are not part of the "configuration".
        const config = this.internalHAPRepresentation(false); // TODO ensure this stuff is ordered
        // TODO queue this check until about 5 seconds after startup, allowing some last changes after the publish call
        //   without constantly incrementing the current config number
        this._accessoryInfo.checkForCurrentConfigurationNumberIncrement(config, true);
        this.validateAccessory(true);
        // create our Advertiser which broadcasts our presence over mdns
        const parsed = Accessory.parseBindOption(info);
        info.advertiser ??= "ciao" /* MDNSAdvertiser.CIAO */;
        if ((info.advertiser === "avahi" /* MDNSAdvertiser.AVAHI */ && !await Advertiser_1.AvahiAdvertiser.isAvailable()) ||
            (info.advertiser === "resolved" /* MDNSAdvertiser.RESOLVED */ && !await Advertiser_1.ResolvedAdvertiser.isAvailable())) {
            console.error(`[${this.displayName}] The selected advertiser, "${info.advertiser}", isn't available on this platform. ` +
                `Reverting to "${"ciao" /* MDNSAdvertiser.CIAO */}"`);
            info.advertiser = "ciao" /* MDNSAdvertiser.CIAO */;
        }
        switch (info.advertiser) {
            case "ciao" /* MDNSAdvertiser.CIAO */:
                this._advertiser = new Advertiser_1.CiaoAdvertiser(this._accessoryInfo, {
                    interface: parsed.advertiserAddress,
                }, {
                    restrictedAddresses: parsed.serviceRestrictedAddress,
                    disabledIpv6: parsed.serviceDisableIpv6,
                });
                break;
            case "bonjour-hap" /* MDNSAdvertiser.BONJOUR */:
                this._advertiser = new Advertiser_1.BonjourHAPAdvertiser(this._accessoryInfo, {
                    restrictedAddresses: parsed.serviceRestrictedAddress,
                    disabledIpv6: parsed.serviceDisableIpv6,
                });
                break;
            case "avahi" /* MDNSAdvertiser.AVAHI */:
                this._advertiser = new Advertiser_1.AvahiAdvertiser(this._accessoryInfo);
                break;
            case "resolved" /* MDNSAdvertiser.RESOLVED */:
                this._advertiser = new Advertiser_1.ResolvedAdvertiser(this._accessoryInfo);
                break;
            default:
                throw new Error("Unsupported advertiser setting: '" + info.advertiser + "'");
        }
        this._advertiser.on("updated-name" /* AdvertiserEvent.UPDATED_NAME */, name => {
            this.displayName = name;
            if (this._accessoryInfo) {
                this._accessoryInfo.displayName = name;
                this._accessoryInfo.save();
            }
            // bonjour service name MUST match the name in the accessory information service
            this.getService(Service_1.Service.AccessoryInformation)
                .updateCharacteristic(Characteristic_1.Characteristic.Name, name);
        });
        // create our HAP server which handles all communication between iOS devices and us
        this._server = new HAPServer_1.HAPServer(this._accessoryInfo);
        this._server.allowInsecureRequest = !!allowInsecureRequest;
        this._server.on("listening" /* HAPServerEventTypes.LISTENING */, this.onListening.bind(this));
        this._server.on("identify" /* HAPServerEventTypes.IDENTIFY */, this.identificationRequest.bind(this, false));
        this._server.on("pair" /* HAPServerEventTypes.PAIR */, this.handleInitialPairSetupFinished.bind(this));
        this._server.on("add-pairing" /* HAPServerEventTypes.ADD_PAIRING */, this.handleAddPairing.bind(this));
        this._server.on("remove-pairing" /* HAPServerEventTypes.REMOVE_PAIRING */, this.handleRemovePairing.bind(this));
        this._server.on("list-pairings" /* HAPServerEventTypes.LIST_PAIRINGS */, this.handleListPairings.bind(this));
        this._server.on("accessories" /* HAPServerEventTypes.ACCESSORIES */, this.handleAccessories.bind(this));
        this._server.on("get-characteristics" /* HAPServerEventTypes.GET_CHARACTERISTICS */, this.handleGetCharacteristics.bind(this));
        this._server.on("set-characteristics" /* HAPServerEventTypes.SET_CHARACTERISTICS */, this.handleSetCharacteristics.bind(this));
        this._server.on("connection-closed" /* HAPServerEventTypes.CONNECTION_CLOSED */, this.handleHAPConnectionClosed.bind(this));
        this._server.on("request-resource" /* HAPServerEventTypes.REQUEST_RESOURCE */, this.handleResource.bind(this));
        this._server.listen(info.port, parsed.serverAddress);
        this.initialized = true;
    }
    /**
     * Removes this Accessory from the local network
     * Accessory object will no longer valid after invoking this method
     * Trying to invoke publish() on the object will result undefined behavior
     */
    destroy() {
        const promise = this.unpublish();
        if (this._accessoryInfo) {
            Accessory.cleanupAccessoryData(this._accessoryInfo.username);
            this._accessoryInfo = undefined;
            this._identifierCache = undefined;
            this.controllerStorage = new ControllerStorage_1.ControllerStorage(this);
        }
        this.removeAllListeners();
        return promise;
    }
    async unpublish() {
        if (this._server) {
            this._server.destroy();
            this._server = undefined;
        }
        if (this._advertiser) {
            // noinspection JSIgnoredPromiseFromCall
            await this._advertiser.destroy();
            this._advertiser = undefined;
        }
    }
    enqueueConfigurationUpdate() {
        if (this.configurationChangeDebounceTimeout) {
            return; // already enqueued
        }
        this.configurationChangeDebounceTimeout = setTimeout(() => {
            this.configurationChangeDebounceTimeout = undefined;
            if (this._advertiser) {
                // get our accessory information in HAP format and determine if our configuration (that is, our
                // Accessories/Services/Characteristics) has changed since the last time we were published. make
                // sure to omit actual values since these are not part of the "configuration".
                const config = this.internalHAPRepresentation(); // TODO ensure this stuff is ordered
                if (this._accessoryInfo?.checkForCurrentConfigurationNumberIncrement(config)) {
                    this._advertiser.updateAdvertisement();
                }
            }
        }, 1000);
        this.configurationChangeDebounceTimeout.unref();
        // 1s is fine, HomeKit is built that with configuration updates no iid or aid conflicts occur.
        // Thus, the only thing happening when the txt update arrives late is already removed accessories/services
        // not responding or new accessories/services not yet shown
    }
    onListening(port, hostname) {
        (0, assert_1.default)(this._advertiser, "Advertiser wasn't created at onListening!");
        // the HAP server is listening, so we can now start advertising our presence.
        this._advertiser.initPort(port);
        this._advertiser.startAdvertising()
            .then(() => this.emit("advertised" /* AccessoryEventTypes.ADVERTISED */))
            .catch(reason => {
            console.error("Could not create mDNS advertisement. The HAP-Server won't be discoverable: " + reason);
            if (reason.stack) {
                debug("Detailed error: " + reason.stack);
            }
        });
        this.emit("listening" /* AccessoryEventTypes.LISTENING */, port, hostname);
    }
    handleInitialPairSetupFinished(username, publicKey, callback) {
        debug("[%s] Paired with client %s", this.displayName, username);
        if (this._accessoryInfo) {
            this._accessoryInfo.addPairedClient(username, publicKey, 1 /* PermissionTypes.ADMIN */);
            this._accessoryInfo.save();
        }
        // update our advertisement, so it can pick up on the paired status of AccessoryInfo
        if (this._advertiser) {
            this._advertiser.updateAdvertisement();
        }
        callback();
        this.emit("paired" /* AccessoryEventTypes.PAIRED */);
    }
    handleAddPairing(connection, username, publicKey, permission, callback) {
        if (!this._accessoryInfo) {
            callback(6 /* TLVErrorCode.UNAVAILABLE */);
            return;
        }
        if (!this._accessoryInfo.hasAdminPermissions(connection.username)) {
            callback(2 /* TLVErrorCode.AUTHENTICATION */);
            return;
        }
        const existingKey = this._accessoryInfo.getClientPublicKey(username);
        if (existingKey) {
            if (existingKey.toString() !== publicKey.toString()) {
                callback(1 /* TLVErrorCode.UNKNOWN */);
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
    }
    handleRemovePairing(connection, username, callback) {
        if (!this._accessoryInfo) {
            callback(6 /* TLVErrorCode.UNAVAILABLE */);
            return;
        }
        if (!this._accessoryInfo.hasAdminPermissions(connection.username)) {
            callback(2 /* TLVErrorCode.AUTHENTICATION */);
            return;
        }
        this._accessoryInfo.removePairedClient(connection, username);
        this._accessoryInfo.save();
        callback(0); // first of all ensure the pairing is removed before we advertise availability again
        if (!this._accessoryInfo.paired()) {
            if (this._advertiser) {
                this._advertiser.updateAdvertisement();
            }
            this.emit("unpaired" /* AccessoryEventTypes.UNPAIRED */);
            this.handleAccessoryUnpairedForControllers();
            for (const accessory of this.bridgedAccessories) {
                accessory.handleAccessoryUnpairedForControllers();
            }
        }
    }
    handleListPairings(connection, callback) {
        if (!this._accessoryInfo) {
            callback(6 /* TLVErrorCode.UNAVAILABLE */);
            return;
        }
        if (!this._accessoryInfo.hasAdminPermissions(connection.username)) {
            callback(2 /* TLVErrorCode.AUTHENTICATION */);
            return;
        }
        callback(0, this._accessoryInfo.listPairings());
    }
    handleAccessories(connection, callback) {
        this._assignIDs(this._identifierCache); // make sure our aid/iid's are all assigned
        const now = Date.now();
        const contactGetHandlers = now - this.lastAccessoriesRequest > 5_000; // we query the latest value if last /accessories was more than 5s ago
        this.lastAccessoriesRequest = now;
        this.toHAP(connection, contactGetHandlers).then(value => {
            callback(undefined, {
                accessories: value,
            });
        }, reason => {
            console.error("[" + this.displayName + "] /accessories request error with: " + reason.stack);
            callback({ httpCode: 500 /* HAPHTTPCode.INTERNAL_SERVER_ERROR */, status: -70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */ });
        });
    }
    handleGetCharacteristics(connection, request, callback) {
        const characteristics = [];
        const response = { characteristics: characteristics };
        const missingCharacteristics = new Set(request.ids.map(id => id.aid + "." + id.iid));
        if (missingCharacteristics.size !== request.ids.length) {
            // if those sizes differ, we have duplicates and can't properly handle that
            callback({ httpCode: 422 /* HAPHTTPCode.UNPROCESSABLE_ENTITY */, status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ });
            return;
        }
        let timeout = setTimeout(() => {
            for (const id of missingCharacteristics) {
                const split = id.split(".");
                const aid = parseInt(split[0], 10);
                const iid = parseInt(split[1], 10);
                const accessory = this.getAccessoryByAID(aid);
                const characteristic = accessory?.getCharacteristicByIID(iid);
                if (!accessory || !characteristic) {
                    continue;
                }
                this.sendCharacteristicWarning(characteristic, "slow-read" /* CharacteristicWarningType.SLOW_READ */, "The read handler for the characteristic '" +
                    characteristic.displayName + "' on the accessory '" + accessory.displayName + "' was slow to respond!");
            }
            // after a total of 10s we do no longer wait for a request to appear and just return status code timeout
            timeout = setTimeout(() => {
                timeout = undefined;
                for (const id of missingCharacteristics) {
                    const split = id.split(".");
                    const aid = parseInt(split[0], 10);
                    const iid = parseInt(split[1], 10);
                    const accessory = this.getAccessoryByAID(aid);
                    const characteristic = accessory?.getCharacteristicByIID(iid);
                    if (!accessory || !characteristic) {
                        continue;
                    }
                    this.sendCharacteristicWarning(characteristic, "timeout-read" /* CharacteristicWarningType.TIMEOUT_READ */, "The read handler for the characteristic '" +
                        characteristic.displayName + "' on the accessory '" + accessory.displayName + "' didn't respond at all!. " +
                        "Please check that you properly call the callback!");
                    characteristics.push({
                        aid: aid,
                        iid: iid,
                        status: -70408 /* HAPStatus.OPERATION_TIMED_OUT */,
                    });
                }
                missingCharacteristics.clear();
                callback(undefined, response);
            }, Accessory.TIMEOUT_AFTER_WARNING);
            timeout.unref();
        }, Accessory.TIMEOUT_WARNING);
        timeout.unref();
        for (const id of request.ids) {
            const name = id.aid + "." + id.iid;
            this.handleCharacteristicRead(connection, id, request).then(value => {
                return {
                    aid: id.aid,
                    iid: id.iid,
                    ...value,
                };
            }, reason => {
                console.error(`[${this.displayName}] Read request for characteristic ${name} encountered an error: ${reason.stack}`);
                return {
                    aid: id.aid,
                    iid: id.iid,
                    status: -70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */,
                };
            }).then(value => {
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
        }
    }
    async handleCharacteristicRead(connection, id, request) {
        const characteristic = this.findCharacteristic(id.aid, id.iid);
        if (!characteristic) {
            debug("[%s] Could not find a Characteristic with aid of %s and iid of %s", this.displayName, id.aid, id.iid);
            return { status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ };
        }
        if (!characteristic.props.perms.includes("pr" /* Perms.PAIRED_READ */)) { // check if read is allowed for this characteristic
            debug("[%s] Tried reading from characteristic which does not allow reading (aid of %s and iid of %s)", this.displayName, id.aid, id.iid);
            return { status: -70405 /* HAPStatus.WRITE_ONLY_CHARACTERISTIC */ };
        }
        if (characteristic.props.adminOnlyAccess && characteristic.props.adminOnlyAccess.includes(0 /* Access.READ */)) {
            const verifiable = this._accessoryInfo && connection.username;
            if (!verifiable) {
                debug("[%s] Could not verify admin permissions for Characteristic which requires admin permissions for reading (aid of %s and iid of %s)", this.displayName, id.aid, id.iid);
            }
            if (!verifiable || !this._accessoryInfo.hasAdminPermissions(connection.username)) {
                return { status: -70401 /* HAPStatus.INSUFFICIENT_PRIVILEGES */ };
            }
        }
        return characteristic.handleGetRequest(connection).then(value => {
            value = (0, request_util_1.formatOutgoingCharacteristicValue)(value, characteristic.props);
            debug("[%s] Got Characteristic \"%s\" value: \"%s\"", this.displayName, characteristic.displayName, value);
            const data = {
                value: value == null ? null : value,
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
                data.type = (0, uuid_1.toShortForm)(characteristic.UUID);
            }
            if (request.includeEvent) {
                data.ev = connection.hasEventNotifications(id.aid, id.iid);
            }
            return data;
        }, (reason) => {
            // @ts-expect-error: preserveConstEnums compiler option
            debug("[%s] Error getting value for characteristic \"%s\": %s", this.displayName, characteristic.displayName, HAPServer_1.HAPStatus[reason]);
            return { status: reason };
        });
    }
    handleSetCharacteristics(connection, writeRequest, callback) {
        debug("[%s] Processing characteristic set: %s", this.displayName, JSON.stringify(writeRequest));
        let writeState = 0 /* WriteRequestState.REGULAR_REQUEST */;
        if (writeRequest.pid !== undefined) { // check for timed writes
            if (connection.timedWritePid === writeRequest.pid) {
                writeState = 1 /* WriteRequestState.TIMED_WRITE_AUTHENTICATED */;
                clearTimeout(connection.timedWriteTimeout);
                connection.timedWritePid = undefined;
                connection.timedWriteTimeout = undefined;
                debug("[%s] Timed write request got acknowledged for pid %d", this.displayName, writeRequest.pid);
            }
            else {
                writeState = 2 /* WriteRequestState.TIMED_WRITE_REJECTED */;
                debug("[%s] TTL for timed write request has probably expired for pid %d", this.displayName, writeRequest.pid);
            }
        }
        const characteristics = [];
        const response = { characteristics: characteristics };
        const missingCharacteristics = new Set(writeRequest.characteristics
            .map(characteristic => characteristic.aid + "." + characteristic.iid));
        if (missingCharacteristics.size !== writeRequest.characteristics.length) {
            // if those sizes differ, we have duplicates and can't properly handle that
            callback({ httpCode: 422 /* HAPHTTPCode.UNPROCESSABLE_ENTITY */, status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ });
            return;
        }
        let timeout = setTimeout(() => {
            for (const id of missingCharacteristics) {
                const split = id.split(".");
                const aid = parseInt(split[0], 10);
                const iid = parseInt(split[1], 10);
                const accessory = this.getAccessoryByAID(aid);
                const characteristic = accessory?.getCharacteristicByIID(iid);
                if (!accessory || !characteristic) {
                    continue;
                }
                this.sendCharacteristicWarning(characteristic, "slow-write" /* CharacteristicWarningType.SLOW_WRITE */, "The write handler for the characteristic '" +
                    characteristic.displayName + "' on the accessory '" + accessory.displayName + "' was slow to respond!");
            }
            // after a total of 10s we do no longer wait for a request to appear and just return status code timeout
            timeout = setTimeout(() => {
                timeout = undefined;
                for (const id of missingCharacteristics) {
                    const split = id.split(".");
                    const aid = parseInt(split[0], 10);
                    const iid = parseInt(split[1], 10);
                    const accessory = this.getAccessoryByAID(aid);
                    const characteristic = accessory?.getCharacteristicByIID(iid);
                    if (!accessory || !characteristic) {
                        continue;
                    }
                    this.sendCharacteristicWarning(characteristic, "timeout-write" /* CharacteristicWarningType.TIMEOUT_WRITE */, "The write handler for the characteristic '" +
                        characteristic.displayName + "' on the accessory '" + accessory.displayName + "' didn't respond at all!. " +
                        "Please check that you properly call the callback!");
                    characteristics.push({
                        aid: aid,
                        iid: iid,
                        status: -70408 /* HAPStatus.OPERATION_TIMED_OUT */,
                    });
                }
                missingCharacteristics.clear();
                callback(undefined, response);
            }, Accessory.TIMEOUT_AFTER_WARNING);
            timeout.unref();
        }, Accessory.TIMEOUT_WARNING);
        timeout.unref();
        for (const data of writeRequest.characteristics) {
            const name = data.aid + "." + data.iid;
            this.handleCharacteristicWrite(connection, data, writeState).then(value => {
                return {
                    aid: data.aid,
                    iid: data.iid,
                    ...value,
                };
            }, reason => {
                console.error(`[${this.displayName}] Write request for characteristic ${name} encountered an error: ${reason.stack}`);
                return {
                    aid: data.aid,
                    iid: data.iid,
                    status: -70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */,
                };
            }).then(value => {
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
        }
    }
    async handleCharacteristicWrite(connection, data, writeState) {
        const characteristic = this.findCharacteristic(data.aid, data.iid);
        if (!characteristic) {
            debug("[%s] Could not find a Characteristic with aid of %s and iid of %s", this.displayName, data.aid, data.iid);
            return { status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ };
        }
        if (writeState === 2 /* WriteRequestState.TIMED_WRITE_REJECTED */) {
            return { status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ };
        }
        if (data.ev == null && data.value == null) {
            return { status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ };
        }
        if (data.ev != null) { // register/unregister event notifications
            if (!characteristic.props.perms.includes("ev" /* Perms.NOTIFY */)) { // check if notify is allowed for this characteristic
                debug("[%s] Tried %s notifications for Characteristic which does not allow notify (aid of %s and iid of %s)", this.displayName, data.ev ? "enabling" : "disabling", data.aid, data.iid);
                return { status: -70406 /* HAPStatus.NOTIFICATION_NOT_SUPPORTED */ };
            }
            if (characteristic.props.adminOnlyAccess && characteristic.props.adminOnlyAccess.includes(2 /* Access.NOTIFY */)) {
                const verifiable = connection.username && this._accessoryInfo;
                if (!verifiable) {
                    debug("[%s] Could not verify admin permissions for Characteristic which requires admin permissions for notify (aid of %s and iid of %s)", this.displayName, data.aid, data.iid);
                }
                if (!verifiable || !this._accessoryInfo.hasAdminPermissions(connection.username)) {
                    return { status: -70401 /* HAPStatus.INSUFFICIENT_PRIVILEGES */ };
                }
            }
            const notificationsEnabled = connection.hasEventNotifications(data.aid, data.iid);
            if (data.ev && !notificationsEnabled) {
                connection.enableEventNotifications(data.aid, data.iid);
                characteristic.subscribe();
                debug("[%s] Registered Characteristic \"%s\" on \"%s\" for events", connection.remoteAddress, characteristic.displayName, this.displayName);
            }
            else if (!data.ev && notificationsEnabled) {
                characteristic.unsubscribe();
                connection.disableEventNotifications(data.aid, data.iid);
                debug("[%s] Unregistered Characteristic \"%s\" on \"%s\" for events", connection.remoteAddress, characteristic.displayName, this.displayName);
            }
            // response is returned below in the else block
        }
        if (data.value != null) {
            if (!characteristic.props.perms.includes("pw" /* Perms.PAIRED_WRITE */)) { // check if write is allowed for this characteristic
                debug("[%s] Tried writing to Characteristic which does not allow writing (aid of %s and iid of %s)", this.displayName, data.aid, data.iid);
                return { status: -70404 /* HAPStatus.READ_ONLY_CHARACTERISTIC */ };
            }
            if (characteristic.props.adminOnlyAccess && characteristic.props.adminOnlyAccess.includes(1 /* Access.WRITE */)) {
                const verifiable = connection.username && this._accessoryInfo;
                if (!verifiable) {
                    debug("[%s] Could not verify admin permissions for Characteristic which requires admin permissions for write (aid of %s and iid of %s)", this.displayName, data.aid, data.iid);
                }
                if (!verifiable || !this._accessoryInfo.hasAdminPermissions(connection.username)) {
                    return { status: -70401 /* HAPStatus.INSUFFICIENT_PRIVILEGES */ };
                }
            }
            if (characteristic.props.perms.includes("aa" /* Perms.ADDITIONAL_AUTHORIZATION */) && characteristic.additionalAuthorizationHandler) {
                // if the characteristic "supports additional authorization" but doesn't define a handler for the check
                // we conclude that the characteristic doesn't want to check the authData (currently) and just allows access for everybody
                let allowWrite;
                try {
                    allowWrite = characteristic.additionalAuthorizationHandler(data.authData);
                }
                catch (error) {
                    console.warn("[" + this.displayName + "] Additional authorization handler has thrown an error when checking authData: " + error.stack);
                    allowWrite = false;
                }
                if (!allowWrite) {
                    return { status: -70411 /* HAPStatus.INSUFFICIENT_AUTHORIZATION */ };
                }
            }
            if (characteristic.props.perms.includes("tw" /* Perms.TIMED_WRITE */) && writeState !== 1 /* WriteRequestState.TIMED_WRITE_AUTHENTICATED */) {
                debug("[%s] Tried writing to a timed write only Characteristic without properly preparing (iid of %s and aid of %s)", this.displayName, data.aid, data.iid);
                return { status: -70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */ };
            }
            return characteristic.handleSetRequest(data.value, connection).then(value => {
                debug("[%s] Setting Characteristic \"%s\" to value %s", this.displayName, characteristic.displayName, data.value);
                return {
                    // if write response is requests and value is provided, return that
                    value: data.r && value ? (0, request_util_1.formatOutgoingCharacteristicValue)(value, characteristic.props) : undefined,
                    status: 0 /* HAPStatus.SUCCESS */,
                };
            }, (status) => {
                // @ts-expect-error: forceConsistentCasingInFileNames compiler option
                debug("[%s] Error setting Characteristic \"%s\" to value %s: ", this.displayName, characteristic.displayName, data.value, HAPServer_1.HAPStatus[status]);
                return { status: status };
            });
        }
        return { status: 0 /* HAPStatus.SUCCESS */ };
    }
    handleResource(data, callback) {
        if (data["resource-type"] === "image" /* ResourceRequestType.IMAGE */) {
            const aid = data.aid; // aid is optionally supplied by HomeKit (for example when camera is bridged, multiple cams, etc)
            let accessory = undefined;
            let controller = undefined;
            if (aid) {
                accessory = this.getAccessoryByAID(aid);
                if (accessory && accessory.activeCameraController) {
                    controller = accessory.activeCameraController;
                }
            }
            else if (this.activeCameraController) { // aid was not supplied, check if this accessory is a camera
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                accessory = this;
                controller = this.activeCameraController;
            }
            if (!controller) {
                debug("[%s] received snapshot request though no camera controller was associated!");
                callback({ httpCode: 404 /* HAPHTTPCode.NOT_FOUND */, status: -70409 /* HAPStatus.RESOURCE_DOES_NOT_EXIST */ });
                return;
            }
            controller.handleSnapshotRequest(data["image-height"], data["image-width"], accessory?.displayName, data.reason)
                .then(buffer => {
                callback(undefined, buffer);
            }, (status) => {
                callback({ httpCode: 207 /* HAPHTTPCode.MULTI_STATUS */, status: status });
            });
            return;
        }
        debug("[%s] received request for unsupported image type: " + data["resource-type"], this._accessoryInfo?.username);
        callback({ httpCode: 404 /* HAPHTTPCode.NOT_FOUND */, status: -70409 /* HAPStatus.RESOURCE_DOES_NOT_EXIST */ });
    }
    handleHAPConnectionClosed(connection) {
        for (const event of connection.getRegisteredEvents()) {
            const ids = event.split(".");
            if (ids.length < 2) {
                continue;
            }
            const aid = parseInt(ids[0], 10);
            const iid = parseInt(ids[1], 10);
            const characteristic = this.findCharacteristic(aid, iid);
            if (characteristic) {
                characteristic.unsubscribe();
            }
        }
        connection.clearRegisteredEvents();
    }
    handleServiceConfigurationChangeEvent(service) {
        if (!service.isPrimaryService && service === this.primaryService) {
            // service changed form primary to non-primary service
            this.primaryService = undefined;
        }
        else if (service.isPrimaryService && service !== this.primaryService) {
            // service changed from non-primary to primary service
            if (this.primaryService !== undefined) {
                this.primaryService.isPrimaryService = false;
            }
            this.primaryService = service;
        }
        if (this.bridged) {
            this.emit("service-configurationChange" /* AccessoryEventTypes.SERVICE_CONFIGURATION_CHANGE */, { service: service });
        }
        else {
            this.enqueueConfigurationUpdate();
        }
    }
    handleCharacteristicChangeEvent(accessory, service, change) {
        if (this.bridged) { // forward this to our main accessory
            this.emit("service-characteristic-change" /* AccessoryEventTypes.SERVICE_CHARACTERISTIC_CHANGE */, { ...change, service: service });
        }
        else {
            if (!this._server) {
                return; // we're not running a HAPServer, so there's no one to notify about this event
            }
            if (accessory.aid == null || change.characteristic.iid == null) {
                debug("[%s] Muting event notification for %s as ids aren't yet assigned!", accessory.displayName, change.characteristic.displayName);
                return;
            }
            if (change.context != null && typeof change.context === "object" && change.context.omitEventUpdate) {
                debug("[%s] Omitting event updates for %s as specified in the context object!", accessory.displayName, change.characteristic.displayName);
                return;
            }
            if (!(change.reason === "event" /* ChangeReason.EVENT */ || change.oldValue !== change.newValue
                || change.characteristic.UUID === Characteristic_1.Characteristic.ProgrammableSwitchEvent.UUID // those specific checks are out of backwards compatibility
                || change.characteristic.UUID === Characteristic_1.Characteristic.ButtonEvent.UUID // new characteristics should use sendEventNotification call
            )) {
                // we only emit a change event if the reason was a call to sendEventNotification, if the value changed
                // as of a write request or a read request or if the change happened on dedicated event characteristics
                // otherwise we ignore this change event (with the return below)
                return;
            }
            const uuid = change.characteristic.UUID;
            const immediateDelivery = uuid === Characteristic_1.Characteristic.ButtonEvent.UUID || uuid === Characteristic_1.Characteristic.ProgrammableSwitchEvent.UUID
                || uuid === Characteristic_1.Characteristic.MotionDetected.UUID || uuid === Characteristic_1.Characteristic.ContactSensorState.UUID;
            const value = (0, request_util_1.formatOutgoingCharacteristicValue)(change.newValue, change.characteristic.props);
            this._server.sendEventNotifications(accessory.aid, change.characteristic.iid, value, change.originator, immediateDelivery);
        }
    }
    sendCharacteristicWarning(characteristic, type, message) {
        this.handleCharacteristicWarning({
            characteristic: characteristic,
            type: type,
            message: message,
            originatorChain: [characteristic.displayName], // we are missing the service displayName, but that's okay
            stack: new Error().stack,
        });
    }
    handleCharacteristicWarning(warning) {
        warning.originatorChain = [this.displayName, ...warning.originatorChain];
        const emitted = this.emit("characteristic-warning" /* AccessoryEventTypes.CHARACTERISTIC_WARNING */, warning);
        if (!emitted) {
            const message = `[${warning.originatorChain.join("@")}] ${warning.message}`;
            if (warning.type === "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */
                || warning.type === "timeout-read" /* CharacteristicWarningType.TIMEOUT_READ */ || warning.type === "timeout-write" /* CharacteristicWarningType.TIMEOUT_WRITE */) {
                console.error(message);
            }
            else {
                console.warn(message);
            }
            debug("[%s] Above characteristic warning was thrown at: %s", this.displayName, warning.stack ?? "unknown");
        }
    }
    setupServiceEventHandlers(service) {
        service.on("service-configurationChange" /* ServiceEventTypes.SERVICE_CONFIGURATION_CHANGE */, this.handleServiceConfigurationChangeEvent.bind(this, service));
        service.on("characteristic-change" /* ServiceEventTypes.CHARACTERISTIC_CHANGE */, this.handleCharacteristicChangeEvent.bind(this, this, service));
        service.on("characteristic-warning" /* ServiceEventTypes.CHARACTERISTIC_WARNING */, this.handleCharacteristicWarning.bind(this));
    }
    _sideloadServices(targetServices) {
        for (const service of targetServices) {
            this.setupServiceEventHandlers(service);
        }
        this.services = targetServices.slice();
        // Fix Identify
        this
            .getService(Service_1.Service.AccessoryInformation)
            .getCharacteristic(Characteristic_1.Characteristic.Identify)
            .on("set" /* CharacteristicEventTypes.SET */, (value, callback) => {
            if (value) {
                const paired = true;
                this.identificationRequest(paired, callback);
            }
        });
    }
    static _generateSetupID() {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const max = chars.length;
        let setupID = "";
        for (let i = 0; i < 4; i++) {
            const index = Math.floor(Math.random() * max);
            setupID += chars.charAt(index);
        }
        return setupID;
    }
    // serialization and deserialization functions, mainly designed for homebridge to create a json copy to store on disk
    static serialize(accessory) {
        const json = {
            displayName: accessory.displayName,
            UUID: accessory.UUID,
            lastKnownUsername: accessory._accessoryInfo ? accessory._accessoryInfo.username : undefined,
            category: accessory.category,
            services: [],
        };
        const linkedServices = {};
        let hasLinkedServices = false;
        accessory.services.forEach(service => {
            json.services.push(Service_1.Service.serialize(service));
            const linkedServicesPresentation = [];
            service.linkedServices.forEach(linkedService => {
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
        const controllers = [];
        // save controllers
        Object.values(accessory.controllers).forEach((context) => {
            controllers.push({
                type: context.controller.controllerId(),
                services: Accessory.serializeServiceMap(context.serviceMap),
            });
        });
        // also save controller which didn't get initialized (could lead to service duplication if we throw that data away)
        if (accessory.serializedControllers) {
            Object.entries(accessory.serializedControllers).forEach(([id, serviceMap]) => {
                controllers.push({
                    type: id,
                    services: Accessory.serializeServiceMap(serviceMap),
                });
            });
        }
        if (controllers.length > 0) {
            json.controllers = controllers;
        }
        return json;
    }
    static deserialize(json) {
        const accessory = new Accessory(json.displayName, json.UUID);
        accessory.lastKnownUsername = json.lastKnownUsername;
        accessory.category = json.category;
        const services = [];
        const servicesMap = {};
        json.services.forEach(serialized => {
            const service = Service_1.Service.deserialize(serialized);
            services.push(service);
            servicesMap[service.getServiceId()] = service;
        });
        if (json.linkedServices) {
            for (const [serviceId, linkedServicesKeys] of Object.entries(json.linkedServices)) {
                const primaryService = servicesMap[serviceId];
                if (!primaryService) {
                    continue;
                }
                linkedServicesKeys.forEach(linkedServiceKey => {
                    const linkedService = servicesMap[linkedServiceKey];
                    if (linkedService) {
                        primaryService.addLinkedService(linkedService);
                    }
                });
            }
        }
        if (json.controllers) { // just save it for later if it exists {@see configureController}
            accessory.serializedControllers = {};
            json.controllers.forEach(serializedController => {
                accessory.serializedControllers[serializedController.type] = Accessory.deserializeServiceMap(serializedController.services, servicesMap);
            });
        }
        accessory._sideloadServices(services);
        return accessory;
    }
    static cleanupAccessoryData(username) {
        IdentifierCache_1.IdentifierCache.remove(username);
        AccessoryInfo_1.AccessoryInfo.remove(username);
        ControllerStorage_1.ControllerStorage.remove(username);
    }
    static serializeServiceMap(serviceMap) {
        const serialized = {};
        Object.entries(serviceMap).forEach(([name, service]) => {
            if (!service) {
                return;
            }
            serialized[name] = service.getServiceId();
        });
        return serialized;
    }
    static deserializeServiceMap(serializedServiceMap, servicesMap) {
        const controllerServiceMap = {};
        Object.entries(serializedServiceMap).forEach(([name, serviceId]) => {
            const service = servicesMap[serviceId];
            if (service) {
                controllerServiceMap[name] = service;
            }
        });
        return controllerServiceMap;
    }
    static parseBindOption(info) {
        let advertiserAddress = undefined;
        let disableIpv6 = undefined;
        let serverAddress = undefined;
        if (info.bind) {
            const entries = new Set(Array.isArray(info.bind) ? info.bind : [info.bind]);
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
                const entry = entries.values().next().value; // grab the first one
                const version = net_1.default.isIP(entry); // check if ip address was specified or an interface name
                if (version) {
                    serverAddress = version === 4 ? "0.0.0.0" : "::"; // we currently bind to unspecified addresses so config-ui always has a connection via loopback
                }
                else {
                    serverAddress = "::"; // the interface could have both ipv4 and ipv6 addresses
                }
            }
            else if (entries.size > 1) {
                advertiserAddress = Array.from(entries);
                let bindUnspecifiedIpv6 = false; // we bind on "::" if there are interface names, or we detect ipv6 addresses
                for (const entry of entries) {
                    const version = net_1.default.isIP(entry);
                    if (version === 0 || version === 6) {
                        bindUnspecifiedIpv6 = true;
                        break;
                    }
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
    }
}
exports.Accessory = Accessory;
//# sourceMappingURL=Accessory.js.map