"use strict";
// THIS FILE IS AUTO-GENERATED - DO NOT MODIFY
// V=888
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiriEndpoint = exports.Siri = exports.ServiceLabel = exports.SecuritySystem = exports.ProtocolInformation = exports.PowerManagement = exports.Pairing = exports.Outlet = exports.OccupancySensor = exports.NFCAccess = exports.MotionSensor = exports.Microphone = exports.LockMechanism = exports.LockManagement = exports.LightSensor = exports.Lightbulb = exports.LeakSensor = exports.IrrigationSystem = exports.InputSource = exports.HumiditySensor = exports.HumidifierDehumidifier = exports.HeaterCooler = exports.GarageDoorOpener = exports.FirmwareUpdate = exports.FilterMaintenance = exports.Faucet = exports.Fanv2 = exports.Fan = exports.Doorbell = exports.Door = exports.Diagnostics = exports.DataStreamTransportManagement = exports.ContactSensor = exports.CloudRelay = exports.CarbonMonoxideSensor = exports.CarbonDioxideSensor = exports.CameraRTPStreamManagement = exports.CameraRecordingManagement = exports.CameraOperatingMode = exports.Battery = exports.AudioStreamManagement = exports.Assistant = exports.AssetUpdate = exports.AirQualitySensor = exports.AirPurifier = exports.AccessoryRuntimeInformation = exports.AccessoryMetrics = exports.AccessoryInformation = exports.AccessControl = exports.AccessCode = void 0;
exports.WindowCovering = exports.Window = exports.WiFiTransport = exports.WiFiSatellite = exports.WiFiRouter = exports.Valve = exports.Tunnel = exports.TransferTransportManagement = exports.ThreadTransport = exports.Thermostat = exports.TemperatureSensor = exports.TelevisionSpeaker = exports.Television = exports.TargetControlManagement = exports.TargetControl = exports.TapManagement = exports.Switch = exports.StatelessProgrammableSwitch = exports.StatefulProgrammableSwitch = exports.Speaker = exports.SmokeSensor = exports.SmartSpeaker = exports.Slats = void 0;
const Characteristic_1 = require("../Characteristic");
const Service_1 = require("../Service");
/**
 * Service "Access Code"
 * @since iOS 15
 */
class AccessCode extends Service_1.Service {
    static UUID = "00000260-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, AccessCode.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.AccessCodeControlPoint);
        this.addCharacteristic(Characteristic_1.Characteristic.AccessCodeSupportedConfiguration);
        this.addCharacteristic(Characteristic_1.Characteristic.ConfigurationState);
    }
}
exports.AccessCode = AccessCode;
Service_1.Service.AccessCode = AccessCode;
/**
 * Service "Access Control"
 */
class AccessControl extends Service_1.Service {
    static UUID = "000000DA-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, AccessControl.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.AccessControlLevel);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.MediaAccessControlLevel);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.PasswordSetting);
    }
}
exports.AccessControl = AccessControl;
Service_1.Service.AccessControl = AccessControl;
/**
 * Service "Accessory Information"
 */
class AccessoryInformation extends Service_1.Service {
    static UUID = "0000003E-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, AccessoryInformation.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Identify);
        this.addCharacteristic(Characteristic_1.Characteristic.Manufacturer);
        this.addCharacteristic(Characteristic_1.Characteristic.Model);
        if (!this.testCharacteristic(Characteristic_1.Characteristic.Name)) { // workaround for Name characteristic collision in constructor
            this.addCharacteristic(Characteristic_1.Characteristic.Name).updateValue("Unnamed Service");
        }
        this.addCharacteristic(Characteristic_1.Characteristic.SerialNumber);
        this.addCharacteristic(Characteristic_1.Characteristic.FirmwareRevision);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.AccessoryFlags);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.AppMatchingIdentifier);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ConfiguredName);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.MatterFirmwareRevisionNumber);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.HardwareFinish);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.HardwareRevision);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ProductData);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SoftwareRevision);
    }
}
exports.AccessoryInformation = AccessoryInformation;
Service_1.Service.AccessoryInformation = AccessoryInformation;
/**
 * Service "Accessory Metrics"
 */
class AccessoryMetrics extends Service_1.Service {
    static UUID = "00000270-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, AccessoryMetrics.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Active);
        this.addCharacteristic(Characteristic_1.Characteristic.MetricsBufferFullState);
        this.addCharacteristic(Characteristic_1.Characteristic.SupportedMetrics);
    }
}
exports.AccessoryMetrics = AccessoryMetrics;
Service_1.Service.AccessoryMetrics = AccessoryMetrics;
/**
 * Service "Accessory Runtime Information"
 */
