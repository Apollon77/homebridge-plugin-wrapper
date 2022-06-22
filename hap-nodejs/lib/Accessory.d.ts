/// <reference types="node" />
import { MulticastOptions } from "bonjour-hap";
import { EventEmitter } from "events";
import { HAPPincode, InterfaceName, IPAddress, MacAddress, Nullable, VoidCallback, WithUUID } from "../types";
import { Advertiser } from "./Advertiser";
import { LegacyCameraSource } from "./camera";
import { Characteristic } from "./Characteristic";
import { CameraController, Controller, ControllerConstructor, ControllerIdentifier, ControllerServiceMap } from "./controller";
import { HAPServer } from "./HAPServer";
import { AccessoryInfo } from "./model/AccessoryInfo";
import { ControllerStorage } from "./model/ControllerStorage";
import { IdentifierCache } from "./model/IdentifierCache";
import { SerializedService, Service, ServiceCharacteristicChange, ServiceId } from "./Service";
export declare const enum Categories {
    OTHER = 1,
    BRIDGE = 2,
    FAN = 3,
    GARAGE_DOOR_OPENER = 4,
    LIGHTBULB = 5,
    DOOR_LOCK = 6,
    OUTLET = 7,
    SWITCH = 8,
    THERMOSTAT = 9,
    SENSOR = 10,
    ALARM_SYSTEM = 11,
    SECURITY_SYSTEM = 11,
    DOOR = 12,
    WINDOW = 13,
    WINDOW_COVERING = 14,
    PROGRAMMABLE_SWITCH = 15,
    RANGE_EXTENDER = 16,
    CAMERA = 17,
    IP_CAMERA = 17,
    VIDEO_DOORBELL = 18,
    AIR_PURIFIER = 19,
    AIR_HEATER = 20,
    AIR_CONDITIONER = 21,
    AIR_HUMIDIFIER = 22,
    AIR_DEHUMIDIFIER = 23,
    APPLE_TV = 24,
    HOMEPOD = 25,
    SPEAKER = 26,
    AIRPORT = 27,
    SPRINKLER = 28,
    FAUCET = 29,
    SHOWER_HEAD = 30,
    TELEVISION = 31,
    TARGET_CONTROLLER = 32,
    ROUTER = 33,
    AUDIO_RECEIVER = 34,
    TV_SET_TOP_BOX = 35,
    TV_STREAMING_STICK = 36
}
/**
 * @private
 */
export interface SerializedAccessory {
    displayName: string;
    UUID: string;
    lastKnownUsername?: MacAddress;
    category: Categories;
    services: SerializedService[];
    linkedServices?: Record<ServiceId, ServiceId[]>;
    controllers?: SerializedControllerContext[];
}
/**
 * @private
 */
export interface SerializedControllerContext {
    type: ControllerIdentifier;
    services: SerializedServiceMap;
}
export declare type SerializedServiceMap = Record<string, ServiceId>;
export interface ControllerContext {
    controller: Controller;
    serviceMap: ControllerServiceMap;
}
export declare const enum CharacteristicWarningType {
    SLOW_WRITE = "slow-write",
    TIMEOUT_WRITE = "timeout-write",
    SLOW_READ = "slow-read",
    TIMEOUT_READ = "timeout-read",
    WARN_MESSAGE = "warn-message",
    ERROR_MESSAGE = "error-message",
    DEBUG_MESSAGE = "debug-message"
}
export interface CharacteristicWarning {
    characteristic: Characteristic;
    type: CharacteristicWarningType;
    message: string;
    originatorChain: string[];
    stack?: string;
}
/**
 * @deprecated
 */
