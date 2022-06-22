"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvahiAdvertiser = exports.BonjourHAPAdvertiser = exports.CiaoAdvertiser = exports.AdvertiserEvent = exports.PairingFeatureFlag = exports.StatusFlag = void 0;
var tslib_1 = require("tslib");
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../@types/bonjour-hap.d.ts" />
var ciao_1 = (0, tslib_1.__importDefault)(require("@homebridge/ciao"));
var assert_1 = (0, tslib_1.__importDefault)(require("assert"));
var bonjour_hap_1 = (0, tslib_1.__importDefault)(require("bonjour-hap"));
var crypto_1 = (0, tslib_1.__importDefault)(require("crypto"));
var debug_1 = (0, tslib_1.__importDefault)(require("debug"));
var dbus_native_1 = (0, tslib_1.__importDefault)(require("@homebridge/dbus-native"));
var events_1 = require("events");
var promise_utils_1 = require("./util/promise-utils");
var debug = (0, debug_1.default)("HAP-NodeJS:Advertiser");
/**
 * This enum lists all bitmasks for all known status flags.
 * When the bit for the given bitmask is set, it represents the state described by the name.
 */
var StatusFlag;
(function (StatusFlag) {
    StatusFlag[StatusFlag["NOT_PAIRED"] = 1] = "NOT_PAIRED";
    StatusFlag[StatusFlag["NOT_JOINED_WIFI"] = 2] = "NOT_JOINED_WIFI";
    StatusFlag[StatusFlag["PROBLEM_DETECTED"] = 4] = "PROBLEM_DETECTED";
})(StatusFlag = exports.StatusFlag || (exports.StatusFlag = {}));
/**
 * This enum lists all bitmasks for all known pairing feature flags.
 * When the bit for the given bitmask is set, it represents the state described by the name.
 */
var PairingFeatureFlag;
(function (PairingFeatureFlag) {
    PairingFeatureFlag[PairingFeatureFlag["SUPPORTS_HARDWARE_AUTHENTICATION"] = 1] = "SUPPORTS_HARDWARE_AUTHENTICATION";
    PairingFeatureFlag[PairingFeatureFlag["SUPPORTS_SOFTWARE_AUTHENTICATION"] = 2] = "SUPPORTS_SOFTWARE_AUTHENTICATION";
})(PairingFeatureFlag = exports.PairingFeatureFlag || (exports.PairingFeatureFlag = {}));
var AdvertiserEvent;
(function (AdvertiserEvent) {
    AdvertiserEvent["UPDATED_NAME"] = "updated-name";
})(AdvertiserEvent = exports.AdvertiserEvent || (exports.AdvertiserEvent = {}));
/**
 * Advertiser uses mdns to broadcast the presence of an Accessory to the local network.
 *
 * Note that as of iOS 9, an accessory can only pair with a single client. Instead of pairing your
 * accessories with multiple iOS devices in your home, Apple intends for you to use Home Sharing.
 * To support this requirement, we provide the ability to be "discoverable" or not (via a "service flag" on the
 * mdns payload).
 */
var CiaoAdvertiser = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(CiaoAdvertiser, _super);
    function CiaoAdvertiser(accessoryInfo, responderOptions, serviceOptions) {
        var _this = _super.call(this) || this;
        _this.accessoryInfo = accessoryInfo;
        _this.setupHash = CiaoAdvertiser.computeSetupHash(accessoryInfo);
        _this.responder = ciao_1.default.getResponder((0, tslib_1.__assign)({}, responderOptions));
        _this.advertisedService = _this.responder.createService((0, tslib_1.__assign)({ name: _this.accessoryInfo.displayName, type: "hap" /* HAP */, txt: CiaoAdvertiser.createTxt(accessoryInfo, _this.setupHash) }, serviceOptions));
        _this.advertisedService.on("name-change" /* NAME_CHANGED */, _this.emit.bind(_this, "updated-name" /* UPDATED_NAME */));
        debug("Preparing Advertiser for '".concat(_this.accessoryInfo.displayName, "' using ciao backend!"));
        return _this;
    }
    CiaoAdvertiser.prototype.initPort = function (port) {
        this.advertisedService.updatePort(port);
    };
    CiaoAdvertiser.prototype.startAdvertising = function () {
        debug("Starting to advertise '".concat(this.accessoryInfo.displayName, "' using ciao backend!"));
        return this.advertisedService.advertise();
    };
    CiaoAdvertiser.prototype.updateAdvertisement = function (silent) {
        var txt = CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash);
        debug("Updating txt record (txt: %o, silent: %d)", txt, silent);
        this.advertisedService.updateTxt(txt, silent);
    };
    CiaoAdvertiser.prototype.destroy = function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // advertisedService.destroy(); is called implicitly via the shutdown call
                    return [4 /*yield*/, this.responder.shutdown()];
                    case 1:
                        // advertisedService.destroy(); is called implicitly via the shutdown call
                        _a.sent();
                        this.removeAllListeners();
                        return [2 /*return*/];
                }
            });
        });
    };
    CiaoAdvertiser.createTxt = function (accessoryInfo, setupHash) {
        var statusFlags = [];
        if (!accessoryInfo.paired()) {
            statusFlags.push(1 /* NOT_PAIRED */);
        }
        return {
            "c#": accessoryInfo.getConfigVersion(),
            ff: CiaoAdvertiser.ff(),
            id: accessoryInfo.username,
            md: accessoryInfo.model,
            pv: CiaoAdvertiser.protocolVersion,
            "s#": 1,
            sf: CiaoAdvertiser.sf.apply(CiaoAdvertiser, (0, tslib_1.__spreadArray)([], (0, tslib_1.__read)(statusFlags), false)),
            ci: accessoryInfo.category,
            sh: setupHash,
        };
    };
    CiaoAdvertiser.computeSetupHash = function (accessoryInfo) {
        var hash = crypto_1.default.createHash("sha512");
        hash.update(accessoryInfo.setupID + accessoryInfo.username.toUpperCase());
        return hash.digest().slice(0, 4).toString("base64");
    };
    CiaoAdvertiser.ff = function () {
        var flags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            flags[_i] = arguments[_i];
        }
        var value = 0;
        flags.forEach(function (flag) { return value |= flag; });
        return value;
    };
    CiaoAdvertiser.sf = function () {
        var flags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            flags[_i] = arguments[_i];
        }
        var value = 0;
        flags.forEach(function (flag) { return value |= flag; });
        return value;
    };
    CiaoAdvertiser.protocolVersion = "1.1";
    CiaoAdvertiser.protocolVersionService = "1.1.0";
    return CiaoAdvertiser;
}(events_1.EventEmitter));
exports.CiaoAdvertiser = CiaoAdvertiser;
/**
 * Advertiser base on the legacy "bonjour-hap" library.
 */
