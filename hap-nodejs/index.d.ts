import "source-map-support/register";
import "./lib/definitions";
import * as accessoryLoader from "./lib/AccessoryLoader";
import * as uuidFunctions from "./lib/util/uuid";
import * as legacyTypes from "./accessories/types";
export declare const AccessoryLoader: typeof accessoryLoader;
export declare const uuid: typeof uuidFunctions;
export * from "./lib/model/HAPStorage";
export * from "./lib/Accessory";
export * from "./lib/Bridge";
export * from "./lib/Service";
export * from "./lib/Characteristic";
export * from "./lib/AccessoryLoader";
export * from "./lib/camera";
export * from "./lib/tv/AccessControlManagement";
export * from "./lib/HAPServer";
export * from "./lib/datastream";
export * from "./lib/controller";
export * from "./lib/util/clone";
export * from "./lib/util/once";
export * from "./lib/util/tlv";
export * from "./lib/util/hapStatusError";
export * from "./lib/util/color-utils";
export * from "./lib/util/time";
export * from "./types";
export declare const LegacyTypes: typeof legacyTypes;
/**
 * This method can be used to retrieve the current running library version of the HAP-NodeJS framework.
 * @returns The SemVer version string.
 */
export declare function HAPLibraryVersion(): string;
/**
 *
 * @param {string} storagePath
 * @deprecated the need to manually initialize the internal storage was removed. If you want to set a custom
 *  storage path location, please use {@link HAPStorage.setCustomStoragePath} directly.
 */
export declare function init(storagePath?: string): void;
//# sourceMappingURL=index.d.ts.map