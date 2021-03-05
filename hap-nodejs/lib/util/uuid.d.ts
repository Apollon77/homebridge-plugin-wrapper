/// <reference types="node" />
declare type Binary = Buffer | NodeJS.TypedArray | DataView;
export declare type BinaryLike = string | Binary;
export declare const BASE_UUID = "-0000-1000-8000-0026BB765291";
export declare function generate(data: BinaryLike): string;
export declare function isValid(UUID: string): boolean;
/**
 * Returns the identity of the passed argument.
 *
 * @param buf - The string argument which is returned
 * @deprecated Most certainly the API you are using this function with changed from returning a Buffer to returning
 *  the actual uuid string. You can safely remove the call to unparse. Most certainly this call to unparse
 *  is located in you CameraSource which you converted from the old style CameraSource API to the new CameraControllers.
 */
export declare function unparse(buf: string): string;
/**
 * Parses the uuid as a string from the given Buffer.
 * The parser will use the first 8 bytes.
 *
 * @param buf - The buffer to read from.
 */
export declare function unparse(buf: Buffer): string;
/**
 * Parses the uuid as a string from the given Buffer at the specified offset.
 * @param buf - The buffer to read from.
 * @param offset - The offset in the buffer to start reading from.
 */
export declare function unparse(buf: Buffer, offset: number): string;
export declare function write(uuid: string): Buffer;
export declare function write(uuid: string, buf: Buffer, offset: number): void;
export declare function toShortForm(uuid: string, base?: string): string;
export declare function toLongForm(uuid: string, base?: string): string;
export {};
//# sourceMappingURL=uuid.d.ts.map