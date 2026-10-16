"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = encode;
exports.decode = decode;
exports.decodeWithLists = decodeWithLists;
exports.decodeList = decodeList;
exports.readUInt64LE = readUInt64LE;
exports.writeUInt32 = writeUInt32;
exports.readUInt32 = readUInt32;
exports.writeFloat32LE = writeFloat32LE;
exports.writeUInt16 = writeUInt16;
exports.readUInt16 = readUInt16;
exports.readVariableUIntLE = readVariableUIntLE;
exports.writeVariableUIntLE = writeVariableUIntLE;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const hapCrypto = tslib_1.__importStar(require("../util/hapCrypto"));
/**
 * Type Length Value encoding/decoding, used by HAP as a wire format.
 * https://en.wikipedia.org/wiki/Type-length-value
 */
const EMPTY_TLV_TYPE = 0x00; // and empty tlv with id 0 is usually used as delimiter for tlv lists
/**
 * @group TLV8
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function encode(type, data, ...args) {
    const encodedTLVBuffers = [];
    // coerce data to Buffer if needed
    if (typeof data === "number") {
        data = Buffer.from([data]);
    }
    else if (typeof data === "string") {
        data = Buffer.from(data);
    }
    if (Array.isArray(data)) {
        let first = true;
        for (const entry of data) {
            if (!first) {
                encodedTLVBuffers.push(Buffer.from([EMPTY_TLV_TYPE, 0])); // push delimiter
            }
            first = false;
            encodedTLVBuffers.push(encode(type, entry));
        }
        if (first) { // we have a zero length array!
            encodedTLVBuffers.push(Buffer.from([type, 0]));
        }
    }
    else if (data.length <= 255) {
        encodedTLVBuffers.push(Buffer.concat([Buffer.from([type, data.length]), data]));
    }
    else { // otherwise it doesn't fit into one tlv entry, thus we push multiple
        let leftBytes = data.length;
        let currentIndex = 0;
        for (; leftBytes > 0;) {
            if (leftBytes >= 255) {
                encodedTLVBuffers.push(Buffer.concat([Buffer.from([type, 0xFF]), data.subarray(currentIndex, currentIndex + 255)]));
                leftBytes -= 255;
                currentIndex += 255;
            }
            else {
                encodedTLVBuffers.push(Buffer.concat([Buffer.from([type, leftBytes]), data.subarray(currentIndex)]));
                leftBytes -= leftBytes;
            }
        }
    }
    // do we have more arguments to encode?
    if (args.length >= 2) {
        // chop off the first two arguments which we already processed, and process the rest recursively
        const [nextType, nextData, ...nextArgs] = args;
        const remainingTLVBuffer = encode(nextType, nextData, ...nextArgs);
        // append the remaining encoded arguments directly to the buffer
        encodedTLVBuffers.push(remainingTLVBuffer);
    }
    return Buffer.concat(encodedTLVBuffers);
}
/**
 * This method is the legacy way of decoding tlv data.
 * It will not properly decode multiple list of the same id.
 * Should the decoder encounter multiple instances of the same id, it will just concatenate the buffer data.
 *
 * @param buffer - TLV8 data
 *
 * Note: Please use {@link decodeWithLists} which properly decodes list elements.
 *
 * @group TLV8
 */
function decode(buffer) {
    (0, assert_1.default)(buffer instanceof Buffer, "Illegal argument. tlv.decode() expects Buffer type!");
    const objects = {};
    let leftLength = buffer.length;
    let currentIndex = 0;
    for (; leftLength > 0;) {
        if (leftLength < 2) {
            throw new Error("TLV decode failure: incomplete type/length header");
        }
        const type = buffer[currentIndex];
        const length = buffer[currentIndex + 1];
        currentIndex += 2;
        leftLength -= 2;
        if (length > leftLength) {
            throw new Error("TLV decode failure: declared length " + length + " exceeds remaining buffer " + leftLength);
        }
        const data = buffer.subarray(currentIndex, currentIndex + length);
        if (objects[type]) {
            objects[type] = Buffer.concat([objects[type], data]);
        }
        else {
            objects[type] = data;
        }
        currentIndex += length;
        leftLength -= length;
    }
    return objects;
}
/**
 * Decode a buffer coding TLV8 encoded entries.
 *
 * This method decodes multiple entries split by a TLV delimiter properly into Buffer arrays.
 * It properly reassembles tlv entries if they were split across multiple entries due to exceeding the max tlv entry size of 255 bytes.
 * @param buffer - The Buffer containing TLV8 encoded data.
 *
 * @group TLV8
 */
