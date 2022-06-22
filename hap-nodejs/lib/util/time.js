"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.epochMillisFromMillisSince2001_01_01Buffer = exports.epochMillisFromMillisSince2001_01_01 = void 0;
var tslib_1 = require("tslib");
var assert_1 = (0, tslib_1.__importDefault)(require("assert"));
var tlv_1 = require("./tlv");
var EPOCH_MILLIS_2001_01_01 = Date.UTC(2001, 0, 1, 0, 0, 0, 0);
function epochMillisFromMillisSince2001_01_01(millis) {
    return EPOCH_MILLIS_2001_01_01 + millis;
}
exports.epochMillisFromMillisSince2001_01_01 = epochMillisFromMillisSince2001_01_01;
function epochMillisFromMillisSince2001_01_01Buffer(millis) {
    (0, assert_1.default)(millis.length === 8, "can only parse 64 bit buffers!");
    var millisSince2001 = (0, tlv_1.readUInt64BE)(millis);
    return epochMillisFromMillisSince2001_01_01(millisSince2001);
}
exports.epochMillisFromMillisSince2001_01_01Buffer = epochMillisFromMillisSince2001_01_01Buffer;
//# sourceMappingURL=time.js.map