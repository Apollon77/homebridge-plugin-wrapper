"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Characteristic = exports.CharacteristicEventTypes = exports.ChangeReason = exports.Access = exports.Perms = exports.Units = exports.Formats = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const events_1 = require("events");
const HAPServer_1 = require("./HAPServer");
const clone_1 = require("./util/clone");
const hapStatusError_1 = require("./util/hapStatusError");
const once_1 = require("./util/once");
const request_util_1 = require("./util/request-util");
const uuid_1 = require("./util/uuid");
const debug = (0, debug_1.default)("HAP-NodeJS:Characteristic");
/**
 * @group Characteristic
 */
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
})(Formats || (exports.Formats = Formats = {}));
/**
 * @group Characteristic
 */
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
})(Units || (exports.Units = Units = {}));
/**
 * @group Characteristic
 */
var Perms;
(function (Perms) {
    Perms["PAIRED_READ"] = "pr";
    Perms["PAIRED_WRITE"] = "pw";
    Perms["NOTIFY"] = "ev";
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    Perms["EVENTS"] = "ev";
    Perms["ADDITIONAL_AUTHORIZATION"] = "aa";
    Perms["TIMED_WRITE"] = "tw";
    Perms["HIDDEN"] = "hd";
    Perms["WRITE_RESPONSE"] = "wr";
})(Perms || (exports.Perms = Perms = {}));
/**
 * Describes the abstract access to a {@link Characteristic}.
 * It abstracts the more granular access described by {@link Perms}.
 *
 * It is used in {@link CharacteristicProps.adminOnlyAccess}.
 *
 * @group Characteristic
 */
var Access;
(function (Access) {
    Access[Access["READ"] = 0] = "READ";
    Access[Access["WRITE"] = 1] = "WRITE";
    Access[Access["NOTIFY"] = 2] = "NOTIFY";
})(Access || (exports.Access = Access = {}));
/**
 * @group Characteristic
 */
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
     * Used when HomeKit reads a value or the API user calls the deprecated method `Characteristic.getValue`.
     */
    ChangeReason["READ"] = "read";
    /**
     * Used when call to {@link Characteristic.sendEventNotification} was made.
     */
    ChangeReason["EVENT"] = "event";
})(ChangeReason || (exports.ChangeReason = ChangeReason = {}));
/**
 * @group Characteristic
 */
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
})(CharacteristicEventTypes || (exports.CharacteristicEventTypes = CharacteristicEventTypes = {}));
/**
 * @group Characteristic
 */
