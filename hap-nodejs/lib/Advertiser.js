"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolvedAdvertiser = exports.AvahiAdvertiser = exports.DBusInvokeError = exports.BonjourHAPAdvertiser = exports.CiaoAdvertiser = exports.AdvertiserEvent = exports.PairingFeatureFlag = exports.StatusFlag = void 0;
const tslib_1 = require("tslib");
const ciao_1 = tslib_1.__importDefault(require("@homebridge/ciao"));
const dbus_native_1 = tslib_1.__importDefault(require("@homebridge/dbus-native"));
const assert_1 = tslib_1.__importDefault(require("assert"));
const bonjour_hap_1 = tslib_1.__importDefault(require("bonjour-hap"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const events_1 = require("events");
const promise_utils_1 = require("./util/promise-utils");
const debug = (0, debug_1.default)("HAP-NodeJS:Advertiser");
/**
 * This enum lists all bitmasks for all known status flags.
 * When the bit for the given bitmask is set, it represents the state described by the name.
 *
 * @group Advertiser
 */
var StatusFlag;
(function (StatusFlag) {
    StatusFlag[StatusFlag["NOT_PAIRED"] = 1] = "NOT_PAIRED";
    StatusFlag[StatusFlag["NOT_JOINED_WIFI"] = 2] = "NOT_JOINED_WIFI";
    StatusFlag[StatusFlag["PROBLEM_DETECTED"] = 4] = "PROBLEM_DETECTED";
})(StatusFlag || (exports.StatusFlag = StatusFlag = {}));
/**
 * This enum lists all bitmasks for all known pairing feature flags.
 * When the bit for the given bitmask is set, it represents the state described by the name.
 *
 * @group Advertiser
 */
var PairingFeatureFlag;
(function (PairingFeatureFlag) {
    PairingFeatureFlag[PairingFeatureFlag["SUPPORTS_HARDWARE_AUTHENTICATION"] = 1] = "SUPPORTS_HARDWARE_AUTHENTICATION";
    PairingFeatureFlag[PairingFeatureFlag["SUPPORTS_SOFTWARE_AUTHENTICATION"] = 2] = "SUPPORTS_SOFTWARE_AUTHENTICATION";
})(PairingFeatureFlag || (exports.PairingFeatureFlag = PairingFeatureFlag = {}));
/**
 * @group Advertiser
 */
var AdvertiserEvent;
(function (AdvertiserEvent) {
    /**
     * Emitted if the underlying mDNS advertisers signals, that the service name
     * was automatically changed due to some naming conflicts on the network.
     */
    AdvertiserEvent["UPDATED_NAME"] = "updated-name";
})(AdvertiserEvent || (exports.AdvertiserEvent = AdvertiserEvent = {}));
/**
 * Advertiser uses mdns to broadcast the presence of an Accessory to the local network.
 *
 * Note that as of iOS 9, an accessory can only pair with a single client. Instead of pairing your
 * accessories with multiple iOS devices in your home, Apple intends for you to use Home Sharing.
 * To support this requirement, we provide the ability to be "discoverable" or not (via a "service flag" on the
 * mdns payload).
 *
 * @group Advertiser
 */
class CiaoAdvertiser extends events_1.EventEmitter {
    static protocolVersion = "1.1";
    static protocolVersionService = "1.1.0";
    accessoryInfo;
    setupHash;
    responder;
    advertisedService;
    constructor(accessoryInfo, responderOptions, serviceOptions) {
        super();
        this.accessoryInfo = accessoryInfo;
        this.setupHash = CiaoAdvertiser.computeSetupHash(accessoryInfo);
        this.responder = ciao_1.default.getResponder({
            ...responderOptions,
        });
        this.advertisedService = this.responder.createService({
            name: this.accessoryInfo.displayName,
            type: "hap" /* ServiceType.HAP */,
            txt: CiaoAdvertiser.createTxt(accessoryInfo, this.setupHash),
            // host will default now to <displayName>.local, spaces replaced with dashes
            ...serviceOptions,
        });
        this.advertisedService.on("name-change" /* ServiceEvent.NAME_CHANGED */, this.emit.bind(this, "updated-name" /* AdvertiserEvent.UPDATED_NAME */));
        debug(`Preparing Advertiser for '${this.accessoryInfo.displayName}' using ciao backend!`);
    }
    initPort(port) {
        this.advertisedService.updatePort(port);
    }
    startAdvertising() {
        debug(`Starting to advertise '${this.accessoryInfo.displayName}' using ciao backend!`);
        return this.advertisedService.advertise();
    }
    updateAdvertisement(silent) {
        const txt = CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash);
        debug("Updating txt record (txt: %o, silent: %d)", txt, silent);
        this.advertisedService.updateTxt(txt, silent);
    }
    async destroy() {
        // advertisedService.destroy(); is called implicitly via the shutdown call
        await this.responder.shutdown();
        this.removeAllListeners();
    }
    static createTxt(accessoryInfo, setupHash) {
        const statusFlags = [];
        if (!accessoryInfo.paired()) {
            statusFlags.push(1 /* StatusFlag.NOT_PAIRED */);
        }
        return {
            "c#": accessoryInfo.getConfigVersion(), // current configuration number
            ff: CiaoAdvertiser.ff(), // pairing feature flags
            id: accessoryInfo.username, // device id
            md: accessoryInfo.model, // model name
            pv: CiaoAdvertiser.protocolVersion, // protocol version
            "s#": 1, // current state number (must be 1)
            sf: CiaoAdvertiser.sf(...statusFlags), // status flags
            ci: accessoryInfo.category,
            sh: setupHash,
        };
    }
    static computeSetupHash(accessoryInfo) {
        const hash = crypto_1.default.createHash("sha512");
        hash.update(accessoryInfo.setupID + accessoryInfo.username.toUpperCase());
        return hash.digest().subarray(0, 4).toString("base64");
    }
    static ff(...flags) {
        let value = 0;
        flags.forEach(flag => value |= flag);
        return value;
    }
    static sf(...flags) {
        let value = 0;
        flags.forEach(flag => value |= flag);
        return value;
    }
}
exports.CiaoAdvertiser = CiaoAdvertiser;
/**
 * Advertiser base on the legacy "bonjour-hap" library.
 *
 * @group Advertiser
 */
class BonjourHAPAdvertiser extends events_1.EventEmitter {
    accessoryInfo;
    setupHash;
    serviceOptions;
    bonjour;
    advertisement;
    port;
    destroyed = false;
    constructor(accessoryInfo, serviceOptions) {
        super();
        this.accessoryInfo = accessoryInfo;
        this.setupHash = CiaoAdvertiser.computeSetupHash(accessoryInfo);
        this.serviceOptions = serviceOptions;
        this.bonjour = (0, bonjour_hap_1.default)();
        debug(`Preparing Advertiser for '${this.accessoryInfo.displayName}' using bonjour-hap backend!`);
    }
    initPort(port) {
        this.port = port;
    }
    startAdvertising() {
        (0, assert_1.default)(!this.destroyed, "Can't advertise on a destroyed bonjour instance!");
        if (this.port == null) {
            throw new Error("Tried starting bonjour-hap advertisement without initializing port!");
        }
        debug(`Starting to advertise '${this.accessoryInfo.displayName}' using bonjour-hap backend!`);
        if (this.advertisement) {
            this.destroy();
        }
        const hostname = this.accessoryInfo.username.replace(/:/ig, "_") + ".local";
        this.advertisement = this.bonjour.publish({
            name: this.accessoryInfo.displayName,
            type: "hap",
            port: this.port,
            txt: CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash),
            host: hostname,
            addUnsafeServiceEnumerationRecord: true,
            ...this.serviceOptions,
        });
        return (0, promise_utils_1.PromiseTimeout)(1);
    }
    updateAdvertisement(silent) {
        const txt = CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash);
        debug("Updating txt record (txt: %o, silent: %d)", txt, silent);
        if (this.advertisement) {
            this.advertisement.updateTxt(txt, silent);
        }
    }
    destroy() {
        if (this.advertisement) {
            this.advertisement.stop(() => {
                this.advertisement.destroy();
                this.advertisement = undefined;
                this.bonjour.destroy();
            });
        }
        else {
            this.bonjour.destroy();
        }
    }
}
exports.BonjourHAPAdvertiser = BonjourHAPAdvertiser;
function messageBusConnectionResult(bus) {
    return new Promise((resolve, reject) => {
        const errorHandler = (error) => {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            bus.connection.removeListener("connect", connectHandler);
            reject(error);
        };
        const connectHandler = () => {
            bus.connection.removeListener("error", errorHandler);
            resolve();
        };
        bus.connection.once("connect", connectHandler);
        bus.connection.once("error", errorHandler);
    });
}
/**
 * @group Advertiser
 */
