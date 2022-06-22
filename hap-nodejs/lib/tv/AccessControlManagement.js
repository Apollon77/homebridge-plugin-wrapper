"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlManagement = exports.AccessControlEvent = exports.AccessLevel = void 0;
var tslib_1 = require("tslib");
var events_1 = require("events");
var Characteristic_1 = require("../Characteristic");
var Service_1 = require("../Service");
var tlv = (0, tslib_1.__importStar)(require("../util/tlv"));
var AccessControlTypes;
(function (AccessControlTypes) {
    AccessControlTypes[AccessControlTypes["PASSWORD"] = 1] = "PASSWORD";
    AccessControlTypes[AccessControlTypes["PASSWORD_REQUIRED"] = 2] = "PASSWORD_REQUIRED";
})(AccessControlTypes || (AccessControlTypes = {}));
/**
 * This defines the Access Level for TVs and Speakers. It is pretty much only used for the AirPlay 2 protocol
 * so this information is not really useful.
 */
var AccessLevel;
(function (AccessLevel) {
    // noinspection JSUnusedGlobalSymbols
    /**
     * This access level is set when the users selects "Anyone" or "Anyone On The Same Network"
     * in the Access Control settings.
     */
    AccessLevel[AccessLevel["ANYONE"] = 0] = "ANYONE";
    /**
     * This access level is set when the users selects "Only People Sharing this Home" in the
     * Access Control settings.
     * On this level password setting is ignored.
     * Requests to the HAPServer can only come from Home members anyways, so there is no real use to it.
     * This is pretty much only used for the AirPlay 2 protocol.
     */
    AccessLevel[AccessLevel["HOME_MEMBERS_ONLY"] = 1] = "HOME_MEMBERS_ONLY";
    // 2 seems to be also a valid value in the range, but never encountered it.
    // so don't know what's the use of it.
})(AccessLevel = exports.AccessLevel || (exports.AccessLevel = {}));
var AccessControlEvent;
(function (AccessControlEvent) {
    AccessControlEvent["ACCESS_LEVEL_UPDATED"] = "update-control-level";
    AccessControlEvent["PASSWORD_SETTING_UPDATED"] = "update-password";
})(AccessControlEvent = exports.AccessControlEvent || (exports.AccessControlEvent = {}));
var AccessControlManagement = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(AccessControlManagement, _super);
    function AccessControlManagement(password, service) {
        var _this = _super.call(this) || this;
        /**
         * The current access level set for the Home
         */
        _this.accessLevel = 0;
        _this.passwordRequired = false;
        _this.accessControlService = service || new Service_1.Service.AccessControl();
        _this.setupServiceHandlers(password);
        return _this;
    }
    /**
     * @returns the AccessControl service
     */
    AccessControlManagement.prototype.getService = function () {
        return this.accessControlService;
    };
    /**
     * @returns the current {@link AccessLevel} configured for the Home
     */
    AccessControlManagement.prototype.getAccessLevel = function () {
        return this.accessLevel;
    };
    /**
     * @returns the current password configured for the Home or `undefined` if no password is required.
     */
    AccessControlManagement.prototype.getPassword = function () {
        return this.passwordRequired ? this.password : undefined;
    };
    /**
     * This destroys the AccessControlManagement.
     * It unregisters all GET or SET handler it has associated with the given AccessControl service.
     * It removes all event handlers which were registered to this object.
     */
    AccessControlManagement.prototype.destroy = function () {
        this.removeAllListeners();
        this.accessControlService.getCharacteristic(Characteristic_1.Characteristic.AccessControlLevel).removeOnSet();
        if (this.accessControlService.testCharacteristic(Characteristic_1.Characteristic.PasswordSetting)) {
            this.accessControlService.getCharacteristic(Characteristic_1.Characteristic.PasswordSetting).removeOnSet();
        }
    };
    AccessControlManagement.prototype.handleAccessLevelChange = function (value) {
        var _this = this;
        this.accessLevel = value;
        setTimeout(function () {
            _this.emit("update-control-level" /* ACCESS_LEVEL_UPDATED */, _this.accessLevel);
        }, 0).unref();
    };
    AccessControlManagement.prototype.handlePasswordChange = function (value) {
        var _this = this;
        var data = Buffer.from(value, "base64");
        var objects = tlv.decode(data);
        if (objects[1 /* PASSWORD */]) {
            this.password = objects[1 /* PASSWORD */].toString("utf8");
        }
        else {
            this.password = undefined;
        }
        this.passwordRequired = !!objects[2 /* PASSWORD_REQUIRED */][0];
        setTimeout(function () {
            _this.emit("update-password" /* PASSWORD_SETTING_UPDATED */, _this.password, _this.passwordRequired);
        }, 0).unref();
    };
    AccessControlManagement.prototype.setupServiceHandlers = function (enabledPasswordCharacteristics) {
        // perms: [Perms.NOTIFY, Perms.PAIRED_READ, Perms.PAIRED_WRITE],
        var _this = this;
        this.accessControlService.getCharacteristic(Characteristic_1.Characteristic.AccessControlLevel)
            .onSet(function (value) { return _this.handleAccessLevelChange(value); })
            .updateValue(0);
        if (enabledPasswordCharacteristics) {
            this.accessControlService.getCharacteristic(Characteristic_1.Characteristic.PasswordSetting)
                .onSet(function (value) { return _this.handlePasswordChange(value); })
                .updateValue("");
        }
    };
    return AccessControlManagement;
}(events_1.EventEmitter));
exports.AccessControlManagement = AccessControlManagement;
//# sourceMappingURL=AccessControlManagement.js.map