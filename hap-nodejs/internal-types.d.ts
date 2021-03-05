import { Formats, Perms, Units } from "./lib/Characteristic";
import { HAPStatus } from "./lib/HAPServer";
import { CharacteristicValue, Nullable } from "./types";
export interface CharacteristicJsonObject {
    type: string;
    iid: number;
    value?: Nullable<CharacteristicValue>;
    perms: Perms[];
    format: Formats | string;
    description?: string;
    unit?: Units | string;
    minValue?: number;
    maxValue?: number;
    minStep?: number;
    maxLen?: number;
    maxDataLen?: number;
    "valid-values"?: number[];
    "valid-values-range"?: [min: number, max: number];
}
export interface ServiceJsonObject {
    type: string;
    iid: number;
    characteristics: CharacteristicJsonObject[];
    hidden?: boolean;
    primary?: boolean;
    linked?: number[];
}
export interface AccessoryJsonObject {
    aid: number;
    services: ServiceJsonObject[];
}
export interface AccessoriesResponse {
    accessories: AccessoryJsonObject[];
}
export interface CharacteristicId {
    aid: number;
    iid: number;
}
export interface CharacteristicsReadRequest {
    ids: CharacteristicId[];
    includeMeta: boolean;
    includePerms: boolean;
    includeType: boolean;
    includeEvent: boolean;
}
export interface PartialCharacteristicReadDataValue {
    value: CharacteristicValue | null;
    status?: HAPStatus.SUCCESS;
    type?: string;
    format?: string;
    unit?: string;
    minValue?: number;
    maxValue?: number;
    minStep?: number;
    maxLen?: number;
    perms?: Perms[];
    ev?: boolean;
}
export interface PartialCharacteristicReadError {
    status: HAPStatus;
}
export interface CharacteristicReadDataValue extends PartialCharacteristicReadDataValue {
    aid: number;
    iid: number;
}
export interface CharacteristicReadError extends PartialCharacteristicReadError {
    aid: number;
    iid: number;
}
export declare type PartialCharacteristicReadData = PartialCharacteristicReadDataValue | PartialCharacteristicReadError;
export declare type CharacteristicReadData = CharacteristicReadDataValue | CharacteristicReadError;
export interface CharacteristicsReadResponse {
    characteristics: CharacteristicReadData[];
}
export interface CharacteristicWrite {
    aid: number;
    iid: number;
    value?: CharacteristicValue;
    ev?: boolean;
    authData?: string;
    /**
     * @deprecated This indicated if access was done via the old iCloud relay
     */
    remote?: boolean;
    r?: boolean;
}
export interface CharacteristicsWriteRequest {
    characteristics: CharacteristicWrite[];
    pid?: number;
}
export interface PartialCharacteristicWriteDataValue {
    value?: CharacteristicValue | null;
    ev?: boolean;
    status?: HAPStatus.SUCCESS;
}
export interface PartialCharacteristicWriteError {
    status: HAPStatus;
    value?: undefined;
}
export interface CharacteristicWriteDataValue extends PartialCharacteristicWriteDataValue {
    aid: number;
    iid: number;
}
export interface CharacteristicWriteError extends PartialCharacteristicWriteError {
    aid: number;
    iid: number;
}
export declare type PartialCharacteristicWriteData = PartialCharacteristicWriteDataValue | PartialCharacteristicWriteError;
export declare type CharacteristicWriteData = CharacteristicWriteDataValue | CharacteristicWriteError;
export interface CharacteristicsWriteResponse {
    characteristics: CharacteristicWriteData[];
}
export declare type PrepareWriteRequest = {
    ttl: number;
    pid: number;
};
export declare const enum ResourceRequestType {
    IMAGE = "image"
}
export interface ResourceRequest {
    aid?: number;
    "image-height": number;
    "image-width": number;
    "resource-type": ResourceRequestType;
}
export interface EventNotification {
    characteristics: CharacteristicEventNotification[];
}
export interface CharacteristicEventNotification {
    aid: number;
    iid: number;
    value: Nullable<CharacteristicValue>;
}
export declare function consideredTrue(input: string | null): boolean;
//# sourceMappingURL=internal-types.d.ts.map