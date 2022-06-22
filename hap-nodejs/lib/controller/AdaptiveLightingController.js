"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptiveLightingController = exports.AdaptiveLightingControllerEvents = exports.AdaptiveLightingControllerMode = void 0;
var tslib_1 = require("tslib");
var assert_1 = (0, tslib_1.__importDefault)(require("assert"));
var uuid = (0, tslib_1.__importStar)(require("../util/uuid"));
var debug_1 = (0, tslib_1.__importDefault)(require("debug"));
var events_1 = require("events");
var __1 = require("../..");
var Characteristic_1 = require("../Characteristic");
var tlv = (0, tslib_1.__importStar)(require("../util/tlv"));
var debug = (0, debug_1.default)("HAP-NodeJS:Controller:TransitionControl");
var SupportedCharacteristicValueTransitionConfigurationsTypes;
(function (SupportedCharacteristicValueTransitionConfigurationsTypes) {
    SupportedCharacteristicValueTransitionConfigurationsTypes[SupportedCharacteristicValueTransitionConfigurationsTypes["SUPPORTED_TRANSITION_CONFIGURATION"] = 1] = "SUPPORTED_TRANSITION_CONFIGURATION";
})(SupportedCharacteristicValueTransitionConfigurationsTypes || (SupportedCharacteristicValueTransitionConfigurationsTypes = {}));
var SupportedValueTransitionConfigurationTypes;
(function (SupportedValueTransitionConfigurationTypes) {
    SupportedValueTransitionConfigurationTypes[SupportedValueTransitionConfigurationTypes["CHARACTERISTIC_IID"] = 1] = "CHARACTERISTIC_IID";
    SupportedValueTransitionConfigurationTypes[SupportedValueTransitionConfigurationTypes["TRANSITION_TYPE"] = 2] = "TRANSITION_TYPE";
})(SupportedValueTransitionConfigurationTypes || (SupportedValueTransitionConfigurationTypes = {}));
var TransitionType;
(function (TransitionType) {
    TransitionType[TransitionType["BRIGHTNESS"] = 1] = "BRIGHTNESS";
    TransitionType[TransitionType["COLOR_TEMPERATURE"] = 2] = "COLOR_TEMPERATURE";
})(TransitionType || (TransitionType = {}));
var TransitionControlTypes;
(function (TransitionControlTypes) {
    TransitionControlTypes[TransitionControlTypes["READ_CURRENT_VALUE_TRANSITION_CONFIGURATION"] = 1] = "READ_CURRENT_VALUE_TRANSITION_CONFIGURATION";
    TransitionControlTypes[TransitionControlTypes["UPDATE_VALUE_TRANSITION_CONFIGURATION"] = 2] = "UPDATE_VALUE_TRANSITION_CONFIGURATION";
})(TransitionControlTypes || (TransitionControlTypes = {}));
var ReadValueTransitionConfiguration;
(function (ReadValueTransitionConfiguration) {
    ReadValueTransitionConfiguration[ReadValueTransitionConfiguration["CHARACTERISTIC_IID"] = 1] = "CHARACTERISTIC_IID";
})(ReadValueTransitionConfiguration || (ReadValueTransitionConfiguration = {}));
var UpdateValueTransitionConfigurationsTypes;
(function (UpdateValueTransitionConfigurationsTypes) {
    UpdateValueTransitionConfigurationsTypes[UpdateValueTransitionConfigurationsTypes["VALUE_TRANSITION_CONFIGURATION"] = 1] = "VALUE_TRANSITION_CONFIGURATION";
})(UpdateValueTransitionConfigurationsTypes || (UpdateValueTransitionConfigurationsTypes = {}));
var ValueTransitionConfigurationTypes;
(function (ValueTransitionConfigurationTypes) {
    // noinspection JSUnusedGlobalSymbols
    ValueTransitionConfigurationTypes[ValueTransitionConfigurationTypes["CHARACTERISTIC_IID"] = 1] = "CHARACTERISTIC_IID";
    ValueTransitionConfigurationTypes[ValueTransitionConfigurationTypes["TRANSITION_PARAMETERS"] = 2] = "TRANSITION_PARAMETERS";
    ValueTransitionConfigurationTypes[ValueTransitionConfigurationTypes["UNKNOWN_3"] = 3] = "UNKNOWN_3";
    ValueTransitionConfigurationTypes[ValueTransitionConfigurationTypes["UNKNOWN_4"] = 4] = "UNKNOWN_4";
    ValueTransitionConfigurationTypes[ValueTransitionConfigurationTypes["TRANSITION_CURVE_CONFIGURATION"] = 5] = "TRANSITION_CURVE_CONFIGURATION";
    ValueTransitionConfigurationTypes[ValueTransitionConfigurationTypes["UPDATE_INTERVAL"] = 6] = "UPDATE_INTERVAL";
    ValueTransitionConfigurationTypes[ValueTransitionConfigurationTypes["UNKNOWN_7"] = 7] = "UNKNOWN_7";
    ValueTransitionConfigurationTypes[ValueTransitionConfigurationTypes["NOTIFY_INTERVAL_THRESHOLD"] = 8] = "NOTIFY_INTERVAL_THRESHOLD";
})(ValueTransitionConfigurationTypes || (ValueTransitionConfigurationTypes = {}));
var ValueTransitionParametersTypes;
(function (ValueTransitionParametersTypes) {
    ValueTransitionParametersTypes[ValueTransitionParametersTypes["TRANSITION_ID"] = 1] = "TRANSITION_ID";
    ValueTransitionParametersTypes[ValueTransitionParametersTypes["START_TIME"] = 2] = "START_TIME";
    ValueTransitionParametersTypes[ValueTransitionParametersTypes["UNKNOWN_3"] = 3] = "UNKNOWN_3";
})(ValueTransitionParametersTypes || (ValueTransitionParametersTypes = {}));
var TransitionCurveConfigurationTypes;
(function (TransitionCurveConfigurationTypes) {
    TransitionCurveConfigurationTypes[TransitionCurveConfigurationTypes["TRANSITION_ENTRY"] = 1] = "TRANSITION_ENTRY";
    TransitionCurveConfigurationTypes[TransitionCurveConfigurationTypes["ADJUSTMENT_CHARACTERISTIC_IID"] = 2] = "ADJUSTMENT_CHARACTERISTIC_IID";
    TransitionCurveConfigurationTypes[TransitionCurveConfigurationTypes["ADJUSTMENT_MULTIPLIER_RANGE"] = 3] = "ADJUSTMENT_MULTIPLIER_RANGE";
})(TransitionCurveConfigurationTypes || (TransitionCurveConfigurationTypes = {}));
var TransitionEntryTypes;
(function (TransitionEntryTypes) {
    TransitionEntryTypes[TransitionEntryTypes["ADJUSTMENT_FACTOR"] = 1] = "ADJUSTMENT_FACTOR";
    TransitionEntryTypes[TransitionEntryTypes["VALUE"] = 2] = "VALUE";
    TransitionEntryTypes[TransitionEntryTypes["TRANSITION_OFFSET"] = 3] = "TRANSITION_OFFSET";
    TransitionEntryTypes[TransitionEntryTypes["DURATION"] = 4] = "DURATION";
})(TransitionEntryTypes || (TransitionEntryTypes = {}));
var TransitionAdjustmentMultiplierRange;
(function (TransitionAdjustmentMultiplierRange) {
    TransitionAdjustmentMultiplierRange[TransitionAdjustmentMultiplierRange["MINIMUM_ADJUSTMENT_MULTIPLIER"] = 1] = "MINIMUM_ADJUSTMENT_MULTIPLIER";
    TransitionAdjustmentMultiplierRange[TransitionAdjustmentMultiplierRange["MAXIMUM_ADJUSTMENT_MULTIPLIER"] = 2] = "MAXIMUM_ADJUSTMENT_MULTIPLIER";
})(TransitionAdjustmentMultiplierRange || (TransitionAdjustmentMultiplierRange = {}));
var ValueTransitionConfigurationResponseTypes;
(function (ValueTransitionConfigurationResponseTypes) {
    ValueTransitionConfigurationResponseTypes[ValueTransitionConfigurationResponseTypes["VALUE_CONFIGURATION_STATUS"] = 1] = "VALUE_CONFIGURATION_STATUS";
})(ValueTransitionConfigurationResponseTypes || (ValueTransitionConfigurationResponseTypes = {}));
var ValueTransitionConfigurationStatusTypes;
(function (ValueTransitionConfigurationStatusTypes) {
    ValueTransitionConfigurationStatusTypes[ValueTransitionConfigurationStatusTypes["CHARACTERISTIC_IID"] = 1] = "CHARACTERISTIC_IID";
    ValueTransitionConfigurationStatusTypes[ValueTransitionConfigurationStatusTypes["TRANSITION_PARAMETERS"] = 2] = "TRANSITION_PARAMETERS";
    ValueTransitionConfigurationStatusTypes[ValueTransitionConfigurationStatusTypes["TIME_SINCE_START"] = 3] = "TIME_SINCE_START";
})(ValueTransitionConfigurationStatusTypes || (ValueTransitionConfigurationStatusTypes = {}));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isAdaptiveLightingContext(context) {
    return context && "controller" in context;
}
/**
 * Defines in which mode the {@link AdaptiveLightingController} will operate in.
 */
