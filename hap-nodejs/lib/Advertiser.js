"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonjourHAPAdvertiser = exports.CiaoAdvertiser = exports.AdvertiserEvent = exports.PairingFeatureFlag = exports.StatusFlag = void 0;
var tslib_1 = require("tslib");
/// <reference path="../../@types/bonjour-hap.d.ts" />
var ciao_1 = tslib_1.__importDefault(require("@homebridge/ciao"));
var assert_1 = tslib_1.__importDefault(require("assert"));
var bonjour_hap_1 = tslib_1.__importDefault(require("bonjour-hap"));
var crypto_1 = tslib_1.__importDefault(require("crypto"));
var events_1 = require("events");
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
    tslib_1.__extends(CiaoAdvertiser, _super);
    function CiaoAdvertiser(accessoryInfo, responderOptions, serviceOptions) {
        var _this = _super.call(this) || this;
        _this.accessoryInfo = accessoryInfo;
        _this.setupHash = CiaoAdvertiser.computeSetupHash(accessoryInfo);
        _this.responder = ciao_1.default.getResponder(tslib_1.__assign({}, responderOptions));
        _this.advertisedService = _this.responder.createService(tslib_1.__assign({ name: _this.accessoryInfo.displayName, type: "hap" /* HAP */, txt: CiaoAdvertiser.createTxt(accessoryInfo, _this.setupHash) }, serviceOptions));
        _this.advertisedService.on("name-change" /* NAME_CHANGED */, _this.emit.bind(_this, "updated-name" /* UPDATED_NAME */));
        console.log("Preparing Advertiser for '" + _this.accessoryInfo.displayName + "' using ciao backend!");
        return _this;
    }
    CiaoAdvertiser.prototype.initPort = function (port) {
        this.advertisedService.updatePort(port);
    };
    CiaoAdvertiser.prototype.startAdvertising = function () {
        console.log("Starting to advertise '" + this.accessoryInfo.displayName + "' using ciao backend!");
        return this.advertisedService.advertise();
    };
    CiaoAdvertiser.prototype.updateAdvertisement = function (silent) {
        this.advertisedService.updateTxt(CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash), silent);
    };
    CiaoAdvertiser.prototype.destroy = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.advertisedService.destroy()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.responder.shutdown()];
                    case 2:
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
            sf: CiaoAdvertiser.sf.apply(CiaoAdvertiser, tslib_1.__spread(statusFlags)),
            ci: accessoryInfo.category,
            sh: setupHash,
        };
    };
    CiaoAdvertiser.computeSetupHash = function (accessoryInfo) {
        var hash = crypto_1.default.createHash('sha512');
        hash.update(accessoryInfo.setupID + accessoryInfo.username.toUpperCase());
        return hash.digest().slice(0, 4).toString('base64');
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
    tslib_1.__extends(BonjourHAPAdvertiser, _super);
    function BonjourHAPAdvertiser(accessoryInfo, responderOptions, serviceOptions) {
        var _this = _super.call(this) || this;
        _this.destroyed = false;
        _this.accessoryInfo = accessoryInfo;
        _this.setupHash = CiaoAdvertiser.computeSetupHash(accessoryInfo);
        _this.serviceOptions = serviceOptions;
        _this.bonjour = bonjour_hap_1.default(responderOptions);
        console.log("Preparing Advertiser for '" + _this.accessoryInfo.displayName + "' using bonjour-hap backend!");
        return _this;
    }
    BonjourHAPAdvertiser.prototype.initPort = function (port) {
        this.port = port;
    };
    BonjourHAPAdvertiser.prototype.startAdvertising = function () {
        assert_1.default(!this.destroyed, "Can't advertise on a destroyed bonjour instance!");
        if (this.port == undefined) {
            throw new Error("Tried starting bonjour-hap advertisement without initializing port!");
        }
        console.log("Starting to advertise '" + this.accessoryInfo.displayName + "' using bonjour-hap backend!");
        if (this.advertisement) {
            this.destroy();
        }
        var hostname = this.accessoryInfo.username.replace(/:/ig, "_") + '.local';
        this.advertisement = this.bonjour.publish(tslib_1.__assign({ name: this.accessoryInfo.displayName, type: "hap", port: this.port, txt: CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash), host: hostname, addUnsafeServiceEnumerationRecord: true }, this.serviceOptions));
    };
    BonjourHAPAdvertiser.prototype.updateAdvertisement = function (silent) {
        if (this.advertisement) {
            this.advertisement.updateTxt(CiaoAdvertiser.createTxt(this.accessoryInfo, this.setupHash), silent);
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
//# sourceMappingURL=Advertiser.js.map