"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStreamWriter = exports.DataStreamReader = exports.DataStreamParser = exports.DataFormatTags = exports.UUID = exports.SecondsSince2001 = exports.Float64 = exports.Float32 = exports.Int64 = exports.Int32 = exports.Int16 = exports.Int8 = exports.ValueWrapper = void 0;
const tslib_1 = require("tslib");
const uuid = tslib_1.__importStar(require("../util/uuid"));
const hapCrypto = tslib_1.__importStar(require("../util/hapCrypto"));
const assert_1 = tslib_1.__importDefault(require("assert"));
const debug_1 = tslib_1.__importDefault(require("debug"));
// welcome to hell :)
// in this file lies madness and frustration. and It's not only about HDS. Also, JavaScript is hell
const debug = (0, debug_1.default)("HAP-NodeJS:DataStream:Parser");
class Magics {
    static TERMINATOR = { type: "terminator" };
}
/**
 * @group HomeKit Data Streams (HDS)
 */
class ValueWrapper {
    value;
    constructor(value) {
        this.value = value;
    }
    equals(obj) {
        return this.constructor.name === obj.constructor.name && obj.value === this.value;
    }
}
exports.ValueWrapper = ValueWrapper;
/**
 * @group HomeKit Data Streams (HDS)
 */
class Int8 extends ValueWrapper {
}
exports.Int8 = Int8;
/**
 * @group HomeKit Data Streams (HDS)
 */
class Int16 extends ValueWrapper {
}
exports.Int16 = Int16;
/**
 * @group HomeKit Data Streams (HDS)
 */
class Int32 extends ValueWrapper {
}
exports.Int32 = Int32;
/**
 * @group HomeKit Data Streams (HDS)
 */
class Int64 extends ValueWrapper {
}
exports.Int64 = Int64;
/**
 * @group HomeKit Data Streams (HDS)
 */
class Float32 extends ValueWrapper {
}
exports.Float32 = Float32;
/**
 * @group HomeKit Data Streams (HDS)
 */
class Float64 extends ValueWrapper {
}
exports.Float64 = Float64;
/**
 * @group HomeKit Data Streams (HDS)
 */
class SecondsSince2001 extends ValueWrapper {
}
exports.SecondsSince2001 = SecondsSince2001;
/**
 * @group HomeKit Data Streams (HDS)
 */
class UUID extends ValueWrapper {
    constructor(value) {
        (0, assert_1.default)(uuid.isValid(value), "invalid uuid format");
        super(value);
    }
}
exports.UUID = UUID;
/**
 * @group HomeKit Data Streams (HDS)
 */