export declare type CharacteristicEvents = Record<string, any>;
export interface PublishInfo {
    username: MacAddress;
    pincode: HAPPincode;
    /**
     * Specify the category for the HomeKit accessory.
     * The category is used only in the mdns advertisement and specifies the devices type
     * for the HomeKit controller.
     * Currently this only affects the icon shown in the pairing screen.
     * For the Television and Smart Speaker service it also affects the icon shown in
     * the Home app when paired.
     */
    category?: Categories;
    setupID?: string;
    /**
     * Defines the host where the HAP server will be bound to.
     * When undefined the HAP server will bind to all available interfaces
     * (see https://nodejs.org/api/net.html#net_server_listen_port_host_backlog_callback).
     *
     * This property accepts a mixture of IPAddresses and network interface names.
     * Depending on the mixture of supplied addresses/names hap-nodejs will bind differently.
     *
     * It is advised to not just bind to a specific address, but specifying the interface name
     * in oder to bind on all address records (and ip version) available.
     *
     * HAP-NodeJS (or the underlying ciao library) will not report about misspelled interface names,
     * as it could be that the interface is currently just down and will come up later.
     *
     * Here are a few examples:
     *  - bind: "::"
     *      Pretty much identical to not specifying anything, as most systems (with ipv6 support)
     *      will default to the unspecified ipv6 address (with dual stack support).
     *
     *  - bind: "0.0.0.0"
     *      Binding TCP socket to the unspecified ipv4 address.
     *      The mdns advertisement will exclude any ipv6 address records.
     *
     *  - bind: ["en0", "lo0"]
     *      The mdns advertising will advertise all records of the en0 and loopback interface (if available) and
     *      will also react to address changes on those interfaces.
     *      In order for the HAP server to accept all those address records (which may contain ipv6 records)
     *      it will bind on the unspecified ipv6 address "::" (assuming dual stack is supported).
     *
     *  - bind: ["en0", "lo0", "0.0.0.0"]
     *      Same as above, only that the HAP server will bind on the unspecified ipv4 address "0.0.0.0".
     *      The mdns advertisement will not advertise any ipv6 records.
     *
     *  - bind: "169.254.104.90"
     *      This will bind the HAP server to the address 0.0.0.0.
     *      The mdns advertisement will only advertise the A record 169.254.104.90.
     *      If the given network interface of that address encounters an ip address change (to a different address),
     *      the mdns advertisement will result in not advertising a address at all.
     *      So it is advised to specify a interface name instead of a specific address.
     *      This is identical with ipv6 addresses.
     *
     *  - bind: ["169.254.104.90", "192.168.1.4"]
     *      As the HAP TCP socket can only bind to a single address, when specifying multiple ip addresses
     *      the HAP server will bind to the unspecified ip address (0.0.0.0 if only ipv4 addresses are supplied,
     *      :: if a mixture or only ipv6 addresses are supplied).
     *      The mdns advertisement will only advertise the specified ip addresses.
     *      If the given network interface of that address encounters an ip address change (to different addresses),
     *      the mdns advertisement will result in not advertising a address at all.
     *      So it is advised to specify a interface name instead of a specific address.
     *
     */
    bind?: (InterfaceName | IPAddress) | (InterfaceName | IPAddress)[];
    /**
     * Defines the port where the HAP server will be bound to.
     * When undefined port 0 will be used resulting in a random port.
     */
    port?: number;
    /**
     * Used to define custom MDNS options. Is not used anymore.
     * @deprecated
     */
    mdns?: MulticastOptions;
    /**
     * If this option is set to true, HAP-NodeJS will add identifying material (based on {@link username})
     * to the end of the accessory display name (and bonjour instance name).
     * Default: true
     */
    addIdentifyingMaterial?: boolean;
    /**
     * Defines the advertiser used with the published Accessory.
     */
    advertiser?: MDNSAdvertiser;
    /**
     * Use the legacy bonjour-hap as advertiser.
     * @deprecated
     */
    useLegacyAdvertiser?: boolean;
}
export declare const enum MDNSAdvertiser {
    /**
     * Use the `@homebridge/ciao` module as advertiser.
     */
    CIAO = "ciao",
    /**
     * Use the `bonjour-hap` module as advertiser.
     */
    BONJOUR = "bonjour-hap",
    /**
     * Use Avahi/D-Bus as advertiser.
     */
    AVAHI = "avahi"
}
export declare type AccessoryCharacteristicChange = ServiceCharacteristicChange & {
    service: Service;
};
export interface ServiceConfigurationChange {
    service: Service;
}
/**
 * @deprecated Use AccessoryEventTypes instead
 */
