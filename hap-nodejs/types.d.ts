export declare type Nullable<T> = T | null;
export declare type WithUUID<T> = T & {
    UUID: string;
};
/**
 * UUID string uniquely identifying every HAP connection.
 */
export declare type SessionIdentifier = string;
/**
 * Defines a mac address.
 * Must have a format like 'XX:XX:XX:XX:XX:XX' with XX being a valid hexadecimal string
 */
export declare type MacAddress = string;
/**
 * Defines a pincode for the HAP accessory.
 * Must have a format like "XXX-XX-XXX".
 */
export declare type HAPPincode = string;
export declare type InterfaceName = string;
export declare type IPv4Address = string;
export declare type IPv6Address = string;
export declare type IPAddress = IPv4Address | IPv6Address;
export declare type Callback = (...args: any[]) => void;
export declare type NodeCallback<T> = (err: Nullable<Error> | undefined, data?: T) => void;
export declare type VoidCallback = (err?: Nullable<Error>) => void;
export declare type PrimitiveTypes = string | number | boolean;
export declare type CharacteristicValue = PrimitiveTypes | PrimitiveTypes[] | {
    [key: string]: PrimitiveTypes;
};
/**
 * @deprecated replaced by {@link AudioStreamingCodec}
 */
export declare type AudioCodec = {
    samplerate: number;
    type: string;
};
/**
 * @deprecated replaced by {@link H264CodecParameters}
 */
export declare type VideoCodec = {
    levels: number[];
    profiles: number[];
};
/**
 * @deprecated replaced by {@link AudioStreamingOptions}
 */
export declare type StreamAudioParams = {
    comfort_noise: boolean;
    codecs: AudioCodec[];
};
/**
 * @deprecated replaced by {@link VideoStreamingOptions}
 */
export declare type StreamVideoParams = {
    codec?: VideoCodec;
    resolutions: [number, number, number][];
};
//# sourceMappingURL=types.d.ts.map