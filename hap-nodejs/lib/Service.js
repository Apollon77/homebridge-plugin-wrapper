"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.ServiceEventTypes = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const events_1 = require("events");
const Characteristic_1 = require("./Characteristic");
const uuid_1 = require("./util/uuid");
const checkName_1 = require("./util/checkName");
const debug = (0, debug_1.default)("HAP-NodeJS:Service");
/**
 * HAP spec allows a maximum of 100 characteristics per service!
 */
const MAX_CHARACTERISTICS = 100;
/**
 * @group Service
 */
var ServiceEventTypes;
(function (ServiceEventTypes) {
    ServiceEventTypes["CHARACTERISTIC_CHANGE"] = "characteristic-change";
    ServiceEventTypes["SERVICE_CONFIGURATION_CHANGE"] = "service-configurationChange";
    ServiceEventTypes["CHARACTERISTIC_WARNING"] = "characteristic-warning";
})(ServiceEventTypes || (exports.ServiceEventTypes = ServiceEventTypes = {}));
/**
 * Service represents a set of grouped values necessary to provide a logical function. For instance, a
 * "Door Lock Mechanism" service might contain two values, one for the "desired lock state" and one for the
 * "current lock state". A particular Service is distinguished from others by its "type", which is a UUID.
 * HomeKit provides a set of known Service UUIDs defined in HomeKit.ts along with a corresponding
 * concrete subclass that you can instantiate directly to set up the necessary values. These natively-supported
 * Services are expected to contain a particular set of Characteristics.
 *
 * Unlike Characteristics, where you cannot have two Characteristics with the same UUID in the same Service,
 * you can actually have multiple Services with the same UUID in a single Accessory. For instance, imagine
 * a Garage Door Opener with both a "security light" and a "backlight" for the display. Each light could be
 * a "Lightbulb" Service with the same UUID. To account for this situation, we define an extra "subtype"
 * property on Service, that can be a string or other string-convertible object that uniquely identifies the
 * Service among its peers in an Accessory. For instance, you might have `service1.subtype = 'security_light'`
 * for one and `service2.subtype = 'backlight'` for the other.
 *
 * You can also define custom Services by providing your own UUID for the type that you generate yourself.
 * Custom Services can contain an arbitrary set of Characteristics, but Siri will likely not be able to
 * work with these.
 *
 * @group Service
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class Service extends events_1.EventEmitter {
    // Service MUST NOT have any other static variables
    // Pattern below is for automatic detection of the section of defined services. Used by the generator
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    /**
     * @group Service Definitions
     */
    static AccessCode;
    /**
     * @group Service Definitions
     */
    static AccessControl;
    /**
     * @group Service Definitions
     */
    static AccessoryInformation;
    /**
     * @group Service Definitions
     */
    static AccessoryMetrics;
    /**
     * @group Service Definitions
     */
    static AccessoryRuntimeInformation;
    /**
     * @group Service Definitions
     */
    static AirPurifier;
    /**
     * @group Service Definitions
     */
    static AirQualitySensor;
    /**
     * @group Service Definitions
     */
    static AssetUpdate;
    /**
     * @group Service Definitions
     */
    static Assistant;
    /**
     * @group Service Definitions
     */
    static AudioStreamManagement;
    /**
     * @group Service Definitions
     */
    static Battery;
    /**
     * @group Service Definitions
     */
    static CameraOperatingMode;
    /**
     * @group Service Definitions
     */
    static CameraRecordingManagement;
    /**
     * @group Service Definitions
     */
    static CameraRTPStreamManagement;
    /**
     * @group Service Definitions
     */
    static CarbonDioxideSensor;
    /**
     * @group Service Definitions
     */
    static CarbonMonoxideSensor;
    /**
     * @group Service Definitions
     * @deprecated Removed
     */
    static CloudRelay;
    /**
     * @group Service Definitions
     */
    static ContactSensor;
    /**
     * @group Service Definitions
     */
    static DataStreamTransportManagement;
    /**
     * @group Service Definitions
     */
    static Diagnostics;
    /**
     * @group Service Definitions
     */
    static Door;
    /**
     * @group Service Definitions
     */
    static Doorbell;
    /**
     * @group Service Definitions
     */
    static Fan;
    /**
     * @group Service Definitions
     */
    static Fanv2;
    /**
     * @group Service Definitions
     */
    static Faucet;
    /**
     * @group Service Definitions
     */
    static FilterMaintenance;
    /**
     * @group Service Definitions
     */
    static FirmwareUpdate;
    /**
     * @group Service Definitions
     */
    static GarageDoorOpener;
    /**
     * @group Service Definitions
     */
    static HeaterCooler;
    /**
     * @group Service Definitions
     */
    static HumidifierDehumidifier;
    /**
     * @group Service Definitions
     */
    static HumiditySensor;
    /**
     * @group Service Definitions
     */
    static InputSource;
    /**
     * @group Service Definitions
     */
    static IrrigationSystem;
    /**
     * @group Service Definitions
     */
    static LeakSensor;
    /**
     * @group Service Definitions
     */
    static Lightbulb;
    /**
     * @group Service Definitions
     */
    static LightSensor;
    /**
     * @group Service Definitions
     */
    static LockManagement;
    /**
     * @group Service Definitions
     */
    static LockMechanism;
    /**
     * @group Service Definitions
     */
    static Microphone;
    /**
     * @group Service Definitions
     */
    static MotionSensor;
    /**
     * @group Service Definitions
     */
    static NFCAccess;
    /**
     * @group Service Definitions
     */
    static OccupancySensor;
    /**
     * @group Service Definitions
     */
    static Outlet;
    /**
     * @group Service Definitions
     */
    static Pairing;
    /**
     * @group Service Definitions
     */
    static PowerManagement;
    /**
     * @group Service Definitions
     */
    static ProtocolInformation;
    /**
     * @group Service Definitions
     */
    static SecuritySystem;
    /**
     * @group Service Definitions
     */
    static ServiceLabel;
    /**
     * @group Service Definitions
     */
    static Siri;
    /**
     * @group Service Definitions
     */
    static SiriEndpoint;
    /**
     * @group Service Definitions
     */
    static Slats;
    /**
     * @group Service Definitions
     */
    static SmartSpeaker;
    /**
     * @group Service Definitions
     */
    static SmokeSensor;
    /**
     * @group Service Definitions
     */
    static Speaker;
    /**
     * @group Service Definitions
     */
    static StatefulProgrammableSwitch;
    /**
     * @group Service Definitions
     */
    static StatelessProgrammableSwitch;
    /**
     * @group Service Definitions
     */
    static Switch;
    /**
     * @group Service Definitions
     * @deprecated Removed
     */
    static TapManagement;
    /**
     * @group Service Definitions
     */
    static TargetControl;
    /**
     * @group Service Definitions
     */
    static TargetControlManagement;
    /**
     * @group Service Definitions
     */
    static Television;
    /**
     * @group Service Definitions
     */
    static TelevisionSpeaker;
    /**
     * @group Service Definitions
     */
    static TemperatureSensor;
    /**
     * @group Service Definitions
     */
    static Thermostat;
    /**
     * @group Service Definitions
     */
    static ThreadTransport;
    /**
     * @group Service Definitions
     */
    static TransferTransportManagement;
    /**
     * @group Service Definitions
     * @deprecated Removed
     */
    static Tunnel;
    /**
     * @group Service Definitions
     */
    static Valve;
    /**
     * @group Service Definitions
     */
    static WiFiRouter;
    /**
     * @group Service Definitions
     */
    static WiFiSatellite;
    /**
     * @group Service Definitions
     */
    static WiFiTransport;
    /**
     * @group Service Definitions
     */
    static Window;
    /**
     * @group Service Definitions
     */
    static WindowCovering;
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // NOTICE: when adding/changing properties, remember to possibly adjust the serialize/deserialize functions
    displayName;
    UUID;
    subtype;
    iid = null; // assigned later by our containing Accessory
    name = null;
    characteristics = [];
    optionalCharacteristics = [];
    /**
     * @private
     */
    isHiddenService = false;
    /**
     * @private
     */
    isPrimaryService = false; // do not write to this directly
    /**
     * @private
     */
    linkedServices = [];
    constructor(displayName = "", UUID, subtype) {
        super();
        (0, assert_1.default)(UUID, "Services must be created with a valid UUID.");
        this.displayName = displayName;
        this.UUID = UUID;
        this.subtype = subtype;
        // every service has an optional Characteristic.Name property - we'll set it to our displayName
        // if one was given
        // if you don't provide a display name, some HomeKit apps may choose to hide the device.
        if (displayName) {
            // create the characteristic if necessary
            (0, checkName_1.checkName)(this.displayName, "Name", displayName);
            const nameCharacteristic = this.getCharacteristic(Characteristic_1.Characteristic.Name) ||
                this.addCharacteristic(Characteristic_1.Characteristic.Name);
            nameCharacteristic.updateValue(displayName);
        }
    }
    /**
     * Returns an id which uniquely identifies a service on the associated accessory.
     * The serviceId is a concatenation of the UUID for the service (defined by HAP) and the subtype (could be empty)
     * which is programmatically defined by the programmer.
     *
     * @returns the serviceId
     */
    getServiceId() {
        return this.UUID + (this.subtype || "");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addCharacteristic(input, ...constructorArgs) {
        // characteristic might be a constructor like `Characteristic.Brightness` instead of an instance of Characteristic. Coerce if necessary.
        const characteristic = typeof input === "function" ? new input(...constructorArgs) : input;
        // check for UUID conflict
        for (const existing of this.characteristics) {
            if (existing.UUID === characteristic.UUID) {
                if (characteristic.UUID === "00000052-0000-1000-8000-0026BB765291") {
                    //This is a special workaround for the Firmware Revision characteristic.
                    return existing;
                }
                throw new Error("Cannot add a Characteristic with the same UUID as another Characteristic in this Service: " + existing.UUID);
            }
        }
        if (this.characteristics.length >= MAX_CHARACTERISTICS) {
            throw new Error("Cannot add more than " + MAX_CHARACTERISTICS + " characteristics to a single service!");
        }
        this.setupCharacteristicEventHandlers(characteristic);
        this.characteristics.push(characteristic);
        this.emit("service-configurationChange" /* ServiceEventTypes.SERVICE_CONFIGURATION_CHANGE */);
        return characteristic;
    }
    /**
     * Sets this service as the new primary service.
     * Any currently active primary service will be reset to be not primary.
     * This will happen immediately, if the service was already added to an accessory, or later
     * when the service gets added to an accessory.
     *
     * @param isPrimary - optional boolean (default true) if the service should be the primary service
     */
    setPrimaryService(isPrimary = true) {
        this.isPrimaryService = isPrimary;
        this.emit("service-configurationChange" /* ServiceEventTypes.SERVICE_CONFIGURATION_CHANGE */);
    }
    /**
     * Marks the service as hidden
     *
     * @param isHidden - optional boolean (default true) if the service should be marked hidden
     */
    setHiddenService(isHidden = true) {
        this.isHiddenService = isHidden;
        this.emit("service-configurationChange" /* ServiceEventTypes.SERVICE_CONFIGURATION_CHANGE */);
    }
    /**
     * Adds a new link to the specified service. The service MUST be already added to
     * the SAME accessory.
     *
     * @param service - The service this service should link to
     */
    addLinkedService(service) {
        //TODO: Add a check if the service is on the same accessory.
        if (!this.linkedServices.includes(service)) {
            this.linkedServices.push(service);
        }
        this.emit("service-configurationChange" /* ServiceEventTypes.SERVICE_CONFIGURATION_CHANGE */);
    }
    /**
     * Removes a link to the specified service which was previously added with {@link addLinkedService}
     *
     * @param service - Previously linked service
     */
    removeLinkedService(service) {
        //TODO: Add a check if the service is on the same accessory.
        const index = this.linkedServices.indexOf(service);
        if (index !== -1) {
            this.linkedServices.splice(index, 1);
        }
        this.emit("service-configurationChange" /* ServiceEventTypes.SERVICE_CONFIGURATION_CHANGE */);
    }
    removeCharacteristic(characteristic) {
        const index = this.characteristics.indexOf(characteristic);
        if (index !== -1) {
            this.characteristics.splice(index, 1);
            characteristic.removeAllListeners();
            this.emit("service-configurationChange" /* ServiceEventTypes.SERVICE_CONFIGURATION_CHANGE */);
        }
    }
    getCharacteristic(name) {
        // returns a characteristic object from the service
        // If  Service.prototype.getCharacteristic(Characteristic.Type)  does not find the characteristic,
        // but the type is in optionalCharacteristics, it adds the characteristic.type to the service and returns it.
        for (const characteristic of this.characteristics) {
            if (typeof name === "string" && characteristic.displayName === name) {
                return characteristic;
            }
            else {
                // @ts-expect-error ('UUID' does not exist on type 'never')
                if (typeof name === "function" && ((characteristic instanceof name) || (name.UUID === characteristic.UUID))) {
                    return characteristic;
                }
            }
        }
        if (typeof name === "function") {
            for (const characteristic of this.optionalCharacteristics) {
                // @ts-expect-error ('UUID' does not exist on type 'never')
                if ((characteristic instanceof name) || (name.UUID === characteristic.UUID)) {
                    return this.addCharacteristic(name);
                }
            }
            const instance = this.addCharacteristic(name);
            // Not found in optional Characteristics. Adding anyway, but warning about it if it isn't the Name.
            if (name.UUID !== Characteristic_1.Characteristic.Name.UUID) {
                this.emitCharacteristicWarningEvent(instance, "warn-message" /* CharacteristicWarningType.WARN_MESSAGE */, "Characteristic not in required or optional characteristic section for service " + this.constructor.name + ". Adding anyway.");
            }
            return instance;
        }
    }
    testCharacteristic(name) {
        // checks for the existence of a characteristic object in the service
        for (const characteristic of this.characteristics) {
            if (typeof name === "string" && characteristic.displayName === name) {
                return true;
            }
            else {
                // @ts-expect-error ('UUID' does not exist on type 'never')
                if (typeof name === "function" && ((characteristic instanceof name) || (name.UUID === characteristic.UUID))) {
                    return true;
                }
            }
        }
        return false;
    }
    setCharacteristic(name, value) {
        // @ts-expect-error: We know that both overloads exists individually. There is just no publicly exposed type for that!
        this.getCharacteristic(name).setValue(value);
        return this; // for chaining
    }
    updateCharacteristic(name, value) {
        this.getCharacteristic(name).updateValue(value);
        return this;
    }
    addOptionalCharacteristic(characteristic) {
        // characteristic might be a constructor like `Characteristic.Brightness` instead of an instance
        // of Characteristic. Coerce if necessary.
        if (typeof characteristic === "function") {
            characteristic = new characteristic();
        }
        this.optionalCharacteristics.push(characteristic);
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * This method was created to copy all characteristics from another service to this.
     * It's only adopting is currently in homebridge to merge the AccessoryInformation service. So some things
     * may be explicitly tailored towards this use case.
     *
     * It will not remove characteristics which are present currently but not added on the other characteristic.
     * It will not replace the characteristic if the value is falsy (except of '0' or 'false')
     * @param service
     * @private used by homebridge
     */
    replaceCharacteristicsFromService(service) {
        if (this.UUID !== service.UUID) {
            throw new Error(`Incompatible services. Tried replacing characteristics of ${this.UUID} with characteristics from ${service.UUID}`);
        }
        const foreignCharacteristics = {}; // index foreign characteristics by UUID
        service.characteristics.forEach(characteristic => foreignCharacteristics[characteristic.UUID] = characteristic);
        this.characteristics.forEach(characteristic => {
            const foreignCharacteristic = foreignCharacteristics[characteristic.UUID];
            if (foreignCharacteristic) {
                delete foreignCharacteristics[characteristic.UUID];
                if (!foreignCharacteristic.value && foreignCharacteristic.value !== 0 && foreignCharacteristic.value !== false) {
                    return; // ignore falsy values except if it's the number zero or literally false
                }
                characteristic.replaceBy(foreignCharacteristic);
            }
        });
        // add all additional characteristics which where not present already
        Object.values(foreignCharacteristics).forEach(characteristic => this.addCharacteristic(characteristic));
    }
    /**
     * @private
     */
    getCharacteristicByIID(iid) {
        for (const characteristic of this.characteristics) {
            if (characteristic.iid === iid) {
                return characteristic;
            }
        }
    }
    /**
     * @private
     */
    _assignIDs(identifierCache, accessoryName, baseIID = 0) {
        // the Accessory Information service must have a (reserved by IdentifierCache) ID of 1
        if (this.UUID === "0000003E-0000-1000-8000-0026BB765291") {
            this.iid = 1;
        }
        else {
            // assign our own ID based on our UUID
            this.iid = baseIID + identifierCache.getIID(accessoryName, this.UUID, this.subtype);
        }
        // assign IIDs to our Characteristics
        for (const characteristic of this.characteristics) {
            characteristic._assignID(identifierCache, accessoryName, this.UUID, this.subtype);
        }
    }
    /**
     * Returns a JSON representation of this service suitable for delivering to HAP clients.
     * @private used to generate response to /accessories query
     */
    toHAP(connection, contactGetHandlers = true) {
        return new Promise(resolve => {
            (0, assert_1.default)(this.iid, "iid cannot be undefined for service '" + this.displayName + "'");
            (0, assert_1.default)(this.characteristics.length, "service '" + this.displayName + "' does not have any characteristics!");
            const service = {
                type: (0, uuid_1.toShortForm)(this.UUID),
                iid: this.iid,
                characteristics: [],
                hidden: this.isHiddenService ? true : undefined,
                primary: this.isPrimaryService ? true : undefined,
            };
            if (this.linkedServices.length) {
                service.linked = [];
                for (const linked of this.linkedServices) {
                    if (!linked.iid) {
                        // we got a linked service which is not added to the accessory
                        // as it doesn't "exists" we just ignore it.
                        // we have some (at least one) plugins on homebridge which link to the AccessoryInformation service.
                        // homebridge always creates its own AccessoryInformation service and ignores the user supplied one
                        // thus the link is automatically broken.
                        debug(`iid of linked service '${linked.displayName}' ${linked.UUID} is undefined on service '${this.displayName}'`);
                        continue;
                    }
                    service.linked.push(linked.iid);
                }
            }
            const missingCharacteristics = new Set();
            let timeout = setTimeout(() => {
                for (const characteristic of missingCharacteristics) {
                    this.emitCharacteristicWarningEvent(characteristic, "slow-read" /* CharacteristicWarningType.SLOW_READ */, `The read handler for the characteristic '${characteristic.displayName}' was slow to respond!`);
                }
                timeout = setTimeout(() => {
                    timeout = undefined;
                    for (const characteristic of missingCharacteristics) {
                        this.emitCharacteristicWarningEvent(characteristic, "timeout-read" /* CharacteristicWarningType.TIMEOUT_READ */, "The read handler for the characteristic '" + characteristic?.displayName +
                            "' didn't respond at all!. Please check that you properly call the callback!");
                        service.characteristics.push(characteristic.internalHAPRepresentation()); // value is set to null
                    }
                    missingCharacteristics.clear();
                    resolve(service);
                }, 6000);
            }, 3000);
            for (const characteristic of this.characteristics) {
                missingCharacteristics.add(characteristic);
                characteristic.toHAP(connection, contactGetHandlers).then(value => {
                    if (!timeout) {
                        return; // if timeout is undefined, response was already sent out
                    }
                    missingCharacteristics.delete(characteristic);
                    service.characteristics.push(value);
                    if (missingCharacteristics.size === 0) {
                        if (timeout) {
                            clearTimeout(timeout);
                            timeout = undefined;
                        }
                        resolve(service);
                    }
                });
            }
        });
    }
    /**
     * Returns a JSON representation of this service without characteristic values.
     * @private used to generate the config hash
     */
    internalHAPRepresentation() {
        (0, assert_1.default)(this.iid, "iid cannot be undefined for service '" + this.displayName + "'");
        (0, assert_1.default)(this.characteristics.length, "service '" + this.displayName + "' does not have any characteristics!");
        const service = {
            type: (0, uuid_1.toShortForm)(this.UUID),
            iid: this.iid,
            characteristics: this.characteristics.map(characteristic => characteristic.internalHAPRepresentation()),
            hidden: this.isHiddenService ? true : undefined,
            primary: this.isPrimaryService ? true : undefined,
        };
        if (this.linkedServices.length) {
            service.linked = [];
            for (const linked of this.linkedServices) {
                if (!linked.iid) {
                    // we got a linked service which is not added to the accessory
                    // as it doesn't "exists" we just ignore it.
                    // we have some (at least one) plugins on homebridge which link to the AccessoryInformation service.
                    // homebridge always creates its own AccessoryInformation service and ignores the user supplied one
                    // thus the link is automatically broken.
                    debug(`iid of linked service '${linked.displayName}' ${linked.UUID} is undefined on service '${this.displayName}'`);
                    continue;
                }
                service.linked.push(linked.iid);
            }
        }
        return service;
    }
    /**
     * @private
     */
    setupCharacteristicEventHandlers(characteristic) {
        // listen for changes in characteristics and bubble them up
        characteristic.on("change" /* CharacteristicEventTypes.CHANGE */, (change) => {
            this.emit("characteristic-change" /* ServiceEventTypes.CHARACTERISTIC_CHANGE */, { ...change, characteristic: characteristic });
        });
        characteristic.on("characteristic-warning" /* CharacteristicEventTypes.CHARACTERISTIC_WARNING */, this.emitCharacteristicWarningEvent.bind(this, characteristic));
    }
    /**
     * @private
     */
    emitCharacteristicWarningEvent(characteristic, type, message, stack) {
        this.emit("characteristic-warning" /* ServiceEventTypes.CHARACTERISTIC_WARNING */, {
            characteristic: characteristic,
            type: type,
            message: message,
            originatorChain: [this.displayName, characteristic.displayName],
            stack: stack,
        });
    }
    /**
     * @private
     */
    _sideloadCharacteristics(targetCharacteristics) {
        for (const target of targetCharacteristics) {
            this.setupCharacteristicEventHandlers(target);
        }
        this.characteristics = targetCharacteristics.slice();
    }
    /**
     * @private
     */
    static serialize(service) {
        let constructorName;
        if (service.constructor.name !== "Service") {
            constructorName = service.constructor.name;
        }
        return {
            displayName: service.displayName,
            UUID: service.UUID,
            subtype: service.subtype,
            constructorName: constructorName,
            hiddenService: service.isHiddenService,
            primaryService: service.isPrimaryService,
            characteristics: service.characteristics.map(characteristic => Characteristic_1.Characteristic.serialize(characteristic)),
            optionalCharacteristics: service.optionalCharacteristics.map(characteristic => Characteristic_1.Characteristic.serialize(characteristic)),
        };
    }
    /**
     * @private
     */
    static deserialize(json) {
        let service;
        if (json.constructorName && json.constructorName.charAt(0).toUpperCase() === json.constructorName.charAt(0)
            && Service[json.constructorName]) { // MUST start with uppercase character and must exist on Service object
            const constructor = Service[json.constructorName];
            service = new constructor(json.displayName, json.subtype);
        }
        else {
            service = new Service(json.displayName, json.UUID, json.subtype);
        }
        service.isHiddenService = !!json.hiddenService;
        service.isPrimaryService = !!json.primaryService;
        const characteristics = json.characteristics.map(serialized => Characteristic_1.Characteristic.deserialize(serialized));
        service._sideloadCharacteristics(characteristics);
        if (json.optionalCharacteristics) {
            service.optionalCharacteristics = json.optionalCharacteristics.map(serialized => Characteristic_1.Characteristic.deserialize(serialized));
        }
        return service;
    }
}
exports.Service = Service;
// We have a cyclic dependency problem. Within this file we have the definitions of "./definitions" as
// type imports only (in order to define the static properties). Setting those properties is done outside
// this file, within the definition files. Therefore, we import it at the end of this file. Seems weird, but is important.
require("./definitions/ServiceDefinitions");
//# sourceMappingURL=Service.js.map