class AccessoryRuntimeInformation extends Service_1.Service {
    static UUID = "00000239-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, AccessoryRuntimeInformation.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Ping);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ActivityInterval);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ConnectionHealthMonitor);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.HeartBeat);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SelectedSessionKeepaliveConfigurationList);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SleepInterval);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SupportedSessionKeepaliveConfigurationList);
    }
}
exports.AccessoryRuntimeInformation = AccessoryRuntimeInformation;
Service_1.Service.AccessoryRuntimeInformation = AccessoryRuntimeInformation;
/**
 * Service "Air Purifier"
 */
class AirPurifier extends Service_1.Service {
    static UUID = "000000BB-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, AirPurifier.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Active);
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentAirPurifierState);
        this.addCharacteristic(Characteristic_1.Characteristic.TargetAirPurifierState);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.LockPhysicalControls);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.RotationSpeed);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SwingMode);
    }
}
exports.AirPurifier = AirPurifier;
Service_1.Service.AirPurifier = AirPurifier;
/**
 * Service "Air Quality Sensor"
 */
class AirQualitySensor extends Service_1.Service {
    static UUID = "0000008D-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, AirQualitySensor.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.AirQuality);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.NitrogenDioxideDensity);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.OzoneDensity);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.PM10Density);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.PM2_5Density);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SulphurDioxideDensity);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.VOCDensity);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusLowBattery);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusTampered);
    }
}
exports.AirQualitySensor = AirQualitySensor;
Service_1.Service.AirQualitySensor = AirQualitySensor;
/**
 * Service "Asset Update"
 */
class AssetUpdate extends Service_1.Service {
    static UUID = "00000267-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, AssetUpdate.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.AssetUpdateReadiness);
        this.addCharacteristic(Characteristic_1.Characteristic.SupportedAssetTypes);
    }
}
exports.AssetUpdate = AssetUpdate;
Service_1.Service.AssetUpdate = AssetUpdate;
/**
 * Service "Assistant"
 */
class Assistant extends Service_1.Service {
    static UUID = "0000026A-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Assistant.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Active);
        this.addCharacteristic(Characteristic_1.Characteristic.Identifier);
        if (!this.testCharacteristic(Characteristic_1.Characteristic.Name)) { // workaround for Name characteristic collision in constructor
            this.addCharacteristic(Characteristic_1.Characteristic.Name).updateValue("Unnamed Service");
        }
    }
}
exports.Assistant = Assistant;
Service_1.Service.Assistant = Assistant;
/**
 * Service "Audio Stream Management"
 */
class AudioStreamManagement extends Service_1.Service {
    static UUID = "00000127-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, AudioStreamManagement.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.SupportedAudioStreamConfiguration);
        this.addCharacteristic(Characteristic_1.Characteristic.SelectedAudioStreamConfiguration);
    }
}
exports.AudioStreamManagement = AudioStreamManagement;
Service_1.Service.AudioStreamManagement = AudioStreamManagement;
/**
 * Service "Battery"
 */
class Battery extends Service_1.Service {
    static UUID = "00000096-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Battery.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.StatusLowBattery);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.BatteryLevel);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ChargingState);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
    }
}
exports.Battery = Battery;
Service_1.Service.Battery = Battery;
/**
 * Service "Camera Operating Mode"
 */
class CameraOperatingMode extends Service_1.Service {
    static UUID = "0000021A-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, CameraOperatingMode.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.EventSnapshotsActive);
        this.addCharacteristic(Characteristic_1.Characteristic.HomeKitCameraActive);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CameraOperatingModeIndicator);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ManuallyDisabled);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.NightVision);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.PeriodicSnapshotsActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ThirdPartyCameraActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.DiagonalFieldOfView);
    }
}
exports.CameraOperatingMode = CameraOperatingMode;
Service_1.Service.CameraOperatingMode = CameraOperatingMode;
/**
 * Service "Camera Recording Management"
 */
class CameraRecordingManagement extends Service_1.Service {
    static UUID = "00000204-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, CameraRecordingManagement.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Active);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.RecordingAudioActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SelectedCameraRecordingConfiguration);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SupportedAudioRecordingConfiguration);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SupportedCameraRecordingConfiguration);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SupportedVideoRecordingConfiguration);
    }
}
exports.CameraRecordingManagement = CameraRecordingManagement;
Service_1.Service.CameraRecordingManagement = CameraRecordingManagement;
/**
 * Service "Camera RTP Stream Management"
 */