class DBusInvokeError extends Error {
    errorName;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(errorObject) {
        super();
        Object.setPrototypeOf(this, DBusInvokeError.prototype);
        this.name = "DBusInvokeError";
        this.errorName = errorObject.name;
        if (Array.isArray(errorObject.message) && errorObject.message.length === 1) {
            this.message = errorObject.message[0];
        }
        else {
            this.message = errorObject.message.toString();
        }
    }
}
exports.DBusInvokeError = DBusInvokeError;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbusInvoke(bus, destination, path, dbusInterface, member, others) {
    return new Promise((resolve, reject) => {
        const command = {
            destination,
            path,
            interface: dbusInterface,
            member,
            ...(others || {}),
        };
        bus.invoke(command, (err, result) => {
            if (err) {
                reject(new DBusInvokeError(err));
            }
            else {
                resolve(result);
            }
        });
    });
}
/**
 * AvahiServerState.
 *
 * Refer to https://github.com/lathiat/avahi/blob/fd482a74625b8db8547b8cfca3ee3d3c6c721423/avahi-common/defs.h#L220-L227.
 *
 * @group Advertiser
 */
var AvahiServerState;
(function (AvahiServerState) {
    // noinspection JSUnusedGlobalSymbols
    AvahiServerState[AvahiServerState["INVALID"] = 0] = "INVALID";
    AvahiServerState[AvahiServerState["REGISTERING"] = 1] = "REGISTERING";
    AvahiServerState[AvahiServerState["RUNNING"] = 2] = "RUNNING";
    AvahiServerState[AvahiServerState["COLLISION"] = 3] = "COLLISION";
    AvahiServerState[AvahiServerState["FAILURE"] = 4] = "FAILURE";
})(AvahiServerState || (AvahiServerState = {}));
/**
 * Advertiser based on the Avahi D-Bus library.
 * For (very crappy) docs on the interface, see the XML files at: https://github.com/lathiat/avahi/tree/master/avahi-daemon.
 *
 * Refer to https://github.com/lathiat/avahi/blob/fd482a74625b8db8547b8cfca3ee3d3c6c721423/avahi-common/defs.h#L120-L155 for a
 * rough API usage guide of Avahi.
 *
 * @group Advertiser
 */
