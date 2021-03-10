/// <reference types="node" />
import { EventEmitter } from "events";
import { CharacteristicJsonObject } from "../internal-types";
import { CharacteristicValue, Nullable, VoidCallback } from '../types';
import { CharacteristicWarningType } from "./Accessory";
import { AccessControlLevel, AccessoryFlags, AccessoryIdentifier, Active, ActiveIdentifier, ActivityInterval, AdministratorOnlyAccess, AirParticulateDensity, AirParticulateSize, AirQuality, AppMatchingIdentifier, AudioFeedback, BatteryLevel, Brightness, ButtonEvent, CameraOperatingModeIndicator, CarbonDioxideDetected, CarbonDioxideLevel, CarbonDioxidePeakLevel, CarbonMonoxideDetected, CarbonMonoxideLevel, CarbonMonoxidePeakLevel, Category, CCAEnergyDetectThreshold, CCASignalDetectThreshold, CharacteristicValueActiveTransitionCount, CharacteristicValueTransitionControl, ChargingState, ClosedCaptions, ColorTemperature, ConfigureBridgedAccessory, ConfigureBridgedAccessoryStatus, ConfiguredName, ContactSensorState, CoolingThresholdTemperature, CurrentAirPurifierState, CurrentAmbientLightLevel, CurrentDoorState, CurrentFanState, CurrentHeaterCoolerState, CurrentHeatingCoolingState, CurrentHorizontalTiltAngle, CurrentHumidifierDehumidifierState, CurrentMediaState, CurrentPosition, CurrentRelativeHumidity, CurrentSlatState, CurrentTemperature, CurrentTiltAngle, CurrentTime, CurrentTransport, CurrentVerticalTiltAngle, CurrentVisibilityState, DataStreamHAPTransport, DataStreamHAPTransportInterrupt, DayoftheWeek, DiagonalFieldOfView, DigitalZoom, DiscoverBridgedAccessories, DiscoveredBridgedAccessories, DisplayOrder, EventRetransmissionMaximum, EventSnapshotsActive, EventTransmissionCounters, FilterChangeIndication, FilterLifeLevel, FirmwareRevision, FirmwareUpdateReadiness, FirmwareUpdateStatus, HardwareRevision, HeartBeat, HeatingThresholdTemperature, HoldPosition, HomeKitCameraActive, Hue, Identifier, Identify, ImageMirroring, ImageRotation, InputDeviceType, InputSourceType, InUse, IsConfigured, LeakDetected, LinkQuality, ListPairings, LockControlPoint, LockCurrentState, LockLastKnownAction, LockManagementAutoSecurityTimeout, LockPhysicalControls, LockTargetState, Logs, MACRetransmissionMaximum, MACTransmissionCounters, ManagedNetworkEnable, ManuallyDisabled, Manufacturer, MaximumTransmitPower, Model, MotionDetected, Mute, Name, NetworkAccessViolationControl, NetworkClientProfileControl, NetworkClientStatusControl, NightVision, NitrogenDioxideDensity, ObstructionDetected, OccupancyDetected, On, OperatingStateResponse, OpticalZoom, OutletInUse, OzoneDensity, PairingFeatures, PairSetup, PairVerify, PasswordSetting, PeriodicSnapshotsActive, PictureMode, Ping, PM10Density, PM2_5Density, PositionState, PowerModeSelection, ProductData, ProgrammableSwitchEvent, ProgrammableSwitchOutputState, ProgramMode, Reachable, ReceivedSignalStrengthIndication, ReceiverSensitivity, RecordingAudioActive, RelativeHumidityDehumidifierThreshold, RelativeHumidityHumidifierThreshold, RelayControlPoint, RelayEnabled, RelayState, RemainingDuration, RemoteKey, ResetFilterIndication, RotationDirection, RotationSpeed, RouterStatus, Saturation, SecuritySystemAlarmType, SecuritySystemCurrentState, SecuritySystemTargetState, SelectedAudioStreamConfiguration, SelectedCameraRecordingConfiguration, SelectedRTPStreamConfiguration, SerialNumber, ServiceLabelIndex, ServiceLabelNamespace, SetDuration, SetupDataStreamTransport, SetupEndpoints, SetupTransferTransport, SignalToNoiseRatio, SiriInputType, SlatType, SleepDiscoveryMode, SleepInterval, SmokeDetected, SoftwareRevision, StagedFirmwareVersion, StatusActive, StatusFault, StatusJammed, StatusLowBattery, StatusTampered, StreamingStatus, SulphurDioxideDensity, SupportedAudioRecordingConfiguration, SupportedAudioStreamConfiguration, SupportedCameraRecordingConfiguration, SupportedCharacteristicValueTransitionConfiguration, SupportedDataStreamTransportConfiguration, SupportedDiagnosticsSnapshot, SupportedFirmwareUpdateConfiguration, SupportedRouterConfiguration, SupportedRTPConfiguration, SupportedTransferTransportConfiguration, SupportedVideoRecordingConfiguration, SupportedVideoStreamConfiguration, SwingMode, TargetAirPurifierState, TargetAirQuality, TargetControlList, TargetControlSupportedConfiguration, TargetDoorState, TargetFanState, TargetHeaterCoolerState, TargetHeatingCoolingState, TargetHorizontalTiltAngle, TargetHumidifierDehumidifierState, TargetMediaState, TargetPosition, TargetRelativeHumidity, TargetSlatState, TargetTemperature, TargetTiltAngle, TargetVerticalTiltAngle, TargetVisibilityState, TemperatureDisplayUnits, ThirdPartyCameraActive, ThreadControlPoint, ThreadNodeCapabilities, ThreadOpenThreadVersion, ThreadStatus, TimeUpdate, TransmitPower, TunnelConnectionTimeout, TunneledAccessoryAdvertising, TunneledAccessoryConnected, TunneledAccessoryStateNumber, ValveType, Version, VideoAnalysisActive, VOCDensity, Volume, VolumeControlType, VolumeSelector, WakeConfiguration, WANConfigurationList, WANStatusList, WaterLevel, WiFiCapabilities, WiFiConfigurationControl, WiFiSatelliteStatus } from "./definitions";
import { HAPStatus } from "./HAPServer";
import { IdentifierCache } from './model/IdentifierCache';
import { HAPConnection } from "./util/eventedhttp";
import { HapStatusError } from './util/hapStatusError';
export declare const enum Formats {
    BOOL = "bool",
    /**
     * Signed 32-bit integer
     */
    INT = "int",
    /**
     * Signed 64-bit floating point
     */
    FLOAT = "float",
    /**
     * String encoded in utf8
     */
    STRING = "string",
    /**
     * Unsigned 8-bit integer.
     */
    UINT8 = "uint8",
    /**
     * Unsigned 16-bit integer.
     */
    UINT16 = "uint16",
    /**
     * Unsigned 32-bit integer.
     */
    UINT32 = "uint32",
    /**
     * Unsigned 64-bit integer.
     */
    UINT64 = "uint64",
    /**
     * Data is base64 encoded string.
     */
    DATA = "data",
    /**
     * Base64 encoded tlv8 string.
     */
    TLV8 = "tlv8",
    /**
     * @deprecated Not contained in the HAP spec
     */
    ARRAY = "array",
    /**
     * @deprecated Not contained in the HAP spec
     */
    DICTIONARY = "dict"
}
export declare const enum Units {
    /**
     * Celsius is the only temperature unit in the HomeKit Accessory Protocol.
     * Unit conversion is always done on the client side e.g. on the iPhone in the Home App depending on
     * the configured unit on the device itself.
     */
    CELSIUS = "celsius",
    PERCENTAGE = "percentage",
    ARC_DEGREE = "arcdegrees",
    LUX = "lux",
    SECONDS = "seconds"
}
export declare const enum Perms {
    /**
     * @deprecated replaced by {@link PAIRED_READ}. Kept for backwards compatibility.
     */
    READ = "pr",
    /**
     * @deprecated replaced by {@link PAIRED_WRITE}. Kept for backwards compatibility.
     */
    WRITE = "pw",
    PAIRED_READ = "pr",
    PAIRED_WRITE = "pw",
    NOTIFY = "ev",
    EVENTS = "ev",
    ADDITIONAL_AUTHORIZATION = "aa",
    TIMED_WRITE = "tw",
    HIDDEN = "hd",
    WRITE_RESPONSE = "wr"
}
export interface CharacteristicProps {
    format: Formats | string;
    perms: Perms[];
    unit?: Units | string;
    description?: string;
    /**
     * Defines the minimum value for a numeric characteristic
     */
    minValue?: number;
    /**
     * Defines the maximum value for a numeric characteristic
     */
    maxValue?: number;
    minStep?: number;
    /**
     * Maximum number of characters when format is {@link Formats.STRING}.
     * Default is 64 characters. Maximum allowed is 256 characters.
     */
    maxLen?: number;
    /**
     * Maximum number of characters when format is {@link Formats.DATA}.
     * Default is 2097152 characters.
     */
    maxDataLen?: number;
    /**
     * Defines a array of valid values to be used for the characteristic.
     */
    validValues?: number[];
    /**
     * Two element array where the first value specifies the lowest valid value and
     * the second element specifies the highest valid value.
     */
    validValueRanges?: [min: number, max: number];
    adminOnlyAccess?: Access[];
}
export declare const enum Access {
    READ = 0,
    WRITE = 1,
    NOTIFY = 2
}
export declare type CharacteristicChange = {
    originator?: HAPConnection;
    newValue: Nullable<CharacteristicValue>;
    oldValue: Nullable<CharacteristicValue>;
    reason: ChangeReason;
    context?: any;
};
export declare const enum ChangeReason {
    /**
     * Reason used when HomeKit writes a value or the API user calls {@link Characteristic.setValue}.
     */
    WRITE = "write",
    /**
     * Reason used when the API user calls the method {@link Characteristic.updateValue}.
     */
    UPDATE = "update",
    /**
     * Used when when HomeKit reads a value or the API user calls the deprecated method {@link Characteristic.getValue}.
     */
    READ = "read",
    /**
     * Used when call to {@link Characteristic.sendEventNotification} was made.
     */
    EVENT = "event"
}
/**
 * This format for a context object can be used to pass to any characteristic write operation.
 * It can contain additional information used by the internal event handlers of hap-nodejs.
 * The context object can be combined with any custom data for own use.
 */