class CameraRTPStreamManagement extends Service_1.Service {
    static UUID = "00000110-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, CameraRTPStreamManagement.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.SelectedRTPStreamConfiguration);
        this.addCharacteristic(Characteristic_1.Characteristic.SetupEndpoints);
        this.addCharacteristic(Characteristic_1.Characteristic.StreamingStatus);
        this.addCharacteristic(Characteristic_1.Characteristic.SupportedAudioStreamConfiguration);
        this.addCharacteristic(Characteristic_1.Characteristic.SupportedRTPConfiguration);
        this.addCharacteristic(Characteristic_1.Characteristic.SupportedVideoStreamConfiguration);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Active);
    }
}
exports.CameraRTPStreamManagement = CameraRTPStreamManagement;
Service_1.Service.CameraRTPStreamManagement = CameraRTPStreamManagement;
/**
 * Service "Carbon Dioxide Sensor"
 */
class CarbonDioxideSensor extends Service_1.Service {
    static UUID = "00000097-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, CarbonDioxideSensor.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CarbonDioxideDetected);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CarbonDioxideLevel);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CarbonDioxidePeakLevel);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusLowBattery);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusTampered);
    }
}
exports.CarbonDioxideSensor = CarbonDioxideSensor;
Service_1.Service.CarbonDioxideSensor = CarbonDioxideSensor;
/**
 * Service "Carbon Monoxide Sensor"
 */
class CarbonMonoxideSensor extends Service_1.Service {
    static UUID = "0000007F-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, CarbonMonoxideSensor.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CarbonMonoxideDetected);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CarbonMonoxideLevel);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CarbonMonoxidePeakLevel);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusLowBattery);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusTampered);
    }
}
exports.CarbonMonoxideSensor = CarbonMonoxideSensor;
Service_1.Service.CarbonMonoxideSensor = CarbonMonoxideSensor;
/**
 * Service "Cloud Relay"
 * @deprecated Removed
 */
class CloudRelay extends Service_1.Service {
    static UUID = "0000005A-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, CloudRelay.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.RelayControlPoint);
        this.addCharacteristic(Characteristic_1.Characteristic.RelayState);
        this.addCharacteristic(Characteristic_1.Characteristic.RelayEnabled);
    }
}
exports.CloudRelay = CloudRelay;
// noinspection JSDeprecatedSymbols
Service_1.Service.CloudRelay = CloudRelay;
/**
 * Service "Contact Sensor"
 */
class ContactSensor extends Service_1.Service {
    static UUID = "00000080-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, ContactSensor.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.ContactSensorState);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusLowBattery);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusTampered);
    }
}
exports.ContactSensor = ContactSensor;
Service_1.Service.ContactSensor = ContactSensor;
/**
 * Service "Data Stream Transport Management"
 */
class DataStreamTransportManagement extends Service_1.Service {
    static UUID = "00000129-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, DataStreamTransportManagement.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.SetupDataStreamTransport);
        this.addCharacteristic(Characteristic_1.Characteristic.SupportedDataStreamTransportConfiguration);
        this.addCharacteristic(Characteristic_1.Characteristic.Version);
    }
}
exports.DataStreamTransportManagement = DataStreamTransportManagement;
Service_1.Service.DataStreamTransportManagement = DataStreamTransportManagement;
/**
 * Service "Diagnostics"
 */
class Diagnostics extends Service_1.Service {
    static UUID = "00000237-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Diagnostics.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.SupportedDiagnosticsSnapshot);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SelectedDiagnosticsModes);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SupportedDiagnosticsModes);
    }
}
exports.Diagnostics = Diagnostics;
Service_1.Service.Diagnostics = Diagnostics;
/**
 * Service "Door"
 */
class Door extends Service_1.Service {
    static UUID = "00000081-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Door.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentPosition);
        this.addCharacteristic(Characteristic_1.Characteristic.PositionState);
        this.addCharacteristic(Characteristic_1.Characteristic.TargetPosition);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ObstructionDetected);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.HoldPosition);
    }
}
exports.Door = Door;
Service_1.Service.Door = Door;
/**
 * Service "Doorbell"
 */
class Doorbell extends Service_1.Service {
    static UUID = "00000121-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Doorbell.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.ProgrammableSwitchEvent);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Brightness);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Mute);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.OperatingStateResponse);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Volume);
    }
}
exports.Doorbell = Doorbell;
Service_1.Service.Doorbell = Doorbell;
/**
 * Service "Fan"
 */
class Fan extends Service_1.Service {
    static UUID = "00000040-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Fan.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.On);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.RotationDirection);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.RotationSpeed);
    }
}
exports.Fan = Fan;
Service_1.Service.Fan = Fan;
/**
 * Service "Fanv2"
 */
class Fanv2 extends Service_1.Service {
    static UUID = "000000B7-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Fanv2.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Active);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CurrentFanState);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.TargetFanState);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.LockPhysicalControls);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.RotationDirection);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.RotationSpeed);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SwingMode);
    }
}
exports.Fanv2 = Fanv2;
Service_1.Service.Fanv2 = Fanv2;
/**
 * Service "Faucet"
 */
