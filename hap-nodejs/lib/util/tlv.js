"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeVariableUIntLE = exports.readVariableUIntLE = exports.readUInt16 = exports.writeUInt16 = exports.writeFloat32LE = exports.readUInt32 = exports.writeUInt32 = exports.readUInt64BE = exports.readUInt64 = exports.writeUInt64 = exports.decodeList = exports.decodeWithLists = exports.decode = exports.encode = void 0;
var tslib_1 = require("tslib");
var assert_1 = (0, tslib_1.__importDefault)(require("assert"));
var hapCrypto = (0, tslib_1.__importStar)(require("../util/hapCrypto"));
/**
 * Type Length Value encoding/decoding, used by HAP as a wire format.
 * https://en.wikipedia.org/wiki/Type-length-value
 */
var EMPTY_TLV_TYPE = 0x00; // and empty tlv with id 0 is usually used as delimiter for tlv lists
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function encode(type, data) {
    var e_1, _a;
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var encodedTLVBuffers = [];
    // coerce data to Buffer if needed
    if (typeof data === "number") {
        data = Buffer.from([data]);
    }
    else if (typeof data === "string") {
        data = Buffer.from(data);
    }
    if (Array.isArray(data)) {
        var first = true;
        try {
            for (var data_1 = (0, tslib_1.__values)(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var entry = data_1_1.value;
                if (!first) {
                    encodedTLVBuffers.push(Buffer.from([EMPTY_TLV_TYPE, 0])); // push delimiter
                }
                else {
                    first = false;
                }
                encodedTLVBuffers.push(encode(type, entry));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    else if (data.length <= 255) {
        encodedTLVBuffers.push(Buffer.concat([Buffer.from([type, data.length]), data]));
    }
    else { // otherwise it doesn't fit into one tlv entry, thus we push multiple
        var leftBytes = data.length;
        var currentIndex = 0;
        for (; leftBytes > 0;) {
            if (leftBytes >= 255) {
                encodedTLVBuffers.push(Buffer.concat([Buffer.from([type, 0xFF]), data.slice(currentIndex, currentIndex + 255)]));
                leftBytes -= 255;
                currentIndex += 255;
            }
            else {
                encodedTLVBuffers.push(Buffer.concat([Buffer.from([type, leftBytes]), data.slice(currentIndex)]));
                leftBytes -= leftBytes;
            }
        }
    }
    // do we have more arguments to encode?
    if (args.length >= 2) {
        // chop off the first two arguments which we already processed, and process the rest recursively
        var _b = (0, tslib_1.__read)(args), nextType = _b[0], nextData = _b[1], nextArgs = _b.slice(2);
        var remainingTLVBuffer = encode.apply(void 0, (0, tslib_1.__spreadArray)([nextType, nextData], (0, tslib_1.__read)(nextArgs), false));
        // append the remaining encoded arguments directly to the buffer
        encodedTLVBuffers.push(remainingTLVBuffer);
    }
    return Buffer.concat(encodedTLVBuffers);
}
exports.encode = encode;
/**
 * This method is the legacy way of decoding tlv data.
 * It will not properly decode multiple list of the same id.
 * Should the decoder encounter multiple instances of the same id, it will just concatenate the buffer data.
 *
 * @param buffer - TLV8 data
 */
function decode(buffer) {
    var objects = {};
    var leftLength = buffer.length;
    var currentIndex = 0;
    for (; leftLength > 0;) {
        var type = buffer[currentIndex];
        var length = buffer[currentIndex + 1];
        currentIndex += 2;
        leftLength -= 2;
        var data = buffer.slice(currentIndex, currentIndex + length);
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
exports.decode = decode;
function decodeWithLists(buffer) {
    var result = {};
    var leftBytes = buffer.length;
    var readIndex = 0;
    var lastType = -1;
    var lastLength = -1;
    var lastItemWasDelimiter = false;
    for (; leftBytes > 0;) {
        var type = buffer.readUInt8(readIndex++);
        var length = buffer.readUInt8(readIndex++);
        leftBytes -= 2;
        var data = buffer.slice(readIndex, readIndex + length);
        readIndex += length;
        leftBytes -= length;
        if (type === 0 && length === 0) {
            lastItemWasDelimiter = true;
            continue;
        }
        var existing = result[type];
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
                    var last = existing[existing.length - 1];
                    existing[existing.length - 1] = Buffer.concat([last, data]);
                }
                else {
                    result[type] = Buffer.concat([existing, data]);
                }
            }
            else {
                throw new Error("Found duplicated tlv entry with type ".concat(type, " and length ").concat(length, "         (lastItemWasDelimiter: ").concat(lastItemWasDelimiter, ", lastType: ").concat(lastType, ", lastLength: ").concat(lastLength, ")"));
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
exports.decodeWithLists = decodeWithLists;
function decodeList(data, entryStartId) {
    var objectsList = [];
    var leftLength = data.length;
    var currentIndex = 0;
    var objects = undefined;
    for (; leftLength > 0;) {
        var type = data[currentIndex]; // T
        var length = data[currentIndex + 1]; // L
        var value = data.slice(currentIndex + 2, currentIndex + 2 + length); // V
        if (type === entryStartId) { // we got the start of a new entry
            if (objects !== undefined) { // save the previous entry
                objectsList.push(objects);
            }
            objects = {};
        }
        if (objects === undefined) {
            throw new Error("Error parsing tlv list: Encountered uninitialized storage object");
        }
        if (objects[type]) { // append to buffer if we have an already data for this type
            objects[type] = Buffer.concat([value, objects[type]]);
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
exports.decodeList = decodeList;
function writeUInt64(value) {
    var float64 = new Float64Array(1);
    float64[0] = value;
    var buffer = Buffer.alloc(float64.buffer.byteLength);
    var view = new Uint8Array(float64.buffer);
    for (var i = 0; i < buffer.length; i++) {
        buffer[i] = view[i];
    }
    return buffer;
}
exports.writeUInt64 = writeUInt64;
// noinspection JSUnusedGlobalSymbols
/**
 * @param buffer
 * @deprecated This is pretty much broken
 */
function readUInt64(buffer) {
    var float64 = new Float64Array(buffer);
    return float64[0];
}
exports.readUInt64 = readUInt64;
function readUInt64BE(buffer, offset) {
    if (offset === void 0) { offset = 0; }
    var low = buffer.readUInt32LE(offset);
    return buffer.readUInt32LE(offset + 4) * 0x100000000 + low;
}
exports.readUInt64BE = readUInt64BE;
function writeUInt32(value) {
    var buffer = Buffer.alloc(4);
    buffer.writeUInt32LE(value, 0);
    return buffer;
}
exports.writeUInt32 = writeUInt32;
function readUInt32(buffer) {
    return buffer.readUInt32LE(0);
}
exports.readUInt32 = readUInt32;
function writeFloat32LE(value) {
    var buffer = Buffer.alloc(4);
    buffer.writeFloatLE(value, 0);
    return buffer;
}
exports.writeFloat32LE = writeFloat32LE;
function writeUInt16(value) {
    var buffer = Buffer.alloc(2);
    buffer.writeUInt16LE(value, 0);
    return buffer;
}
exports.writeUInt16 = writeUInt16;
function readUInt16(buffer) {
    return buffer.readUInt16LE(0);
}
exports.readUInt16 = readUInt16;
function readVariableUIntLE(buffer, offset) {
    if (offset === void 0) { offset = 0; }
    switch (buffer.length) {
        case 1:
            return buffer.readUInt8(offset);
        case 2:
            return buffer.readUInt16LE(offset);
        case 4:
            return buffer.readUInt32LE(offset);
        case 8:
            return readUInt64BE(buffer, offset);
        default:
            throw new Error("Can't read uint LE with length " + buffer.length);
    }
}
exports.readVariableUIntLE = readVariableUIntLE;
function writeVariableUIntLE(number, offset) {
    if (offset === void 0) { offset = 0; }
    (0, assert_1.default)(number >= 0, "Can't encode a negative integer as unsigned integer");
    if (number <= 255) {
        var buffer = Buffer.alloc(1);
        buffer.writeUInt8(number, offset);
        return buffer;
    }
    else if (number <= 65535) {
        var buffer = Buffer.alloc(2);
        buffer.writeUInt16LE(number, offset);
        return buffer;
    }
    else if (number <= 4294967295) {
        var buffer = Buffer.alloc(4);
        buffer.writeUInt32LE(number, offset);
        return buffer;
    }
    else {
        var buffer = Buffer.alloc(8);
        hapCrypto.writeUInt64LE(number, buffer, offset);
        return buffer;
    }
}
exports.writeVariableUIntLE = writeVariableUIntLE;
//# sourceMappingURL=tlv.js.map