"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// here's a fake temperature sensor device that we'll expose to HomeKit
var __1 = require("..");
var FAKE_SENSOR = {
    currentTemperature: 50,
    getTemperature: function () {
        console.log("Getting the current temperature!");
        return FAKE_SENSOR.currentTemperature;
    },
    randomizeTemperature: function () {
        // randomize temperature to a value between 0 and 100
        FAKE_SENSOR.currentTemperature = Math.round(Math.random() * 100);
    },
};
// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = __1.uuid.generate("hap-nodejs:accessories:temperature-sensor");
// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new __1.Accessory("Temperature Sensor", sensorUUID);
// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
// @ts-expect-error: Core/BridgeCore API
sensor.username = "C1:5D:3A:AE:5E:FA";
// @ts-expect-error: Core/BridgeCore API
sensor.pincode = "031-45-154";
sensor.category = 10 /* SENSOR */;
// Add the actual TemperatureSensor Service.
sensor
    .addService(__1.Service.TemperatureSensor)
    .getCharacteristic(__1.Characteristic.CurrentTemperature)
    .on("get" /* GET */, function (callback) {
    // return our current value
    callback(null, FAKE_SENSOR.getTemperature());
});
// randomize our temperature reading every 3 seconds
setInterval(function () {
    FAKE_SENSOR.randomizeTemperature();
    // update the characteristic value so interested iOS devices can get notified
    sensor
        .getService(__1.Service.TemperatureSensor)
        .setCharacteristic(__1.Characteristic.CurrentTemperature, FAKE_SENSOR.currentTemperature);
}, 3000);
//# sourceMappingURL=TemperatureSensor_accessory.js.map