class Faucet extends Service_1.Service {
    static UUID = "000000D7-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Faucet.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Active);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
    }
}
exports.Faucet = Faucet;
Service_1.Service.Faucet = Faucet;
/**
 * Service "Filter Maintenance"
 */
class FilterMaintenance extends Service_1.Service {
    static UUID = "000000BA-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, FilterMaintenance.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.FilterChangeIndication);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.FilterLifeLevel);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ResetFilterIndication);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
    }
}
exports.FilterMaintenance = FilterMaintenance;
Service_1.Service.FilterMaintenance = FilterMaintenance;
/**
 * Service "Firmware Update"
 */
class FirmwareUpdate extends Service_1.Service {
    static UUID = "00000236-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, FirmwareUpdate.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.FirmwareUpdateReadiness);
        this.addCharacteristic(Characteristic_1.Characteristic.FirmwareUpdateStatus);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.FirmwareUpdateProtocolList);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.MatterFirmwareUpdateStatus);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StagedFirmwareVersion);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SupportedFirmwareUpdateConfiguration);
    }
}
exports.FirmwareUpdate = FirmwareUpdate;
Service_1.Service.FirmwareUpdate = FirmwareUpdate;
/**
 * Service "Garage Door Opener"
 */
class GarageDoorOpener extends Service_1.Service {
    static UUID = "00000041-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, GarageDoorOpener.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentDoorState);
        this.addCharacteristic(Characteristic_1.Characteristic.TargetDoorState);
        this.addCharacteristic(Characteristic_1.Characteristic.ObstructionDetected);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.LockCurrentState);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.LockTargetState);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
    }
}
exports.GarageDoorOpener = GarageDoorOpener;
Service_1.Service.GarageDoorOpener = GarageDoorOpener;
/**
 * Service "Heater-Cooler"
 */
class HeaterCooler extends Service_1.Service {
    static UUID = "000000BC-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, HeaterCooler.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Active);
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentHeaterCoolerState);
        this.addCharacteristic(Characteristic_1.Characteristic.TargetHeaterCoolerState);
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentTemperature);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.LockPhysicalControls);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.RotationSpeed);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SwingMode);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CoolingThresholdTemperature);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.HeatingThresholdTemperature);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.TemperatureDisplayUnits);
    }
}
exports.HeaterCooler = HeaterCooler;
Service_1.Service.HeaterCooler = HeaterCooler;
/**
 * Service "Humidifier-Dehumidifier"
 */
class HumidifierDehumidifier extends Service_1.Service {
    static UUID = "000000BD-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, HumidifierDehumidifier.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Active);
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentHumidifierDehumidifierState);
        this.addCharacteristic(Characteristic_1.Characteristic.TargetHumidifierDehumidifierState);
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentRelativeHumidity);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.LockPhysicalControls);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.RelativeHumidityDehumidifierThreshold);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.RelativeHumidityHumidifierThreshold);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.RotationSpeed);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SwingMode);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.WaterLevel);
    }
}
exports.HumidifierDehumidifier = HumidifierDehumidifier;
Service_1.Service.HumidifierDehumidifier = HumidifierDehumidifier;
/**
 * Service "Humidity Sensor"
 */
class HumiditySensor extends Service_1.Service {
    static UUID = "00000082-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, HumiditySensor.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentRelativeHumidity);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusLowBattery);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusTampered);
    }
}
exports.HumiditySensor = HumiditySensor;
Service_1.Service.HumiditySensor = HumiditySensor;
/**
 * Service "Input Source"
 */
class InputSource extends Service_1.Service {
    static UUID = "000000D9-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, InputSource.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.ConfiguredName);
        this.addCharacteristic(Characteristic_1.Characteristic.InputSourceType);
        this.addCharacteristic(Characteristic_1.Characteristic.IsConfigured);
        if (!this.testCharacteristic(Characteristic_1.Characteristic.Name)) { // workaround for Name characteristic collision in constructor
            this.addCharacteristic(Characteristic_1.Characteristic.Name).updateValue("Unnamed Service");
        }
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentVisibilityState);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Identifier);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.InputDeviceType);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.TargetVisibilityState);
    }
}
exports.InputSource = InputSource;
Service_1.Service.InputSource = InputSource;
/**
 * Service "Irrigation-System"
 */
class IrrigationSystem extends Service_1.Service {
    static UUID = "000000CF-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, IrrigationSystem.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Active);
        this.addCharacteristic(Characteristic_1.Characteristic.ProgramMode);
        this.addCharacteristic(Characteristic_1.Characteristic.InUse);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.RemainingDuration);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
    }
}
exports.IrrigationSystem = IrrigationSystem;
Service_1.Service.IrrigationSystem = IrrigationSystem;
/**
 * Service "Leak Sensor"
 */