var DataFormatTags;
(function (DataFormatTags) {
    DataFormatTags[DataFormatTags["INVALID"] = 0] = "INVALID";
    DataFormatTags[DataFormatTags["TRUE"] = 1] = "TRUE";
    DataFormatTags[DataFormatTags["FALSE"] = 2] = "FALSE";
    DataFormatTags[DataFormatTags["TERMINATOR"] = 3] = "TERMINATOR";
    DataFormatTags[DataFormatTags["NULL"] = 4] = "NULL";
    DataFormatTags[DataFormatTags["UUID"] = 5] = "UUID";
    DataFormatTags[DataFormatTags["DATE"] = 6] = "DATE";
    DataFormatTags[DataFormatTags["INTEGER_MINUS_ONE"] = 7] = "INTEGER_MINUS_ONE";
    DataFormatTags[DataFormatTags["INTEGER_RANGE_START_0"] = 8] = "INTEGER_RANGE_START_0";
    DataFormatTags[DataFormatTags["INTEGER_RANGE_STOP_39"] = 46] = "INTEGER_RANGE_STOP_39";
    DataFormatTags[DataFormatTags["INT8"] = 48] = "INT8";
    DataFormatTags[DataFormatTags["INT16LE"] = 49] = "INT16LE";
    DataFormatTags[DataFormatTags["INT32LE"] = 50] = "INT32LE";
    DataFormatTags[DataFormatTags["INT64LE"] = 51] = "INT64LE";
    DataFormatTags[DataFormatTags["FLOAT32LE"] = 53] = "FLOAT32LE";
    DataFormatTags[DataFormatTags["FLOAT64LE"] = 54] = "FLOAT64LE";
    DataFormatTags[DataFormatTags["UTF8_LENGTH_START"] = 64] = "UTF8_LENGTH_START";
    DataFormatTags[DataFormatTags["UTF8_LENGTH_STOP"] = 96] = "UTF8_LENGTH_STOP";
    DataFormatTags[DataFormatTags["UTF8_LENGTH8"] = 97] = "UTF8_LENGTH8";
    DataFormatTags[DataFormatTags["UTF8_LENGTH16LE"] = 98] = "UTF8_LENGTH16LE";
    DataFormatTags[DataFormatTags["UTF8_LENGTH32LE"] = 99] = "UTF8_LENGTH32LE";
    DataFormatTags[DataFormatTags["UTF8_LENGTH64LE"] = 100] = "UTF8_LENGTH64LE";
    DataFormatTags[DataFormatTags["UTF8_NULL_TERMINATED"] = 111] = "UTF8_NULL_TERMINATED";
    DataFormatTags[DataFormatTags["DATA_LENGTH_START"] = 112] = "DATA_LENGTH_START";
    DataFormatTags[DataFormatTags["DATA_LENGTH_STOP"] = 144] = "DATA_LENGTH_STOP";
    DataFormatTags[DataFormatTags["DATA_LENGTH8"] = 145] = "DATA_LENGTH8";
    DataFormatTags[DataFormatTags["DATA_LENGTH16LE"] = 146] = "DATA_LENGTH16LE";
    DataFormatTags[DataFormatTags["DATA_LENGTH32LE"] = 147] = "DATA_LENGTH32LE";
    DataFormatTags[DataFormatTags["DATA_LENGTH64LE"] = 148] = "DATA_LENGTH64LE";
    DataFormatTags[DataFormatTags["DATA_TERMINATED"] = 159] = "DATA_TERMINATED";
    DataFormatTags[DataFormatTags["COMPRESSION_START"] = 160] = "COMPRESSION_START";
    DataFormatTags[DataFormatTags["COMPRESSION_STOP"] = 207] = "COMPRESSION_STOP";
    DataFormatTags[DataFormatTags["ARRAY_LENGTH_START"] = 208] = "ARRAY_LENGTH_START";
    DataFormatTags[DataFormatTags["ARRAY_LENGTH_STOP"] = 222] = "ARRAY_LENGTH_STOP";
    DataFormatTags[DataFormatTags["ARRAY_TERMINATED"] = 223] = "ARRAY_TERMINATED";
    DataFormatTags[DataFormatTags["DICTIONARY_LENGTH_START"] = 224] = "DICTIONARY_LENGTH_START";
    DataFormatTags[DataFormatTags["DICTIONARY_LENGTH_STOP"] = 238] = "DICTIONARY_LENGTH_STOP";
    DataFormatTags[DataFormatTags["DICTIONARY_TERMINATED"] = 239] = "DICTIONARY_TERMINATED";
})(DataFormatTags || (exports.DataFormatTags = DataFormatTags = {}));
/**
 * @group HomeKit Data Streams (HDS)
 */
