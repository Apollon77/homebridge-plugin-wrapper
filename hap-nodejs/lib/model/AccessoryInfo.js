"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessoryInfo = exports.PermissionTypes = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const tweetnacl_1 = tslib_1.__importDefault(require("tweetnacl"));
const util_1 = tslib_1.__importDefault(require("util"));
const eventedhttp_1 = require("../util/eventedhttp");
const HAPStorage_1 = require("./HAPStorage");
const node_fs_1 = require("node:fs");
const debug = (0, debug_1.default)("HAP-NodeJS:AccessoryInfo");
function getVersion() {
    const packageJson = JSON.parse((0, node_fs_1.readFileSync)(require.resolve("../../../package.json"), "utf-8"));
    const { version } = packageJson;
    return version;
}
/**
 * @group Model
 */
var PermissionTypes;
(function (PermissionTypes) {
    // noinspection JSUnusedGlobalSymbols
    PermissionTypes[PermissionTypes["USER"] = 0] = "USER";
    PermissionTypes[PermissionTypes["ADMIN"] = 1] = "ADMIN";
})(PermissionTypes || (exports.PermissionTypes = PermissionTypes = {}));
/**
 * AccessoryInfo is a model class containing a subset of Accessory data relevant to the internal HAP server,
 * such as encryption keys and username. It is persisted to disk.
 * @group Model
 */
