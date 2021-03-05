/// <reference path="../../@types/bonjour-hap.d.ts" />
/// <reference types="node" />
import { MDNSServerOptions, ServiceTxt } from "@homebridge/ciao";
import { InterfaceName, IPAddress } from "@homebridge/ciao/lib/NetworkManager";
import { MulticastOptions } from "bonjour-hap";
import { EventEmitter } from "events";
import { AccessoryInfo } from './model/AccessoryInfo';
/**
 * This enum lists all bitmasks for all known status flags.
 * When the bit for the given bitmask is set, it represents the state described by the name.
 */
export declare const enum StatusFlag {
    NOT_PAIRED = 1,
    NOT_JOINED_WIFI = 2,
    PROBLEM_DETECTED = 4
}
/**
 * This enum lists all bitmasks for all known pairing feature flags.
 * When the bit for the given bitmask is set, it represents the state described by the name.
 */
export declare const enum PairingFeatureFlag {
    SUPPORTS_HARDWARE_AUTHENTICATION = 1,
    SUPPORTS_SOFTWARE_AUTHENTICATION = 2
}
export declare const enum AdvertiserEvent {
    UPDATED_NAME = "updated-name"
}
export declare interface Advertiser {
    on(event: "updated-name", listener: (name: string) => void): this;
    emit(event: "updated-name", name: string): boolean;
}
export interface ServiceNetworkOptions {
    /**
     * If defined it restricts the service to be advertised on the specified
     * ip addresses or interface names.
     *
     * If a interface name is specified, ANY address on that given interface will be advertised
     * (if a IP address of the given interface is also given in the array, it will be overridden).
     * If a IP address is specified, the service will only be advertised for the given addresses.
     *
     * Interface names and addresses can be mixed in the array.
     * If an ip address is given, the ip address must be valid at the time of service creation.
     *
     * If the service is set to advertise on a given interface, though the MDNSServer is
     * configured to ignore this interface, the service won't be advertised on the interface.
     */
    restrictedAddresses?: (InterfaceName | IPAddress)[];
    /**
     * The service won't advertise ipv6 address records.
     * This can be used to simulate binding on 0.0.0.0.
     * May be combined with {@link restrictedAddresses}.
     */
    disabledIpv6?: boolean;
}
export interface Advertiser {
    initPort(port: number): void;
    startAdvertising(): void;
    updateAdvertisement(silent?: boolean): void;
    destroy(): void;
}
/**
 * Advertiser uses mdns to broadcast the presence of an Accessory to the local network.
 *
 * Note that as of iOS 9, an accessory can only pair with a single client. Instead of pairing your
 * accessories with multiple iOS devices in your home, Apple intends for you to use Home Sharing.
 * To support this requirement, we provide the ability to be "discoverable" or not (via a "service flag" on the
 * mdns payload).
 */
export declare class CiaoAdvertiser extends EventEmitter implements Advertiser {
    static protocolVersion: string;
    static protocolVersionService: string;
    private readonly accessoryInfo;
    private readonly setupHash;
    private readonly responder;
    private readonly advertisedService;
    constructor(accessoryInfo: AccessoryInfo, responderOptions?: MDNSServerOptions, serviceOptions?: ServiceNetworkOptions);
    initPort(port: number): void;
    startAdvertising(): Promise<void>;
    updateAdvertisement(silent?: boolean): void;
    destroy(): Promise<void>;
    static createTxt(accessoryInfo: AccessoryInfo, setupHash: string): ServiceTxt;
    static computeSetupHash(accessoryInfo: AccessoryInfo): string;
    static ff(...flags: PairingFeatureFlag[]): number;
    static sf(...flags: StatusFlag[]): number;
}
/**
 * Advertiser base on the legacy "bonjour-hap" library.
 */
export declare class BonjourHAPAdvertiser extends EventEmitter implements Advertiser {
    private readonly accessoryInfo;
    private readonly setupHash;
    private readonly serviceOptions?;
    private bonjour;
    private advertisement?;
    private port?;
    private destroyed;
    constructor(accessoryInfo: AccessoryInfo, responderOptions?: MulticastOptions, serviceOptions?: ServiceNetworkOptions);
    initPort(port: number): void;
    startAdvertising(): void;
    updateAdvertisement(silent?: boolean): void;
    destroy(): void;
}
//# sourceMappingURL=Advertiser.d.ts.map