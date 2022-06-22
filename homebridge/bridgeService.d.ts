import { PluginManager } from "./pluginManager";
import { Logging } from "./logger";
import { Plugin } from "./plugin";
import { PlatformAccessory } from "./platformAccessory";
import { Accessory, Bridge, CharacteristicWarning, InterfaceName, IPAddress, MacAddress, MDNSAdvertiser } from "hap-nodejs";
import { AccessoryIdentifier, AccessoryName, AccessoryPlugin, HomebridgeAPI, PlatformIdentifier, PlatformName, PluginIdentifier, StaticPlatformPlugin } from "./api";
import { ExternalPortService, ExternalPortsConfiguration } from "./externalPortService";
import { HomebridgeOptions } from "./server";
export interface BridgeConfiguration {
    name: string;
    username: MacAddress;
    pin: string;
    advertiser?: MDNSAdvertiser;
    port?: number;
    bind?: (InterfaceName | IPAddress) | (InterfaceName | IPAddress)[];
    setupID?: string[4];
    manufacturer?: string;
    model?: string;
    disableIpc?: boolean;
}
export interface AccessoryConfig extends Record<string, any> {
    accessory: AccessoryName | AccessoryIdentifier;
    name: string;
    uuid_base?: string;
    _bridge?: BridgeConfiguration;
}
export interface PlatformConfig extends Record<string, any> {
    platform: PlatformName | PlatformIdentifier;
    name?: string;
    _bridge?: BridgeConfiguration;
}
export interface HomebridgeConfig {
    bridge: BridgeConfiguration;
    /**
     * @deprecated
     */
    mdns?: any;
    accessories: AccessoryConfig[];
    platforms: PlatformConfig[];
    plugins?: PluginIdentifier[];
    /**
     * Array of disabled plugins.
     * Unlike the plugins[] config which prevents plugins from being initialised at all, disabled plugins still have their alias loaded so
     * we can match config blocks of disabled plugins and show an appropriate message in the logs.
     */
    disabledPlugins?: PluginIdentifier[];
    ports?: ExternalPortsConfiguration;
}
export interface BridgeOptions extends HomebridgeOptions {
    cachedAccessoriesDir: string;
    cachedAccessoriesItemName: string;
}
export interface CharacteristicWarningOpts {
    ignoreSlow?: boolean;
}
export declare class BridgeService {
    private api;
    private pluginManager;
    private externalPortService;
    private bridgeOptions;
    private bridgeConfig;
    private config;
    bridge: Bridge;
    private storageService;
    private readonly allowInsecureAccess;
    private cachedPlatformAccessories;
    private cachedAccessoriesFileLoaded;
    private readonly publishedExternalAccessories;
    constructor(api: HomebridgeAPI, pluginManager: PluginManager, externalPortService: ExternalPortService, bridgeOptions: BridgeOptions, bridgeConfig: BridgeConfiguration, config: HomebridgeConfig);
    static printCharacteristicWriteWarning(plugin: Plugin, accessory: Accessory, opts: CharacteristicWarningOpts, warning: CharacteristicWarning): void;
    publishBridge(): void;
    /**
     * Attempt to load the cached accessories from disk.
     */
    loadCachedPlatformAccessoriesFromDisk(): Promise<void>;
    /**
     * Return the name of the backup cache file
     */
    private get backupCacheFileName();
    /**
     * Create a backup of the cached file
     * This is used if we ever have trouble reading the main cache file
     */
    private createCachedAccessoriesBackup;
    /**
     * Restore a cached accessories backup
     * This is used if the main cache file has a JSON syntax error / is corrupted
     */
    private restoreCachedAccessoriesBackup;
    restoreCachedPlatformAccessories(): void;
    /**
     * Save the cached accessories back to disk.
     */
    saveCachedPlatformAccessoriesOnDisk(): void;
    handleRegisterPlatformAccessories(accessories: PlatformAccessory[]): void;
    handleUpdatePlatformAccessories(accessories: PlatformAccessory[]): void;
    handleUnregisterPlatformAccessories(accessories: PlatformAccessory[]): void;
    handlePublishExternalAccessories(accessories: PlatformAccessory[]): Promise<void>;
    createHAPAccessory(plugin: Plugin, accessoryInstance: AccessoryPlugin, displayName: string, accessoryType: AccessoryName | AccessoryIdentifier, uuidBase?: string): Accessory | undefined;
    loadPlatformAccessories(plugin: Plugin, platformInstance: StaticPlatformPlugin, platformType: PlatformName | PlatformIdentifier, logger: Logging): Promise<void>;
    teardown(): void;
    private static strippingPinCode;
}
//# sourceMappingURL=bridgeService.d.ts.map