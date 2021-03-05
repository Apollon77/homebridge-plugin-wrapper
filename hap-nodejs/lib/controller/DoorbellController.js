"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoorbellController = void 0;
var tslib_1 = require("tslib");
var Characteristic_1 = require("../Characteristic");
var Service_1 = require("../Service");
var CameraController_1 = require("./CameraController");
var DoorbellController = /** @class */ (function (_super) {
    tslib_1.__extends(DoorbellController, _super);
    function DoorbellController(options) {
        return _super.call(this, options) || this;
    }
    DoorbellController.prototype.ringDoorbell = function () {
        this.doorbellService.updateCharacteristic(Characteristic_1.Characteristic.ProgrammableSwitchEvent, Characteristic_1.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
    };
    DoorbellController.prototype.constructServices = function () {
        this.doorbellService = new Service_1.Service.Doorbell('', '');
        this.doorbellService.setPrimaryService();
        var serviceMap = _super.prototype.constructServices.call(this);
        serviceMap.doorbell = this.doorbellService;
        return serviceMap;
    };
    DoorbellController.prototype.initWithServices = function (serviceMap) {
        var updatedServiceMap = _super.prototype.initWithServices.call(this, serviceMap);
        this.doorbellService = serviceMap.doorbell;
        if (!this.doorbellService) { // see NOTICE above
            this.doorbellService = new Service_1.Service.Doorbell('', '');
            this.doorbellService.setPrimaryService();
            serviceMap.doorbell = this.doorbellService;
            return serviceMap;
        }
        return updatedServiceMap;
    };
    DoorbellController.prototype.migrateFromDoorbell = function (serviceMap) {
        return false;
    };
    DoorbellController.prototype.handleControllerRemoved = function () {
        _super.prototype.handleControllerRemoved.call(this);
        this.doorbellService = undefined;
    };
    DoorbellController.prototype.configureServices = function () {
        _super.prototype.configureServices.call(this);
        this.doorbellService.getCharacteristic(Characteristic_1.Characteristic.ProgrammableSwitchEvent)
            .onGet(function () { return null; }); // a value of null represent nothing is pressed
    };
    return DoorbellController;
}(CameraController_1.CameraController));
exports.DoorbellController = DoorbellController;
//# sourceMappingURL=DoorbellController.js.map