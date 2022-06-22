"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.layerDecrypt = exports.layerEncrypt = exports.chacha20_poly1305_encryptAndSeal = exports.chacha20_poly1305_decryptAndVerify = exports.writeUInt64LE = exports.HKDF = exports.generateCurve25519SharedSecKey = exports.generateCurve25519KeyPair = void 0;
var tslib_1 = require("tslib");
var assert_1 = (0, tslib_1.__importDefault)(require("assert"));
var crypto_1 = (0, tslib_1.__importDefault)(require("crypto"));
var futoin_hkdf_1 = (0, tslib_1.__importDefault)(require("futoin-hkdf"));
var tweetnacl_1 = (0, tslib_1.__importDefault)(require("tweetnacl"));
if (!crypto_1.default.getCiphers().includes("chacha20-poly1305")) {
    assert_1.default.fail("The cipher 'chacha20-poly1305' is not supported with your current running nodejs version v" + process.version + ". " +
        "At least a nodejs version of v10.17.0 (excluding v11.0 and v11.1) is required!");
}
function generateCurve25519KeyPair() {
    return tweetnacl_1.default.box.keyPair();
}
exports.generateCurve25519KeyPair = generateCurve25519KeyPair;
function generateCurve25519SharedSecKey(priKey, pubKey) {
    return tweetnacl_1.default.scalarMult(priKey, pubKey);
}
exports.generateCurve25519SharedSecKey = generateCurve25519SharedSecKey;
function HKDF(hashAlg, salt, ikm, info, size) {
    return (0, futoin_hkdf_1.default)(ikm, size, { hash: hashAlg, salt: salt, info: info });
}
exports.HKDF = HKDF;
var MAX_UINT32 = 0x00000000FFFFFFFF;
var MAX_INT53 = 0x001FFFFFFFFFFFFF;
function uintHighLow(number) {
    (0, assert_1.default)(number > -1 && number <= MAX_INT53, "number out of range");
    (0, assert_1.default)(Math.floor(number) === number, "number must be an integer");
    var high = 0;
    var signbit = number & 0xFFFFFFFF;
    var low = signbit < 0 ? (number & 0x7FFFFFFF) + 0x80000000 : signbit;
    if (number > MAX_UINT32) {
        high = (number - low) / (MAX_UINT32 + 1);
    }
    return [high, low];
}
function writeUInt64LE(number, buffer, offset) {
    if (offset === void 0) { offset = 0; }
    var hl = uintHighLow(number);
    buffer.writeUInt32LE(hl[1], offset);
    buffer.writeUInt32LE(hl[0], offset + 4);
}
exports.writeUInt64LE = writeUInt64LE;
//Security Layer Enc/Dec
function chacha20_poly1305_decryptAndVerify(key, nonce, aad, ciphertext, authTag) {
    if (nonce.length < 12) { // openssl 3.x.x requires 98 bits nonce length
        nonce = Buffer.concat([
            Buffer.alloc(12 - nonce.length, 0),
            nonce,
        ]);
    }
    // @ts-expect-error: types for this are really broken
    var decipher = crypto_1.default.createDecipheriv("chacha20-poly1305", key, nonce, { authTagLength: 16 });
    if (aad) {
        decipher.setAAD(aad);
    }
    decipher.setAuthTag(authTag);
    var plaintext = decipher.update(ciphertext);
    decipher.final(); // final call verifies integrity using the auth tag. Throws error if something was manipulated!
    return plaintext;
}
exports.chacha20_poly1305_decryptAndVerify = chacha20_poly1305_decryptAndVerify;
function chacha20_poly1305_encryptAndSeal(key, nonce, aad, plaintext) {
    if (nonce.length < 12) { // openssl 3.x.x requires 98 bits nonce length
        nonce = Buffer.concat([
            Buffer.alloc(12 - nonce.length, 0),
            nonce,
        ]);
    }
    // @ts-expect-error: types for this are really broken
    var cipher = crypto_1.default.createCipheriv("chacha20-poly1305", key, nonce, { authTagLength: 16 });
    if (aad) {
        cipher.setAAD(aad);
    }
    var ciphertext = cipher.update(plaintext);
    cipher.final(); // final call creates the auth tag
    var authTag = cipher.getAuthTag();
    return {
        ciphertext: ciphertext,
        authTag: authTag,
    };
}
exports.chacha20_poly1305_encryptAndSeal = chacha20_poly1305_encryptAndSeal;
function layerEncrypt(data, encryption) {
    var result = Buffer.alloc(0);
    var total = data.length;
    for (var offset = 0; offset < total;) {
        var length = Math.min(total - offset, 0x400);
        var leLength = Buffer.alloc(2);
        leLength.writeUInt16LE(length, 0);
        var nonce = Buffer.alloc(8);
        writeUInt64LE(encryption.accessoryToControllerCount++, nonce, 0);
        var encrypted = chacha20_poly1305_encryptAndSeal(encryption.accessoryToControllerKey, nonce, leLength, data.slice(offset, offset + length));
        offset += length;
        result = Buffer.concat([result, leLength, encrypted.ciphertext, encrypted.authTag]);
    }
    return result;
}
exports.layerEncrypt = layerEncrypt;
function layerDecrypt(packet, encryption) {
    if (encryption.incompleteFrame) {
        packet = Buffer.concat([encryption.incompleteFrame, packet]);
        encryption.incompleteFrame = undefined;
    }
    var result = Buffer.alloc(0);
    var total = packet.length;
    for (var offset = 0; offset < total;) {
        var realDataLength = packet.slice(offset, offset + 2).readUInt16LE(0);
        var availableDataLength = total - offset - 2 - 16;
        if (realDataLength > availableDataLength) { // Fragmented packet
            encryption.incompleteFrame = packet.slice(offset);
            break;
        }
        var nonce = Buffer.alloc(8);
        writeUInt64LE(encryption.controllerToAccessoryCount++, nonce, 0);
        var plaintext = chacha20_poly1305_decryptAndVerify(encryption.controllerToAccessoryKey, nonce, packet.slice(offset, offset + 2), packet.slice(offset + 2, offset + 2 + realDataLength), packet.slice(offset + 2 + realDataLength, offset + 2 + realDataLength + 16));
        result = Buffer.concat([result, plaintext]);
        offset += (18 + realDataLength);
    }
    return result;
}
exports.layerDecrypt = layerDecrypt;
//# sourceMappingURL=hapCrypto.js.map