class LeakSensor extends Service_1.Service {
    static UUID = "00000083-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, LeakSensor.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.LeakDetected);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusLowBattery);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusTampered);
    }
}
exports.LeakSensor = LeakSensor;
Service_1.Service.LeakSensor = LeakSensor;
/**
 * Service "Lightbulb"
 */
class Lightbulb extends Service_1.Service {
    static UUID = "00000043-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Lightbulb.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.On);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Brightness);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CharacteristicValueActiveTransitionCount);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CharacteristicValueTransitionControl);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ColorTemperature);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Hue);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Saturation);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SupportedCharacteristicValueTransitionConfiguration);
    }
}
exports.Lightbulb = Lightbulb;
Service_1.Service.Lightbulb = Lightbulb;
/**
 * Service "Light Sensor"
 */
class LightSensor extends Service_1.Service {
    static UUID = "00000084-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, LightSensor.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentAmbientLightLevel);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusLowBattery);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusTampered);
    }
}
exports.LightSensor = LightSensor;
Service_1.Service.LightSensor = LightSensor;
/**
 * Service "Lock Management"
 */
class LockManagement extends Service_1.Service {
    static UUID = "00000044-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, LockManagement.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.LockControlPoint);
        this.addCharacteristic(Characteristic_1.Characteristic.Version);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.AdministratorOnlyAccess);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.AudioFeedback);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CurrentDoorState);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.LockManagementAutoSecurityTimeout);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.LockLastKnownAction);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Logs);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.MotionDetected);
    }
}
exports.LockManagement = LockManagement;
Service_1.Service.LockManagement = LockManagement;
/**
 * Service "Lock Mechanism"
 */
class LockMechanism extends Service_1.Service {
    static UUID = "00000045-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, LockMechanism.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.LockCurrentState);
        this.addCharacteristic(Characteristic_1.Characteristic.LockTargetState);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
    }
}
exports.LockMechanism = LockMechanism;
Service_1.Service.LockMechanism = LockMechanism;
/**
 * Service "Microphone"
 */
class Microphone extends Service_1.Service {
    static UUID = "00000112-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Microphone.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Mute);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Volume);
    }
}
exports.Microphone = Microphone;
Service_1.Service.Microphone = Microphone;
/**
 * Service "Motion Sensor"
 */
class MotionSensor extends Service_1.Service {
    static UUID = "00000085-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, MotionSensor.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.MotionDetected);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusLowBattery);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusTampered);
    }
}
exports.MotionSensor = MotionSensor;
Service_1.Service.MotionSensor = MotionSensor;
/**
 * Service "NFC Access"
 * @since iOS 15
 */
class NFCAccess extends Service_1.Service {
    static UUID = "00000266-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, NFCAccess.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.ConfigurationState);
        this.addCharacteristic(Characteristic_1.Characteristic.NFCAccessControlPoint);
        this.addCharacteristic(Characteristic_1.Characteristic.NFCAccessSupportedConfiguration);
    }
}
exports.NFCAccess = NFCAccess;
Service_1.Service.NFCAccess = NFCAccess;
/**
 * Service "Occupancy Sensor"
 */
class OccupancySensor extends Service_1.Service {
    static UUID = "00000086-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, OccupancySensor.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.OccupancyDetected);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusLowBattery);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusTampered);
    }
}
exports.OccupancySensor = OccupancySensor;
Service_1.Service.OccupancySensor = OccupancySensor;
/**
 * Service "Outlet"
 * @since iOS 13
 */
class Outlet extends Service_1.Service {
    static UUID = "00000047-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Outlet.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.On);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.OutletInUse);
    }
}
exports.Outlet = Outlet;
Service_1.Service.Outlet = Outlet;
/**
 * Service "Pairing"
 */
class Pairing extends Service_1.Service {
    static UUID = "00000055-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Pairing.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.ListPairings);
        this.addCharacteristic(Characteristic_1.Characteristic.PairSetup);
        this.addCharacteristic(Characteristic_1.Characteristic.PairVerify);
        this.addCharacteristic(Characteristic_1.Characteristic.PairingFeatures);
    }
}
exports.Pairing = Pairing;
Service_1.Service.Pairing = Pairing;
/**
 * Service "Power Management"
 */
class PowerManagement extends Service_1.Service {
    static UUID = "00000221-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, PowerManagement.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.WakeConfiguration);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SelectedSleepConfiguration);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SupportedSleepConfiguration);
    }
}
exports.PowerManagement = PowerManagement;
Service_1.Service.PowerManagement = PowerManagement;
/**
 * Service "Protocol Information"
 */
