"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __1 = require("..");
var LightControllerClass = /** @class */ (function () {
    function LightControllerClass() {
        this.name = "Simple Light"; //name of accessory
        this.pincode = "031-45-154";
        this.username = "FA:3C:ED:5A:1A:1A"; // MAC like address used by HomeKit to differentiate accessories.
        this.manufacturer = "HAP-NodeJS"; //manufacturer (optional)
        this.model = "v1.0"; //model (optional)
        this.serialNumber = "A12S345KGB"; //serial number (optional)
        this.power = false; //current power status
        this.brightness = 100; //current brightness
        this.hue = 0; //current hue
        this.saturation = 0; //current saturation
        this.outputLogs = true; //output logs
    }
    LightControllerClass.prototype.setPower = function (status) {
        if (this.outputLogs) {
            console.log("Turning the '%s' %s", this.name, status ? "on" : "off");
        }
        this.power = status;
    };
    LightControllerClass.prototype.getPower = function () {
        if (this.outputLogs) {
            console.log("'%s' is %s.", this.name, this.power ? "on" : "off");
        }
        return this.power;
    };
    LightControllerClass.prototype.setBrightness = function (brightness) {
        if (this.outputLogs) {
            console.log("Setting '%s' brightness to %s", this.name, brightness);
        }
        this.brightness = brightness;
    };
    LightControllerClass.prototype.getBrightness = function () {
        if (this.outputLogs) {
            console.log("'%s' brightness is %s", this.name, this.brightness);
        }
        return this.brightness;
    };
    LightControllerClass.prototype.setSaturation = function (saturation) {
        if (this.outputLogs) {
            console.log("Setting '%s' saturation to %s", this.name, saturation);
        }
        this.saturation = saturation;
    };
    LightControllerClass.prototype.getSaturation = function () {
        if (this.outputLogs) {
            console.log("'%s' saturation is %s", this.name, this.saturation);
        }
        return this.saturation;
    };
    LightControllerClass.prototype.setHue = function (hue) {
        if (this.outputLogs) {
            console.log("Setting '%s' hue to %s", this.name, hue);
        }
        this.hue = hue;
    };
    LightControllerClass.prototype.getHue = function () {
        if (this.outputLogs) {
            console.log("'%s' hue is %s", this.name, this.hue);
        }
        return this.hue;
    };
    LightControllerClass.prototype.identify = function () {
        if (this.outputLogs) {
            console.log("Identify the '%s'", this.name);
        }
    };
    return LightControllerClass;
}());
var LightController = new LightControllerClass();
// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "light".
var lightUUID = __1.uuid.generate("hap-nodejs:accessories:light" + LightController.name);
// This is the Accessory that we'll return to HAP-NodeJS that represents our light.
var lightAccessory = exports.accessory = new __1.Accessory(LightController.name, lightUUID);
// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
// @ts-expect-error: Core/BridgeCore API
lightAccessory.username = LightController.username;
// @ts-expect-error: Core/BridgeCore API
lightAccessory.pincode = LightController.pincode;
lightAccessory.category = 5 /* LIGHTBULB */;
// set some basic properties (these values are arbitrary and setting them is optional)
lightAccessory
    .getService(__1.Service.AccessoryInformation)
    .setCharacteristic(__1.Characteristic.Manufacturer, LightController.manufacturer)
    .setCharacteristic(__1.Characteristic.Model, LightController.model)
    .setCharacteristic(__1.Characteristic.SerialNumber, LightController.serialNumber);
// listen for the "identify" event for this Accessory
lightAccessory.on("identify" /* IDENTIFY */, function (paired, callback) {
    LightController.identify();
    callback();
});
// services exposed to the user should have "names" like "Light" for this case
var lightbulb = lightAccessory.addService(__1.Service.Lightbulb, LightController.name);
lightbulb.getCharacteristic(__1.Characteristic.On)
    .on("set" /* SET */, function (value, callback) {
    LightController.setPower(value);
    // Our light is synchronous - this value has been successfully set
    // Invoke the callback when you finished processing the request
    // If it's going to take more than 1s to finish the request, try to invoke the callback
    // after getting the request instead of after finishing it. This avoids blocking other
    // requests from HomeKit.
    callback();
})
    // We want to intercept requests for our current power state so we can query the hardware itself instead of
    // allowing HAP-NodeJS to return the cached Characteristic.value.
    .on("get" /* GET */, function (callback) {
    callback(null, LightController.getPower());
});
// To inform HomeKit about changes occurred outside of HomeKit (like user physically turn on the light)
// Please use Characteristic.updateValue
//
// lightAccessory
//   .getService(Service.Lightbulb)
//   .getCharacteristic(Characteristic.On)
//   .updateValue(true);
// also add an "optional" Characteristic for Brightness
lightbulb.addCharacteristic(__1.Characteristic.Brightness)
    .on("set" /* SET */, function (value, callback) {
    LightController.setBrightness(value);
    callback();
})
    .on("get" /* GET */, function (callback) {
    callback(null, LightController.getBrightness());
});
// also add an "optional" Characteristic for Saturation
lightbulb.addCharacteristic(__1.Characteristic.Saturation)
    .on("set" /* SET */, function (value, callback) {
    LightController.setSaturation(value);
    callback();
})
    .on("get" /* GET */, function (callback) {
    callback(null, LightController.getSaturation());
});
// also add an "optional" Characteristic for Hue
lightbulb.addCharacteristic(__1.Characteristic.Hue)
    .on("set" /* SET */, function (value, callback) {
    LightController.setHue(value);
    callback();
})
    .on("get" /* GET */, function (callback) {
    callback(null, LightController.getHue());
});
//# sourceMappingURL=Light_accessory.js.map