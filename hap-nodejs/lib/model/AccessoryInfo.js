"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessoryInfo = exports.PermissionTypes = void 0;
var tslib_1 = require("tslib");
var assert_1 = (0, tslib_1.__importDefault)(require("assert"));
var crypto_1 = (0, tslib_1.__importDefault)(require("crypto"));
var tweetnacl_1 = (0, tslib_1.__importDefault)(require("tweetnacl"));
var util_1 = (0, tslib_1.__importDefault)(require("util"));
var eventedhttp_1 = require("../util/eventedhttp");
var HAPStorage_1 = require("./HAPStorage");
function getVersion() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    var packageJson = require("../../../package.json");
    return packageJson.version;
}
var PermissionTypes;
(function (PermissionTypes) {
    // noinspection JSUnusedGlobalSymbols
    PermissionTypes[PermissionTypes["USER"] = 0] = "USER";
    PermissionTypes[PermissionTypes["ADMIN"] = 1] = "ADMIN";
})(PermissionTypes = exports.PermissionTypes || (exports.PermissionTypes = {}));
/**
 * AccessoryInfo is a model class containing a subset of Accessory data relevant to the internal HAP server,
 * such as encryption keys and username. It is persisted to disk.
 */
var AccessoryInfo = /** @class */ (function () {
    function AccessoryInfo(username) {
        var _this = this;
        this.configVersion = 1;
        this.lastFirmwareVersion = "";
        // Returns a boolean indicating whether this accessory has been paired with a client.
        this.paired = function () {
            return Object.keys(_this.pairedClients).length > 0; // if we have any paired clients, we're paired.
        };
        this.username = username;
        this.displayName = "";
        this.model = "";
        this.category = 1 /* OTHER */;
        this.pincode = "";
        this.signSk = Buffer.alloc(0);
        this.signPk = Buffer.alloc(0);
        this.pairedClients = {};
        this.pairedAdminClients = 0;
        this.configHash = "";
        this.setupID = "";
    }
    /**
     * Add a paired client to memory.
     * @param {HAPUsername} username
     * @param {Buffer} publicKey
     * @param {PermissionTypes} permission
     */
    AccessoryInfo.prototype.addPairedClient = function (username, publicKey, permission) {
        this.pairedClients[username] = {
            username: username,
            publicKey: publicKey,
            permission: permission,
        };
        if (permission === 1 /* ADMIN */) {
            this.pairedAdminClients++;
        }
    };
    AccessoryInfo.prototype.updatePermission = function (username, permission) {
        var pairingInformation = this.pairedClients[username];
        if (pairingInformation) {
            var oldPermission = pairingInformation.permission;
            pairingInformation.permission = permission;
            if (oldPermission === 1 /* ADMIN */ && permission !== 1 /* ADMIN */) {
                this.pairedAdminClients--;
            }
            else if (oldPermission !== 1 /* ADMIN */ && permission === 1 /* ADMIN */) {
                this.pairedAdminClients++;
            }
        }
    };
    AccessoryInfo.prototype.listPairings = function () {
        var e_1, _a;
        var array = [];
        try {
            for (var _b = (0, tslib_1.__values)(Object.values(this.pairedClients)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var pairingInformation = _c.value;
                array.push(pairingInformation);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return array;
    };
    /**
     * Remove a paired client from memory.
     * @param connection - the session of the connection initiated the removal of the pairing
     * @param {string} username
     */
    AccessoryInfo.prototype.removePairedClient = function (connection, username) {
        var e_2, _a;
        this._removePairedClient0(connection, username);
        if (this.pairedAdminClients === 0) { // if we don't have any admin clients left paired it is required to kill all normal clients
            try {
                for (var _b = (0, tslib_1.__values)(Object.keys(this.pairedClients)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var username0 = _c.value;
                    this._removePairedClient0(connection, username0);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    };
    AccessoryInfo.prototype._removePairedClient0 = function (connection, username) {
        if (this.pairedClients[username] && this.pairedClients[username].permission === 1 /* ADMIN */) {
            this.pairedAdminClients--;
        }
        delete this.pairedClients[username];
        eventedhttp_1.EventedHTTPServer.destroyExistingConnectionsAfterUnpair(connection, username);
    };
    /**
     * Check if username is paired
     * @param username
     */
    AccessoryInfo.prototype.isPaired = function (username) {
        return !!this.pairedClients[username];
    };
    AccessoryInfo.prototype.hasAdminPermissions = function (username) {
        if (!username) {
            return false;
        }
        var pairingInformation = this.pairedClients[username];
        return !!pairingInformation && pairingInformation.permission === 1 /* ADMIN */;
    };
    // Gets the public key for a paired client as a Buffer, or falsy value if not paired.
    AccessoryInfo.prototype.getClientPublicKey = function (username) {
        var pairingInformation = this.pairedClients[username];
        if (pairingInformation) {
            return pairingInformation.publicKey;
        }
        else {
            return undefined;
        }
    };
    /**
     * Checks based on the current accessory configuration if the current configuration number needs to be incremented.
     * Additionally, if desired, it checks if the firmware version was incremented (aka the HAP-NodeJS) version did grow.
     *
     * @param configuration - The current accessory configuration.
     * @param checkFirmwareIncrement
     * @returns True if the current configuration number was incremented and thus a new TXT must be advertised.
     */
    AccessoryInfo.prototype.checkForCurrentConfigurationNumberIncrement = function (configuration, checkFirmwareIncrement) {
        var shasum = crypto_1.default.createHash("sha1");
        shasum.update(JSON.stringify(configuration));
        var configHash = shasum.digest("hex");
        var changed = false;
        if (configHash !== this.configHash) {
            this.configVersion++;
            this.configHash = configHash;
            this.ensureConfigVersionBounds();
            changed = true;
        }
        if (checkFirmwareIncrement) {
            var version = getVersion();
            if (this.lastFirmwareVersion !== version) {
                // we only check if it is different and not only if it is incremented
                // HomeKit spec prohibits firmware downgrades, but with hap-nodejs it's possible lol
                this.lastFirmwareVersion = version;
                changed = true;
            }
        }
        if (changed) {
            this.save();
        }
        return changed;
    };
    AccessoryInfo.prototype.getConfigVersion = function () {
        return this.configVersion;
    };
    AccessoryInfo.prototype.ensureConfigVersionBounds = function () {
        // current configuration number must be in the range of 1-65535 and wrap to 1 when it overflows
        this.configVersion = this.configVersion % (0xFFFF + 1);
        if (this.configVersion === 0) {
            this.configVersion = 1;
        }
    };
    AccessoryInfo.prototype.save = function () {
        var e_3, _a;
        var saved = {
            displayName: this.displayName,
            category: this.category,
            pincode: this.pincode,
            signSk: this.signSk.toString("hex"),
            signPk: this.signPk.toString("hex"),
            pairedClients: {},
            // moving permissions into an extra object, so there is nothing to migrate from old files.
            // if the legacy node-persist storage should be upgraded some time, it would be reasonable to combine the storage
            // of public keys (pairedClients object) and permissions.
            pairedClientsPermission: {},
            configVersion: this.configVersion,
            configHash: this.configHash,
            setupID: this.setupID,
            lastFirmwareVersion: this.lastFirmwareVersion,
        };
        try {
            for (var _b = (0, tslib_1.__values)(Object.entries(this.pairedClients)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = (0, tslib_1.__read)(_c.value, 2), username = _d[0], pairingInformation = _d[1];
                // @ts-expect-error: missing typing, object instead of Record
                saved.pairedClients[username] = pairingInformation.publicKey.toString("hex");
                // @ts-expect-error: missing typing, object instead of Record
                saved.pairedClientsPermission[username] = pairingInformation.permission;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var key = AccessoryInfo.persistKey(this.username);
        HAPStorage_1.HAPStorage.storage().setItemSync(key, saved);
    };
    // Gets a key for storing this AccessoryInfo in the filesystem, like "AccessoryInfo.CC223DE3CEF3.json"
    AccessoryInfo.persistKey = function (username) {
        return util_1.default.format("AccessoryInfo.%s.json", username.replace(/:/g, "").toUpperCase());
    };
    AccessoryInfo.create = function (username) {
        AccessoryInfo.assertValidUsername(username);
        var accessoryInfo = new AccessoryInfo(username);
        accessoryInfo.lastFirmwareVersion = getVersion();
        // Create a new unique key pair for this accessory.
        var keyPair = tweetnacl_1.default.sign.keyPair();
        accessoryInfo.signSk = Buffer.from(keyPair.secretKey);
        accessoryInfo.signPk = Buffer.from(keyPair.publicKey);
        return accessoryInfo;
    };
    AccessoryInfo.load = function (username) {
        var e_4, _a;
        AccessoryInfo.assertValidUsername(username);
        var key = AccessoryInfo.persistKey(username);
        var saved = HAPStorage_1.HAPStorage.storage().getItem(key);
        if (saved) {
            var info = new AccessoryInfo(username);
            info.displayName = saved.displayName || "";
            info.category = saved.category || "";
            info.pincode = saved.pincode || "";
            info.signSk = Buffer.from(saved.signSk || "", "hex");
            info.signPk = Buffer.from(saved.signPk || "", "hex");
            info.pairedClients = {};
            try {
                for (var _b = (0, tslib_1.__values)(Object.keys(saved.pairedClients || {})), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var username_1 = _c.value;
                    var publicKey = saved.pairedClients[username_1];
                    var permission = saved.pairedClientsPermission ? saved.pairedClientsPermission[username_1] : undefined;
                    if (permission === undefined) {
                        permission = 1 /* ADMIN */;
                    } // defaulting to admin permissions is the only suitable solution, there is no way to recover permissions
                    info.pairedClients[username_1] = {
                        username: username_1,
                        publicKey: Buffer.from(publicKey, "hex"),
                        permission: permission,
                    };
                    if (permission === 1 /* ADMIN */) {
                        info.pairedAdminClients++;
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            info.configVersion = saved.configVersion || 1;
            info.configHash = saved.configHash || "";
            info.setupID = saved.setupID || "";
            info.lastFirmwareVersion = saved.lastFirmwareVersion || getVersion();
            info.ensureConfigVersionBounds();
            return info;
        }
        else {
            return null;
        }
    };
    AccessoryInfo.remove = function (username) {
        var key = AccessoryInfo.persistKey(username);
        HAPStorage_1.HAPStorage.storage().removeItemSync(key);
    };
    AccessoryInfo.assertValidUsername = function (username) {
        assert_1.default.ok(AccessoryInfo.deviceIdPattern.test(username), "The supplied username (" + username + ") is not valid " +
            "(expected a format like 'XX:XX:XX:XX:XX:XX' with XX being a valid hexadecimal string). " +
            "Note that, if you had this accessory already paired with the invalid username, you will need to repair " +
            "the accessory and reconfigure your services in the Home app. " +
            "Using an invalid username will lead to unexpected behaviour.");
    };
    AccessoryInfo.deviceIdPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return AccessoryInfo;
}());
exports.AccessoryInfo = AccessoryInfo;
//# sourceMappingURL=AccessoryInfo.js.map