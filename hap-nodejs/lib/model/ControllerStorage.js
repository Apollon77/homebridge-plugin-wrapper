"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerStorage = void 0;
const tslib_1 = require("tslib");
const util_1 = tslib_1.__importDefault(require("util"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const HAPStorage_1 = require("./HAPStorage");
const debug = (0, debug_1.default)("HAP-NodeJS:ControllerStorage");
const hksvDebug = (0, debug_1.default)("HAP-NodeJS:HKSV");
/**
 * @group Model
 */
class ControllerStorage {
    accessoryUUID;
    initialized = false;
    // ----- properties only set in parent storage object ------
    username;
    fileCreated = false;
    purgeUnidentifiedAccessoryData = true;
    // ---------------------------------------------------------
    trackedControllers = []; // used to track controllers before data was loaded from disk
    controllerData = {};
    restoredAccessories; // indexed by accessory UUID
    parent;
    linkedAccessories;
    queuedSaveTimeout;
    queuedSaveTime;
    constructor(accessory) {
        this.accessoryUUID = accessory.UUID;
    }
    enqueueSaveRequest(timeout = 0) {
        if (this.parent) {
            this.parent.enqueueSaveRequest(timeout);
            return;
        }
        const plannedTime = Date.now() + timeout;
        if (this.queuedSaveTimeout) {
            if (plannedTime <= (this.queuedSaveTime ?? 0)) {
                return;
            }
            clearTimeout(this.queuedSaveTimeout);
        }
        this.queuedSaveTimeout = setTimeout(() => {
            this.queuedSaveTimeout = this.queuedSaveTime = undefined;
            this.save();
        }, timeout).unref();
        this.queuedSaveTime = Date.now() + timeout;
    }
    /**
     * Links a bridged accessory to the ControllerStorage of the bridge accessory.
     *
     * @param accessory
     */
    linkAccessory(accessory) {
        if (!this.linkedAccessories) {
            this.linkedAccessories = [];
        }
        const storage = accessory.controllerStorage;
        this.linkedAccessories.push(storage);
        storage.parent = this;
        const saved = this.restoredAccessories && this.restoredAccessories[accessory.UUID];
        if (this.initialized) {
            storage.init(saved);
        }
    }
    trackController(controller) {
        controller.setupStateChangeDelegate(this.handleStateChange.bind(this, controller)); // setup delegate
        hksvDebug("trackController acc=%s ctrl=%s initialized=%s", this.accessoryUUID, controller.controllerId(), this.initialized);
        if (!this.initialized) { // track controller if data isn't loaded yet
            this.trackedControllers.push(controller);
        }
        else {
            this.restoreController(controller);
        }
    }
    untrackController(controller) {
        const index = this.trackedControllers.indexOf(controller);
        if (index !== -1) { // remove from trackedControllers if storage wasn't initialized yet
            this.trackedControllers.splice(index, 1);
        }
        controller.setupStateChangeDelegate(undefined); // remove association with this storage object
        this.purgeControllerData(controller);
    }
    purgeControllerData(controller) {
        delete this.controllerData[controller.controllerId()];
        if (this.initialized) {
            this.enqueueSaveRequest(100);
        }
    }
    handleStateChange(controller) {
        const id = controller.controllerId();
        const serialized = controller.serialize();
        hksvDebug("handleStateChange acc=%s ctrl=%s hasSerialized=%s initialized=%s hasParent=%s", this.accessoryUUID, id, !!serialized, this.initialized, !!this.parent);
        if (!serialized) { // can be undefined when controller wishes to delete data
            delete this.controllerData[id];
        }
        else {
            const controllerData = this.controllerData[id];
            if (!controllerData) {
                this.controllerData[id] = {
                    data: serialized,
                };
            }
            else {
                controllerData.data = serialized;
            }
        }
        if (this.initialized) { // only save if data was loaded
            // run save data "async", as handleStateChange call will probably always be caused by a http request
            // this should improve our response time
            this.enqueueSaveRequest(100);
        }
        else {
            hksvDebug("handleStateChange acc=%s: not enqueuing save — storage not yet initialized", this.accessoryUUID);
        }
    }
    restoreController(controller) {
        if (!this.initialized) {
            throw new Error("Illegal state. Controller data wasn't loaded yet!");
        }
        const controllerData = this.controllerData[controller.controllerId()];
        hksvDebug("restoreController acc=%s ctrl=%s hasStoredData=%s", this.accessoryUUID, controller.controllerId(), !!controllerData);
        if (controllerData) {
            try {
                controller.deserialize(controllerData.data);
            }
            catch (error) {
                console.warn(`Could not initialize controller of type '${controller.controllerId()}' from data stored on disk. Resetting to default: ${error.stack}`);
                controller.handleFactoryReset();
            }
            controllerData.purgeOnNextLoad = undefined;
        }
    }
    /**
     * Called when this particular Storage object is feed with data loaded from disk.
     * This method is only called once.
     *
     * @param data - array of {@link StoredControllerData}. undefined if nothing was stored on disk for this particular storage object
     */
    init(data) {
        if (this.initialized) {
            throw new Error(`ControllerStorage for accessory ${this.accessoryUUID} was already initialized!`);
        }
        this.initialized = true;
        // storing data into our local controllerData Record
        if (data) {
            data.forEach(saved => this.controllerData[saved.type] = saved.controllerData);
        }
        const restoredControllers = [];
        this.trackedControllers.forEach(controller => {
            this.restoreController(controller);
            restoredControllers.push(controller.controllerId());
        });
        this.trackedControllers.splice(0, this.trackedControllers.length); // clear tracking list
        let purgedData = false;
        Object.entries(this.controllerData).forEach(([id, data]) => {
            if (data.purgeOnNextLoad) {
                delete this.controllerData[id];
                purgedData = true;
                return;
            }
            if (!restoredControllers.includes(id)) {
                data.purgeOnNextLoad = true;
            }
        });
        if (purgedData) {
            this.enqueueSaveRequest(500);
        }
    }
    load(username) {
        if (this.username) {
            throw new Error("ControllerStorage was already loaded!");
        }
        this.username = username;
        const key = ControllerStorage.persistKey(username);
        const saved = HAPStorage_1.HAPStorage.storage().getItem(key);
        let ownData;
        if (saved) {
            this.fileCreated = true;
            ownData = saved.accessories[this.accessoryUUID];
            delete saved.accessories[this.accessoryUUID];
        }
        hksvDebug("load username=%s key=%s fileExisted=%s thisAcc=%s ownEntries=%s otherAccsInFile=%j", username, key, !!saved, this.accessoryUUID, ownData ? ownData.length : "none", saved ? Object.keys(saved.accessories) : []);
        this.init(ownData);
        if (this.linkedAccessories) {
            this.linkedAccessories.forEach(linkedStorage => {
                const savedData = saved && saved.accessories[linkedStorage.accessoryUUID];
                linkedStorage.init(savedData);
                if (saved) {
                    delete saved.accessories[linkedStorage.accessoryUUID];
                }
            });
        }
        if (saved && Object.keys(saved.accessories).length > 0) {
            if (!this.purgeUnidentifiedAccessoryData) {
                this.restoredAccessories = saved.accessories; // save data for controllers which aren't linked yet
            }
            else {
                debug("Purging unidentified controller data for bridge %s", username);
            }
        }
    }
    save() {
        if (this.parent) {
            this.parent.save();
            return;
        }
        if (!this.initialized) {
            throw new Error("ControllerStorage has not yet been loaded!");
        }
        if (!this.username) {
            throw new Error("Cannot save controllerData for a storage without a username!");
        }
        const accessories = {
            [this.accessoryUUID]: this.controllerData,
        };
        if (this.linkedAccessories) { // grab data from all linked storage objects
            this.linkedAccessories.forEach(accessory => accessories[accessory.accessoryUUID] = accessory.controllerData);
        }
        // TODO removed accessories won't ever be deleted?
        const accessoryData = this.restoredAccessories || {};
        Object.entries(accessories).forEach(([uuid, controllerData]) => {
            const entries = Object.entries(controllerData);
            if (entries.length > 0) {
                accessoryData[uuid] = entries.map(([id, data]) => ({
                    type: id,
                    controllerData: data,
                }));
            }
        });
        const key = ControllerStorage.persistKey(this.username);
        if (Object.keys(accessoryData).length > 0) {
            const saved = {
                accessories: accessoryData,
            };
            if (hksvDebug.enabled) {
                // Only build the per-accessory controller-id map when the namespace is enabled,
                // since save() runs on every debounced state change.
                hksvDebug("save write %s accs=%j ctrlsPerAcc=%j", key, Object.keys(accessoryData), Object.fromEntries(Object.entries(accessoryData).map(([acc, entries]) => [acc, entries.map(e => e.type)])));
            }
            this.fileCreated = true;
            HAPStorage_1.HAPStorage.storage().setItemSync(key, saved);
        }
        else if (this.fileCreated) {
            hksvDebug("save remove %s (no controller data left)", key);
            this.fileCreated = false;
            HAPStorage_1.HAPStorage.storage().removeItemSync(key);
        }
    }
    static persistKey(username) {
        return util_1.default.format("ControllerStorage.%s.json", username.replace(/:/g, "").toUpperCase());
    }
    static remove(username) {
        const key = ControllerStorage.persistKey(username);
        HAPStorage_1.HAPStorage.storage().removeItemSync(key);
    }
}
exports.ControllerStorage = ControllerStorage;
//# sourceMappingURL=ControllerStorage.js.map