var BonjourHAPAdvertiser = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(BonjourHAPAdvertiser, _super);
    function BonjourHAPAdvertiser(accessoryInfo, responderOptions, serviceOptions) {
        var _this = _super.call(this) || this;
        _this.destroyed = false;
        _this.accessoryInfo = accessoryInfo;
        _this.setupHash = CiaoAdvertiser.computeSetupHash(accessoryInfo);
        _this.serviceOptions = serviceOptions;
        _this.bonjour = (0, bonjour_hap_1.default)(responderOptions);
        debug("Preparing Advertiser for '".concat(_this.accessoryInfo.displayName, "' using bonjour-hap backend!"));
        return _this;
    }
    BonjourHAPAdvertiser.prototype.initPort = function (port) {
        this.port = port;
    };
    BonjourHAPAdvertiser.prototype.startAdvertising = function () {
        (0, assert_1.default)(!this.destroyed, "Can't advertise on a destroyed bonjour instance!");
        if (this.port == null) {
            throw new Error("Tried starting bonjour-hap advertisement without initializing port!");
        }
        debug("Starting to advertise '".concat(this.accessoryInfo.displayName, "' using bonjour-hap backend!"));
        if (this.advertisement) {
            this.destroy();
        }
        var hostname = this.accessoryInfo.username.replace(/:/ig, "_") + ".local";
        this.advertisement = this.bonjour.publish((0, tslib_1.__assign)({ name: this.accessoryInfo.displayName, type: "hap", port: this.port, txt: CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash), host: hostname, addUnsafeServiceEnumerationRecord: true }, this.serviceOptions));
        return (0, promise_utils_1.PromiseTimeout)(1);
    };
    BonjourHAPAdvertiser.prototype.updateAdvertisement = function (silent) {
        var txt = CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash);
        debug("Updating txt record (txt: %o, silent: %d)", txt, silent);
        if (this.advertisement) {
            this.advertisement.updateTxt(txt, silent);
        }
    };
    BonjourHAPAdvertiser.prototype.destroy = function () {
        var _this = this;
        if (this.advertisement) {
            this.advertisement.stop(function () {
                _this.advertisement.destroy();
                _this.advertisement = undefined;
                _this.bonjour.destroy();
            });
        }
        else {
            this.bonjour.destroy();
        }
    };
    return BonjourHAPAdvertiser;
}(events_1.EventEmitter));
exports.BonjourHAPAdvertiser = BonjourHAPAdvertiser;
/**
 * Advertiser based on the Avahi D-Bus library.
 * For (very crappy) docs on the interface, see the XML files at: https://github.com/lathiat/avahi/tree/master/avahi-daemon.
 */
