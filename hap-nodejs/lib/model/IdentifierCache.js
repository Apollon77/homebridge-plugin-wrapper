"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentifierCache = void 0;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const util_1 = tslib_1.__importDefault(require("util"));
const HAPStorage_1 = require("./HAPStorage");
/**
 * IdentifierCache is a model class that manages a system of associating HAP "Accessory IDs" and "Instance IDs"
 * with other values that don't usually change. HomeKit Clients use Accessory/Instance IDs as a primary key of
 * sorts, so the IDs need to remain "stable". For instance, if you create a HomeKit "Scene" called "Leaving Home"
 * that sets your Alarm System's "Target Alarm State" Characteristic to "Arm Away", that Scene will store whatever
 * "Instance ID" it was given for the "Target Alarm State" Characteristic. If the ID changes later on this server,
 * the scene will stop working.
 * @group Model
 */
class IdentifierCache {
    username;
    _cache = {}; // cache[key:string] = id:number
    _usedCache = null; // for usage tracking and expiring old keys
    _savedCacheHash = ""; // for checking if new cache need to be saved
    constructor(username) {
        this.username = username;
    }
    startTrackingUsage() {
        this._usedCache = {};
    }
    stopTrackingUsageAndExpireUnused() {
        // simply rotate in the new cache that was built during our normal getXYZ() calls.
        this._cache = this._usedCache || this._cache;
        this._usedCache = null;
    }
    getCache(key) {
        const value = this._cache[key];
        // track this cache item if needed
        if (this._usedCache && typeof value !== "undefined") {
            this._usedCache[key] = value;
        }
        return value;
    }
    setCache(key, value) {
        this._cache[key] = value;
        // track this cache item if needed
        if (this._usedCache) {
            this._usedCache[key] = value;
        }
        return value;
    }
    getAID(accessoryUUID) {
        const key = accessoryUUID;
        // ensure that our "next AID" field is not expired
        this.getCache("|nextAID");
        return this.getCache(key) || this.setCache(key, this.getNextAID());
    }
    getIID(accessoryUUID, serviceUUID, serviceSubtype, characteristicUUID) {
        const key = accessoryUUID
            + "|" + serviceUUID
            + (serviceSubtype ? "|" + serviceSubtype : "")
            + (characteristicUUID ? "|" + characteristicUUID : "");
        // ensure that our "next IID" field for this accessory is not expired
        this.getCache(accessoryUUID + "|nextIID");
        return this.getCache(key) || this.setCache(key, this.getNextIID(accessoryUUID));
    }
    getNextAID() {
        const key = "|nextAID";
        const nextAID = this.getCache(key) || 2; // start at 2 because the root Accessory or Bridge must be 1
        this.setCache(key, nextAID + 1); // increment
        return nextAID;
    }
    getNextIID(accessoryUUID) {
        const key = accessoryUUID + "|nextIID";
        const nextIID = this.getCache(key) || 2; // iid 1 is reserved for the Accessory Information service
        this.setCache(key, nextIID + 1); // increment
        return nextIID;
    }
    save() {
        const newCacheHash = crypto_1.default.createHash("sha1").update(JSON.stringify(this._cache)).digest("hex"); //calculate hash of new cache
        if (newCacheHash !== this._savedCacheHash) { //check if cache need to be saved and proceed accordingly
            const saved = {
                cache: this._cache,
            };
            const key = IdentifierCache.persistKey(this.username);
            HAPStorage_1.HAPStorage.storage().setItemSync(key, saved);
            this._savedCacheHash = newCacheHash; //update hash of saved cache for future use
        }
    }
    /**
     * Persisting to File System
     */
    // Gets a key for storing this IdentifierCache in the filesystem, like "IdentifierCache.CC223DE3CEF3.json"
    static persistKey(username) {
        return util_1.default.format("IdentifierCache.%s.json", username.replace(/:/g, "").toUpperCase());
    }
    static load(username) {
        const key = IdentifierCache.persistKey(username);
        const saved = HAPStorage_1.HAPStorage.storage().getItem(key);
        if (saved) {
            const info = new IdentifierCache(username);
            info._cache = saved.cache;
            // calculate hash of the saved hash to decide in future if saving of new cache is needed
            info._savedCacheHash = crypto_1.default.createHash("sha1").update(JSON.stringify(info._cache)).digest("hex");
            return info;
        }
        else {
            return null;
        }
    }
    static remove(username) {
        const key = this.persistKey(username);
        HAPStorage_1.HAPStorage.storage().removeItemSync(key);
    }
}
exports.IdentifierCache = IdentifierCache;
//# sourceMappingURL=IdentifierCache.js.map