export interface CharacteristicOperationContext {
    /**
     * If set to true for any characteristic write operation
     * the Accessory won't send any event notifications to HomeKit controllers
     * for that particular change.
     */
    omitEventUpdate?: boolean;
}
/**
 * @private
 */
export interface SerializedCharacteristic {
    displayName: string;
    UUID: string;
    eventOnlyCharacteristic: boolean;
    constructorName?: string;
    value: Nullable<CharacteristicValue>;
    props: CharacteristicProps;
}
export declare const enum CharacteristicEventTypes {
    /**
     * This event is thrown when a HomeKit controller wants to read the current value of the characteristic.
     * The event handler should call the supplied callback as fast as possible.
     *
     * HAP-NodeJS will complain about slow running get handlers after 3 seconds and terminate the request after 10 seconds.
     */
    GET = "get",
    /**
     * This event is thrown when a HomeKit controller wants to write a new value to the characteristic.
     * The event handler should call the supplied callback as fast as possible.
     *
     * HAP-NodeJS will complain about slow running set handlers after 3 seconds and terminate the request after 10 seconds.
     */
    SET = "set",
    /**
     * Emitted after a new value is set for the characteristic.
     * The new value can be set via a request by a HomeKit controller or via an API call.
     */
    CHANGE = "change",
    /**
     * @private
     */
    SUBSCRIBE = "subscribe",
    /**
     * @private
     */
    UNSUBSCRIBE = "unsubscribe",
    /**
     * @private
     */
    CHARACTERISTIC_WARNING = "characteristic-warning"
}
export declare type CharacteristicGetCallback = (status?: HAPStatus | null | Error, value?: Nullable<CharacteristicValue>) => void;
export declare type CharacteristicSetCallback = (error?: HAPStatus | null | Error, writeResponse?: Nullable<CharacteristicValue>) => void;
export declare type CharacteristicGetHandler = (context: any, connection?: HAPConnection) => Promise<Nullable<CharacteristicValue>> | Nullable<CharacteristicValue>;
export declare type CharacteristicSetHandler = (value: CharacteristicValue, context: any, connection?: HAPConnection) => Promise<Nullable<CharacteristicValue> | void> | Nullable<CharacteristicValue> | void;
export declare type AdditionalAuthorizationHandler = (additionalAuthorizationData: string | undefined) => boolean;
export declare interface Characteristic {
    on(event: "get", listener: (callback: CharacteristicGetCallback, context: any, connection?: HAPConnection) => void): this;
    on(event: "set", listener: (value: CharacteristicValue, callback: CharacteristicSetCallback, context: any, connection?: HAPConnection) => void): this;
    on(event: "change", listener: (change: CharacteristicChange) => void): this;
    /**
     * @private
     */
    on(event: "subscribe", listener: VoidCallback): this;
    /**
     * @private
     */
    on(event: "unsubscribe", listener: VoidCallback): this;
    /**
     * @private
     */
    on(event: "characteristic-warning", listener: (type: CharacteristicWarningType, message: string, stack?: string) => void): this;
    /**
     * @private
     */
    emit(event: "get", callback: CharacteristicGetCallback, context: any, connection?: HAPConnection): boolean;
    /**
     * @private
     */
    emit(event: "set", value: CharacteristicValue, callback: CharacteristicSetCallback, context: any, connection?: HAPConnection): boolean;
    /**
     * @private
     */
    emit(event: "change", change: CharacteristicChange): boolean;
    /**
     * @private
     */
    emit(event: "subscribe"): boolean;
    /**
     * @private
     */
    emit(event: "unsubscribe"): boolean;
    /**
     * @private
     */
    emit(event: "characteristic-warning", type: CharacteristicWarningType, message: string, stack?: string): boolean;
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
 */
export declare class Characteristic extends EventEmitter {
    /**
     * @deprecated Please use the Formats const enum above. Scheduled to be removed in 2021-06.
     */
    static Formats: typeof Formats;
    /**
     * @deprecated Please use the Units const enum above. Scheduled to be removed in 2021-06.
     */
    static Units: typeof Units;
    /**
     * @deprecated Please use the Perms const enum above. Scheduled to be removed in 2021-06.
     */
    static Perms: typeof Perms;
    static AccessControlLevel: typeof AccessControlLevel;
    static AccessoryFlags: typeof AccessoryFlags;
    static AccessoryIdentifier: typeof AccessoryIdentifier;
    static Active: typeof Active;
    static ActiveIdentifier: typeof ActiveIdentifier;
    static ActivityInterval: typeof ActivityInterval;
    static AdministratorOnlyAccess: typeof AdministratorOnlyAccess;
    static AirParticulateDensity: typeof AirParticulateDensity;
    static AirParticulateSize: typeof AirParticulateSize;
    static AirQuality: typeof AirQuality;
    static AppMatchingIdentifier: typeof AppMatchingIdentifier;
    static AudioFeedback: typeof AudioFeedback;
    static BatteryLevel: typeof BatteryLevel;
    static Brightness: typeof Brightness;
    static ButtonEvent: typeof ButtonEvent;
    static CameraOperatingModeIndicator: typeof CameraOperatingModeIndicator;
    static CarbonDioxideDetected: typeof CarbonDioxideDetected;
    static CarbonDioxideLevel: typeof CarbonDioxideLevel;
    static CarbonDioxidePeakLevel: typeof CarbonDioxidePeakLevel;
    static CarbonMonoxideDetected: typeof CarbonMonoxideDetected;
    static CarbonMonoxideLevel: typeof CarbonMonoxideLevel;
    static CarbonMonoxidePeakLevel: typeof CarbonMonoxidePeakLevel;
    /**
     * @deprecated Removed and not used anymore
     */
    static Category: typeof Category;
    static CCAEnergyDetectThreshold: typeof CCAEnergyDetectThreshold;
    static CCASignalDetectThreshold: typeof CCASignalDetectThreshold;
    static CharacteristicValueActiveTransitionCount: typeof CharacteristicValueActiveTransitionCount;
    static CharacteristicValueTransitionControl: typeof CharacteristicValueTransitionControl;
    static ChargingState: typeof ChargingState;
    static ClosedCaptions: typeof ClosedCaptions;
    static ColorTemperature: typeof ColorTemperature;
    /**
     * @deprecated Removed and not used anymore
     */
    static ConfigureBridgedAccessory: typeof ConfigureBridgedAccessory;
    /**
     * @deprecated Removed and not used anymore
     */
    static ConfigureBridgedAccessoryStatus: typeof ConfigureBridgedAccessoryStatus;
    static ConfiguredName: typeof ConfiguredName;
    static ContactSensorState: typeof ContactSensorState;
    static CoolingThresholdTemperature: typeof CoolingThresholdTemperature;
    static CurrentAirPurifierState: typeof CurrentAirPurifierState;
    static CurrentAmbientLightLevel: typeof CurrentAmbientLightLevel;
    static CurrentDoorState: typeof CurrentDoorState;
    static CurrentFanState: typeof CurrentFanState;
    static CurrentHeaterCoolerState: typeof CurrentHeaterCoolerState;
    static CurrentHeatingCoolingState: typeof CurrentHeatingCoolingState;
    static CurrentHorizontalTiltAngle: typeof CurrentHorizontalTiltAngle;
    static CurrentHumidifierDehumidifierState: typeof CurrentHumidifierDehumidifierState;
    static CurrentMediaState: typeof CurrentMediaState;
    static CurrentPosition: typeof CurrentPosition;
    static CurrentRelativeHumidity: typeof CurrentRelativeHumidity;
    static CurrentSlatState: typeof CurrentSlatState;
    static CurrentTemperature: typeof CurrentTemperature;
    static CurrentTiltAngle: typeof CurrentTiltAngle;
    /**
     * @deprecated Removed and not used anymore
     */
    static CurrentTime: typeof CurrentTime;
    static CurrentTransport: typeof CurrentTransport;
    static CurrentVerticalTiltAngle: typeof CurrentVerticalTiltAngle;
    static CurrentVisibilityState: typeof CurrentVisibilityState;
    static DataStreamHAPTransport: typeof DataStreamHAPTransport;
    static DataStreamHAPTransportInterrupt: typeof DataStreamHAPTransportInterrupt;
    /**
     * @deprecated Removed and not used anymore
     */
    static DayoftheWeek: typeof DayoftheWeek;
    static DiagonalFieldOfView: typeof DiagonalFieldOfView;
    static DigitalZoom: typeof DigitalZoom;
    /**
     * @deprecated Removed and not used anymore
     */
    static DiscoverBridgedAccessories: typeof DiscoverBridgedAccessories;
    /**
     * @deprecated Removed and not used anymore
     */
    static DiscoveredBridgedAccessories: typeof DiscoveredBridgedAccessories;
    static DisplayOrder: typeof DisplayOrder;
    static EventRetransmissionMaximum: typeof EventRetransmissionMaximum;
    static EventSnapshotsActive: typeof EventSnapshotsActive;
    static EventTransmissionCounters: typeof EventTransmissionCounters;
    static FilterChangeIndication: typeof FilterChangeIndication;
    static FilterLifeLevel: typeof FilterLifeLevel;
    static FirmwareRevision: typeof FirmwareRevision;
    static FirmwareUpdateReadiness: typeof FirmwareUpdateReadiness;
    static FirmwareUpdateStatus: typeof FirmwareUpdateStatus;
    static HardwareRevision: typeof HardwareRevision;
    static HeartBeat: typeof HeartBeat;
    static HeatingThresholdTemperature: typeof HeatingThresholdTemperature;
    static HoldPosition: typeof HoldPosition;
    static HomeKitCameraActive: typeof HomeKitCameraActive;
    static Hue: typeof Hue;
    static Identifier: typeof Identifier;
    static Identify: typeof Identify;
    static ImageMirroring: typeof ImageMirroring;
    static ImageRotation: typeof ImageRotation;
    static InputDeviceType: typeof InputDeviceType;
    static InputSourceType: typeof InputSourceType;
    static InUse: typeof InUse;
    static IsConfigured: typeof IsConfigured;
    static LeakDetected: typeof LeakDetected;
    /**
     * @deprecated Removed and not used anymore
     */
    static LinkQuality: typeof LinkQuality;
    static ListPairings: typeof ListPairings;
    static LockControlPoint: typeof LockControlPoint;
    static LockCurrentState: typeof LockCurrentState;
    static LockLastKnownAction: typeof LockLastKnownAction;
    static LockManagementAutoSecurityTimeout: typeof LockManagementAutoSecurityTimeout;
    static LockPhysicalControls: typeof LockPhysicalControls;
    static LockTargetState: typeof LockTargetState;
    static Logs: typeof Logs;
    static MACRetransmissionMaximum: typeof MACRetransmissionMaximum;
    static MACTransmissionCounters: typeof MACTransmissionCounters;
    static ManagedNetworkEnable: typeof ManagedNetworkEnable;
    static ManuallyDisabled: typeof ManuallyDisabled;
    static Manufacturer: typeof Manufacturer;
    static MaximumTransmitPower: typeof MaximumTransmitPower;
    static Model: typeof Model;
    static MotionDetected: typeof MotionDetected;
    static Mute: typeof Mute;
    static Name: typeof Name;
    static NetworkAccessViolationControl: typeof NetworkAccessViolationControl;
    static NetworkClientProfileControl: typeof NetworkClientProfileControl;
    static NetworkClientStatusControl: typeof NetworkClientStatusControl;
    static NightVision: typeof NightVision;
    static NitrogenDioxideDensity: typeof NitrogenDioxideDensity;
    static ObstructionDetected: typeof ObstructionDetected;
    static OccupancyDetected: typeof OccupancyDetected;
    static On: typeof On;
    static OperatingStateResponse: typeof OperatingStateResponse;
    static OpticalZoom: typeof OpticalZoom;
    static OutletInUse: typeof OutletInUse;
    static OzoneDensity: typeof OzoneDensity;
    static PairingFeatures: typeof PairingFeatures;
    static PairSetup: typeof PairSetup;
    static PairVerify: typeof PairVerify;
    static PasswordSetting: typeof PasswordSetting;
    static PeriodicSnapshotsActive: typeof PeriodicSnapshotsActive;
    static PictureMode: typeof PictureMode;
    static Ping: typeof Ping;
    static PM10Density: typeof PM10Density;
    static PM2_5Density: typeof PM2_5Density;
    static PositionState: typeof PositionState;
    static PowerModeSelection: typeof PowerModeSelection;
    static ProductData: typeof ProductData;
    static ProgrammableSwitchEvent: typeof ProgrammableSwitchEvent;
    static ProgrammableSwitchOutputState: typeof ProgrammableSwitchOutputState;
    static ProgramMode: typeof ProgramMode;
    /**
     * @deprecated Removed and not used anymore
     */
    static Reachable: typeof Reachable;
    static ReceivedSignalStrengthIndication: typeof ReceivedSignalStrengthIndication;
    static ReceiverSensitivity: typeof ReceiverSensitivity;
    static RecordingAudioActive: typeof RecordingAudioActive;
    static RelativeHumidityDehumidifierThreshold: typeof RelativeHumidityDehumidifierThreshold;
    static RelativeHumidityHumidifierThreshold: typeof RelativeHumidityHumidifierThreshold;
    static RelayControlPoint: typeof RelayControlPoint;
    static RelayEnabled: typeof RelayEnabled;
    static RelayState: typeof RelayState;
    static RemainingDuration: typeof RemainingDuration;
    static RemoteKey: typeof RemoteKey;
    static ResetFilterIndication: typeof ResetFilterIndication;
    static RotationDirection: typeof RotationDirection;
    static RotationSpeed: typeof RotationSpeed;
    static RouterStatus: typeof RouterStatus;
    static Saturation: typeof Saturation;
    static SecuritySystemAlarmType: typeof SecuritySystemAlarmType;
    static SecuritySystemCurrentState: typeof SecuritySystemCurrentState;
    static SecuritySystemTargetState: typeof SecuritySystemTargetState;
    static SelectedAudioStreamConfiguration: typeof SelectedAudioStreamConfiguration;
    static SelectedCameraRecordingConfiguration: typeof SelectedCameraRecordingConfiguration;
    static SelectedRTPStreamConfiguration: typeof SelectedRTPStreamConfiguration;
    static SerialNumber: typeof SerialNumber;
    static ServiceLabelIndex: typeof ServiceLabelIndex;
    static ServiceLabelNamespace: typeof ServiceLabelNamespace;
    static SetDuration: typeof SetDuration;
    static SetupDataStreamTransport: typeof SetupDataStreamTransport;
    static SetupEndpoints: typeof SetupEndpoints;
    static SetupTransferTransport: typeof SetupTransferTransport;
    static SignalToNoiseRatio: typeof SignalToNoiseRatio;
    static SiriInputType: typeof SiriInputType;
    static SlatType: typeof SlatType;
    static SleepDiscoveryMode: typeof SleepDiscoveryMode;
    static SleepInterval: typeof SleepInterval;
    static SmokeDetected: typeof SmokeDetected;
    static SoftwareRevision: typeof SoftwareRevision;
    static StagedFirmwareVersion: typeof StagedFirmwareVersion;
    static StatusActive: typeof StatusActive;
    static StatusFault: typeof StatusFault;
    static StatusJammed: typeof StatusJammed;
    static StatusLowBattery: typeof StatusLowBattery;
    static StatusTampered: typeof StatusTampered;
    static StreamingStatus: typeof StreamingStatus;
    static SulphurDioxideDensity: typeof SulphurDioxideDensity;
    static SupportedAudioRecordingConfiguration: typeof SupportedAudioRecordingConfiguration;
    static SupportedAudioStreamConfiguration: typeof SupportedAudioStreamConfiguration;
    static SupportedCameraRecordingConfiguration: typeof SupportedCameraRecordingConfiguration;
    static SupportedCharacteristicValueTransitionConfiguration: typeof SupportedCharacteristicValueTransitionConfiguration;
    static SupportedDataStreamTransportConfiguration: typeof SupportedDataStreamTransportConfiguration;
    static SupportedDiagnosticsSnapshot: typeof SupportedDiagnosticsSnapshot;
    static SupportedFirmwareUpdateConfiguration: typeof SupportedFirmwareUpdateConfiguration;
    static SupportedRouterConfiguration: typeof SupportedRouterConfiguration;
    static SupportedRTPConfiguration: typeof SupportedRTPConfiguration;
    static SupportedTransferTransportConfiguration: typeof SupportedTransferTransportConfiguration;
    static SupportedVideoRecordingConfiguration: typeof SupportedVideoRecordingConfiguration;
    static SupportedVideoStreamConfiguration: typeof SupportedVideoStreamConfiguration;
    static SwingMode: typeof SwingMode;
    static TargetAirPurifierState: typeof TargetAirPurifierState;
    /**
     * @deprecated Removed and not used anymore
     */
    static TargetAirQuality: typeof TargetAirQuality;
    static TargetControlList: typeof TargetControlList;
    static TargetControlSupportedConfiguration: typeof TargetControlSupportedConfiguration;
    static TargetDoorState: typeof TargetDoorState;
    static TargetFanState: typeof TargetFanState;
    static TargetHeaterCoolerState: typeof TargetHeaterCoolerState;
    static TargetHeatingCoolingState: typeof TargetHeatingCoolingState;
    static TargetHorizontalTiltAngle: typeof TargetHorizontalTiltAngle;
    static TargetHumidifierDehumidifierState: typeof TargetHumidifierDehumidifierState;
    static TargetMediaState: typeof TargetMediaState;
    static TargetPosition: typeof TargetPosition;
    static TargetRelativeHumidity: typeof TargetRelativeHumidity;
    /**
     * @deprecated Removed and not used anymore
     */
    static TargetSlatState: typeof TargetSlatState;
    static TargetTemperature: typeof TargetTemperature;
    static TargetTiltAngle: typeof TargetTiltAngle;
    static TargetVerticalTiltAngle: typeof TargetVerticalTiltAngle;
    static TargetVisibilityState: typeof TargetVisibilityState;
    static TemperatureDisplayUnits: typeof TemperatureDisplayUnits;
    static ThirdPartyCameraActive: typeof ThirdPartyCameraActive;
    static ThreadControlPoint: typeof ThreadControlPoint;
    static ThreadNodeCapabilities: typeof ThreadNodeCapabilities;
    static ThreadOpenThreadVersion: typeof ThreadOpenThreadVersion;
    static ThreadStatus: typeof ThreadStatus;
    /**
     * @deprecated Removed and not used anymore
     */
    static TimeUpdate: typeof TimeUpdate;
    static TransmitPower: typeof TransmitPower;
    static TunnelConnectionTimeout: typeof TunnelConnectionTimeout;
    static TunneledAccessoryAdvertising: typeof TunneledAccessoryAdvertising;
    static TunneledAccessoryConnected: typeof TunneledAccessoryConnected;
    static TunneledAccessoryStateNumber: typeof TunneledAccessoryStateNumber;
    static ValveType: typeof ValveType;
    static Version: typeof Version;
    static VideoAnalysisActive: typeof VideoAnalysisActive;
    static VOCDensity: typeof VOCDensity;
    static Volume: typeof Volume;
    static VolumeControlType: typeof VolumeControlType;
    static VolumeSelector: typeof VolumeSelector;
    static WakeConfiguration: typeof WakeConfiguration;
    static WANConfigurationList: typeof WANConfigurationList;
    static WANStatusList: typeof WANStatusList;
    static WaterLevel: typeof WaterLevel;
    static WiFiCapabilities: typeof WiFiCapabilities;
    static WiFiConfigurationControl: typeof WiFiConfigurationControl;
    static WiFiSatelliteStatus: typeof WiFiSatelliteStatus;
    displayName: string;
    UUID: string;
    iid: Nullable<number>;
    value: Nullable<CharacteristicValue>;
    /**
     * @deprecated replaced by {@link statusCode}
     * @private
     */
    status: Nullable<Error>;
    /**
     * @private
     */
    statusCode: HAPStatus;
    props: CharacteristicProps;
    /**
     * The {@link onGet} handler
     */
    private getHandler?;
    /**
     * The {@link onSet} handler
     */
    private setHandler?;
    private subscriptions;
    /**
     * @private
     */
    additionalAuthorizationHandler?: AdditionalAuthorizationHandler;
    constructor(displayName: string, UUID: string, props: CharacteristicProps);
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
    onGet(handler: CharacteristicGetHandler): Characteristic;
    /**
     * Removes the {@link CharacteristicGetHandler} handler which was configured using {@link onGet}.
     */
    removeOnGet(): Characteristic;
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
    onSet(handler: CharacteristicSetHandler): Characteristic;
    /**
     * Removes the {@link CharacteristicSetHandler} which was configured using {@link onSet}.
     */
    removeOnSet(): Characteristic;
    /**
     * Updates the properties of this characteristic.
     * Properties passed via the parameter will be set. Any parameter set to null will be deleted.
     * See {@link CharacteristicProps}.
     *
     * @param props - Partial properties object with the desired updates.
     */
    setProps(props: Partial<CharacteristicProps>): Characteristic;
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
    validValuesIterator(): Iterable<number>;
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
    setupAdditionalAuthorization(handler: AdditionalAuthorizationHandler): void;
    /**
     * Updates the current value of the characteristic.
     *
     * @param callback
     * @param context
     * @private use to return the current value on HAP requests
     *
     * @deprecated
     */
    getValue(callback?: CharacteristicGetCallback, context?: any): void;
    /**
     * This updates the value by calling the {@link CharacteristicEventTypes.SET} event handler associated with the characteristic.
     * This acts the same way as when a HomeKit controller sends a /characteristics request to update the characteristic.
     * A event notification will be sent to all connected HomeKit controllers which are registered
     * to receive event notifications for this characteristic.
     *
     * This method behaves like a {@link updateValue} call with the addition that the own {@link CharacteristicEventTypes.SET}
     * event handler is called.
     *
     * @param value - The new value.
     */
    setValue(value: CharacteristicValue): Characteristic;
    /**
     * Sets the state of the characteristic to an errored state.
     * If a onGet or GET handler is set up, the errored state will be ignored and the characteristic
     * will always query the latest state by calling the provided handler.
     *
     * If a generic error object is supplied, the characteristic tries to extract a {@link HAPStatus} code
     * from the error message string. If not possible a generic {@link HAPStatus.SERVICE_COMMUNICATION_FAILURE} will be used.
     * If the supplied error object is an instance of {@link HapStatusError} the corresponding status will be used.
     *
     * @param error - The error object
     */
    setValue(error: HapStatusError | Error): Characteristic;
    /**
     * This updates the value by calling the {@link CharacteristicEventTypes.SET} event handler associated with the characteristic.
     * This acts the same way as when a HomeKit controller sends a /characteristics request to update the characteristic.
     * A event notification will be sent to all connected HomeKit controllers which are registered
     * to receive event notifications for this characteristic.
     *
     * This method behaves like a {@link updateValue} call with the addition that the own {@link CharacteristicEventTypes.SET}
     * event handler is called.
     *
     * @param value - The new value.
     * @param callback - Deprecated parameter there to provide backwards compatibility. Called once the
     *   {@link CharacteristicEventTypes.SET} event handler returns.
     * @param context - Passed to the {@link CharacteristicEventTypes.SET} and {@link CharacteristicEventTypes.CHANGE} event handler.
     * @deprecated Parameter callback is deprecated.
     */
    setValue(value: CharacteristicValue, callback?: CharacteristicSetCallback, context?: any): Characteristic;
    /**
     * This updates the value by calling the {@link CharacteristicEventTypes.SET} event handler associated with the characteristic.
     * This acts the same way as when a HomeKit controller sends a /characteristics request to update the characteristic.
     * A event notification will be sent to all connected HomeKit controllers which are registered
     * to receive event notifications for this characteristic.
     *
     * This method behaves like a {@link updateValue} call with the addition that the own {@link CharacteristicEventTypes.SET}
     * event handler is called.
     *
     * @param value - The new value.
     * @param context - Passed to the {@link CharacteristicEventTypes.SET} and {@link CharacteristicEventTypes.CHANGE} event handler.
     */
    setValue(value: CharacteristicValue, context?: any): Characteristic;
    /**
     * This updates the value of the characteristic. If the value changed, a event notification will be sent to all connected
     * HomeKit controllers which are registered to receive event notifications for this characteristic.
     *
     * @param value - The new value or a `Error` or {@link HapStatusError}.
     */
    updateValue(value: Nullable<CharacteristicValue> | Error | HapStatusError): Characteristic;
    /**
     * Sets the state of the characteristic to an errored state.
     * If a onGet or GET handler is set up, the errored state will be ignored and the characteristic
     * will always query the latest state by calling the provided handler.
     *
     * If a generic error object is supplied, the characteristic tries to extract a {@link HAPStatus} code
     * from the error message string. If not possible a generic {@link HAPStatus.SERVICE_COMMUNICATION_FAILURE} will be used.
     * If the supplied error object is an instance of {@link HapStatusError} the corresponding status will be used.
     *
     * @param error - The error object
     */
    updateValue(error: Error | HapStatusError): Characteristic;
    /**
     * This updates the value of the characteristic. If the value changed, a event notification will be sent to all connected
     * HomeKit controllers which are registered to receive event notifications for this characteristic.
     *
     * @param value - The new value.
     * @param callback - Deprecated parameter there to provide backwards compatibility. Callback is called instantly.
     * @param context - Passed to the {@link CharacteristicEventTypes.CHANGE} event handler.
     * @deprecated Parameter callback is deprecated.
     */
    updateValue(value: Nullable<CharacteristicValue>, callback?: () => void, context?: any): Characteristic;
    /**
     * This updates the value of the characteristic. If the value changed, a event notification will be sent to all connected
     * HomeKit controllers which are registered to receive event notifications for this characteristic.
     *
     * @param value - The new value.
     * @param context - Passed to the {@link CharacteristicEventTypes.CHANGE} event handler.
     */
    updateValue(value: Nullable<CharacteristicValue>, context?: any): Characteristic;
    /**
     * This method acts similarly to {@link updateValue} by setting the current value of the characteristic
     * without calling any {@link CharacteristicEventTypes.SET} or {@link onSet} handlers.
     * The difference is that this method forces a event notification sent (updateValue only sends one if the value changed).
     * This is especially useful for characteristics like {@link Characteristic.ButtonEvent} or {@link Characteristic.ProgrammableSwitchEvent}.
     *
     * @param value - The new value.
     * @param context - Passed to the {@link CharacteristicEventTypes.CHANGE} event handler.
     */
    sendEventNotification(value: CharacteristicValue, context?: any): Characteristic;
    /**
     * Called when a HAP requests wants to know the current value of the characteristic.
     *
     * @param connection - The HAP connection from which the request originated from.
     * @param context - Deprecated parameter. There for backwards compatibility.
     * @private Used by the Accessory to load the characteristic value
     */
    handleGetRequest(connection?: HAPConnection, context?: any): Promise<Nullable<CharacteristicValue>>;
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
    handleSetRequest(value: CharacteristicValue, connection?: HAPConnection, context?: any): Promise<CharacteristicValue | void>;
    /**
     * Called once a HomeKit controller subscribes to events of this characteristics.
     * @private
     */
    subscribe(): void;
    /**
     * Called once a HomeKit controller unsubscribe to events of this characteristics or a HomeKit controller
     * which was subscribed to this characteristic disconnects.
     * @private
     */
    unsubscribe(): void;
    protected getDefaultValue(): Nullable<CharacteristicValue>;
    /**
     * Checks if the value received from the HAP request is valid.
     * If returned false the received value is not valid and {@link HAPStatus.INVALID_VALUE_IN_REQUEST}
     * must be returned.
     * @param value - Value supplied by the HomeKit controller
     */
    private validateClientSuppliedValue;
    /**
     * Checks if the value received from the API call is valid.
     * It adjust the value where it makes sense, prints a warning where values may be rejected with an error
     * in the future and throws an error which can't be converted to a valid value.
     *
     * @param value - The value received from the API call
     */
    private validateUserInput;
    /**
     * @private used to assign iid to characteristic
     */
    _assignID(identifierCache: IdentifierCache, accessoryName: string, serviceUUID: string, serviceSubtype?: string): void;
    private characteristicWarning;
    /**
     * @param event
     * @private
     */
    removeAllListeners(event?: string | symbol): this;
    /**
     * @param characteristic
     * @private
     */
    replaceBy(characteristic: Characteristic): void;
    /**
     * Returns a JSON representation of this characteristic suitable for delivering to HAP clients.
     * @private used to generate response to /accessories query
     */
    toHAP(connection: HAPConnection, contactGetHandlers?: boolean): Promise<CharacteristicJsonObject>;
    /**
     * Returns a JSON representation of this characteristic without the value.
     * @private used to generate the config hash
     */
    internalHAPRepresentation(): CharacteristicJsonObject;
    /**
     * Serialize characteristic into json string.
     *
     * @param characteristic - Characteristic object.
     * @private used to store characteristic on disk
     */
    static serialize(characteristic: Characteristic): SerializedCharacteristic;
    /**
     * Deserialize characteristic from json string.
     *
     * @param json - Json string representing a characteristic.
     * @private used to recreate characteristic from disk
     */
    static deserialize(json: SerializedCharacteristic): Characteristic;
}
//# sourceMappingURL=Characteristic.d.ts.map