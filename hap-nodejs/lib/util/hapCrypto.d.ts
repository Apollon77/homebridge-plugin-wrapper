/// <reference types="node" />
import tweetnacl from 'tweetnacl';
import { HAPEncryption } from "./eventedhttp";
export declare function generateCurve25519KeyPair(): tweetnacl.BoxKeyPair;
export declare function generateCurve25519SharedSecKey(priKey: Uint8Array, pubKey: Uint8Array): Uint8Array;
export declare function HKDF(hashAlg: string, salt: Buffer, ikm: Buffer, info: Buffer, size: number): Buffer;
export declare function layerEncrypt(data: Buffer, encryption: HAPEncryption): Buffer;
export declare function layerDecrypt(packet: Buffer, encryption: HAPEncryption): Buffer;
export declare function chacha20_poly1305_decryptAndVerify(key: Buffer, nonce: Buffer, aad: Buffer | null, ciphertext: Buffer, authTag: Buffer): Buffer;
export declare function chacha20_poly1305_encryptAndSeal(key: Buffer, nonce: Buffer, aad: Buffer | null, plaintext: Buffer): {
    ciphertext: Buffer;
    authTag: Buffer;
};
export declare function writeUInt64LE(number: number, buffer: Buffer, offset?: number): void;
//# sourceMappingURL=hapCrypto.d.ts.map