class ProtocolInformation extends Service_1.Service {
    static UUID = "000000A2-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, ProtocolInformation.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Version);
    }
}
exports.ProtocolInformation = ProtocolInformation;
Service_1.Service.ProtocolInformation = ProtocolInformation;
/**
 * Service "Security System"
 */
class SecuritySystem extends Service_1.Service {
    static UUID = "0000007E-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, SecuritySystem.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.SecuritySystemCurrentState);
        this.addCharacteristic(Characteristic_1.Characteristic.SecuritySystemTargetState);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SecuritySystemAlarmType);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusTampered);
    }
}
exports.SecuritySystem = SecuritySystem;
Service_1.Service.SecuritySystem = SecuritySystem;
/**
 * Service "Service Label"
 */
class ServiceLabel extends Service_1.Service {
    static UUID = "000000CC-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, ServiceLabel.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.ServiceLabelNamespace);
    }
}
exports.ServiceLabel = ServiceLabel;
Service_1.Service.ServiceLabel = ServiceLabel;
/**
 * Service "Siri"
 */
class Siri extends Service_1.Service {
    static UUID = "00000133-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Siri.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.SiriInputType);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.MultifunctionButton);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SiriEnable);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SiriEngineVersion);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SiriLightOnUse);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SiriListening);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SiriTouchToUse);
    }
}
exports.Siri = Siri;
Service_1.Service.Siri = Siri;
/**
 * Service "Siri Endpoint"
 */
class SiriEndpoint extends Service_1.Service {
    static UUID = "00000253-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, SiriEndpoint.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.SiriEndpointSessionStatus);
        this.addCharacteristic(Characteristic_1.Characteristic.Version);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ActiveIdentifier);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ManuallyDisabled);
    }
}
exports.SiriEndpoint = SiriEndpoint;
Service_1.Service.SiriEndpoint = SiriEndpoint;
/**
 * Service "Slats"
 */
class Slats extends Service_1.Service {
    static UUID = "000000B9-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Slats.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentSlatState);
        this.addCharacteristic(Characteristic_1.Characteristic.SlatType);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SwingMode);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CurrentTiltAngle);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.TargetTiltAngle);
    }
}
exports.Slats = Slats;
Service_1.Service.Slats = Slats;
/**
 * Service "Smart Speaker"
 */
class SmartSpeaker extends Service_1.Service {
    static UUID = "00000228-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, SmartSpeaker.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentMediaState);
        this.addCharacteristic(Characteristic_1.Characteristic.TargetMediaState);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.AirPlayEnable);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ConfiguredName);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Mute);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Volume);
    }
}
exports.SmartSpeaker = SmartSpeaker;
Service_1.Service.SmartSpeaker = SmartSpeaker;
/**
 * Service "Smoke Sensor"
 */
class SmokeSensor extends Service_1.Service {
    static UUID = "00000087-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, SmokeSensor.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.SmokeDetected);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusLowBattery);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusTampered);
    }
}
exports.SmokeSensor = SmokeSensor;
Service_1.Service.SmokeSensor = SmokeSensor;
/**
 * Service "Speaker"
 * @since iOS 10
 */
class Speaker extends Service_1.Service {
    static UUID = "00000113-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Speaker.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Mute);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Active);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Volume);
    }
}
exports.Speaker = Speaker;
Service_1.Service.Speaker = Speaker;
/**
 * Service "Stateful Programmable Switch"
 */
class StatefulProgrammableSwitch extends Service_1.Service {
    static UUID = "00000088-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, StatefulProgrammableSwitch.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.ProgrammableSwitchEvent);
        this.addCharacteristic(Characteristic_1.Characteristic.ProgrammableSwitchOutputState);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
    }
}
exports.StatefulProgrammableSwitch = StatefulProgrammableSwitch;
Service_1.Service.StatefulProgrammableSwitch = StatefulProgrammableSwitch;
/**
 * Service "Stateless Programmable Switch"
 */
class StatelessProgrammableSwitch extends Service_1.Service {
    static UUID = "00000089-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, StatelessProgrammableSwitch.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.ProgrammableSwitchEvent);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ServiceLabelIndex);
    }
}
exports.StatelessProgrammableSwitch = StatelessProgrammableSwitch;
Service_1.Service.StatelessProgrammableSwitch = StatelessProgrammableSwitch;
/**
 * Service "Switch"
 */
class Switch extends Service_1.Service {
    static UUID = "00000049-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Switch.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.On);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
    }
}
exports.Switch = Switch;
Service_1.Service.Switch = Switch;
/**
 * Service "Tap Management"
 * @deprecated Removed
 */