var AdaptiveLightingControllerMode;
(function (AdaptiveLightingControllerMode) {
    /**
     * In automatic mode pretty much everything from setup to transition scheduling is done by the controller.
     */
    AdaptiveLightingControllerMode[AdaptiveLightingControllerMode["AUTOMATIC"] = 1] = "AUTOMATIC";
    /**
     * In manual mode setup is done by the controller but the actual transition must be done by the user.
     * This is useful for lights which natively support transitions.
     */
    AdaptiveLightingControllerMode[AdaptiveLightingControllerMode["MANUAL"] = 2] = "MANUAL";
})(AdaptiveLightingControllerMode = exports.AdaptiveLightingControllerMode || (exports.AdaptiveLightingControllerMode = {}));
var AdaptiveLightingControllerEvents;
(function (AdaptiveLightingControllerEvents) {
    /**
     * This event is called once a HomeKit controller enables Adaptive Lighting
     * or a HomeHub sends a updated transition schedule for the next 24 hours.
     * This is also called on startup when AdaptiveLighting was previously enabled.
     */
    AdaptiveLightingControllerEvents["UPDATE"] = "update";
    /**
     * In yet unknown circumstances HomeKit may also send a dedicated disable command
     * via the control point characteristic. You may want to handle that in manual mode as well.
     * The current transition will still be associated with the controller object when this event is called.
     */
    AdaptiveLightingControllerEvents["DISABLED"] = "disable";
})(AdaptiveLightingControllerEvents = exports.AdaptiveLightingControllerEvents || (exports.AdaptiveLightingControllerEvents = {}));
/**
 * This class allows adding Adaptive Lighting support to Lightbulb services.
 * The Lightbulb service MUST have the {@link Characteristic.ColorTemperature} characteristic AND
 * the {@link Characteristic.Brightness} characteristic added.
 * The light may also expose {@link Characteristic.Hue} and {@link Characteristic.Saturation} characteristics
 * (though additional work is required to keep them in sync with the color temperature characteristic. see below)
 *
 * How Adaptive Lighting works:
 *  When enabling AdaptiveLighting the iDevice will send a transition schedule for the next 24 hours.
 *  This schedule will be renewed all 24 hours by a HomeHub in your home
 *  (updating the schedule according to your current day/night situation).
 *  Once enabled the lightbulb will execute the provided transitions. The color temperature value set is always
 *  dependent on the current brightness value. Meaning brighter light will be colder and darker light will be warmer.
 *  HomeKit considers Adaptive Lighting to be disabled as soon a write happens to either the
 *  Hue/Saturation or the ColorTemperature characteristics.
 *  The AdaptiveLighting state must persist across reboots.
 *
 * The AdaptiveLightingController can be operated in two modes: {@link AdaptiveLightingControllerMode.AUTOMATIC} and
 * {@link AdaptiveLightingControllerMode.MANUAL} with AUTOMATIC being the default.
 * The goal would be that the color transition is done DIRECTLY on the light itself, thus not creating any
 * additional/heavy traffic on the network.
 * So if your light hardware/API supports transitions please go the extra mile and use MANUAL mode.
 *
 *
 *
 * Below is an overview what you need to or consider when enabling AdaptiveLighting (categorized by mode).
 * The {@link AdaptiveLightingControllerMode} can be defined with the second constructor argument.
 *
 * <b>AUTOMATIC (Default mode):</b>
 *
 *  This is the easiest mode to setup and needs less to no work form your side for AdaptiveLighting to work.
 *  The AdaptiveLightingController will go through setup procedure with HomeKit and automatically update
 *  the color temperature characteristic base on the current transition schedule.
 *  It is also adjusting the color temperature when a write to the brightness characteristic happens.
 *  Additionally, it will also handle turning off AdaptiveLighting, when it detects a write happening to the
 *  ColorTemperature, Hue or Saturation characteristic (though it can only detect writes coming from HomeKit and
 *  can't detect changes done to the physical devices directly! See below).
 *
 *  So what do you need to consider in automatic mode:
 *   - Brightness and ColorTemperature characteristics MUST be set up. Hue and Saturation may be added for color support.
 *   - Color temperature will be updated all 60 seconds by calling the SET handler of the ColorTemperature characteristic.
 *    So every transition behaves like a regular write to the ColorTemperature characteristic.
 *   - Every transition step is dependent on the current brightness value. Try to keep the internal cache updated
 *    as the controller won't call the GET handler every 60 seconds.
 *    (The cached brightness value is updated on SET/GET operations or by manually calling {@link Characteristic.updateValue}
 *    on the brightness characteristic).
 *   - Detecting changes on the lightbulb side:
 *    Any manual change to ColorTemperature or Hue/Saturation is considered as a signal to turn AdaptiveLighting off.
 *    In order to notify the AdaptiveLightingController of such an event happening OUTSIDE of HomeKit
 *    you must call {@link disableAdaptiveLighting} manually!
 *   - Be aware that even when the light is turned off the transition will continue to call the SET handler
 *    of the ColorTemperature characteristic.
 *   - When using Hue/Saturation:
 *    When using Hue/Saturation in combination with the ColorTemperature characteristic you need to update the
 *    respective other in a particular way depending on if being in "color mode" or "color temperature mode".
 *    When a write happens to Hue/Saturation characteristic in is advised to set the internal value of the
 *    ColorTemperature to the minimal (NOT RAISING an event).
 *    When a write happens to the ColorTemperature characteristic just MUST convert to a proper representation
 *    in hue and saturation values, with RAISING an event.
 *    As noted above you MUST NOT call the {@link Characteristic.setValue} method for this, as this will be considered
 *    a write to the characteristic and will turn off AdaptiveLighting. Instead, you should use
 *    {@link Characteristic.updateValue} for this.
 *    You can and SHOULD use the supplied utility method {@link ColorUtils.colorTemperatureToHueAndSaturation}
 *    for converting mired to hue and saturation values.
 *
 *
 * <b>MANUAL mode:</b>
 *
 *  Manual mode is recommended for any accessories which support transitions natively on the devices end.
 *  Like for example ZigBee lights which support sending transitions directly to the lightbulb which
 *  then get executed ON the lightbulb itself reducing unnecessary network traffic.
 *  Here is a quick overview what you have to consider to successfully implement AdaptiveLighting support.
 *  The AdaptiveLightingController will also in manual mode do all the setup procedure.
 *  It will also save the transition schedule to disk to keep AdaptiveLighting enabled across reboots.
 *  The "only" thing you have to do yourself is handling the actual transitions, check that event notifications
 *  are only sent in the defined interval threshold, adjust the color temperature when brightness is changed
 *  and signal that Adaptive Lighting should be disabled if ColorTemperature, Hue or Saturation is changed manually.
 *
 *  First step is to setup up an event handler for the {@link AdaptiveLightingControllerEvents.UPDATE}, which is called
 *  when AdaptiveLighting is enabled, the HomeHub updates the schedule for the next 24 hours or AdaptiveLighting
 *  is restored from disk on startup.
 *  In the event handler you can get the current schedule via {@link AdaptiveLightingController.getAdaptiveLightingTransitionCurve},
 *  retrieve current intervals like {@link AdaptiveLightingController.getAdaptiveLightingUpdateInterval} or
 *  {@link AdaptiveLightingController.getAdaptiveLightingNotifyIntervalThreshold} and get the date in epoch millis
 *  when the current transition curve started using {@link AdaptiveLightingController.getAdaptiveLightingStartTimeOfTransition}.
 *  Additionally {@link AdaptiveLightingController.getAdaptiveLightingBrightnessMultiplierRange} can be used
 *  to get the valid range for the brightness value to calculate the brightness adjustment factor.
 *  The method {@link AdaptiveLightingController.isAdaptiveLightingActive} can be used to check if AdaptiveLighting is enabled.
 *  Besides, actually running the transition (see {@link AdaptiveLightingTransitionCurveEntry}) you must correctly update
 *  the color temperature when the brightness of the lightbulb changes (see {@link AdaptiveLightingTransitionCurveEntry.brightnessAdjustmentFactor}),
 *  and signal when AdaptiveLighting got disabled by calling {@link AdaptiveLightingController.disableAdaptiveLighting}
 *  when ColorTemperature, Hue or Saturation where changed manually.
 *  Lastly you should set up a event handler for the {@link AdaptiveLightingControllerEvents.DISABLED} event.
 *  In yet unknown circumstances HomeKit may also send a dedicated disable command via the control point characteristic.
 *  Be prepared to handle that.
 */
