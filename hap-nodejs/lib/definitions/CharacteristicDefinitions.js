"use strict";
// THIS FILE IS AUTO-GENERATED - DO NOT MODIFY
// V=888
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentRelativeHumidity = exports.CurrentPosition = exports.CurrentMediaState = exports.CurrentHumidifierDehumidifierState = exports.CurrentHorizontalTiltAngle = exports.CurrentHeatingCoolingState = exports.CurrentHeaterCoolerState = exports.CurrentFanState = exports.CurrentDoorState = exports.CurrentAmbientLightLevel = exports.CurrentAirPurifierState = exports.CryptoHash = exports.CoolingThresholdTemperature = exports.ContactSensorState = exports.ConnectionHealthMonitor = exports.ConfiguredName = exports.ConfigurationState = exports.ColorTemperature = exports.ClosedCaptions = exports.ChargingState = exports.CharacteristicValueTransitionControl = exports.CharacteristicValueActiveTransitionCount = exports.CCASignalDetectThreshold = exports.CCAEnergyDetectThreshold = exports.CarbonMonoxidePeakLevel = exports.CarbonMonoxideLevel = exports.CarbonMonoxideDetected = exports.CarbonDioxidePeakLevel = exports.CarbonDioxideLevel = exports.CarbonDioxideDetected = exports.CameraOperatingModeIndicator = exports.ButtonEvent = exports.Brightness = exports.BatteryLevel = exports.AudioFeedback = exports.AssetUpdateReadiness = exports.AppMatchingIdentifier = exports.AirQuality = exports.AirPlayEnable = exports.AirParticulateSize = exports.AirParticulateDensity = exports.AdministratorOnlyAccess = exports.ActivityInterval = exports.ActiveIdentifier = exports.Active = exports.AccessoryIdentifier = exports.AccessoryFlags = exports.AccessControlLevel = exports.AccessCodeSupportedConfiguration = exports.AccessCodeControlPoint = void 0;
exports.MatterFirmwareRevisionNumber = exports.Manufacturer = exports.ManuallyDisabled = exports.ManagedNetworkEnable = exports.MACTransmissionCounters = exports.MACRetransmissionMaximum = exports.Logs = exports.LockTargetState = exports.LockPhysicalControls = exports.LockManagementAutoSecurityTimeout = exports.LockLastKnownAction = exports.LockCurrentState = exports.LockControlPoint = exports.ListPairings = exports.LeakDetected = exports.IsConfigured = exports.InUse = exports.InputSourceType = exports.InputDeviceType = exports.ImageRotation = exports.ImageMirroring = exports.Identify = exports.Identifier = exports.Hue = exports.HomeKitCameraActive = exports.HoldPosition = exports.HeatingThresholdTemperature = exports.HeartBeat = exports.HardwareRevision = exports.HardwareFinish = exports.FirmwareUpdateStatus = exports.FirmwareUpdateReadiness = exports.FirmwareUpdateProtocolList = exports.FirmwareRevision = exports.FilterLifeLevel = exports.FilterChangeIndication = exports.EventTransmissionCounters = exports.EventSnapshotsActive = exports.EventRetransmissionMaximum = exports.DisplayOrder = exports.DigitalZoom = exports.DiagonalFieldOfView = exports.DataStreamHAPTransportInterrupt = exports.DataStreamHAPTransport = exports.CurrentVisibilityState = exports.CurrentVerticalTiltAngle = exports.CurrentTransport = exports.CurrentTiltAngle = exports.CurrentTemperature = exports.CurrentSlatState = void 0;
exports.ResetFilterIndication = exports.RemoteKey = exports.RemainingDuration = exports.RelayState = exports.RelayEnabled = exports.RelayControlPoint = exports.RelativeHumidityHumidifierThreshold = exports.RelativeHumidityDehumidifierThreshold = exports.RecordingAudioActive = exports.ReceiverSensitivity = exports.ReceivedSignalStrengthIndication = exports.ProgramMode = exports.ProgrammableSwitchOutputState = exports.ProgrammableSwitchEvent = exports.ProductData = exports.PreferredWiFiList = exports.PowerModeSelection = exports.PositionState = exports.PM2_5Density = exports.PM10Density = exports.Ping = exports.PictureMode = exports.PeriodicSnapshotsActive = exports.PasswordSetting = exports.PairVerify = exports.PairSetup = exports.PairingFeatures = exports.OzoneDensity = exports.OutletInUse = exports.OpticalZoom = exports.OperatingStateResponse = exports.On = exports.OccupancyDetected = exports.ObstructionDetected = exports.NitrogenDioxideDensity = exports.NightVision = exports.NFCAccessSupportedConfiguration = exports.NFCAccessControlPoint = exports.NetworkClientStatusControl = exports.NetworkClientProfileControl = exports.NetworkAccessViolationControl = exports.Name = exports.Mute = exports.MultifunctionButton = exports.MotionDetected = exports.Model = exports.MetricsBufferFullState = exports.MediaAccessControlLevel = exports.MaximumTransmitPower = exports.MatterFirmwareUpdateStatus = void 0;
exports.SupportedFirmwareUpdateConfiguration = exports.SupportedDiagnosticsSnapshot = exports.SupportedDiagnosticsModes = exports.SupportedDataStreamTransportConfiguration = exports.SupportedCharacteristicValueTransitionConfiguration = exports.SupportedCameraRecordingConfiguration = exports.SupportedAudioStreamConfiguration = exports.SupportedAudioRecordingConfiguration = exports.SupportedAssetTypes = exports.SulphurDioxideDensity = exports.StreamingStatus = exports.StatusTampered = exports.StatusLowBattery = exports.StatusJammed = exports.StatusFault = exports.StatusActive = exports.StagedFirmwareVersion = exports.SoftwareRevision = exports.SmokeDetected = exports.SleepInterval = exports.SleepDiscoveryMode = exports.SlatType = exports.SiriTouchToUse = exports.SiriListening = exports.SiriLightOnUse = exports.SiriInputType = exports.SiriEngineVersion = exports.SiriEndpointSessionStatus = exports.SiriEnable = exports.SignalToNoiseRatio = exports.SetupTransferTransport = exports.SetupEndpoints = exports.SetupDataStreamTransport = exports.SetDuration = exports.ServiceLabelNamespace = exports.ServiceLabelIndex = exports.SerialNumber = exports.SelectedSleepConfiguration = exports.SelectedSessionKeepaliveConfigurationList = exports.SelectedRTPStreamConfiguration = exports.SelectedDiagnosticsModes = exports.SelectedCameraRecordingConfiguration = exports.SelectedAudioStreamConfiguration = exports.SecuritySystemTargetState = exports.SecuritySystemCurrentState = exports.SecuritySystemAlarmType = exports.Saturation = exports.RouterStatus = exports.RotationSpeed = exports.RotationDirection = void 0;
exports.WiFiCapabilities = exports.WaterLevel = exports.WANStatusList = exports.WANConfigurationList = exports.WakeConfiguration = exports.VolumeSelector = exports.VolumeControlType = exports.Volume = exports.VOCDensity = exports.VideoAnalysisActive = exports.Version = exports.ValveType = exports.TunneledAccessoryStateNumber = exports.TunneledAccessoryConnected = exports.TunneledAccessoryAdvertising = exports.TunnelConnectionTimeout = exports.TransmitPower = exports.Token = exports.ThreadStatus = exports.ThreadOpenThreadVersion = exports.ThreadNodeCapabilities = exports.ThreadControlPoint = exports.ThirdPartyCameraActive = exports.TemperatureDisplayUnits = exports.TargetVisibilityState = exports.TargetVerticalTiltAngle = exports.TargetTiltAngle = exports.TargetTemperature = exports.TargetRelativeHumidity = exports.TargetPosition = exports.TargetMediaState = exports.TargetHumidifierDehumidifierState = exports.TargetHorizontalTiltAngle = exports.TargetHeatingCoolingState = exports.TargetHeaterCoolerState = exports.TargetFanState = exports.TargetDoorState = exports.TargetControlSupportedConfiguration = exports.TargetControlList = exports.TargetAirPurifierState = exports.TapType = exports.SwingMode = exports.SupportedVideoStreamConfiguration = exports.SupportedVideoRecordingConfiguration = exports.SupportedTransferTransportConfiguration = exports.SupportedSleepConfiguration = exports.SupportedSessionKeepaliveConfigurationList = exports.SupportedRTPConfiguration = exports.SupportedRouterConfiguration = exports.SupportedMetrics = void 0;
exports.WiFiSatelliteStatus = exports.WiFiConfigurationControl = void 0;
const Characteristic_1 = require("../Characteristic");
/**
 * Characteristic "Access Code Control Point"
 * @since iOS 15
 */