class DataStreamParser {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static decode(buffer) {
        const tag = buffer.readTag();
        if (tag === 0 /* DataFormatTags.INVALID */) {
            throw new Error("HDSDecoder: zero tag detected on index " + buffer.readerIndex);
        }
        else if (tag === 1 /* DataFormatTags.TRUE */) {
            return buffer.readTrue();
        }
        else if (tag === 2 /* DataFormatTags.FALSE */) {
            return buffer.readFalse();
        }
        else if (tag === 3 /* DataFormatTags.TERMINATOR */) {
            return Magics.TERMINATOR;
        }
        else if (tag === 4 /* DataFormatTags.NULL */) {
            return null;
        }
        else if (tag === 5 /* DataFormatTags.UUID */) {
            return buffer.readUUID();
        }
        else if (tag === 6 /* DataFormatTags.DATE */) {
            return buffer.readSecondsSince2001_01_01();
        }
        else if (tag === 7 /* DataFormatTags.INTEGER_MINUS_ONE */) {
            return buffer.readNegOne();
        }
        else if (tag >= 8 /* DataFormatTags.INTEGER_RANGE_START_0 */ && tag <= 46 /* DataFormatTags.INTEGER_RANGE_STOP_39 */) {
            return buffer.readIntRange(tag); // integer values from 0-39
        }
        else if (tag === 48 /* DataFormatTags.INT8 */) {
            return buffer.readInt8();
        }
        else if (tag === 49 /* DataFormatTags.INT16LE */) {
            return buffer.readInt16LE();
        }
        else if (tag === 50 /* DataFormatTags.INT32LE */) {
            return buffer.readInt32LE();
        }
        else if (tag === 51 /* DataFormatTags.INT64LE */) {
            return buffer.readInt64LE();
        }
        else if (tag === 53 /* DataFormatTags.FLOAT32LE */) {
            return buffer.readFloat32LE();
        }
        else if (tag === 54 /* DataFormatTags.FLOAT64LE */) {
            return buffer.readFloat64LE();
        }
        else if (tag >= 64 /* DataFormatTags.UTF8_LENGTH_START */ && tag <= 96 /* DataFormatTags.UTF8_LENGTH_STOP */) {
            const length = tag - 64 /* DataFormatTags.UTF8_LENGTH_START */;
            return buffer.readUTF8(length);
        }
        else if (tag === 97 /* DataFormatTags.UTF8_LENGTH8 */) {
            return buffer.readUTF8_Length8();
        }
        else if (tag === 98 /* DataFormatTags.UTF8_LENGTH16LE */) {
            return buffer.readUTF8_Length16LE();
        }
        else if (tag === 99 /* DataFormatTags.UTF8_LENGTH32LE */) {
            return buffer.readUTF8_Length32LE();
        }
        else if (tag === 100 /* DataFormatTags.UTF8_LENGTH64LE */) {
            return buffer.readUTF8_Length64LE();
        }
        else if (tag === 111 /* DataFormatTags.UTF8_NULL_TERMINATED */) {
            return buffer.readUTF8_NULL_terminated();
        }
        else if (tag >= 112 /* DataFormatTags.DATA_LENGTH_START */ && tag <= 144 /* DataFormatTags.DATA_LENGTH_STOP */) {
            const length = tag - 112 /* DataFormatTags.DATA_LENGTH_START */;
            buffer.readData(length);
        }
        else if (tag === 145 /* DataFormatTags.DATA_LENGTH8 */) {
            return buffer.readData_Length8();
        }
        else if (tag === 146 /* DataFormatTags.DATA_LENGTH16LE */) {
            return buffer.readData_Length16LE();
        }
        else if (tag === 147 /* DataFormatTags.DATA_LENGTH32LE */) {
            return buffer.readData_Length32LE();
        }
        else if (tag === 148 /* DataFormatTags.DATA_LENGTH64LE */) {
            return buffer.readData_Length64LE();
        }
        else if (tag === 159 /* DataFormatTags.DATA_TERMINATED */) {
            return buffer.readData_terminated();
        }
        else if (tag >= 160 /* DataFormatTags.COMPRESSION_START */ && tag <= 207 /* DataFormatTags.COMPRESSION_STOP */) {
            const index = tag - 160 /* DataFormatTags.COMPRESSION_START */;
            return buffer.decompressData(index);
        }
        else if (tag >= 208 /* DataFormatTags.ARRAY_LENGTH_START */ && tag <= 222 /* DataFormatTags.ARRAY_LENGTH_STOP */) {
            const length = tag - 208 /* DataFormatTags.ARRAY_LENGTH_START */;
            const array = [];
            for (let i = 0; i < length; i++) {
                array.push(this.decode(buffer));
            }
            return array;
        }
        else if (tag === 223 /* DataFormatTags.ARRAY_TERMINATED */) {
            const array = [];
            let element;
            while ((element = this.decode(buffer)) !== Magics.TERMINATOR) {
                array.push(element);
            }
            return array;
        }
        else if (tag >= 224 /* DataFormatTags.DICTIONARY_LENGTH_START */ && tag <= 238 /* DataFormatTags.DICTIONARY_LENGTH_STOP */) {
            const length = tag - 224 /* DataFormatTags.DICTIONARY_LENGTH_START */;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dictionary = {};
            for (let i = 0; i < length; i++) {
                const key = this.decode(buffer);
                dictionary[key] = this.decode(buffer);
            }
            return dictionary;
        }
        else if (tag === 239 /* DataFormatTags.DICTIONARY_TERMINATED */) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dictionary = {};
            let key;
            while ((key = this.decode(buffer)) !== Magics.TERMINATOR) {
                dictionary[key] = this.decode(buffer); // decode value
            }
            return dictionary;
        }
        else {
            throw new Error("HDSDecoder: encountered unknown tag on index " + buffer.readerIndex + ": " + tag.toString(16));
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
    static encode(data, buffer) {
        if (data === undefined) {
            throw new Error("HDSEncoder: cannot encode undefined");
        }
        if (data === null) {
            buffer.writeTag(4 /* DataFormatTags.NULL */);
            return;
        }
        switch (typeof data) {
            case "boolean":
                if (data) {
                    buffer.writeTrue();
                }
                else {
                    buffer.writeFalse();
                }
                break;
            case "number":
                if (Number.isInteger(data)) {
                    buffer.writeNumber(data);
                }
                else {
                    buffer.writeFloat64LE(new Float64(data));
                }
                break;
            case "string":
                buffer.writeUTF8(data);
                break;
            case "object":
                if (Array.isArray(data)) {
                    const length = data.length;
                    if (length <= 12) {
                        buffer.writeTag(208 /* DataFormatTags.ARRAY_LENGTH_START */ + length);
                    }
                    else {
                        buffer.writeTag(223 /* DataFormatTags.ARRAY_TERMINATED */);
                    }
                    data.forEach(element => {
                        this.encode(element, buffer);
                    });
                    if (length > 12) {
                        buffer.writeTag(3 /* DataFormatTags.TERMINATOR */);
                    }
                }
                else if (data instanceof ValueWrapper) {
                    if (data instanceof Int8) {
                        buffer.writeInt8(data);
                    }
                    else if (data instanceof Int16) {
                        buffer.writeInt16LE(data);
                    }
                    else if (data instanceof Int32) {
                        buffer.writeInt32LE(data);
                    }
                    else if (data instanceof Int64) {
                        buffer.writeInt64LE(data);
                    }
                    else if (data instanceof Float32) {
                        buffer.writeFloat32LE(data);
                    }
                    else if (data instanceof Float64) {
                        buffer.writeFloat64LE(data);
                    }
                    else if (data instanceof SecondsSince2001) {
                        buffer.writeSecondsSince2001_01_01(data);
                    }
                    else if (data instanceof UUID) {
                        buffer.writeUUID(data.value);
                    }
                    else {
                        throw new Error("Unknown wrapped object 'ValueWrapper' of class " + data.constructor.name);
                    }
                }
                else if (data instanceof Buffer) {
                    buffer.writeData(data);
                }
                else { // object is treated as dictionary
                    const entries = Object.entries(data)
                        .filter(entry => entry[1] !== undefined); // explicitly setting undefined will result in an entry here
                    if (entries.length <= 14) {
                        buffer.writeTag(224 /* DataFormatTags.DICTIONARY_LENGTH_START */ + entries.length);
                    }
                    else {
                        buffer.writeTag(239 /* DataFormatTags.DICTIONARY_TERMINATED */);
                    }
                    entries.forEach(entry => {
                        this.encode(entry[0], buffer); // encode key
                        this.encode(entry[1], buffer); // encode value
                    });
                    if (entries.length > 14) {
                        buffer.writeTag(3 /* DataFormatTags.TERMINATOR */);
                    }
                }
                break;
            default:
                throw new Error("HDSEncoder: no idea how to encode value of type '" + (typeof data) + "': " + data);
        }
    }
}
exports.DataStreamParser = DataStreamParser;
/**
 * @group HomeKit Data Streams (HDS)
 */
class DataStreamReader {
    data;
    readerIndex;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trackedCompressedData = [];
    constructor(data) {
        this.data = data;
        this.readerIndex = 0;
    }
    finished() {
        if (this.readerIndex < this.data.length) {
            const remainingHex = this.data.subarray(this.readerIndex, this.data.length).toString("hex");
            debug("WARNING Finished reading HDS stream, but there are still %d bytes remaining () %s", this.data.length - this.readerIndex, remainingHex);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    decompressData(index) {
        if (index >= this.trackedCompressedData.length) {
            throw new Error("HDSDecoder: Tried decompression of data for an index out of range (index " + index +
                " and got " + this.trackedCompressedData.length + " elements)");
        }
        return this.trackedCompressedData[index];
    }
    trackData(data) {
        this.trackedCompressedData.push(data);
        return data;
    }
    ensureLength(bytes) {
        if (this.readerIndex + bytes > this.data.length) {
            const remaining = this.data.length - this.readerIndex;
            throw new Error("HDSDecoder: End of data stream. Tried reading " + bytes + " bytes however got only " + remaining + " remaining!");
        }
    }
    readTag() {
        this.ensureLength(1);
        return this.data.readUInt8(this.readerIndex++);
    }
    readTrue() {
        return this.trackData(true); // do those tag encoded values get cached?
    }
    readFalse() {
        return this.trackData(false);
    }
    readNegOne() {
        return this.trackData(-1);
    }
    readIntRange(tag) {
        return this.trackData(tag - 8 /* DataFormatTags.INTEGER_RANGE_START_0 */); // integer values from 0-39
    }
    readInt8() {
        this.ensureLength(1);
        return this.trackData(this.data.readInt8(this.readerIndex++));
    }
    readInt16LE() {
        this.ensureLength(2);
        const value = this.data.readInt16LE(this.readerIndex);
        this.readerIndex += 2;
        return this.trackData(value);
    }
    readInt32LE() {
        this.ensureLength(4);
        const value = this.data.readInt32LE(this.readerIndex);
        this.readerIndex += 4;
        return this.trackData(value);
    }
    readInt64LE() {
        this.ensureLength(8);
        const low = this.data.readInt32LE(this.readerIndex);
        let value = this.data.readInt32LE(this.readerIndex + 4) * 0x100000000 + low;
        if (low < 0) {
            value += 0x100000000;
        }
        this.readerIndex += 8;
        return this.trackData(value);
    }
    readFloat32LE() {
        this.ensureLength(4);
        const value = this.data.readFloatLE(this.readerIndex);
        this.readerIndex += 4;
        return this.trackData(value);
    }
    readFloat64LE() {
        this.ensureLength(8);
        const value = this.data.readDoubleLE(this.readerIndex);
        this.readerIndex += 8;
        return this.trackData(value);
    }
    readLength8() {
        this.ensureLength(1);
        return this.data.readUInt8(this.readerIndex++);
    }
    readLength16LE() {
        this.ensureLength(2);
        const value = this.data.readUInt16LE(this.readerIndex);
        this.readerIndex += 2;
        return value;
    }
    readLength32LE() {
        this.ensureLength(4);
        const value = this.data.readUInt32LE(this.readerIndex);
        this.readerIndex += 4;
        return value;
    }
    readLength64LE() {
        this.ensureLength(8);
        const low = this.data.readUInt32LE(this.readerIndex);
        const value = this.data.readUInt32LE(this.readerIndex + 4) * 0x100000000 + low;
        this.readerIndex += 8;
        return value;
    }
    readUTF8(length) {
        this.ensureLength(length);
        const value = this.data.toString("utf8", this.readerIndex, this.readerIndex + length);
        this.readerIndex += length;
        return this.trackData(value);
    }
    readUTF8_Length8() {
        const length = this.readLength8();
        return this.readUTF8(length);
    }
    readUTF8_Length16LE() {
        const length = this.readLength16LE();
        return this.readUTF8(length);
    }
    readUTF8_Length32LE() {
        const length = this.readLength32LE();
        return this.readUTF8(length);
    }
    readUTF8_Length64LE() {
        const length = this.readLength64LE();
        return this.readUTF8(length);
    }
    readUTF8_NULL_terminated() {
        let offset = this.readerIndex;
        let nextByte;
        for (;;) {
            nextByte = this.data[offset];
            if (nextByte === undefined) {
                throw new Error("HDSDecoder: Reached end of data stream while reading NUL terminated string!");
            }
            else if (nextByte === 0) {
                break;
            }
            else {
                offset++;
            }
        }
        const value = this.data.toString("utf8", this.readerIndex, offset);
        this.readerIndex = offset + 1;
        return this.trackData(value);
    }
    readData(length) {
        this.ensureLength(length);
        const value = this.data.subarray(this.readerIndex, this.readerIndex + length);
        this.readerIndex += length;
        return this.trackData(value);
    }
    readData_Length8() {
        const length = this.readLength8();
        return this.readData(length);
    }
    readData_Length16LE() {
        const length = this.readLength16LE();
        return this.readData(length);
    }
    readData_Length32LE() {
        const length = this.readLength32LE();
        return this.readData(length);
    }
    readData_Length64LE() {
        const length = this.readLength64LE();
        return this.readData(length);
    }
    readData_terminated() {
        let offset = this.readerIndex;
        let nextByte;
        for (;;) {
            nextByte = this.data[offset];
            if (nextByte === undefined) {
                throw new Error("HDSDecoder: Reached end of data stream while reading terminated data!");
            }
            else if (nextByte === 3 /* DataFormatTags.TERMINATOR */) {
                break;
            }
            else {
                offset++;
            }
        }
        const value = this.data.subarray(this.readerIndex, offset);
        this.readerIndex = offset + 1;
        return this.trackData(value);
    }
    readSecondsSince2001_01_01() {
        // second since 2001-01-01 00:00:00
        return this.readFloat64LE();
    }
    readUUID() {
        this.ensureLength(16);
        const value = uuid.unparse(this.data, this.readerIndex);
        this.readerIndex += 16;
        return this.trackData(value);
    }
}
exports.DataStreamReader = DataStreamReader;
class WrittenDataList {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    writtenData = [];
    push(data) {
        this.writtenData.push(data);
    }
    indexOf(data) {
        for (let i = 0; i < this.writtenData.length; i++) {
            const data0 = this.writtenData[i];
            if (data === data0) {
                return i;
            }
            if (data instanceof ValueWrapper && data0 instanceof ValueWrapper) {
                if (data.equals(data0)) {
                    return i;
                }
            }
        }
        return -1;
    }
}
/**
 * @group HomeKit Data Streams (HDS)
 */
class DataStreamWriter {
    static chunkSize = 128; // seems to be a good default
    data;
    writerIndex;
    writtenData = new WrittenDataList();
    constructor() {
        this.data = Buffer.alloc(DataStreamWriter.chunkSize);
        this.writerIndex = 0;
    }
    length() {
        return this.writerIndex; // since writerIndex points to the next FREE index it also represents the length
    }
    getData() {
        return this.data.subarray(0, this.writerIndex);
    }
    ensureLength(bytes) {
        const neededBytes = (this.writerIndex + bytes) - this.data.length;
        if (neededBytes > 0) {
            const chunks = Math.ceil(neededBytes / DataStreamWriter.chunkSize);
            // don't know if it's best for performance to immediately concatenate the buffers. That way it's
            // the easiest way to handle writing though.
            this.data = Buffer.concat([this.data, Buffer.alloc(chunks * DataStreamWriter.chunkSize)]);
        }
    }
    compressDataIfPossible(data) {
        const index = this.writtenData.indexOf(data);
        if (index < 0) {
            // data is not present yet
            this.writtenData.push(data);
            return false;
        }
        else if (index <= 207 /* DataFormatTags.COMPRESSION_STOP */ - 160 /* DataFormatTags.COMPRESSION_START */) {
            // data was already written and the index is in the applicable range => shorten the payload
            this.writeTag(160 /* DataFormatTags.COMPRESSION_START */ + index);
            return true;
        }
        return false;
    }
    writeTag(tag) {
        this.ensureLength(1);
        this.data.writeUInt8(tag, this.writerIndex++);
    }
    writeTrue() {
        this.writeTag(1 /* DataFormatTags.TRUE */);
    }
    writeFalse() {
        this.writeTag(2 /* DataFormatTags.FALSE */);
    }
    writeNumber(number) {
        if (number === -1) {
            this.writeTag(7 /* DataFormatTags.INTEGER_MINUS_ONE */);
        }
        else if (number >= 0 && number <= 39) {
            this.writeTag(8 /* DataFormatTags.INTEGER_RANGE_START_0 */ + number);
        }
        else if (number >= -128 && number <= 127) {
            this.writeInt8(new Int8(number));
        }
        else if (number >= -32768 && number <= 32767) {
            this.writeInt16LE(new Int16(number));
        }
        else if (number >= -2147483648 && number <= 2147483647) {
            this.writeInt32LE(new Int32(number));
        }
        else if (number >= Number.MIN_SAFE_INTEGER && number <= Number.MAX_SAFE_INTEGER) { // use correct uin64 restriction when we convert to bigint
            this.writeInt64LE(new Int64(number));
        }
        else {
            throw new Error("Tried writing unrepresentable number (" + number + ")");
        }
    }
    writeInt8(int8) {
        if (this.compressDataIfPossible(int8)) {
            return;
        }
        this.ensureLength(2);
        this.writeTag(48 /* DataFormatTags.INT8 */);
        this.data.writeInt8(int8.value, this.writerIndex++);
    }
    writeInt16LE(int16) {
        if (this.compressDataIfPossible(int16)) {
            return;
        }
        this.ensureLength(3);
        this.writeTag(49 /* DataFormatTags.INT16LE */);
        this.data.writeInt16LE(int16.value, this.writerIndex);
        this.writerIndex += 2;
    }
    writeInt32LE(int32) {
        if (this.compressDataIfPossible(int32)) {
            return;
        }
        this.ensureLength(5);
        this.writeTag(50 /* DataFormatTags.INT32LE */);
        this.data.writeInt32LE(int32.value, this.writerIndex);
        this.writerIndex += 4;
    }
    writeInt64LE(int64) {
        if (this.compressDataIfPossible(int64)) {
            return;
        }
        this.ensureLength(9);
        this.writeTag(51 /* DataFormatTags.INT64LE */);
        this.data.writeUInt32LE(int64.value, this.writerIndex); // TODO correctly implement int64; currently it's basically an int32
        this.data.writeUInt32LE(0, this.writerIndex + 4);
        this.writerIndex += 8;
    }
    writeFloat32LE(float32) {
        if (this.compressDataIfPossible(float32)) {
            return;
        }
        this.ensureLength(5);
        this.writeTag(53 /* DataFormatTags.FLOAT32LE */);
        this.data.writeFloatLE(float32.value, this.writerIndex);
        this.writerIndex += 4;
    }
    writeFloat64LE(float64) {
        if (this.compressDataIfPossible(float64)) {
            return;
        }
        this.ensureLength(9);
        this.writeTag(54 /* DataFormatTags.FLOAT64LE */);
        this.data.writeDoubleLE(float64.value, this.writerIndex);
        this.writerIndex += 8;
    }
    writeLength8(length) {
        this.ensureLength(1);
        this.data.writeUInt8(length, this.writerIndex++);
    }
    writeLength16LE(length) {
        this.ensureLength(2);
        this.data.writeUInt16LE(length, this.writerIndex);
        this.writerIndex += 2;
    }
    writeLength32LE(length) {
        this.ensureLength(4);
        this.data.writeUInt32LE(length, this.writerIndex);
        this.writerIndex += 4;
    }
    writeLength64LE(length) {
        this.ensureLength(8);
        hapCrypto.writeUInt64LE(length, this.data, this.writerIndex);
        this.writerIndex += 8;
    }
    writeUTF8(utf8) {
        if (this.compressDataIfPossible(utf8)) {
            return;
        }
        const length = Buffer.byteLength(utf8);
        if (length <= 32) {
            this.ensureLength(1 + length);
            this.writeTag(64 /* DataFormatTags.UTF8_LENGTH_START */ + length);
            this._writeUTF8(utf8);
        }
        else if (length <= 255) {
            this.writeUTF8_Length8(utf8);
        }
        else if (length <= 65535) {
            this.writeUTF8_Length16LE(utf8);
        }
        else if (length <= 4294967295) {
            this.writeUTF8_Length32LE(utf8);
        }
        else if (length <= Number.MAX_SAFE_INTEGER) { // use correct uin64 restriction when we convert to bigint
            this.writeUTF8_Length64LE(utf8);
        }
        else {
            this.writeUTF8_NULL_terminated(utf8);
        }
    }
    _writeUTF8(utf8) {
        const byteLength = Buffer.byteLength(utf8);
        this.ensureLength(byteLength);
        this.data.write(utf8, this.writerIndex, byteLength, "utf8");
        this.writerIndex += byteLength;
    }
    writeUTF8_Length8(utf8) {
        const length = Buffer.byteLength(utf8);
        this.ensureLength(2 + length);
        this.writeTag(97 /* DataFormatTags.UTF8_LENGTH8 */);
        this.writeLength8(length);
        this._writeUTF8(utf8);
    }
    writeUTF8_Length16LE(utf8) {
        const length = Buffer.byteLength(utf8);
        this.ensureLength(3 + length);
        this.writeTag(98 /* DataFormatTags.UTF8_LENGTH16LE */);
        this.writeLength16LE(length);
        this._writeUTF8(utf8);
    }
    writeUTF8_Length32LE(utf8) {
        const length = Buffer.byteLength(utf8);
        this.ensureLength(5 + length);
        this.writeTag(99 /* DataFormatTags.UTF8_LENGTH32LE */);
        this.writeLength32LE(length);
        this._writeUTF8(utf8);
    }
    writeUTF8_Length64LE(utf8) {
        const length = Buffer.byteLength(utf8);
        this.ensureLength(9 + length);
        this.writeTag(100 /* DataFormatTags.UTF8_LENGTH64LE */);
        this.writeLength64LE(length);
        this._writeUTF8(utf8);
    }
    writeUTF8_NULL_terminated(utf8) {
        this.ensureLength(1 + Buffer.byteLength(utf8) + 1);
        this.writeTag(111 /* DataFormatTags.UTF8_NULL_TERMINATED */);
        this._writeUTF8(utf8);
        this.data.writeUInt8(0, this.writerIndex++);
    }
    writeData(data) {
        if (this.compressDataIfPossible(data)) {
            return;
        }
        if (data.length <= 32) {
            this.writeTag(112 /* DataFormatTags.DATA_LENGTH_START */ + data.length);
            this._writeData(data);
        }
        else if (data.length <= 255) {
            this.writeData_Length8(data);
        }
        else if (data.length <= 65535) {
            this.writeData_Length16LE(data);
        }
        else if (data.length <= 4294967295) {
            this.writeData_Length32LE(data);
        }
        else if (data.length <= Number.MAX_SAFE_INTEGER) {
            this.writeData_Length64LE(data);
        }
        else {
            this.writeData_terminated(data);
        }
    }
    _writeData(data) {
        this.ensureLength(data.length);
        for (let i = 0; i < data.length; i++) {
            this.data[this.writerIndex++] = data[i];
        }
    }
    writeData_Length8(data) {
        this.ensureLength(2 + data.length);
        this.writeTag(145 /* DataFormatTags.DATA_LENGTH8 */);
        this.writeLength8(data.length);
        this._writeData(data);
    }
    writeData_Length16LE(data) {
        this.ensureLength(3 + data.length);
        this.writeTag(146 /* DataFormatTags.DATA_LENGTH16LE */);
        this.writeLength16LE(data.length);
        this._writeData(data);
    }
    writeData_Length32LE(data) {
        this.ensureLength(5 + data.length);
        this.writeTag(147 /* DataFormatTags.DATA_LENGTH32LE */);
        this.writeLength32LE(data.length);
        this._writeData(data);
    }
    writeData_Length64LE(data) {
        this.ensureLength(9 + data.length);
        this.writeTag(148 /* DataFormatTags.DATA_LENGTH64LE */);
        this.writeLength64LE(data.length);
        this._writeData(data);
    }
    writeData_terminated(data) {
        this.ensureLength(1 + data.length + 1);
        this.writeTag(159 /* DataFormatTags.DATA_TERMINATED */);
        this._writeData(data);
        this.writeTag(3 /* DataFormatTags.TERMINATOR */);
    }
    writeSecondsSince2001_01_01(seconds) {
        if (this.compressDataIfPossible(seconds)) {
            return;
        }
        this.ensureLength(9);
        this.writeTag(6 /* DataFormatTags.DATE */);
        this.data.writeDoubleLE(seconds.value, this.writerIndex);
        this.writerIndex += 8;
    }
    writeUUID(uuid_string) {
        (0, assert_1.default)(uuid.isValid(uuid_string), "supplied uuid is invalid");
        if (this.compressDataIfPossible(new UUID(uuid_string))) {
            return;
        }
        this.ensureLength(17);
        this.writeTag(5 /* DataFormatTags.UUID */);
        uuid.write(uuid_string, this.data, this.writerIndex);
        this.writerIndex += 16;
    }
}
exports.DataStreamWriter = DataStreamWriter;
//# sourceMappingURL=DataStreamParser.js.map