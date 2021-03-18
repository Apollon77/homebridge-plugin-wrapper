"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Characteristic = exports.CharacteristicEventTypes = exports.ChangeReason = exports.Access = exports.Perms = exports.Units = exports.Formats = void 0;
var tslib_1 = require("tslib");
var assert_1 = tslib_1.__importDefault(require("assert"));
var debug_1 = tslib_1.__importDefault(require("debug"));
var events_1 = require("events");
var definitions_1 = require("./definitions");
var HAPServer_1 = require("./HAPServer");
var clone_1 = require("./util/clone");
var hapStatusError_1 = require("./util/hapStatusError");
var once_1 = require("./util/once");
var request_util_1 = require("./util/request-util");
var uuid_1 = require("./util/uuid");
var debug = debug_1.default("HAP-NodeJS:Characteristic");
var Formats;
(function (Formats) {
    Formats["BOOL"] = "bool";
    /**
     * Signed 32-bit integer
     */
    Formats["INT"] = "int";
    /**
     * Signed 64-bit floating point
     */
    Formats["FLOAT"] = "float";
    /**
     * String encoded in utf8
     */
    Formats["STRING"] = "string";
    /**
     * Unsigned 8-bit integer.
     */
    Formats["UINT8"] = "uint8";
    /**
     * Unsigned 16-bit integer.
     */
    Formats["UINT16"] = "uint16";
    /**
     * Unsigned 32-bit integer.
     */
    Formats["UINT32"] = "uint32";
    /**
     * Unsigned 64-bit integer.
     */
    Formats["UINT64"] = "uint64";
    /**
     * Data is base64 encoded string.
     */
    Formats["DATA"] = "data";
    /**
     * Base64 encoded tlv8 string.
     */
    Formats["TLV8"] = "tlv8";
    /**
     * @deprecated Not contained in the HAP spec
     */
    Formats["ARRAY"] = "array";
    /**
     * @deprecated Not contained in the HAP spec
     */
    Formats["DICTIONARY"] = "dict";
})(Formats = exports.Formats || (exports.Formats = {}));
var Units;
(function (Units) {
    /**
     * Celsius is the only temperature unit in the HomeKit Accessory Protocol.
     * Unit conversion is always done on the client side e.g. on the iPhone in the Home App depending on
     * the configured unit on the device itself.
     */
    Units["CELSIUS"] = "celsius";
    Units["PERCENTAGE"] = "percentage";
    Units["ARC_DEGREE"] = "arcdegrees";
    Units["LUX"] = "lux";
    Units["SECONDS"] = "seconds";
})(Units = exports.Units || (exports.Units = {}));
var Perms;
(function (Perms) {
    // noinspection JSUnusedGlobalSymbols
    /**
     * @deprecated replaced by {@link PAIRED_READ}. Kept for backwards compatibility.
     */
    Perms["READ"] = "pr";
    /**
     * @deprecated replaced by {@link PAIRED_WRITE}. Kept for backwards compatibility.
     */
    Perms["WRITE"] = "pw";
    Perms["PAIRED_READ"] = "pr";
    Perms["PAIRED_WRITE"] = "pw";
    Perms["NOTIFY"] = "ev";
    Perms["EVENTS"] = "ev";
    Perms["ADDITIONAL_AUTHORIZATION"] = "aa";
    Perms["TIMED_WRITE"] = "tw";
    Perms["HIDDEN"] = "hd";
    Perms["WRITE_RESPONSE"] = "wr";
})(Perms = exports.Perms || (exports.Perms = {}));
var Access;
(function (Access) {
    Access[Access["READ"] = 0] = "READ";
    Access[Access["WRITE"] = 1] = "WRITE";
    Access[Access["NOTIFY"] = 2] = "NOTIFY";
})(Access = exports.Access || (exports.Access = {}));
var ChangeReason;
(function (ChangeReason) {
    /**
     * Reason used when HomeKit writes a value or the API user calls {@link Characteristic.setValue}.
     */
    ChangeReason["WRITE"] = "write";
    /**
     * Reason used when the API user calls the method {@link Characteristic.updateValue}.
     */
    ChangeReason["UPDATE"] = "update";
    /**
     * Used when when HomeKit reads a value or the API user calls the deprecated method {@link Characteristic.getValue}.
     */
    ChangeReason["READ"] = "read";
    /**
     * Used when call to {@link Characteristic.sendEventNotification} was made.
     */
    ChangeReason["EVENT"] = "event";
})(ChangeReason = exports.ChangeReason || (exports.ChangeReason = {}));
var CharacteristicEventTypes;
(function (CharacteristicEventTypes) {
    /**
     * This event is thrown when a HomeKit controller wants to read the current value of the characteristic.
     * The event handler should call the supplied callback as fast as possible.
     *
     * HAP-NodeJS will complain about slow running get handlers after 3 seconds and terminate the request after 10 seconds.
     */
    CharacteristicEventTypes["GET"] = "get";
    /**
     * This event is thrown when a HomeKit controller wants to write a new value to the characteristic.
     * The event handler should call the supplied callback as fast as possible.
     *
     * HAP-NodeJS will complain about slow running set handlers after 3 seconds and terminate the request after 10 seconds.
     */
    CharacteristicEventTypes["SET"] = "set";
    /**
     * Emitted after a new value is set for the characteristic.
     * The new value can be set via a request by a HomeKit controller or via an API call.
     */
    CharacteristicEventTypes["CHANGE"] = "change";
    /**
     * @private
     */
    CharacteristicEventTypes["SUBSCRIBE"] = "subscribe";
    /**
     * @private
     */
    CharacteristicEventTypes["UNSUBSCRIBE"] = "unsubscribe";
    /**
     * @private
     */
    CharacteristicEventTypes["CHARACTERISTIC_WARNING"] = "characteristic-warning";
})(CharacteristicEventTypes = exports.CharacteristicEventTypes || (exports.CharacteristicEventTypes = {}));
var ValidValuesIterable = /** @class */ (function () {
    function ValidValuesIterable(props) {
        assert_1.default(request_util_1.isNumericFormat(props.format), "Cannot instantiate valid values iterable when format is not numeric. Found " + props.format);
        this.props = props;
    }
    ValidValuesIterable.prototype[Symbol.iterator] = function () {
        var _a, _b, value, e_1_1, min, max, stepValue, i;
        var e_1, _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!this.props.validValues) return [3 /*break*/, 9];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 6, 7, 8]);
                    _a = tslib_1.__values(this.props.validValues), _b = _a.next();
                    _d.label = 2;
                case 2:
                    if (!!_b.done) return [3 /*break*/, 5];
                    value = _b.value;
                    return [4 /*yield*/, value];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4:
                    _b = _a.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_1_1 = _d.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 8: return [3 /*break*/, 13];
                case 9:
                    min = 0;
                    max = void 0;
                    stepValue = 1;
                    if (this.props.validValueRanges) {
                        min = this.props.validValueRanges[0];
                        max = this.props.validValueRanges[1];
                    }
                    else if (this.props.minValue != null && this.props.maxValue != null) {
                        min = this.props.minValue;
                        max = this.props.maxValue;
                        if (this.props.minStep != null) {
                            stepValue = this.props.minStep;
                        }
                    }
                    else if (request_util_1.isUnsignedNumericFormat(this.props.format)) {
                        max = request_util_1.numericUpperBound(this.props.format);
                    }
                    else {
                        throw new Error("Could not find valid iterator strategy for props: " + JSON.stringify(this.props));
                    }
                    i = min;
                    _d.label = 10;
                case 10:
                    if (!(i <= max)) return [3 /*break*/, 13];
                    return [4 /*yield*/, i];
                case 11:
                    _d.sent();
                    _d.label = 12;
                case 12:
                    i += stepValue;
                    return [3 /*break*/, 10];
                case 13: return [2 /*return*/];
            }
        });
    };
    return ValidValuesIterable;
}());
/**
 * Characteristic represents a particular typed variable that can be assigned to a Service. For instance, a
 * "Hue" Characteristic might store a 'float' value of type 'arcdegrees'. You could add the Hue Characteristic
 * to a {@link Service} in order to store that value. A particular Characteristic is distinguished from others by its
 * UUID. HomeKit provides a set of known Characteristic UUIDs defined in HomeKit.ts along with a
 * corresponding concrete subclass.
 *
 * You can also define custom Characteristics by providing your own UUID. Custom Characteristics can be added
 * to any native or custom Services, but Siri will likely not be able to work with these.
 */