function decodeWithLists(buffer) {
    const result = {};
    let leftBytes = buffer.length;
    let readIndex = 0;
    let lastType = -1;
    let lastLength = -1;
    let lastItemWasDelimiter = false;
    for (; leftBytes > 0;) {
        const type = buffer.readUInt8(readIndex++);
        const length = buffer.readUInt8(readIndex++);
        leftBytes -= 2;
        const data = buffer.subarray(readIndex, readIndex + length);
        readIndex += length;
        leftBytes -= length;
        if (type === 0 && length === 0) {
            lastItemWasDelimiter = true;
            continue;
        }
        const existing = result[type];
        if (existing) { // there is already an item with the same type
            if (lastItemWasDelimiter && lastType === type) { // list of tlv types
                if (Array.isArray(existing)) {
                    existing.push(data);
                }
                else {
                    result[type] = [existing, data];
                }
            }
            else if (lastType === type && lastLength === 255) { // tlv data got split into multiple entries as length exceeded 255
                if (Array.isArray(existing)) {
                    // append to the last data blob in the array
                    const last = existing[existing.length - 1];
                    existing[existing.length - 1] = Buffer.concat([last, data]);
                }
                else {
                    result[type] = Buffer.concat([existing, data]);
                }
            }
            else {
                throw new Error(`Found duplicated tlv entry with type ${type} and length ${length} `
                    + `(lastItemWasDelimiter: ${lastItemWasDelimiter}, lastType: ${lastType}, lastLength: ${lastLength})`);
            }
        }
        else {
            result[type] = data;
        }
        lastType = type;
        lastLength = length;
        lastItemWasDelimiter = false;
    }
    return result;
}
/**
 * This method can be used to parse a TLV8 encoded list that was concatenated.
 *
 * If you are thinking about using this method, try to refactor the code to use {@link decodeWithLists} instead of {@link decode}.
 * The single reason of this method's existence are the shortcomings {@link decode}, as it concatenates multiple tlv8 list entries
 * into a single Buffer.
 * This method can be used to undo that, by specifying the concatenated buffer and the tlv id of the element that should
 * mark the beginning of a new tlv8 list entry.
 *
 * @param data - The concatenated tlv8 list entries (probably output of {@link decode}).
 * @param entryStartId - The tlv id that marks the beginning of a new tlv8 entry.
 *
 * @group TLV8
 */
function decodeList(data, entryStartId) {
    const objectsList = [];
    let leftLength = data.length;
    let currentIndex = 0;
    let objects = undefined;
    for (; leftLength > 0;) {
        const type = data[currentIndex]; // T
        const length = data[currentIndex + 1]; // L
        const value = data.subarray(currentIndex + 2, currentIndex + 2 + length); // V
        if (type === entryStartId) { // we got the start of a new entry
            if (objects !== undefined) { // save the previous entry
                objectsList.push(objects);
            }
            objects = {};
        }
        if (objects === undefined) {
            throw new Error("Error parsing tlv list: Encountered uninitialized storage object");
        }
        if (objects[type]) { // append to buffer if we have already data for this type
            objects[type] = Buffer.concat([objects[type], value]);
        }
        else {
            objects[type] = value;
        }
        currentIndex += 2 + length;
        leftLength -= 2 + length;
    }
    if (objects !== undefined) {
        objectsList.push(objects);
    } // push last entry
    return objectsList;
}
/**
 * @group TLV8
 */
function readUInt64LE(buffer, offset = 0) {
    const low = buffer.readUInt32LE(offset);
    // javascript doesn't allow to shift by 32(?), therefore we multiply here
    return buffer.readUInt32LE(offset + 4) * 0x100000000 + low;
}
/**
 * `writeUint32LE`
 * @group TLV8
 */
function writeUInt32(value) {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32LE(value, 0);
    return buffer;
}
/**
 * `readUInt32LE`
 * @group TLV8
 */
function readUInt32(buffer) {
    return buffer.readUInt32LE(0);
}
/**
 * @group TLV8
 */
function writeFloat32LE(value) {
    const buffer = Buffer.alloc(4);
    buffer.writeFloatLE(value, 0);
    return buffer;
}
/**
 * `writeUInt16LE`
 * @group TLV8
 */
function writeUInt16(value) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16LE(value, 0);
    return buffer;
}
/**
 * `readUInt16LE`
 * @group TLV8
 */
function readUInt16(buffer) {
    return buffer.readUInt16LE(0);
}
/**
 * Reads variable size unsigned integer {@link writeVariableUIntLE}.
 * @param buffer - The buffer to read from. It must have exactly the size of the given integer.
 * @group TLV8
 */
function readVariableUIntLE(buffer) {
    switch (buffer.length) {
        case 1:
            return buffer.readUInt8(0);
        case 2:
            return buffer.readUInt16LE(0);
        case 4:
            return buffer.readUInt32LE(0);
        case 8:
            return readUInt64LE(buffer, 0);
        default:
            throw new Error("Can't read uint LE with length " + buffer.length);
    }
}
/**
 * Writes variable size unsigned integer.
 * Either:
 * - `UInt8`
 * - `UInt16LE`
 * - `UInt32LE`
 * @param number
 * @group TLV8
 */
function writeVariableUIntLE(number) {
    (0, assert_1.default)(number >= 0, "Can't encode a negative integer as unsigned integer");
    if (number <= 255) {
        const buffer = Buffer.alloc(1);
        buffer.writeUInt8(number, 0);
        return buffer;
    }
    else if (number <= 65535) {
        return writeUInt16(number);
    }
    else if (number <= 4294967295) {
        return writeUInt32(number);
    }
    else {
        const buffer = Buffer.alloc(8);
        hapCrypto.writeUInt64LE(number, buffer, 0);
        return buffer;
    }
}
//# sourceMappingURL=tlv.js.map