class AccessoryInfo {
    static deviceIdPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    username;
    displayName;
    model; // this property is currently not saved to disk
    category;
    pincode;
    signSk;
    signPk;
    pairedClients;
    pairedAdminClients;
    configVersion = 1;
    configHash;
    setupID;
    lastFirmwareVersion = "";
    constructor(username) {
        this.username = username;
        this.displayName = "";
        this.model = "";
        this.category = 1 /* Categories.OTHER */;
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
    addPairedClient(username, publicKey, permission) {
        this.pairedClients[username] = {
            username: username,
            publicKey: publicKey,
            permission: permission,
        };
        if (permission === 1 /* PermissionTypes.ADMIN */) {
            this.pairedAdminClients++;
        }
    }
    updatePermission(username, permission) {
        const pairingInformation = this.pairedClients[username];
        if (pairingInformation) {
            const oldPermission = pairingInformation.permission;
            pairingInformation.permission = permission;
            if (oldPermission === 1 /* PermissionTypes.ADMIN */ && permission !== 1 /* PermissionTypes.ADMIN */) {
                this.pairedAdminClients--;
            }
            else if (oldPermission !== 1 /* PermissionTypes.ADMIN */ && permission === 1 /* PermissionTypes.ADMIN */) {
                this.pairedAdminClients++;
            }
        }
    }
    listPairings() {
        const array = [];
        for (const pairingInformation of Object.values(this.pairedClients)) {
            array.push(pairingInformation);
        }
        return array;
    }
    /**
     * Remove a paired client from memory.
     * @param connection - the session of the connection initiated the removal of the pairing
     * @param {string} username
     */
    removePairedClient(connection, username) {
        this._removePairedClient0(connection, username);
        if (this.pairedAdminClients === 0) { // if we don't have any admin clients left paired it is required to kill all normal clients
            for (const username0 of Object.keys(this.pairedClients)) {
                this._removePairedClient0(connection, username0);
            }
        }
    }
    _removePairedClient0(connection, username) {
        if (this.pairedClients[username] && this.pairedClients[username].permission === 1 /* PermissionTypes.ADMIN */) {
            this.pairedAdminClients--;
        }
        delete this.pairedClients[username];
        eventedhttp_1.EventedHTTPServer.destroyExistingConnectionsAfterUnpair(connection, username);
    }
    /**
     * Check if username is paired
     * @param username
     */
    isPaired(username) {
        return !!this.pairedClients[username];
    }
    hasAdminPermissions(username) {
        if (!username) {
            return false;
        }
        const pairingInformation = this.pairedClients[username];
        return !!pairingInformation && pairingInformation.permission === 1 /* PermissionTypes.ADMIN */;
    }
    // Gets the public key for a paired client as a Buffer, or falsy value if not paired.
    getClientPublicKey(username) {
        const pairingInformation = this.pairedClients[username];
        if (pairingInformation) {
            return pairingInformation.publicKey;
        }
        else {
            return undefined;
        }
    }
    // Returns a boolean indicating whether this accessory has been paired with a client.
    paired = () => {
        return Object.keys(this.pairedClients).length > 0; // if we have any paired clients, we're paired.
    };
    /**
     * Checks based on the current accessory configuration if the current configuration number needs to be incremented.
     * Additionally, if desired, it checks if the firmware version was incremented (aka the HAP-NodeJS) version did grow.
     *
     * @param configuration - The current accessory configuration.
     * @param checkFirmwareIncrement
     * @returns True if the current configuration number was incremented and thus a new TXT must be advertised.
     */
    checkForCurrentConfigurationNumberIncrement(configuration, checkFirmwareIncrement) {
        const shasum = crypto_1.default.createHash("sha1");
        shasum.update(JSON.stringify(AccessoryInfo.canonicalizeConfiguration(configuration)));
        const configHash = shasum.digest("hex");
        let changed = false;
        if (configHash !== this.configHash) {
            const previousHash = this.configHash;
            this.configVersion++;
            this.configHash = configHash;
            this.ensureConfigVersionBounds();
            changed = true;
            // the increment is otherwise invisible: a bridge whose configuration churns bumps c# (and re-advertises)
            // with no trace in any log, which is exactly what made homebridge/homebridge#3984 hard to diagnose
            debug("[%s] Configuration number incremented to %d (configuration hash %s -> %s)", this.username, this.configVersion, previousHash || "<none>", configHash);
        }
        if (checkFirmwareIncrement) {
            const version = getVersion();
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
    }
    getConfigVersion() {
        return this.configVersion;
    }
    /**
     * Returns a copy of the configuration with every order-independent array sorted, so that two representations
     * of the same configuration always produce the same hash. Nothing guarantees plugins rebuild their accessories,
     * services or characteristic properties in the same order on every start, and each reordering would otherwise
     * increment the configuration number (and re-advertise) without any real change. Sorting is by aid/iid, which
     * are persisted in the IdentifierCache and therefore stable across restarts. Only the hash input is
     * canonicalized - the wire format of /accessories is untouched.
     */
    static canonicalizeConfiguration(configuration) {
        return configuration
            .map((accessory) => ({
            ...accessory,
            services: accessory.services
                .map((service) => ({
                ...service,
                characteristics: service.characteristics
                    .map((characteristic) => ({
                    ...characteristic,
                    perms: [...characteristic.perms].sort(),
                    "valid-values": characteristic["valid-values"] && [...characteristic["valid-values"]].sort((a, b) => a - b),
                }))
                    .sort((a, b) => a.iid - b.iid),
                linked: service.linked && [...service.linked].sort((a, b) => a - b),
            }))
                .sort((a, b) => a.iid - b.iid),
        }))
            .sort((a, b) => a.aid - b.aid);
    }
    ensureConfigVersionBounds() {
        // current configuration number must be in the range of 1-65535 and wrap to 1 when it overflows
        this.configVersion = this.configVersion % (0xFFFF + 1);
        if (this.configVersion === 0) {
            this.configVersion = 1;
        }
    }
    save() {
        const saved = {
            displayName: this.displayName,
            category: this.category,
            pincode: this.pincode,
            signSk: this.signSk.toString("hex"),
            signPk: this.signPk.toString("hex"),
            pairedClients: {},
            // moving permissions into an extra object, so there is nothing to migrate from old files.
            // if the legacy storage format should be upgraded some time, it would be reasonable to combine the storage
            // of public keys (pairedClients object) and permissions.
            pairedClientsPermission: {},
            configVersion: this.configVersion,
            configHash: this.configHash,
            setupID: this.setupID,
            lastFirmwareVersion: this.lastFirmwareVersion,
        };
        for (const [username, pairingInformation] of Object.entries(this.pairedClients)) {
            // @ts-expect-error: missing typing, object instead of Record
            saved.pairedClients[username] = pairingInformation.publicKey.toString("hex");
            // @ts-expect-error: missing typing, object instead of Record
            saved.pairedClientsPermission[username] = pairingInformation.permission;
        }
        const key = AccessoryInfo.persistKey(this.username);
        HAPStorage_1.HAPStorage.storage().setItemSync(key, saved);
    }
    // Gets a key for storing this AccessoryInfo in the filesystem, like "AccessoryInfo.CC223DE3CEF3.json"
    static persistKey(username) {
        return util_1.default.format("AccessoryInfo.%s.json", username.replace(/:/g, "").toUpperCase());
    }
    static create(username) {
        AccessoryInfo.assertValidUsername(username);
        const accessoryInfo = new AccessoryInfo(username);
        accessoryInfo.lastFirmwareVersion = getVersion();
        // Create a new unique key pair for this accessory.
        const keyPair = tweetnacl_1.default.sign.keyPair();
        accessoryInfo.signSk = Buffer.from(keyPair.secretKey);
        accessoryInfo.signPk = Buffer.from(keyPair.publicKey);
        return accessoryInfo;
    }
    static load(username) {
        AccessoryInfo.assertValidUsername(username);
        const key = AccessoryInfo.persistKey(username);
        const saved = HAPStorage_1.HAPStorage.storage().getItem(key);
        if (saved) {
            const info = new AccessoryInfo(username);
            info.displayName = saved.displayName || "";
            info.category = saved.category || 1 /* Categories.OTHER */;
            info.pincode = saved.pincode || "";
            info.signSk = Buffer.from(saved.signSk || "", "hex");
            info.signPk = Buffer.from(saved.signPk || "", "hex");
            info.pairedClients = {};
            for (const username of Object.keys(saved.pairedClients || {})) {
                const publicKey = saved.pairedClients[username];
                let permission = saved.pairedClientsPermission ? saved.pairedClientsPermission[username] : undefined;
                if (permission === undefined) {
                    permission = 1 /* PermissionTypes.ADMIN */;
                } // defaulting to admin permissions is the only suitable solution, there is no way to recover permissions
                info.pairedClients[username] = {
                    username: username,
                    publicKey: Buffer.from(publicKey, "hex"),
                    permission: permission,
                };
                if (permission === 1 /* PermissionTypes.ADMIN */) {
                    info.pairedAdminClients++;
                }
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
    }
    static remove(username) {
        const key = AccessoryInfo.persistKey(username);
        HAPStorage_1.HAPStorage.storage().removeItemSync(key);
    }
    static assertValidUsername(username) {
        assert_1.default.ok(AccessoryInfo.deviceIdPattern.test(username), "The supplied username (" + username + ") is not valid " +
            "(expected a format like 'XX:XX:XX:XX:XX:XX' with XX being a valid hexadecimal string). " +
            "Note that, if you had this accessory already paired with the invalid username, you will need to repair " +
            "the accessory and reconfigure your services in the Home app. " +
            "Using an invalid username will lead to unexpected behaviour.");
    }
}
exports.AccessoryInfo = AccessoryInfo;
//# sourceMappingURL=AccessoryInfo.js.map