var Characteristic = /** @class */ (function (_super) {
    tslib_1.__extends(Characteristic, _super);
    function Characteristic(displayName, UUID, props) {
        var _this = _super.call(this) || this;
        _this.iid = null;
        _this.value = null;
        /**
         * @deprecated replaced by {@link statusCode}
         * @private
         */
        _this.status = null;
        /**
         * @private
         */
        _this.statusCode = 0 /* SUCCESS */;
        _this.subscriptions = 0;
        _this.displayName = displayName;
        _this.UUID = UUID;
        _this.props = {
            format: "int" /* INT */,
            perms: ["ev" /* NOTIFY */],
        };
        _this.setProps(props || {}); // ensure sanity checks are called
        return _this;
    }
    /**
     * Accepts a function that will be called to retrieve the current value of a Characteristic.
     * The function must return a valid Characteristic value for the Characteristic type.
     * May optionally return a promise.
     *
     * @example
     * ```ts
     * Characteristic.onGet(async () => {
     *   return true;
     * });
     * ```
     * @param handler
     */
    Characteristic.prototype.onGet = function (handler) {
        if (typeof handler !== 'function') {
            this.characteristicWarning(".onGet handler must be a function");
            return this;
        }
        this.getHandler = handler;
        return this;
    };
    /**
     * Removes the {@link CharacteristicGetHandler} handler which was configured using {@link onGet}.
     */
    Characteristic.prototype.removeOnGet = function () {
        this.getHandler = undefined;
        return this;
    };
    /**
     * Accepts a function that will be called when setting the value of a Characteristic.
     * If the characteristic supports {@link Perms.WRITE_RESPONSE} and the request requests a write response value,
     * the returned value will be used.
     * May optionally return a promise.
     *
     * @example
     * ```ts
     * Characteristic.onSet(async (value: CharacteristicValue) => {
     *   console.log(value);
     * });
     * ```
     * @param handler
     */
    Characteristic.prototype.onSet = function (handler) {
        if (typeof handler !== 'function') {
            this.characteristicWarning(".onSet handler must be a function");
            return this;
        }
        this.setHandler = handler;
        return this;
    };
    /**
     * Removes the {@link CharacteristicSetHandler} which was configured using {@link onSet}.
     */
    Characteristic.prototype.removeOnSet = function () {
        this.setHandler = undefined;
        return this;
    };
    /**
     * Updates the properties of this characteristic.
     * Properties passed via the parameter will be set. Any parameter set to null will be deleted.
     * See {@link CharacteristicProps}.
     *
     * @param props - Partial properties object with the desired updates.
     */
    Characteristic.prototype.setProps = function (props) {
        assert_1.default(props, "props cannot be undefined when setting props");
        // TODO calling setProps after publish doesn't lead to a increment in the current configuration number
        // for every value "null" can be used to reset props, except for required props
        if (props.format) {
            this.props.format = props.format;
        }
        if (props.perms) {
            assert_1.default(props.perms.length > 0, "characteristic prop perms cannot be empty array");
            this.props.perms = props.perms;
        }
        if (props.unit !== undefined) {
            this.props.unit = props.unit != null ? props.unit : undefined;
        }
        if (props.description !== undefined) {
            this.props.description = props.description != null ? props.description : undefined;
        }
        // check minValue is valid for the format type
        if (props.minValue !== undefined) {
            if (props.minValue === null) {
                props.minValue = undefined;
            }
            else if (!request_util_1.isNumericFormat(this.props.format)) {
                this.characteristicWarning("Characteristic Property 'minValue' can only be set for characteristics with numeric format, but not for " + this.props.format, "error-message" /* ERROR_MESSAGE */);
                props.minValue = undefined;
            }
            else if (typeof props.minValue !== 'number' || !Number.isFinite(props.minValue)) {
                this.characteristicWarning("Characteristic Property 'minValue' must be a finite number, received \"" + props.minValue + "\" (" + typeof props.minValue + ")", "error-message" /* ERROR_MESSAGE */);
                props.minValue = undefined;
            }
            else {
                if (props.minValue < request_util_1.numericLowerBound(this.props.format)) {
                    this.characteristicWarning("Characteristic Property 'minValue' was set to " + props.minValue + ", but for numeric format " +
                        this.props.format + " minimum possible is " + request_util_1.numericLowerBound(this.props.format), "error-message" /* ERROR_MESSAGE */);
                    props.minValue = request_util_1.numericLowerBound(this.props.format);
                }
                else if (props.minValue > request_util_1.numericUpperBound(this.props.format)) {
                    this.characteristicWarning("Characteristic Property 'minValue' was set to " + props.minValue + ", but for numeric format " +
                        this.props.format + " maximum possible is " + request_util_1.numericUpperBound(this.props.format), "error-message" /* ERROR_MESSAGE */);
                    props.minValue = request_util_1.numericLowerBound(this.props.format);
                }
            }
            this.props.minValue = props.minValue;
        }
        // check maxValue is valid for the format type
        if (props.maxValue !== undefined) {
            if (props.maxValue === null) {
                props.maxValue = undefined;
            }
            else if (!request_util_1.isNumericFormat(this.props.format)) {
                this.characteristicWarning("Characteristic Property 'maxValue' can only be set for characteristics with numeric format, but not for " + this.props.format, "error-message" /* ERROR_MESSAGE */);
                props.maxValue = undefined;
            }
            else if (typeof props.maxValue !== 'number' || !Number.isFinite(props.maxValue)) {
                this.characteristicWarning("Characteristic Property 'maxValue' must be a finite number, received \"" + props.maxValue + "\" (" + typeof props.maxValue + ")", "error-message" /* ERROR_MESSAGE */);
                props.maxValue = undefined;
            }
            else {
                if (props.maxValue > request_util_1.numericUpperBound(this.props.format)) {
                    this.characteristicWarning("Characteristic Property 'maxValue' was set to " + props.maxValue + ", but for numeric format " +
                        this.props.format + " maximum possible is " + request_util_1.numericUpperBound(this.props.format), "error-message" /* ERROR_MESSAGE */);
                    props.maxValue = request_util_1.numericUpperBound(this.props.format);
                }
                else if (props.maxValue < request_util_1.numericLowerBound(this.props.format)) {
                    this.characteristicWarning("Characteristic Property 'maxValue' was set to " + props.maxValue + ", but for numeric format " +
                        this.props.format + " minimum possible is " + request_util_1.numericUpperBound(this.props.format), "error-message" /* ERROR_MESSAGE */);
                    props.maxValue = request_util_1.numericUpperBound(this.props.format);
                }
            }
            this.props.maxValue = props.maxValue;
        }
        if (props.minStep !== undefined) {
            if (props.minStep === null) {
                this.props.minStep = undefined;
            }
            else if (!request_util_1.isNumericFormat(this.props.format)) {
                this.characteristicWarning("Characteristic Property `minStep` can only be set for characteristics with numeric format, but not for " + this.props.format, "error-message" /* ERROR_MESSAGE */);
            }
            else {
                if (props.minStep < 1 && request_util_1.isIntegerNumericFormat(this.props.format)) {
                    this.characteristicWarning("Characteristic Property `minStep` was set to a value lower than 1, " +
                        "this will have no effect on format `" + this.props.format);
                }
                this.props.minStep = props.minStep;
            }
        }
        if (props.maxLen !== undefined) {
            if (props.maxLen === null) {
                this.props.maxLen = undefined;
            }
            else if (this.props.format !== "string" /* STRING */) {
                this.characteristicWarning("Characteristic Property `maxLen` can only be set for characteristics with format `STRING`, but not for " + this.props.format, "error-message" /* ERROR_MESSAGE */);
            }
            else {
                if (props.maxLen > 256) {
                    this.characteristicWarning("Characteristic Property string `maxLen` cannot be bigger than 256");
                    props.maxLen = 256;
                }
                this.props.maxLen = props.maxLen;
            }
        }
        if (props.maxDataLen !== undefined) {
            if (props.maxDataLen === null) {
                this.props.maxDataLen = undefined;
            }
            else if (this.props.format !== "data" /* DATA */) {
                this.characteristicWarning("Characteristic Property `maxDataLen` can only be set for characteristics with format `DATA`, but not for " + this.props.format, "error-message" /* ERROR_MESSAGE */);
            }
            else {
                this.props.maxDataLen = props.maxDataLen;
            }
        }
        if (props.validValues !== undefined) {
            if (props.validValues === null) {
                this.props.validValues = undefined;
            }
            else if (!request_util_1.isNumericFormat(this.props.format)) {
                this.characteristicWarning("Characteristic Property `validValues` was supplied for non numeric format " + this.props.format);
            }
            else {
                assert_1.default(props.validValues.length, "characteristic prop validValues cannot be empty array");
                this.props.validValues = props.validValues;
            }
        }
        if (props.validValueRanges !== undefined) {
            if (props.validValueRanges === null) {
                this.props.validValueRanges = undefined;
            }
            else if (!request_util_1.isNumericFormat(this.props.format)) {
                this.characteristicWarning("Characteristic Property `validValueRanges` was supplied for non numeric format " + this.props.format);
            }
            else {
                assert_1.default(props.validValueRanges.length === 2, "characteristic prop validValueRanges must have a length of 2");
                this.props.validValueRanges = props.validValueRanges;
            }
        }
        if (props.adminOnlyAccess !== undefined) {
            this.props.adminOnlyAccess = props.adminOnlyAccess != null ? props.adminOnlyAccess : undefined;
        }
        if (this.props.minValue != null && this.props.maxValue != null) { // the eqeq instead of eqeqeq is important here
            if (this.props.minValue > this.props.maxValue) { // see https://github.com/homebridge/HAP-NodeJS/issues/690
                this.props.minValue = undefined;
                this.props.maxValue = undefined;
                throw new Error("Error setting CharacteristicsProps for '" + this.displayName + "': 'minValue' cannot be greater or equal the 'maxValue'!");
            }
        }
        return this;
    };
    /**
     * This method can be used to gain a Iterator to loop over all valid values defined for this characteristic.
     *
     * The range of valid values can be defined using three different ways via the {@link CharacteristicProps} object
     * (set via the {@link setProps} method):
     *  * First method is to specifically list every valid value inside {@link CharacteristicProps.validValues}
     *  * Second you can specify a range via {@link CharacteristicProps.minValue} and {@link CharacteristicProps.maxValue} (with optionally defining
     *    {@link CharacteristicProps.minStep})
     *  * And lastly you can specify a range via {@link CharacteristicProps.validValueRanges}
     *  * Implicitly a valid value range is predefined for characteristics with Format {@link Formats.UINT8}, {@link Formats.UINT16},
     *    {@link Formats.UINT32} and {@link Formats.UINT64}: starting by zero to their respective maximum number
     *
     * The method will automatically detect which type of valid values definition is used and provide
     * the correct Iterator for that case.
     *
     * Note: This method is (obviously) only valid for numeric characteristics.
     *
     * @example
     * ```ts
     * // use the iterator to loop over every valid value...
     * for (const value of characteristic.validValuesIterator()) {
     *   // Insert logic to run for every
     * }
     *
     * // ... or collect them in an array for storage or manipulation
     * const validValues = Array.from(characteristic.validValuesIterator());
     * ```
     */
    Characteristic.prototype.validValuesIterator = function () {
        return new ValidValuesIterable(this.props);
    };
    // noinspection JSUnusedGlobalSymbols
    /**
     * This method can be used to setup additional authorization for a characteristic.
     * For one it adds the {@link Perms.ADDITIONAL_AUTHORIZATION} permission to the characteristic
     * (if it wasn't already) to signal support for additional authorization to HomeKit.
     * Additionally an {@link AdditionalAuthorizationHandler} is setup up which is called
     * before a write request is performed.
     *
     * Additional Authorization Data can be added to SET request via a custom iOS App.
     * Before hap-nodejs executes a write request it will call the {@link AdditionalAuthorizationHandler}
     * with 'authData' supplied in the write request. The 'authData' is a base64 encoded string
     * (or undefined if no authData was supplied).
     * The {@link AdditionalAuthorizationHandler} must then return true or false to indicate if the write request
     * is authorized and should be accepted.
     *
     * @param handler - Handler called to check additional authorization data.
     */
    Characteristic.prototype.setupAdditionalAuthorization = function (handler) {
        if (!this.props.perms.includes("aa" /* ADDITIONAL_AUTHORIZATION */)) {
            this.props.perms.push("aa" /* ADDITIONAL_AUTHORIZATION */);
        }
        this.additionalAuthorizationHandler = handler;
    };
    /**
     * Updates the current value of the characteristic.
     *
     * @param callback
     * @param context
     * @private use to return the current value on HAP requests
     *
     * @deprecated
     */
    Characteristic.prototype.getValue = function (callback, context) {
        this.handleGetRequest(undefined, context).then(function (value) {
            if (callback) {
                callback(null, value);
            }
        }, function (reason) {
            if (callback) {
                callback(reason);
            }
        });
    };
    Characteristic.prototype.setValue = function (value, callback, context) {
        if (value instanceof Error) {
            this.statusCode = value instanceof hapStatusError_1.HapStatusError ? value.hapStatus : extractHAPStatusFromError(value);
            // noinspection JSDeprecatedSymbols
            this.status = value;
            if (callback) {
                callback();
            }
            return this;
        }
        if (callback && !context && typeof callback !== "function") {
            context = callback;
            callback = undefined;
        }
        try {
            value = this.validateUserInput(value);
        }
        catch (error) {
            this.characteristicWarning((error === null || error === void 0 ? void 0 : error.message) + "", "error-message" /* ERROR_MESSAGE */, error === null || error === void 0 ? void 0 : error.stack);
            if (callback) {
                callback(error);
            }
            return this;
        }
        this.handleSetRequest(value, undefined, context).then(function (value) {
            if (callback) {
                if (value) { // possible write response
                    callback(null, value);
                }
                else {
                    callback(null);
                }
            }
        }, function (reason) {
            if (callback) {
                callback(reason);
            }
        });
        return this;
    };
    Characteristic.prototype.updateValue = function (value, callback, context) {
        if (value instanceof Error) {
            this.statusCode = value instanceof hapStatusError_1.HapStatusError ? value.hapStatus : extractHAPStatusFromError(value);
            // noinspection JSDeprecatedSymbols
            this.status = value;
            if (callback) {
                callback();
            }
            return this;
        }
        if (callback && !context && typeof callback !== "function") {
            context = callback;
            callback = undefined;
        }
        try {
            value = this.validateUserInput(value);
        }
        catch (error) {
            this.characteristicWarning((error === null || error === void 0 ? void 0 : error.message) + "", "error-message" /* ERROR_MESSAGE */, error === null || error === void 0 ? void 0 : error.stack);
            if (callback) {
                callback();
            }
            return this;
        }
        this.statusCode = 0 /* SUCCESS */;
        // noinspection JSDeprecatedSymbols
        this.status = null;
        var oldValue = this.value;
        this.value = value;
        if (callback) {
            callback();
        }
        this.emit("change" /* CHANGE */, { originator: undefined, oldValue: oldValue, newValue: value, reason: "update" /* UPDATE */, context: context });
        return this; // for chaining
    };
    /**
     * This method acts similarly to {@link updateValue} by setting the current value of the characteristic
     * without calling any {@link CharacteristicEventTypes.SET} or {@link onSet} handlers.
     * The difference is that this method forces a event notification sent (updateValue only sends one if the value changed).
     * This is especially useful for characteristics like {@link Characteristic.ButtonEvent} or {@link Characteristic.ProgrammableSwitchEvent}.
     *
     * @param value - The new value.
     * @param context - Passed to the {@link CharacteristicEventTypes.CHANGE} event handler.
     */
    Characteristic.prototype.sendEventNotification = function (value, context) {
        this.statusCode = 0 /* SUCCESS */;
        // noinspection JSDeprecatedSymbols
        this.status = null;
        value = this.validateUserInput(value);
        var oldValue = this.value;
        this.value = value;
        this.emit("change" /* CHANGE */, { originator: undefined, oldValue: oldValue, newValue: value, reason: "event" /* EVENT */, context: context });
        return this; // for chaining
    };
    /**
     * Called when a HAP requests wants to know the current value of the characteristic.
     *
     * @param connection - The HAP connection from which the request originated from.
     * @param context - Deprecated parameter. There for backwards compatibility.
     * @private Used by the Accessory to load the characteristic value
     */
    Characteristic.prototype.handleGetRequest = function (connection, context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var value, oldValue, error_1, hapStatusError;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.props.perms.includes("pr" /* PAIRED_READ */)) { // check if we are allowed to read from this characteristic
                            throw -70405 /* WRITE_ONLY_CHARACTERISTIC */;
                        }
                        if (this.UUID === Characteristic.ProgrammableSwitchEvent.UUID) {
                            // special workaround for event only programmable switch event, which must always return null
                            return [2 /*return*/, null];
                        }
                        if (!this.getHandler) return [3 /*break*/, 4];
                        if (this.listeners("get" /* GET */).length > 0) {
                            this.characteristicWarning("Ignoring on('get') handler as onGet handler was defined instead");
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getHandler(context, connection)];
                    case 2:
                        value = _a.sent();
                        this.statusCode = 0 /* SUCCESS */;
                        // noinspection JSDeprecatedSymbols
                        this.status = null;
                        try {
                            value = this.validateUserInput(value);
                        }
                        catch (error) {
                            this.characteristicWarning("An illegal value was supplied by the read handler for characteristic: " + (error === null || error === void 0 ? void 0 : error.message), "warn-message" /* WARN_MESSAGE */, error === null || error === void 0 ? void 0 : error.stack);
                            this.statusCode = -70402 /* SERVICE_COMMUNICATION_FAILURE */;
                            // noinspection JSDeprecatedSymbols
                            this.status = error;
                            return [2 /*return*/, Promise.reject(-70402 /* SERVICE_COMMUNICATION_FAILURE */)];
                        }
                        oldValue = this.value;
                        this.value = value;
                        if (oldValue !== value) { // emit a change event if necessary
                            this.emit("change" /* CHANGE */, { originator: connection, oldValue: oldValue, newValue: value, reason: "read" /* READ */, context: context });
                        }
                        return [2 /*return*/, value];
                    case 3:
                        error_1 = _a.sent();
                        if (typeof error_1 === "number") {
                            hapStatusError = new hapStatusError_1.HapStatusError(error_1);
                            this.statusCode = hapStatusError.hapStatus;
                            // noinspection JSDeprecatedSymbols
                            this.status = hapStatusError;
                        }
                        else if (error_1 instanceof hapStatusError_1.HapStatusError) {
                            this.statusCode = error_1.hapStatus;
                            // noinspection JSDeprecatedSymbols
                            this.status = error_1;
                        }
                        else {
                            this.characteristicWarning("Unhandled error thrown inside read handler for characteristic: " + (error_1 === null || error_1 === void 0 ? void 0 : error_1.message), "error-message" /* ERROR_MESSAGE */, error_1 === null || error_1 === void 0 ? void 0 : error_1.stack);
                            this.statusCode = -70402 /* SERVICE_COMMUNICATION_FAILURE */;
                            // noinspection JSDeprecatedSymbols
                            this.status = error_1;
                        }
                        throw this.statusCode;
                    case 4:
                        if (this.listeners("get" /* GET */).length === 0) {
                            if (this.statusCode) {
                                throw this.statusCode;
                            }
                            try {
                                return [2 /*return*/, this.validateUserInput(this.value)];
                            }
                            catch (error) {
                                this.characteristicWarning("An illegal value was supplied by setting `value` for characteristic: " + (error === null || error === void 0 ? void 0 : error.message), "warn-message" /* WARN_MESSAGE */, error === null || error === void 0 ? void 0 : error.stack);
                                return [2 /*return*/, Promise.reject(-70402 /* SERVICE_COMMUNICATION_FAILURE */)];
                            }
                        }
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                try {
                                    _this.emit("get" /* GET */, once_1.once(function (status, value) {
                                        if (status) {
                                            if (typeof status === "number") {
                                                var hapStatusError = new hapStatusError_1.HapStatusError(status);
                                                _this.statusCode = hapStatusError.hapStatus;
                                                // noinspection JSDeprecatedSymbols
                                                _this.status = hapStatusError;
                                            }
                                            else if (status instanceof hapStatusError_1.HapStatusError) {
                                                _this.statusCode = status.hapStatus;
                                                // noinspection JSDeprecatedSymbols
                                                _this.status = status;
                                            }
                                            else {
                                                debug("[%s] Received error from get handler %s", _this.displayName, status.stack);
                                                _this.statusCode = extractHAPStatusFromError(status);
                                                // noinspection JSDeprecatedSymbols
                                                _this.status = status;
                                            }
                                            reject(_this.statusCode);
                                            return;
                                        }
                                        _this.statusCode = 0 /* SUCCESS */;
                                        // noinspection JSDeprecatedSymbols
                                        _this.status = null;
                                        value = _this.validateUserInput(value);
                                        var oldValue = _this.value;
                                        _this.value = value;
                                        resolve(value);
                                        if (oldValue !== value) { // emit a change event if necessary
                                            _this.emit("change" /* CHANGE */, { originator: connection, oldValue: oldValue, newValue: value, reason: "read" /* READ */, context: context });
                                        }
                                    }), context, connection);
                                }
                                catch (error) {
                                    _this.characteristicWarning("Unhandled error thrown inside read handler for characteristic: " + (error === null || error === void 0 ? void 0 : error.message), "error-message" /* ERROR_MESSAGE */, error === null || error === void 0 ? void 0 : error.stack);
                                    _this.statusCode = -70402 /* SERVICE_COMMUNICATION_FAILURE */;
                                    // noinspection JSDeprecatedSymbols
                                    _this.status = error;
                                    reject(-70402 /* SERVICE_COMMUNICATION_FAILURE */);
                                }
                            })];
                }
            });
        });
    };
    /**
     * Called when a HAP requests update the current value of the characteristic.
     *
     * @param value - The updated value
     * @param connection - The connection from which the request originated from
     * @param context - Deprecated parameter. There for backwards compatibility.
     * @returns Promise resolve to void in normal operation. When characteristic supports write response, the
     *  HAP request requests write response and the set handler returns a write response value, the respective
     *  write response value is resolved.
     * @private
     */
    Characteristic.prototype.handleSetRequest = function (value, connection, context) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var oldValue, writeResponse, error_2, hapStatusError;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.statusCode = 0 /* SUCCESS */;
                        // noinspection JSDeprecatedSymbols
                        this.status = null;
                        if (connection !== undefined) {
                            // if connection is undefined, the set "request" comes from the setValue method.
                            // for setValue a value of "null" is allowed and checked via validateUserInput.
                            try {
                                value = this.validateClientSuppliedValue(value);
                            }
                            catch (e) {
                                debug("[" + this.displayName + "]", e.message);
                                return [2 /*return*/, Promise.reject(-70410 /* INVALID_VALUE_IN_REQUEST */)];
                            }
                        }
                        oldValue = this.value;
                        if (!this.setHandler) return [3 /*break*/, 4];
                        if (this.listeners("set" /* SET */).length > 0) {
                            this.characteristicWarning("Ignoring on('set') handler as onSet handler was defined instead");
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.setHandler(value, context, connection)];
                    case 2:
                        writeResponse = _a.sent();
                        this.statusCode = 0 /* SUCCESS */;
                        // noinspection JSDeprecatedSymbols
                        this.status = null;
                        if (writeResponse != null && this.props.perms.includes("wr" /* WRITE_RESPONSE */)) {
                            this.value = this.validateUserInput(writeResponse);
                            return [2 /*return*/, this.value];
                        }
                        else {
                            if (writeResponse != null) {
                                this.characteristicWarning("SET handler returned write response value, though the characteristic doesn't support write response", "debug-message" /* DEBUG_MESSAGE */);
                            }
                            this.value = value;
                            this.emit("change" /* CHANGE */, { originator: connection, oldValue: oldValue, newValue: value, reason: "write" /* WRITE */, context: context });
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        if (typeof error_2 === "number") {
                            hapStatusError = new hapStatusError_1.HapStatusError(error_2);
                            this.statusCode = hapStatusError.hapStatus;
                            // noinspection JSDeprecatedSymbols
                            this.status = hapStatusError;
                        }
                        else if (error_2 instanceof hapStatusError_1.HapStatusError) {
                            this.statusCode = error_2.hapStatus;
                            // noinspection JSDeprecatedSymbols
                            this.status = error_2;
                        }
                        else {
                            this.characteristicWarning("Unhandled error thrown inside write handler for characteristic: " + (error_2 === null || error_2 === void 0 ? void 0 : error_2.message), "error-message" /* ERROR_MESSAGE */, error_2 === null || error_2 === void 0 ? void 0 : error_2.stack);
                            this.statusCode = -70402 /* SERVICE_COMMUNICATION_FAILURE */;
                            // noinspection JSDeprecatedSymbols
                            this.status = error_2;
                        }
                        throw this.statusCode;
                    case 4:
                        if (this.listeners("set" /* SET */).length === 0) {
                            this.value = value;
                            this.emit("change" /* CHANGE */, { originator: connection, oldValue: oldValue, newValue: value, reason: "write" /* WRITE */, context: context });
                            return [2 /*return*/, Promise.resolve()];
                        }
                        else {
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    try {
                                        _this.emit("set" /* SET */, value, once_1.once(function (status, writeResponse) {
                                            if (status) {
                                                if (typeof status === "number") {
                                                    var hapStatusError = new hapStatusError_1.HapStatusError(status);
                                                    _this.statusCode = hapStatusError.hapStatus;
                                                    // noinspection JSDeprecatedSymbols
                                                    _this.status = hapStatusError;
                                                }
                                                else if (status instanceof hapStatusError_1.HapStatusError) {
                                                    _this.statusCode = status.hapStatus;
                                                    // noinspection JSDeprecatedSymbols
                                                    _this.status = status;
                                                }
                                                else {
                                                    debug("[%s] Received error from set handler %s", _this.displayName, status.stack);
                                                    _this.statusCode = extractHAPStatusFromError(status);
                                                    // noinspection JSDeprecatedSymbols
                                                    _this.status = status;
                                                }
                                                reject(_this.statusCode);
                                                return;
                                            }
                                            _this.statusCode = 0 /* SUCCESS */;
                                            // noinspection JSDeprecatedSymbols
                                            _this.status = null;
                                            if (writeResponse != null && _this.props.perms.includes("wr" /* WRITE_RESPONSE */)) {
                                                // support write response simply by letting the implementor pass the response as second argument to the callback
                                                _this.value = _this.validateUserInput(writeResponse);
                                                resolve(_this.value);
                                            }
                                            else {
                                                if (writeResponse != null) {
                                                    _this.characteristicWarning("SET handler returned write response value, though the characteristic doesn't support write response", "debug-message" /* DEBUG_MESSAGE */);
                                                }
                                                _this.value = value;
                                                resolve();
                                                _this.emit("change" /* CHANGE */, { originator: connection, oldValue: oldValue, newValue: value, reason: "write" /* WRITE */, context: context });
                                            }
                                        }), context, connection);
                                    }
                                    catch (error) {
                                        _this.characteristicWarning("Unhandled error thrown inside write handler for characteristic: " + (error === null || error === void 0 ? void 0 : error.message), "error-message" /* ERROR_MESSAGE */, error === null || error === void 0 ? void 0 : error.stack);
                                        _this.statusCode = -70402 /* SERVICE_COMMUNICATION_FAILURE */;
                                        // noinspection JSDeprecatedSymbols
                                        _this.status = error;
                                        reject(-70402 /* SERVICE_COMMUNICATION_FAILURE */);
                                    }
                                })];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Called once a HomeKit controller subscribes to events of this characteristics.
     * @private
     */
    Characteristic.prototype.subscribe = function () {
        if (this.subscriptions === 0) {
            this.emit("subscribe" /* SUBSCRIBE */);
        }
        this.subscriptions++;
    };
    /**
     * Called once a HomeKit controller unsubscribe to events of this characteristics or a HomeKit controller
     * which was subscribed to this characteristic disconnects.
     * @private
     */
    Characteristic.prototype.unsubscribe = function () {
        var wasOne = this.subscriptions === 1;
        this.subscriptions--;
        this.subscriptions = Math.max(this.subscriptions, 0);
        if (wasOne) {
            this.emit("unsubscribe" /* UNSUBSCRIBE */);
        }
    };
    Characteristic.prototype.getDefaultValue = function () {
        var _a;
        // noinspection JSDeprecatedSymbols
        switch (this.props.format) {
            case "bool" /* BOOL */:
                return false;
            case "string" /* STRING */:
                switch (this.UUID) {
                    case Characteristic.Manufacturer.UUID:
                        return "Default-Manufacturer";
                    case Characteristic.Model.UUID:
                        return "Default-Model";
                    case Characteristic.SerialNumber.UUID:
                        return "Default-SerialNumber";
                    case Characteristic.FirmwareRevision.UUID:
                        return "0.0.0";
                    default:
                        return "";
                }
            case "data" /* DATA */:
                return null; // who knows!
            case "tlv8" /* TLV8 */:
                return null; // who knows!
            case "dict" /* DICTIONARY */:
                return {};
            case "array" /* ARRAY */:
                return [];
            case "int" /* INT */:
            case "float" /* FLOAT */:
            case "uint8" /* UINT8 */:
            case "uint16" /* UINT16 */:
            case "uint32" /* UINT32 */:
            case "uint64" /* UINT64 */:
                switch (this.UUID) {
                    case Characteristic.CurrentTemperature.UUID:
                        return 0; // some existing integrations expect this to be 0 by default
                    default: {
                        if (((_a = this.props.validValues) === null || _a === void 0 ? void 0 : _a.length) && typeof this.props.validValues[0] === 'number') {
                            return this.props.validValues[0];
                        }
                        if (typeof this.props.minValue === 'number' && Number.isFinite(this.props.minValue)) {
                            return this.props.minValue;
                        }
                        return 0;
                    }
                }
            default:
                return 0;
        }
    };
    /**
     * Checks if the value received from the HAP request is valid.
     * If returned false the received value is not valid and {@link HAPStatus.INVALID_VALUE_IN_REQUEST}
     * must be returned.
     * @param value - Value supplied by the HomeKit controller
     */
    Characteristic.prototype.validateClientSuppliedValue = function (value) {
        if (value == undefined) {
            throw new Error("Client supplied invalid value for " + this.props.format + ": undefined");
        }
        switch (this.props.format) {
            case "bool" /* BOOL */: {
                if (typeof value === 'boolean') {
                    return value;
                }
                if (typeof value === 'number' && (value === 1 || value === 0)) {
                    return Boolean(value);
                }
                throw new Error("Client supplied invalid type for " + this.props.format + ": \"" + value + "\" (" + typeof value + ")");
            }
            case "int" /* INT */:
            case "float" /* FLOAT */:
            case "uint8" /* UINT8 */:
            case "uint16" /* UINT16 */:
            case "uint32" /* UINT32 */:
            case "uint64" /* UINT64 */: {
                if (typeof value === "boolean") {
                    value = value ? 1 : 0;
                }
                if (typeof value !== "number" || !Number.isFinite(value)) {
                    throw new Error("Client supplied invalid type for " + this.props.format + ": \"" + value + "\" (" + typeof value + ")");
                }
                var numericMin = maxWithUndefined(this.props.minValue, request_util_1.numericLowerBound(this.props.format));
                var numericMax = minWithUndefined(this.props.maxValue, request_util_1.numericUpperBound(this.props.format));
                if (typeof numericMin === 'number' && value < numericMin) {
                    throw new Error("Client supplied value of " + value + " is less than the minimum allowed value of " + numericMin);
                }
                if (typeof numericMax === 'number' && value > numericMax) {
                    throw new Error("Client supplied value of " + value + " is greater than the maximum allowed value of " + numericMax);
                }
                if (this.props.validValues && !this.props.validValues.includes(value)) {
                    throw new Error("Client supplied value of " + value + " is not in " + this.props.validValues.toString());
                }
                if (this.props.validValueRanges && this.props.validValueRanges.length === 2) {
                    if (value < this.props.validValueRanges[0]) {
                        throw new Error("Client supplied value of " + value + " is less than the minimum allowed value of " + this.props.validValueRanges[0]);
                    }
                    if (value > this.props.validValueRanges[1]) {
                        throw new Error("Client supplied value of " + value + " is greater than the maximum allowed value of " + this.props.validValueRanges[1]);
                    }
                }
                return value;
            }
            case "string" /* STRING */: {
                if (typeof value !== "string") {
                    throw new Error("Client supplied invalid type for " + this.props.format + ": \"" + value + "\" (" + typeof value + ")");
                }
                var maxLength = this.props.maxLen != null ? this.props.maxLen : 64; // default is 64; max is 256 which is set in setProps
                if (value.length > maxLength) {
                    throw new Error("Client supplied value length of " + value.length + " exceeds maximum length allowed of " + maxLength);
                }
                return value;
            }
            case "data" /* DATA */: {
                if (typeof value !== "string") {
                    throw new Error("Client supplied invalid type for " + this.props.format + ": \"" + value + "\" (" + typeof value + ")");
                }
                // we don't validate base64 here
                var maxLength = this.props.maxDataLen != null ? this.props.maxDataLen : 0x200000; // default is 0x200000
                if (value.length > maxLength) {
                    throw new Error("Client supplied value length of " + value.length + " exceeds maximum length allowed of " + maxLength);
                }
                return value;
            }
            case "tlv8" /* TLV8 */:
                if (typeof value !== "string") {
                    throw new Error("Client supplied invalid type for " + this.props.format + ": \"" + value + "\" (" + typeof value + ")");
                }
                return value;
        }
        return value;
    };
    /**
     * Checks if the value received from the API call is valid.
     * It adjust the value where it makes sense, prints a warning where values may be rejected with an error
     * in the future and throws an error which can't be converted to a valid value.
     *
     * @param value - The value received from the API call
     */
    Characteristic.prototype.validateUserInput = function (value) {
        var _a;
        if (value === null) {
            if (this.UUID === Characteristic.Model.UUID || this.UUID === Characteristic.SerialNumber.UUID) { // mirrors the statement in case: Formats.STRING
                this.characteristicWarning("characteristic must have a non null value otherwise HomeKit will reject this accessory, ignoring new value", "error-message" /* ERROR_MESSAGE */);
                return this.value; // don't change the value
            }
            if (this.getDefaultValue() === null) {
                return value; // any format which has default value null, is allowed to have null as a value (e.g. TLV8 or DATA formats)
            }
            /**
             * A short disclaimer here.
             * null is actually a perfectly valid value for characteristics to have.
             * The Home app will show "no response" for some characteristics for which it can't handle null
             * but ultimately its valid and the developers decision what the return.
             * BUT: out of history hap-nodejs did replaced null with the last known value and thus
             * homebridge devs started to adopting this method as a way of not changing the value in a GET handler.
             * As an intermediate step we kept the behavior but added a warning printed to the console.
             * In a future update we will do the breaking change of return null below!
             */
            if (this.UUID.endsWith(uuid_1.BASE_UUID)) { // we have a apple defined characteristic (at least assuming nobody else uses the UUID namespace)
                if (this.UUID === definitions_1.ProgrammableSwitchEvent.UUID) {
                    return value; // null is allowed as a value for ProgrammableSwitchEvent
                }
                this.characteristicWarning("characteristic was supplied illegal value: null! Home App will reject null for Apple defined characteristics");
                // if the value has been set previously, return it now, otherwise continue with validation to have a default value set.
                if (this.value !== null) {
                    return this.value;
                }
            }
            else {
                // we currently allow null for any non custom defined characteristics
                return value;
            }
        }
        switch (this.props.format) {
            case "bool" /* BOOL */: {
                if (typeof value === "boolean") {
                    return value;
                }
                if (typeof value === "number") {
                    return value === 1;
                }
                if (typeof value === "string") {
                    return value === "1" || value === "true";
                }
                this.characteristicWarning("characteristic value expected boolean and received " + typeof value);
                return false;
            }
            case "int" /* INT */:
            case "float" /* FLOAT */:
            case "uint8" /* UINT8 */:
            case "uint16" /* UINT16 */:
            case "uint32" /* UINT32 */:
            case "uint64" /* UINT64 */: {
                if (typeof value === "boolean") {
                    value = value ? 1 : 0;
                }
                if (typeof value === "string") {
                    value = this.props.format === "float" /* FLOAT */ ? parseFloat(value) : parseInt(value, 10);
                }
                if (typeof value !== 'number' || !Number.isFinite(value)) {
                    this.characteristicWarning("characteristic value expected valid finite number and received \"" + value + "\" (" + typeof value + ")");
                    value = typeof this.value === 'number' ? this.value : this.props.minValue || 0;
                }
                var numericMin = maxWithUndefined(this.props.minValue, request_util_1.numericLowerBound(this.props.format));
                var numericMax = minWithUndefined(this.props.maxValue, request_util_1.numericUpperBound(this.props.format));
                var stepValue = undefined;
                if (this.props.format === "float" /* FLOAT */) {
                    stepValue = this.props.minStep;
                }
                else {
                    stepValue = maxWithUndefined(this.props.minStep, 1);
                }
                if (numericMin != null && value < numericMin) {
                    this.characteristicWarning("characteristic was supplied illegal value: number " + value + " exceeded minimum of " + numericMin);
                    value = numericMin;
                }
                if (numericMax != null && value > numericMax) {
                    this.characteristicWarning("characteristic was supplied illegal value: number " + value + " exceeded maximum of " + numericMax);
                    value = numericMax;
                }
                if (this.props.validValues && !this.props.validValues.includes(value)) {
                    this.characteristicWarning("characteristic value " + value + " is not contained in valid values array");
                    return this.props.validValues.includes(this.value) ? this.value : (this.props.validValues[0] || 0);
                }
                if (this.props.validValueRanges && this.props.validValueRanges.length === 2) {
                    if (value < this.props.validValueRanges[0]) {
                        this.characteristicWarning("characteristic was supplied illegal value: number " + value + " not contained in valid value range of " + this.props.validValueRanges + ", supplying illegal values will throw errors in the future");
                        value = this.props.validValueRanges[0];
                    }
                    else if (value > this.props.validValueRanges[1]) {
                        this.characteristicWarning("characteristic was supplied illegal value: number " + value + " not contained in valid value range of " + this.props.validValueRanges + ", supplying illegal values will throw errors in the future");
                        value = this.props.validValueRanges[1];
                    }
                }
                if (stepValue != undefined) {
                    if (stepValue === 1) {
                        value = Math.round(value);
                    }
                    else if (stepValue > 1) {
                        value = Math.round(value);
                        value = value - (value % stepValue);
                    } // for stepValue < 1 rounding is done only when formatting the response. We can't store the "perfect" .step anyways
                }
                return value;
            }
            case "string" /* STRING */: {
                if (typeof value === "number") {
                    this.characteristicWarning("characteristic was supplied illegal value: number instead of string, supplying illegal values will throw errors in the future");
                    value = String(value);
                }
                if (typeof value !== "string") {
                    this.characteristicWarning("characteristic value expected string and received " + (typeof value));
                    value = typeof this.value === 'string' ? this.value : value + '';
                }
                if (value.length <= 1 && (this.UUID === Characteristic.Model.UUID || this.UUID === Characteristic.SerialNumber.UUID)) { // mirrors the case value = null at the beginning
                    this.characteristicWarning("[" + this.displayName + "] characteristic must have a length of more than 1 character otherwise HomeKit will reject this accessory, ignoring new value");
                    return this.value; // just return the current value
                }
                var maxLength = (_a = this.props.maxLen) !== null && _a !== void 0 ? _a : 64; // default is 64 (max is 256 which is set in setProps)
                if (value.length > maxLength) {
                    this.characteristicWarning("characteristic was supplied illegal value: string '" + value + "' exceeded max length of " + maxLength);
                    value = value.substring(0, maxLength);
                }
                return value;
            }
            case "data" /* DATA */:
                if (typeof value !== "string") {
                    throw new Error("characteristic with DATA format must have string value");
                }
                if (this.props.maxDataLen != null && value.length > this.props.maxDataLen) {
                    // can't cut it as we would basically set binary rubbish afterwards
                    throw new Error("characteristic with DATA format exceeds specified maxDataLen");
                }
                return value;
            case "tlv8" /* TLV8 */:
                if (value === undefined) {
                    this.characteristicWarning("characteristic was supplied illegal value: undefined");
                    return this.value;
                }
                return value; // we trust that this is valid tlv8
        }
        // hopefully it shouldn't get to this point
        if (value === undefined) {
            this.characteristicWarning("characteristic was supplied illegal value: undefined", "error-message" /* ERROR_MESSAGE */);
            return this.value;
        }
        return value;
    };
    /**
     * @private used to assign iid to characteristic
     */
    Characteristic.prototype._assignID = function (identifierCache, accessoryName, serviceUUID, serviceSubtype) {
        // generate our IID based on our UUID
        this.iid = identifierCache.getIID(accessoryName, serviceUUID, serviceSubtype, this.UUID);
    };
    Characteristic.prototype.characteristicWarning = function (message, type, stack) {
        if (type === void 0) { type = "warn-message" /* WARN_MESSAGE */; }
        if (stack === void 0) { stack = new Error().stack; }
        this.emit("characteristic-warning" /* CHARACTERISTIC_WARNING */, type, message, stack);
    };
    /**
     * @param event
     * @private
     */
    Characteristic.prototype.removeAllListeners = function (event) {
        if (!event) {
            this.removeOnGet();
            this.removeOnSet();
        }
        return _super.prototype.removeAllListeners.call(this, event);
    };
    /**
     * @param characteristic
     * @private
     */
    Characteristic.prototype.replaceBy = function (characteristic) {
        var _this = this;
        this.props = characteristic.props;
        this.updateValue(characteristic.value);
        var getListeners = characteristic.listeners("get" /* GET */);
        if (getListeners.length) {
            // the callback can only be called once so we remove all old listeners
            this.removeAllListeners("get" /* GET */);
            // @ts-expect-error
            getListeners.forEach(function (listener) { return _this.addListener("get" /* GET */, listener); });
        }
        this.removeOnGet();
        if (characteristic.getHandler) {
            this.onGet(characteristic.getHandler);
        }
        var setListeners = characteristic.listeners("set" /* SET */);
        if (setListeners.length) {
            // the callback can only be called once so we remove all old listeners
            this.removeAllListeners("set" /* SET */);
            // @ts-expect-error
            setListeners.forEach(function (listener) { return _this.addListener("set" /* SET */, listener); });
        }
        this.removeOnSet();
        if (characteristic.setHandler) {
            this.onSet(characteristic.setHandler);
        }
    };
    /**
     * Returns a JSON representation of this characteristic suitable for delivering to HAP clients.
     * @private used to generate response to /accessories query
     */
    Characteristic.prototype.toHAP = function (connection, contactGetHandlers) {
        if (contactGetHandlers === void 0) { contactGetHandlers = true; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var object, value, _a;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        object = this.internalHAPRepresentation();
                        if (!!this.props.perms.includes("pr" /* PAIRED_READ */)) return [3 /*break*/, 1];
                        object.value = undefined;
                        return [3 /*break*/, 6];
                    case 1:
                        if (!(this.UUID === Characteristic.ProgrammableSwitchEvent.UUID)) return [3 /*break*/, 2];
                        // special workaround for event only programmable switch event, which must always return null
                        object.value = null;
                        return [3 /*break*/, 6];
                    case 2:
                        if (!contactGetHandlers) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.handleGetRequest(connection).catch(function () {
                                debug('[%s] Error getting value for characteristic on /accessories request. Returning cached value instead: %s', _this.displayName, "" + _this.value);
                                return _this.value; // use cached value
                            })];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _a = this.value;
                        _b.label = 5;
                    case 5:
                        value = _a;
                        object.value = request_util_1.formatOutgoingCharacteristicValue(value, this.props);
                        _b.label = 6;
                    case 6: return [2 /*return*/, object];
                }
            });
        });
    };
    /**
     * Returns a JSON representation of this characteristic without the value.
     * @private used to generate the config hash
     */
    Characteristic.prototype.internalHAPRepresentation = function () {
        assert_1.default(this.iid, "iid cannot be undefined for characteristic '" + this.displayName + "'");
        // TODO include the value for characteristics of the AccessoryInformation service
        return {
            type: uuid_1.toShortForm(this.UUID),
            iid: this.iid,
            value: null,
            perms: this.props.perms,
            description: this.props.description || this.displayName,
            format: this.props.format,
            unit: this.props.unit,
            minValue: this.props.minValue,
            maxValue: this.props.maxValue,
            minStep: this.props.minStep,
            maxLen: this.props.maxLen,
            maxDataLen: this.props.maxDataLen,
            "valid-values": this.props.validValues,
            "valid-values-range": this.props.validValueRanges,
        };
    };
    /**
     * Serialize characteristic into json string.
     *
     * @param characteristic - Characteristic object.
     * @private used to store characteristic on disk
     */
    Characteristic.serialize = function (characteristic) {
        var constructorName;
        if (characteristic.constructor.name !== "Characteristic") {
            constructorName = characteristic.constructor.name;
        }
        return {
            displayName: characteristic.displayName,
            UUID: characteristic.UUID,
            eventOnlyCharacteristic: characteristic.UUID === Characteristic.ProgrammableSwitchEvent.UUID,
            constructorName: constructorName,
            value: characteristic.value,
            props: clone_1.clone({}, characteristic.props),
        };
    };
    /**
     * Deserialize characteristic from json string.
     *
     * @param json - Json string representing a characteristic.
     * @private used to recreate characteristic from disk
     */
    Characteristic.deserialize = function (json) {
        var characteristic;
        if (json.constructorName && json.constructorName.charAt(0).toUpperCase() === json.constructorName.charAt(0)
            && Characteristic[json.constructorName]) { // MUST start with uppercase character and must exist on Characteristic object
            var constructor = Characteristic[json.constructorName];
            characteristic = new constructor();
            characteristic.displayName = json.displayName;
            characteristic.setProps(json.props);
        }
        else {
            characteristic = new Characteristic(json.displayName, json.UUID, json.props);
        }
        characteristic.value = json.value;
        return characteristic;
    };
    /**
     * @deprecated Please use the Formats const enum above. Scheduled to be removed in 2021-06.
     */
    // @ts-expect-error
    Characteristic.Formats = Formats;
    /**
     * @deprecated Please use the Units const enum above. Scheduled to be removed in 2021-06.
     */
    // @ts-expect-error
    Characteristic.Units = Units;
    /**
     * @deprecated Please use the Perms const enum above. Scheduled to be removed in 2021-06.
     */
    // @ts-expect-error
    Characteristic.Perms = Perms;
    return Characteristic;
}(events_1.EventEmitter));
exports.Characteristic = Characteristic;
var numberPattern = /^-?\d+$/;
function extractHAPStatusFromError(error) {
    var errorValue = -70402 /* SERVICE_COMMUNICATION_FAILURE */;
    if (numberPattern.test(error.message)) {
        var value = parseInt(error.message, 10);
        if (HAPServer_1.IsKnownHAPStatusError(value)) {
            errorValue = value;
        }
    }
    return errorValue;
}
function maxWithUndefined(a, b) {
    if (a === undefined) {
        return b;
    }
    else if (b === undefined) {
        return a;
    }
    else {
        return Math.max(a, b);
    }
}
function minWithUndefined(a, b) {
    if (a === undefined) {
        return b;
    }
    else if (b === undefined) {
        return a;
    }
    else {
        return Math.min(a, b);
    }
}
//# sourceMappingURL=Characteristic.js.map