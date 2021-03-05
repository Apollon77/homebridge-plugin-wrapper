/// <reference types="node" />
import { EventEmitter } from "events";
import { ServiceJsonObject } from "../internal-types";
import { CharacteristicValue, Nullable, WithUUID } from '../types';
import { CharacteristicWarning } from "./Accessory";
import { Characteristic, CharacteristicChange, SerializedCharacteristic } from './Characteristic';
import { AccessControl, AccessoryInformation, AccessoryRuntimeInformation, AirPurifier, AirQualitySensor, AudioStreamManagement, Battery, BridgeConfiguration, BridgingState, CameraControl, CameraOperatingMode, CameraRecordingManagement, CameraRTPStreamManagement, CarbonDioxideSensor, CarbonMonoxideSensor, CloudRelay, ContactSensor, DataStreamTransportManagement, Diagnostics, Door, Doorbell, Fan, Fanv2, Faucet, FilterMaintenance, GarageDoorOpener, HeaterCooler, HumidifierDehumidifier, HumiditySensor, InputSource, IrrigationSystem, LeakSensor, Lightbulb, LightSensor, LockManagement, LockMechanism, Microphone, MotionSensor, OccupancySensor, Outlet, Pairing, PowerManagement, ProtocolInformation, SecuritySystem, ServiceLabel, Siri, Slats, SmartSpeaker, SmokeSensor, Speaker, StatefulProgrammableSwitch, StatelessProgrammableSwitch, Switch, TargetControl, TargetControlManagement, Television, TelevisionSpeaker, TemperatureSensor, Thermostat, ThreadTransport, TimeInformation, TransferTransportManagement, Tunnel, Valve, WiFiRouter, WiFiSatellite, WiFiTransport, Window, WindowCovering } from "./definitions";
import { IdentifierCache } from './model/IdentifierCache';
import { HAPConnection } from "./util/eventedhttp";
/**
 * @private
 */
export interface SerializedService {
    displayName: string;
    UUID: string;
    subtype?: string;
    constructorName?: string;
    hiddenService?: boolean;
    primaryService?: boolean;
    characteristics: SerializedCharacteristic[];
    optionalCharacteristics?: SerializedCharacteristic[];
}
export declare type ServiceId = string;
export declare type ServiceCharacteristicChange = CharacteristicChange & {
    characteristic: Characteristic;
};
/**
 * @deprecated Use ServiceEventTypes instead
 */
