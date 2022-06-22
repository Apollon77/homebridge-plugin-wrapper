"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiriAudioSession = exports.SiriAudioSessionEvents = exports.HomeKitRemoteController = exports.RemoteController = exports.RemoteControllerEvents = exports.TargetUpdates = exports.AudioSamplerate = exports.AudioBitrate = exports.AudioCodecTypes = exports.ButtonState = exports.TargetCategory = exports.ButtonType = void 0;
var tslib_1 = require("tslib");
var assert_1 = (0, tslib_1.__importDefault)(require("assert"));
var debug_1 = (0, tslib_1.__importDefault)(require("debug"));
var events_1 = require("events");
var Characteristic_1 = require("../Characteristic");
var datastream_1 = require("../datastream");
var Service_1 = require("../Service");
var tlv = (0, tslib_1.__importStar)(require("../util/tlv"));
var debug = (0, debug_1.default)("HAP-NodeJS:Remote:Controller");
var TargetControlCommands;
(function (TargetControlCommands) {
    TargetControlCommands[TargetControlCommands["MAXIMUM_TARGETS"] = 1] = "MAXIMUM_TARGETS";
    TargetControlCommands[TargetControlCommands["TICKS_PER_SECOND"] = 2] = "TICKS_PER_SECOND";
    TargetControlCommands[TargetControlCommands["SUPPORTED_BUTTON_CONFIGURATION"] = 3] = "SUPPORTED_BUTTON_CONFIGURATION";
    TargetControlCommands[TargetControlCommands["TYPE"] = 4] = "TYPE";
})(TargetControlCommands || (TargetControlCommands = {}));
var SupportedButtonConfigurationTypes;
(function (SupportedButtonConfigurationTypes) {
    SupportedButtonConfigurationTypes[SupportedButtonConfigurationTypes["BUTTON_ID"] = 1] = "BUTTON_ID";
    SupportedButtonConfigurationTypes[SupportedButtonConfigurationTypes["BUTTON_TYPE"] = 2] = "BUTTON_TYPE";
})(SupportedButtonConfigurationTypes || (SupportedButtonConfigurationTypes = {}));
var ButtonType;
(function (ButtonType) {
    // noinspection JSUnusedGlobalSymbols
    ButtonType[ButtonType["UNDEFINED"] = 0] = "UNDEFINED";
    ButtonType[ButtonType["MENU"] = 1] = "MENU";
    ButtonType[ButtonType["PLAY_PAUSE"] = 2] = "PLAY_PAUSE";
    ButtonType[ButtonType["TV_HOME"] = 3] = "TV_HOME";
    ButtonType[ButtonType["SELECT"] = 4] = "SELECT";
    ButtonType[ButtonType["ARROW_UP"] = 5] = "ARROW_UP";
    ButtonType[ButtonType["ARROW_RIGHT"] = 6] = "ARROW_RIGHT";
    ButtonType[ButtonType["ARROW_DOWN"] = 7] = "ARROW_DOWN";
    ButtonType[ButtonType["ARROW_LEFT"] = 8] = "ARROW_LEFT";
    ButtonType[ButtonType["VOLUME_UP"] = 9] = "VOLUME_UP";
    ButtonType[ButtonType["VOLUME_DOWN"] = 10] = "VOLUME_DOWN";
    ButtonType[ButtonType["SIRI"] = 11] = "SIRI";
    ButtonType[ButtonType["POWER"] = 12] = "POWER";
    ButtonType[ButtonType["GENERIC"] = 13] = "GENERIC";
})(ButtonType = exports.ButtonType || (exports.ButtonType = {}));
var TargetControlList;
(function (TargetControlList) {
    TargetControlList[TargetControlList["OPERATION"] = 1] = "OPERATION";
    TargetControlList[TargetControlList["TARGET_CONFIGURATION"] = 2] = "TARGET_CONFIGURATION";
})(TargetControlList || (TargetControlList = {}));
var Operation;
(function (Operation) {
    // noinspection JSUnusedGlobalSymbols
    Operation[Operation["UNDEFINED"] = 0] = "UNDEFINED";
    Operation[Operation["LIST"] = 1] = "LIST";
    Operation[Operation["ADD"] = 2] = "ADD";
    Operation[Operation["REMOVE"] = 3] = "REMOVE";
    Operation[Operation["RESET"] = 4] = "RESET";
    Operation[Operation["UPDATE"] = 5] = "UPDATE";
})(Operation || (Operation = {}));
var TargetConfigurationTypes;
(function (TargetConfigurationTypes) {
    TargetConfigurationTypes[TargetConfigurationTypes["TARGET_IDENTIFIER"] = 1] = "TARGET_IDENTIFIER";
    TargetConfigurationTypes[TargetConfigurationTypes["TARGET_NAME"] = 2] = "TARGET_NAME";
    TargetConfigurationTypes[TargetConfigurationTypes["TARGET_CATEGORY"] = 3] = "TARGET_CATEGORY";
    TargetConfigurationTypes[TargetConfigurationTypes["BUTTON_CONFIGURATION"] = 4] = "BUTTON_CONFIGURATION";
})(TargetConfigurationTypes || (TargetConfigurationTypes = {}));
var TargetCategory;
(function (TargetCategory) {
    // noinspection JSUnusedGlobalSymbols
    TargetCategory[TargetCategory["UNDEFINED"] = 0] = "UNDEFINED";
    TargetCategory[TargetCategory["APPLE_TV"] = 24] = "APPLE_TV";
})(TargetCategory = exports.TargetCategory || (exports.TargetCategory = {}));
var ButtonConfigurationTypes;
(function (ButtonConfigurationTypes) {
    ButtonConfigurationTypes[ButtonConfigurationTypes["BUTTON_ID"] = 1] = "BUTTON_ID";
    ButtonConfigurationTypes[ButtonConfigurationTypes["BUTTON_TYPE"] = 2] = "BUTTON_TYPE";
    ButtonConfigurationTypes[ButtonConfigurationTypes["BUTTON_NAME"] = 3] = "BUTTON_NAME";
})(ButtonConfigurationTypes || (ButtonConfigurationTypes = {}));
var ButtonEvent;
(function (ButtonEvent) {
    ButtonEvent[ButtonEvent["BUTTON_ID"] = 1] = "BUTTON_ID";
    ButtonEvent[ButtonEvent["BUTTON_STATE"] = 2] = "BUTTON_STATE";
    ButtonEvent[ButtonEvent["TIMESTAMP"] = 3] = "TIMESTAMP";
    ButtonEvent[ButtonEvent["ACTIVE_IDENTIFIER"] = 4] = "ACTIVE_IDENTIFIER";
})(ButtonEvent || (ButtonEvent = {}));
var ButtonState;
(function (ButtonState) {
    ButtonState[ButtonState["UP"] = 0] = "UP";
    ButtonState[ButtonState["DOWN"] = 1] = "DOWN";
})(ButtonState = exports.ButtonState || (exports.ButtonState = {}));
var SelectedAudioInputStreamConfigurationTypes;
(function (SelectedAudioInputStreamConfigurationTypes) {
    SelectedAudioInputStreamConfigurationTypes[SelectedAudioInputStreamConfigurationTypes["SELECTED_AUDIO_INPUT_STREAM_CONFIGURATION"] = 1] = "SELECTED_AUDIO_INPUT_STREAM_CONFIGURATION";
})(SelectedAudioInputStreamConfigurationTypes || (SelectedAudioInputStreamConfigurationTypes = {}));
// ----------
var SupportedAudioStreamConfigurationTypes;
(function (SupportedAudioStreamConfigurationTypes) {
    // noinspection JSUnusedGlobalSymbols
    SupportedAudioStreamConfigurationTypes[SupportedAudioStreamConfigurationTypes["AUDIO_CODEC_CONFIGURATION"] = 1] = "AUDIO_CODEC_CONFIGURATION";
    SupportedAudioStreamConfigurationTypes[SupportedAudioStreamConfigurationTypes["COMFORT_NOISE_SUPPORT"] = 2] = "COMFORT_NOISE_SUPPORT";
})(SupportedAudioStreamConfigurationTypes || (SupportedAudioStreamConfigurationTypes = {}));
var AudioCodecConfigurationTypes;
(function (AudioCodecConfigurationTypes) {
    AudioCodecConfigurationTypes[AudioCodecConfigurationTypes["CODEC_TYPE"] = 1] = "CODEC_TYPE";
    AudioCodecConfigurationTypes[AudioCodecConfigurationTypes["CODEC_PARAMETERS"] = 2] = "CODEC_PARAMETERS";
})(AudioCodecConfigurationTypes || (AudioCodecConfigurationTypes = {}));
var AudioCodecTypes;
(function (AudioCodecTypes) {
    // noinspection JSUnusedGlobalSymbols
    AudioCodecTypes[AudioCodecTypes["PCMU"] = 0] = "PCMU";
    AudioCodecTypes[AudioCodecTypes["PCMA"] = 1] = "PCMA";
    AudioCodecTypes[AudioCodecTypes["AAC_ELD"] = 2] = "AAC_ELD";
    AudioCodecTypes[AudioCodecTypes["OPUS"] = 3] = "OPUS";
    AudioCodecTypes[AudioCodecTypes["MSBC"] = 4] = "MSBC";
    AudioCodecTypes[AudioCodecTypes["AMR"] = 5] = "AMR";
    AudioCodecTypes[AudioCodecTypes["AMR_WB"] = 6] = "AMR_WB";
})(AudioCodecTypes = exports.AudioCodecTypes || (exports.AudioCodecTypes = {}));
var AudioCodecParametersTypes;
(function (AudioCodecParametersTypes) {
    AudioCodecParametersTypes[AudioCodecParametersTypes["CHANNEL"] = 1] = "CHANNEL";
    AudioCodecParametersTypes[AudioCodecParametersTypes["BIT_RATE"] = 2] = "BIT_RATE";
    AudioCodecParametersTypes[AudioCodecParametersTypes["SAMPLE_RATE"] = 3] = "SAMPLE_RATE";
    AudioCodecParametersTypes[AudioCodecParametersTypes["PACKET_TIME"] = 4] = "PACKET_TIME"; // only present in selected audio codec parameters tlv
})(AudioCodecParametersTypes || (AudioCodecParametersTypes = {}));
var AudioBitrate;
(function (AudioBitrate) {
    AudioBitrate[AudioBitrate["VARIABLE"] = 0] = "VARIABLE";
    AudioBitrate[AudioBitrate["CONSTANT"] = 1] = "CONSTANT";
})(AudioBitrate = exports.AudioBitrate || (exports.AudioBitrate = {}));
var AudioSamplerate;
(function (AudioSamplerate) {
    AudioSamplerate[AudioSamplerate["KHZ_8"] = 0] = "KHZ_8";
    AudioSamplerate[AudioSamplerate["KHZ_16"] = 1] = "KHZ_16";
    AudioSamplerate[AudioSamplerate["KHZ_24"] = 2] = "KHZ_24";
    // 3, 4, 5 are theoretically defined, but no idea to what kHz value they correspond to
    // probably KHZ_32, KHZ_44_1, KHZ_48 (as supported by Secure Video recordings)
})(AudioSamplerate = exports.AudioSamplerate || (exports.AudioSamplerate = {}));
var SiriAudioSessionState;
(function (SiriAudioSessionState) {
    SiriAudioSessionState[SiriAudioSessionState["STARTING"] = 0] = "STARTING";
    SiriAudioSessionState[SiriAudioSessionState["SENDING"] = 1] = "SENDING";
    SiriAudioSessionState[SiriAudioSessionState["CLOSING"] = 2] = "CLOSING";
    SiriAudioSessionState[SiriAudioSessionState["CLOSED"] = 3] = "CLOSED";
})(SiriAudioSessionState || (SiriAudioSessionState = {}));
var TargetUpdates;
(function (TargetUpdates) {
    TargetUpdates[TargetUpdates["NAME"] = 0] = "NAME";
    TargetUpdates[TargetUpdates["CATEGORY"] = 1] = "CATEGORY";
    TargetUpdates[TargetUpdates["UPDATED_BUTTONS"] = 2] = "UPDATED_BUTTONS";
    TargetUpdates[TargetUpdates["REMOVED_BUTTONS"] = 3] = "REMOVED_BUTTONS";
})(TargetUpdates = exports.TargetUpdates || (exports.TargetUpdates = {}));
var RemoteControllerEvents;
(function (RemoteControllerEvents) {
    /**
     * This event is emitted when the active state of the remote has changed.
     * active = true indicates that there is currently an apple tv listening of button presses and audio streams.
     */
    RemoteControllerEvents["ACTIVE_CHANGE"] = "active-change";
    /**
     * This event is emitted when the currently selected target has changed.
     * Possible reasons for a changed active identifier: manual change via api call, first target configuration
     * gets added, active target gets removed, accessory gets unpaired, reset request was sent.
     * An activeIdentifier of 0 indicates that no target is selected.
     */
    RemoteControllerEvents["ACTIVE_IDENTIFIER_CHANGE"] = "active-identifier-change";
    /**
     * This event is emitted when a new target configuration is received. As we currently do not persistently store
     * configured targets, this will be called at every startup for every Apple TV configured in the home.
     */
    RemoteControllerEvents["TARGET_ADDED"] = "target-add";
    /**
     * This event is emitted when a existing target was updated.
     * The 'updates' array indicates what exactly was changed for the target.
     */
    RemoteControllerEvents["TARGET_UPDATED"] = "target-update";
    /**
     * This event is emitted when a existing configuration for a target was removed.
     */
    RemoteControllerEvents["TARGET_REMOVED"] = "target-remove";
    /**
     * This event is emitted when a reset of the target configuration is requested.
     * With this event every configuration made should be reset. This event is also called
     * when the accessory gets unpaired.
     */
    RemoteControllerEvents["TARGETS_RESET"] = "targets-reset";
})(RemoteControllerEvents = exports.RemoteControllerEvents || (exports.RemoteControllerEvents = {}));
/**
 * Handles everything needed to implement a fully working HomeKit remote controller.
 */
