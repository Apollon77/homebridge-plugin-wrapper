"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlManagement = exports.AccessControlEvent = exports.AccessLevel = void 0;
const tslib_1 = require("tslib");
const events_1 = require("events");
const Characteristic_1 = require("../Characteristic");
const Service_1 = require("../Service");
const tlv = tslib_1.__importStar(require("../util/tlv"));
var AccessControlTypes;
(function (AccessControlTypes) {
    AccessControlTypes[AccessControlTypes["PASSWORD"] = 1] = "PASSWORD";
    AccessControlTypes[AccessControlTypes["PASSWORD_REQUIRED"] = 2] = "PASSWORD_REQUIRED";
})(AccessControlTypes || (AccessControlTypes = {}));
/**
 * This defines the Access Level for TVs and Speakers. It is pretty much only used for the AirPlay 2 protocol
 * so this information is not really useful.
 *
 * @group Television
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
})(AccessLevel || (exports.AccessLevel = AccessLevel = {}));
/**
 * @group Television
 */
var AccessControlEvent;
(function (AccessControlEvent) {
    AccessControlEvent["ACCESS_LEVEL_UPDATED"] = "update-control-level";
    AccessControlEvent["PASSWORD_SETTING_UPDATED"] = "update-password";
})(AccessControlEvent || (exports.AccessControlEvent = AccessControlEvent = {}));
/**
 * @group Television
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class AccessControlManagement extends events_1.EventEmitter {
    accessControlService;
    /**
     * The current access level set for the Home
     */
    accessLevel = 0;
    passwordRequired = false;
    password; // undefined if passwordRequired = false
    constructor(password, service) {
        super();
        this.accessControlService = service || new Service_1.Service.AccessControl();
        this.setupServiceHandlers(password);
    }
    /**
     * @returns the AccessControl service
     */
    getService() {
        return this.accessControlService;
    }
    /**
     * @returns the current {@link AccessLevel} configured for the Home
     */
    getAccessLevel() {
        return this.accessLevel;
    }
    /**
     * @returns the current password configured for the Home or `undefined` if no password is required.
     */
    getPassword() {
        return this.passwordRequired ? this.password : undefined;
    }
    /**
     * This destroys the AccessControlManagement.
     * It unregisters all GET or SET handler it has associated with the given AccessControl service.
     * It removes all event handlers which were registered to this object.
     */
    destroy() {
        this.removeAllListeners();
        this.accessControlService.getCharacteristic(Characteristic_1.Characteristic.AccessControlLevel).removeOnSet();
        if (this.accessControlService.testCharacteristic(Characteristic_1.Characteristic.PasswordSetting)) {
            this.accessControlService.getCharacteristic(Characteristic_1.Characteristic.PasswordSetting).removeOnSet();
        }
    }
    handleAccessLevelChange(value) {
        this.accessLevel = value;
        setTimeout(() => {
            this.emit("update-control-level" /* AccessControlEvent.ACCESS_LEVEL_UPDATED */, this.accessLevel);
        }, 0).unref();
    }
    handlePasswordChange(value) {
        const data = Buffer.from(value, "base64");
        const objects = tlv.decode(data);
        if (objects[1 /* AccessControlTypes.PASSWORD */]) {
            this.password = objects[1 /* AccessControlTypes.PASSWORD */].toString("utf8");
        }
        else {
            this.password = undefined;
        }
        this.passwordRequired = !!objects[2 /* AccessControlTypes.PASSWORD_REQUIRED */][0];
        setTimeout(() => {
            this.emit("update-password" /* AccessControlEvent.PASSWORD_SETTING_UPDATED */, this.password, this.passwordRequired);
        }, 0).unref();
    }
    setupServiceHandlers(enabledPasswordCharacteristics) {
        // perms: [Perms.NOTIFY, Perms.PAIRED_READ, Perms.PAIRED_WRITE],
        this.accessControlService.getCharacteristic(Characteristic_1.Characteristic.AccessControlLevel)
            .onSet(value => this.handleAccessLevelChange(value))
            .updateValue(0);
        if (enabledPasswordCharacteristics) {
            this.accessControlService.getCharacteristic(Characteristic_1.Characteristic.PasswordSetting)
                .onSet(value => this.handlePasswordChange(value))
                .updateValue("");
        }
    }
}
exports.AccessControlManagement = AccessControlManagement;
//# sourceMappingURL=AccessControlManagement.js.map