export declare type EventService = ServiceEventTypes.CHARACTERISTIC_CHANGE | ServiceEventTypes.SERVICE_CONFIGURATION_CHANGE;
export declare const enum ServiceEventTypes {
    CHARACTERISTIC_CHANGE = "characteristic-change",
    SERVICE_CONFIGURATION_CHANGE = "service-configurationChange",
    CHARACTERISTIC_WARNING = "characteristic-warning"
}
export declare interface Service {
    on(event: "characteristic-change", listener: (change: ServiceCharacteristicChange) => void): this;
    on(event: "service-configurationChange", listener: () => void): this;
    on(event: "characteristic-warning", listener: (warning: CharacteristicWarning) => void): this;
    emit(event: "characteristic-change", change: ServiceCharacteristicChange): boolean;
    emit(event: "service-configurationChange"): boolean;
    emit(event: "characteristic-warning", warning: CharacteristicWarning): boolean;
}
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
export declare class Service extends EventEmitter {
    static AccessControl: typeof AccessControl;
    static AccessoryInformation: typeof AccessoryInformation;
    static AccessoryRuntimeInformation: typeof AccessoryRuntimeInformation;
    static AirPurifier: typeof AirPurifier;
    static AirQualitySensor: typeof AirQualitySensor;
    static AudioStreamManagement: typeof AudioStreamManagement;
    static Battery: typeof Battery;
    /**
     * @deprecated Please use {@link Service.Battery}.
     */
    static BatteryService: typeof Battery;
    /**
     * @deprecated Removed and not used anymore
     */
    static BridgeConfiguration: typeof BridgeConfiguration;
    /**
     * @deprecated Removed and not used anymore
     */
    static BridgingState: typeof BridgingState;
    /**
     * @deprecated This service has no usage anymore and will be ignored by iOS
     */
    static CameraControl: typeof CameraControl;
    /**
     * @deprecated Please use {@link Service.CameraRecordingManagement}.
     */
    static CameraEventRecordingManagement: typeof CameraRecordingManagement;
    static CameraOperatingMode: typeof CameraOperatingMode;
    static CameraRecordingManagement: typeof CameraRecordingManagement;
    static CameraRTPStreamManagement: typeof CameraRTPStreamManagement;
    static CarbonDioxideSensor: typeof CarbonDioxideSensor;
    static CarbonMonoxideSensor: typeof CarbonMonoxideSensor;
    static CloudRelay: typeof CloudRelay;
    static ContactSensor: typeof ContactSensor;
    static DataStreamTransportManagement: typeof DataStreamTransportManagement;
    static Diagnostics: typeof Diagnostics;
    static Door: typeof Door;
    static Doorbell: typeof Doorbell;
    static Fan: typeof Fan;
    static Fanv2: typeof Fanv2;
    static Faucet: typeof Faucet;
    static FilterMaintenance: typeof FilterMaintenance;
    static GarageDoorOpener: typeof GarageDoorOpener;
    static HeaterCooler: typeof HeaterCooler;
    static HumidifierDehumidifier: typeof HumidifierDehumidifier;
    static HumiditySensor: typeof HumiditySensor;
    static InputSource: typeof InputSource;
    static IrrigationSystem: typeof IrrigationSystem;
    static LeakSensor: typeof LeakSensor;
    static Lightbulb: typeof Lightbulb;
    static LightSensor: typeof LightSensor;
    static LockManagement: typeof LockManagement;
    static LockMechanism: typeof LockMechanism;
    static Microphone: typeof Microphone;
    static MotionSensor: typeof MotionSensor;
    static OccupancySensor: typeof OccupancySensor;
    static Outlet: typeof Outlet;
    static Pairing: typeof Pairing;
    static PowerManagement: typeof PowerManagement;
    static ProtocolInformation: typeof ProtocolInformation;
    /**
     * @deprecated Please use {@link Service.CloudRelay}.
     */
    static Relay: typeof CloudRelay;
    static SecuritySystem: typeof SecuritySystem;
    static ServiceLabel: typeof ServiceLabel;
    static Siri: typeof Siri;
    /**
     * @deprecated Please use {@link Service.Slats}.
     */
    static Slat: typeof Slats;
    static Slats: typeof Slats;
    static SmartSpeaker: typeof SmartSpeaker;
    static SmokeSensor: typeof SmokeSensor;
    static Speaker: typeof Speaker;
    static StatefulProgrammableSwitch: typeof StatefulProgrammableSwitch;
    static StatelessProgrammableSwitch: typeof StatelessProgrammableSwitch;
    static Switch: typeof Switch;
    static TargetControl: typeof TargetControl;
    static TargetControlManagement: typeof TargetControlManagement;
    static Television: typeof Television;
    static TelevisionSpeaker: typeof TelevisionSpeaker;
    static TemperatureSensor: typeof TemperatureSensor;
    static Thermostat: typeof Thermostat;
    static ThreadTransport: typeof ThreadTransport;
    /**
     * @deprecated Removed and not used anymore
     */
    static TimeInformation: typeof TimeInformation;
    static TransferTransportManagement: typeof TransferTransportManagement;
    static Tunnel: typeof Tunnel;
    /**
     * @deprecated Please use {@link Service.Tunnel}.
     */
    static TunneledBTLEAccessoryService: typeof Tunnel;
    static Valve: typeof Valve;
    static WiFiRouter: typeof WiFiRouter;
    static WiFiSatellite: typeof WiFiSatellite;
    static WiFiTransport: typeof WiFiTransport;
    static Window: typeof Window;
    static WindowCovering: typeof WindowCovering;
    displayName: string;
    UUID: string;
    subtype?: string;
    iid: Nullable<number>;
    name: Nullable<string>;
    characteristics: Characteristic[];
    optionalCharacteristics: Characteristic[];
    /**
     * @private
     */
    isHiddenService: boolean;
    /**
     * @private
     */
    isPrimaryService: boolean;
    /**
     * @private
     */
    linkedServices: Service[];
    constructor(displayName: string | undefined, UUID: string, subtype?: string);
    /**
     * Returns an id which uniquely identifies an service on the associated accessory.
     * The serviceId is a concatenation of the UUID for the service (defined by HAP) and the subtype (could be empty)
     * which is programmatically defined by the programmer.
     *
     * @returns the serviceId
     */
    getServiceId(): ServiceId;
    addCharacteristic(input: Characteristic): Characteristic;
    addCharacteristic(input: {
        new (...args: any[]): Characteristic;
    }, ...constructorArgs: any[]): Characteristic;
    /**
     * Sets this service as the new primary service.
     * Any currently active primary service will be reset to be not primary.
     * This will happen immediately, if the service was already added to an accessory, or later
     * when the service gets added to an accessory.
     *
     * @param isPrimary {boolean} - optional boolean (default true) if the service should be the primary service
     */
    setPrimaryService(isPrimary?: boolean): void;
    /**
     * Marks the service as hidden
     *
     * @param isHidden {boolean} - optional boolean (default true) if the service should be marked hidden
     */
    setHiddenService(isHidden?: boolean): void;
    /**
     * Adds a new link to the specified service. The service MUST be already added to
     * the SAME accessory.
     *
     * @param service - The service this service should link to
     */
    addLinkedService(service: Service): void;
    /**
     * Removes a link to the specified service which was previously added with {@link addLinkedService}
     *
     * @param service - Previously linked service
     */
    removeLinkedService(service: Service): void;
    removeCharacteristic(characteristic: Characteristic): void;
    getCharacteristic(constructor: WithUUID<{
        new (): Characteristic;
    }>): Characteristic;
    getCharacteristic(name: string | WithUUID<{
        new (): Characteristic;
    }>): Characteristic | undefined;
    testCharacteristic<T extends WithUUID<typeof Characteristic>>(name: string | T): boolean;
    setCharacteristic<T extends WithUUID<{
        new (): Characteristic;
    }>>(name: string | T, value: CharacteristicValue): Service;
    updateCharacteristic<T extends WithUUID<{
        new (): Characteristic;
    }>>(name: string | T, value: CharacteristicValue): Service;
    addOptionalCharacteristic(characteristic: Characteristic | {
        new (): Characteristic;
    }): void;
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
    replaceCharacteristicsFromService(service: Service): void;
    /**
     * @private
     */
    getCharacteristicByIID(iid: number): Characteristic | undefined;
    /**
     * @private
     */
    _assignIDs(identifierCache: IdentifierCache, accessoryName: string, baseIID?: number): void;
    /**
     * Returns a JSON representation of this service suitable for delivering to HAP clients.
     * @private used to generate response to /accessories query
     */
    toHAP(connection: HAPConnection, contactGetHandlers?: boolean): Promise<ServiceJsonObject>;
    /**
     * Returns a JSON representation of this service without characteristic values.
     * @private used to generate the config hash
     */
    internalHAPRepresentation(): ServiceJsonObject;
    /**
     * @private
     */
    private setupCharacteristicEventHandlers;
    /**
     * @private
     */
    private emitCharacteristicWarningEvent;
    /**
     * @private
     */
    private _sideloadCharacteristics;
    /**
     * @private
     */
    static serialize(service: Service): SerializedService;
    /**
     * @private
     */
    static deserialize(json: SerializedService): Service;
}
//# sourceMappingURL=Service.d.ts.map