var RemoteController = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(RemoteController, _super);
    /**
     * Creates a new RemoteController.
     * If siri voice input is supported the constructor to an SiriAudioStreamProducer needs to be supplied.
     * Otherwise a remote without voice support will be created.
     *
     * For every audio session a new SiriAudioStreamProducer will be constructed.
     *
     * @param audioProducerConstructor {SiriAudioStreamProducerConstructor} - constructor for a SiriAudioStreamProducer
     * @param producerOptions - if supplied this argument will be supplied as third argument of the SiriAudioStreamProducer
     *                          constructor. This should be used to supply configurations to the stream producer.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
    function RemoteController(audioProducerConstructor, producerOptions) {
        var _this = _super.call(this) || this;
        _this.buttons = {}; // internal mapping of buttonId to buttonType for supported buttons
        _this.targetConfigurations = new Map();
        _this.targetConfigurationsString = "";
        _this.lastButtonEvent = "";
        _this.activeIdentifier = 0; // id of 0 means no device selected
        _this.dataStreamConnections = new Map(); // maps targetIdentifiers to active data stream connections
        _this.audioSupported = audioProducerConstructor !== undefined;
        _this.audioProducerConstructor = audioProducerConstructor;
        _this.audioProducerOptions = producerOptions;
        var configuration = _this.constructSupportedConfiguration();
        _this.supportedConfiguration = _this.buildTargetControlSupportedConfigurationTLV(configuration);
        var audioConfiguration = _this.constructSupportedAudioConfiguration();
        _this.supportedAudioConfiguration = RemoteController.buildSupportedAudioConfigurationTLV(audioConfiguration);
        _this.selectedAudioConfiguration = {
            codecType: 3 /* OPUS */,
            parameters: {
                channels: 1,
                bitrate: 0 /* VARIABLE */,
                samplerate: 1 /* KHZ_16 */,
                rtpTime: 20,
            },
        };
        _this.selectedAudioConfigurationString = RemoteController.buildSelectedAudioConfigurationTLV({
            audioCodecConfiguration: _this.selectedAudioConfiguration,
        });
        return _this;
    }
    /**
     * @private
     */
    RemoteController.prototype.controllerId = function () {
        return "remote" /* REMOTE */;
    };
    /**
     * Set a new target as active target. A value of 0 indicates that no target is selected currently.
     *
     * @param activeIdentifier {number} - target identifier
     */
    RemoteController.prototype.setActiveIdentifier = function (activeIdentifier) {
        var _this = this;
        if (activeIdentifier === this.activeIdentifier) {
            return;
        }
        if (activeIdentifier !== 0 && !this.targetConfigurations.has(activeIdentifier)) {
            throw Error("Tried setting unconfigured targetIdentifier to active");
        }
        debug("%d is now the active target", activeIdentifier);
        this.activeIdentifier = activeIdentifier;
        this.targetControlService.getCharacteristic(Characteristic_1.Characteristic.ActiveIdentifier).updateValue(activeIdentifier);
        if (this.activeAudioSession) {
            this.handleSiriAudioStop();
        }
        setTimeout(function () { return _this.emit("active-identifier-change" /* ACTIVE_IDENTIFIER_CHANGE */, activeIdentifier); }, 0);
        this.setInactive();
    };
    /**
     * @returns if the current target is active, meaning the active device is listening for button events or audio sessions
     */
    RemoteController.prototype.isActive = function () {
        return !!this.activeConnection;
    };
    /**
     * Checks if the supplied targetIdentifier is configured.
     *
     * @param targetIdentifier {number}
     */
    RemoteController.prototype.isConfigured = function (targetIdentifier) {
        return this.targetConfigurations.has(targetIdentifier);
    };
    /**
     * Returns the targetIdentifier for a give device name
     *
     * @param name {string} - the name of the device
     * @returns the targetIdentifier of the device or undefined if not existent
     */
    RemoteController.prototype.getTargetIdentifierByName = function (name) {
        var e_1, _a;
        try {
            for (var _b = (0, tslib_1.__values)(Object.entries(this.targetConfigurations)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = (0, tslib_1.__read)(_c.value, 2), activeIdentifier = _d[0], configuration = _d[1];
                if (configuration.targetName === name) {
                    return parseInt(activeIdentifier, 10);
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
        return undefined;
    };
    /**
     * Sends a button event to press the supplied button.
     *
     * @param button {ButtonType} - button to be pressed
     */
    RemoteController.prototype.pushButton = function (button) {
        this.sendButtonEvent(button, 1 /* DOWN */);
    };
    /**
     * Sends a button event that the supplied button was released.
     *
     * @param button {ButtonType} - button which was released
     */
    RemoteController.prototype.releaseButton = function (button) {
        this.sendButtonEvent(button, 0 /* UP */);
    };
    /**
     * Presses a supplied button for a given time.
     *
     * @param button {ButtonType} - button to be pressed and released
     * @param time {number} - time in milliseconds (defaults to 200ms)
     */
    RemoteController.prototype.pushAndReleaseButton = function (button, time) {
        var _this = this;
        if (time === void 0) { time = 200; }
        this.pushButton(button);
        setTimeout(function () { return _this.releaseButton(button); }, time);
    };
    /**
     * This method adds and configures the remote services for a give accessory.
     *
     * @param accessory {Accessory} - the give accessory this remote should be added to
     * @deprecated - use {@link Accessory.configureController} instead
     */
    RemoteController.prototype.addServicesToAccessory = function (accessory) {
        accessory.configureController(this);
    };
    // ---------------------------------- CONFIGURATION ----------------------------------
    // override methods if you would like to change anything (but should not be necessary most likely)
    RemoteController.prototype.constructSupportedConfiguration = function () {
        var _this = this;
        var configuration = {
            maximumTargets: 10,
            ticksPerSecond: 1000,
            supportedButtonConfiguration: [],
            hardwareImplemented: this.audioSupported, // siri is only allowed for hardware implemented remotes
        };
        var supportedButtons = [
            1 /* MENU */, 2 /* PLAY_PAUSE */, 3 /* TV_HOME */, 4 /* SELECT */,
            5 /* ARROW_UP */, 6 /* ARROW_RIGHT */, 7 /* ARROW_DOWN */, 8 /* ARROW_LEFT */,
            9 /* VOLUME_UP */, 10 /* VOLUME_DOWN */, 12 /* POWER */, 13 /* GENERIC */,
        ];
        if (this.audioSupported) { // add siri button if this remote supports it
            supportedButtons.push(11 /* SIRI */);
        }
        supportedButtons.forEach(function (button) {
            var buttonConfiguration = {
                buttonID: 100 + button,
                buttonType: button,
            };
            configuration.supportedButtonConfiguration.push(buttonConfiguration);
            _this.buttons[button] = buttonConfiguration.buttonID; // also saving mapping of type to id locally
        });
        return configuration;
    };
    RemoteController.prototype.constructSupportedAudioConfiguration = function () {
        // the following parameters are expected from HomeKit for a remote
        return {
            audioCodecConfiguration: {
                codecType: 3 /* OPUS */,
                parameters: {
                    channels: 1,
                    bitrate: 0 /* VARIABLE */,
                    samplerate: 1 /* KHZ_16 */,
                },
            },
        };
    };
    // --------------------------------- TARGET CONTROL ----------------------------------
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RemoteController.prototype.handleTargetControlWrite = function (value, callback) {
        var data = Buffer.from(value, "base64");
        var objects = tlv.decode(data);
        var operation = objects[1 /* OPERATION */][0];
        var targetConfiguration = undefined;
        if (objects[2 /* TARGET_CONFIGURATION */]) { // if target configuration was sent, parse it
            targetConfiguration = this.parseTargetConfigurationTLV(objects[2 /* TARGET_CONFIGURATION */]);
        }
        debug("Received TargetControl write operation %s", Operation[operation]);
        var handler;
        switch (operation) {
            case Operation.ADD:
                handler = this.handleAddTarget.bind(this);
                break;
            case Operation.UPDATE:
                handler = this.handleUpdateTarget.bind(this);
                break;
            case Operation.REMOVE:
                handler = this.handleRemoveTarget.bind(this);
                break;
            case Operation.RESET:
                handler = this.handleResetTargets.bind(this);
                break;
            case Operation.LIST:
                handler = this.handleListTargets.bind(this);
                break;
            default:
                callback(-70410 /* INVALID_VALUE_IN_REQUEST */, undefined);
                return;
        }
        var status = handler(targetConfiguration);
        if (status === 0 /* SUCCESS */) {
            callback(undefined, this.targetConfigurationsString); // passing value for write response
            if (operation === Operation.ADD && this.activeIdentifier === 0) {
                this.setActiveIdentifier(targetConfiguration.targetIdentifier);
            }
        }
        else {
            callback(new Error(status + ""));
        }
    };
    RemoteController.prototype.handleAddTarget = function (targetConfiguration) {
        var _this = this;
        if (!targetConfiguration) {
            return -70410 /* INVALID_VALUE_IN_REQUEST */;
        }
        this.targetConfigurations.set(targetConfiguration.targetIdentifier, targetConfiguration);
        debug("Configured new target '" + targetConfiguration.targetName + "' with targetIdentifier '" + targetConfiguration.targetIdentifier + "'");
        setTimeout(function () { return _this.emit("target-add" /* TARGET_ADDED */, targetConfiguration); }, 0);
        this.updatedTargetConfiguration(); // set response
        return 0 /* SUCCESS */;
    };
    RemoteController.prototype.handleUpdateTarget = function (targetConfiguration) {
        var e_2, _a;
        var _this = this;
        if (!targetConfiguration) {
            return -70410 /* INVALID_VALUE_IN_REQUEST */;
        }
        var updates = [];
        var configuredTarget = this.targetConfigurations.get(targetConfiguration.targetIdentifier);
        if (!configuredTarget) {
            return -70410 /* INVALID_VALUE_IN_REQUEST */;
        }
        if (targetConfiguration.targetName) {
            debug("Target name was updated '%s' => '%s' (%d)", configuredTarget.targetName, targetConfiguration.targetName, configuredTarget.targetIdentifier);
            configuredTarget.targetName = targetConfiguration.targetName;
            updates.push(0 /* NAME */);
        }
        if (targetConfiguration.targetCategory) {
            debug("Target category was updated '%d' => '%d' for target '%s' (%d)", configuredTarget.targetCategory, targetConfiguration.targetCategory, configuredTarget.targetName, configuredTarget.targetIdentifier);
            configuredTarget.targetCategory = targetConfiguration.targetCategory;
            updates.push(1 /* CATEGORY */);
        }
        if (targetConfiguration.buttonConfiguration) {
            debug("%d button configurations were updated for target '%s' (%d)", Object.keys(targetConfiguration.buttonConfiguration).length, configuredTarget.targetName, configuredTarget.targetIdentifier);
            try {
                for (var _b = (0, tslib_1.__values)(Object.values(targetConfiguration.buttonConfiguration)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var configuration = _c.value;
                    var savedConfiguration = configuredTarget.buttonConfiguration[configuration.buttonID];
                    savedConfiguration.buttonType = configuration.buttonType;
                    savedConfiguration.buttonName = configuration.buttonName;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            updates.push(2 /* UPDATED_BUTTONS */);
        }
        setTimeout(function () { return _this.emit("target-update" /* TARGET_UPDATED */, targetConfiguration, updates); }, 0);
        this.updatedTargetConfiguration(); // set response
        return 0 /* SUCCESS */;
    };
    RemoteController.prototype.handleRemoveTarget = function (targetConfiguration) {
        var _this = this;
        if (!targetConfiguration) {
            return -70410 /* INVALID_VALUE_IN_REQUEST */;
        }
        var configuredTarget = this.targetConfigurations.get(targetConfiguration.targetIdentifier);
        if (!configuredTarget) {
            return -70410 /* INVALID_VALUE_IN_REQUEST */;
        }
        if (targetConfiguration.buttonConfiguration) {
            for (var key in targetConfiguration.buttonConfiguration) {
                if (Object.prototype.hasOwnProperty.call(targetConfiguration.buttonConfiguration, key)) {
                    delete configuredTarget.buttonConfiguration[key];
                }
            }
            debug("Removed %d button configurations of target '%s' (%d)", Object.keys(targetConfiguration.buttonConfiguration).length, configuredTarget.targetName, configuredTarget.targetIdentifier);
            setTimeout(function () { return _this.emit("target-update" /* TARGET_UPDATED */, configuredTarget, [3 /* REMOVED_BUTTONS */]); }, 0);
        }
        else {
            this.targetConfigurations.delete(targetConfiguration.targetIdentifier);
            debug("Target '%s' (%d) was removed", configuredTarget.targetName, configuredTarget.targetIdentifier);
            setTimeout(function () { return _this.emit("target-remove" /* TARGET_REMOVED */, targetConfiguration.targetIdentifier); }, 0);
            var keys = Object.keys(this.targetConfigurations);
            this.setActiveIdentifier(keys.length === 0 ? 0 : parseInt(keys[0], 10)); // switch to next available remote
        }
        this.updatedTargetConfiguration(); // set response
        return 0 /* SUCCESS */;
    };
    RemoteController.prototype.handleResetTargets = function (targetConfiguration) {
        var _this = this;
        if (targetConfiguration) {
            return -70410 /* INVALID_VALUE_IN_REQUEST */;
        }
        debug("Resetting all target configurations");
        this.targetConfigurations = new Map();
        this.updatedTargetConfiguration(); // set response
        setTimeout(function () { return _this.emit("targets-reset" /* TARGETS_RESET */); }, 0);
        this.setActiveIdentifier(0); // resetting active identifier (also sets active to false)
        return 0 /* SUCCESS */;
    };
    RemoteController.prototype.handleListTargets = function (targetConfiguration) {
        if (targetConfiguration) {
            return -70410 /* INVALID_VALUE_IN_REQUEST */;
        }
        // this.targetConfigurationsString is updated after each change, so we basically don't need to do anything here
        debug("Returning " + Object.keys(this.targetConfigurations).length + " target configurations");
        return 0 /* SUCCESS */;
    };
    RemoteController.prototype.handleActiveWrite = function (value, callback, connection) {
        if (this.activeIdentifier === 0) {
            debug("Tried to change active state. There is no active target set though");
            callback(-70410 /* INVALID_VALUE_IN_REQUEST */);
            return;
        }
        if (this.activeConnection) {
            this.activeConnection.removeListener("closed" /* CLOSED */, this.activeConnectionDisconnectListener);
            this.activeConnection = undefined;
            this.activeConnectionDisconnectListener = undefined;
        }
        this.activeConnection = value ? connection : undefined;
        if (this.activeConnection) { // register listener when hap connection disconnects
            this.activeConnectionDisconnectListener = this.handleActiveSessionDisconnected.bind(this, this.activeConnection);
            this.activeConnection.on("closed" /* CLOSED */, this.activeConnectionDisconnectListener);
        }
        var activeTarget = this.targetConfigurations.get(this.activeIdentifier);
        if (!activeTarget) {
            callback(-70410 /* INVALID_VALUE_IN_REQUEST */);
            return;
        }
        debug("Remote with activeTarget '%s' (%d) was set to %s", activeTarget.targetName, this.activeIdentifier, value ? "ACTIVE" : "INACTIVE");
        callback();
        this.emit("active-change" /* ACTIVE_CHANGE */, value);
    };
    RemoteController.prototype.setInactive = function () {
        var _this = this;
        if (this.activeConnection === undefined) {
            return;
        }
        this.activeConnection.removeListener("closed" /* CLOSED */, this.activeConnectionDisconnectListener);
        this.activeConnection = undefined;
        this.activeConnectionDisconnectListener = undefined;
        this.targetControlService.getCharacteristic(Characteristic_1.Characteristic.Active).updateValue(false);
        debug("Remote was set to INACTIVE");
        setTimeout(function () { return _this.emit("active-change" /* ACTIVE_CHANGE */, false); }, 0);
    };
    RemoteController.prototype.handleActiveSessionDisconnected = function (connection) {
        if (connection !== this.activeConnection) {
            return;
        }
        debug("Active hap session disconnected!");
        this.setInactive();
    };
    RemoteController.prototype.sendButtonEvent = function (button, buttonState) {
        var buttonID = this.buttons[button];
        if (buttonID === undefined || buttonID === 0) {
            throw new Error("Tried sending button event for unsupported button (" + button + ")");
        }
        if (this.activeIdentifier === 0) { // cannot press button if no device is selected
            throw new Error("Tried sending button event although no target was selected");
        }
        if (!this.isActive()) { // cannot press button if device is not active (aka no apple tv is listening)
            throw new Error("Tried sending button event although target was not marked as active");
        }
        if (button === 11 /* SIRI */ && this.audioSupported) {
            if (buttonState === 1 /* DOWN */) { // start streaming session
                this.handleSiriAudioStart();
            }
            else if (buttonState === 0 /* UP */) { // stop streaming session
                this.handleSiriAudioStop();
            }
            return;
        }
        var buttonIdTlv = tlv.encode(1 /* BUTTON_ID */, buttonID);
        var buttonStateTlv = tlv.encode(2 /* BUTTON_STATE */, buttonState);
        var timestampTlv = tlv.encode(3 /* TIMESTAMP */, tlv.writeUInt64(new Date().getTime()));
        var activeIdentifierTlv = tlv.encode(4 /* ACTIVE_IDENTIFIER */, tlv.writeUInt32(this.activeIdentifier));
        this.lastButtonEvent = Buffer.concat([
            buttonIdTlv, buttonStateTlv, timestampTlv, activeIdentifierTlv,
        ]).toString("base64");
        this.targetControlService.getCharacteristic(Characteristic_1.Characteristic.ButtonEvent).sendEventNotification(this.lastButtonEvent);
    };
    RemoteController.prototype.parseTargetConfigurationTLV = function (data) {
        var configTLV = tlv.decode(data);
        var identifier = tlv.readUInt32(configTLV[1 /* TARGET_IDENTIFIER */]);
        var name = undefined;
        if (configTLV[2 /* TARGET_NAME */]) {
            name = configTLV[2 /* TARGET_NAME */].toString();
        }
        var category = undefined;
        if (configTLV[3 /* TARGET_CATEGORY */]) {
            category = tlv.readUInt16(configTLV[3 /* TARGET_CATEGORY */]);
        }
        var buttonConfiguration = {};
        if (configTLV[4 /* BUTTON_CONFIGURATION */]) {
            var buttonConfigurationTLV = tlv.decodeList(configTLV[4 /* BUTTON_CONFIGURATION */], 1 /* BUTTON_ID */);
            buttonConfigurationTLV.forEach(function (entry) {
                var buttonId = entry[1 /* BUTTON_ID */][0];
                var buttonType = tlv.readUInt16(entry[2 /* BUTTON_TYPE */]);
                var buttonName;
                if (entry[3 /* BUTTON_NAME */]) {
                    buttonName = entry[3 /* BUTTON_NAME */].toString();
                }
                else {
                    // @ts-expect-error: forceConsistentCasingInFileNames compiler option
                    buttonName = ButtonType[buttonType];
                }
                buttonConfiguration[buttonId] = {
                    buttonID: buttonId,
                    buttonType: buttonType,
                    buttonName: buttonName,
                };
            });
        }
        return {
            targetIdentifier: identifier,
            targetName: name,
            targetCategory: category,
            buttonConfiguration: buttonConfiguration,
        };
    };
    RemoteController.prototype.updatedTargetConfiguration = function () {
        var e_3, _a, e_4, _b;
        var _c;
        var bufferList = [];
        try {
            for (var _d = (0, tslib_1.__values)(Object.values(this.targetConfigurations)), _e = _d.next(); !_e.done; _e = _d.next()) {
                var configuration = _e.value;
                var targetIdentifier = tlv.encode(1 /* TARGET_IDENTIFIER */, tlv.writeUInt32(configuration.targetIdentifier));
                var targetName = tlv.encode(2 /* TARGET_NAME */, configuration.targetName);
                var targetCategory = tlv.encode(3 /* TARGET_CATEGORY */, tlv.writeUInt16(configuration.targetCategory));
                var buttonConfigurationBuffers = [];
                try {
                    for (var _f = (e_4 = void 0, (0, tslib_1.__values)(configuration.buttonConfiguration.values())), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var value = _g.value;
                        var tlvBuffer = tlv.encode(1 /* BUTTON_ID */, value.buttonID, 2 /* BUTTON_TYPE */, tlv.writeUInt16(value.buttonType));
                        if (value.buttonName) {
                            tlvBuffer = Buffer.concat([
                                tlvBuffer,
                                tlv.encode(3 /* BUTTON_NAME */, value.buttonName),
                            ]);
                        }
                        buttonConfigurationBuffers.push(tlvBuffer);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                var buttonConfiguration = tlv.encode(4 /* BUTTON_CONFIGURATION */, Buffer.concat(buttonConfigurationBuffers));
                var targetConfiguration = Buffer.concat([targetIdentifier, targetName, targetCategory, buttonConfiguration]);
                bufferList.push(tlv.encode(2 /* TARGET_CONFIGURATION */, targetConfiguration));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_3) throw e_3.error; }
        }
        this.targetConfigurationsString = Buffer.concat(bufferList).toString("base64");
        (_c = this.stateChangeDelegate) === null || _c === void 0 ? void 0 : _c.call(this);
    };
    RemoteController.prototype.buildTargetControlSupportedConfigurationTLV = function (configuration) {
        var maximumTargets = tlv.encode(1 /* MAXIMUM_TARGETS */, configuration.maximumTargets);
        var ticksPerSecond = tlv.encode(2 /* TICKS_PER_SECOND */, tlv.writeUInt64(configuration.ticksPerSecond));
        var supportedButtonConfigurationBuffers = [];
        configuration.supportedButtonConfiguration.forEach(function (value) {
            var tlvBuffer = tlv.encode(1 /* BUTTON_ID */, value.buttonID, 2 /* BUTTON_TYPE */, tlv.writeUInt16(value.buttonType));
            supportedButtonConfigurationBuffers.push(tlvBuffer);
        });
        var supportedButtonConfiguration = tlv.encode(3 /* SUPPORTED_BUTTON_CONFIGURATION */, Buffer.concat(supportedButtonConfigurationBuffers));
        var type = tlv.encode(4 /* TYPE */, configuration.hardwareImplemented ? 1 : 0);
        return Buffer.concat([maximumTargets, ticksPerSecond, supportedButtonConfiguration, type]).toString("base64");
    };
    // --------------------------------- SIRI/DATA STREAM --------------------------------
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RemoteController.prototype.handleTargetControlWhoAmI = function (connection, message) {
        var targetIdentifier = message.identifier;
        this.dataStreamConnections.set(targetIdentifier, connection);
        debug("Discovered HDS connection for targetIdentifier %s", targetIdentifier);
        connection.addProtocolHandler("dataSend" /* DATA_SEND */, this);
    };
    RemoteController.prototype.handleSiriAudioStart = function () {
        if (!this.audioSupported) {
            throw new Error("Cannot start siri stream on remote where siri is not supported");
        }
        if (!this.isActive()) {
            debug("Tried opening Siri audio stream, however no controller is connected!");
            return;
        }
        if (this.activeAudioSession && (!this.activeAudioSession.isClosing() || this.nextAudioSession)) {
            // there is already a session running, which is not in closing state and/or there is even already a
            // nextAudioSession running. ignoring start request
            debug("Tried opening Siri audio stream, however there is already one in progress");
            return;
        }
        var connection = this.dataStreamConnections.get(this.activeIdentifier); // get connection for current target
        if (connection === undefined) { // target seems not connected, ignore it
            debug("Tried opening Siri audio stream however target is not connected via HDS");
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        var audioSession = new SiriAudioSession(connection, this.selectedAudioConfiguration, this.audioProducerConstructor, this.audioProducerOptions);
        if (!this.activeAudioSession) {
            this.activeAudioSession = audioSession;
        }
        else {
            // we checked above that this only happens if the activeAudioSession is in closing state,
            // so no collision with the input device can happen
            this.nextAudioSession = audioSession;
        }
        audioSession.on("close" /* CLOSE */, this.handleSiriAudioSessionClosed.bind(this, audioSession));
        audioSession.start();
    };
    RemoteController.prototype.handleSiriAudioStop = function () {
        if (this.activeAudioSession) {
            if (!this.activeAudioSession.isClosing()) {
                this.activeAudioSession.stop();
                return;
            }
            else if (this.nextAudioSession && !this.nextAudioSession.isClosing()) {
                this.nextAudioSession.stop();
                return;
            }
        }
        debug("handleSiriAudioStop called although no audio session was started");
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RemoteController.prototype.handleDataSendAckEvent = function (message) {
        var streamId = message.streamId;
        var endOfStream = message.endOfStream;
        if (this.activeAudioSession && this.activeAudioSession.streamId === streamId) {
            this.activeAudioSession.handleDataSendAckEvent(endOfStream);
        }
        else if (this.nextAudioSession && this.nextAudioSession.streamId === streamId) {
            this.nextAudioSession.handleDataSendAckEvent(endOfStream);
        }
        else {
            debug("Received dataSend acknowledgment event for unknown streamId '%s'", streamId);
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RemoteController.prototype.handleDataSendCloseEvent = function (message) {
        var streamId = message.streamId;
        var reason = message.reason;
        if (this.activeAudioSession && this.activeAudioSession.streamId === streamId) {
            this.activeAudioSession.handleDataSendCloseEvent(reason);
        }
        else if (this.nextAudioSession && this.nextAudioSession.streamId === streamId) {
            this.nextAudioSession.handleDataSendCloseEvent(reason);
        }
        else {
            debug("Received dataSend close event for unknown streamId '%s'", streamId);
        }
    };
    RemoteController.prototype.handleSiriAudioSessionClosed = function (session) {
        if (session === this.activeAudioSession) {
            this.activeAudioSession = this.nextAudioSession;
            this.nextAudioSession = undefined;
        }
        else if (session === this.nextAudioSession) {
            this.nextAudioSession = undefined;
        }
    };
    RemoteController.prototype.handleDataStreamConnectionClosed = function (connection) {
        var e_5, _a;
        try {
            for (var _b = (0, tslib_1.__values)(this.dataStreamConnections), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = (0, tslib_1.__read)(_c.value, 2), targetIdentifier = _d[0], connection0 = _d[1];
                if (connection === connection0) {
                    debug("HDS connection disconnected for targetIdentifier %s", targetIdentifier);
                    this.dataStreamConnections.delete(targetIdentifier);
                    break;
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
    // ------------------------------- AUDIO CONFIGURATION -------------------------------
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RemoteController.prototype.handleSelectedAudioConfigurationWrite = function (value, callback) {
        var data = Buffer.from(value, "base64");
        var objects = tlv.decode(data);
        var selectedAudioStreamConfiguration = tlv.decode(objects[1 /* SELECTED_AUDIO_INPUT_STREAM_CONFIGURATION */]);
        var codec = selectedAudioStreamConfiguration[1 /* CODEC_TYPE */][0];
        var parameters = tlv.decode(selectedAudioStreamConfiguration[2 /* CODEC_PARAMETERS */]);
        var channels = parameters[1 /* CHANNEL */][0];
        var bitrate = parameters[2 /* BIT_RATE */][0];
        var samplerate = parameters[3 /* SAMPLE_RATE */][0];
        this.selectedAudioConfiguration = {
            codecType: codec,
            parameters: {
                channels: channels,
                bitrate: bitrate,
                samplerate: samplerate,
                rtpTime: 20,
            },
        };
        this.selectedAudioConfigurationString = RemoteController.buildSelectedAudioConfigurationTLV({
            audioCodecConfiguration: this.selectedAudioConfiguration,
        });
        callback();
    };
    RemoteController.buildSupportedAudioConfigurationTLV = function (configuration) {
        var codecConfigurationTLV = RemoteController.buildCodecConfigurationTLV(configuration.audioCodecConfiguration);
        var supportedAudioStreamConfiguration = tlv.encode(1 /* AUDIO_CODEC_CONFIGURATION */, codecConfigurationTLV);
        return supportedAudioStreamConfiguration.toString("base64");
    };
    RemoteController.buildSelectedAudioConfigurationTLV = function (configuration) {
        var codecConfigurationTLV = RemoteController.buildCodecConfigurationTLV(configuration.audioCodecConfiguration);
        var supportedAudioStreamConfiguration = tlv.encode(1 /* SELECTED_AUDIO_INPUT_STREAM_CONFIGURATION */, codecConfigurationTLV);
        return supportedAudioStreamConfiguration.toString("base64");
    };
    RemoteController.buildCodecConfigurationTLV = function (codecConfiguration) {
        var parameters = codecConfiguration.parameters;
        var parametersTLV = tlv.encode(1 /* CHANNEL */, parameters.channels, 2 /* BIT_RATE */, parameters.bitrate, 3 /* SAMPLE_RATE */, parameters.samplerate);
        if (parameters.rtpTime) {
            parametersTLV = Buffer.concat([
                parametersTLV,
                tlv.encode(4 /* PACKET_TIME */, parameters.rtpTime),
            ]);
        }
        return tlv.encode(1 /* CODEC_TYPE */, codecConfiguration.codecType, 2 /* CODEC_PARAMETERS */, parametersTLV);
    };
    // -----------------------------------------------------------------------------------
    /**
     * @private
     */
    RemoteController.prototype.constructServices = function () {
        var _a;
        this.targetControlManagementService = new Service_1.Service.TargetControlManagement("", "");
        this.targetControlManagementService.setCharacteristic(Characteristic_1.Characteristic.TargetControlSupportedConfiguration, this.supportedConfiguration);
        this.targetControlManagementService.setCharacteristic(Characteristic_1.Characteristic.TargetControlList, this.targetConfigurationsString);
        this.targetControlManagementService.setPrimaryService();
        // you can also expose multiple TargetControl services to control multiple apple tvs simultaneously.
        // should we extend this class to support multiple TargetControl services or should users just create a second accessory?
        this.targetControlService = new Service_1.Service.TargetControl("", "");
        this.targetControlService.setCharacteristic(Characteristic_1.Characteristic.ActiveIdentifier, 0);
        this.targetControlService.setCharacteristic(Characteristic_1.Characteristic.Active, false);
        this.targetControlService.setCharacteristic(Characteristic_1.Characteristic.ButtonEvent, this.lastButtonEvent);
        if (this.audioSupported) {
            this.siriService = new Service_1.Service.Siri("", "");
            this.siriService.setCharacteristic(Characteristic_1.Characteristic.SiriInputType, Characteristic_1.Characteristic.SiriInputType.PUSH_BUTTON_TRIGGERED_APPLE_TV);
            this.audioStreamManagementService = new Service_1.Service.AudioStreamManagement("", "");
            this.audioStreamManagementService.setCharacteristic(Characteristic_1.Characteristic.SupportedAudioStreamConfiguration, this.supportedAudioConfiguration);
            this.audioStreamManagementService.setCharacteristic(Characteristic_1.Characteristic.SelectedAudioStreamConfiguration, this.selectedAudioConfigurationString);
            this.dataStreamManagement = new datastream_1.DataStreamManagement();
            this.siriService.addLinkedService(this.dataStreamManagement.getService());
            this.siriService.addLinkedService(this.audioStreamManagementService);
        }
        return {
            targetControlManagement: this.targetControlManagementService,
            targetControl: this.targetControlService,
            siri: this.siriService,
            audioStreamManagement: this.audioStreamManagementService,
            dataStreamTransportManagement: (_a = this.dataStreamManagement) === null || _a === void 0 ? void 0 : _a.getService(),
        };
    };
    /**
     * @private
     */
    RemoteController.prototype.initWithServices = function (serviceMap) {
        this.targetControlManagementService = serviceMap.targetControlManagement;
        this.targetControlService = serviceMap.targetControl;
        this.siriService = serviceMap.siri;
        this.audioStreamManagementService = serviceMap.audioStreamManagement;
        this.dataStreamManagement = new datastream_1.DataStreamManagement(serviceMap.dataStreamTransportManagement);
    };
    /**
     * @private
     */
    RemoteController.prototype.configureServices = function () {
        var _a;
        var _this = this;
        if (!this.targetControlManagementService || !this.targetControlService) {
            throw new Error("Unexpected state: Services not configured!"); // playing it save
        }
        this.targetControlManagementService.getCharacteristic(Characteristic_1.Characteristic.TargetControlList)
            .on("get" /* GET */, function (callback) {
            callback(null, _this.targetConfigurationsString);
        })
            .on("set" /* SET */, this.handleTargetControlWrite.bind(this));
        this.targetControlService.getCharacteristic(Characteristic_1.Characteristic.ActiveIdentifier)
            .on("get" /* GET */, function (callback) {
            callback(undefined, _this.activeIdentifier);
        });
        this.targetControlService.getCharacteristic(Characteristic_1.Characteristic.Active)
            .on("get" /* GET */, function (callback) {
            callback(undefined, _this.isActive());
        })
            .on("set" /* SET */, function (value, callback, context, connection) {
            if (!connection) {
                debug("Set event handler for Remote.Active cannot be called from plugin. Connection undefined!");
                callback(-70410 /* INVALID_VALUE_IN_REQUEST */);
                return;
            }
            _this.handleActiveWrite(value, callback, connection);
        });
        this.targetControlService.getCharacteristic(Characteristic_1.Characteristic.ButtonEvent)
            .on("get" /* GET */, function (callback) {
            callback(undefined, _this.lastButtonEvent);
        });
        if (this.audioSupported) {
            this.audioStreamManagementService.getCharacteristic(Characteristic_1.Characteristic.SelectedAudioStreamConfiguration)
                .on("get" /* GET */, function (callback) {
                callback(null, _this.selectedAudioConfigurationString);
            })
                .on("set" /* SET */, this.handleSelectedAudioConfigurationWrite.bind(this))
                .updateValue(this.selectedAudioConfigurationString);
            this.dataStreamManagement
                .onEventMessage("targetControl" /* TARGET_CONTROL */, "whoami" /* WHOAMI */, this.handleTargetControlWhoAmI.bind(this))
                .onServerEvent("connection-closed" /* CONNECTION_CLOSED */, this.handleDataStreamConnectionClosed.bind(this));
            this.eventHandler = (_a = {},
                _a["ack" /* ACK */] = this.handleDataSendAckEvent.bind(this),
                _a["close" /* CLOSE */] = this.handleDataSendCloseEvent.bind(this),
                _a);
        }
    };
    /**
     * @private
     */
    RemoteController.prototype.handleControllerRemoved = function () {
        var _a;
        this.targetControlManagementService = undefined;
        this.targetControlService = undefined;
        this.siriService = undefined;
        this.audioStreamManagementService = undefined;
        this.eventHandler = undefined;
        this.requestHandler = undefined;
        (_a = this.dataStreamManagement) === null || _a === void 0 ? void 0 : _a.destroy();
        this.dataStreamManagement = undefined;
        // the call to dataStreamManagement.destroy will close any open data stream connection
        // which will result in a call to this.handleDataStreamConnectionClosed, cleaning up this.dataStreamConnections.
        // It will also result in a call to SiriAudioSession.handleDataStreamConnectionClosed (if there are any open session)
        // which again results in a call to this.handleSiriAudioSessionClosed,cleaning up this.activeAudioSession and this.nextAudioSession.
    };
    /**
     * @private
     */
    RemoteController.prototype.handleFactoryReset = function () {
        debug("Running factory reset. Resetting targets...");
        this.handleResetTargets(undefined);
        this.lastButtonEvent = "";
    };
    /**
     * @private
     */
    RemoteController.prototype.serialize = function () {
        if (!this.activeIdentifier && Object.keys(this.targetConfigurations).length === 0) {
            return undefined;
        }
        return {
            activeIdentifier: this.activeIdentifier,
            targetConfigurations: (0, tslib_1.__spreadArray)([], (0, tslib_1.__read)(this.targetConfigurations), false).reduce(function (obj, _a) {
                var _b = (0, tslib_1.__read)(_a, 2), key = _b[0], value = _b[1];
                obj[key] = value;
                return obj;
            }, {}),
        };
    };
    /**
     * @private
     */
    RemoteController.prototype.deserialize = function (serialized) {
        this.activeIdentifier = serialized.activeIdentifier;
        this.targetConfigurations = Object.entries(serialized.targetConfigurations).reduce(function (map, _a) {
            var _b = (0, tslib_1.__read)(_a, 2), key = _b[0], value = _b[1];
            var identifier = parseInt(key, 10);
            map.set(identifier, value);
            return map;
        }, new Map());
        this.updatedTargetConfiguration();
    };
    /**
     * @private
     */
    RemoteController.prototype.setupStateChangeDelegate = function (delegate) {
        this.stateChangeDelegate = delegate;
    };
    return RemoteController;
}(events_1.EventEmitter));
exports.RemoteController = RemoteController;
// noinspection JSUnusedGlobalSymbols
/**
 * @deprecated - only there for backwards compatibility, please use {@see RemoteController} directly
 */
var HomeKitRemoteController = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(HomeKitRemoteController, _super);
    function HomeKitRemoteController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return HomeKitRemoteController;
}(RemoteController)); // backwards compatibility
exports.HomeKitRemoteController = HomeKitRemoteController;
var SiriAudioSessionEvents;
(function (SiriAudioSessionEvents) {
    SiriAudioSessionEvents["CLOSE"] = "close";
})(SiriAudioSessionEvents = exports.SiriAudioSessionEvents || (exports.SiriAudioSessionEvents = {}));
/**
 * Represents an ongoing audio transmission
 */
var SiriAudioSession = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(SiriAudioSession, _super);
    function SiriAudioSession(connection, selectedAudioConfiguration, producerConstructor, 
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
    producerOptions) {
        var _this = _super.call(this) || this;
        _this.producerRunning = false; // indicates if the producer is running
        _this.state = 0 /* STARTING */;
        _this.endOfStream = false;
        _this.audioFrameQueue = [];
        _this.maxQueueSize = 1024;
        _this.sequenceNumber = 0;
        _this.connection = connection;
        _this.selectedAudioConfiguration = selectedAudioConfiguration;
        _this.producer = new producerConstructor(_this.handleSiriAudioFrame.bind(_this), _this.handleProducerError.bind(_this), producerOptions);
        _this.connection.on("closed" /* CLOSED */, _this.closeListener = _this.handleDataStreamConnectionClosed.bind(_this));
        return _this;
    }
    /**
     * Called when siri button is pressed
     */
    SiriAudioSession.prototype.start = function () {
        var _this = this;
        debug("Sending request to start siri audio stream");
        // opening dataSend
        this.connection.sendRequest("dataSend" /* DATA_SEND */, "open" /* OPEN */, {
            target: "controller",
            type: "audio.siri",
        }, function (error, status, message) {
            if (_this.state === 3 /* CLOSED */) {
                debug("Ignoring dataSend open response as the session is already closed");
                return;
            }
            assert_1.default.strictEqual(_this.state, 0 /* STARTING */);
            _this.state = 1 /* SENDING */;
            if (error || status) {
                if (error) { // errors get produced by hap-nodejs
                    debug("Error occurred trying to start siri audio stream: %s", error.message);
                }
                else if (status) { // status codes are those returned by the hds response
                    debug("Controller responded with non-zero status code: %s", datastream_1.HDSStatus[status]);
                }
                _this.closed();
            }
            else {
                _this.streamId = message.streamId;
                if (!_this.producerRunning) { // audio producer errored in the meantime
                    _this.sendDataSendCloseEvent(3 /* CANCELLED */);
                }
                else {
                    debug("Successfully setup siri audio stream with streamId %d", _this.streamId);
                }
            }
        });
        this.startAudioProducer(); // start audio producer and queue frames in the meantime
    };
    /**
     * @returns if the audio session is closing
     */
    SiriAudioSession.prototype.isClosing = function () {
        return this.state >= 2 /* CLOSING */;
    };
    /**
     * Called when siri button is released (or active identifier is changed to another device)
     */
    SiriAudioSession.prototype.stop = function () {
        (0, assert_1.default)(this.state <= 1 /* SENDING */, "state was higher than SENDING");
        debug("Stopping siri audio stream with streamId %d", this.streamId);
        this.endOfStream = true; // mark as endOfStream
        this.stopAudioProducer();
        if (this.state === 1 /* SENDING */) {
            this.handleSiriAudioFrame(undefined); // send out last few audio frames with endOfStream property set
            this.state = 2 /* CLOSING */; // we are waiting for an acknowledgment (triggered by endOfStream property)
        }
        else { // if state is not SENDING (aka state is STARTING) the callback for DATA_SEND OPEN did not yet return (or never will)
            this.closed();
        }
    };
    SiriAudioSession.prototype.startAudioProducer = function () {
        var _this = this;
        this.producer.startAudioProduction(this.selectedAudioConfiguration);
        this.producerRunning = true;
        this.producerTimer = setTimeout(function () {
            debug("Didn't receive any frames from audio producer for stream with streamId %s. Canceling the stream now.", _this.streamId);
            _this.producerTimer = undefined;
            _this.handleProducerError(3 /* CANCELLED */);
        }, 3000);
        this.producerTimer.unref();
    };
    SiriAudioSession.prototype.stopAudioProducer = function () {
        this.producer.stopAudioProduction();
        this.producerRunning = false;
        if (this.producerTimer) {
            clearTimeout(this.producerTimer);
            this.producerTimer = undefined;
        }
    };
    SiriAudioSession.prototype.handleSiriAudioFrame = function (frame) {
        var _this = this;
        if (this.state >= 2 /* CLOSING */) {
            return;
        }
        if (this.producerTimer) { // if producerTimer is defined, then this is the first frame we are receiving
            clearTimeout(this.producerTimer);
            this.producerTimer = undefined;
        }
        if (frame && this.audioFrameQueue.length < this.maxQueueSize) { // add frame to queue whilst it is not full
            this.audioFrameQueue.push(frame);
        }
        if (this.state !== 1 /* SENDING */) { // dataSend isn't open yet
            return;
        }
        var queued;
        var _loop_1 = function () {
            var packets = [];
            queued.forEach(function (frame) {
                var packetData = {
                    data: frame.data,
                    metadata: {
                        rms: new datastream_1.Float32(frame.rms),
                        sequenceNumber: new datastream_1.Int64(_this.sequenceNumber++),
                    },
                };
                packets.push(packetData);
            });
            var message = {
                packets: packets,
                streamId: new datastream_1.Int64(this_1.streamId),
                endOfStream: this_1.endOfStream,
            };
            try {
                this_1.connection.sendEvent("dataSend" /* DATA_SEND */, "data" /* DATA */, message);
            }
            catch (error) {
                debug("Error occurred when trying to send audio frame of hds connection: %s", error.message);
                this_1.stopAudioProducer();
                this_1.closed();
            }
            if (this_1.endOfStream) {
                return "break";
            }
        };
        var this_1 = this;
        while ((queued = this.popSome()) !== null) {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        }
    };
    SiriAudioSession.prototype.handleProducerError = function (error) {
        if (this.state >= 2 /* CLOSING */) {
            return;
        }
        this.stopAudioProducer(); // ensure backend is closed
        if (this.state === 1 /* SENDING */) { // if state is less than sending dataSend isn't open (yet)
            this.sendDataSendCloseEvent(error); // cancel submission
        }
    };
    SiriAudioSession.prototype.handleDataSendAckEvent = function (endOfStream) {
        assert_1.default.strictEqual(endOfStream, true);
        debug("Received acknowledgment for siri audio stream with streamId %s, closing it now", this.streamId);
        this.sendDataSendCloseEvent(0 /* NORMAL */);
    };
    SiriAudioSession.prototype.handleDataSendCloseEvent = function (reason) {
        // @ts-expect-error: forceConsistentCasingInFileNames compiler option
        debug("Received close event from controller with reason %s for stream with streamId %s", datastream_1.HDSProtocolSpecificErrorReason[reason], this.streamId);
        if (this.state <= 1 /* SENDING */) {
            this.stopAudioProducer();
        }
        this.closed();
    };
    SiriAudioSession.prototype.sendDataSendCloseEvent = function (reason) {
        (0, assert_1.default)(this.state >= 1 /* SENDING */, "state was less than SENDING");
        (0, assert_1.default)(this.state <= 2 /* CLOSING */, "state was higher than CLOSING");
        this.connection.sendEvent("dataSend" /* DATA_SEND */, "close" /* CLOSE */, {
            streamId: new datastream_1.Int64(this.streamId),
            reason: new datastream_1.Int64(reason),
        });
        this.closed();
    };
    SiriAudioSession.prototype.handleDataStreamConnectionClosed = function () {
        debug("Closing audio session with streamId %d", this.streamId);
        if (this.state <= 1 /* SENDING */) {
            this.stopAudioProducer();
        }
        this.closed();
    };
    SiriAudioSession.prototype.closed = function () {
        var lastState = this.state;
        this.state = 3 /* CLOSED */;
        if (lastState !== 3 /* CLOSED */) {
            this.emit("close" /* CLOSE */);
            this.connection.removeListener("closed" /* CLOSED */, this.closeListener);
        }
        this.removeAllListeners();
    };
    SiriAudioSession.prototype.popSome = function () {
        if (this.audioFrameQueue.length < 5 && !this.endOfStream) {
            return null;
        }
        var size = Math.min(this.audioFrameQueue.length, 5); // 5 frames per hap packet seems fine
        var result = [];
        for (var i = 0; i < size; i++) {
            var element = this.audioFrameQueue.shift(); // removes first element
            result.push(element);
        }
        return result;
    };
    return SiriAudioSession;
}(events_1.EventEmitter));
exports.SiriAudioSession = SiriAudioSession;
//# sourceMappingURL=RemoteController.js.map