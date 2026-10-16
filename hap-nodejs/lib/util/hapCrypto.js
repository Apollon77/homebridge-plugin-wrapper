"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCurve25519KeyPair = generateCurve25519KeyPair;
exports.generateCurve25519SharedSecKey = generateCurve25519SharedSecKey;
exports.HKDF = HKDF;
exports.writeUInt64LE = writeUInt64LE;
exports.chacha20_poly1305_decryptAndVerify = chacha20_poly1305_decryptAndVerify;
exports.chacha20_poly1305_encryptAndSeal = chacha20_poly1305_encryptAndSeal;
exports.layerEncrypt = layerEncrypt;
exports.layerDecrypt = layerDecrypt;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const futoin_hkdf_1 = tslib_1.__importDefault(require("futoin-hkdf"));
const tweetnacl_1 = tslib_1.__importDefault(require("tweetnacl"));
if (!crypto_1.default.getCiphers().includes("chacha20-poly1305")) {
    assert_1.default.fail("The cipher 'chacha20-poly1305' is not supported with your current running nodejs version v" + process.version + ". " +
        "At least a nodejs version of v10.17.0 (excluding v11.0 and v11.1) is required!");
}
/**
 * @group Cryptography
 */
function generateCurve25519KeyPair() {
    return tweetnacl_1.default.box.keyPair();
}
/**
 * @group Cryptography
 */
function generateCurve25519SharedSecKey(priKey, pubKey) {
    return tweetnacl_1.default.scalarMult(priKey, pubKey);
}
/**
 * @group Cryptography
 */
function HKDF(hashAlg, salt, ikm, info, size) {
    return (0, futoin_hkdf_1.default)(ikm, size, { hash: hashAlg, salt: salt, info: info });
}
const MAX_UINT32 = 0x00000000FFFFFFFF;
const MAX_INT53 = 0x001FFFFFFFFFFFFF;
function uintHighLow(number) {
    (0, assert_1.default)(number > -1 && number <= MAX_INT53, "number out of range");
    (0, assert_1.default)(Math.floor(number) === number, "number must be an integer");
    let high = 0;
    const signbit = number & 0xFFFFFFFF;
    const low = signbit < 0 ? (number & 0x7FFFFFFF) + 0x80000000 : signbit;
    if (number > MAX_UINT32) {
        high = (number - low) / (MAX_UINT32 + 1);
    }
    return [high, low];
}
/**
 * @group Utils
 */
function writeUInt64LE(number, buffer, offset = 0) {
    const hl = uintHighLow(number);
    buffer.writeUInt32LE(hl[1], offset);
    buffer.writeUInt32LE(hl[0], offset + 4);
}
//Security Layer Enc/Dec
/**
 * @group Cryptography
 */
function chacha20_poly1305_decryptAndVerify(key, nonce, aad, ciphertext, authTag) {
    if (nonce.length < 12) { // openssl 3.x.x requires 98 bits nonce length
        nonce = Buffer.concat([
            Buffer.alloc(12 - nonce.length, 0),
            nonce,
        ]);
    }
    const decipher = crypto_1.default.createDecipheriv("chacha20-poly1305", key, nonce, { authTagLength: 16 });
    if (aad) {
        decipher.setAAD(aad, { plaintextLength: ciphertext.length });
    }
    decipher.setAuthTag(authTag);
    const plaintext = decipher.update(ciphertext);
    decipher.final(); // final call verifies integrity using the auth tag. Throws error if something was manipulated!
    return plaintext;
}
/**
 * @group Cryptography
 */
function chacha20_poly1305_encryptAndSeal(key, nonce, aad, plaintext) {
    if (nonce.length < 12) { // openssl 3.x.x requires 98 bits nonce length
        nonce = Buffer.concat([
            Buffer.alloc(12 - nonce.length, 0),
            nonce,
        ]);
    }
    const cipher = crypto_1.default.createCipheriv("chacha20-poly1305", key, nonce, { authTagLength: 16 });
    if (aad) {
        cipher.setAAD(aad, { plaintextLength: plaintext.length });
    }
    const ciphertext = cipher.update(plaintext);
    cipher.final(); // final call creates the auth tag
    const authTag = cipher.getAuthTag();
    return {
        ciphertext: ciphertext,
        authTag: authTag,
    };
}
/**
 * @group Cryptography
 */
function layerEncrypt(data, encryption) {
    const chunks = [];
    const total = data.length;
    for (let offset = 0; offset < total;) {
        const length = Math.min(total - offset, 0x400);
        const leLength = Buffer.alloc(2);
        leLength.writeUInt16LE(length, 0);
        const nonce = Buffer.alloc(8);
        writeUInt64LE(encryption.accessoryToControllerCount++, nonce, 0);
        const encrypted = chacha20_poly1305_encryptAndSeal(encryption.accessoryToControllerKey, nonce, leLength, data.subarray(offset, offset + length));
        offset += length;
        chunks.push(leLength, encrypted.ciphertext, encrypted.authTag);
    }
    return Buffer.concat(chunks);
}
/**
 * @group Cryptography
 */
function layerDecrypt(packet, encryption) {
    if (encryption.incompleteFrame) {
        packet = Buffer.concat([encryption.incompleteFrame, packet]);
        encryption.incompleteFrame = undefined;
    }
    const chunks = [];
    const total = packet.length;
    for (let offset = 0; offset < total;) {
        const realDataLength = packet.subarray(offset, offset + 2).readUInt16LE(0);
        const availableDataLength = total - offset - 2 - 16;
        if (realDataLength > availableDataLength) { // Fragmented packet
            encryption.incompleteFrame = packet.subarray(offset);
            break;
        }
        const nonce = Buffer.alloc(8);
        writeUInt64LE(encryption.controllerToAccessoryCount++, nonce, 0);
        const plaintext = chacha20_poly1305_decryptAndVerify(encryption.controllerToAccessoryKey, nonce, packet.subarray(offset, offset + 2), packet.subarray(offset + 2, offset + 2 + realDataLength), packet.subarray(offset + 2 + realDataLength, offset + 2 + realDataLength + 16));
        chunks.push(plaintext);
        offset += (18 + realDataLength);
    }
    return Buffer.concat(chunks);
}
//# sourceMappingURL=hapCrypto.js.map