class TapManagement extends Service_1.Service {
    static UUID = "0000022E-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, TapManagement.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Active);
        this.addCharacteristic(Characteristic_1.Characteristic.CryptoHash);
        this.addCharacteristic(Characteristic_1.Characteristic.TapType);
        this.addCharacteristic(Characteristic_1.Characteristic.Token);
    }
}
exports.TapManagement = TapManagement;
// noinspection JSDeprecatedSymbols
Service_1.Service.TapManagement = TapManagement;
/**
 * Service "Target Control"
 */
class TargetControl extends Service_1.Service {
    static UUID = "00000125-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, TargetControl.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Active);
        this.addCharacteristic(Characteristic_1.Characteristic.ActiveIdentifier);
        this.addCharacteristic(Characteristic_1.Characteristic.ButtonEvent);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
    }
}
exports.TargetControl = TargetControl;
Service_1.Service.TargetControl = TargetControl;
/**
 * Service "Target Control Management"
 */
class TargetControlManagement extends Service_1.Service {
    static UUID = "00000122-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, TargetControlManagement.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.TargetControlSupportedConfiguration);
        this.addCharacteristic(Characteristic_1.Characteristic.TargetControlList);
    }
}
exports.TargetControlManagement = TargetControlManagement;
Service_1.Service.TargetControlManagement = TargetControlManagement;
/**
 * Service "Television"
 */
class Television extends Service_1.Service {
    static UUID = "000000D8-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Television.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Active);
        this.addCharacteristic(Characteristic_1.Characteristic.ActiveIdentifier);
        this.addCharacteristic(Characteristic_1.Characteristic.ConfiguredName);
        this.addCharacteristic(Characteristic_1.Characteristic.RemoteKey);
        this.addCharacteristic(Characteristic_1.Characteristic.SleepDiscoveryMode);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Brightness);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ClosedCaptions);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.DisplayOrder);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CurrentMediaState);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.TargetMediaState);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.PictureMode);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.PowerModeSelection);
    }
}
exports.Television = Television;
Service_1.Service.Television = Television;
/**
 * Service "Television Speaker"
 */
class TelevisionSpeaker extends Service_1.Service {
    static UUID = "00000113-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, TelevisionSpeaker.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Mute);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Active);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Volume);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.VolumeControlType);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.VolumeSelector);
    }
}
exports.TelevisionSpeaker = TelevisionSpeaker;
Service_1.Service.TelevisionSpeaker = TelevisionSpeaker;
/**
 * Service "Temperature Sensor"
 */
class TemperatureSensor extends Service_1.Service {
    static UUID = "0000008A-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, TemperatureSensor.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentTemperature);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusActive);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusLowBattery);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusTampered);
    }
}
exports.TemperatureSensor = TemperatureSensor;
Service_1.Service.TemperatureSensor = TemperatureSensor;
/**
 * Service "Thermostat"
 */
class Thermostat extends Service_1.Service {
    static UUID = "0000004A-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Thermostat.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentHeatingCoolingState);
        this.addCharacteristic(Characteristic_1.Characteristic.TargetHeatingCoolingState);
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentTemperature);
        this.addCharacteristic(Characteristic_1.Characteristic.TargetTemperature);
        this.addCharacteristic(Characteristic_1.Characteristic.TemperatureDisplayUnits);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CurrentRelativeHumidity);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.TargetRelativeHumidity);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CoolingThresholdTemperature);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.HeatingThresholdTemperature);
    }
}
exports.Thermostat = Thermostat;
Service_1.Service.Thermostat = Thermostat;
/**
 * Service "Thread Transport"
 */
class ThreadTransport extends Service_1.Service {
    static UUID = "00000701-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, ThreadTransport.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentTransport);
        this.addCharacteristic(Characteristic_1.Characteristic.ThreadControlPoint);
        this.addCharacteristic(Characteristic_1.Characteristic.ThreadNodeCapabilities);
        this.addCharacteristic(Characteristic_1.Characteristic.ThreadStatus);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CCAEnergyDetectThreshold);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CCASignalDetectThreshold);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.EventRetransmissionMaximum);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.EventTransmissionCounters);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.MACRetransmissionMaximum);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.MACTransmissionCounters);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ReceiverSensitivity);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ReceivedSignalStrengthIndication);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SignalToNoiseRatio);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ThreadOpenThreadVersion);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.TransmitPower);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.MaximumTransmitPower);
    }
}
exports.ThreadTransport = ThreadTransport;
Service_1.Service.ThreadTransport = ThreadTransport;
/**
 * Service "Transfer Transport Management"
 */
