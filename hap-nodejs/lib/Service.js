"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.ServiceEventTypes = void 0;
var tslib_1 = require("tslib");
var assert_1 = (0, tslib_1.__importDefault)(require("assert"));
var debug_1 = (0, tslib_1.__importDefault)(require("debug"));
var events_1 = require("events");
var Characteristic_1 = require("./Characteristic");
var uuid_1 = require("./util/uuid");
var debug = (0, debug_1.default)("HAP-NodeJS:Service");
/**
 * HAP spec allows a maximum of 100 characteristics per service!
 */
var MAX_CHARACTERISTICS = 100;
var ServiceEventTypes;
(function (ServiceEventTypes) {
    ServiceEventTypes["CHARACTERISTIC_CHANGE"] = "characteristic-change";
    ServiceEventTypes["SERVICE_CONFIGURATION_CHANGE"] = "service-configurationChange";
    ServiceEventTypes["CHARACTERISTIC_WARNING"] = "characteristic-warning";
})(ServiceEventTypes = exports.ServiceEventTypes || (exports.ServiceEventTypes = {}));
/**
 * Service represents a set of grouped values necessary to provide a logical function. For instance, a
 * "Door Lock Mechanism" service might contain two values, one for the "desired lock state" and one for the
 * "current lock state". A particular Service is distinguished from others by its "type", which is a UUID.
 * HomeKit provides a set of known Service UUIDs defined in HomeKit.ts along with a corresponding
 * concrete subclass that you can instantiate directly to setup the necessary values. These natively-supported
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
 */
