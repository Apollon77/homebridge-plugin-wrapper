"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoorbellController = void 0;
const Characteristic_1 = require("../Characteristic");
const Service_1 = require("../Service");
const CameraController_1 = require("./CameraController");
/**
 * The `DoorbellController` to efficiently manage doorbell implementations with HAP-NodeJS.
 *
 * NOTICE: We subclass from the {@link CameraController} here and deliberately do not introduce/set an
 * own/custom ControllerType for Doorbells, as Cameras and Doorbells are pretty much the same thing
 * and would collide otherwise.
 * As the possibility exists, both the CameraController and DoorbellController are written to support migration
 * from one to another. Meaning a serialized CameraController can be initialized as a DoorbellController
 * (on startup in {@link Controller.initWithServices}) and vice versa.
 *
 * @group Doorbell
 */
class DoorbellController extends CameraController_1.CameraController {
    doorbellService;
    doorbellServiceExternallySupplied = false;
    /**
     * Temporary storage. Erased after init.
     */
    doorbellOptions;
    /**
     * Initializes a new `DoorbellController`.
     * @param options - The {@link CameraControllerOptions} and optional {@link DoorbellOptions}.
     */
    constructor(options) {
        super(options);
        this.doorbellOptions = {
            name: options.name,
            externalDoorbellService: options.externalDoorbellService,
        };
    }
    /**
     * Call this method to signal a doorbell button press.
     */
    ringDoorbell() {
        this.doorbellService.updateCharacteristic(Characteristic_1.Characteristic.ProgrammableSwitchEvent, Characteristic_1.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
    }
    constructServices() {
        if (this.doorbellOptions?.externalDoorbellService) {
            this.doorbellService = this.doorbellOptions.externalDoorbellService;
            this.doorbellServiceExternallySupplied = true;
        }
        else {
            this.doorbellService = new Service_1.Service.Doorbell(this.doorbellOptions?.name ?? "", "");
        }
        this.doorbellService.setPrimaryService();
        const serviceMap = super.constructServices();
        if (!this.doorbellServiceExternallySupplied) {
            serviceMap.doorbell = this.doorbellService;
        }
        return serviceMap;
    }
    initWithServices(serviceMap) {
        const result = super._initWithServices(serviceMap);
        if (this.doorbellOptions?.externalDoorbellService) {
            this.doorbellService = this.doorbellOptions.externalDoorbellService;
            this.doorbellServiceExternallySupplied = true;
            if (result.serviceMap.doorbell) {
                delete result.serviceMap.doorbell;
                result.updated = true;
            }
        }
        else {
            this.doorbellService = result.serviceMap.doorbell;
            if (!this.doorbellService) { // see NOTICE above
                this.doorbellService = new Service_1.Service.Doorbell(this.doorbellOptions?.name ?? "", "");
                result.serviceMap.doorbell = this.doorbellService;
                result.updated = true;
            }
        }
        this.doorbellService.setPrimaryService();
        if (result.updated) {
            return result.serviceMap;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    migrateFromDoorbell(serviceMap) {
        return false;
    }
    retrieveEventTriggerOptions() {
        const result = super.retrieveEventTriggerOptions();
        result.add(2 /* EventTriggerOption.DOORBELL */);
        return result;
    }
    handleControllerRemoved() {
        super.handleControllerRemoved();
        this.doorbellService = undefined;
    }
    configureServices() {
        super.configureServices();
        this.doorbellService.getCharacteristic(Characteristic_1.Characteristic.ProgrammableSwitchEvent)
            .onGet(() => null); // a value of null represent nothing is pressed
        this.doorbellOptions = undefined;
    }
}
exports.DoorbellController = DoorbellController;
//# sourceMappingURL=DoorbellController.js.map