class TransferTransportManagement extends Service_1.Service {
    static UUID = "00000203-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, TransferTransportManagement.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.SupportedTransferTransportConfiguration);
        this.addCharacteristic(Characteristic_1.Characteristic.SetupTransferTransport);
    }
}
exports.TransferTransportManagement = TransferTransportManagement;
Service_1.Service.TransferTransportManagement = TransferTransportManagement;
/**
 * Service "Tunnel"
 * @deprecated Removed
 */
class Tunnel extends Service_1.Service {
    static UUID = "00000056-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Tunnel.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.AccessoryIdentifier);
        this.addCharacteristic(Characteristic_1.Characteristic.TunnelConnectionTimeout);
        this.addCharacteristic(Characteristic_1.Characteristic.TunneledAccessoryAdvertising);
        this.addCharacteristic(Characteristic_1.Characteristic.TunneledAccessoryConnected);
        this.addCharacteristic(Characteristic_1.Characteristic.TunneledAccessoryStateNumber);
    }
}
exports.Tunnel = Tunnel;
// noinspection JSDeprecatedSymbols
Service_1.Service.Tunnel = Tunnel;
/**
 * Service "Valve"
 */
class Valve extends Service_1.Service {
    static UUID = "000000D0-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Valve.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.Active);
        this.addCharacteristic(Characteristic_1.Characteristic.InUse);
        this.addCharacteristic(Characteristic_1.Characteristic.ValveType);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.IsConfigured);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.RemainingDuration);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ServiceLabelIndex);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.SetDuration);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.StatusFault);
    }
}
exports.Valve = Valve;
Service_1.Service.Valve = Valve;
/**
 * Service "Wi-Fi Router"
 */
class WiFiRouter extends Service_1.Service {
    static UUID = "0000020A-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, WiFiRouter.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.ConfiguredName);
        this.addCharacteristic(Characteristic_1.Characteristic.ManagedNetworkEnable);
        this.addCharacteristic(Characteristic_1.Characteristic.NetworkAccessViolationControl);
        this.addCharacteristic(Characteristic_1.Characteristic.NetworkClientProfileControl);
        this.addCharacteristic(Characteristic_1.Characteristic.NetworkClientStatusControl);
        this.addCharacteristic(Characteristic_1.Characteristic.RouterStatus);
        this.addCharacteristic(Characteristic_1.Characteristic.SupportedRouterConfiguration);
        this.addCharacteristic(Characteristic_1.Characteristic.WANConfigurationList);
        this.addCharacteristic(Characteristic_1.Characteristic.WANStatusList);
    }
}
exports.WiFiRouter = WiFiRouter;
Service_1.Service.WiFiRouter = WiFiRouter;
/**
 * Service "Wi-Fi Satellite"
 */
class WiFiSatellite extends Service_1.Service {
    static UUID = "0000020F-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, WiFiSatellite.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.WiFiSatelliteStatus);
    }
}
exports.WiFiSatellite = WiFiSatellite;
Service_1.Service.WiFiSatellite = WiFiSatellite;
/**
 * Service "Wi-Fi Transport"
 */
class WiFiTransport extends Service_1.Service {
    static UUID = "0000022A-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, WiFiTransport.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentTransport);
        this.addCharacteristic(Characteristic_1.Characteristic.WiFiCapabilities);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.PreferredWiFiList);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.WiFiConfigurationControl);
    }
}
exports.WiFiTransport = WiFiTransport;
Service_1.Service.WiFiTransport = WiFiTransport;
/**
 * Service "Window"
 */
class Window extends Service_1.Service {
    static UUID = "0000008B-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, Window.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentPosition);
        this.addCharacteristic(Characteristic_1.Characteristic.PositionState);
        this.addCharacteristic(Characteristic_1.Characteristic.TargetPosition);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ObstructionDetected);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.HoldPosition);
    }
}
exports.Window = Window;
Service_1.Service.Window = Window;
/**
 * Service "Window Covering"
 */
class WindowCovering extends Service_1.Service {
    static UUID = "0000008C-0000-1000-8000-0026BB765291";
    constructor(displayName, subtype) {
        super(displayName, WindowCovering.UUID, subtype);
        // Required Characteristics
        this.addCharacteristic(Characteristic_1.Characteristic.CurrentPosition);
        this.addCharacteristic(Characteristic_1.Characteristic.PositionState);
        this.addCharacteristic(Characteristic_1.Characteristic.TargetPosition);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CurrentHorizontalTiltAngle);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.TargetHorizontalTiltAngle);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.Name);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.ObstructionDetected);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.HoldPosition);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.CurrentVerticalTiltAngle);
        this.addOptionalCharacteristic(Characteristic_1.Characteristic.TargetVerticalTiltAngle);
    }
}
exports.WindowCovering = WindowCovering;
Service_1.Service.WindowCovering = WindowCovering;
//# sourceMappingURL=ServiceDefinitions.js.map