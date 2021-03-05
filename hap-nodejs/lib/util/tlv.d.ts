/// <reference types="node" />
export declare type TLVEncodable = Buffer | number | string;
export declare function encode(type: number, data: TLVEncodable | TLVEncodable[], ...args: any[]): Buffer;
/**
 * This method is the legacy way of decoding tlv data.
 * It will not properly decode multiple list of the same id.
 * Should the decoder encounter multiple instances of the same id, it will just concatenate the buffer data.
 *
 * @param buffer - TLV8 data
 */
export declare function decode(buffer: Buffer): Record<number, Buffer>;
export declare function decodeWithLists(buffer: Buffer): Record<number, Buffer | Buffer[]>;
export declare function decodeList(data: Buffer, entryStartId: number): Record<number, Buffer>[];
export declare function writeUInt64(value: number): Buffer;
/**
 * @param buffer
 * @deprecated This is pretty much broken
 */
export declare function readUInt64(buffer: Buffer): number;
export declare function readUInt64BE(buffer: Buffer, offset?: number): number;
export declare function writeUInt32(value: number): Buffer;
export declare function readUInt32(buffer: Buffer): number;
export declare function writeFloat32LE(value: number): Buffer;
export declare function writeUInt16(value: number): Buffer;
export declare function readUInt16(buffer: Buffer): number;
export declare function readVariableUIntLE(buffer: Buffer, offset?: number): number;
export declare function writeVariableUIntLE(number: number, offset?: number): Buffer;
//# sourceMappingURL=tlv.d.ts.map