var Service = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(Service, _super);
    function Service(displayName, UUID, subtype) {
        if (displayName === void 0) { displayName = ""; }
        var _this = _super.call(this) || this;
        _this.iid = null; // assigned later by our containing Accessory
        _this.name = null;
        _this.characteristics = [];
        _this.optionalCharacteristics = [];
        /**
         * @private
         */
        _this.isHiddenService = false;
        /**
         * @private
         */
        _this.isPrimaryService = false; // do not write to this directly
        /**
         * @private
         */
        _this.linkedServices = [];
        (0, assert_1.default)(UUID, "Services must be created with a valid UUID.");
        _this.displayName = displayName;
        _this.UUID = UUID;
        _this.subtype = subtype;
        // every service has an optional Characteristic.Name property - we'll set it to our displayName
        // if one was given
        // if you don't provide a display name, some HomeKit apps may choose to hide the device.
        if (displayName) {
            // create the characteristic if necessary
            var nameCharacteristic = _this.getCharacteristic(Characteristic_1.Characteristic.Name) ||
                _this.addCharacteristic(Characteristic_1.Characteristic.Name);
            nameCharacteristic.updateValue(displayName);
        }
        return _this;
    }
    /**
     * Returns an id which uniquely identifies an service on the associated accessory.
     * The serviceId is a concatenation of the UUID for the service (defined by HAP) and the subtype (could be empty)
     * which is programmatically defined by the programmer.
     *
     * @returns the serviceId
     */
    Service.prototype.getServiceId = function () {
        return this.UUID + (this.subtype || "");
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Service.prototype.addCharacteristic = function (input) {
        // characteristic might be a constructor like `Characteristic.Brightness` instead of an instance of Characteristic. Coerce if necessary.
        var e_1, _a;
        var constructorArgs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            constructorArgs[_i - 1] = arguments[_i];
        }
        var characteristic = typeof input === "function" ? new (input.bind.apply(input, (0, tslib_1.__spreadArray)([void 0], (0, tslib_1.__read)(constructorArgs), false)))() : input;
        try {
            // check for UUID conflict
            for (var _b = (0, tslib_1.__values)(this.characteristics), _c = _b.next(); !_c.done; _c = _b.next()) {
                var existing = _c.value;
                if (existing.UUID === characteristic.UUID) {
                    if (characteristic.UUID === "00000052-0000-1000-8000-0026BB765291") {
                        //This is a special workaround for the Firmware Revision characteristic.
                        return existing;
                    }
                    throw new Error("Cannot add a Characteristic with the same UUID as another Characteristic in this Service: " + existing.UUID);
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
        if (this.characteristics.length >= MAX_CHARACTERISTICS) {
            throw new Error("Cannot add more than " + MAX_CHARACTERISTICS + " characteristics to a single service!");
        }
        this.setupCharacteristicEventHandlers(characteristic);
        this.characteristics.push(characteristic);
        this.emit("service-configurationChange" /* SERVICE_CONFIGURATION_CHANGE */);
        return characteristic;
    };
    /**
     * Sets this service as the new primary service.
     * Any currently active primary service will be reset to be not primary.
     * This will happen immediately, if the service was already added to an accessory, or later
     * when the service gets added to an accessory.
     *
     * @param isPrimary {boolean} - optional boolean (default true) if the service should be the primary service
     */
    Service.prototype.setPrimaryService = function (isPrimary) {
        if (isPrimary === void 0) { isPrimary = true; }
        this.isPrimaryService = isPrimary;
        this.emit("service-configurationChange" /* SERVICE_CONFIGURATION_CHANGE */);
    };
    /**
     * Marks the service as hidden
     *
     * @param isHidden {boolean} - optional boolean (default true) if the service should be marked hidden
     */
    Service.prototype.setHiddenService = function (isHidden) {
        if (isHidden === void 0) { isHidden = true; }
        this.isHiddenService = isHidden;
        this.emit("service-configurationChange" /* SERVICE_CONFIGURATION_CHANGE */);
    };
    /**
     * Adds a new link to the specified service. The service MUST be already added to
     * the SAME accessory.
     *
     * @param service - The service this service should link to
     */
    Service.prototype.addLinkedService = function (service) {
        //TODO: Add a check if the service is on the same accessory.
        if (!this.linkedServices.includes(service)) {
            this.linkedServices.push(service);
        }
        this.emit("service-configurationChange" /* SERVICE_CONFIGURATION_CHANGE */);
    };
    /**
     * Removes a link to the specified service which was previously added with {@link addLinkedService}
     *
     * @param service - Previously linked service
     */
    Service.prototype.removeLinkedService = function (service) {
        //TODO: Add a check if the service is on the same accessory.
        var index = this.linkedServices.indexOf(service);
        if (index !== -1) {
            this.linkedServices.splice(index, 1);
        }
        this.emit("service-configurationChange" /* SERVICE_CONFIGURATION_CHANGE */);
    };
    Service.prototype.removeCharacteristic = function (characteristic) {
        var index = this.characteristics.indexOf(characteristic);
        if (index !== -1) {
            this.characteristics.splice(index, 1);
            characteristic.removeAllListeners();
            this.emit("service-configurationChange" /* SERVICE_CONFIGURATION_CHANGE */);
        }
    };
    Service.prototype.getCharacteristic = function (name) {
        // returns a characteristic object from the service
        // If  Service.prototype.getCharacteristic(Characteristic.Type)  does not find the characteristic,
        // but the type is in optionalCharacteristics, it adds the characteristic.type to the service and returns it.
        var e_2, _a, e_3, _b;
        try {
            for (var _c = (0, tslib_1.__values)(this.characteristics), _d = _c.next(); !_d.done; _d = _c.next()) {
                var characteristic = _d.value;
                if (typeof name === "string" && characteristic.displayName === name) {
                    return characteristic;
                    // @ts-expect-error: UUID field
                }
                else if (typeof name === "function" && ((characteristic instanceof name) || (name.UUID === characteristic.UUID))) {
                    return characteristic;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (typeof name === "function") {
            try {
                for (var _e = (0, tslib_1.__values)(this.optionalCharacteristics), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var characteristic = _f.value;
                    // @ts-expect-error: UUID field
                    if ((characteristic instanceof name) || (name.UUID === characteristic.UUID)) {
                        return this.addCharacteristic(name);
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_3) throw e_3.error; }
            }
            var instance = this.addCharacteristic(name);
            // Not found in optional Characteristics. Adding anyway, but warning about it if it isn't the Name.
            // @ts-expect-error: UUID field
            if (name.UUID !== Characteristic_1.Characteristic.Name.UUID) {
                this.emitCharacteristicWarningEvent(instance, "warn-message" /* WARN_MESSAGE */, "Characteristic not in required or optional characteristic section for service " + this.constructor.name + ". Adding anyway.");
            }
            return instance;
        }
    };
    Service.prototype.testCharacteristic = function (name) {
        var e_4, _a;
        try {
            // checks for the existence of a characteristic object in the service
            for (var _b = (0, tslib_1.__values)(this.characteristics), _c = _b.next(); !_c.done; _c = _b.next()) {
                var characteristic = _c.value;
                if (typeof name === "string" && characteristic.displayName === name) {
                    return true;
                    // @ts-expect-error: UUID field
                }
                else if (typeof name === "function" && ((characteristic instanceof name) || (name.UUID === characteristic.UUID))) {
                    return true;
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
        return false;
    };
    Service.prototype.setCharacteristic = function (name, value) {
        this.getCharacteristic(name).setValue(value);
        return this; // for chaining
    };
    // A function to only updating the remote value, but not firing the 'set' event.
    Service.prototype.updateCharacteristic = function (name, value) {
        this.getCharacteristic(name).updateValue(value);
        return this;
    };
    Service.prototype.addOptionalCharacteristic = function (characteristic) {
        // characteristic might be a constructor like `Characteristic.Brightness` instead of an instance
        // of Characteristic. Coerce if necessary.
        if (typeof characteristic === "function") {
            characteristic = new characteristic();
        }
        this.optionalCharacteristics.push(characteristic);
    };
    // noinspection JSUnusedGlobalSymbols
    /**
     * This method was created to copy all characteristics from another service to this.
     * It's only adopting is currently in homebridge to merge the AccessoryInformation service. So some things
     * my be explicitly tailored towards this use case.
     *
     * It will not remove characteristics which are present currently but not added on the other characteristic.
     * It will not replace the characteristic if the value is falsy (except of '0' or 'false')
     * @param service
     * @private used by homebridge
     */
    Service.prototype.replaceCharacteristicsFromService = function (service) {
        var _this = this;
        if (this.UUID !== service.UUID) {
            throw new Error("Incompatible services. Tried replacing characteristics of ".concat(this.UUID, " with characteristics from ").concat(service.UUID));
        }
        var foreignCharacteristics = {}; // index foreign characteristics by UUID
        service.characteristics.forEach(function (characteristic) { return foreignCharacteristics[characteristic.UUID] = characteristic; });
        this.characteristics.forEach(function (characteristic) {
            var foreignCharacteristic = foreignCharacteristics[characteristic.UUID];
            if (foreignCharacteristic) {
                delete foreignCharacteristics[characteristic.UUID];
                if (!foreignCharacteristic.value && foreignCharacteristic.value !== 0 && foreignCharacteristic.value !== false) {
                    return; // ignore falsy values except if its the number zero or literally false
                }
                characteristic.replaceBy(foreignCharacteristic);
            }
        });
        // add all additional characteristics which where not present already
        Object.values(foreignCharacteristics).forEach(function (characteristic) { return _this.addCharacteristic(characteristic); });
    };
    /**
     * @private
     */
    Service.prototype.getCharacteristicByIID = function (iid) {
        var e_5, _a;
        try {
            for (var _b = (0, tslib_1.__values)(this.characteristics), _c = _b.next(); !_c.done; _c = _b.next()) {
                var characteristic = _c.value;
                if (characteristic.iid === iid) {
                    return characteristic;
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
    };
    /**
     * @private
     */
    Service.prototype._assignIDs = function (identifierCache, accessoryName, baseIID) {
        var e_6, _a;
        if (baseIID === void 0) { baseIID = 0; }
        // the Accessory Information service must have a (reserved by IdentifierCache) ID of 1
        if (this.UUID === "0000003E-0000-1000-8000-0026BB765291") {
            this.iid = 1;
        }
        else {
            // assign our own ID based on our UUID
            this.iid = baseIID + identifierCache.getIID(accessoryName, this.UUID, this.subtype);
        }
        try {
            // assign IIDs to our Characteristics
            for (var _b = (0, tslib_1.__values)(this.characteristics), _c = _b.next(); !_c.done; _c = _b.next()) {
                var characteristic = _c.value;
                characteristic._assignID(identifierCache, accessoryName, this.UUID, this.subtype);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
    };
    /**
     * Returns a JSON representation of this service suitable for delivering to HAP clients.
     * @private used to generate response to /accessories query
     */
    Service.prototype.toHAP = function (connection, contactGetHandlers) {
        var _this = this;
        if (contactGetHandlers === void 0) { contactGetHandlers = true; }
        return new Promise(function (resolve) {
            var e_7, _a, e_8, _b;
            (0, assert_1.default)(_this.iid, "iid cannot be undefined for service '" + _this.displayName + "'");
            (0, assert_1.default)(_this.characteristics.length, "service '" + _this.displayName + "' does not have any characteristics!");
            var service = {
                type: (0, uuid_1.toShortForm)(_this.UUID),
                iid: _this.iid,
                characteristics: [],
                hidden: _this.isHiddenService ? true : undefined,
                primary: _this.isPrimaryService ? true : undefined,
            };
            if (_this.linkedServices.length) {
                service.linked = [];
                try {
                    for (var _c = (0, tslib_1.__values)(_this.linkedServices), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var linked = _d.value;
                        if (!linked.iid) {
                            // we got a linked service which is not added to the accessory
                            // as it doesn't "exists" we just ignore it.
                            // we have some (at least one) plugins on homebridge which link to the AccessoryInformation service.
                            // homebridge always creates its own AccessoryInformation service and ignores the user supplied one
                            // thus the link is automatically broken.
                            debug("iid of linked service '".concat(linked.displayName, "' ").concat(linked.UUID, " is undefined on service '").concat(_this.displayName, "'"));
                            continue;
                        }
                        service.linked.push(linked.iid);
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
            }
            var missingCharacteristics = new Set();
            var timeout = setTimeout(function () {
                var e_9, _a;
                try {
                    for (var missingCharacteristics_1 = (0, tslib_1.__values)(missingCharacteristics), missingCharacteristics_1_1 = missingCharacteristics_1.next(); !missingCharacteristics_1_1.done; missingCharacteristics_1_1 = missingCharacteristics_1.next()) {
                        var characteristic = missingCharacteristics_1_1.value;
                        _this.emitCharacteristicWarningEvent(characteristic, "slow-read" /* SLOW_READ */, "The read handler for the characteristic '".concat(characteristic.displayName, "' was slow to respond!"));
                    }
                }
                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                finally {
                    try {
                        if (missingCharacteristics_1_1 && !missingCharacteristics_1_1.done && (_a = missingCharacteristics_1.return)) _a.call(missingCharacteristics_1);
                    }
                    finally { if (e_9) throw e_9.error; }
                }
                timeout = setTimeout(function () {
                    var e_10, _a;
                    timeout = undefined;
                    try {
                        for (var missingCharacteristics_2 = (0, tslib_1.__values)(missingCharacteristics), missingCharacteristics_2_1 = missingCharacteristics_2.next(); !missingCharacteristics_2_1.done; missingCharacteristics_2_1 = missingCharacteristics_2.next()) {
                            var characteristic = missingCharacteristics_2_1.value;
                            _this.emitCharacteristicWarningEvent(characteristic, "timeout-read" /* TIMEOUT_READ */, "The read handler for the characteristic '" + (characteristic === null || characteristic === void 0 ? void 0 : characteristic.displayName) +
                                "' didn't respond at all!. Please check that you properly call the callback!");
                            service.characteristics.push(characteristic.internalHAPRepresentation()); // value is set to null
                        }
                    }
                    catch (e_10_1) { e_10 = { error: e_10_1 }; }
                    finally {
                        try {
                            if (missingCharacteristics_2_1 && !missingCharacteristics_2_1.done && (_a = missingCharacteristics_2.return)) _a.call(missingCharacteristics_2);
                        }
                        finally { if (e_10) throw e_10.error; }
                    }
                    missingCharacteristics.clear();
                    resolve(service);
                }, 6000);
            }, 3000);
            var _loop_1 = function (characteristic) {
                missingCharacteristics.add(characteristic);
                characteristic.toHAP(connection, contactGetHandlers).then(function (value) {
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
            };
            try {
                for (var _e = (0, tslib_1.__values)(_this.characteristics), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var characteristic = _f.value;
                    _loop_1(characteristic);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_8) throw e_8.error; }
            }
        });
    };
    /**
     * Returns a JSON representation of this service without characteristic values.
     * @private used to generate the config hash
     */
    Service.prototype.internalHAPRepresentation = function () {
        var e_11, _a;
        (0, assert_1.default)(this.iid, "iid cannot be undefined for service '" + this.displayName + "'");
        (0, assert_1.default)(this.characteristics.length, "service '" + this.displayName + "' does not have any characteristics!");
        var service = {
            type: (0, uuid_1.toShortForm)(this.UUID),
            iid: this.iid,
            characteristics: this.characteristics.map(function (characteristic) { return characteristic.internalHAPRepresentation(); }),
            hidden: this.isHiddenService ? true : undefined,
            primary: this.isPrimaryService ? true : undefined,
        };
        if (this.linkedServices.length) {
            service.linked = [];
            try {
                for (var _b = (0, tslib_1.__values)(this.linkedServices), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var linked = _c.value;
                    if (!linked.iid) {
                        // we got a linked service which is not added to the accessory
                        // as it doesn't "exists" we just ignore it.
                        // we have some (at least one) plugins on homebridge which link to the AccessoryInformation service.
                        // homebridge always creates its own AccessoryInformation service and ignores the user supplied one
                        // thus the link is automatically broken.
                        debug("iid of linked service '".concat(linked.displayName, "' ").concat(linked.UUID, " is undefined on service '").concat(this.displayName, "'"));
                        continue;
                    }
                    service.linked.push(linked.iid);
                }
            }
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_11) throw e_11.error; }
            }
        }
        return service;
    };
    /**
     * @private
     */
    Service.prototype.setupCharacteristicEventHandlers = function (characteristic) {
        var _this = this;
        // listen for changes in characteristics and bubble them up
        characteristic.on("change" /* CHANGE */, function (change) {
            _this.emit("characteristic-change" /* CHARACTERISTIC_CHANGE */, (0, tslib_1.__assign)((0, tslib_1.__assign)({}, change), { characteristic: characteristic }));
        });
        characteristic.on("characteristic-warning" /* CHARACTERISTIC_WARNING */, this.emitCharacteristicWarningEvent.bind(this, characteristic));
    };
    /**
     * @private
     */
    Service.prototype.emitCharacteristicWarningEvent = function (characteristic, type, message, stack) {
        this.emit("characteristic-warning" /* CHARACTERISTIC_WARNING */, {
            characteristic: characteristic,
            type: type,
            message: message,
            originatorChain: [this.displayName, characteristic.displayName],
            stack: stack,
        });
    };
    /**
     * @private
     */
    Service.prototype._sideloadCharacteristics = function (targetCharacteristics) {
        var e_12, _a;
        try {
            for (var targetCharacteristics_1 = (0, tslib_1.__values)(targetCharacteristics), targetCharacteristics_1_1 = targetCharacteristics_1.next(); !targetCharacteristics_1_1.done; targetCharacteristics_1_1 = targetCharacteristics_1.next()) {
                var target = targetCharacteristics_1_1.value;
                this.setupCharacteristicEventHandlers(target);
            }
        }
        catch (e_12_1) { e_12 = { error: e_12_1 }; }
        finally {
            try {
                if (targetCharacteristics_1_1 && !targetCharacteristics_1_1.done && (_a = targetCharacteristics_1.return)) _a.call(targetCharacteristics_1);
            }
            finally { if (e_12) throw e_12.error; }
        }
        this.characteristics = targetCharacteristics.slice();
    };
    /**
     * @private
     */
    Service.serialize = function (service) {
        var constructorName;
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
            characteristics: service.characteristics.map(function (characteristic) { return Characteristic_1.Characteristic.serialize(characteristic); }),
            optionalCharacteristics: service.optionalCharacteristics.map(function (characteristic) { return Characteristic_1.Characteristic.serialize(characteristic); }),
        };
    };
    /**
     * @private
     */
    Service.deserialize = function (json) {
        var service;
        if (json.constructorName && json.constructorName.charAt(0).toUpperCase() === json.constructorName.charAt(0)
            && Service[json.constructorName]) { // MUST start with uppercase character and must exist on Service object
            var constructor = Service[json.constructorName];
            service = new constructor(json.displayName, json.subtype);
        }
        else {
            service = new Service(json.displayName, json.UUID, json.subtype);
        }
        service.isHiddenService = !!json.hiddenService;
        service.isPrimaryService = !!json.primaryService;
        var characteristics = json.characteristics.map(function (serialized) { return Characteristic_1.Characteristic.deserialize(serialized); });
        service._sideloadCharacteristics(characteristics);
        if (json.optionalCharacteristics) {
            service.optionalCharacteristics = json.optionalCharacteristics.map(function (serialized) { return Characteristic_1.Characteristic.deserialize(serialized); });
        }
        return service;
    };
    return Service;
}(events_1.EventEmitter));
exports.Service = Service;
//# sourceMappingURL=Service.js.map