class AvahiAdvertiser extends events_1.EventEmitter {
    accessoryInfo;
    setupHash;
    port;
    bus;
    avahiServerInterface;
    path;
    stateChangeHandler;
    constructor(accessoryInfo) {
        super();
        this.accessoryInfo = accessoryInfo;
        this.setupHash = CiaoAdvertiser.computeSetupHash(accessoryInfo);
        debug(`Preparing Advertiser for '${this.accessoryInfo.displayName}' using Avahi backend!`);
        this.bus = dbus_native_1.default.systemBus();
        this.stateChangeHandler = this.handleStateChangedEvent.bind(this);
    }
    createTxt() {
        return Object
            .entries(CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash))
            .map((el) => Buffer.from(el[0] + "=" + el[1]));
    }
    initPort(port) {
        this.port = port;
    }
    async startAdvertising() {
        if (this.port == null) {
            throw new Error("Tried starting Avahi advertisement without initializing port!");
        }
        if (!this.bus) {
            throw new Error("Tried to start Avahi advertisement on a destroyed advertiser!");
        }
        debug(`Starting to advertise '${this.accessoryInfo.displayName}' using Avahi backend!`);
        this.path = await AvahiAdvertiser.avahiInvoke(this.bus, "/", "Server", "EntryGroupNew");
        await AvahiAdvertiser.avahiInvoke(this.bus, this.path, "EntryGroup", "AddService", {
            body: [
                -1, // interface
                -1, // protocol
                0, // flags
                this.accessoryInfo.displayName, // name
                "_hap._tcp", // type
                "", // domain
                "", // host
                this.port, // port
                this.createTxt(), // txt
            ],
            signature: "iiussssqaay",
        });
        await AvahiAdvertiser.avahiInvoke(this.bus, this.path, "EntryGroup", "Commit");
        try {
            if (!this.avahiServerInterface) {
                this.avahiServerInterface = await AvahiAdvertiser.avahiInterface(this.bus, "Server");
                this.avahiServerInterface.on("StateChanged", this.stateChangeHandler);
            }
        }
        catch (error) {
            // We have some problem on Synology https://github.com/homebridge/HAP-NodeJS/issues/993
            console.warn("Failed to create listener for avahi-daemon server state. The system will not be notified about restarts of avahi-daemon " +
                "and will therefore stay undiscoverable in those instances. Error message: " + error);
            if (error.stack) {
                debug("Detailed error: " + error.stack);
            }
        }
    }
    /**
     * Event handler for the `StateChanged` event of the `org.freedesktop.Avahi.Server` DBus interface.
     *
     * This is called once the state of the running avahi-daemon changes its running state.
     * @param state - The state the server changed into {@see AvahiServerState}.
     */
    handleStateChangedEvent(state) {
        if (state === 2 /* AvahiServerState.RUNNING */ && this.path) {
            debug("Found Avahi daemon to have restarted!");
            this.startAdvertising()
                .catch(reason => console.error("Could not (re-)create mDNS advertisement. The HAP-Server won't be discoverable: " + reason));
        }
    }
    async updateAdvertisement(silent) {
        if (!this.bus) {
            throw new Error("Tried to update Avahi advertisement on a destroyed advertiser!");
        }
        if (!this.path) {
            debug("Tried to update advertisement without a valid `path`!");
            return;
        }
        debug("Updating txt record (txt: %o, silent: %d)", CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash), silent);
        try {
            await AvahiAdvertiser.avahiInvoke(this.bus, this.path, "EntryGroup", "UpdateServiceTxt", {
                body: [-1, -1, 0, this.accessoryInfo.displayName, "_hap._tcp", "", this.createTxt()],
                signature: "iiusssaay",
            });
        }
        catch (error) {
            console.error("Failed to update avahi advertisement: " + error);
        }
    }
    async destroy() {
        if (!this.bus) {
            throw new Error("Tried to destroy Avahi advertisement on a destroyed advertiser!");
        }
        if (this.path) {
            try {
                await AvahiAdvertiser.avahiInvoke(this.bus, this.path, "EntryGroup", "Free");
            }
            catch (error) {
                // Typically, this fails if e.g. avahi service was stopped in the meantime.
                debug("Destroying Avahi advertisement failed: " + error);
            }
            this.path = undefined;
        }
        if (this.avahiServerInterface) {
            this.avahiServerInterface.removeListener("StateChanged", this.stateChangeHandler);
            this.avahiServerInterface = undefined;
        }
        this.bus.connection.stream.destroy();
        this.bus = undefined;
    }
    static async isAvailable() {
        const bus = dbus_native_1.default.systemBus();
        try {
            try {
                await messageBusConnectionResult(bus);
            }
            catch (error) {
                debug("Avahi/DBus classified unavailable due to missing dbus interface!");
                return false;
            }
            try {
                const version = await this.avahiInvoke(bus, "/", "Server", "GetVersionString");
                debug("Detected Avahi over DBus interface running version '%s'.", version);
            }
            catch (error) {
                debug("Avahi/DBus classified unavailable due to missing avahi interface!");
                return false;
            }
            return true;
        }
        finally {
            bus.connection.stream.destroy();
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static avahiInvoke(bus, path, dbusInterface, member, others) {
        return dbusInvoke(bus, "org.freedesktop.Avahi", path, `org.freedesktop.Avahi.${dbusInterface}`, member, others);
    }
    static avahiInterface(bus, dbusInterface) {
        return new Promise((resolve, reject) => {
            bus
                .getService("org.freedesktop.Avahi")
                .getInterface("/", "org.freedesktop.Avahi." + dbusInterface, (error, iface) => {
                if (error || !iface) {
                    reject(error ?? new Error("Interface not present!"));
                }
                else {
                    resolve(iface);
                }
            });
        });
    }
}
exports.AvahiAdvertiser = AvahiAdvertiser;
const RESOLVED_PERMISSIONS_ERRORS = [
    "org.freedesktop.DBus.Error.AccessDenied",
    "org.freedesktop.DBus.Error.AuthFailed",
    "org.freedesktop.DBus.Error.InteractiveAuthorizationRequired",
];
/**
 * Advertiser based on the systemd-resolved D-Bus library.
 * For docs on the interface, see: https://www.freedesktop.org/software/systemd/man/org.freedesktop.resolve1.html
 *
 * @group Advertiser
 */
class ResolvedAdvertiser extends events_1.EventEmitter {
    accessoryInfo;
    setupHash;
    port;
    bus;
    path;
    constructor(accessoryInfo) {
        super();
        this.accessoryInfo = accessoryInfo;
        this.setupHash = CiaoAdvertiser.computeSetupHash(accessoryInfo);
        this.bus = dbus_native_1.default.systemBus();
        debug(`Preparing Advertiser for '${this.accessoryInfo.displayName}' using systemd-resolved backend!`);
    }
    createTxt() {
        return Object
            .entries(CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash))
            .map((el) => [el[0].toString(), Buffer.from(el[1].toString())]);
    }
    initPort(port) {
        this.port = port;
    }
    async startAdvertising() {
        if (this.port == null) {
            throw new Error("Tried starting systemd-resolved advertisement without initializing port!");
        }
        if (!this.bus) {
            throw new Error("Tried to start systemd-resolved advertisement on a destroyed advertiser!");
        }
        debug(`Starting to advertise '${this.accessoryInfo.displayName}' using systemd-resolved backend!`);
        try {
            this.path = await ResolvedAdvertiser.managerInvoke(this.bus, "RegisterService", {
                body: [
                    this.accessoryInfo.displayName, // name
                    this.accessoryInfo.displayName, // name_template
                    "_hap._tcp", // type
                    this.port, // service_port
                    0, // service_priority
                    0, // service_weight
                    [this.createTxt()], // txt_datas
                ],
                signature: "sssqqqaa{say}",
            });
        }
        catch (error) {
            if (error instanceof DBusInvokeError) {
                if (RESOLVED_PERMISSIONS_ERRORS.includes(error.errorName)) {
                    error.message = `Permissions issue. See https://homebridge.io/w/mDNS-Options for more info. ${error.message}`;
                }
            }
            throw error;
        }
    }
    async updateAdvertisement(silent) {
        if (!this.bus) {
            throw new Error("Tried to update systemd-resolved advertisement on a destroyed advertiser!");
        }
        debug("Updating txt record (txt: %o, silent: %d)", CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash), silent);
        // Currently, systemd-resolved has no way to update an existing record.
        await this.stopAdvertising();
        await this.startAdvertising();
    }
    async stopAdvertising() {
        if (!this.bus) {
            throw new Error("Tried to destroy systemd-resolved advertisement on a destroyed advertiser!");
        }
        if (this.path) {
            try {
                await ResolvedAdvertiser.managerInvoke(this.bus, "UnregisterService", {
                    body: [this.path],
                    signature: "o",
                });
            }
            catch (error) {
                // Typically, this fails if e.g. systemd-resolved service was stopped in the meantime.
                debug("Destroying systemd-resolved advertisement failed: " + error);
            }
            this.path = undefined;
        }
    }
    async destroy() {
        if (!this.bus) {
            throw new Error("Tried to destroy systemd-resolved advertisement on a destroyed advertiser!");
        }
        await this.stopAdvertising();
        this.bus.connection.stream.destroy();
        this.bus = undefined;
    }
    static async isAvailable() {
        const bus = dbus_native_1.default.systemBus();
        try {
            try {
                await messageBusConnectionResult(bus);
            }
            catch (error) {
                debug("systemd-resolved/DBus classified unavailable due to missing dbus interface!");
                return false;
            }
            try {
                // Ensure that systemd-resolved is accessible.
                await this.managerInvoke(bus, "ResolveHostname", {
                    body: [0, "127.0.0.1", 0, 0],
                    signature: "isit",
                });
                debug("Detected systemd-resolved over DBus interface running version.");
            }
            catch (error) {
                debug("systemd-resolved/DBus classified unavailable due to missing systemd-resolved interface!");
                return false;
            }
            try {
                const mdnsStatus = await this.resolvedInvoke(bus, "org.freedesktop.DBus.Properties", "Get", {
                    body: ["org.freedesktop.resolve1.Manager", "MulticastDNS"],
                    signature: "ss",
                });
                if (mdnsStatus[0][0].type !== "s") {
                    throw new Error("Invalid type for MulticastDNS");
                }
                if (mdnsStatus[1][0] !== "yes") {
                    debug("systemd-resolved/DBus classified unavailable because MulticastDNS is not enabled!");
                    return false;
                }
            }
            catch (error) {
                debug("systemd-resolved/DBus classified unavailable due to failure checking system status: " + error);
                return false;
            }
            return true;
        }
        finally {
            bus.connection.stream.destroy();
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static resolvedInvoke(bus, dbusInterface, member, others) {
        return dbusInvoke(bus, "org.freedesktop.resolve1", "/org/freedesktop/resolve1", dbusInterface, member, others);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static managerInvoke(bus, member, others) {
        return this.resolvedInvoke(bus, "org.freedesktop.resolve1.Manager", member, others);
    }
}
exports.ResolvedAdvertiser = ResolvedAdvertiser;
//# sourceMappingURL=Advertiser.js.map