export declare type EventAccessory = "identify" | "listening" | "service-configurationChange" | "service-characteristic-change";
export declare const enum AccessoryEventTypes {
    /**
     * Emitted when an iOS device wishes for this Accessory to identify itself. If `paired` is false, then
     * this device is currently browsing for Accessories in the system-provided "Add Accessory" screen. If
     * `paired` is true, then this is a device that has already paired with us. Note that if `paired` is true,
     * listening for this event is a shortcut for the underlying mechanism of setting the `Identify` Characteristic:
     * `getService(Service.AccessoryInformation).getCharacteristic(Characteristic.Identify).on('set', ...)`
     * You must call the callback for identification to be successful.
     */
    IDENTIFY = "identify",
    /**
     * This event is emitted once the HAP TCP socket is bound.
     * At this point the mdns advertisement isn't yet available. Use the {@link ADVERTISED} if you require the accessory to be discoverable.
     */
    LISTENING = "listening",
    /**
     * This event is emitted once the mDNS suite has fully advertised the presence of the accessory.
     * This event is guaranteed to be called after {@link LISTENING}.
     */
    ADVERTISED = "advertised",
    SERVICE_CONFIGURATION_CHANGE = "service-configurationChange",
    /**
     * Emitted after a change in the value of one of the provided Service's Characteristics.
     */
    SERVICE_CHARACTERISTIC_CHANGE = "service-characteristic-change",
    PAIRED = "paired",
    UNPAIRED = "unpaired",
    CHARACTERISTIC_WARNING = "characteristic-warning"
}
export declare interface Accessory {
    on(event: "identify", listener: (paired: boolean, callback: VoidCallback) => void): this;
    on(event: "listening", listener: (port: number, address: string) => void): this;
    on(event: "advertised", listener: () => void): this;
    on(event: "service-configurationChange", listener: (change: ServiceConfigurationChange) => void): this;
    on(event: "service-characteristic-change", listener: (change: AccessoryCharacteristicChange) => void): this;
    on(event: "paired", listener: () => void): this;
    on(event: "unpaired", listener: () => void): this;
    on(event: "characteristic-warning", listener: (warning: CharacteristicWarning) => void): this;
    emit(event: "identify", paired: boolean, callback: VoidCallback): boolean;
    emit(event: "listening", port: number, address: string): boolean;
    emit(event: "advertised"): boolean;
    emit(event: "service-configurationChange", change: ServiceConfigurationChange): boolean;
    emit(event: "service-characteristic-change", change: AccessoryCharacteristicChange): boolean;
    emit(event: "paired"): boolean;
    emit(event: "unpaired"): boolean;
    emit(event: "characteristic-warning", warning: CharacteristicWarning): boolean;
}
/**
 * Accessory is a virtual HomeKit device. It can publish an associated HAP server for iOS devices to communicate
 * with - or it can run behind another "Bridge" Accessory server.
 *
 * Bridged Accessories in this implementation must have a UUID that is unique among all other Accessories that
 * are hosted by the Bridge. This UUID must be "stable" and unchanging, even when the server is restarted. This
 * is required so that the Bridge can provide consistent "Accessory IDs" (aid) and "Instance IDs" (iid) for all
 * Accessories, Services, and Characteristics for iOS clients to reference later.
 */