var AdaptiveLightingController = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(AdaptiveLightingController, _super);
    /**
     * Creates a new instance of the AdaptiveLightingController.
     * Refer to the {@link AdaptiveLightingController} documentation on how to use it.
     *
     * @param service - The lightbulb to which Adaptive Lighting support should be added.
     * @param options - Optional options to define the operating mode (automatic vs manual).
     */
    function AdaptiveLightingController(service, options) {
        var _a, _b;
        var _this = _super.call(this) || this;
        _this.didRunFirstInitializationStep = false;
        _this.lastEventNotificationSent = 0;
        _this.lastNotifiedTemperatureValue = 0;
        _this.lastNotifiedSaturationValue = 0;
        _this.lastNotifiedHueValue = 0;
        _this.lightbulb = service;
        _this.mode = (_a = options === null || options === void 0 ? void 0 : options.controllerMode) !== null && _a !== void 0 ? _a : 1 /* AUTOMATIC */;
        _this.customTemperatureAdjustment = (_b = options === null || options === void 0 ? void 0 : options.customTemperatureAdjustment) !== null && _b !== void 0 ? _b : 0;
        (0, assert_1.default)(_this.lightbulb.testCharacteristic(Characteristic_1.Characteristic.ColorTemperature), "Lightbulb must have the ColorTemperature characteristic added!");
        (0, assert_1.default)(_this.lightbulb.testCharacteristic(Characteristic_1.Characteristic.Brightness), "Lightbulb must have the Brightness characteristic added!");
        _this.adjustmentFactorChangedListener = _this.handleAdjustmentFactorChanged.bind(_this);
        _this.characteristicManualWrittenChangeListener = _this.handleCharacteristicManualWritten.bind(_this);
        return _this;
    }
    /**
     * @private
     */
    AdaptiveLightingController.prototype.controllerId = function () {
        return "characteristic-transition" /* CHARACTERISTIC_TRANSITION */ + "-" + this.lightbulb.getServiceId();
    };
    // ----------- PUBLIC API START -----------
    /**
     * Returns if a Adaptive Lighting transition is currently active.
     */
    AdaptiveLightingController.prototype.isAdaptiveLightingActive = function () {
        return !!this.activeTransition;
    };
    /**
     * This method can be called to manually disable the current active Adaptive Lighting transition.
     * When using {@link AdaptiveLightingControllerMode.AUTOMATIC} you won't need to call this method.
     * In {@link AdaptiveLightingControllerMode.MANUAL} you must call this method when Adaptive Lighting should be disabled.
     * This is the case when the user manually changes the value of Hue, Saturation or ColorTemperature characteristics
     * (or if any of those values is changed by physical interaction with the lightbulb).
     */
    AdaptiveLightingController.prototype.disableAdaptiveLighting = function () {
        var _a;
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = undefined;
        }
        if (this.activeTransition) {
            this.colorTemperatureCharacteristic.removeListener("change" /* CHANGE */, this.characteristicManualWrittenChangeListener);
            this.brightnessCharacteristic.removeListener("change" /* CHANGE */, this.adjustmentFactorChangedListener);
            if (this.hueCharacteristic) {
                this.hueCharacteristic.removeListener("change" /* CHANGE */, this.characteristicManualWrittenChangeListener);
            }
            if (this.saturationCharacteristic) {
                this.saturationCharacteristic.removeListener("change" /* CHANGE */, this.characteristicManualWrittenChangeListener);
            }
            this.activeTransition = undefined;
            (_a = this.stateChangeDelegate) === null || _a === void 0 ? void 0 : _a.call(this);
        }
        this.colorTemperatureCharacteristic = undefined;
        this.brightnessCharacteristic = undefined;
        this.hueCharacteristic = undefined;
        this.saturationCharacteristic = undefined;
        this.lastTransitionPointInfo = undefined;
        this.lastEventNotificationSent = 0;
        this.lastNotifiedTemperatureValue = 0;
        this.lastNotifiedSaturationValue = 0;
        this.lastNotifiedHueValue = 0;
        this.didRunFirstInitializationStep = false;
        this.activeTransitionCount.sendEventNotification(0);
        debug("[%s] Disabling adaptive lighting", this.lightbulb.displayName);
    };
    /**
     * Returns the time where the current transition curve was started in epoch time millis.
     * A transition curves is active for 24 hours typically and is renewed every 24 hours by a HomeHub.
     * Additionally see {@link getAdaptiveLightingTimeOffset}.
     */
    AdaptiveLightingController.prototype.getAdaptiveLightingStartTimeOfTransition = function () {
        if (!this.activeTransition) {
            throw new Error("There is no active transition!");
        }
        return this.activeTransition.transitionStartMillis;
    };
    /**
     * It is not necessarily given, that we have the same time (or rather the correct time) as the HomeKit controller
     * who set up the transition schedule.
     * Thus we record the delta between our current time and the the time send with the setup request.
     * <code>timeOffset</code> is defined as <code>Date.now() - getAdaptiveLightingStartTimeOfTransition();</code>.
     * So in the case were we actually have a correct local time, it most likely will be positive (due to network latency).
     * But of course it can also be negative.
     */
    AdaptiveLightingController.prototype.getAdaptiveLightingTimeOffset = function () {
        if (!this.activeTransition) {
            throw new Error("There is no active transition!");
        }
        return this.activeTransition.timeMillisOffset;
    };
    AdaptiveLightingController.prototype.getAdaptiveLightingTransitionCurve = function () {
        if (!this.activeTransition) {
            throw new Error("There is no active transition!");
        }
        return this.activeTransition.transitionCurve;
    };
    AdaptiveLightingController.prototype.getAdaptiveLightingBrightnessMultiplierRange = function () {
        if (!this.activeTransition) {
            throw new Error("There is no active transition!");
        }
        return this.activeTransition.brightnessAdjustmentRange;
    };
    /**
     * This method returns the interval (in milliseconds) in which the light should update its internal color temperature
     * (aka changes it physical color).
     * A lightbulb should ideally change this also when turned of in oder to have a smooth transition when turning the light on.
     *
     * Typically this evaluates to 60000 milliseconds (60 seconds).
     */
    AdaptiveLightingController.prototype.getAdaptiveLightingUpdateInterval = function () {
        if (!this.activeTransition) {
            throw new Error("There is no active transition!");
        }
        return this.activeTransition.updateInterval;
    };
    /**
     * Returns the minimum interval threshold (in milliseconds) a accessory may notify HomeKit controllers about a new
     * color temperature value via event notifications (what happens when you call {@link Characteristic.updateValue}).
     * Meaning the accessory should only send event notifications to subscribed HomeKit controllers at the specified interval.
     *
     * Typically this evaluates to 600000 milliseconds (10 minutes).
     */
    AdaptiveLightingController.prototype.getAdaptiveLightingNotifyIntervalThreshold = function () {
        if (!this.activeTransition) {
            throw new Error("There is no active transition!");
        }
        return this.activeTransition.notifyIntervalThreshold;
    };
    // ----------- PUBLIC API END -----------
    AdaptiveLightingController.prototype.handleActiveTransitionUpdated = function (calledFromDeserializer) {
        var _a;
        if (calledFromDeserializer === void 0) { calledFromDeserializer = false; }
        if (!calledFromDeserializer) {
            this.activeTransitionCount.sendEventNotification(1);
        }
        else {
            this.activeTransitionCount.value = 1;
        }
        if (this.mode === 1 /* AUTOMATIC */) {
            this.scheduleNextUpdate();
        }
        else if (this.mode === 2 /* MANUAL */) {
            this.emit("update" /* UPDATE */);
        }
        else {
            throw new Error("Unsupported adaptive lighting controller mode: " + this.mode);
        }
        if (!calledFromDeserializer) {
            (_a = this.stateChangeDelegate) === null || _a === void 0 ? void 0 : _a.call(this);
        }
    };
    AdaptiveLightingController.prototype.handleAdaptiveLightingEnabled = function () {
        if (!this.activeTransition) {
            throw new Error("There is no active transition!");
        }
        this.colorTemperatureCharacteristic = this.lightbulb.getCharacteristic(Characteristic_1.Characteristic.ColorTemperature);
        this.brightnessCharacteristic = this.lightbulb.getCharacteristic(Characteristic_1.Characteristic.Brightness);
        this.colorTemperatureCharacteristic.on("change" /* CHANGE */, this.characteristicManualWrittenChangeListener);
        this.brightnessCharacteristic.on("change" /* CHANGE */, this.adjustmentFactorChangedListener);
        if (this.lightbulb.testCharacteristic(Characteristic_1.Characteristic.Hue)) {
            this.hueCharacteristic = this.lightbulb.getCharacteristic(Characteristic_1.Characteristic.Hue)
                .on("change" /* CHANGE */, this.characteristicManualWrittenChangeListener);
        }
        if (this.lightbulb.testCharacteristic(Characteristic_1.Characteristic.Saturation)) {
            this.saturationCharacteristic = this.lightbulb.getCharacteristic(Characteristic_1.Characteristic.Saturation)
                .on("change" /* CHANGE */, this.characteristicManualWrittenChangeListener);
        }
    };
    AdaptiveLightingController.prototype.handleAdaptiveLightingDisabled = function () {
        if (this.mode === 2 /* MANUAL */ && this.activeTransition) { // only emit the event if a transition is actually enabled
            this.emit("disable" /* DISABLED */);
        }
        this.disableAdaptiveLighting();
    };
    AdaptiveLightingController.prototype.handleAdjustmentFactorChanged = function (change) {
        var _this = this;
        if (change.newValue === change.oldValue) {
            return;
        }
        // consider the following scenario:
        // a HomeKit controller queries the light (meaning e.g. Brightness, Hue and Saturation characteristics).
        // As of the implementation of the light the brightness characteristic get handler returns first
        // (and returns a value different than the cached value).
        // This change handler gets called and we will update the color temperature accordingly
        // (which also adjusts the internal cached values for Hue and Saturation).
        // After some short time the Hue or Saturation get handler return with the last known value to the plugin.
        // As those values now differ from the cached values (we already updated) we get a call to handleCharacteristicManualWritten
        // which again disables adaptive lighting.
        if (change.reason === "read" /* READ */) {
            // if the reason is a read request, we expect that Hue/Saturation are also read
            // thus we postpone our update to ColorTemperature a bit.
            // It doesn't ensure that those race conditions do not happen anymore, but with a 1s delay it reduces the possibility by a bit
            setTimeout(function () {
                if (!_this.activeTransition) {
                    return; // was disabled in the mean time
                }
                _this.scheduleNextUpdate(true);
            }, 1000).unref();
        }
        else {
            this.scheduleNextUpdate(true); // run a dry scheduleNextUpdate to adjust the colorTemperature using the new brightness value
        }
    };
    /**
     * This method is called when a change happens to the Hue/Saturation or ColorTemperature characteristic.
     * When such a write happens (caused by the user changing the color/temperature) Adaptive Lighting must be disabled.
     *
     * @param change
     */
    AdaptiveLightingController.prototype.handleCharacteristicManualWritten = function (change) {
        if (change.reason === "write" /* WRITE */ && !(isAdaptiveLightingContext(change.context) && change.context.controller === this)) {
            // we ignore write request which are the result of calls made to updateValue or sendEventNotification
            // or the result of a changed value returned by a read handler
            // or the change was done by the controller itself
            debug("[%s] Received a manual write to an characteristic (newValue: %d, oldValue: %d, reason: %s). Thus disabling adaptive lighting!", this.lightbulb.displayName, change.newValue, change.oldValue, change.reason);
            this.disableAdaptiveLighting();
        }
    };
    /**
     * Retrieve the {@link AdaptiveLightingTransitionPoint} for the current timestamp.
     * Returns undefined if the current transition schedule reached its end.
     */
    AdaptiveLightingController.prototype.getCurrentAdaptiveLightingTransitionPoint = function () {
        var _a, _b, _c, _d, _e;
        if (!this.activeTransition) {
            throw new Error("Cannot calculate current transition point if no transition is active!");
        }
        // adjustedNow is the now() date corrected to the time of the initiating controller
        var adjustedNow = Date.now() - this.activeTransition.timeMillisOffset;
        // "offset" since the start of the transition schedule
        var offset = adjustedNow - this.activeTransition.transitionStartMillis;
        var i = (_b = (_a = this.lastTransitionPointInfo) === null || _a === void 0 ? void 0 : _a.curveIndex) !== null && _b !== void 0 ? _b : 0;
        var lowerBoundTimeOffset = (_d = (_c = this.lastTransitionPointInfo) === null || _c === void 0 ? void 0 : _c.lowerBoundTimeOffset) !== null && _d !== void 0 ? _d : 0; // time offset to the lowerBound transition entry
        var lowerBound = undefined;
        var upperBound = undefined;
        for (; i + 1 < this.activeTransition.transitionCurve.length; i++) {
            var lowerBound0 = this.activeTransition.transitionCurve[i];
            var upperBound0 = this.activeTransition.transitionCurve[i + 1];
            var lowerBoundDuration = (_e = lowerBound0.duration) !== null && _e !== void 0 ? _e : 0;
            lowerBoundTimeOffset += lowerBound0.transitionTime;
            if (offset >= lowerBoundTimeOffset) {
                if (offset <= lowerBoundTimeOffset + lowerBoundDuration + upperBound0.transitionTime) {
                    lowerBound = lowerBound0;
                    upperBound = upperBound0;
                    break;
                }
            }
            else if (this.lastTransitionPointInfo) {
                // if we reached here the entry in the transitionCurve we are searching for is somewhere before current i.
                // This can only happen when we have a faulty lastTransitionPointInfo (otherwise we would start from i=0).
                // Thus we try again by searching from i=0
                this.lastTransitionPointInfo = undefined;
                return this.getCurrentAdaptiveLightingTransitionPoint();
            }
            lowerBoundTimeOffset += lowerBoundDuration;
        }
        if (!lowerBound || !upperBound) {
            this.lastTransitionPointInfo = undefined;
            return undefined;
        }
        this.lastTransitionPointInfo = {
            curveIndex: i,
            // we need to subtract lowerBound.transitionTime. When we start the loop above
            // with a saved transition point, we will always add lowerBound.transitionTime as first step.
            // Otherwise our calculations are simply wrong.
            lowerBoundTimeOffset: lowerBoundTimeOffset - lowerBound.transitionTime,
        };
        return {
            lowerBoundTimeOffset: lowerBoundTimeOffset,
            transitionOffset: offset - lowerBoundTimeOffset,
            lowerBound: lowerBound,
            upperBound: upperBound,
        };
    };
    AdaptiveLightingController.prototype.scheduleNextUpdate = function (dryRun) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        if (dryRun === void 0) { dryRun = false; }
        if (!this.activeTransition) {
            throw new Error("tried scheduling transition when no transition was active!");
        }
        if (!dryRun) {
            this.updateTimeout = undefined;
        }
        if (!this.didRunFirstInitializationStep) {
            this.didRunFirstInitializationStep = true;
            this.handleAdaptiveLightingEnabled();
        }
        var transitionPoint = this.getCurrentAdaptiveLightingTransitionPoint();
        if (!transitionPoint) {
            debug("[%s] Reached end of transition curve!", this.lightbulb.displayName);
            if (!dryRun) {
                // the transition schedule is only for 24 hours, we reached the end?
                this.disableAdaptiveLighting();
            }
            return;
        }
        var lowerBound = transitionPoint.lowerBound;
        var upperBound = transitionPoint.upperBound;
        var interpolatedTemperature;
        var interpolatedAdjustmentFactor;
        if (lowerBound.duration && transitionPoint.transitionOffset <= lowerBound.duration) {
            interpolatedTemperature = lowerBound.temperature;
            interpolatedAdjustmentFactor = lowerBound.brightnessAdjustmentFactor;
        }
        else {
            var timePercentage = (transitionPoint.transitionOffset - ((_a = lowerBound.duration) !== null && _a !== void 0 ? _a : 0)) / upperBound.transitionTime;
            interpolatedTemperature = lowerBound.temperature + (upperBound.temperature - lowerBound.temperature) * timePercentage;
            interpolatedAdjustmentFactor = lowerBound.brightnessAdjustmentFactor
                + (upperBound.brightnessAdjustmentFactor - lowerBound.brightnessAdjustmentFactor) * timePercentage;
        }
        var adjustmentMultiplier = Math.max(this.activeTransition.brightnessAdjustmentRange.minBrightnessValue, Math.min(this.activeTransition.brightnessAdjustmentRange.maxBrightnessValue, this.brightnessCharacteristic.value));
        var temperature = Math.round(interpolatedTemperature + interpolatedAdjustmentFactor * adjustmentMultiplier);
        // apply any manually applied temperature adjustments
        temperature += this.customTemperatureAdjustment;
        var min = (_c = (_b = this.colorTemperatureCharacteristic) === null || _b === void 0 ? void 0 : _b.props.minValue) !== null && _c !== void 0 ? _c : 140;
        var max = (_e = (_d = this.colorTemperatureCharacteristic) === null || _d === void 0 ? void 0 : _d.props.maxValue) !== null && _e !== void 0 ? _e : 500;
        temperature = Math.max(min, Math.min(max, temperature));
        var color = __1.ColorUtils.colorTemperatureToHueAndSaturation(temperature);
        debug("[%s] Next temperature value is %d (for brightness %d adj: %s)", this.lightbulb.displayName, temperature, adjustmentMultiplier, this.customTemperatureAdjustment);
        var context = {
            controller: this,
            omitEventUpdate: true,
        };
        /*
         * We set saturation and hue values BEFORE we call the ColorTemperature SET handler (via setValue).
         * First thought was so the API user could get the values in the SET handler of the color temperature characteristic.
         * Do this is probably not really elegant cause this would only work when Adaptive Lighting is turned on
         * an the accessory MUST in any case update the Hue/Saturation values on a ColorTemperature write
         * (obviously only if Hue/Saturation characteristics are added to the service).
         *
         * The clever thing about this though is that, that it prevents notifications from being sent for Hue and Saturation
         * outside the specified notifyIntervalThreshold (see below where notifications are manually sent).
         * As the dev will or must call something like updateValue to propagate the updated hue and saturation values
         * to all HomeKit clients (so that the color is reflected in the UI), HAP-NodeJS won't send notifications
         * as the values are the same.
         * This of course only works if the plugin uses the exact same algorithm of "converting" the color temperature
         * value to the hue and saturation representation.
         */
        if (this.saturationCharacteristic) {
            this.saturationCharacteristic.value = color.saturation;
        }
        if (this.hueCharacteristic) {
            this.hueCharacteristic.value = color.hue;
        }
        this.colorTemperatureCharacteristic.handleSetRequest(temperature, undefined, context).catch(function (reason) {
            debug("[%s] Failed to next adaptive lighting transition point: %d", _this.lightbulb.displayName, reason);
        });
        if (!this.activeTransition) {
            console.warn("[" + this.lightbulb.displayName + "] Adaptive Lighting was probably disable my mistake by some call in " +
                "the SET handler of the ColorTemperature characteristic! " +
                "Please check that you don't call setValue/setCharacteristic on the Hue, Saturation or ColorTemperature characteristic!");
            return;
        }
        var now = Date.now();
        if (!dryRun && now - this.lastEventNotificationSent >= this.activeTransition.notifyIntervalThreshold) {
            debug("[%s] Sending event notifications for current transition!", this.lightbulb.displayName);
            this.lastEventNotificationSent = now;
            var eventContext = {
                controller: this,
            };
            if (this.lastNotifiedTemperatureValue !== temperature) {
                this.colorTemperatureCharacteristic.sendEventNotification(temperature, eventContext);
                this.lastNotifiedTemperatureValue = temperature;
            }
            if (this.saturationCharacteristic && this.lastNotifiedSaturationValue !== color.saturation) {
                this.saturationCharacteristic.sendEventNotification(color.saturation, eventContext);
                this.lastNotifiedSaturationValue = color.saturation;
            }
            if (this.hueCharacteristic && this.lastNotifiedHueValue !== color.hue) {
                this.hueCharacteristic.sendEventNotification(color.hue, eventContext);
                this.lastNotifiedHueValue = color.hue;
            }
        }
        if (!dryRun) {
            this.updateTimeout = setTimeout(this.scheduleNextUpdate.bind(this), this.activeTransition.updateInterval);
        }
    };
    /**
     * @private
     */
    AdaptiveLightingController.prototype.constructServices = function () {
        return {};
    };
    /**
     * @private
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    AdaptiveLightingController.prototype.initWithServices = function (serviceMap) {
        // do nothing
    };
    /**
     * @private
     */
    AdaptiveLightingController.prototype.configureServices = function () {
        var _this = this;
        this.supportedTransitionConfiguration = this.lightbulb.getCharacteristic(Characteristic_1.Characteristic.SupportedCharacteristicValueTransitionConfiguration);
        this.transitionControl = this.lightbulb.getCharacteristic(Characteristic_1.Characteristic.CharacteristicValueTransitionControl)
            .updateValue("");
        this.activeTransitionCount = this.lightbulb.getCharacteristic(Characteristic_1.Characteristic.CharacteristicValueActiveTransitionCount)
            .updateValue(0);
        this.supportedTransitionConfiguration
            .onGet(this.handleSupportedTransitionConfigurationRead.bind(this));
        this.transitionControl
            .onGet(function () {
            return _this.buildTransitionControlResponseBuffer().toString("base64");
        })
            .onSet(function (value) {
            try {
                return _this.handleTransitionControlWrite(value);
            }
            catch (error) {
                console.warn("[%s] DEBUG: '".concat(value, "'"));
                console.warn("[%s] Encountered error on CharacteristicValueTransitionControl characteristic: " + error.stack);
                _this.disableAdaptiveLighting();
                throw new __1.HapStatusError(-70402 /* SERVICE_COMMUNICATION_FAILURE */);
            }
        });
    };
    /**
     * @private
     */
    AdaptiveLightingController.prototype.handleControllerRemoved = function () {
        this.lightbulb.removeCharacteristic(this.supportedTransitionConfiguration);
        this.lightbulb.removeCharacteristic(this.transitionControl);
        this.lightbulb.removeCharacteristic(this.activeTransitionCount);
        this.supportedTransitionConfiguration = undefined;
        this.transitionControl = undefined;
        this.activeTransitionCount = undefined;
        this.removeAllListeners();
    };
    /**
     * @private
     */
    AdaptiveLightingController.prototype.handleFactoryReset = function () {
        this.handleAdaptiveLightingDisabled();
    };
    /**
     * @private
     */
    AdaptiveLightingController.prototype.serialize = function () {
        if (!this.activeTransition) {
            return undefined;
        }
        return {
            activeTransition: this.activeTransition,
        };
    };
    /**
     * @private
     */
    AdaptiveLightingController.prototype.deserialize = function (serialized) {
        this.activeTransition = serialized.activeTransition;
        // Data migrations from beta builds
        if (!this.activeTransition.transitionId) {
            // @ts-expect-error: data migration from beta builds
            this.activeTransition.transitionId = this.activeTransition.id1;
            // @ts-expect-error: data migration from beta builds
            delete this.activeTransition.id1;
        }
        if (!this.activeTransition.timeMillisOffset) { // compatibility to data produced by early betas
            this.activeTransition.timeMillisOffset = 0;
        }
        this.handleActiveTransitionUpdated(true);
    };
    /**
     * @private
     */
    AdaptiveLightingController.prototype.setupStateChangeDelegate = function (delegate) {
        this.stateChangeDelegate = delegate;
    };
    AdaptiveLightingController.prototype.handleSupportedTransitionConfigurationRead = function () {
        var brightnessIID = this.lightbulb.getCharacteristic(Characteristic_1.Characteristic.Brightness).iid;
        var temperatureIID = this.lightbulb.getCharacteristic(Characteristic_1.Characteristic.ColorTemperature).iid;
        (0, assert_1.default)(brightnessIID, "iid for brightness characteristic is undefined");
        (0, assert_1.default)(temperatureIID, "iid for temperature characteristic is undefined");
        return tlv.encode(1 /* SUPPORTED_TRANSITION_CONFIGURATION */, [
            tlv.encode(1 /* CHARACTERISTIC_IID */, tlv.writeVariableUIntLE(brightnessIID), 2 /* TRANSITION_TYPE */, 1 /* BRIGHTNESS */),
            tlv.encode(1 /* CHARACTERISTIC_IID */, tlv.writeVariableUIntLE(temperatureIID), 2 /* TRANSITION_TYPE */, 2 /* COLOR_TEMPERATURE */),
        ]).toString("base64");
    };
    AdaptiveLightingController.prototype.buildTransitionControlResponseBuffer = function (time) {
        if (!this.activeTransition) {
            return Buffer.alloc(0);
        }
        var active = this.activeTransition;
        var timeSinceStart = time !== null && time !== void 0 ? time : (Date.now() - active.timeMillisOffset - active.transitionStartMillis);
        var timeSinceStartBuffer = tlv.writeVariableUIntLE(timeSinceStart);
        var parameters = tlv.encode(1 /* TRANSITION_ID */, uuid.write(active.transitionId), 2 /* START_TIME */, Buffer.from(active.transitionStartBuffer, "hex"));
        if (active.id3) {
            parameters = Buffer.concat([
                parameters,
                tlv.encode(3 /* UNKNOWN_3 */, Buffer.from(active.id3, "hex")),
            ]);
        }
        var status = tlv.encode(1 /* CHARACTERISTIC_IID */, tlv.writeVariableUIntLE(active.iid), 2 /* TRANSITION_PARAMETERS */, parameters, 3 /* TIME_SINCE_START */, timeSinceStartBuffer);
        return tlv.encode(1 /* VALUE_CONFIGURATION_STATUS */, status);
    };
    AdaptiveLightingController.prototype.handleTransitionControlWrite = function (value) {
        if (typeof value !== "string") {
            throw new __1.HapStatusError(-70410 /* INVALID_VALUE_IN_REQUEST */);
        }
        var tlvData = tlv.decode(Buffer.from(value, "base64"));
        var responseBuffers = [];
        var readTransition = tlvData[1 /* READ_CURRENT_VALUE_TRANSITION_CONFIGURATION */];
        if (readTransition) {
            var readTransitionResponse = this.handleTransitionControlReadTransition(readTransition);
            if (readTransitionResponse) {
                responseBuffers.push(readTransitionResponse);
            }
        }
        var updateTransition = tlvData[2 /* UPDATE_VALUE_TRANSITION_CONFIGURATION */];
        if (updateTransition) {
            var updateTransitionResponse = this.handleTransitionControlUpdateTransition(updateTransition);
            if (updateTransitionResponse) {
                responseBuffers.push(updateTransitionResponse);
            }
        }
        return Buffer.concat(responseBuffers).toString("base64");
    };
    AdaptiveLightingController.prototype.handleTransitionControlReadTransition = function (buffer) {
        var readTransition = tlv.decode(buffer);
        var iid = tlv.readVariableUIntLE(readTransition[1 /* CHARACTERISTIC_IID */]);
        if (this.activeTransition) {
            if (this.activeTransition.iid !== iid) {
                console.warn("[" + this.lightbulb.displayName + "] iid of current adaptive lighting transition (" + this.activeTransition.iid
                    + ") doesn't match the requested one " + iid);
                throw new __1.HapStatusError(-70410 /* INVALID_VALUE_IN_REQUEST */);
            }
            var parameters = tlv.encode(1 /* TRANSITION_ID */, uuid.write(this.activeTransition.transitionId), 2 /* START_TIME */, Buffer.from(this.activeTransition.transitionStartBuffer, "hex"));
            if (this.activeTransition.id3) {
                parameters = Buffer.concat([
                    parameters,
                    tlv.encode(3 /* UNKNOWN_3 */, Buffer.from(this.activeTransition.id3, "hex")),
                ]);
            }
            return tlv.encode(1 /* READ_CURRENT_VALUE_TRANSITION_CONFIGURATION */, tlv.encode(1 /* CHARACTERISTIC_IID */, tlv.writeVariableUIntLE(this.activeTransition.iid), 2 /* TRANSITION_PARAMETERS */, parameters, 3 /* UNKNOWN_3 */, 1, 5 /* TRANSITION_CURVE_CONFIGURATION */, tlv.encode(1 /* TRANSITION_ENTRY */, this.activeTransition.transitionCurve.map(function (entry, index, array) {
                var _a, _b;
                var duration = (_b = (_a = array[index - 1]) === null || _a === void 0 ? void 0 : _a.duration) !== null && _b !== void 0 ? _b : 0; // we store stuff differently :sweat_smile:
                return tlv.encode(1 /* ADJUSTMENT_FACTOR */, tlv.writeFloat32LE(entry.brightnessAdjustmentFactor), 2 /* VALUE */, tlv.writeFloat32LE(entry.temperature), 3 /* TRANSITION_OFFSET */, tlv.writeVariableUIntLE(entry.transitionTime), 4 /* DURATION */, tlv.writeVariableUIntLE(duration));
            }), 2 /* ADJUSTMENT_CHARACTERISTIC_IID */, tlv.writeVariableUIntLE(this.activeTransition.brightnessCharacteristicIID), 3 /* ADJUSTMENT_MULTIPLIER_RANGE */, tlv.encode(1 /* MINIMUM_ADJUSTMENT_MULTIPLIER */, tlv.writeUInt32(this.activeTransition.brightnessAdjustmentRange.minBrightnessValue), 2 /* MAXIMUM_ADJUSTMENT_MULTIPLIER */, tlv.writeUInt32(this.activeTransition.brightnessAdjustmentRange.maxBrightnessValue))), 6 /* UPDATE_INTERVAL */, tlv.writeVariableUIntLE(this.activeTransition.updateInterval), 8 /* NOTIFY_INTERVAL_THRESHOLD */, tlv.writeVariableUIntLE(this.activeTransition.notifyIntervalThreshold)));
        }
        else {
            return undefined; // returns empty string
        }
    };
    AdaptiveLightingController.prototype.handleTransitionControlUpdateTransition = function (buffer) {
        var e_1, _a;
        var _b, _c;
        var updateTransition = tlv.decode(buffer);
        var transitionConfiguration = tlv.decode(updateTransition[1 /* VALUE_TRANSITION_CONFIGURATION */]);
        var iid = tlv.readVariableUIntLE(transitionConfiguration[1 /* CHARACTERISTIC_IID */]);
        if (!this.lightbulb.getCharacteristicByIID(iid)) {
            throw new __1.HapStatusError(-70410 /* INVALID_VALUE_IN_REQUEST */);
        }
        var param3 = (_b = transitionConfiguration[3 /* UNKNOWN_3 */]) === null || _b === void 0 ? void 0 : _b.readUInt8(0); // when present it is always 1
        if (!param3) { // if HomeKit just sends the iid, we consider that as "disable adaptive lighting" (assumption)
            this.handleAdaptiveLightingDisabled();
            return tlv.encode(2 /* UPDATE_VALUE_TRANSITION_CONFIGURATION */, Buffer.alloc(0));
        }
        var parametersTLV = tlv.decode(transitionConfiguration[2 /* TRANSITION_PARAMETERS */]);
        var curveConfiguration = tlv.decodeWithLists(transitionConfiguration[5 /* TRANSITION_CURVE_CONFIGURATION */]);
        var updateInterval = (_c = transitionConfiguration[6 /* UPDATE_INTERVAL */]) === null || _c === void 0 ? void 0 : _c.readUInt16LE(0);
        var notifyIntervalThreshold = transitionConfiguration[8 /* NOTIFY_INTERVAL_THRESHOLD */].readUInt32LE(0);
        var transitionId = parametersTLV[1 /* TRANSITION_ID */];
        var startTime = parametersTLV[2 /* START_TIME */];
        var id3 = parametersTLV[3 /* UNKNOWN_3 */]; // this may be undefined
        var startTimeMillis = (0, __1.epochMillisFromMillisSince2001_01_01Buffer)(startTime);
        var timeMillisOffset = Date.now() - startTimeMillis;
        var transitionCurve = [];
        var previous = undefined;
        var transitions = curveConfiguration[1 /* TRANSITION_ENTRY */];
        try {
            for (var transitions_1 = (0, tslib_1.__values)(transitions), transitions_1_1 = transitions_1.next(); !transitions_1_1.done; transitions_1_1 = transitions_1.next()) {
                var entry = transitions_1_1.value;
                var tlvEntry = tlv.decode(entry);
                var adjustmentFactor = tlvEntry[1 /* ADJUSTMENT_FACTOR */].readFloatLE(0);
                var value = tlvEntry[2 /* VALUE */].readFloatLE(0);
                var transitionOffset = tlv.readVariableUIntLE(tlvEntry[3 /* TRANSITION_OFFSET */]);
                var duration = tlvEntry[4 /* DURATION */] ? tlv.readVariableUIntLE(tlvEntry[4 /* DURATION */]) : undefined;
                if (previous) {
                    previous.duration = duration;
                }
                previous = {
                    temperature: value,
                    brightnessAdjustmentFactor: adjustmentFactor,
                    transitionTime: transitionOffset,
                };
                transitionCurve.push(previous);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (transitions_1_1 && !transitions_1_1.done && (_a = transitions_1.return)) _a.call(transitions_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var adjustmentIID = tlv.readVariableUIntLE(curveConfiguration[2 /* ADJUSTMENT_CHARACTERISTIC_IID */]);
        var adjustmentMultiplierRange = tlv.decode(curveConfiguration[3 /* ADJUSTMENT_MULTIPLIER_RANGE */]);
        var minAdjustmentMultiplier = adjustmentMultiplierRange[1 /* MINIMUM_ADJUSTMENT_MULTIPLIER */].readUInt32LE(0);
        var maxAdjustmentMultiplier = adjustmentMultiplierRange[2 /* MAXIMUM_ADJUSTMENT_MULTIPLIER */].readUInt32LE(0);
        this.activeTransition = {
            iid: iid,
            transitionStartMillis: startTimeMillis,
            timeMillisOffset: timeMillisOffset,
            transitionId: uuid.unparse(transitionId),
            transitionStartBuffer: startTime.toString("hex"),
            id3: id3 === null || id3 === void 0 ? void 0 : id3.toString("hex"),
            brightnessCharacteristicIID: adjustmentIID,
            brightnessAdjustmentRange: {
                minBrightnessValue: minAdjustmentMultiplier,
                maxBrightnessValue: maxAdjustmentMultiplier,
            },
            transitionCurve: transitionCurve,
            updateInterval: updateInterval !== null && updateInterval !== void 0 ? updateInterval : 60000,
            notifyIntervalThreshold: notifyIntervalThreshold,
        };
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = undefined;
            debug("[%s] Adaptive lighting was renewed.", this.lightbulb.displayName);
        }
        else {
            debug("[%s] Adaptive lighting was enabled.", this.lightbulb.displayName);
        }
        this.handleActiveTransitionUpdated();
        return tlv.encode(2 /* UPDATE_VALUE_TRANSITION_CONFIGURATION */, this.buildTransitionControlResponseBuffer(0));
    };
    return AdaptiveLightingController;
}(events_1.EventEmitter));
exports.AdaptiveLightingController = AdaptiveLightingController;
//# sourceMappingURL=AdaptiveLightingController.js.map