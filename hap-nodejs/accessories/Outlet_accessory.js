"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
var err = null; // in case there were any problems
// here's a fake hardware device that we'll expose to HomeKit
var FAKE_OUTLET = {
    powerOn: false,
    setPowerOn: function (on) {
        console.log("Turning the outlet %s!...", on ? "on" : "off");
        if (on) {
            FAKE_OUTLET.powerOn = true;
            if (err) {
                return console.log(err);
            }
            console.log("...outlet is now on.");
        }
        else {
            FAKE_OUTLET.powerOn = false;
            if (err) {
                return console.log(err);
            }
            console.log("...outlet is now off.");
        }
    },
    identify: function () {
        console.log("Identify the outlet.");
    },
};
// Generate a consistent UUID for our outlet Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the accessory name.
var outletUUID = __1.uuid.generate("hap-nodejs:accessories:Outlet");
// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var outlet = exports.accessory = new __1.Accessory("Outlet", outletUUID);
// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
// @ts-expect-error: Core/BridgeCore API
outlet.username = "1A:2B:3C:4D:5D:FF";
// @ts-expect-error: Core/BridgeCore API
outlet.pincode = "031-45-154";
outlet.category = 7 /* OUTLET */;
// set some basic properties (these values are arbitrary and setting them is optional)
outlet
    .getService(__1.Service.AccessoryInformation)
    .setCharacteristic(__1.Characteristic.Manufacturer, "Oltica")
    .setCharacteristic(__1.Characteristic.Model, "Rev-1")
    .setCharacteristic(__1.Characteristic.SerialNumber, "A1S2NASF88EW");
// listen for the "identify" event for this Accessory
outlet.on("identify" /* IDENTIFY */, function (paired, callback) {
    FAKE_OUTLET.identify();
    callback(); // success
});
// Add the actual outlet Service and listen for change events from iOS.
outlet
    .addService(__1.Service.Outlet, "Fake Outlet") // services exposed to the user should have "names" like "Fake Light" for us
    .getCharacteristic(__1.Characteristic.On)
    .on("set" /* SET */, function (value, callback) {
    FAKE_OUTLET.setPowerOn(value);
    callback(); // Our fake Outlet is synchronous - this value has been successfully set
});
// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
outlet
    .getService(__1.Service.Outlet)
    .getCharacteristic(__1.Characteristic.On)
    .on("get" /* GET */, function (callback) {
    // this event is emitted when you ask Siri directly whether your light is on or not. you might query
    // the light hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.
    var err = null; // in case there were any problems
    if (FAKE_OUTLET.powerOn) {
        console.log("Are we on? Yes.");
        callback(err, true);
    }
    else {
        console.log("Are we on? No.");
        callback(err, false);
    }
});
//# sourceMappingURL=Outlet_accessory.js.map