var AvahiAdvertiser = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(AvahiAdvertiser, _super);
    function AvahiAdvertiser(accessoryInfo) {
        var _this = _super.call(this) || this;
        _this.accessoryInfo = accessoryInfo;
        _this.setupHash = CiaoAdvertiser.computeSetupHash(accessoryInfo);
        _this.bus = dbus_native_1.default.systemBus();
        debug("Preparing Advertiser for '".concat(_this.accessoryInfo.displayName, "' using Avahi backend!"));
        return _this;
    }
    AvahiAdvertiser.prototype.createTxt = function () {
        return Object
            .entries(CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash))
            .map(function (el) { return Buffer.from(el[0] + "=" + el[1]); });
    };
    AvahiAdvertiser.prototype.initPort = function (port) {
        this.port = port;
    };
    AvahiAdvertiser.prototype.startAdvertising = function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var _a;
            return (0, tslib_1.__generator)(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.port == null) {
                            throw new Error("Tried starting Avahi advertisement without initializing port!");
                        }
                        if (!this.bus) {
                            throw new Error("Tried to start Avahi advertisement on a destroyed advertiser!");
                        }
                        debug("Starting to advertise '".concat(this.accessoryInfo.displayName, "' using Avahi backend!"));
                        _a = this;
                        return [4 /*yield*/, AvahiAdvertiser.avahiInvoke(this.bus, "/", "Server", "EntryGroupNew")];
                    case 1:
                        _a.path = (_b.sent());
                        return [4 /*yield*/, AvahiAdvertiser.avahiInvoke(this.bus, this.path, "EntryGroup", "AddService", {
                                body: [
                                    -1,
                                    -1,
                                    0,
                                    this.accessoryInfo.displayName,
                                    "_hap._tcp",
                                    "",
                                    "",
                                    this.port,
                                    this.createTxt(), // txt
                                ],
                                signature: "iiussssqaay",
                            })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, AvahiAdvertiser.avahiInvoke(this.bus, this.path, "EntryGroup", "Commit")];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AvahiAdvertiser.prototype.updateAdvertisement = function (silent) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var error_1;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.bus) {
                            throw new Error("Tried to update Avahi advertisement on a destroyed advertiser!");
                        }
                        if (!this.path) {
                            debug("Tried to update advertisement without a valid `path`!");
                            return [2 /*return*/];
                        }
                        debug("Updating txt record (txt: %o, silent: %d)", CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash), silent);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, AvahiAdvertiser.avahiInvoke(this.bus, this.path, "EntryGroup", "UpdateServiceTxt", {
                                body: [-1, -1, 0, this.accessoryInfo.displayName, "_hap._tcp", "", this.createTxt()],
                                signature: "iiusssaay",
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Failed to update avahi advertisement: " + error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AvahiAdvertiser.prototype.destroy = function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var error_2;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.bus) {
                            throw new Error("Tried to destroy Avahi advertisement on a destroyed advertiser!");
                        }
                        if (!this.path) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, AvahiAdvertiser.avahiInvoke(this.bus, this.path, "EntryGroup", "Free")];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        // Typically, this fails if e.g. avahi service was stopped in the meantime.
                        debug("Destroying Avahi advertisement failed: " + error_2);
                        return [3 /*break*/, 4];
                    case 4:
                        this.path = undefined;
                        _a.label = 5;
                    case 5:
                        this.bus.connection.stream.destroy();
                        this.bus = undefined;
                        return [2 /*return*/];
                }
            });
        });
    };
    AvahiAdvertiser.isAvailable = function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var bus, error_3, version, error_4;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bus = dbus_native_1.default.systemBus();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 9, 10]);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.messageBusConnectionResult(bus)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        debug("Avahi/DBus classified unavailable due to missing dbus interface!");
                        return [2 /*return*/, false];
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.avahiInvoke(bus, "/", "Server", "GetVersionString")];
                    case 6:
                        version = _a.sent();
                        debug("Detected Avahi over DBus interface running version '%s'.", version);
                        return [3 /*break*/, 8];
                    case 7:
                        error_4 = _a.sent();
                        debug("Avahi/DBus classified unavailable due to missing avahi interface!");
                        return [2 /*return*/, false];
                    case 8: return [2 /*return*/, true];
                    case 9:
                        bus.connection.stream.destroy();
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    AvahiAdvertiser.messageBusConnectionResult = function (bus) {
        return new Promise(function (resolve, reject) {
            var errorHandler = function (error) {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                bus.connection.removeListener("connect", connectHandler);
                reject(error);
            };
            var connectHandler = function () {
                bus.connection.removeListener("error", errorHandler);
                resolve();
            };
            bus.connection.once("connect", connectHandler);
            bus.connection.once("error", errorHandler);
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AvahiAdvertiser.avahiInvoke = function (bus, path, dbusInterface, member, others) {
        return new Promise(function (resolve, reject) {
            var command = (0, tslib_1.__assign)({ destination: "org.freedesktop.Avahi", path: path, interface: "org.freedesktop.Avahi." + dbusInterface, member: member }, (others || {}));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            bus.invoke(command, function (err, result) {
                if (err) {
                    reject(new Error("avahiInvoke error: ".concat(JSON.stringify(err))));
                }
                else {
                    resolve(result);
                }
            });
        });
    };
    return AvahiAdvertiser;
}(events_1.EventEmitter));
exports.AvahiAdvertiser = AvahiAdvertiser;
//# sourceMappingURL=Advertiser.js.map