export declare class Accessory extends EventEmitter {
    displayName: string;
    UUID: string;
    /**
     * @deprecated Please use the Categories const enum above.
     */
    static Categories: typeof Categories;
    aid: Nullable<number>;
    _isBridge: boolean;
    bridged: boolean;
    bridge?: Accessory;
    bridgedAccessories: Accessory[];
    reachable: boolean;
    lastKnownUsername?: MacAddress;
    category: Categories;
    services: Service[];
    private primaryService?;
    shouldPurgeUnusedIDs: boolean;
    /**
     * Captures if initialization steps inside {@link publish} have been called.
     * This is important when calling {@link publish} multiple times (e.g. after calling {@link unpublish}).
     * @private Private API
     */
    private initialized;
    private controllers;
    private serializedControllers?;
    private activeCameraController?;
    _accessoryInfo?: Nullable<AccessoryInfo>;
    _setupID: Nullable<string>;
    _identifierCache?: Nullable<IdentifierCache>;
    controllerStorage: ControllerStorage;
    _advertiser?: Advertiser;
    _server?: HAPServer;
    _setupURI?: string;
    private configurationChangeDebounceTimeout?;
    /**
     * This property captures the time when we last served a /accessories request.
     * For multiple bursts of /accessories request we don't want to always contact GET handlers
     */
    private lastAccessoriesRequest;
    constructor(displayName: string, UUID: string);
    private identificationRequest;
    addService(serviceParam: Service | typeof Service, ...constructorArgs: any[]): Service;
    /**
     * @deprecated use {@link Service.setPrimaryService} directly
     */
    setPrimaryService(service: Service): void;
    removeService(service: Service): void;
    private removeLinkedService;
    getService<T extends WithUUID<typeof Service>>(name: string | T): Service | undefined;
    getServiceById<T extends WithUUID<typeof Service>>(uuid: string | T, subType: string): Service | undefined;
    /**
     * Returns the bridging accessory if this accessory is bridged.
     * Otherwise returns itself.
     *
     * @returns the primary accessory
     */
    getPrimaryAccessory: () => Accessory;
    /**
     * @deprecated Not supported anymore
     */
    updateReachability(reachable: boolean): void;
    addBridgedAccessory(accessory: Accessory, deferUpdate?: boolean): Accessory;
    addBridgedAccessories(accessories: Accessory[]): void;
    removeBridgedAccessory(accessory: Accessory, deferUpdate: boolean): void;
    removeBridgedAccessories(accessories: Accessory[]): void;
    removeAllBridgedAccessories(): void;
    private getCharacteristicByIID;
    protected getAccessoryByAID(aid: number): Accessory | undefined;
    protected findCharacteristic(aid: number, iid: number): Characteristic | undefined;
    /**
     * Method is used to configure an old style CameraSource.
     * The CameraSource API was fully replaced by the new Controller API used by {@link CameraController}.
     * The {@link CameraStreamingDelegate} used by the CameraController is the equivalent to the old CameraSource.
     *
     * The new Controller API is much more refined and robust way of "grouping" services together.
     * It especially is intended to fully support serialization/deserialization to/from persistent storage.
     * This feature is also gained when using the old style CameraSource API.
     * The {@link CameraStreamingDelegate} improves on the overall camera API though and provides some reworked
     * type definitions and a refined callback interface to better signal errors to the requesting HomeKit device.
     * It is advised to update to it.
     *
     * Full backwards compatibility is currently maintained. A legacy CameraSource will be wrapped into an Adapter.
     * All legacy StreamControllers in the "streamControllers" property will be replaced by CameraRTPManagement instances.
     * Any services in the "services" property which are one of the following are ignored:
     *     - CameraRTPStreamManagement
     *     - CameraOperatingMode
     *     - CameraEventRecordingManagement
     *
     * @param cameraSource {LegacyCameraSource}
     * @deprecated please refer to the new {@see CameraController} API and {@link configureController}
     */
    configureCameraSource(cameraSource: LegacyCameraSource): CameraController;
    /**
     * This method is used to setup a new Controller for this accessory. See {@see Controller} for a more detailed
     * explanation what a Controller is and what it is capable of.
     *
     * The controller can be passed as an instance of the class or as a constructor (without any necessary parameters)
     * for a new Controller.
     * Only one Controller of a given {@link ControllerIdentifier} can be configured for a given Accessory.
     *
     * When called, it will be checked if there are any services and persistent data the Controller (for the given
     * {@link ControllerIdentifier}) can be restored from. Otherwise the Controller will be created with new services.
     *
     *
     * @param controllerConstructor {Controller | ControllerConstructor}
     */
    configureController(controllerConstructor: Controller | ControllerConstructor): void;
    /**
     * This method will remove a given Controller from this accessory.
     * The controller object will be restored to its initial state.
     * This also means that any event handlers setup for the controller will be removed.
     *
     * @param controller - The controller which should be removed from the accessory.
     */
    removeController(controller: Controller): void;
    private handleAccessoryUnpairedForControllers;
    private handleUpdatedControllerServiceMap;
    setupURI(): string;
    /**
     * This method is called right before the accessory is published. It should be used to check for common
     * mistakes in Accessory structured, which may lead to HomeKit rejecting the accessory when pairing.
     * If it is called on a bridge it will call this method for all bridged accessories.
     */
    private validateAccessory;
    /**
     * Assigns aid/iid to ourselves, any Accessories we are bridging, and all associated Services+Characteristics. Uses
     * the provided identifierCache to keep IDs stable.
     */
    _assignIDs(identifierCache: IdentifierCache): void;
    disableUnusedIDPurge(): void;
    enableUnusedIDPurge(): void;
    /**
     * Manually purge the unused ids if you like, comes handy
     * when you have disabled auto purge so you can do it manually
     */
    purgeUnusedIDs(): void;
    /**
     * Returns a JSON representation of this accessory suitable for delivering to HAP clients.
     */
    private toHAP;
    /**
     * Returns a JSON representation of this accessory without characteristic values.
     */
    private internalHAPRepresentation;
    /**
     * Publishes this Accessory on the local network for iOS clients to communicate with.
     *
     * @param {Object} info - Required info for publishing.
     * @param allowInsecureRequest - Will allow unencrypted and unauthenticated access to the http server
     * @param {string} info.username - The "username" (formatted as a MAC address - like "CC:22:3D:E3:CE:F6") of
     *                                this Accessory. Must be globally unique from all Accessories on your local network.
     * @param {string} info.pincode - The 8-digit pincode for clients to use when pairing this Accessory. Must be formatted
     *                               as a string like "031-45-154".
     * @param {string} info.category - One of the values of the Accessory.Category enum, like Accessory.Category.SWITCH.
     *                                This is a hint to iOS clients about what "type" of Accessory this represents, so
     *                                that for instance an appropriate icon can be drawn for the user while adding a
     *                                new Accessory.
     */
    publish(info: PublishInfo, allowInsecureRequest?: boolean): Promise<void>;
    /**
     * Removes this Accessory from the local network
     * Accessory object will no longer valid after invoking this method
     * Trying to invoke publish() on the object will result undefined behavior
     */
    destroy(): Promise<void>;
    unpublish(): Promise<void>;
    private enqueueConfigurationUpdate;
    private onListening;
    private handleInitialPairSetupFinished;
    private handleAddPairing;
    private handleRemovePairing;
    private handleListPairings;
    private handleAccessories;
    private handleGetCharacteristics;
    private handleCharacteristicRead;
    private handleSetCharacteristics;
    private handleCharacteristicWrite;
    private handleResource;
    private handleHAPConnectionClosed;
    private handleServiceConfigurationChangeEvent;
    private handleCharacteristicChangeEvent;
    private sendCharacteristicWarning;
    private handleCharacteristicWarning;
    private setupServiceEventHandlers;
    private _sideloadServices;
    private static _generateSetupID;
    static serialize(accessory: Accessory): SerializedAccessory;
    static deserialize(json: SerializedAccessory): Accessory;
    static cleanupAccessoryData(username: MacAddress): void;
    private static serializeServiceMap;
    private static deserializeServiceMap;
    private static parseBindOption;
}
//# sourceMappingURL=Accessory.d.ts.map