class ValidValuesIterable {
    props;
    constructor(props) {
        (0, assert_1.default)((0, request_util_1.isNumericFormat)(props.format), "Cannot instantiate valid values iterable when format is not numeric. Found " + props.format);
        this.props = props;
    }
    *[Symbol.iterator]() {
        if (this.props.validValues) {
            for (const value of this.props.validValues) {
                yield value;
            }
        }
        else {
            let min = 0; // default is zero for all the uint types
            let max;
            let stepValue = 1;
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
            else if ((0, request_util_1.isUnsignedNumericFormat)(this.props.format)) {
                max = (0, request_util_1.numericUpperBound)(this.props.format);
            }
            else {
                throw new Error("Could not find valid iterator strategy for props: " + JSON.stringify(this.props));
            }
            for (let i = min; i <= max; i += stepValue) {
                yield i;
            }
        }
    }
}
const numberPattern = /^-?\d+$/;
function extractHAPStatusFromError(error) {
    let errorValue = -70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */;
    if (numberPattern.test(error.message)) {
        const value = parseInt(error.message, 10);
        if ((0, HAPServer_1.IsKnownHAPStatusError)(value)) {
            errorValue = value;
        }
    }
    return errorValue;
}
function maxWithUndefined(a, b) {
    if (a == null) {
        return b;
    }
    else if (b == null) {
        return a;
    }
    else {
        return Math.max(a, b);
    }
}
function minWithUndefined(a, b) {
    if (a == null) {
        return b;
    }
    else if (b == null) {
        return a;
    }
    else {
        return Math.min(a, b);
    }
}
/**
 * Characteristic represents a particular typed variable that can be assigned to a Service. For instance, a
 * "Hue" Characteristic might store a 'float' value of type 'arcdegrees'. You could add the Hue Characteristic
 * to a {@link Service} in order to store that value. A particular Characteristic is distinguished from others by its
 * UUID. HomeKit provides a set of known Characteristic UUIDs defined in HomeKit.ts along with a
 * corresponding concrete subclass.
 *
 * You can also define custom Characteristics by providing your own UUID. Custom Characteristics can be added
 * to any native or custom Services, but Siri will likely not be able to work with these.
 *
 * @group Characteristic
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class Characteristic extends events_1.EventEmitter {
    // Pattern below is for automatic detection of the section of defined characteristics. Used by the generator
    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    /**
     * @group Characteristic Definitions
     */
    static AccessCodeControlPoint;
    /**
     * @group Characteristic Definitions
     */
    static AccessCodeSupportedConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static AccessControlLevel;
    /**
     * @group Characteristic Definitions
     */
    static AccessoryFlags;
    /**
     * @group Characteristic Definitions
     */
    static AccessoryIdentifier;
    /**
     * @group Characteristic Definitions
     */
    static Active;
    /**
     * @group Characteristic Definitions
     */
    static ActiveIdentifier;
    /**
     * @group Characteristic Definitions
     */
    static ActivityInterval;
    /**
     * @group Characteristic Definitions
     */
    static AdministratorOnlyAccess;
    /**
     * @group Characteristic Definitions
     */
    static AirParticulateDensity;
    /**
     * @group Characteristic Definitions
     */
    static AirParticulateSize;
    /**
     * @group Characteristic Definitions
     */
    static AirPlayEnable;
    /**
     * @group Characteristic Definitions
     */
    static AirQuality;
    /**
     * @group Characteristic Definitions
     */
    static AppMatchingIdentifier;
    /**
     * @group Characteristic Definitions
     */
    static AssetUpdateReadiness;
    /**
     * @group Characteristic Definitions
     */
    static AudioFeedback;
    /**
     * @group Characteristic Definitions
     */
    static BatteryLevel;
    /**
     * @group Characteristic Definitions
     */
    static Brightness;
    /**
     * @group Characteristic Definitions
     */
    static ButtonEvent;
    /**
     * @group Characteristic Definitions
     */
    static CameraOperatingModeIndicator;
    /**
     * @group Characteristic Definitions
     */
    static CarbonDioxideDetected;
    /**
     * @group Characteristic Definitions
     */
    static CarbonDioxideLevel;
    /**
     * @group Characteristic Definitions
     */
    static CarbonDioxidePeakLevel;
    /**
     * @group Characteristic Definitions
     */
    static CarbonMonoxideDetected;
    /**
     * @group Characteristic Definitions
     */
    static CarbonMonoxideLevel;
    /**
     * @group Characteristic Definitions
     */
    static CarbonMonoxidePeakLevel;
    /**
     * @group Characteristic Definitions
     */
    static CCAEnergyDetectThreshold;
    /**
     * @group Characteristic Definitions
     */
    static CCASignalDetectThreshold;
    /**
     * @group Characteristic Definitions
     */
    static CharacteristicValueActiveTransitionCount;
    /**
     * @group Characteristic Definitions
     */
    static CharacteristicValueTransitionControl;
    /**
     * @group Characteristic Definitions
     */
    static ChargingState;
    /**
     * @group Characteristic Definitions
     */
    static ClosedCaptions;
    /**
     * @group Characteristic Definitions
     */
    static ColorTemperature;
    /**
     * @group Characteristic Definitions
     */
    static ConfigurationState;
    /**
     * @group Characteristic Definitions
     */
    static ConfiguredName;
    /**
     * @group Characteristic Definitions
     */
    static ConnectionHealthMonitor;
    /**
     * @group Characteristic Definitions
     */
    static ContactSensorState;
    /**
     * @group Characteristic Definitions
     */
    static CoolingThresholdTemperature;
    /**
     * @group Characteristic Definitions
     */
    static CryptoHash;
    /**
     * @group Characteristic Definitions
     */
    static CurrentAirPurifierState;
    /**
     * @group Characteristic Definitions
     */
    static CurrentAmbientLightLevel;
    /**
     * @group Characteristic Definitions
     */
    static CurrentDoorState;
    /**
     * @group Characteristic Definitions
     */
    static CurrentFanState;
    /**
     * @group Characteristic Definitions
     */
    static CurrentHeaterCoolerState;
    /**
     * @group Characteristic Definitions
     */
    static CurrentHeatingCoolingState;
    /**
     * @group Characteristic Definitions
     */
    static CurrentHorizontalTiltAngle;
    /**
     * @group Characteristic Definitions
     */
    static CurrentHumidifierDehumidifierState;
    /**
     * @group Characteristic Definitions
     */
    static CurrentMediaState;
    /**
     * @group Characteristic Definitions
     */
    static CurrentPosition;
    /**
     * @group Characteristic Definitions
     */
    static CurrentRelativeHumidity;
    /**
     * @group Characteristic Definitions
     */
    static CurrentSlatState;
    /**
     * @group Characteristic Definitions
     */
    static CurrentTemperature;
    /**
     * @group Characteristic Definitions
     */
    static CurrentTiltAngle;
    /**
     * @group Characteristic Definitions
     */
    static CurrentTransport;
    /**
     * @group Characteristic Definitions
     */
    static CurrentVerticalTiltAngle;
    /**
     * @group Characteristic Definitions
     */
    static CurrentVisibilityState;
    /**
     * @group Characteristic Definitions
     */
    static DataStreamHAPTransport;
    /**
     * @group Characteristic Definitions
     */
    static DataStreamHAPTransportInterrupt;
    /**
     * @group Characteristic Definitions
     */
    static DiagonalFieldOfView;
    /**
     * @group Characteristic Definitions
     */
    static DigitalZoom;
    /**
     * @group Characteristic Definitions
     */
    static DisplayOrder;
    /**
     * @group Characteristic Definitions
     */
    static EventRetransmissionMaximum;
    /**
     * @group Characteristic Definitions
     */
    static EventSnapshotsActive;
    /**
     * @group Characteristic Definitions
     */
    static EventTransmissionCounters;
    /**
     * @group Characteristic Definitions
     */
    static FilterChangeIndication;
    /**
     * @group Characteristic Definitions
     */
    static FilterLifeLevel;
    /**
     * @group Characteristic Definitions
     */
    static FirmwareRevision;
    /**
     * @group Characteristic Definitions
     */
    static FirmwareUpdateProtocolList;
    /**
     * @group Characteristic Definitions
     */
    static FirmwareUpdateReadiness;
    /**
     * @group Characteristic Definitions
     */
    static FirmwareUpdateStatus;
    /**
     * @group Characteristic Definitions
     */
    static HardwareFinish;
    /**
     * @group Characteristic Definitions
     */
    static HardwareRevision;
    /**
     * @group Characteristic Definitions
     */
    static HeartBeat;
    /**
     * @group Characteristic Definitions
     */
    static HeatingThresholdTemperature;
    /**
     * @group Characteristic Definitions
     */
    static HoldPosition;
    /**
     * @group Characteristic Definitions
     */
    static HomeKitCameraActive;
    /**
     * @group Characteristic Definitions
     */
    static Hue;
    /**
     * @group Characteristic Definitions
     */
    static Identifier;
    /**
     * @group Characteristic Definitions
     */
    static Identify;
    /**
     * @group Characteristic Definitions
     */
    static ImageMirroring;
    /**
     * @group Characteristic Definitions
     */
    static ImageRotation;
    /**
     * @group Characteristic Definitions
     */
    static InputDeviceType;
    /**
     * @group Characteristic Definitions
     */
    static InputSourceType;
    /**
     * @group Characteristic Definitions
     */
    static InUse;
    /**
     * @group Characteristic Definitions
     */
    static IsConfigured;
    /**
     * @group Characteristic Definitions
     */
    static LeakDetected;
    /**
     * @group Characteristic Definitions
     */
    static ListPairings;
    /**
     * @group Characteristic Definitions
     */
    static LockControlPoint;
    /**
     * @group Characteristic Definitions
     */
    static LockCurrentState;
    /**
     * @group Characteristic Definitions
     */
    static LockLastKnownAction;
    /**
     * @group Characteristic Definitions
     */
    static LockManagementAutoSecurityTimeout;
    /**
     * @group Characteristic Definitions
     */
    static LockPhysicalControls;
    /**
     * @group Characteristic Definitions
     */
    static LockTargetState;
    /**
     * @group Characteristic Definitions
     */
    static Logs;
    /**
     * @group Characteristic Definitions
     */
    static MACRetransmissionMaximum;
    /**
     * @group Characteristic Definitions
     */
    static MACTransmissionCounters;
    /**
     * @group Characteristic Definitions
     */
    static ManagedNetworkEnable;
    /**
     * @group Characteristic Definitions
     */
    static ManuallyDisabled;
    /**
     * @group Characteristic Definitions
     */
    static Manufacturer;
    /**
     * @group Characteristic Definitions
     */
    static MatterFirmwareRevisionNumber;
    /**
     * @group Characteristic Definitions
     */
    static MatterFirmwareUpdateStatus;
    /**
     * @group Characteristic Definitions
     */
    static MaximumTransmitPower;
    /**
     * @group Characteristic Definitions
     */
    static MediaAccessControlLevel;
    /**
     * @group Characteristic Definitions
     */
    static MetricsBufferFullState;
    /**
     * @group Characteristic Definitions
     */
    static Model;
    /**
     * @group Characteristic Definitions
     */
    static MotionDetected;
    /**
     * @group Characteristic Definitions
     */
    static MultifunctionButton;
    /**
     * @group Characteristic Definitions
     */
    static Mute;
    /**
     * @group Characteristic Definitions
     */
    static Name;
    /**
     * @group Characteristic Definitions
     */
    static NetworkAccessViolationControl;
    /**
     * @group Characteristic Definitions
     */
    static NetworkClientProfileControl;
    /**
     * @group Characteristic Definitions
     */
    static NetworkClientStatusControl;
    /**
     * @group Characteristic Definitions
     */
    static NFCAccessControlPoint;
    /**
     * @group Characteristic Definitions
     */
    static NFCAccessSupportedConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static NightVision;
    /**
     * @group Characteristic Definitions
     */
    static NitrogenDioxideDensity;
    /**
     * @group Characteristic Definitions
     */
    static ObstructionDetected;
    /**
     * @group Characteristic Definitions
     */
    static OccupancyDetected;
    /**
     * @group Characteristic Definitions
     */
    static On;
    /**
     * @group Characteristic Definitions
     */
    static OperatingStateResponse;
    /**
     * @group Characteristic Definitions
     */
    static OpticalZoom;
    /**
     * @group Characteristic Definitions
     */
    static OutletInUse;
    /**
     * @group Characteristic Definitions
     */
    static OzoneDensity;
    /**
     * @group Characteristic Definitions
     */
    static PairingFeatures;
    /**
     * @group Characteristic Definitions
     */
    static PairSetup;
    /**
     * @group Characteristic Definitions
     */
    static PairVerify;
    /**
     * @group Characteristic Definitions
     */
    static PasswordSetting;
    /**
     * @group Characteristic Definitions
     */
    static PeriodicSnapshotsActive;
    /**
     * @group Characteristic Definitions
     */
    static PictureMode;
    /**
     * @group Characteristic Definitions
     */
    static Ping;
    /**
     * @group Characteristic Definitions
     */
    static PM10Density;
    /**
     * @group Characteristic Definitions
     */
    static PM2_5Density;
    /**
     * @group Characteristic Definitions
     */
    static PositionState;
    /**
     * @group Characteristic Definitions
     */
    static PowerModeSelection;
    /**
     * @group Characteristic Definitions
     */
    static PreferredWiFiList;
    /**
     * @group Characteristic Definitions
     */
    static ProductData;
    /**
     * @group Characteristic Definitions
     */
    static ProgrammableSwitchEvent;
    /**
     * @group Characteristic Definitions
     */
    static ProgrammableSwitchOutputState;
    /**
     * @group Characteristic Definitions
     */
    static ProgramMode;
    /**
     * @group Characteristic Definitions
     */
    static ReceivedSignalStrengthIndication;
    /**
     * @group Characteristic Definitions
     */
    static ReceiverSensitivity;
    /**
     * @group Characteristic Definitions
     */
    static RecordingAudioActive;
    /**
     * @group Characteristic Definitions
     */
    static RelativeHumidityDehumidifierThreshold;
    /**
     * @group Characteristic Definitions
     */
    static RelativeHumidityHumidifierThreshold;
    /**
     * @group Characteristic Definitions
     * @deprecated Removed
     */
    static RelayControlPoint;
    /**
     * @group Characteristic Definitions
     * @deprecated Removed
     */
    static RelayEnabled;
    /**
     * @group Characteristic Definitions
     * @deprecated Removed
     */
    static RelayState;
    /**
     * @group Characteristic Definitions
     */
    static RemainingDuration;
    /**
     * @group Characteristic Definitions
     */
    static RemoteKey;
    /**
     * @group Characteristic Definitions
     */
    static ResetFilterIndication;
    /**
     * @group Characteristic Definitions
     */
    static RotationDirection;
    /**
     * @group Characteristic Definitions
     */
    static RotationSpeed;
    /**
     * @group Characteristic Definitions
     */
    static RouterStatus;
    /**
     * @group Characteristic Definitions
     */
    static Saturation;
    /**
     * @group Characteristic Definitions
     */
    static SecuritySystemAlarmType;
    /**
     * @group Characteristic Definitions
     */
    static SecuritySystemCurrentState;
    /**
     * @group Characteristic Definitions
     */
    static SecuritySystemTargetState;
    /**
     * @group Characteristic Definitions
     */
    static SelectedAudioStreamConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SelectedCameraRecordingConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SelectedDiagnosticsModes;
    /**
     * @group Characteristic Definitions
     */
    static SelectedRTPStreamConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SelectedSessionKeepaliveConfigurationList;
    /**
     * @group Characteristic Definitions
     */
    static SelectedSleepConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SerialNumber;
    /**
     * @group Characteristic Definitions
     */
    static ServiceLabelIndex;
    /**
     * @group Characteristic Definitions
     */
    static ServiceLabelNamespace;
    /**
     * @group Characteristic Definitions
     */
    static SetDuration;
    /**
     * @group Characteristic Definitions
     */
    static SetupDataStreamTransport;
    /**
     * @group Characteristic Definitions
     */
    static SetupEndpoints;
    /**
     * @group Characteristic Definitions
     */
    static SetupTransferTransport;
    /**
     * @group Characteristic Definitions
     */
    static SignalToNoiseRatio;
    /**
     * @group Characteristic Definitions
     */
    static SiriEnable;
    /**
     * @group Characteristic Definitions
     */
    static SiriEndpointSessionStatus;
    /**
     * @group Characteristic Definitions
     */
    static SiriEngineVersion;
    /**
     * @group Characteristic Definitions
     */
    static SiriInputType;
    /**
     * @group Characteristic Definitions
     */
    static SiriLightOnUse;
    /**
     * @group Characteristic Definitions
     */
    static SiriListening;
    /**
     * @group Characteristic Definitions
     */
    static SiriTouchToUse;
    /**
     * @group Characteristic Definitions
     */
    static SlatType;
    /**
     * @group Characteristic Definitions
     */
    static SleepDiscoveryMode;
    /**
     * @group Characteristic Definitions
     */
    static SleepInterval;
    /**
     * @group Characteristic Definitions
     */
    static SmokeDetected;
    /**
     * @group Characteristic Definitions
     */
    static SoftwareRevision;
    /**
     * @group Characteristic Definitions
     */
    static StagedFirmwareVersion;
    /**
     * @group Characteristic Definitions
     */
    static StatusActive;
    /**
     * @group Characteristic Definitions
     */
    static StatusFault;
    /**
     * @group Characteristic Definitions
     */
    static StatusJammed;
    /**
     * @group Characteristic Definitions
     */
    static StatusLowBattery;
    /**
     * @group Characteristic Definitions
     */
    static StatusTampered;
    /**
     * @group Characteristic Definitions
     */
    static StreamingStatus;
    /**
     * @group Characteristic Definitions
     */
    static SulphurDioxideDensity;
    /**
     * @group Characteristic Definitions
     */
    static SupportedAssetTypes;
    /**
     * @group Characteristic Definitions
     */
    static SupportedAudioRecordingConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SupportedAudioStreamConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SupportedCameraRecordingConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SupportedCharacteristicValueTransitionConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SupportedDataStreamTransportConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SupportedDiagnosticsModes;
    /**
     * @group Characteristic Definitions
     */
    static SupportedDiagnosticsSnapshot;
    /**
     * @group Characteristic Definitions
     */
    static SupportedFirmwareUpdateConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SupportedMetrics;
    /**
     * @group Characteristic Definitions
     */
    static SupportedRouterConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SupportedRTPConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SupportedSessionKeepaliveConfigurationList;
    /**
     * @group Characteristic Definitions
     */
    static SupportedSleepConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SupportedTransferTransportConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SupportedVideoRecordingConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SupportedVideoStreamConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static SwingMode;
    /**
     * @group Characteristic Definitions
     * @deprecated Removed
     */
    static TapType;
    /**
     * @group Characteristic Definitions
     */
    static TargetAirPurifierState;
    /**
     * @group Characteristic Definitions
     */
    static TargetControlList;
    /**
     * @group Characteristic Definitions
     */
    static TargetControlSupportedConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static TargetDoorState;
    /**
     * @group Characteristic Definitions
     */
    static TargetFanState;
    /**
     * @group Characteristic Definitions
     */
    static TargetHeaterCoolerState;
    /**
     * @group Characteristic Definitions
     */
    static TargetHeatingCoolingState;
    /**
     * @group Characteristic Definitions
     */
    static TargetHorizontalTiltAngle;
    /**
     * @group Characteristic Definitions
     */
    static TargetHumidifierDehumidifierState;
    /**
     * @group Characteristic Definitions
     */
    static TargetMediaState;
    /**
     * @group Characteristic Definitions
     */
    static TargetPosition;
    /**
     * @group Characteristic Definitions
     */
    static TargetRelativeHumidity;
    /**
     * @group Characteristic Definitions
     */
    static TargetTemperature;
    /**
     * @group Characteristic Definitions
     */
    static TargetTiltAngle;
    /**
     * @group Characteristic Definitions
     */
    static TargetVerticalTiltAngle;
    /**
     * @group Characteristic Definitions
     */
    static TargetVisibilityState;
    /**
     * @group Characteristic Definitions
     */
    static TemperatureDisplayUnits;
    /**
     * @group Characteristic Definitions
     */
    static ThirdPartyCameraActive;
    /**
     * @group Characteristic Definitions
     */
    static ThreadControlPoint;
    /**
     * @group Characteristic Definitions
     */
    static ThreadNodeCapabilities;
    /**
     * @group Characteristic Definitions
     */
    static ThreadOpenThreadVersion;
    /**
     * @group Characteristic Definitions
     */
    static ThreadStatus;
    /**
     * @group Characteristic Definitions
     * @deprecated Removed
     */
    static Token;
    /**
     * @group Characteristic Definitions
     */
    static TransmitPower;
    /**
     * @group Characteristic Definitions
     * @deprecated Removed
     */
    static TunnelConnectionTimeout;
    /**
     * @group Characteristic Definitions
     * @deprecated Removed
     */
    static TunneledAccessoryAdvertising;
    /**
     * @group Characteristic Definitions
     * @deprecated Removed
     */
    static TunneledAccessoryConnected;
    /**
     * @group Characteristic Definitions
     * @deprecated Removed
     */
    static TunneledAccessoryStateNumber;
    /**
     * @group Characteristic Definitions
     */
    static ValveType;
    /**
     * @group Characteristic Definitions
     */
    static Version;
    /**
     * @group Characteristic Definitions
     */
    static VideoAnalysisActive;
    /**
     * @group Characteristic Definitions
     */
    static VOCDensity;
    /**
     * @group Characteristic Definitions
     */
    static Volume;
    /**
     * @group Characteristic Definitions
     */
    static VolumeControlType;
    /**
     * @group Characteristic Definitions
     */
    static VolumeSelector;
    /**
     * @group Characteristic Definitions
     */
    static WakeConfiguration;
    /**
     * @group Characteristic Definitions
     */
    static WANConfigurationList;
    /**
     * @group Characteristic Definitions
     */
    static WANStatusList;
    /**
     * @group Characteristic Definitions
     */
    static WaterLevel;
    /**
     * @group Characteristic Definitions
     */
    static WiFiCapabilities;
    /**
     * @group Characteristic Definitions
     */
    static WiFiConfigurationControl;
    /**
     * @group Characteristic Definitions
     */
    static WiFiSatelliteStatus;
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // NOTICE: when adding/changing properties, remember to possibly adjust the serialize/deserialize functions
    displayName;
    UUID;
    iid = null;
    value = null;
    /**
     * @private
     */
    statusCode = 0 /* HAPStatus.SUCCESS */;
    props;
    /**
     * The {@link Characteristic.onGet} handler
     */
    getHandler;
    /**
     * The {@link Characteristic.onSet} handler
     */
    setHandler;
    subscriptions = 0;
    /**
     * @private
     */
    additionalAuthorizationHandler;
    constructor(displayName, UUID, props) {
        super();
        this.displayName = displayName;
        this.UUID = UUID;
        this.props = {
            format: "int" /* Formats.INT */,
            perms: ["ev" /* Perms.NOTIFY */],
        };
        this.setProps(props || {}); // ensure sanity checks are called
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
    onGet(handler) {
        if (typeof handler !== "function") {
            this.characteristicWarning(".onGet handler must be a function");
            return this;
        }
        this.getHandler = handler;
        return this;
    }
    /**
     * Removes the {@link CharacteristicGetHandler} handler which was configured using {@link onGet}.
     */
    removeOnGet() {
        this.getHandler = undefined;
        return this;
    }
    /**
     * Accepts a function that will be called when setting the value of a Characteristic.
     * If the characteristic supports {@link Perms.WRITE_RESPONSE} and the request requests a write-response value,
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
    onSet(handler) {
        if (typeof handler !== "function") {
            this.characteristicWarning(".onSet handler must be a function");
            return this;
        }
        this.setHandler = handler;
        return this;
    }
    /**
     * Removes the {@link CharacteristicSetHandler} which was configured using {@link onSet}.
     */
    removeOnSet() {
        this.setHandler = undefined;
        return this;
    }
    /**
     * Updates the properties of this characteristic.
     * Properties passed via the parameter will be set. Any parameter set to null will be deleted.
     * See {@link CharacteristicProps}.
     *
     * @param props - Partial properties object with the desired updates.
     */
    setProps(props) {
        (0, assert_1.default)(props, "props cannot be undefined when setting props");
        // TODO calling setProps after publish doesn't lead to a increment in the current configuration number
        let formatDidChange = false;
        // for every value "null" can be used to reset props, except for required props
        if (props.format) {
            formatDidChange = this.props.format !== props.format;
            this.props.format = props.format;
        }
        if (props.perms) {
            (0, assert_1.default)(props.perms.length > 0, "characteristic prop perms cannot be empty array");
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
            else if (!(0, request_util_1.isNumericFormat)(this.props.format)) {
                this.characteristicWarning("Characteristic Property 'minValue' can only be set for characteristics with numeric format, but not for " + this.props.format, "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */);
                props.minValue = undefined;
            }
            else if (typeof props.minValue !== "number" || !Number.isFinite(props.minValue)) {
                this.characteristicWarning(`Characteristic Property 'minValue' must be a finite number, received "${props.minValue}" (${typeof props.minValue})`, "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */);
                props.minValue = undefined;
            }
            else {
                if (props.minValue < (0, request_util_1.numericLowerBound)(this.props.format)) {
                    this.characteristicWarning("Characteristic Property 'minValue' was set to " + props.minValue + ", but for numeric format " +
                        this.props.format + " minimum possible is " + (0, request_util_1.numericLowerBound)(this.props.format), "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */);
                    props.minValue = (0, request_util_1.numericLowerBound)(this.props.format);
                }
                else if (props.minValue > (0, request_util_1.numericUpperBound)(this.props.format)) {
                    this.characteristicWarning("Characteristic Property 'minValue' was set to " + props.minValue + ", but for numeric format " +
                        this.props.format + " maximum possible is " + (0, request_util_1.numericUpperBound)(this.props.format), "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */);
                    props.minValue = (0, request_util_1.numericLowerBound)(this.props.format);
                }
            }
            this.props.minValue = props.minValue;
        }
        // check maxValue is valid for the format type
        if (props.maxValue !== undefined) {
            if (props.maxValue === null) {
                props.maxValue = undefined;
            }
            else if (!(0, request_util_1.isNumericFormat)(this.props.format)) {
                this.characteristicWarning("Characteristic Property 'maxValue' can only be set for characteristics with numeric format, but not for " + this.props.format, "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */);
                props.maxValue = undefined;
            }
            else if (typeof props.maxValue !== "number" || !Number.isFinite(props.maxValue)) {
                this.characteristicWarning(`Characteristic Property 'maxValue' must be a finite number, received "${props.maxValue}" (${typeof props.maxValue})`, "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */);
                props.maxValue = undefined;
            }
            else {
                if (props.maxValue > (0, request_util_1.numericUpperBound)(this.props.format)) {
                    this.characteristicWarning("Characteristic Property 'maxValue' was set to " + props.maxValue + ", but for numeric format " +
                        this.props.format + " maximum possible is " + (0, request_util_1.numericUpperBound)(this.props.format), "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */);
                    props.maxValue = (0, request_util_1.numericUpperBound)(this.props.format);
                }
                else if (props.maxValue < (0, request_util_1.numericLowerBound)(this.props.format)) {
                    this.characteristicWarning("Characteristic Property 'maxValue' was set to " + props.maxValue + ", but for numeric format " +
                        this.props.format + " minimum possible is " + (0, request_util_1.numericLowerBound)(this.props.format), "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */);
                    props.maxValue = (0, request_util_1.numericUpperBound)(this.props.format);
                }
            }
            this.props.maxValue = props.maxValue;
        }
        if (props.minStep !== undefined) {
            if (props.minStep === null) {
                this.props.minStep = undefined;
            }
            else if (!(0, request_util_1.isNumericFormat)(this.props.format)) {
                this.characteristicWarning("Characteristic Property `minStep` can only be set for characteristics with numeric format, but not for " + this.props.format, "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */);
            }
            else {
                if (props.minStep < 1 && (0, request_util_1.isIntegerNumericFormat)(this.props.format)) {
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
            else if (this.props.format !== "string" /* Formats.STRING */) {
                this.characteristicWarning("Characteristic Property `maxLen` can only be set for characteristics with format `STRING`, but not for " + this.props.format, "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */);
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
            else if (this.props.format !== "data" /* Formats.DATA */) {
                this.characteristicWarning("Characteristic Property `maxDataLen` can only be set for characteristics with format `DATA`, but not for " + this.props.format, "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */);
            }
            else {
                this.props.maxDataLen = props.maxDataLen;
            }
        }
        if (props.validValues !== undefined) {
            if (props.validValues === null) {
                this.props.validValues = undefined;
            }
            else if (!(0, request_util_1.isNumericFormat)(this.props.format)) {
                this.characteristicWarning("Characteristic Property `validValues` was supplied for non numeric format " + this.props.format);
            }
            else {
                (0, assert_1.default)(props.validValues.length, "characteristic prop validValues cannot be empty array");
                this.props.validValues = props.validValues;
            }
        }
        if (props.validValueRanges !== undefined) {
            if (props.validValueRanges === null) {
                this.props.validValueRanges = undefined;
            }
            else if (!(0, request_util_1.isNumericFormat)(this.props.format)) {
                this.characteristicWarning("Characteristic Property `validValueRanges` was supplied for non numeric format " + this.props.format);
            }
            else {
                (0, assert_1.default)(props.validValueRanges.length === 2, "characteristic prop validValueRanges must have a length of 2");
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
        if (((0, request_util_1.isNumericFormat)(this.props.format) || this.props.format === "string" /* Formats.STRING */)
            && this.value != null
            && !formatDidChange
            && this.statusCode === 0 /* HAPStatus.SUCCESS */
            && this.UUID !== Characteristic.ProgrammableSwitchEvent.UUID) {
            // explaining the if statement above:
            // - We only do a check for numeric and string formats as they are the only ones affected by characteristic property restrictions.
            // - There must be a value to begin with. Otherwise, it should just stay not having a value at all (anything else is guess work).
            // - If the format is changed through `setProps` we rely on the user to supply a valid value after the `setProps` call!
            // - If the characteristic is marked as erroneous the value is not considered valid anyway, and we must not remove the `statusCode`.
            // - Special case for `ProgrammableSwitchEvent` where every change in value is considered an event which would result in ghost button presses
            // validateUserInput when called from setProps is intended to clamp value withing allowed range. It is why warnings should not be displayed.
            const correctedValue = this.validateUserInput(this.value, "debug-message" /* CharacteristicWarningType.DEBUG_MESSAGE */);
            if (correctedValue !== this.value) {
                // we don't want to emit a CHANGE event if the value didn't change at all!
                this.updateValue(correctedValue);
            }
        }
        return this;
    }
    /**
     * This method can be used to gain an Iterator to loop over all valid values defined for this characteristic.
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
    validValuesIterator() {
        return new ValidValuesIterable(this.props);
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * This method can be used to set up additional authorization for a characteristic.
     * For one, it adds the {@link Perms.ADDITIONAL_AUTHORIZATION} permission to the characteristic
     * (if it wasn't already) to signal support for additional authorization to HomeKit.
     * Additionally, an {@link AdditionalAuthorizationHandler} is set up which is called
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
    setupAdditionalAuthorization(handler) {
        if (!this.props.perms.includes("aa" /* Perms.ADDITIONAL_AUTHORIZATION */)) {
            this.props.perms.push("aa" /* Perms.ADDITIONAL_AUTHORIZATION */);
        }
        this.additionalAuthorizationHandler = handler;
    }
    setValue(value, callback, context) {
        if (value instanceof Error) {
            this.statusCode = value instanceof hapStatusError_1.HapStatusError ? value.hapStatus : extractHAPStatusFromError(value);
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
            this.characteristicWarning(error?.message || "Unknown error", "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */, error?.stack);
            if (callback) {
                callback(error);
            }
            return this;
        }
        this.handleSetRequest(value, undefined, context).then(value => {
            if (callback) {
                if (value) { // possible write response
                    callback(null, value);
                }
                else {
                    callback(null);
                }
            }
        }, reason => {
            if (callback) {
                callback(reason);
            }
        });
        return this;
    }
    updateValue(value, callback, context) {
        if (value instanceof Error) {
            this.statusCode = value instanceof hapStatusError_1.HapStatusError ? value.hapStatus : extractHAPStatusFromError(value);
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
            this.characteristicWarning(error?.message || "Unknown error", "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */, error?.stack);
            if (callback) {
                callback();
            }
            return this;
        }
        this.statusCode = 0 /* HAPStatus.SUCCESS */;
        const oldValue = this.value;
        this.value = value;
        if (callback) {
            callback();
        }
        this.emit("change" /* CharacteristicEventTypes.CHANGE */, { originator: undefined, oldValue: oldValue, newValue: value, reason: "update" /* ChangeReason.UPDATE */, context: context });
        return this; // for chaining
    }
    /**
     * This method acts similarly to {@link updateValue} by setting the current value of the characteristic
     * without calling any {@link CharacteristicEventTypes.SET} or {@link onSet} handlers.
     * The difference is that this method forces an event notification sent (updateValue only sends one if the value changed).
     * This is especially useful for characteristics like {@link Characteristic.ButtonEvent} or {@link Characteristic.ProgrammableSwitchEvent}.
     *
     * @param value - The new value.
     * @param context - Passed to the {@link CharacteristicEventTypes.CHANGE} event handler.
     */
    sendEventNotification(value, context) {
        this.statusCode = 0 /* HAPStatus.SUCCESS */;
        value = this.validateUserInput(value);
        const oldValue = this.value;
        this.value = value;
        this.emit("change" /* CharacteristicEventTypes.CHANGE */, { originator: undefined, oldValue: oldValue, newValue: value, reason: "event" /* ChangeReason.EVENT */, context: context });
        return this; // for chaining
    }
    /**
     * Called when a HAP requests wants to know the current value of the characteristic.
     *
     * @param connection - The HAP connection from which the request originated from.
     * @param context - Deprecated parameter. There for backwards compatibility.
     * @private Used by the Accessory to load the characteristic value
     */
    async handleGetRequest(connection, context) {
        if (!this.props.perms.includes("pr" /* Perms.PAIRED_READ */)) { // check if we are allowed to read from this characteristic
            throw -70405 /* HAPStatus.WRITE_ONLY_CHARACTERISTIC */;
        }
        if (this.UUID === Characteristic.ProgrammableSwitchEvent.UUID) {
            // special workaround for event only programmable switch event, which must always return null
            return null;
        }
        if (this.getHandler) {
            if (this.listeners("get" /* CharacteristicEventTypes.GET */).length > 0) {
                this.characteristicWarning("Ignoring on('get') handler as onGet handler was defined instead");
            }
            try {
                let value = await this.getHandler(context, connection);
                this.statusCode = 0 /* HAPStatus.SUCCESS */;
                try {
                    value = this.validateUserInput(value);
                }
                catch (error) {
                    this.characteristicWarning(`An illegal value was supplied by the read handler for characteristic: ${error?.message}`, "warn-message" /* CharacteristicWarningType.WARN_MESSAGE */, error?.stack);
                    this.statusCode = -70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */;
                    return Promise.reject(-70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
                }
                const oldValue = this.value;
                this.value = value;
                if (oldValue !== value) { // emit a change event if necessary
                    this.emit("change" /* CharacteristicEventTypes.CHANGE */, { originator: connection, oldValue: oldValue, newValue: value, reason: "read" /* ChangeReason.READ */, context: context });
                }
                return value;
            }
            catch (error) {
                if (typeof error === "number") {
                    const hapStatusError = new hapStatusError_1.HapStatusError(error);
                    this.statusCode = hapStatusError.hapStatus;
                }
                else if (error instanceof hapStatusError_1.HapStatusError) {
                    this.statusCode = error.hapStatus;
                }
                else {
                    this.characteristicWarning(`Unhandled error thrown inside read handler for characteristic: ${error?.message}`, "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */, error?.stack);
                    this.statusCode = -70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */;
                }
                throw this.statusCode;
            }
        }
        if (this.listeners("get" /* CharacteristicEventTypes.GET */).length === 0) {
            if (this.statusCode) {
                throw this.statusCode;
            }
            try {
                return this.validateUserInput(this.value);
            }
            catch (error) {
                this.characteristicWarning(`An illegal value was supplied by setting \`value\` for characteristic: ${error?.message}`, "warn-message" /* CharacteristicWarningType.WARN_MESSAGE */, error?.stack);
                return Promise.reject(-70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
            }
        }
        return new Promise((resolve, reject) => {
            try {
                this.emit("get" /* CharacteristicEventTypes.GET */, (0, once_1.once)((status, value) => {
                    if (status) {
                        if (typeof status === "number") {
                            const hapStatusError = new hapStatusError_1.HapStatusError(status);
                            this.statusCode = hapStatusError.hapStatus;
                        }
                        else if (status instanceof hapStatusError_1.HapStatusError) {
                            this.statusCode = status.hapStatus;
                        }
                        else {
                            debug("[%s] Received error from get handler %s", this.displayName, status.stack);
                            this.statusCode = extractHAPStatusFromError(status);
                        }
                        reject(this.statusCode);
                        return;
                    }
                    this.statusCode = 0 /* HAPStatus.SUCCESS */;
                    value = this.validateUserInput(value);
                    const oldValue = this.value;
                    this.value = value;
                    resolve(value);
                    if (oldValue !== value) { // emit a change event if necessary
                        this.emit("change" /* CharacteristicEventTypes.CHANGE */, { originator: connection, oldValue: oldValue, newValue: value, reason: "read" /* ChangeReason.READ */, context: context });
                    }
                }), context, connection);
            }
            catch (error) {
                this.characteristicWarning(`Unhandled error thrown inside read handler for characteristic: ${error?.message}`, "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */, error?.stack);
                this.statusCode = -70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */;
                reject(-70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
            }
        });
    }
    /**
     * Called when a HAP requests update the current value of the characteristic.
     *
     * @param value - The updated value
     * @param connection - The connection from which the request originated from
     * @param context - Deprecated parameter. There for backwards compatibility.
     * @returns Promise resolve to void in normal operation. When characteristic supports write-response, HAP
     *  requests a write-response and the set handler returns a write-response value, the respective
     *  write response value is resolved.
     * @private
     */
    async handleSetRequest(value, connection, context) {
        this.statusCode = 0 /* HAPStatus.SUCCESS */;
        if (connection !== undefined) {
            // if connection is undefined, the set "request" comes from the setValue method.
            // for setValue a value of "null" is allowed and checked via validateUserInput.
            try {
                value = this.validateClientSuppliedValue(value);
            }
            catch (e) {
                debug(`[${this.displayName}]`, e.message);
                return Promise.reject(-70410 /* HAPStatus.INVALID_VALUE_IN_REQUEST */);
            }
        }
        const oldValue = this.value;
        if (this.setHandler) {
            if (this.listeners("set" /* CharacteristicEventTypes.SET */).length > 0) {
                this.characteristicWarning("Ignoring on('set') handler as onSet handler was defined instead");
            }
            try {
                const writeResponse = await this.setHandler(value, context, connection);
                this.statusCode = 0 /* HAPStatus.SUCCESS */;
                if (writeResponse != null && this.props.perms.includes("wr" /* Perms.WRITE_RESPONSE */)) {
                    this.value = this.validateUserInput(writeResponse);
                    return this.value;
                }
                else {
                    if (writeResponse != null) {
                        this.characteristicWarning("SET handler returned write response value, though the characteristic doesn't support write response", "debug-message" /* CharacteristicWarningType.DEBUG_MESSAGE */);
                    }
                    this.value = value;
                    this.emit("change" /* CharacteristicEventTypes.CHANGE */, { originator: connection, oldValue: oldValue, newValue: value, reason: "write" /* ChangeReason.WRITE */, context: context });
                    return;
                }
            }
            catch (error) {
                if (typeof error === "number") {
                    const hapStatusError = new hapStatusError_1.HapStatusError(error);
                    this.statusCode = hapStatusError.hapStatus;
                }
                else if (error instanceof hapStatusError_1.HapStatusError) {
                    this.statusCode = error.hapStatus;
                }
                else {
                    this.characteristicWarning(`Unhandled error thrown inside write handler for characteristic: ${error?.message}`, "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */, error?.stack);
                    this.statusCode = -70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */;
                }
                throw this.statusCode;
            }
        }
        if (this.listeners("set" /* CharacteristicEventTypes.SET */).length === 0) {
            this.value = value;
            this.emit("change" /* CharacteristicEventTypes.CHANGE */, { originator: connection, oldValue: oldValue, newValue: value, reason: "write" /* ChangeReason.WRITE */, context: context });
            return Promise.resolve();
        }
        else {
            return new Promise((resolve, reject) => {
                try {
                    this.emit("set" /* CharacteristicEventTypes.SET */, value, (0, once_1.once)((status, writeResponse) => {
                        if (status) {
                            if (typeof status === "number") {
                                const hapStatusError = new hapStatusError_1.HapStatusError(status);
                                this.statusCode = hapStatusError.hapStatus;
                            }
                            else if (status instanceof hapStatusError_1.HapStatusError) {
                                this.statusCode = status.hapStatus;
                            }
                            else {
                                debug("[%s] Received error from set handler %s", this.displayName, status.stack);
                                this.statusCode = extractHAPStatusFromError(status);
                            }
                            reject(this.statusCode);
                            return;
                        }
                        this.statusCode = 0 /* HAPStatus.SUCCESS */;
                        if (writeResponse != null && this.props.perms.includes("wr" /* Perms.WRITE_RESPONSE */)) {
                            // support write response simply by letting the implementor pass the response as second argument to the callback
                            this.value = this.validateUserInput(writeResponse);
                            resolve(this.value);
                        }
                        else {
                            if (writeResponse != null) {
                                this.characteristicWarning("SET handler returned write response value, though the characteristic doesn't support write response", "debug-message" /* CharacteristicWarningType.DEBUG_MESSAGE */);
                            }
                            this.value = value;
                            resolve();
                            this.emit("change" /* CharacteristicEventTypes.CHANGE */, { originator: connection, oldValue: oldValue, newValue: value, reason: "write" /* ChangeReason.WRITE */, context: context });
                        }
                    }), context, connection);
                }
                catch (error) {
                    this.characteristicWarning(`Unhandled error thrown inside write handler for characteristic: ${error?.message}`, "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */, error?.stack);
                    this.statusCode = -70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */;
                    reject(-70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */);
                }
            });
        }
    }
    /**
     * Called once a HomeKit controller subscribes to events of this characteristic.
     * @private
     */
    subscribe() {
        if (this.subscriptions === 0) {
            this.emit("subscribe" /* CharacteristicEventTypes.SUBSCRIBE */);
        }
        this.subscriptions++;
    }
    /**
     * Called once a HomeKit controller unsubscribe to events of this characteristic or a HomeKit controller
     * which was subscribed to this characteristic disconnects.
     * @private
     */
    unsubscribe() {
        const wasOne = this.subscriptions === 1;
        this.subscriptions--;
        this.subscriptions = Math.max(this.subscriptions, 0);
        if (wasOne) {
            this.emit("unsubscribe" /* CharacteristicEventTypes.UNSUBSCRIBE */);
        }
    }
    getDefaultValue() {
        // noinspection JSDeprecatedSymbols
        switch (this.props.format) {
            case "bool" /* Formats.BOOL */:
                return false;
            case "string" /* Formats.STRING */:
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
            case "data" /* Formats.DATA */:
                return ""; // who knows!
            case "tlv8" /* Formats.TLV8 */:
                return ""; // who knows!
            case "int" /* Formats.INT */:
            case "float" /* Formats.FLOAT */:
            case "uint8" /* Formats.UINT8 */:
            case "uint16" /* Formats.UINT16 */:
            case "uint32" /* Formats.UINT32 */:
            case "uint64" /* Formats.UINT64 */:
                switch (this.UUID) {
                    case Characteristic.CurrentTemperature.UUID:
                        return 0; // some existing integrations expect this to be 0 by default
                    default: {
                        if (this.props.validValues?.length && typeof this.props.validValues[0] === "number") {
                            return this.props.validValues[0];
                        }
                        if (typeof this.props.minValue === "number" && Number.isFinite(this.props.minValue)) {
                            return this.props.minValue;
                        }
                        return 0;
                    }
                }
            default:
                return 0;
        }
    }
    /**
     * Checks if the value received from the HAP request is valid.
     * If returned false the received value is not valid and {@link HAPStatus.INVALID_VALUE_IN_REQUEST}
     * must be returned.
     * @param value - Value supplied by the HomeKit controller
     */
    validateClientSuppliedValue(value) {
        if (value == null) {
            throw new Error(`Client supplied invalid value for ${this.props.format}: ${value}`);
        }
        switch (this.props.format) {
            case "bool" /* Formats.BOOL */: {
                if (typeof value === "boolean") {
                    return value;
                }
                if (typeof value === "number" && (value === 1 || value === 0)) {
                    return Boolean(value);
                }
                throw new Error(`Client supplied invalid type for ${this.props.format}: "${value}" (${typeof value})`);
            }
            case "int" /* Formats.INT */:
            case "float" /* Formats.FLOAT */:
            case "uint8" /* Formats.UINT8 */:
            case "uint16" /* Formats.UINT16 */:
            case "uint32" /* Formats.UINT32 */:
            case "uint64" /* Formats.UINT64 */: {
                if (typeof value === "boolean") {
                    value = value ? 1 : 0;
                }
                if (typeof value !== "number" || !Number.isFinite(value)) {
                    throw new Error(`Client supplied invalid type for ${this.props.format}: "${value}" (${typeof value})`);
                }
                const numericMin = maxWithUndefined(this.props.minValue, (0, request_util_1.numericLowerBound)(this.props.format));
                const numericMax = minWithUndefined(this.props.maxValue, (0, request_util_1.numericUpperBound)(this.props.format));
                if (typeof numericMin === "number" && value < numericMin) {
                    throw new Error(`Client supplied value of ${value} is less than the minimum allowed value of ${numericMin}`);
                }
                if (typeof numericMax === "number" && value > numericMax) {
                    throw new Error(`Client supplied value of ${value} is greater than the maximum allowed value of ${numericMax}`);
                }
                if (this.props.validValues && !this.props.validValues.includes(value)) {
                    throw new Error(`Client supplied value of ${value} is not in ${this.props.validValues.toString()}`);
                }
                if (this.props.validValueRanges && this.props.validValueRanges.length === 2) {
                    if (value < this.props.validValueRanges[0]) {
                        throw new Error(`Client supplied value of ${value} is less than the minimum allowed value of ${this.props.validValueRanges[0]}`);
                    }
                    if (value > this.props.validValueRanges[1]) {
                        throw new Error(`Client supplied value of ${value} is greater than the maximum allowed value of ${this.props.validValueRanges[1]}`);
                    }
                }
                return value;
            }
            case "string" /* Formats.STRING */: {
                if (typeof value !== "string") {
                    throw new Error(`Client supplied invalid type for ${this.props.format}: "${value}" (${typeof value})`);
                }
                const maxLength = this.props.maxLen != null ? this.props.maxLen : 64; // default is 64; max is 256 which is set in setProps
                if (value.length > maxLength) {
                    throw new Error(`Client supplied value length of ${value.length} exceeds maximum length allowed of ${maxLength}`);
                }
                return value;
            }
            case "data" /* Formats.DATA */: {
                if (typeof value !== "string") {
                    throw new Error(`Client supplied invalid type for ${this.props.format}: "${value}" (${typeof value})`);
                }
                // we don't validate base64 here
                const maxLength = this.props.maxDataLen != null ? this.props.maxDataLen : 0x200000; // default is 0x200000
                if (value.length > maxLength) {
                    throw new Error(`Client supplied value length of ${value.length} exceeds maximum length allowed of ${maxLength}`);
                }
                return value;
            }
            case "tlv8" /* Formats.TLV8 */:
                if (typeof value !== "string") {
                    throw new Error(`Client supplied invalid type for ${this.props.format}: "${value}" (${typeof value})`);
                }
                return value;
        }
        return value;
    }
    /**
     * Checks if the value received from the API call is valid.
     * It adjusts the value where it makes sense, prints a warning where values may be rejected with an error
     * in the future and throws an error which can't be converted to a valid value.
     *
     * @param value - The value received from the API call
     * @param warningType - Optionally defines the warning type to use when raising a {@link CharacteristicEventTypes.CHARACTERISTIC_WARNING}.
     */
    validateUserInput(value, warningType = "warn-message" /* CharacteristicWarningType.WARN_MESSAGE */) {
        if (value === null) {
            if (this.UUID === Characteristic.Model.UUID || this.UUID === Characteristic.SerialNumber.UUID) { // mirrors the statement in case: Formats.STRING
                this.characteristicWarning("characteristic must have a non null value otherwise HomeKit will reject this accessory, ignoring new value", "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */);
                return this.value; // don't change the value
            }
            if (this.props.format === "data" /* Formats.DATA */ || this.props.format === "tlv8" /* Formats.TLV8 */) {
                return value; // TLV8 and DATA formats are allowed to have null as a value
            }
            /**
             * A short disclaimer here.
             * null is actually a perfectly valid value for characteristics to have.
             * The Home app will show "no response" for some characteristics for which it can't handle null
             * but ultimately its valid and the developers decision what the return.
             * BUT: out of history hap-nodejs did replace null with the last known value and thus
             * homebridge devs started to adopting this method as a way of not changing the value in a GET handler.
             * As an intermediate step we kept the behavior but added a warning printed to the console.
             * In a future update we will do the breaking change of return null below!
             */
            if (this.UUID.endsWith(uuid_1.BASE_UUID)) { // we have an apple defined characteristic (at least assuming nobody else uses the UUID namespace)
                if (this.UUID === Characteristic.ProgrammableSwitchEvent.UUID) {
                    return value; // null is allowed as a value for ProgrammableSwitchEvent
                }
                this.characteristicWarning("characteristic was supplied illegal value: null! Home App will reject null for Apple defined characteristics", warningType);
                // if the value has been set previously, return it now, otherwise continue with validation to have a default value set.
                if (this.value !== null) {
                    return this.value;
                }
            }
            else {
                // we currently allow null for any non-custom defined characteristics
                return value;
            }
        }
        switch (this.props.format) {
            case "bool" /* Formats.BOOL */: {
                if (typeof value === "boolean") {
                    return value;
                }
                if (typeof value === "number") {
                    return value === 1;
                }
                if (typeof value === "string") {
                    return value === "1" || value === "true";
                }
                this.characteristicWarning("characteristic value expected boolean and received " + typeof value, warningType);
                return false;
            }
            case "int" /* Formats.INT */:
            case "float" /* Formats.FLOAT */:
            case "uint8" /* Formats.UINT8 */:
            case "uint16" /* Formats.UINT16 */:
            case "uint32" /* Formats.UINT32 */:
            case "uint64" /* Formats.UINT64 */: {
                if (typeof value === "boolean") {
                    value = value ? 1 : 0;
                }
                if (typeof value === "string") {
                    value = this.props.format === "float" /* Formats.FLOAT */ ? parseFloat(value) : parseInt(value, 10);
                }
                if (typeof value !== "number" || !Number.isFinite(value)) {
                    this.characteristicWarning(`characteristic value expected valid finite number and received "${value}" (${typeof value})`, warningType);
                    value = typeof this.value === "number" ? this.value : this.props.minValue || 0;
                }
                const numericMin = maxWithUndefined(this.props.minValue, (0, request_util_1.numericLowerBound)(this.props.format));
                let numericMax = minWithUndefined(this.props.maxValue, (0, request_util_1.numericUpperBound)(this.props.format));
                let stepValue;
                if (this.props.format === "float" /* Formats.FLOAT */) {
                    stepValue = this.props.minStep;
                }
                else {
                    stepValue = maxWithUndefined(this.props.minStep, 1);
                }
                if (stepValue != null && stepValue > 0) {
                    const minValue = this.props.minValue != null ? this.props.minValue : 0;
                    if (numericMax != null) {
                        numericMax = stepValue * Math.floor((numericMax - minValue) / stepValue) + minValue;
                    }
                    value = stepValue * Math.round((value - minValue) / stepValue) + minValue;
                }
                if (numericMin != null && value < numericMin) {
                    this.characteristicWarning(`characteristic was supplied illegal value: number ${value} exceeded minimum of ${numericMin}`, warningType);
                    value = numericMin;
                }
                if (numericMax != null && value > numericMax) {
                    this.characteristicWarning(`characteristic was supplied illegal value: number ${value} exceeded maximum of ${numericMax}`, warningType);
                    value = numericMax;
                }
                if (this.props.validValues && !this.props.validValues.includes(value)) {
                    this.characteristicWarning(`characteristic value ${value} is not contained in valid values array`, warningType);
                    return this.props.validValues.includes(this.value) ? this.value : (this.props.validValues[0] || 0);
                }
                if (this.props.validValueRanges && this.props.validValueRanges.length === 2) {
                    if (value < this.props.validValueRanges[0]) {
                        this.characteristicWarning(`characteristic was supplied illegal value: number ${value} not contained in valid value range of `
                            + `${this.props.validValueRanges}, supplying illegal values will throw errors in the future`, warningType);
                        value = this.props.validValueRanges[0];
                    }
                    else if (value > this.props.validValueRanges[1]) {
                        this.characteristicWarning(`characteristic was supplied illegal value: number ${value} not contained in valid value range of `
                            + `${this.props.validValueRanges}, supplying illegal values will throw errors in the future`, warningType);
                        value = this.props.validValueRanges[1];
                    }
                }
                return value;
            }
            case "string" /* Formats.STRING */: {
                if (typeof value === "number") {
                    this.characteristicWarning("characteristic was supplied illegal value: number instead of string, " +
                        "supplying illegal values will throw errors in the future", warningType);
                    value = String(value);
                }
                if (typeof value !== "string") {
                    this.characteristicWarning("characteristic value expected string and received " + (typeof value), warningType);
                    value = typeof this.value === "string" ? this.value : value + "";
                }
                // mirrors the case value = null at the beginning
                if (value.length <= 1 && (this.UUID === Characteristic.Model.UUID || this.UUID === Characteristic.SerialNumber.UUID)) {
                    this.characteristicWarning(`[${this.displayName}] characteristic must have a length of more than 1 character otherwise`
                        + ` HomeKit will reject this accessory, ignoring new value ${warningType}`);
                    return this.value; // just return the current value
                }
                const maxLength = this.props.maxLen ?? 64; // default is 64 (max is 256 which is set in setProps)
                if (value.length > maxLength) {
                    this.characteristicWarning(`characteristic was supplied illegal value: string '${value}' exceeded max length of ${maxLength}`, warningType);
                    value = value.substring(0, maxLength);
                }
                return value;
            }
            case "data" /* Formats.DATA */:
                if (typeof value !== "string") {
                    throw new Error("characteristic with DATA format must have string value");
                }
                if (this.props.maxDataLen != null && value.length > this.props.maxDataLen) {
                    // can't cut it as we would basically set binary rubbish afterwards
                    throw new Error("characteristic with DATA format exceeds specified maxDataLen");
                }
                return value;
            case "tlv8" /* Formats.TLV8 */:
                if (value === undefined) {
                    this.characteristicWarning("characteristic was supplied illegal value: undefined", warningType);
                    return this.value;
                }
                return value; // we trust that this is valid tlv8
        }
        // hopefully it shouldn't get to this point
        if (value === undefined) {
            this.characteristicWarning("characteristic was supplied illegal value: undefined", "error-message" /* CharacteristicWarningType.ERROR_MESSAGE */);
            return this.value;
        }
        return value;
    }
    /**
     * @private used to assign iid to characteristic
     */
    _assignID(identifierCache, accessoryName, serviceUUID, serviceSubtype) {
        // generate our IID based on our UUID
        this.iid = identifierCache.getIID(accessoryName, serviceUUID, serviceSubtype, this.UUID);
    }
    characteristicWarning(message, type = "warn-message" /* CharacteristicWarningType.WARN_MESSAGE */, stack = new Error().stack) {
        this.emit("characteristic-warning" /* CharacteristicEventTypes.CHARACTERISTIC_WARNING */, type, message, stack);
    }
    /**
     * @param event
     * @private
     */
    removeAllListeners(event) {
        if (!event) {
            this.removeOnGet();
            this.removeOnSet();
        }
        return super.removeAllListeners(event);
    }
    /**
     * @param characteristic
     * @private
     */
    replaceBy(characteristic) {
        this.props = characteristic.props;
        this.updateValue(characteristic.value);
        const getListeners = characteristic.listeners("get" /* CharacteristicEventTypes.GET */);
        if (getListeners.length) {
            // the callback can only be called once, so we remove all old listeners
            this.removeAllListeners("get" /* CharacteristicEventTypes.GET */);
            getListeners.forEach(listener => this.addListener("get" /* CharacteristicEventTypes.GET */, listener));
        }
        this.removeOnGet();
        if (characteristic.getHandler) {
            this.onGet(characteristic.getHandler);
        }
        const setListeners = characteristic.listeners("set" /* CharacteristicEventTypes.SET */);
        if (setListeners.length) {
            // the callback can only be called once, so we remove all old listeners
            this.removeAllListeners("set" /* CharacteristicEventTypes.SET */);
            setListeners.forEach(listener => this.addListener("set" /* CharacteristicEventTypes.SET */, listener));
        }
        this.removeOnSet();
        if (characteristic.setHandler) {
            this.onSet(characteristic.setHandler);
        }
    }
    /**
     * Returns a JSON representation of this characteristic suitable for delivering to HAP clients.
     * @private used to generate response to /accessories query
     */
    async toHAP(connection, contactGetHandlers = true) {
        const object = this.internalHAPRepresentation();
        if (!this.props.perms.includes("pr" /* Perms.PAIRED_READ */)) {
            object.value = undefined;
        }
        else if (this.UUID === Characteristic.ProgrammableSwitchEvent.UUID) {
            // special workaround for event only programmable switch event, which must always return null
            object.value = null;
        }
        else { // query the current value
            const value = contactGetHandlers
                ? await this.handleGetRequest(connection).catch(() => {
                    const value = this.getDefaultValue();
                    debug("[%s] Error getting value for characteristic on /accessories request. Returning default value instead: %s", this.displayName, `${value}`);
                    return value; // use default value
                })
                : this.value;
            object.value = (0, request_util_1.formatOutgoingCharacteristicValue)(value, this.props);
        }
        return object;
    }
    /**
     * Returns a JSON representation of this characteristic without the value.
     * @private used to generate the config hash
     */
    internalHAPRepresentation() {
        (0, assert_1.default)(this.iid, "iid cannot be undefined for characteristic '" + this.displayName + "'");
        // TODO include the value for characteristics of the AccessoryInformation service
        return {
            type: (0, uuid_1.toShortForm)(this.UUID),
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
    }
    /**
     * Serialize characteristic into json string.
     *
     * @param characteristic - Characteristic object.
     * @private used to store characteristic on disk
     */
    static serialize(characteristic) {
        let constructorName;
        if (characteristic.constructor.name !== "Characteristic") {
            constructorName = characteristic.constructor.name;
        }
        return {
            displayName: characteristic.displayName,
            UUID: characteristic.UUID,
            eventOnlyCharacteristic: characteristic.UUID === Characteristic.ProgrammableSwitchEvent.UUID, // support downgrades for now
            constructorName: constructorName,
            value: characteristic.value,
            props: (0, clone_1.clone)({}, characteristic.props),
        };
    }
    /**
     * Deserialize characteristic from json string.
     *
     * @param json - Json string representing a characteristic.
     * @private used to recreate characteristic from disk
     */
    static deserialize(json) {
        let characteristic;
        if (json.constructorName && json.constructorName.charAt(0).toUpperCase() === json.constructorName.charAt(0)
            && Characteristic[json.constructorName]) { // MUST start with uppercase character and must exist on Characteristic object
            const constructor = Characteristic[json.constructorName];
            characteristic = new constructor();
            characteristic.displayName = json.displayName;
            characteristic.setProps(json.props);
        }
        else {
            characteristic = new Characteristic(json.displayName, json.UUID, json.props);
        }
        characteristic.value = json.value;
        return characteristic;
    }
}
exports.Characteristic = Characteristic;
// We have a cyclic dependency problem. Within this file we have the definitions of "./definitions" as
// type imports only (in order to define the static properties). Setting those properties is done outside
// this file, within the definition files. Therefore, we import it at the end of this file. Seems weird, but is important.
require("./definitions/CharacteristicDefinitions");
//# sourceMappingURL=Characteristic.js.map