class AccessCodeControlPoint extends Characteristic_1.Characteristic {
    static UUID = "00000262-0000-1000-8000-0026BB765291";
    constructor() {
        super("Access Code Control Point", AccessCodeControlPoint.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "wr" /* Perms.WRITE_RESPONSE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.AccessCodeControlPoint = AccessCodeControlPoint;
Characteristic_1.Characteristic.AccessCodeControlPoint = AccessCodeControlPoint;
/**
 * Characteristic "Access Code Supported Configuration"
 * @since iOS 15
 */
class AccessCodeSupportedConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000261-0000-1000-8000-0026BB765291";
    constructor() {
        super("Access Code Supported Configuration", AccessCodeSupportedConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.AccessCodeSupportedConfiguration = AccessCodeSupportedConfiguration;
Characteristic_1.Characteristic.AccessCodeSupportedConfiguration = AccessCodeSupportedConfiguration;
/**
 * Characteristic "Access Control Level"
 */
class AccessControlLevel extends Characteristic_1.Characteristic {
    static UUID = "000000E5-0000-1000-8000-0026BB765291";
    constructor() {
        super("Access Control Level", AccessControlLevel.UUID, {
            format: "uint16" /* Formats.UINT16 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 2,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.AccessControlLevel = AccessControlLevel;
Characteristic_1.Characteristic.AccessControlLevel = AccessControlLevel;
/**
 * Characteristic "Accessory Flags"
 */
class AccessoryFlags extends Characteristic_1.Characteristic {
    static UUID = "000000A6-0000-1000-8000-0026BB765291";
    static REQUIRES_ADDITIONAL_SETUP_BIT_MASK = 1;
    constructor() {
        super("Accessory Flags", AccessoryFlags.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.AccessoryFlags = AccessoryFlags;
Characteristic_1.Characteristic.AccessoryFlags = AccessoryFlags;
/**
 * Characteristic "Accessory Identifier"
 */
class AccessoryIdentifier extends Characteristic_1.Characteristic {
    static UUID = "00000057-0000-1000-8000-0026BB765291";
    constructor() {
        super("Accessory Identifier", AccessoryIdentifier.UUID, {
            format: "string" /* Formats.STRING */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.AccessoryIdentifier = AccessoryIdentifier;
Characteristic_1.Characteristic.AccessoryIdentifier = AccessoryIdentifier;
/**
 * Characteristic "Active"
 */
class Active extends Characteristic_1.Characteristic {
    static UUID = "000000B0-0000-1000-8000-0026BB765291";
    static INACTIVE = 0;
    static ACTIVE = 1;
    constructor() {
        super("Active", Active.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.Active = Active;
Characteristic_1.Characteristic.Active = Active;
/**
 * Characteristic "Active Identifier"
 */
class ActiveIdentifier extends Characteristic_1.Characteristic {
    static UUID = "000000E7-0000-1000-8000-0026BB765291";
    constructor() {
        super("Active Identifier", ActiveIdentifier.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ActiveIdentifier = ActiveIdentifier;
Characteristic_1.Characteristic.ActiveIdentifier = ActiveIdentifier;
/**
 * Characteristic "Activity Interval"
 * @since iOS 14
 */
class ActivityInterval extends Characteristic_1.Characteristic {
    static UUID = "0000023B-0000-1000-8000-0026BB765291";
    constructor() {
        super("Activity Interval", ActivityInterval.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.ActivityInterval = ActivityInterval;
Characteristic_1.Characteristic.ActivityInterval = ActivityInterval;
/**
 * Characteristic "Administrator Only Access"
 */
class AdministratorOnlyAccess extends Characteristic_1.Characteristic {
    static UUID = "00000001-0000-1000-8000-0026BB765291";
    constructor() {
        super("Administrator Only Access", AdministratorOnlyAccess.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.AdministratorOnlyAccess = AdministratorOnlyAccess;
Characteristic_1.Characteristic.AdministratorOnlyAccess = AdministratorOnlyAccess;
/**
 * Characteristic "Air Particulate Density"
 */
class AirParticulateDensity extends Characteristic_1.Characteristic {
    static UUID = "00000064-0000-1000-8000-0026BB765291";
    constructor() {
        super("Air Particulate Density", AirParticulateDensity.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1000,
        });
        this.value = this.getDefaultValue();
    }
}
exports.AirParticulateDensity = AirParticulateDensity;
Characteristic_1.Characteristic.AirParticulateDensity = AirParticulateDensity;
/**
 * Characteristic "Air Particulate Size"
 */
class AirParticulateSize extends Characteristic_1.Characteristic {
    static UUID = "00000065-0000-1000-8000-0026BB765291";
    static _2_5_M = 0;
    static _10_M = 1;
    constructor() {
        super("Air Particulate Size", AirParticulateSize.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.AirParticulateSize = AirParticulateSize;
Characteristic_1.Characteristic.AirParticulateSize = AirParticulateSize;
/**
 * Characteristic "AirPlay Enable"
 */
class AirPlayEnable extends Characteristic_1.Characteristic {
    static UUID = "0000025B-0000-1000-8000-0026BB765291";
    constructor() {
        super("AirPlay Enable", AirPlayEnable.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.AirPlayEnable = AirPlayEnable;
Characteristic_1.Characteristic.AirPlayEnable = AirPlayEnable;
/**
 * Characteristic "Air Quality"
 */
class AirQuality extends Characteristic_1.Characteristic {
    static UUID = "00000095-0000-1000-8000-0026BB765291";
    static UNKNOWN = 0;
    static EXCELLENT = 1;
    static GOOD = 2;
    static FAIR = 3;
    static INFERIOR = 4;
    static POOR = 5;
    constructor() {
        super("Air Quality", AirQuality.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 5,
            minStep: 1,
            validValues: [0, 1, 2, 3, 4, 5],
        });
        this.value = this.getDefaultValue();
    }
}
exports.AirQuality = AirQuality;
Characteristic_1.Characteristic.AirQuality = AirQuality;
/**
 * Characteristic "App Matching Identifier"
 */
class AppMatchingIdentifier extends Characteristic_1.Characteristic {
    static UUID = "000000A4-0000-1000-8000-0026BB765291";
    constructor() {
        super("App Matching Identifier", AppMatchingIdentifier.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.AppMatchingIdentifier = AppMatchingIdentifier;
Characteristic_1.Characteristic.AppMatchingIdentifier = AppMatchingIdentifier;
/**
 * Characteristic "Asset Update Readiness"
 */
class AssetUpdateReadiness extends Characteristic_1.Characteristic {
    static UUID = "00000269-0000-1000-8000-0026BB765291";
    constructor() {
        super("Asset Update Readiness", AssetUpdateReadiness.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.AssetUpdateReadiness = AssetUpdateReadiness;
Characteristic_1.Characteristic.AssetUpdateReadiness = AssetUpdateReadiness;
/**
 * Characteristic "Audio Feedback"
 */
class AudioFeedback extends Characteristic_1.Characteristic {
    static UUID = "00000005-0000-1000-8000-0026BB765291";
    constructor() {
        super("Audio Feedback", AudioFeedback.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.AudioFeedback = AudioFeedback;
Characteristic_1.Characteristic.AudioFeedback = AudioFeedback;
/**
 * Characteristic "Battery Level"
 */
class BatteryLevel extends Characteristic_1.Characteristic {
    static UUID = "00000068-0000-1000-8000-0026BB765291";
    constructor() {
        super("Battery Level", BatteryLevel.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            unit: "percentage" /* Units.PERCENTAGE */,
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.BatteryLevel = BatteryLevel;
Characteristic_1.Characteristic.BatteryLevel = BatteryLevel;
/**
 * Characteristic "Brightness"
 */
class Brightness extends Characteristic_1.Characteristic {
    static UUID = "00000008-0000-1000-8000-0026BB765291";
    constructor() {
        super("Brightness", Brightness.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "percentage" /* Units.PERCENTAGE */,
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.Brightness = Brightness;
Characteristic_1.Characteristic.Brightness = Brightness;
/**
 * Characteristic "Button Event"
 */
class ButtonEvent extends Characteristic_1.Characteristic {
    static UUID = "00000126-0000-1000-8000-0026BB765291";
    constructor() {
        super("Button Event", ButtonEvent.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            adminOnlyAccess: [2 /* Access.NOTIFY */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ButtonEvent = ButtonEvent;
Characteristic_1.Characteristic.ButtonEvent = ButtonEvent;
/**
 * Characteristic "Camera Operating Mode Indicator"
 */
class CameraOperatingModeIndicator extends Characteristic_1.Characteristic {
    static UUID = "0000021D-0000-1000-8000-0026BB765291";
    static DISABLE = 0;
    static ENABLE = 1;
    constructor() {
        super("Camera Operating Mode Indicator", CameraOperatingModeIndicator.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "tw" /* Perms.TIMED_WRITE */],
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CameraOperatingModeIndicator = CameraOperatingModeIndicator;
Characteristic_1.Characteristic.CameraOperatingModeIndicator = CameraOperatingModeIndicator;
/**
 * Characteristic "Carbon Dioxide Detected"
 */
class CarbonDioxideDetected extends Characteristic_1.Characteristic {
    static UUID = "00000092-0000-1000-8000-0026BB765291";
    static CO2_LEVELS_NORMAL = 0;
    static CO2_LEVELS_ABNORMAL = 1;
    constructor() {
        super("Carbon Dioxide Detected", CarbonDioxideDetected.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CarbonDioxideDetected = CarbonDioxideDetected;
Characteristic_1.Characteristic.CarbonDioxideDetected = CarbonDioxideDetected;
/**
 * Characteristic "Carbon Dioxide Level"
 */
class CarbonDioxideLevel extends Characteristic_1.Characteristic {
    static UUID = "00000093-0000-1000-8000-0026BB765291";
    constructor() {
        super("Carbon Dioxide Level", CarbonDioxideLevel.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 100000,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.CarbonDioxideLevel = CarbonDioxideLevel;
Characteristic_1.Characteristic.CarbonDioxideLevel = CarbonDioxideLevel;
/**
 * Characteristic "Carbon Dioxide Peak Level"
 */
class CarbonDioxidePeakLevel extends Characteristic_1.Characteristic {
    static UUID = "00000094-0000-1000-8000-0026BB765291";
    constructor() {
        super("Carbon Dioxide Peak Level", CarbonDioxidePeakLevel.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 100000,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.CarbonDioxidePeakLevel = CarbonDioxidePeakLevel;
Characteristic_1.Characteristic.CarbonDioxidePeakLevel = CarbonDioxidePeakLevel;
/**
 * Characteristic "Carbon Monoxide Detected"
 */
class CarbonMonoxideDetected extends Characteristic_1.Characteristic {
    static UUID = "00000069-0000-1000-8000-0026BB765291";
    static CO_LEVELS_NORMAL = 0;
    static CO_LEVELS_ABNORMAL = 1;
    constructor() {
        super("Carbon Monoxide Detected", CarbonMonoxideDetected.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CarbonMonoxideDetected = CarbonMonoxideDetected;
Characteristic_1.Characteristic.CarbonMonoxideDetected = CarbonMonoxideDetected;
/**
 * Characteristic "Carbon Monoxide Level"
 */
class CarbonMonoxideLevel extends Characteristic_1.Characteristic {
    static UUID = "00000090-0000-1000-8000-0026BB765291";
    constructor() {
        super("Carbon Monoxide Level", CarbonMonoxideLevel.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.CarbonMonoxideLevel = CarbonMonoxideLevel;
Characteristic_1.Characteristic.CarbonMonoxideLevel = CarbonMonoxideLevel;
/**
 * Characteristic "Carbon Monoxide Peak Level"
 */
class CarbonMonoxidePeakLevel extends Characteristic_1.Characteristic {
    static UUID = "00000091-0000-1000-8000-0026BB765291";
    constructor() {
        super("Carbon Monoxide Peak Level", CarbonMonoxidePeakLevel.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.CarbonMonoxidePeakLevel = CarbonMonoxidePeakLevel;
Characteristic_1.Characteristic.CarbonMonoxidePeakLevel = CarbonMonoxidePeakLevel;
/**
 * Characteristic "CCA Energy Detect Threshold"
 * @since iOS 14
 */
class CCAEnergyDetectThreshold extends Characteristic_1.Characteristic {
    static UUID = "00000246-0000-1000-8000-0026BB765291";
    constructor() {
        super("CCA Energy Detect Threshold", CCAEnergyDetectThreshold.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CCAEnergyDetectThreshold = CCAEnergyDetectThreshold;
Characteristic_1.Characteristic.CCAEnergyDetectThreshold = CCAEnergyDetectThreshold;
/**
 * Characteristic "CCA Signal Detect Threshold"
 * @since iOS 14
 */
class CCASignalDetectThreshold extends Characteristic_1.Characteristic {
    static UUID = "00000245-0000-1000-8000-0026BB765291";
    constructor() {
        super("CCA Signal Detect Threshold", CCASignalDetectThreshold.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CCASignalDetectThreshold = CCASignalDetectThreshold;
Characteristic_1.Characteristic.CCASignalDetectThreshold = CCASignalDetectThreshold;
/**
 * Characteristic "Characteristic Value Active Transition Count"
 * @since iOS 14
 */
class CharacteristicValueActiveTransitionCount extends Characteristic_1.Characteristic {
    static UUID = "0000024B-0000-1000-8000-0026BB765291";
    constructor() {
        super("Characteristic Value Active Transition Count", CharacteristicValueActiveTransitionCount.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CharacteristicValueActiveTransitionCount = CharacteristicValueActiveTransitionCount;
Characteristic_1.Characteristic.CharacteristicValueActiveTransitionCount = CharacteristicValueActiveTransitionCount;
/**
 * Characteristic "Characteristic Value Transition Control"
 * @since iOS 14
 */
class CharacteristicValueTransitionControl extends Characteristic_1.Characteristic {
    static UUID = "00000143-0000-1000-8000-0026BB765291";
    constructor() {
        super("Characteristic Value Transition Control", CharacteristicValueTransitionControl.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "wr" /* Perms.WRITE_RESPONSE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CharacteristicValueTransitionControl = CharacteristicValueTransitionControl;
Characteristic_1.Characteristic.CharacteristicValueTransitionControl = CharacteristicValueTransitionControl;
/**
 * Characteristic "Charging State"
 */
class ChargingState extends Characteristic_1.Characteristic {
    static UUID = "0000008F-0000-1000-8000-0026BB765291";
    static NOT_CHARGING = 0;
    static CHARGING = 1;
    static NOT_CHARGEABLE = 2;
    constructor() {
        super("Charging State", ChargingState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 2,
            minStep: 1,
            validValues: [0, 1, 2],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ChargingState = ChargingState;
Characteristic_1.Characteristic.ChargingState = ChargingState;
/**
 * Characteristic "Closed Captions"
 */
class ClosedCaptions extends Characteristic_1.Characteristic {
    static UUID = "000000DD-0000-1000-8000-0026BB765291";
    static DISABLED = 0;
    static ENABLED = 1;
    constructor() {
        super("Closed Captions", ClosedCaptions.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ClosedCaptions = ClosedCaptions;
Characteristic_1.Characteristic.ClosedCaptions = ClosedCaptions;
/**
 * Characteristic "Color Temperature"
 */
class ColorTemperature extends Characteristic_1.Characteristic {
    static UUID = "000000CE-0000-1000-8000-0026BB765291";
    constructor() {
        super("Color Temperature", ColorTemperature.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 140,
            maxValue: 500,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.ColorTemperature = ColorTemperature;
Characteristic_1.Characteristic.ColorTemperature = ColorTemperature;
/**
 * Characteristic "Configuration State"
 * @since iOS 15
 */
class ConfigurationState extends Characteristic_1.Characteristic {
    static UUID = "00000263-0000-1000-8000-0026BB765291";
    constructor() {
        super("Configuration State", ConfigurationState.UUID, {
            format: "uint16" /* Formats.UINT16 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ConfigurationState = ConfigurationState;
Characteristic_1.Characteristic.ConfigurationState = ConfigurationState;
/**
 * Characteristic "Configured Name"
 */
class ConfiguredName extends Characteristic_1.Characteristic {
    static UUID = "000000E3-0000-1000-8000-0026BB765291";
    constructor() {
        super("Configured Name", ConfiguredName.UUID, {
            format: "string" /* Formats.STRING */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ConfiguredName = ConfiguredName;
Characteristic_1.Characteristic.ConfiguredName = ConfiguredName;
/**
 * Characteristic "Connection Health Monitor"
 */
class ConnectionHealthMonitor extends Characteristic_1.Characteristic {
    static UUID = "00000273-0000-1000-8000-0026BB765291";
    constructor() {
        super("Connection Health Monitor", ConnectionHealthMonitor.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ConnectionHealthMonitor = ConnectionHealthMonitor;
Characteristic_1.Characteristic.ConnectionHealthMonitor = ConnectionHealthMonitor;
/**
 * Characteristic "Contact Sensor State"
 */
class ContactSensorState extends Characteristic_1.Characteristic {
    static UUID = "0000006A-0000-1000-8000-0026BB765291";
    static CONTACT_DETECTED = 0;
    static CONTACT_NOT_DETECTED = 1;
    constructor() {
        super("Contact Sensor State", ContactSensorState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ContactSensorState = ContactSensorState;
Characteristic_1.Characteristic.ContactSensorState = ContactSensorState;
/**
 * Characteristic "Cooling Threshold Temperature"
 */
class CoolingThresholdTemperature extends Characteristic_1.Characteristic {
    static UUID = "0000000D-0000-1000-8000-0026BB765291";
    constructor() {
        super("Cooling Threshold Temperature", CoolingThresholdTemperature.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "celsius" /* Units.CELSIUS */,
            minValue: 10,
            maxValue: 35,
            minStep: 0.1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.CoolingThresholdTemperature = CoolingThresholdTemperature;
Characteristic_1.Characteristic.CoolingThresholdTemperature = CoolingThresholdTemperature;
/**
 * Characteristic "Crypto Hash"
 * @since iOS 14.0
 */
class CryptoHash extends Characteristic_1.Characteristic {
    static UUID = "00000250-0000-1000-8000-0026BB765291";
    constructor() {
        super("Crypto Hash", CryptoHash.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pw" /* Perms.PAIRED_WRITE */, "wr" /* Perms.WRITE_RESPONSE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CryptoHash = CryptoHash;
Characteristic_1.Characteristic.CryptoHash = CryptoHash;
/**
 * Characteristic "Current Air Purifier State"
 */
class CurrentAirPurifierState extends Characteristic_1.Characteristic {
    static UUID = "000000A9-0000-1000-8000-0026BB765291";
    static INACTIVE = 0;
    static IDLE = 1;
    static PURIFYING_AIR = 2;
    constructor() {
        super("Current Air Purifier State", CurrentAirPurifierState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 2,
            minStep: 1,
            validValues: [0, 1, 2],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentAirPurifierState = CurrentAirPurifierState;
Characteristic_1.Characteristic.CurrentAirPurifierState = CurrentAirPurifierState;
/**
 * Characteristic "Current Ambient Light Level"
 */
class CurrentAmbientLightLevel extends Characteristic_1.Characteristic {
    static UUID = "0000006B-0000-1000-8000-0026BB765291";
    constructor() {
        super("Current Ambient Light Level", CurrentAmbientLightLevel.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            unit: "lux" /* Units.LUX */,
            minValue: 0.0001,
            maxValue: 100000,
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentAmbientLightLevel = CurrentAmbientLightLevel;
Characteristic_1.Characteristic.CurrentAmbientLightLevel = CurrentAmbientLightLevel;
/**
 * Characteristic "Current Door State"
 */
class CurrentDoorState extends Characteristic_1.Characteristic {
    static UUID = "0000000E-0000-1000-8000-0026BB765291";
    static OPEN = 0;
    static CLOSED = 1;
    static OPENING = 2;
    static CLOSING = 3;
    static STOPPED = 4;
    constructor() {
        super("Current Door State", CurrentDoorState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 4,
            minStep: 1,
            validValues: [0, 1, 2, 3, 4],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentDoorState = CurrentDoorState;
Characteristic_1.Characteristic.CurrentDoorState = CurrentDoorState;
/**
 * Characteristic "Current Fan State"
 */
class CurrentFanState extends Characteristic_1.Characteristic {
    static UUID = "000000AF-0000-1000-8000-0026BB765291";
    static INACTIVE = 0;
    static IDLE = 1;
    static BLOWING_AIR = 2;
    constructor() {
        super("Current Fan State", CurrentFanState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 2,
            minStep: 1,
            validValues: [0, 1, 2],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentFanState = CurrentFanState;
Characteristic_1.Characteristic.CurrentFanState = CurrentFanState;
/**
 * Characteristic "Current Heater-Cooler State"
 */
class CurrentHeaterCoolerState extends Characteristic_1.Characteristic {
    static UUID = "000000B1-0000-1000-8000-0026BB765291";
    static INACTIVE = 0;
    static IDLE = 1;
    static HEATING = 2;
    static COOLING = 3;
    constructor() {
        super("Current Heater-Cooler State", CurrentHeaterCoolerState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 3,
            minStep: 1,
            validValues: [0, 1, 2, 3],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentHeaterCoolerState = CurrentHeaterCoolerState;
Characteristic_1.Characteristic.CurrentHeaterCoolerState = CurrentHeaterCoolerState;
/**
 * Characteristic "Current Heating Cooling State"
 */
class CurrentHeatingCoolingState extends Characteristic_1.Characteristic {
    static UUID = "0000000F-0000-1000-8000-0026BB765291";
    static OFF = 0;
    static HEAT = 1;
    static COOL = 2;
    constructor() {
        super("Current Heating Cooling State", CurrentHeatingCoolingState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 2,
            minStep: 1,
            validValues: [0, 1, 2],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentHeatingCoolingState = CurrentHeatingCoolingState;
Characteristic_1.Characteristic.CurrentHeatingCoolingState = CurrentHeatingCoolingState;
/**
 * Characteristic "Current Horizontal Tilt Angle"
 */
class CurrentHorizontalTiltAngle extends Characteristic_1.Characteristic {
    static UUID = "0000006C-0000-1000-8000-0026BB765291";
    constructor() {
        super("Current Horizontal Tilt Angle", CurrentHorizontalTiltAngle.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            unit: "arcdegrees" /* Units.ARC_DEGREE */,
            minValue: -90,
            maxValue: 90,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentHorizontalTiltAngle = CurrentHorizontalTiltAngle;
Characteristic_1.Characteristic.CurrentHorizontalTiltAngle = CurrentHorizontalTiltAngle;
/**
 * Characteristic "Current Humidifier-Dehumidifier State"
 */
class CurrentHumidifierDehumidifierState extends Characteristic_1.Characteristic {
    static UUID = "000000B3-0000-1000-8000-0026BB765291";
    static INACTIVE = 0;
    static IDLE = 1;
    static HUMIDIFYING = 2;
    static DEHUMIDIFYING = 3;
    constructor() {
        super("Current Humidifier-Dehumidifier State", CurrentHumidifierDehumidifierState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 3,
            minStep: 1,
            validValues: [0, 1, 2, 3],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentHumidifierDehumidifierState = CurrentHumidifierDehumidifierState;
Characteristic_1.Characteristic.CurrentHumidifierDehumidifierState = CurrentHumidifierDehumidifierState;
/**
 * Characteristic "Current Media State"
 */
class CurrentMediaState extends Characteristic_1.Characteristic {
    static UUID = "000000E0-0000-1000-8000-0026BB765291";
    static PLAY = 0;
    static PAUSE = 1;
    static STOP = 2;
    static LOADING = 4;
    static INTERRUPTED = 5;
    constructor() {
        super("Current Media State", CurrentMediaState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 5,
            minStep: 1,
            validValues: [0, 1, 2, 4, 5],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentMediaState = CurrentMediaState;
Characteristic_1.Characteristic.CurrentMediaState = CurrentMediaState;
/**
 * Characteristic "Current Position"
 */
class CurrentPosition extends Characteristic_1.Characteristic {
    static UUID = "0000006D-0000-1000-8000-0026BB765291";
    constructor() {
        super("Current Position", CurrentPosition.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            unit: "percentage" /* Units.PERCENTAGE */,
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentPosition = CurrentPosition;
Characteristic_1.Characteristic.CurrentPosition = CurrentPosition;
/**
 * Characteristic "Current Relative Humidity"
 */
class CurrentRelativeHumidity extends Characteristic_1.Characteristic {
    static UUID = "00000010-0000-1000-8000-0026BB765291";
    constructor() {
        super("Current Relative Humidity", CurrentRelativeHumidity.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            unit: "percentage" /* Units.PERCENTAGE */,
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentRelativeHumidity = CurrentRelativeHumidity;
Characteristic_1.Characteristic.CurrentRelativeHumidity = CurrentRelativeHumidity;
/**
 * Characteristic "Current Slat State"
 */
class CurrentSlatState extends Characteristic_1.Characteristic {
    static UUID = "000000AA-0000-1000-8000-0026BB765291";
    static FIXED = 0;
    static JAMMED = 1;
    static SWINGING = 2;
    constructor() {
        super("Current Slat State", CurrentSlatState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 2,
            minStep: 1,
            validValues: [0, 1, 2],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentSlatState = CurrentSlatState;
Characteristic_1.Characteristic.CurrentSlatState = CurrentSlatState;
/**
 * Characteristic "Current Temperature"
 */
class CurrentTemperature extends Characteristic_1.Characteristic {
    static UUID = "00000011-0000-1000-8000-0026BB765291";
    constructor() {
        super("Current Temperature", CurrentTemperature.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            unit: "celsius" /* Units.CELSIUS */,
            minValue: -270,
            maxValue: 100,
            minStep: 0.1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentTemperature = CurrentTemperature;
Characteristic_1.Characteristic.CurrentTemperature = CurrentTemperature;
/**
 * Characteristic "Current Tilt Angle"
 */
class CurrentTiltAngle extends Characteristic_1.Characteristic {
    static UUID = "000000C1-0000-1000-8000-0026BB765291";
    constructor() {
        super("Current Tilt Angle", CurrentTiltAngle.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            unit: "arcdegrees" /* Units.ARC_DEGREE */,
            minValue: -90,
            maxValue: 90,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentTiltAngle = CurrentTiltAngle;
Characteristic_1.Characteristic.CurrentTiltAngle = CurrentTiltAngle;
/**
 * Characteristic "Current Transport"
 * @since iOS 14
 */
class CurrentTransport extends Characteristic_1.Characteristic {
    static UUID = "0000022B-0000-1000-8000-0026BB765291";
    constructor() {
        super("Current Transport", CurrentTransport.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentTransport = CurrentTransport;
Characteristic_1.Characteristic.CurrentTransport = CurrentTransport;
/**
 * Characteristic "Current Vertical Tilt Angle"
 */
class CurrentVerticalTiltAngle extends Characteristic_1.Characteristic {
    static UUID = "0000006E-0000-1000-8000-0026BB765291";
    constructor() {
        super("Current Vertical Tilt Angle", CurrentVerticalTiltAngle.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            unit: "arcdegrees" /* Units.ARC_DEGREE */,
            minValue: -90,
            maxValue: 90,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentVerticalTiltAngle = CurrentVerticalTiltAngle;
Characteristic_1.Characteristic.CurrentVerticalTiltAngle = CurrentVerticalTiltAngle;
/**
 * Characteristic "Current Visibility State"
 */
class CurrentVisibilityState extends Characteristic_1.Characteristic {
    static UUID = "00000135-0000-1000-8000-0026BB765291";
    static SHOWN = 0;
    static HIDDEN = 1;
    constructor() {
        super("Current Visibility State", CurrentVisibilityState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.CurrentVisibilityState = CurrentVisibilityState;
Characteristic_1.Characteristic.CurrentVisibilityState = CurrentVisibilityState;
/**
 * Characteristic "Data Stream HAP Transport"
 * @since iOS 14
 */
class DataStreamHAPTransport extends Characteristic_1.Characteristic {
    static UUID = "00000138-0000-1000-8000-0026BB765291";
    constructor() {
        super("Data Stream HAP Transport", DataStreamHAPTransport.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "wr" /* Perms.WRITE_RESPONSE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.DataStreamHAPTransport = DataStreamHAPTransport;
Characteristic_1.Characteristic.DataStreamHAPTransport = DataStreamHAPTransport;
/**
 * Characteristic "Data Stream HAP Transport Interrupt"
 * @since iOS 14
 */
class DataStreamHAPTransportInterrupt extends Characteristic_1.Characteristic {
    static UUID = "00000139-0000-1000-8000-0026BB765291";
    constructor() {
        super("Data Stream HAP Transport Interrupt", DataStreamHAPTransportInterrupt.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.DataStreamHAPTransportInterrupt = DataStreamHAPTransportInterrupt;
Characteristic_1.Characteristic.DataStreamHAPTransportInterrupt = DataStreamHAPTransportInterrupt;
/**
 * Characteristic "Diagonal Field Of View"
 * @since iOS 13.2
 */
class DiagonalFieldOfView extends Characteristic_1.Characteristic {
    static UUID = "00000224-0000-1000-8000-0026BB765291";
    constructor() {
        super("Diagonal Field Of View", DiagonalFieldOfView.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            unit: "arcdegrees" /* Units.ARC_DEGREE */,
            minValue: 0,
            maxValue: 360,
        });
        this.value = this.getDefaultValue();
    }
}
exports.DiagonalFieldOfView = DiagonalFieldOfView;
Characteristic_1.Characteristic.DiagonalFieldOfView = DiagonalFieldOfView;
/**
 * Characteristic "Digital Zoom"
 */
class DigitalZoom extends Characteristic_1.Characteristic {
    static UUID = "0000011D-0000-1000-8000-0026BB765291";
    constructor() {
        super("Digital Zoom", DigitalZoom.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minStep: 0.1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.DigitalZoom = DigitalZoom;
Characteristic_1.Characteristic.DigitalZoom = DigitalZoom;
/**
 * Characteristic "Display Order"
 */
class DisplayOrder extends Characteristic_1.Characteristic {
    static UUID = "00000136-0000-1000-8000-0026BB765291";
    constructor() {
        super("Display Order", DisplayOrder.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.DisplayOrder = DisplayOrder;
Characteristic_1.Characteristic.DisplayOrder = DisplayOrder;
/**
 * Characteristic "Event Retransmission Maximum"
 * @since iOS 14
 */
class EventRetransmissionMaximum extends Characteristic_1.Characteristic {
    static UUID = "0000023D-0000-1000-8000-0026BB765291";
    constructor() {
        super("Event Retransmission Maximum", EventRetransmissionMaximum.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.EventRetransmissionMaximum = EventRetransmissionMaximum;
Characteristic_1.Characteristic.EventRetransmissionMaximum = EventRetransmissionMaximum;
/**
 * Characteristic "Event Snapshots Active"
 */
class EventSnapshotsActive extends Characteristic_1.Characteristic {
    static UUID = "00000223-0000-1000-8000-0026BB765291";
    static DISABLE = 0;
    static ENABLE = 1;
    constructor() {
        super("Event Snapshots Active", EventSnapshotsActive.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.EventSnapshotsActive = EventSnapshotsActive;
Characteristic_1.Characteristic.EventSnapshotsActive = EventSnapshotsActive;
/**
 * Characteristic "Event Transmission Counters"
 * @since iOS 14
 */
class EventTransmissionCounters extends Characteristic_1.Characteristic {
    static UUID = "0000023E-0000-1000-8000-0026BB765291";
    constructor() {
        super("Event Transmission Counters", EventTransmissionCounters.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.EventTransmissionCounters = EventTransmissionCounters;
Characteristic_1.Characteristic.EventTransmissionCounters = EventTransmissionCounters;
/**
 * Characteristic "Filter Change Indication"
 */
class FilterChangeIndication extends Characteristic_1.Characteristic {
    static UUID = "000000AC-0000-1000-8000-0026BB765291";
    static FILTER_OK = 0;
    static CHANGE_FILTER = 1;
    constructor() {
        super("Filter Change Indication", FilterChangeIndication.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.FilterChangeIndication = FilterChangeIndication;
Characteristic_1.Characteristic.FilterChangeIndication = FilterChangeIndication;
/**
 * Characteristic "Filter Life Level"
 */
class FilterLifeLevel extends Characteristic_1.Characteristic {
    static UUID = "000000AB-0000-1000-8000-0026BB765291";
    constructor() {
        super("Filter Life Level", FilterLifeLevel.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.FilterLifeLevel = FilterLifeLevel;
Characteristic_1.Characteristic.FilterLifeLevel = FilterLifeLevel;
/**
 * Characteristic "Firmware Revision"
 */
class FirmwareRevision extends Characteristic_1.Characteristic {
    static UUID = "00000052-0000-1000-8000-0026BB765291";
    constructor() {
        super("Firmware Revision", FirmwareRevision.UUID, {
            format: "string" /* Formats.STRING */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.FirmwareRevision = FirmwareRevision;
Characteristic_1.Characteristic.FirmwareRevision = FirmwareRevision;
/**
 * Characteristic "Firmware Update Protocol List"
 */
class FirmwareUpdateProtocolList extends Characteristic_1.Characteristic {
    static UUID = "0000026F-0000-1000-8000-0026BB765291";
    constructor() {
        super("Firmware Update Protocol List", FirmwareUpdateProtocolList.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.FirmwareUpdateProtocolList = FirmwareUpdateProtocolList;
Characteristic_1.Characteristic.FirmwareUpdateProtocolList = FirmwareUpdateProtocolList;
/**
 * Characteristic "Firmware Update Readiness"
 */
class FirmwareUpdateReadiness extends Characteristic_1.Characteristic {
    static UUID = "00000234-0000-1000-8000-0026BB765291";
    constructor() {
        super("Firmware Update Readiness", FirmwareUpdateReadiness.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.FirmwareUpdateReadiness = FirmwareUpdateReadiness;
Characteristic_1.Characteristic.FirmwareUpdateReadiness = FirmwareUpdateReadiness;
/**
 * Characteristic "Firmware Update Status"
 */
class FirmwareUpdateStatus extends Characteristic_1.Characteristic {
    static UUID = "00000235-0000-1000-8000-0026BB765291";
    constructor() {
        super("Firmware Update Status", FirmwareUpdateStatus.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.FirmwareUpdateStatus = FirmwareUpdateStatus;
Characteristic_1.Characteristic.FirmwareUpdateStatus = FirmwareUpdateStatus;
/**
 * Characteristic "Hardware Finish"
 * @since iOS 15
 */
class HardwareFinish extends Characteristic_1.Characteristic {
    static UUID = "0000026C-0000-1000-8000-0026BB765291";
    constructor() {
        super("Hardware Finish", HardwareFinish.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.HardwareFinish = HardwareFinish;
Characteristic_1.Characteristic.HardwareFinish = HardwareFinish;
/**
 * Characteristic "Hardware Revision"
 */
class HardwareRevision extends Characteristic_1.Characteristic {
    static UUID = "00000053-0000-1000-8000-0026BB765291";
    constructor() {
        super("Hardware Revision", HardwareRevision.UUID, {
            format: "string" /* Formats.STRING */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.HardwareRevision = HardwareRevision;
Characteristic_1.Characteristic.HardwareRevision = HardwareRevision;
/**
 * Characteristic "Heart Beat"
 * @since iOS 14
 */
class HeartBeat extends Characteristic_1.Characteristic {
    static UUID = "0000024A-0000-1000-8000-0026BB765291";
    constructor() {
        super("Heart Beat", HeartBeat.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.HeartBeat = HeartBeat;
Characteristic_1.Characteristic.HeartBeat = HeartBeat;
/**
 * Characteristic "Heating Threshold Temperature"
 */
class HeatingThresholdTemperature extends Characteristic_1.Characteristic {
    static UUID = "00000012-0000-1000-8000-0026BB765291";
    constructor() {
        super("Heating Threshold Temperature", HeatingThresholdTemperature.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "celsius" /* Units.CELSIUS */,
            minValue: 0,
            maxValue: 25,
            minStep: 0.1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.HeatingThresholdTemperature = HeatingThresholdTemperature;
Characteristic_1.Characteristic.HeatingThresholdTemperature = HeatingThresholdTemperature;
/**
 * Characteristic "Hold Position"
 */
class HoldPosition extends Characteristic_1.Characteristic {
    static UUID = "0000006F-0000-1000-8000-0026BB765291";
    constructor() {
        super("Hold Position", HoldPosition.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.HoldPosition = HoldPosition;
Characteristic_1.Characteristic.HoldPosition = HoldPosition;
/**
 * Characteristic "HomeKit Camera Active"
 */
class HomeKitCameraActive extends Characteristic_1.Characteristic {
    static UUID = "0000021B-0000-1000-8000-0026BB765291";
    static OFF = 0;
    static ON = 1;
    constructor() {
        super("HomeKit Camera Active", HomeKitCameraActive.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.HomeKitCameraActive = HomeKitCameraActive;
Characteristic_1.Characteristic.HomeKitCameraActive = HomeKitCameraActive;
/**
 * Characteristic "Hue"
 */
class Hue extends Characteristic_1.Characteristic {
    static UUID = "00000013-0000-1000-8000-0026BB765291";
    constructor() {
        super("Hue", Hue.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "arcdegrees" /* Units.ARC_DEGREE */,
            minValue: 0,
            maxValue: 360,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.Hue = Hue;
Characteristic_1.Characteristic.Hue = Hue;
/**
 * Characteristic "Identifier"
 */
class Identifier extends Characteristic_1.Characteristic {
    static UUID = "000000E6-0000-1000-8000-0026BB765291";
    constructor() {
        super("Identifier", Identifier.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.Identifier = Identifier;
Characteristic_1.Characteristic.Identifier = Identifier;
/**
 * Characteristic "Identify"
 */
class Identify extends Characteristic_1.Characteristic {
    static UUID = "00000014-0000-1000-8000-0026BB765291";
    constructor() {
        super("Identify", Identify.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.Identify = Identify;
Characteristic_1.Characteristic.Identify = Identify;
/**
 * Characteristic "Image Mirroring"
 */
class ImageMirroring extends Characteristic_1.Characteristic {
    static UUID = "0000011F-0000-1000-8000-0026BB765291";
    constructor() {
        super("Image Mirroring", ImageMirroring.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ImageMirroring = ImageMirroring;
Characteristic_1.Characteristic.ImageMirroring = ImageMirroring;
/**
 * Characteristic "Image Rotation"
 */
class ImageRotation extends Characteristic_1.Characteristic {
    static UUID = "0000011E-0000-1000-8000-0026BB765291";
    constructor() {
        super("Image Rotation", ImageRotation.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "arcdegrees" /* Units.ARC_DEGREE */,
            minValue: 0,
            maxValue: 360,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.ImageRotation = ImageRotation;
Characteristic_1.Characteristic.ImageRotation = ImageRotation;
/**
 * Characteristic "Input Device Type"
 */
class InputDeviceType extends Characteristic_1.Characteristic {
    static UUID = "000000DC-0000-1000-8000-0026BB765291";
    static OTHER = 0;
    static TV = 1;
    static RECORDING = 2;
    static TUNER = 3;
    static PLAYBACK = 4;
    static AUDIO_SYSTEM = 5;
    constructor() {
        super("Input Device Type", InputDeviceType.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 6,
            minStep: 1,
            validValues: [0, 1, 2, 3, 4, 5, 6],
        });
        this.value = this.getDefaultValue();
    }
}
exports.InputDeviceType = InputDeviceType;
Characteristic_1.Characteristic.InputDeviceType = InputDeviceType;
/**
 * Characteristic "Input Source Type"
 */
class InputSourceType extends Characteristic_1.Characteristic {
    static UUID = "000000DB-0000-1000-8000-0026BB765291";
    static OTHER = 0;
    static HOME_SCREEN = 1;
    static TUNER = 2;
    static HDMI = 3;
    static COMPOSITE_VIDEO = 4;
    static S_VIDEO = 5;
    static COMPONENT_VIDEO = 6;
    static DVI = 7;
    static AIRPLAY = 8;
    static USB = 9;
    static APPLICATION = 10;
    constructor() {
        super("Input Source Type", InputSourceType.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 10,
            minStep: 1,
            validValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });
        this.value = this.getDefaultValue();
    }
}
exports.InputSourceType = InputSourceType;
Characteristic_1.Characteristic.InputSourceType = InputSourceType;
/**
 * Characteristic "In Use"
 */
class InUse extends Characteristic_1.Characteristic {
    static UUID = "000000D2-0000-1000-8000-0026BB765291";
    static NOT_IN_USE = 0;
    static IN_USE = 1;
    constructor() {
        super("In Use", InUse.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.InUse = InUse;
Characteristic_1.Characteristic.InUse = InUse;
/**
 * Characteristic "Is Configured"
 */
class IsConfigured extends Characteristic_1.Characteristic {
    static UUID = "000000D6-0000-1000-8000-0026BB765291";
    static NOT_CONFIGURED = 0;
    static CONFIGURED = 1;
    constructor() {
        super("Is Configured", IsConfigured.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.IsConfigured = IsConfigured;
Characteristic_1.Characteristic.IsConfigured = IsConfigured;
/**
 * Characteristic "Leak Detected"
 */
class LeakDetected extends Characteristic_1.Characteristic {
    static UUID = "00000070-0000-1000-8000-0026BB765291";
    static LEAK_NOT_DETECTED = 0;
    static LEAK_DETECTED = 1;
    constructor() {
        super("Leak Detected", LeakDetected.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.LeakDetected = LeakDetected;
Characteristic_1.Characteristic.LeakDetected = LeakDetected;
/**
 * Characteristic "List Pairings"
 */
class ListPairings extends Characteristic_1.Characteristic {
    static UUID = "00000050-0000-1000-8000-0026BB765291";
    constructor() {
        super("List Pairings", ListPairings.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ListPairings = ListPairings;
Characteristic_1.Characteristic.ListPairings = ListPairings;
/**
 * Characteristic "Lock Control Point"
 */
class LockControlPoint extends Characteristic_1.Characteristic {
    static UUID = "00000019-0000-1000-8000-0026BB765291";
    constructor() {
        super("Lock Control Point", LockControlPoint.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.LockControlPoint = LockControlPoint;
Characteristic_1.Characteristic.LockControlPoint = LockControlPoint;
/**
 * Characteristic "Lock Current State"
 */
class LockCurrentState extends Characteristic_1.Characteristic {
    static UUID = "0000001D-0000-1000-8000-0026BB765291";
    static UNSECURED = 0;
    static SECURED = 1;
    static JAMMED = 2;
    static UNKNOWN = 3;
    constructor() {
        super("Lock Current State", LockCurrentState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 3,
            minStep: 1,
            validValues: [0, 1, 2, 3],
        });
        this.value = this.getDefaultValue();
    }
}
exports.LockCurrentState = LockCurrentState;
Characteristic_1.Characteristic.LockCurrentState = LockCurrentState;
/**
 * Characteristic "Lock Last Known Action"
 */
class LockLastKnownAction extends Characteristic_1.Characteristic {
    static UUID = "0000001C-0000-1000-8000-0026BB765291";
    static SECURED_PHYSICALLY_INTERIOR = 0;
    static UNSECURED_PHYSICALLY_INTERIOR = 1;
    static SECURED_PHYSICALLY_EXTERIOR = 2;
    static UNSECURED_PHYSICALLY_EXTERIOR = 3;
    static SECURED_BY_KEYPAD = 4;
    static UNSECURED_BY_KEYPAD = 5;
    static SECURED_REMOTELY = 6;
    static UNSECURED_REMOTELY = 7;
    static SECURED_BY_AUTO_SECURE_TIMEOUT = 8;
    static SECURED_PHYSICALLY = 9;
    static UNSECURED_PHYSICALLY = 10;
    constructor() {
        super("Lock Last Known Action", LockLastKnownAction.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 10,
            minStep: 1,
            validValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });
        this.value = this.getDefaultValue();
    }
}
exports.LockLastKnownAction = LockLastKnownAction;
Characteristic_1.Characteristic.LockLastKnownAction = LockLastKnownAction;
/**
 * Characteristic "Lock Management Auto Security Timeout"
 */
class LockManagementAutoSecurityTimeout extends Characteristic_1.Characteristic {
    static UUID = "0000001A-0000-1000-8000-0026BB765291";
    constructor() {
        super("Lock Management Auto Security Timeout", LockManagementAutoSecurityTimeout.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "seconds" /* Units.SECONDS */,
        });
        this.value = this.getDefaultValue();
    }
}
exports.LockManagementAutoSecurityTimeout = LockManagementAutoSecurityTimeout;
Characteristic_1.Characteristic.LockManagementAutoSecurityTimeout = LockManagementAutoSecurityTimeout;
/**
 * Characteristic "Lock Physical Controls"
 */
class LockPhysicalControls extends Characteristic_1.Characteristic {
    static UUID = "000000A7-0000-1000-8000-0026BB765291";
    static CONTROL_LOCK_DISABLED = 0;
    static CONTROL_LOCK_ENABLED = 1;
    constructor() {
        super("Lock Physical Controls", LockPhysicalControls.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.LockPhysicalControls = LockPhysicalControls;
Characteristic_1.Characteristic.LockPhysicalControls = LockPhysicalControls;
/**
 * Characteristic "Lock Target State"
 */
class LockTargetState extends Characteristic_1.Characteristic {
    static UUID = "0000001E-0000-1000-8000-0026BB765291";
    static UNSECURED = 0;
    static SECURED = 1;
    constructor() {
        super("Lock Target State", LockTargetState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.LockTargetState = LockTargetState;
Characteristic_1.Characteristic.LockTargetState = LockTargetState;
/**
 * Characteristic "Logs"
 */
class Logs extends Characteristic_1.Characteristic {
    static UUID = "0000001F-0000-1000-8000-0026BB765291";
    constructor() {
        super("Logs", Logs.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.Logs = Logs;
Characteristic_1.Characteristic.Logs = Logs;
/**
 * Characteristic "MAC Retransmission Maximum"
 * @since iOS 14
 */
class MACRetransmissionMaximum extends Characteristic_1.Characteristic {
    static UUID = "00000247-0000-1000-8000-0026BB765291";
    constructor() {
        super("MAC Retransmission Maximum", MACRetransmissionMaximum.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.MACRetransmissionMaximum = MACRetransmissionMaximum;
Characteristic_1.Characteristic.MACRetransmissionMaximum = MACRetransmissionMaximum;
/**
 * Characteristic "MAC Transmission Counters"
 */
class MACTransmissionCounters extends Characteristic_1.Characteristic {
    static UUID = "00000248-0000-1000-8000-0026BB765291";
    constructor() {
        super("MAC Transmission Counters", MACTransmissionCounters.UUID, {
            format: "data" /* Formats.DATA */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.MACTransmissionCounters = MACTransmissionCounters;
Characteristic_1.Characteristic.MACTransmissionCounters = MACTransmissionCounters;
/**
 * Characteristic "Managed Network Enable"
 */
class ManagedNetworkEnable extends Characteristic_1.Characteristic {
    static UUID = "00000215-0000-1000-8000-0026BB765291";
    static DISABLED = 0;
    static ENABLED = 1;
    constructor() {
        super("Managed Network Enable", ManagedNetworkEnable.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "tw" /* Perms.TIMED_WRITE */],
            minValue: 0,
            maxValue: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ManagedNetworkEnable = ManagedNetworkEnable;
Characteristic_1.Characteristic.ManagedNetworkEnable = ManagedNetworkEnable;
/**
 * Characteristic "Manually Disabled"
 */
class ManuallyDisabled extends Characteristic_1.Characteristic {
    static UUID = "00000227-0000-1000-8000-0026BB765291";
    static ENABLED = 0;
    static DISABLED = 1;
    constructor() {
        super("Manually Disabled", ManuallyDisabled.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ManuallyDisabled = ManuallyDisabled;
Characteristic_1.Characteristic.ManuallyDisabled = ManuallyDisabled;
/**
 * Characteristic "Manufacturer"
 */
class Manufacturer extends Characteristic_1.Characteristic {
    static UUID = "00000020-0000-1000-8000-0026BB765291";
    constructor() {
        super("Manufacturer", Manufacturer.UUID, {
            format: "string" /* Formats.STRING */,
            perms: ["pr" /* Perms.PAIRED_READ */],
            maxLen: 64,
        });
        this.value = this.getDefaultValue();
    }
}
exports.Manufacturer = Manufacturer;
Characteristic_1.Characteristic.Manufacturer = Manufacturer;
/**
 * Characteristic "Matter Firmware Revision Number"
 */
class MatterFirmwareRevisionNumber extends Characteristic_1.Characteristic {
    static UUID = "0000026D-0000-1000-8000-0026BB765291";
    constructor() {
        super("Matter Firmware Revision Number", MatterFirmwareRevisionNumber.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.MatterFirmwareRevisionNumber = MatterFirmwareRevisionNumber;
Characteristic_1.Characteristic.MatterFirmwareRevisionNumber = MatterFirmwareRevisionNumber;
/**
 * Characteristic "Matter Firmware Update Status"
 */
class MatterFirmwareUpdateStatus extends Characteristic_1.Characteristic {
    static UUID = "0000026E-0000-1000-8000-0026BB765291";
    constructor() {
        super("Matter Firmware Update Status", MatterFirmwareUpdateStatus.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.MatterFirmwareUpdateStatus = MatterFirmwareUpdateStatus;
Characteristic_1.Characteristic.MatterFirmwareUpdateStatus = MatterFirmwareUpdateStatus;
/**
 * Characteristic "Maximum Transmit Power"
 * @since iOS 14
 */
class MaximumTransmitPower extends Characteristic_1.Characteristic {
    static UUID = "00000243-0000-1000-8000-0026BB765291";
    constructor() {
        super("Maximum Transmit Power", MaximumTransmitPower.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.MaximumTransmitPower = MaximumTransmitPower;
Characteristic_1.Characteristic.MaximumTransmitPower = MaximumTransmitPower;
/**
 * Characteristic "Media Access Control Level"
 */
class MediaAccessControlLevel extends Characteristic_1.Characteristic {
    static UUID = "000000EE-0000-1000-8000-0026BB765291";
    constructor() {
        super("Media Access Control Level", MediaAccessControlLevel.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 2,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.MediaAccessControlLevel = MediaAccessControlLevel;
Characteristic_1.Characteristic.MediaAccessControlLevel = MediaAccessControlLevel;
/**
 * Characteristic "Metrics Buffer Full State"
 */
class MetricsBufferFullState extends Characteristic_1.Characteristic {
    static UUID = "00000272-0000-1000-8000-0026BB765291";
    constructor() {
        super("Metrics Buffer Full State", MetricsBufferFullState.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.MetricsBufferFullState = MetricsBufferFullState;
Characteristic_1.Characteristic.MetricsBufferFullState = MetricsBufferFullState;
/**
 * Characteristic "Model"
 */
class Model extends Characteristic_1.Characteristic {
    static UUID = "00000021-0000-1000-8000-0026BB765291";
    constructor() {
        super("Model", Model.UUID, {
            format: "string" /* Formats.STRING */,
            perms: ["pr" /* Perms.PAIRED_READ */],
            maxLen: 64,
        });
        this.value = this.getDefaultValue();
    }
}
exports.Model = Model;
Characteristic_1.Characteristic.Model = Model;
/**
 * Characteristic "Motion Detected"
 */
class MotionDetected extends Characteristic_1.Characteristic {
    static UUID = "00000022-0000-1000-8000-0026BB765291";
    constructor() {
        super("Motion Detected", MotionDetected.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.MotionDetected = MotionDetected;
Characteristic_1.Characteristic.MotionDetected = MotionDetected;
/**
 * Characteristic "Multifunction Button"
 */
class MultifunctionButton extends Characteristic_1.Characteristic {
    static UUID = "0000026B-0000-1000-8000-0026BB765291";
    constructor() {
        super("Multifunction Button", MultifunctionButton.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.MultifunctionButton = MultifunctionButton;
Characteristic_1.Characteristic.MultifunctionButton = MultifunctionButton;
/**
 * Characteristic "Mute"
 */
class Mute extends Characteristic_1.Characteristic {
    static UUID = "0000011A-0000-1000-8000-0026BB765291";
    constructor() {
        super("Mute", Mute.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.Mute = Mute;
Characteristic_1.Characteristic.Mute = Mute;
/**
 * Characteristic "Name"
 */
class Name extends Characteristic_1.Characteristic {
    static UUID = "00000023-0000-1000-8000-0026BB765291";
    constructor() {
        super("Name", Name.UUID, {
            format: "string" /* Formats.STRING */,
            perms: ["pr" /* Perms.PAIRED_READ */],
            maxLen: 64,
        });
        this.value = this.getDefaultValue();
    }
}
exports.Name = Name;
Characteristic_1.Characteristic.Name = Name;
/**
 * Characteristic "Network Access Violation Control"
 */
class NetworkAccessViolationControl extends Characteristic_1.Characteristic {
    static UUID = "0000021F-0000-1000-8000-0026BB765291";
    constructor() {
        super("Network Access Violation Control", NetworkAccessViolationControl.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "tw" /* Perms.TIMED_WRITE */, "wr" /* Perms.WRITE_RESPONSE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.NetworkAccessViolationControl = NetworkAccessViolationControl;
Characteristic_1.Characteristic.NetworkAccessViolationControl = NetworkAccessViolationControl;
/**
 * Characteristic "Network Client Profile Control"
 */
class NetworkClientProfileControl extends Characteristic_1.Characteristic {
    static UUID = "0000020C-0000-1000-8000-0026BB765291";
    constructor() {
        super("Network Client Profile Control", NetworkClientProfileControl.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "tw" /* Perms.TIMED_WRITE */, "wr" /* Perms.WRITE_RESPONSE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.NetworkClientProfileControl = NetworkClientProfileControl;
Characteristic_1.Characteristic.NetworkClientProfileControl = NetworkClientProfileControl;
/**
 * Characteristic "Network Client Status Control"
 */
class NetworkClientStatusControl extends Characteristic_1.Characteristic {
    static UUID = "0000020D-0000-1000-8000-0026BB765291";
    constructor() {
        super("Network Client Status Control", NetworkClientStatusControl.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "wr" /* Perms.WRITE_RESPONSE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.NetworkClientStatusControl = NetworkClientStatusControl;
Characteristic_1.Characteristic.NetworkClientStatusControl = NetworkClientStatusControl;
/**
 * Characteristic "NFC Access Control Point"
 * @since iOS 15
 */
class NFCAccessControlPoint extends Characteristic_1.Characteristic {
    static UUID = "00000264-0000-1000-8000-0026BB765291";
    constructor() {
        super("NFC Access Control Point", NFCAccessControlPoint.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "wr" /* Perms.WRITE_RESPONSE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.NFCAccessControlPoint = NFCAccessControlPoint;
Characteristic_1.Characteristic.NFCAccessControlPoint = NFCAccessControlPoint;
/**
 * Characteristic "NFC Access Supported Configuration"
 * @since iOS 15
 */
class NFCAccessSupportedConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000265-0000-1000-8000-0026BB765291";
    constructor() {
        super("NFC Access Supported Configuration", NFCAccessSupportedConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.NFCAccessSupportedConfiguration = NFCAccessSupportedConfiguration;
Characteristic_1.Characteristic.NFCAccessSupportedConfiguration = NFCAccessSupportedConfiguration;
/**
 * Characteristic "Night Vision"
 */
class NightVision extends Characteristic_1.Characteristic {
    static UUID = "0000011B-0000-1000-8000-0026BB765291";
    constructor() {
        super("Night Vision", NightVision.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "tw" /* Perms.TIMED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.NightVision = NightVision;
Characteristic_1.Characteristic.NightVision = NightVision;
/**
 * Characteristic "Nitrogen Dioxide Density"
 */
class NitrogenDioxideDensity extends Characteristic_1.Characteristic {
    static UUID = "000000C4-0000-1000-8000-0026BB765291";
    constructor() {
        super("Nitrogen Dioxide Density", NitrogenDioxideDensity.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1000,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.NitrogenDioxideDensity = NitrogenDioxideDensity;
Characteristic_1.Characteristic.NitrogenDioxideDensity = NitrogenDioxideDensity;
/**
 * Characteristic "Obstruction Detected"
 */
class ObstructionDetected extends Characteristic_1.Characteristic {
    static UUID = "00000024-0000-1000-8000-0026BB765291";
    constructor() {
        super("Obstruction Detected", ObstructionDetected.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ObstructionDetected = ObstructionDetected;
Characteristic_1.Characteristic.ObstructionDetected = ObstructionDetected;
/**
 * Characteristic "Occupancy Detected"
 */
class OccupancyDetected extends Characteristic_1.Characteristic {
    static UUID = "00000071-0000-1000-8000-0026BB765291";
    static OCCUPANCY_NOT_DETECTED = 0;
    static OCCUPANCY_DETECTED = 1;
    constructor() {
        super("Occupancy Detected", OccupancyDetected.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.OccupancyDetected = OccupancyDetected;
Characteristic_1.Characteristic.OccupancyDetected = OccupancyDetected;
/**
 * Characteristic "On"
 */
class On extends Characteristic_1.Characteristic {
    static UUID = "00000025-0000-1000-8000-0026BB765291";
    constructor() {
        super("On", On.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.On = On;
Characteristic_1.Characteristic.On = On;
/**
 * Characteristic "Operating State Response"
 * @since iOS 14
 */
class OperatingStateResponse extends Characteristic_1.Characteristic {
    static UUID = "00000232-0000-1000-8000-0026BB765291";
    constructor() {
        super("Operating State Response", OperatingStateResponse.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.OperatingStateResponse = OperatingStateResponse;
Characteristic_1.Characteristic.OperatingStateResponse = OperatingStateResponse;
/**
 * Characteristic "Optical Zoom"
 */
class OpticalZoom extends Characteristic_1.Characteristic {
    static UUID = "0000011C-0000-1000-8000-0026BB765291";
    constructor() {
        super("Optical Zoom", OpticalZoom.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minStep: 0.1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.OpticalZoom = OpticalZoom;
Characteristic_1.Characteristic.OpticalZoom = OpticalZoom;
/**
 * Characteristic "Outlet In Use"
 */
class OutletInUse extends Characteristic_1.Characteristic {
    static UUID = "00000026-0000-1000-8000-0026BB765291";
    constructor() {
        super("Outlet In Use", OutletInUse.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.OutletInUse = OutletInUse;
Characteristic_1.Characteristic.OutletInUse = OutletInUse;
/**
 * Characteristic "Ozone Density"
 */
class OzoneDensity extends Characteristic_1.Characteristic {
    static UUID = "000000C3-0000-1000-8000-0026BB765291";
    constructor() {
        super("Ozone Density", OzoneDensity.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1000,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.OzoneDensity = OzoneDensity;
Characteristic_1.Characteristic.OzoneDensity = OzoneDensity;
/**
 * Characteristic "Pairing Features"
 */
class PairingFeatures extends Characteristic_1.Characteristic {
    static UUID = "0000004F-0000-1000-8000-0026BB765291";
    constructor() {
        super("Pairing Features", PairingFeatures.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.PairingFeatures = PairingFeatures;
Characteristic_1.Characteristic.PairingFeatures = PairingFeatures;
/**
 * Characteristic "Pair Setup"
 */
class PairSetup extends Characteristic_1.Characteristic {
    static UUID = "0000004C-0000-1000-8000-0026BB765291";
    constructor() {
        super("Pair Setup", PairSetup.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.PairSetup = PairSetup;
Characteristic_1.Characteristic.PairSetup = PairSetup;
/**
 * Characteristic "Pair Verify"
 */
class PairVerify extends Characteristic_1.Characteristic {
    static UUID = "0000004E-0000-1000-8000-0026BB765291";
    constructor() {
        super("Pair Verify", PairVerify.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.PairVerify = PairVerify;
Characteristic_1.Characteristic.PairVerify = PairVerify;
/**
 * Characteristic "Password Setting"
 */
class PasswordSetting extends Characteristic_1.Characteristic {
    static UUID = "000000E4-0000-1000-8000-0026BB765291";
    constructor() {
        super("Password Setting", PasswordSetting.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.PasswordSetting = PasswordSetting;
Characteristic_1.Characteristic.PasswordSetting = PasswordSetting;
/**
 * Characteristic "Periodic Snapshots Active"
 */
class PeriodicSnapshotsActive extends Characteristic_1.Characteristic {
    static UUID = "00000225-0000-1000-8000-0026BB765291";
    static DISABLE = 0;
    static ENABLE = 1;
    constructor() {
        super("Periodic Snapshots Active", PeriodicSnapshotsActive.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.PeriodicSnapshotsActive = PeriodicSnapshotsActive;
Characteristic_1.Characteristic.PeriodicSnapshotsActive = PeriodicSnapshotsActive;
/**
 * Characteristic "Picture Mode"
 */
class PictureMode extends Characteristic_1.Characteristic {
    static UUID = "000000E2-0000-1000-8000-0026BB765291";
    static OTHER = 0;
    static STANDARD = 1;
    static CALIBRATED = 2;
    static CALIBRATED_DARK = 3;
    static VIVID = 4;
    static GAME = 5;
    static COMPUTER = 6;
    static CUSTOM = 7;
    constructor() {
        super("Picture Mode", PictureMode.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 13,
            minStep: 1,
            validValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        });
        this.value = this.getDefaultValue();
    }
}
exports.PictureMode = PictureMode;
Characteristic_1.Characteristic.PictureMode = PictureMode;
/**
 * Characteristic "Ping"
 * @since iOS 14
 */
class Ping extends Characteristic_1.Characteristic {
    static UUID = "0000023C-0000-1000-8000-0026BB765291";
    constructor() {
        super("Ping", Ping.UUID, {
            format: "data" /* Formats.DATA */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.Ping = Ping;
Characteristic_1.Characteristic.Ping = Ping;
/**
 * Characteristic "PM10 Density"
 */
class PM10Density extends Characteristic_1.Characteristic {
    static UUID = "000000C7-0000-1000-8000-0026BB765291";
    constructor() {
        super("PM10 Density", PM10Density.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1000,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.PM10Density = PM10Density;
Characteristic_1.Characteristic.PM10Density = PM10Density;
/**
 * Characteristic "PM2.5 Density"
 */
class PM2_5Density extends Characteristic_1.Characteristic {
    static UUID = "000000C6-0000-1000-8000-0026BB765291";
    constructor() {
        super("PM2.5 Density", PM2_5Density.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1000,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.PM2_5Density = PM2_5Density;
Characteristic_1.Characteristic.PM2_5Density = PM2_5Density;
/**
 * Characteristic "Position State"
 */
class PositionState extends Characteristic_1.Characteristic {
    static UUID = "00000072-0000-1000-8000-0026BB765291";
    static DECREASING = 0;
    static INCREASING = 1;
    static STOPPED = 2;
    constructor() {
        super("Position State", PositionState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 2,
            minStep: 1,
            validValues: [0, 1, 2],
        });
        this.value = this.getDefaultValue();
    }
}
exports.PositionState = PositionState;
Characteristic_1.Characteristic.PositionState = PositionState;
/**
 * Characteristic "Power Mode Selection"
 */
class PowerModeSelection extends Characteristic_1.Characteristic {
    static UUID = "000000DF-0000-1000-8000-0026BB765291";
    static SHOW = 0;
    static HIDE = 1;
    constructor() {
        super("Power Mode Selection", PowerModeSelection.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.PowerModeSelection = PowerModeSelection;
Characteristic_1.Characteristic.PowerModeSelection = PowerModeSelection;
/**
 * Characteristic "Preferred Wi-Fi List"
 */
class PreferredWiFiList extends Characteristic_1.Characteristic {
    static UUID = "0000022E-0000-1000-8000-0026BB765291";
    constructor() {
        super("Preferred Wi-Fi List", PreferredWiFiList.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.PreferredWiFiList = PreferredWiFiList;
Characteristic_1.Characteristic.PreferredWiFiList = PreferredWiFiList;
/**
 * Characteristic "Product Data"
 */
class ProductData extends Characteristic_1.Characteristic {
    static UUID = "00000220-0000-1000-8000-0026BB765291";
    constructor() {
        super("Product Data", ProductData.UUID, {
            format: "data" /* Formats.DATA */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ProductData = ProductData;
Characteristic_1.Characteristic.ProductData = ProductData;
/**
 * Characteristic "Programmable Switch Event"
 */
class ProgrammableSwitchEvent extends Characteristic_1.Characteristic {
    static UUID = "00000073-0000-1000-8000-0026BB765291";
    static SINGLE_PRESS = 0;
    static DOUBLE_PRESS = 1;
    static LONG_PRESS = 2;
    constructor() {
        super("Programmable Switch Event", ProgrammableSwitchEvent.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 2,
            minStep: 1,
            validValues: [0, 1, 2],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ProgrammableSwitchEvent = ProgrammableSwitchEvent;
Characteristic_1.Characteristic.ProgrammableSwitchEvent = ProgrammableSwitchEvent;
/**
 * Characteristic "Programmable Switch Output State"
 */
class ProgrammableSwitchOutputState extends Characteristic_1.Characteristic {
    static UUID = "00000074-0000-1000-8000-0026BB765291";
    constructor() {
        super("Programmable Switch Output State", ProgrammableSwitchOutputState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.ProgrammableSwitchOutputState = ProgrammableSwitchOutputState;
Characteristic_1.Characteristic.ProgrammableSwitchOutputState = ProgrammableSwitchOutputState;
/**
 * Characteristic "Program Mode"
 */
class ProgramMode extends Characteristic_1.Characteristic {
    static UUID = "000000D1-0000-1000-8000-0026BB765291";
    static NO_PROGRAM_SCHEDULED = 0;
    static PROGRAM_SCHEDULED = 1;
    static PROGRAM_SCHEDULED_MANUAL_MODE = 2;
    constructor() {
        super("Program Mode", ProgramMode.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 2,
            minStep: 1,
            validValues: [0, 1, 2],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ProgramMode = ProgramMode;
Characteristic_1.Characteristic.ProgramMode = ProgramMode;
/**
 * Characteristic "Received Signal Strength Indication"
 * @since iOS 14
 */
class ReceivedSignalStrengthIndication extends Characteristic_1.Characteristic {
    static UUID = "0000023F-0000-1000-8000-0026BB765291";
    constructor() {
        super("Received Signal Strength Indication", ReceivedSignalStrengthIndication.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ReceivedSignalStrengthIndication = ReceivedSignalStrengthIndication;
Characteristic_1.Characteristic.ReceivedSignalStrengthIndication = ReceivedSignalStrengthIndication;
/**
 * Characteristic "Receiver Sensitivity"
 * @since iOS 14
 */
class ReceiverSensitivity extends Characteristic_1.Characteristic {
    static UUID = "00000244-0000-1000-8000-0026BB765291";
    constructor() {
        super("Receiver Sensitivity", ReceiverSensitivity.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ReceiverSensitivity = ReceiverSensitivity;
Characteristic_1.Characteristic.ReceiverSensitivity = ReceiverSensitivity;
/**
 * Characteristic "Recording Audio Active"
 */
class RecordingAudioActive extends Characteristic_1.Characteristic {
    static UUID = "00000226-0000-1000-8000-0026BB765291";
    static DISABLE = 0;
    static ENABLE = 1;
    constructor() {
        super("Recording Audio Active", RecordingAudioActive.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "tw" /* Perms.TIMED_WRITE */],
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.RecordingAudioActive = RecordingAudioActive;
Characteristic_1.Characteristic.RecordingAudioActive = RecordingAudioActive;
/**
 * Characteristic "Relative Humidity Dehumidifier Threshold"
 */
class RelativeHumidityDehumidifierThreshold extends Characteristic_1.Characteristic {
    static UUID = "000000C9-0000-1000-8000-0026BB765291";
    constructor() {
        super("Relative Humidity Dehumidifier Threshold", RelativeHumidityDehumidifierThreshold.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "percentage" /* Units.PERCENTAGE */,
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.RelativeHumidityDehumidifierThreshold = RelativeHumidityDehumidifierThreshold;
Characteristic_1.Characteristic.RelativeHumidityDehumidifierThreshold = RelativeHumidityDehumidifierThreshold;
/**
 * Characteristic "Relative Humidity Humidifier Threshold"
 */
class RelativeHumidityHumidifierThreshold extends Characteristic_1.Characteristic {
    static UUID = "000000CA-0000-1000-8000-0026BB765291";
    constructor() {
        super("Relative Humidity Humidifier Threshold", RelativeHumidityHumidifierThreshold.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "percentage" /* Units.PERCENTAGE */,
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.RelativeHumidityHumidifierThreshold = RelativeHumidityHumidifierThreshold;
Characteristic_1.Characteristic.RelativeHumidityHumidifierThreshold = RelativeHumidityHumidifierThreshold;
/**
 * Characteristic "Relay Control Point"
 * @deprecated Removed
 */
class RelayControlPoint extends Characteristic_1.Characteristic {
    static UUID = "0000005E-0000-1000-8000-0026BB765291";
    constructor() {
        super("Relay Control Point", RelayControlPoint.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.RelayControlPoint = RelayControlPoint;
// noinspection JSDeprecatedSymbols
Characteristic_1.Characteristic.RelayControlPoint = RelayControlPoint;
/**
 * Characteristic "Relay Enabled"
 * @deprecated Removed
 */
class RelayEnabled extends Characteristic_1.Characteristic {
    static UUID = "0000005B-0000-1000-8000-0026BB765291";
    constructor() {
        super("Relay Enabled", RelayEnabled.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.RelayEnabled = RelayEnabled;
// noinspection JSDeprecatedSymbols
Characteristic_1.Characteristic.RelayEnabled = RelayEnabled;
/**
 * Characteristic "Relay State"
 * @deprecated Removed
 */
class RelayState extends Characteristic_1.Characteristic {
    static UUID = "0000005C-0000-1000-8000-0026BB765291";
    constructor() {
        super("Relay State", RelayState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 5,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.RelayState = RelayState;
// noinspection JSDeprecatedSymbols
Characteristic_1.Characteristic.RelayState = RelayState;
/**
 * Characteristic "Remaining Duration"
 */
class RemainingDuration extends Characteristic_1.Characteristic {
    static UUID = "000000D4-0000-1000-8000-0026BB765291";
    constructor() {
        super("Remaining Duration", RemainingDuration.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            unit: "seconds" /* Units.SECONDS */,
            minValue: 0,
            maxValue: 3600,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.RemainingDuration = RemainingDuration;
Characteristic_1.Characteristic.RemainingDuration = RemainingDuration;
/**
 * Characteristic "Remote Key"
 */
class RemoteKey extends Characteristic_1.Characteristic {
    static UUID = "000000E1-0000-1000-8000-0026BB765291";
    static REWIND = 0;
    static FAST_FORWARD = 1;
    static NEXT_TRACK = 2;
    static PREVIOUS_TRACK = 3;
    static ARROW_UP = 4;
    static ARROW_DOWN = 5;
    static ARROW_LEFT = 6;
    static ARROW_RIGHT = 7;
    static SELECT = 8;
    static BACK = 9;
    static EXIT = 10;
    static PLAY_PAUSE = 11;
    static INFORMATION = 15;
    constructor() {
        super("Remote Key", RemoteKey.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 16,
            minStep: 1,
            validValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        });
        this.value = this.getDefaultValue();
    }
}
exports.RemoteKey = RemoteKey;
Characteristic_1.Characteristic.RemoteKey = RemoteKey;
/**
 * Characteristic "Reset Filter Indication"
 */
class ResetFilterIndication extends Characteristic_1.Characteristic {
    static UUID = "000000AD-0000-1000-8000-0026BB765291";
    constructor() {
        super("Reset Filter Indication", ResetFilterIndication.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["pw" /* Perms.PAIRED_WRITE */],
            minValue: 1,
            maxValue: 1,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.ResetFilterIndication = ResetFilterIndication;
Characteristic_1.Characteristic.ResetFilterIndication = ResetFilterIndication;
/**
 * Characteristic "Rotation Direction"
 */
class RotationDirection extends Characteristic_1.Characteristic {
    static UUID = "00000028-0000-1000-8000-0026BB765291";
    static CLOCKWISE = 0;
    static COUNTER_CLOCKWISE = 1;
    constructor() {
        super("Rotation Direction", RotationDirection.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.RotationDirection = RotationDirection;
Characteristic_1.Characteristic.RotationDirection = RotationDirection;
/**
 * Characteristic "Rotation Speed"
 */
class RotationSpeed extends Characteristic_1.Characteristic {
    static UUID = "00000029-0000-1000-8000-0026BB765291";
    constructor() {
        super("Rotation Speed", RotationSpeed.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "percentage" /* Units.PERCENTAGE */,
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.RotationSpeed = RotationSpeed;
Characteristic_1.Characteristic.RotationSpeed = RotationSpeed;
/**
 * Characteristic "Router Status"
 */
class RouterStatus extends Characteristic_1.Characteristic {
    static UUID = "0000020E-0000-1000-8000-0026BB765291";
    static READY = 0;
    static NOT_READY = 1;
    constructor() {
        super("Router Status", RouterStatus.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.RouterStatus = RouterStatus;
Characteristic_1.Characteristic.RouterStatus = RouterStatus;
/**
 * Characteristic "Saturation"
 */
class Saturation extends Characteristic_1.Characteristic {
    static UUID = "0000002F-0000-1000-8000-0026BB765291";
    constructor() {
        super("Saturation", Saturation.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "percentage" /* Units.PERCENTAGE */,
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.Saturation = Saturation;
Characteristic_1.Characteristic.Saturation = Saturation;
/**
 * Characteristic "Security System Alarm Type"
 */
class SecuritySystemAlarmType extends Characteristic_1.Characteristic {
    static UUID = "0000008E-0000-1000-8000-0026BB765291";
    static NO_ALARM = 0;
    static UNKNOWN = 1;
    constructor() {
        super("Security System Alarm Type", SecuritySystemAlarmType.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SecuritySystemAlarmType = SecuritySystemAlarmType;
Characteristic_1.Characteristic.SecuritySystemAlarmType = SecuritySystemAlarmType;
/**
 * Characteristic "Security System Current State"
 */
class SecuritySystemCurrentState extends Characteristic_1.Characteristic {
    static UUID = "00000066-0000-1000-8000-0026BB765291";
    static STAY_ARM = 0;
    static AWAY_ARM = 1;
    static NIGHT_ARM = 2;
    static DISARMED = 3;
    static ALARM_TRIGGERED = 4;
    constructor() {
        super("Security System Current State", SecuritySystemCurrentState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 4,
            minStep: 1,
            validValues: [0, 1, 2, 3, 4],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SecuritySystemCurrentState = SecuritySystemCurrentState;
Characteristic_1.Characteristic.SecuritySystemCurrentState = SecuritySystemCurrentState;
/**
 * Characteristic "Security System Target State"
 */
class SecuritySystemTargetState extends Characteristic_1.Characteristic {
    static UUID = "00000067-0000-1000-8000-0026BB765291";
    static STAY_ARM = 0;
    static AWAY_ARM = 1;
    static NIGHT_ARM = 2;
    static DISARM = 3;
    constructor() {
        super("Security System Target State", SecuritySystemTargetState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 3,
            minStep: 1,
            validValues: [0, 1, 2, 3],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SecuritySystemTargetState = SecuritySystemTargetState;
Characteristic_1.Characteristic.SecuritySystemTargetState = SecuritySystemTargetState;
/**
 * Characteristic "Selected Audio Stream Configuration"
 */
class SelectedAudioStreamConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000128-0000-1000-8000-0026BB765291";
    constructor() {
        super("Selected Audio Stream Configuration", SelectedAudioStreamConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SelectedAudioStreamConfiguration = SelectedAudioStreamConfiguration;
Characteristic_1.Characteristic.SelectedAudioStreamConfiguration = SelectedAudioStreamConfiguration;
/**
 * Characteristic "Selected Camera Recording Configuration"
 */
class SelectedCameraRecordingConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000209-0000-1000-8000-0026BB765291";
    constructor() {
        super("Selected Camera Recording Configuration", SelectedCameraRecordingConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SelectedCameraRecordingConfiguration = SelectedCameraRecordingConfiguration;
Characteristic_1.Characteristic.SelectedCameraRecordingConfiguration = SelectedCameraRecordingConfiguration;
/**
 * Characteristic "Selected Diagnostics Modes"
 */
class SelectedDiagnosticsModes extends Characteristic_1.Characteristic {
    static UUID = "0000024D-0000-1000-8000-0026BB765291";
    constructor() {
        super("Selected Diagnostics Modes", SelectedDiagnosticsModes.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SelectedDiagnosticsModes = SelectedDiagnosticsModes;
Characteristic_1.Characteristic.SelectedDiagnosticsModes = SelectedDiagnosticsModes;
/**
 * Characteristic "Selected RTP Stream Configuration"
 */
class SelectedRTPStreamConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000117-0000-1000-8000-0026BB765291";
    constructor() {
        super("Selected RTP Stream Configuration", SelectedRTPStreamConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SelectedRTPStreamConfiguration = SelectedRTPStreamConfiguration;
Characteristic_1.Characteristic.SelectedRTPStreamConfiguration = SelectedRTPStreamConfiguration;
/**
 * Characteristic "Selected Session Keep-alive Configuration List"
 */
class SelectedSessionKeepaliveConfigurationList extends Characteristic_1.Characteristic {
    static UUID = "00000275-0000-1000-8000-0026BB765291";
    constructor() {
        super("Selected Session Keep-alive Configuration List", SelectedSessionKeepaliveConfigurationList.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SelectedSessionKeepaliveConfigurationList = SelectedSessionKeepaliveConfigurationList;
Characteristic_1.Characteristic.SelectedSessionKeepaliveConfigurationList = SelectedSessionKeepaliveConfigurationList;
/**
 * Characteristic "Selected Sleep Configuration"
 */
class SelectedSleepConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000252-0000-1000-8000-0026BB765291";
    constructor() {
        super("Selected Sleep Configuration", SelectedSleepConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "wr" /* Perms.WRITE_RESPONSE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SelectedSleepConfiguration = SelectedSleepConfiguration;
Characteristic_1.Characteristic.SelectedSleepConfiguration = SelectedSleepConfiguration;
/**
 * Characteristic "Serial Number"
 */
class SerialNumber extends Characteristic_1.Characteristic {
    static UUID = "00000030-0000-1000-8000-0026BB765291";
    constructor() {
        super("Serial Number", SerialNumber.UUID, {
            format: "string" /* Formats.STRING */,
            perms: ["pr" /* Perms.PAIRED_READ */],
            maxLen: 64,
        });
        this.value = this.getDefaultValue();
    }
}
exports.SerialNumber = SerialNumber;
Characteristic_1.Characteristic.SerialNumber = SerialNumber;
/**
 * Characteristic "Service Label Index"
 */
class ServiceLabelIndex extends Characteristic_1.Characteristic {
    static UUID = "000000CB-0000-1000-8000-0026BB765291";
    constructor() {
        super("Service Label Index", ServiceLabelIndex.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
            minValue: 1,
            maxValue: 255,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.ServiceLabelIndex = ServiceLabelIndex;
Characteristic_1.Characteristic.ServiceLabelIndex = ServiceLabelIndex;
/**
 * Characteristic "Service Label Namespace"
 */
class ServiceLabelNamespace extends Characteristic_1.Characteristic {
    static UUID = "000000CD-0000-1000-8000-0026BB765291";
    static DOTS = 0;
    static ARABIC_NUMERALS = 1;
    constructor() {
        super("Service Label Namespace", ServiceLabelNamespace.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ServiceLabelNamespace = ServiceLabelNamespace;
Characteristic_1.Characteristic.ServiceLabelNamespace = ServiceLabelNamespace;
/**
 * Characteristic "Set Duration"
 */
class SetDuration extends Characteristic_1.Characteristic {
    static UUID = "000000D3-0000-1000-8000-0026BB765291";
    constructor() {
        super("Set Duration", SetDuration.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "seconds" /* Units.SECONDS */,
            minValue: 0,
            maxValue: 3600,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.SetDuration = SetDuration;
Characteristic_1.Characteristic.SetDuration = SetDuration;
/**
 * Characteristic "Setup Data Stream Transport"
 */
class SetupDataStreamTransport extends Characteristic_1.Characteristic {
    static UUID = "00000131-0000-1000-8000-0026BB765291";
    constructor() {
        super("Setup Data Stream Transport", SetupDataStreamTransport.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "wr" /* Perms.WRITE_RESPONSE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SetupDataStreamTransport = SetupDataStreamTransport;
Characteristic_1.Characteristic.SetupDataStreamTransport = SetupDataStreamTransport;
/**
 * Characteristic "Setup Endpoints"
 */
class SetupEndpoints extends Characteristic_1.Characteristic {
    static UUID = "00000118-0000-1000-8000-0026BB765291";
    constructor() {
        super("Setup Endpoints", SetupEndpoints.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SetupEndpoints = SetupEndpoints;
Characteristic_1.Characteristic.SetupEndpoints = SetupEndpoints;
/**
 * Characteristic "Setup Transfer Transport"
 * @since iOS 13.4
 */
class SetupTransferTransport extends Characteristic_1.Characteristic {
    static UUID = "00000201-0000-1000-8000-0026BB765291";
    constructor() {
        super("Setup Transfer Transport", SetupTransferTransport.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pw" /* Perms.PAIRED_WRITE */, "wr" /* Perms.WRITE_RESPONSE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SetupTransferTransport = SetupTransferTransport;
Characteristic_1.Characteristic.SetupTransferTransport = SetupTransferTransport;
/**
 * Characteristic "Signal To Noise Ratio"
 * @since iOS 14
 */
class SignalToNoiseRatio extends Characteristic_1.Characteristic {
    static UUID = "00000241-0000-1000-8000-0026BB765291";
    constructor() {
        super("Signal To Noise Ratio", SignalToNoiseRatio.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SignalToNoiseRatio = SignalToNoiseRatio;
Characteristic_1.Characteristic.SignalToNoiseRatio = SignalToNoiseRatio;
/**
 * Characteristic "Siri Enable"
 */
class SiriEnable extends Characteristic_1.Characteristic {
    static UUID = "00000255-0000-1000-8000-0026BB765291";
    constructor() {
        super("Siri Enable", SiriEnable.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.SiriEnable = SiriEnable;
Characteristic_1.Characteristic.SiriEnable = SiriEnable;
/**
 * Characteristic "Siri Endpoint Session Status"
 */
class SiriEndpointSessionStatus extends Characteristic_1.Characteristic {
    static UUID = "00000254-0000-1000-8000-0026BB765291";
    constructor() {
        super("Siri Endpoint Session Status", SiriEndpointSessionStatus.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SiriEndpointSessionStatus = SiriEndpointSessionStatus;
Characteristic_1.Characteristic.SiriEndpointSessionStatus = SiriEndpointSessionStatus;
/**
 * Characteristic "Siri Engine Version"
 */
class SiriEngineVersion extends Characteristic_1.Characteristic {
    static UUID = "0000025A-0000-1000-8000-0026BB765291";
    constructor() {
        super("Siri Engine Version", SiriEngineVersion.UUID, {
            format: "string" /* Formats.STRING */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SiriEngineVersion = SiriEngineVersion;
Characteristic_1.Characteristic.SiriEngineVersion = SiriEngineVersion;
/**
 * Characteristic "Siri Input Type"
 */
class SiriInputType extends Characteristic_1.Characteristic {
    static UUID = "00000132-0000-1000-8000-0026BB765291";
    static PUSH_BUTTON_TRIGGERED_APPLE_TV = 0;
    constructor() {
        super("Siri Input Type", SiriInputType.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 0,
            validValues: [0],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SiriInputType = SiriInputType;
Characteristic_1.Characteristic.SiriInputType = SiriInputType;
/**
 * Characteristic "Siri Light On Use"
 */
class SiriLightOnUse extends Characteristic_1.Characteristic {
    static UUID = "00000258-0000-1000-8000-0026BB765291";
    constructor() {
        super("Siri Light On Use", SiriLightOnUse.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.SiriLightOnUse = SiriLightOnUse;
Characteristic_1.Characteristic.SiriLightOnUse = SiriLightOnUse;
/**
 * Characteristic "Siri Listening"
 */
class SiriListening extends Characteristic_1.Characteristic {
    static UUID = "00000256-0000-1000-8000-0026BB765291";
    constructor() {
        super("Siri Listening", SiriListening.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.SiriListening = SiriListening;
Characteristic_1.Characteristic.SiriListening = SiriListening;
/**
 * Characteristic "Siri Touch To Use"
 */
class SiriTouchToUse extends Characteristic_1.Characteristic {
    static UUID = "00000257-0000-1000-8000-0026BB765291";
    constructor() {
        super("Siri Touch To Use", SiriTouchToUse.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.SiriTouchToUse = SiriTouchToUse;
Characteristic_1.Characteristic.SiriTouchToUse = SiriTouchToUse;
/**
 * Characteristic "Slat Type"
 */
class SlatType extends Characteristic_1.Characteristic {
    static UUID = "000000C0-0000-1000-8000-0026BB765291";
    static HORIZONTAL = 0;
    static VERTICAL = 1;
    constructor() {
        super("Slat Type", SlatType.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SlatType = SlatType;
Characteristic_1.Characteristic.SlatType = SlatType;
/**
 * Characteristic "Sleep Discovery Mode"
 */
class SleepDiscoveryMode extends Characteristic_1.Characteristic {
    static UUID = "000000E8-0000-1000-8000-0026BB765291";
    static NOT_DISCOVERABLE = 0;
    static ALWAYS_DISCOVERABLE = 1;
    constructor() {
        super("Sleep Discovery Mode", SleepDiscoveryMode.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SleepDiscoveryMode = SleepDiscoveryMode;
Characteristic_1.Characteristic.SleepDiscoveryMode = SleepDiscoveryMode;
/**
 * Characteristic "Sleep Interval"
 * @since iOS 14
 */
class SleepInterval extends Characteristic_1.Characteristic {
    static UUID = "0000023A-0000-1000-8000-0026BB765291";
    constructor() {
        super("Sleep Interval", SleepInterval.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.SleepInterval = SleepInterval;
Characteristic_1.Characteristic.SleepInterval = SleepInterval;
/**
 * Characteristic "Smoke Detected"
 */
class SmokeDetected extends Characteristic_1.Characteristic {
    static UUID = "00000076-0000-1000-8000-0026BB765291";
    static SMOKE_NOT_DETECTED = 0;
    static SMOKE_DETECTED = 1;
    constructor() {
        super("Smoke Detected", SmokeDetected.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SmokeDetected = SmokeDetected;
Characteristic_1.Characteristic.SmokeDetected = SmokeDetected;
/**
 * Characteristic "Software Revision"
 */
class SoftwareRevision extends Characteristic_1.Characteristic {
    static UUID = "00000054-0000-1000-8000-0026BB765291";
    constructor() {
        super("Software Revision", SoftwareRevision.UUID, {
            format: "string" /* Formats.STRING */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SoftwareRevision = SoftwareRevision;
Characteristic_1.Characteristic.SoftwareRevision = SoftwareRevision;
/**
 * Characteristic "Staged Firmware Version"
 */
class StagedFirmwareVersion extends Characteristic_1.Characteristic {
    static UUID = "00000249-0000-1000-8000-0026BB765291";
    constructor() {
        super("Staged Firmware Version", StagedFirmwareVersion.UUID, {
            format: "string" /* Formats.STRING */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.StagedFirmwareVersion = StagedFirmwareVersion;
Characteristic_1.Characteristic.StagedFirmwareVersion = StagedFirmwareVersion;
/**
 * Characteristic "Status Active"
 */
class StatusActive extends Characteristic_1.Characteristic {
    static UUID = "00000075-0000-1000-8000-0026BB765291";
    constructor() {
        super("Status Active", StatusActive.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.StatusActive = StatusActive;
Characteristic_1.Characteristic.StatusActive = StatusActive;
/**
 * Characteristic "Status Fault"
 */
class StatusFault extends Characteristic_1.Characteristic {
    static UUID = "00000077-0000-1000-8000-0026BB765291";
    static NO_FAULT = 0;
    static GENERAL_FAULT = 1;
    constructor() {
        super("Status Fault", StatusFault.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.StatusFault = StatusFault;
Characteristic_1.Characteristic.StatusFault = StatusFault;
/**
 * Characteristic "Status Jammed"
 */
class StatusJammed extends Characteristic_1.Characteristic {
    static UUID = "00000078-0000-1000-8000-0026BB765291";
    static NOT_JAMMED = 0;
    static JAMMED = 1;
    constructor() {
        super("Status Jammed", StatusJammed.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.StatusJammed = StatusJammed;
Characteristic_1.Characteristic.StatusJammed = StatusJammed;
/**
 * Characteristic "Status Low Battery"
 */
class StatusLowBattery extends Characteristic_1.Characteristic {
    static UUID = "00000079-0000-1000-8000-0026BB765291";
    static BATTERY_LEVEL_NORMAL = 0;
    static BATTERY_LEVEL_LOW = 1;
    constructor() {
        super("Status Low Battery", StatusLowBattery.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.StatusLowBattery = StatusLowBattery;
Characteristic_1.Characteristic.StatusLowBattery = StatusLowBattery;
/**
 * Characteristic "Status Tampered"
 */
class StatusTampered extends Characteristic_1.Characteristic {
    static UUID = "0000007A-0000-1000-8000-0026BB765291";
    static NOT_TAMPERED = 0;
    static TAMPERED = 1;
    constructor() {
        super("Status Tampered", StatusTampered.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.StatusTampered = StatusTampered;
Characteristic_1.Characteristic.StatusTampered = StatusTampered;
/**
 * Characteristic "Streaming Status"
 */
class StreamingStatus extends Characteristic_1.Characteristic {
    static UUID = "00000120-0000-1000-8000-0026BB765291";
    constructor() {
        super("Streaming Status", StreamingStatus.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.StreamingStatus = StreamingStatus;
Characteristic_1.Characteristic.StreamingStatus = StreamingStatus;
/**
 * Characteristic "Sulphur Dioxide Density"
 */
class SulphurDioxideDensity extends Characteristic_1.Characteristic {
    static UUID = "000000C5-0000-1000-8000-0026BB765291";
    constructor() {
        super("Sulphur Dioxide Density", SulphurDioxideDensity.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1000,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.SulphurDioxideDensity = SulphurDioxideDensity;
Characteristic_1.Characteristic.SulphurDioxideDensity = SulphurDioxideDensity;
/**
 * Characteristic "Supported Asset Types"
 */
class SupportedAssetTypes extends Characteristic_1.Characteristic {
    static UUID = "00000268-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Asset Types", SupportedAssetTypes.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedAssetTypes = SupportedAssetTypes;
Characteristic_1.Characteristic.SupportedAssetTypes = SupportedAssetTypes;
/**
 * Characteristic "Supported Audio Recording Configuration"
 */
class SupportedAudioRecordingConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000207-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Audio Recording Configuration", SupportedAudioRecordingConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedAudioRecordingConfiguration = SupportedAudioRecordingConfiguration;
Characteristic_1.Characteristic.SupportedAudioRecordingConfiguration = SupportedAudioRecordingConfiguration;
/**
 * Characteristic "Supported Audio Stream Configuration"
 */
class SupportedAudioStreamConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000115-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Audio Stream Configuration", SupportedAudioStreamConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedAudioStreamConfiguration = SupportedAudioStreamConfiguration;
Characteristic_1.Characteristic.SupportedAudioStreamConfiguration = SupportedAudioStreamConfiguration;
/**
 * Characteristic "Supported Camera Recording Configuration"
 */
class SupportedCameraRecordingConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000205-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Camera Recording Configuration", SupportedCameraRecordingConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedCameraRecordingConfiguration = SupportedCameraRecordingConfiguration;
Characteristic_1.Characteristic.SupportedCameraRecordingConfiguration = SupportedCameraRecordingConfiguration;
/**
 * Characteristic "Supported Characteristic Value Transition Configuration"
 * @since iOS 14
 */
class SupportedCharacteristicValueTransitionConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000144-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Characteristic Value Transition Configuration", SupportedCharacteristicValueTransitionConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedCharacteristicValueTransitionConfiguration = SupportedCharacteristicValueTransitionConfiguration;
Characteristic_1.Characteristic.SupportedCharacteristicValueTransitionConfiguration = SupportedCharacteristicValueTransitionConfiguration;
/**
 * Characteristic "Supported Data Stream Transport Configuration"
 */
class SupportedDataStreamTransportConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000130-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Data Stream Transport Configuration", SupportedDataStreamTransportConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedDataStreamTransportConfiguration = SupportedDataStreamTransportConfiguration;
Characteristic_1.Characteristic.SupportedDataStreamTransportConfiguration = SupportedDataStreamTransportConfiguration;
/**
 * Characteristic "Supported Diagnostics Modes"
 */
class SupportedDiagnosticsModes extends Characteristic_1.Characteristic {
    static UUID = "0000024C-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Diagnostics Modes", SupportedDiagnosticsModes.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedDiagnosticsModes = SupportedDiagnosticsModes;
Characteristic_1.Characteristic.SupportedDiagnosticsModes = SupportedDiagnosticsModes;
/**
 * Characteristic "Supported Diagnostics Snapshot"
 * @since iOS 14
 */
class SupportedDiagnosticsSnapshot extends Characteristic_1.Characteristic {
    static UUID = "00000238-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Diagnostics Snapshot", SupportedDiagnosticsSnapshot.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedDiagnosticsSnapshot = SupportedDiagnosticsSnapshot;
Characteristic_1.Characteristic.SupportedDiagnosticsSnapshot = SupportedDiagnosticsSnapshot;
/**
 * Characteristic "Supported Firmware Update Configuration"
 */
class SupportedFirmwareUpdateConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000233-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Firmware Update Configuration", SupportedFirmwareUpdateConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedFirmwareUpdateConfiguration = SupportedFirmwareUpdateConfiguration;
Characteristic_1.Characteristic.SupportedFirmwareUpdateConfiguration = SupportedFirmwareUpdateConfiguration;
/**
 * Characteristic "Supported Metrics"
 */
class SupportedMetrics extends Characteristic_1.Characteristic {
    static UUID = "00000271-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Metrics", SupportedMetrics.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedMetrics = SupportedMetrics;
Characteristic_1.Characteristic.SupportedMetrics = SupportedMetrics;
/**
 * Characteristic "Supported Router Configuration"
 */
class SupportedRouterConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000210-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Router Configuration", SupportedRouterConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedRouterConfiguration = SupportedRouterConfiguration;
Characteristic_1.Characteristic.SupportedRouterConfiguration = SupportedRouterConfiguration;
/**
 * Characteristic "Supported RTP Configuration"
 */
class SupportedRTPConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000116-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported RTP Configuration", SupportedRTPConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedRTPConfiguration = SupportedRTPConfiguration;
Characteristic_1.Characteristic.SupportedRTPConfiguration = SupportedRTPConfiguration;
/**
 * Characteristic "Supported Session Keep-alive Configuration List"
 */
class SupportedSessionKeepaliveConfigurationList extends Characteristic_1.Characteristic {
    static UUID = "00000274-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Session Keep-alive Configuration List", SupportedSessionKeepaliveConfigurationList.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedSessionKeepaliveConfigurationList = SupportedSessionKeepaliveConfigurationList;
Characteristic_1.Characteristic.SupportedSessionKeepaliveConfigurationList = SupportedSessionKeepaliveConfigurationList;
/**
 * Characteristic "Supported Sleep Configuration"
 */
class SupportedSleepConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000251-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Sleep Configuration", SupportedSleepConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedSleepConfiguration = SupportedSleepConfiguration;
Characteristic_1.Characteristic.SupportedSleepConfiguration = SupportedSleepConfiguration;
/**
 * Characteristic "Supported Transfer Transport Configuration"
 * @since iOS 13.4
 */
class SupportedTransferTransportConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000202-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Transfer Transport Configuration", SupportedTransferTransportConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedTransferTransportConfiguration = SupportedTransferTransportConfiguration;
Characteristic_1.Characteristic.SupportedTransferTransportConfiguration = SupportedTransferTransportConfiguration;
/**
 * Characteristic "Supported Video Recording Configuration"
 */
class SupportedVideoRecordingConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000206-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Video Recording Configuration", SupportedVideoRecordingConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedVideoRecordingConfiguration = SupportedVideoRecordingConfiguration;
Characteristic_1.Characteristic.SupportedVideoRecordingConfiguration = SupportedVideoRecordingConfiguration;
/**
 * Characteristic "Supported Video Stream Configuration"
 */
class SupportedVideoStreamConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000114-0000-1000-8000-0026BB765291";
    constructor() {
        super("Supported Video Stream Configuration", SupportedVideoStreamConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SupportedVideoStreamConfiguration = SupportedVideoStreamConfiguration;
Characteristic_1.Characteristic.SupportedVideoStreamConfiguration = SupportedVideoStreamConfiguration;
/**
 * Characteristic "Swing Mode"
 */
class SwingMode extends Characteristic_1.Characteristic {
    static UUID = "000000B6-0000-1000-8000-0026BB765291";
    static SWING_DISABLED = 0;
    static SWING_ENABLED = 1;
    constructor() {
        super("Swing Mode", SwingMode.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.SwingMode = SwingMode;
Characteristic_1.Characteristic.SwingMode = SwingMode;
/**
 * Characteristic "Tap Type"
 * @deprecated Removed
 */
class TapType extends Characteristic_1.Characteristic {
    static UUID = "0000022F-0000-1000-8000-0026BB765291";
    constructor() {
        super("Tap Type", TapType.UUID, {
            format: "uint16" /* Formats.UINT16 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TapType = TapType;
// noinspection JSDeprecatedSymbols
Characteristic_1.Characteristic.TapType = TapType;
/**
 * Characteristic "Target Air Purifier State"
 */
class TargetAirPurifierState extends Characteristic_1.Characteristic {
    static UUID = "000000A8-0000-1000-8000-0026BB765291";
    static MANUAL = 0;
    static AUTO = 1;
    constructor() {
        super("Target Air Purifier State", TargetAirPurifierState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetAirPurifierState = TargetAirPurifierState;
Characteristic_1.Characteristic.TargetAirPurifierState = TargetAirPurifierState;
/**
 * Characteristic "Target Control List"
 */
class TargetControlList extends Characteristic_1.Characteristic {
    static UUID = "00000124-0000-1000-8000-0026BB765291";
    constructor() {
        super("Target Control List", TargetControlList.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "wr" /* Perms.WRITE_RESPONSE */],
            adminOnlyAccess: [0 /* Access.READ */, 1 /* Access.WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetControlList = TargetControlList;
Characteristic_1.Characteristic.TargetControlList = TargetControlList;
/**
 * Characteristic "Target Control Supported Configuration"
 */
class TargetControlSupportedConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000123-0000-1000-8000-0026BB765291";
    constructor() {
        super("Target Control Supported Configuration", TargetControlSupportedConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetControlSupportedConfiguration = TargetControlSupportedConfiguration;
Characteristic_1.Characteristic.TargetControlSupportedConfiguration = TargetControlSupportedConfiguration;
/**
 * Characteristic "Target Door State"
 */
class TargetDoorState extends Characteristic_1.Characteristic {
    static UUID = "00000032-0000-1000-8000-0026BB765291";
    static OPEN = 0;
    static CLOSED = 1;
    constructor() {
        super("Target Door State", TargetDoorState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetDoorState = TargetDoorState;
Characteristic_1.Characteristic.TargetDoorState = TargetDoorState;
/**
 * Characteristic "Target Fan State"
 */
class TargetFanState extends Characteristic_1.Characteristic {
    static UUID = "000000BF-0000-1000-8000-0026BB765291";
    static MANUAL = 0;
    static AUTO = 1;
    constructor() {
        super("Target Fan State", TargetFanState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetFanState = TargetFanState;
Characteristic_1.Characteristic.TargetFanState = TargetFanState;
/**
 * Characteristic "Target Heater-Cooler State"
 */
class TargetHeaterCoolerState extends Characteristic_1.Characteristic {
    static UUID = "000000B2-0000-1000-8000-0026BB765291";
    static AUTO = 0;
    static HEAT = 1;
    static COOL = 2;
    constructor() {
        super("Target Heater-Cooler State", TargetHeaterCoolerState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 2,
            minStep: 1,
            validValues: [0, 1, 2],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetHeaterCoolerState = TargetHeaterCoolerState;
Characteristic_1.Characteristic.TargetHeaterCoolerState = TargetHeaterCoolerState;
/**
 * Characteristic "Target Heating Cooling State"
 */
class TargetHeatingCoolingState extends Characteristic_1.Characteristic {
    static UUID = "00000033-0000-1000-8000-0026BB765291";
    static OFF = 0;
    static HEAT = 1;
    static COOL = 2;
    static AUTO = 3;
    constructor() {
        super("Target Heating Cooling State", TargetHeatingCoolingState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 3,
            minStep: 1,
            validValues: [0, 1, 2, 3],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetHeatingCoolingState = TargetHeatingCoolingState;
Characteristic_1.Characteristic.TargetHeatingCoolingState = TargetHeatingCoolingState;
/**
 * Characteristic "Target Horizontal Tilt Angle"
 */
class TargetHorizontalTiltAngle extends Characteristic_1.Characteristic {
    static UUID = "0000007B-0000-1000-8000-0026BB765291";
    constructor() {
        super("Target Horizontal Tilt Angle", TargetHorizontalTiltAngle.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "arcdegrees" /* Units.ARC_DEGREE */,
            minValue: -90,
            maxValue: 90,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetHorizontalTiltAngle = TargetHorizontalTiltAngle;
Characteristic_1.Characteristic.TargetHorizontalTiltAngle = TargetHorizontalTiltAngle;
/**
 * Characteristic "Target Humidifier-Dehumidifier State"
 */
class TargetHumidifierDehumidifierState extends Characteristic_1.Characteristic {
    static UUID = "000000B4-0000-1000-8000-0026BB765291";
    static HUMIDIFIER_OR_DEHUMIDIFIER = 0;
    static HUMIDIFIER = 1;
    static DEHUMIDIFIER = 2;
    constructor() {
        super("Target Humidifier-Dehumidifier State", TargetHumidifierDehumidifierState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 2,
            minStep: 1,
            validValues: [0, 1, 2],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetHumidifierDehumidifierState = TargetHumidifierDehumidifierState;
Characteristic_1.Characteristic.TargetHumidifierDehumidifierState = TargetHumidifierDehumidifierState;
/**
 * Characteristic "Target Media State"
 */
class TargetMediaState extends Characteristic_1.Characteristic {
    static UUID = "00000137-0000-1000-8000-0026BB765291";
    static PLAY = 0;
    static PAUSE = 1;
    static STOP = 2;
    constructor() {
        super("Target Media State", TargetMediaState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 2,
            minStep: 1,
            validValues: [0, 1, 2],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetMediaState = TargetMediaState;
Characteristic_1.Characteristic.TargetMediaState = TargetMediaState;
/**
 * Characteristic "Target Position"
 */
class TargetPosition extends Characteristic_1.Characteristic {
    static UUID = "0000007C-0000-1000-8000-0026BB765291";
    constructor() {
        super("Target Position", TargetPosition.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "percentage" /* Units.PERCENTAGE */,
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetPosition = TargetPosition;
Characteristic_1.Characteristic.TargetPosition = TargetPosition;
/**
 * Characteristic "Target Relative Humidity"
 */
class TargetRelativeHumidity extends Characteristic_1.Characteristic {
    static UUID = "00000034-0000-1000-8000-0026BB765291";
    constructor() {
        super("Target Relative Humidity", TargetRelativeHumidity.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "percentage" /* Units.PERCENTAGE */,
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetRelativeHumidity = TargetRelativeHumidity;
Characteristic_1.Characteristic.TargetRelativeHumidity = TargetRelativeHumidity;
/**
 * Characteristic "Target Temperature"
 */
class TargetTemperature extends Characteristic_1.Characteristic {
    static UUID = "00000035-0000-1000-8000-0026BB765291";
    constructor() {
        super("Target Temperature", TargetTemperature.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "celsius" /* Units.CELSIUS */,
            minValue: 10,
            maxValue: 38,
            minStep: 0.1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetTemperature = TargetTemperature;
Characteristic_1.Characteristic.TargetTemperature = TargetTemperature;
/**
 * Characteristic "Target Tilt Angle"
 */
class TargetTiltAngle extends Characteristic_1.Characteristic {
    static UUID = "000000C2-0000-1000-8000-0026BB765291";
    constructor() {
        super("Target Tilt Angle", TargetTiltAngle.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "arcdegrees" /* Units.ARC_DEGREE */,
            minValue: -90,
            maxValue: 90,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetTiltAngle = TargetTiltAngle;
Characteristic_1.Characteristic.TargetTiltAngle = TargetTiltAngle;
/**
 * Characteristic "Target Vertical Tilt Angle"
 */
class TargetVerticalTiltAngle extends Characteristic_1.Characteristic {
    static UUID = "0000007D-0000-1000-8000-0026BB765291";
    constructor() {
        super("Target Vertical Tilt Angle", TargetVerticalTiltAngle.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "arcdegrees" /* Units.ARC_DEGREE */,
            minValue: -90,
            maxValue: 90,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetVerticalTiltAngle = TargetVerticalTiltAngle;
Characteristic_1.Characteristic.TargetVerticalTiltAngle = TargetVerticalTiltAngle;
/**
 * Characteristic "Target Visibility State"
 */
class TargetVisibilityState extends Characteristic_1.Characteristic {
    static UUID = "00000134-0000-1000-8000-0026BB765291";
    static SHOWN = 0;
    static HIDDEN = 1;
    constructor() {
        super("Target Visibility State", TargetVisibilityState.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TargetVisibilityState = TargetVisibilityState;
Characteristic_1.Characteristic.TargetVisibilityState = TargetVisibilityState;
/**
 * Characteristic "Temperature Display Units"
 */
class TemperatureDisplayUnits extends Characteristic_1.Characteristic {
    static UUID = "00000036-0000-1000-8000-0026BB765291";
    static CELSIUS = 0;
    static FAHRENHEIT = 1;
    constructor() {
        super("Temperature Display Units", TemperatureDisplayUnits.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TemperatureDisplayUnits = TemperatureDisplayUnits;
Characteristic_1.Characteristic.TemperatureDisplayUnits = TemperatureDisplayUnits;
/**
 * Characteristic "Third Party Camera Active"
 */
class ThirdPartyCameraActive extends Characteristic_1.Characteristic {
    static UUID = "0000021C-0000-1000-8000-0026BB765291";
    static OFF = 0;
    static ON = 1;
    constructor() {
        super("Third Party Camera Active", ThirdPartyCameraActive.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ThirdPartyCameraActive = ThirdPartyCameraActive;
Characteristic_1.Characteristic.ThirdPartyCameraActive = ThirdPartyCameraActive;
/**
 * Characteristic "Thread Control Point"
 */
class ThreadControlPoint extends Characteristic_1.Characteristic {
    static UUID = "00000704-0000-1000-8000-0026BB765291";
    constructor() {
        super("Thread Control Point", ThreadControlPoint.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ThreadControlPoint = ThreadControlPoint;
Characteristic_1.Characteristic.ThreadControlPoint = ThreadControlPoint;
/**
 * Characteristic "Thread Node Capabilities"
 */
class ThreadNodeCapabilities extends Characteristic_1.Characteristic {
    static UUID = "00000702-0000-1000-8000-0026BB765291";
    constructor() {
        super("Thread Node Capabilities", ThreadNodeCapabilities.UUID, {
            format: "uint16" /* Formats.UINT16 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 31,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.ThreadNodeCapabilities = ThreadNodeCapabilities;
Characteristic_1.Characteristic.ThreadNodeCapabilities = ThreadNodeCapabilities;
/**
 * Characteristic "Thread OpenThread Version"
 */
class ThreadOpenThreadVersion extends Characteristic_1.Characteristic {
    static UUID = "00000706-0000-1000-8000-0026BB765291";
    constructor() {
        super("Thread OpenThread Version", ThreadOpenThreadVersion.UUID, {
            format: "string" /* Formats.STRING */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ThreadOpenThreadVersion = ThreadOpenThreadVersion;
Characteristic_1.Characteristic.ThreadOpenThreadVersion = ThreadOpenThreadVersion;
/**
 * Characteristic "Thread Status"
 */
class ThreadStatus extends Characteristic_1.Characteristic {
    static UUID = "00000703-0000-1000-8000-0026BB765291";
    constructor() {
        super("Thread Status", ThreadStatus.UUID, {
            format: "uint16" /* Formats.UINT16 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 6,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.ThreadStatus = ThreadStatus;
Characteristic_1.Characteristic.ThreadStatus = ThreadStatus;
/**
 * Characteristic "Token"
 * @deprecated Removed
 */
class Token extends Characteristic_1.Characteristic {
    static UUID = "00000231-0000-1000-8000-0026BB765291";
    constructor() {
        super("Token", Token.UUID, {
            format: "data" /* Formats.DATA */,
            perms: ["pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.Token = Token;
// noinspection JSDeprecatedSymbols
Characteristic_1.Characteristic.Token = Token;
/**
 * Characteristic "Transmit Power"
 * @since iOS 14
 */
class TransmitPower extends Characteristic_1.Characteristic {
    static UUID = "00000242-0000-1000-8000-0026BB765291";
    constructor() {
        super("Transmit Power", TransmitPower.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TransmitPower = TransmitPower;
Characteristic_1.Characteristic.TransmitPower = TransmitPower;
/**
 * Characteristic "Tunnel Connection Timeout"
 * @deprecated Removed
 */
class TunnelConnectionTimeout extends Characteristic_1.Characteristic {
    static UUID = "00000061-0000-1000-8000-0026BB765291";
    constructor() {
        super("Tunnel Connection Timeout", TunnelConnectionTimeout.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TunnelConnectionTimeout = TunnelConnectionTimeout;
// noinspection JSDeprecatedSymbols
Characteristic_1.Characteristic.TunnelConnectionTimeout = TunnelConnectionTimeout;
/**
 * Characteristic "Tunneled Accessory Advertising"
 * @deprecated Removed
 */
class TunneledAccessoryAdvertising extends Characteristic_1.Characteristic {
    static UUID = "00000060-0000-1000-8000-0026BB765291";
    constructor() {
        super("Tunneled Accessory Advertising", TunneledAccessoryAdvertising.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TunneledAccessoryAdvertising = TunneledAccessoryAdvertising;
// noinspection JSDeprecatedSymbols
Characteristic_1.Characteristic.TunneledAccessoryAdvertising = TunneledAccessoryAdvertising;
/**
 * Characteristic "Tunneled Accessory Connected"
 * @deprecated Removed
 */
class TunneledAccessoryConnected extends Characteristic_1.Characteristic {
    static UUID = "00000059-0000-1000-8000-0026BB765291";
    constructor() {
        super("Tunneled Accessory Connected", TunneledAccessoryConnected.UUID, {
            format: "bool" /* Formats.BOOL */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TunneledAccessoryConnected = TunneledAccessoryConnected;
// noinspection JSDeprecatedSymbols
Characteristic_1.Characteristic.TunneledAccessoryConnected = TunneledAccessoryConnected;
/**
 * Characteristic "Tunneled Accessory State Number"
 * @deprecated Removed
 */
class TunneledAccessoryStateNumber extends Characteristic_1.Characteristic {
    static UUID = "00000058-0000-1000-8000-0026BB765291";
    constructor() {
        super("Tunneled Accessory State Number", TunneledAccessoryStateNumber.UUID, {
            format: "int" /* Formats.INT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.TunneledAccessoryStateNumber = TunneledAccessoryStateNumber;
// noinspection JSDeprecatedSymbols
Characteristic_1.Characteristic.TunneledAccessoryStateNumber = TunneledAccessoryStateNumber;
/**
 * Characteristic "Valve Type"
 */
class ValveType extends Characteristic_1.Characteristic {
    static UUID = "000000D5-0000-1000-8000-0026BB765291";
    static GENERIC_VALVE = 0;
    static IRRIGATION = 1;
    static SHOWER_HEAD = 2;
    static WATER_FAUCET = 3;
    constructor() {
        super("Valve Type", ValveType.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 3,
            minStep: 1,
            validValues: [0, 1, 2, 3],
        });
        this.value = this.getDefaultValue();
    }
}
exports.ValveType = ValveType;
Characteristic_1.Characteristic.ValveType = ValveType;
/**
 * Characteristic "Version"
 */
class Version extends Characteristic_1.Characteristic {
    static UUID = "00000037-0000-1000-8000-0026BB765291";
    constructor() {
        super("Version", Version.UUID, {
            format: "string" /* Formats.STRING */,
            perms: ["pr" /* Perms.PAIRED_READ */],
            maxLen: 64,
        });
        this.value = this.getDefaultValue();
    }
}
exports.Version = Version;
Characteristic_1.Characteristic.Version = Version;
/**
 * Characteristic "Video Analysis Active"
 * @since iOS 14
 */
class VideoAnalysisActive extends Characteristic_1.Characteristic {
    static UUID = "00000229-0000-1000-8000-0026BB765291";
    constructor() {
        super("Video Analysis Active", VideoAnalysisActive.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.VideoAnalysisActive = VideoAnalysisActive;
Characteristic_1.Characteristic.VideoAnalysisActive = VideoAnalysisActive;
/**
 * Characteristic "VOC Density"
 */
class VOCDensity extends Characteristic_1.Characteristic {
    static UUID = "000000C8-0000-1000-8000-0026BB765291";
    constructor() {
        super("VOC Density", VOCDensity.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 1000,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.VOCDensity = VOCDensity;
Characteristic_1.Characteristic.VOCDensity = VOCDensity;
/**
 * Characteristic "Volume"
 */
class Volume extends Characteristic_1.Characteristic {
    static UUID = "00000119-0000-1000-8000-0026BB765291";
    constructor() {
        super("Volume", Volume.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */],
            unit: "percentage" /* Units.PERCENTAGE */,
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.Volume = Volume;
Characteristic_1.Characteristic.Volume = Volume;
/**
 * Characteristic "Volume Control Type"
 */
class VolumeControlType extends Characteristic_1.Characteristic {
    static UUID = "000000E9-0000-1000-8000-0026BB765291";
    static NONE = 0;
    static RELATIVE = 1;
    static RELATIVE_WITH_CURRENT = 2;
    static ABSOLUTE = 3;
    constructor() {
        super("Volume Control Type", VolumeControlType.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 3,
            minStep: 1,
            validValues: [0, 1, 2, 3],
        });
        this.value = this.getDefaultValue();
    }
}
exports.VolumeControlType = VolumeControlType;
Characteristic_1.Characteristic.VolumeControlType = VolumeControlType;
/**
 * Characteristic "Volume Selector"
 */
class VolumeSelector extends Characteristic_1.Characteristic {
    static UUID = "000000EA-0000-1000-8000-0026BB765291";
    static INCREMENT = 0;
    static DECREMENT = 1;
    constructor() {
        super("Volume Selector", VolumeSelector.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["pw" /* Perms.PAIRED_WRITE */],
            minValue: 0,
            maxValue: 1,
            minStep: 1,
            validValues: [0, 1],
        });
        this.value = this.getDefaultValue();
    }
}
exports.VolumeSelector = VolumeSelector;
Characteristic_1.Characteristic.VolumeSelector = VolumeSelector;
/**
 * Characteristic "Wake Configuration"
 * @since iOS 13.4
 */
class WakeConfiguration extends Characteristic_1.Characteristic {
    static UUID = "00000222-0000-1000-8000-0026BB765291";
    constructor() {
        super("Wake Configuration", WakeConfiguration.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.WakeConfiguration = WakeConfiguration;
Characteristic_1.Characteristic.WakeConfiguration = WakeConfiguration;
/**
 * Characteristic "WAN Configuration List"
 */
class WANConfigurationList extends Characteristic_1.Characteristic {
    static UUID = "00000211-0000-1000-8000-0026BB765291";
    constructor() {
        super("WAN Configuration List", WANConfigurationList.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.WANConfigurationList = WANConfigurationList;
Characteristic_1.Characteristic.WANConfigurationList = WANConfigurationList;
/**
 * Characteristic "WAN Status List"
 */
class WANStatusList extends Characteristic_1.Characteristic {
    static UUID = "00000212-0000-1000-8000-0026BB765291";
    constructor() {
        super("WAN Status List", WANStatusList.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.WANStatusList = WANStatusList;
Characteristic_1.Characteristic.WANStatusList = WANStatusList;
/**
 * Characteristic "Water Level"
 */
class WaterLevel extends Characteristic_1.Characteristic {
    static UUID = "000000B5-0000-1000-8000-0026BB765291";
    constructor() {
        super("Water Level", WaterLevel.UUID, {
            format: "float" /* Formats.FLOAT */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            unit: "percentage" /* Units.PERCENTAGE */,
            minValue: 0,
            maxValue: 100,
            minStep: 1,
        });
        this.value = this.getDefaultValue();
    }
}
exports.WaterLevel = WaterLevel;
Characteristic_1.Characteristic.WaterLevel = WaterLevel;
/**
 * Characteristic "Wi-Fi Capabilities"
 * @since iOS 14
 */
class WiFiCapabilities extends Characteristic_1.Characteristic {
    static UUID = "0000022C-0000-1000-8000-0026BB765291";
    constructor() {
        super("Wi-Fi Capabilities", WiFiCapabilities.UUID, {
            format: "uint32" /* Formats.UINT32 */,
            perms: ["pr" /* Perms.PAIRED_READ */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.WiFiCapabilities = WiFiCapabilities;
Characteristic_1.Characteristic.WiFiCapabilities = WiFiCapabilities;
/**
 * Characteristic "Wi-Fi Configuration Control"
 * @since iOS 14
 */
class WiFiConfigurationControl extends Characteristic_1.Characteristic {
    static UUID = "0000022D-0000-1000-8000-0026BB765291";
    constructor() {
        super("Wi-Fi Configuration Control", WiFiConfigurationControl.UUID, {
            format: "tlv8" /* Formats.TLV8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */, "tw" /* Perms.TIMED_WRITE */, "wr" /* Perms.WRITE_RESPONSE */],
        });
        this.value = this.getDefaultValue();
    }
}
exports.WiFiConfigurationControl = WiFiConfigurationControl;
Characteristic_1.Characteristic.WiFiConfigurationControl = WiFiConfigurationControl;
/**
 * Characteristic "Wi-Fi Satellite Status"
 */
class WiFiSatelliteStatus extends Characteristic_1.Characteristic {
    static UUID = "0000021E-0000-1000-8000-0026BB765291";
    static UNKNOWN = 0;
    static CONNECTED = 1;
    static NOT_CONNECTED = 2;
    constructor() {
        super("Wi-Fi Satellite Status", WiFiSatelliteStatus.UUID, {
            format: "uint8" /* Formats.UINT8 */,
            perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */],
            minValue: 0,
            maxValue: 2,
            validValues: [0, 1, 2],
        });
        this.value = this.getDefaultValue();
    }
}
exports.WiFiSatelliteStatus = WiFiSatelliteStatus;
Characteristic_1.Characteristic.WiFiSatelliteStatus = WiFiSatelliteStatus;
//# sourceMappingURL=CharacteristicDefinitions.js.map