"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
// here's a fake hardware device that we'll expose to HomeKit
const FAKE_LOCK = {
    locked: false,
    lock: () => {
        console.log("Locking the lock!");
        FAKE_LOCK.locked = true;
    },
    unlock: () => {
        console.log("Unlocking the lock!");
        FAKE_LOCK.locked = false;
    },
    identify: () => {
        console.log("Identify the lock!");
    },
};
// Generate a consistent UUID for our Lock Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "lock".
const lockUUID = __1.uuid.generate("hap-nodejs:accessories:lock");
// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
const lock = exports.accessory = new __1.Accessory("Lock", lockUUID);
// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
// @ts-expect-error: Core/BridgeCore API
lock.username = "C1:5D:3A:EE:5E:FA";
// @ts-expect-error: Core/BridgeCore API
lock.pincode = "031-45-154";
lock.category = 6 /* Categories.DOOR_LOCK */;
// set some basic properties (these values are arbitrary and setting them is optional)
lock
    .getService(__1.Service.AccessoryInformation)
    .setCharacteristic(__1.Characteristic.Manufacturer, "Lock Manufacturer")
    .setCharacteristic(__1.Characteristic.Model, "Rev-2")
    .setCharacteristic(__1.Characteristic.SerialNumber, "MY-Serial-Number");
// listen for the "identify" event for this Accessory
lock.on("identify" /* AccessoryEventTypes.IDENTIFY */, (paired, callback) => {
    FAKE_LOCK.identify();
    callback(); // success
});
const service = new __1.Service.LockMechanism("Fake Lock");
// Add the actual Door Lock Service and listen for change events from iOS.
service.getCharacteristic(__1.Characteristic.LockTargetState)
    .on("set" /* CharacteristicEventTypes.SET */, (value, callback) => {
    if (value === __1.Characteristic.LockTargetState.UNSECURED) {
        FAKE_LOCK.unlock();
        callback(); // Our fake Lock is synchronous - this value has been successfully set
        // now we want to set our lock's "actual state" to be unsecured so it shows as unlocked in iOS apps
        service.updateCharacteristic(__1.Characteristic.LockCurrentState, __1.Characteristic.LockCurrentState.UNSECURED);
    }
    else if (value === __1.Characteristic.LockTargetState.SECURED) {
        FAKE_LOCK.lock();
        callback(); // Our fake Lock is synchronous - this value has been successfully set
        // now we want to set our lock's "actual state" to be locked so it shows as open in iOS apps
        service.updateCharacteristic(__1.Characteristic.LockCurrentState, __1.Characteristic.LockCurrentState.SECURED);
    }
});
// We want to intercept requests for our current state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
service.getCharacteristic(__1.Characteristic.LockCurrentState)
    .on("get" /* CharacteristicEventTypes.GET */, callback => {
    // this event is emitted when you ask Siri directly whether your lock is locked or not. you might query
    // the lock hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.
    if (FAKE_LOCK.locked) {
        console.log("Are we locked? Yes.");
        callback(undefined, __1.Characteristic.LockCurrentState.SECURED);
    }
    else {
        console.log("Are we locked? No.");
        callback(undefined, __1.Characteristic.LockCurrentState.UNSECURED);
    }
});
lock.addService(service);
//# sourceMappingURL=Lock_accessory.js.map