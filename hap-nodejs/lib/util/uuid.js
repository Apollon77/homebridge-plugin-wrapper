"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_UUID = void 0;
exports.generate = generate;
exports.isValid = isValid;
exports.unparse = unparse;
exports.write = write;
exports.toShortForm = toShortForm;
exports.toLongForm = toLongForm;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
exports.BASE_UUID = "-0000-1000-8000-0026BB765291";
// http://stackoverflow.com/a/25951500/66673
function generate(data) {
    const sha1sum = crypto_1.default.createHash("sha1");
    sha1sum.update(data);
    const s = sha1sum.digest("hex");
    let i = -1;
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        i += 1;
        switch (c) {
            case "y":
                return ((parseInt("0x" + s[i], 16) & 0x3) | 0x8).toString(16);
            case "x":
            default:
                return s[i];
        }
    });
}
const VALID_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValid(UUID) {
    return VALID_UUID_REGEX.test(UUID);
}
function unparse(buf, offset = 0) {
    let i = offset;
    return buf.toString("hex", i, (i += 4)) + "-" +
        buf.toString("hex", i, (i += 2)) + "-" +
        buf.toString("hex", i, (i += 2)) + "-" +
        buf.toString("hex", i, (i += 2)) + "-" +
        buf.toString("hex", i, i + 6);
}
function write(uuid, buf, offset = 0) {
    const buffer = Buffer.from(uuid.replace(/-/g, ""), "hex");
    if (buf) {
        buffer.copy(buf, offset);
        return buf;
    }
    else {
        return buffer;
    }
}
const SHORT_FORM_REGEX = /^0*([0-9a-f]{1,8})-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function toShortForm(uuid, base = exports.BASE_UUID) {
    if (!isValid(uuid)) {
        throw new TypeError("uuid was not a valid UUID or short form UUID");
    }
    if (base && !isValid("00000000" + base)) {
        throw new TypeError("base was not a valid base UUID");
    }
    if (base && !uuid.endsWith(base)) {
        return uuid.toUpperCase();
    }
    return uuid.replace(SHORT_FORM_REGEX, "$1").toUpperCase();
}
const VALID_SHORT_REGEX = /^[0-9a-f]{1,8}$/i;
function toLongForm(uuid, base = exports.BASE_UUID) {
    if (isValid(uuid)) {
        return uuid.toUpperCase();
    }
    if (!VALID_SHORT_REGEX.test(uuid)) {
        throw new TypeError("uuid was not a valid UUID or short form UUID");
    }
    if (!isValid("00000000" + base)) {
        throw new TypeError("base was not a valid base UUID");
    }
    return (("00000000" + uuid).substr(-8) + base).toUpperCase();
}
//# sourceMappingURL=uuid.js.map