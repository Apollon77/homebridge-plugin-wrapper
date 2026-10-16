/* jshint -W097 */// jshint strict:false
/*jslint node: true */
/*jshint expr: true*/
const path = require('path');

// get the object
const HomebridgeWrapper = require('../index.js').Wrapper;

// prepare configuration like normally
const config = {
    logger: {info: console.log, debug: console.log, warn: console.warn},
    homebridgeConfigPath: "./",
    // the plugin used here is the one of the tests (Homebridge 2 API); installed plugins are found without this option
    customPluginPath: path.join(__dirname, '..', 'test', 'plugins'),
    wrapperConfig: {
        "accessories": [
            {
                "accessory": "WrapperTest",
                "name": "Example"
            }
        ],
        "platforms": [
        ]
    }
};

// Initialize
const homebridgeWrapper = new HomebridgeWrapper(config);

// Register event handler to get changes of object values (including initial values)
homebridgeWrapper.on('characteristic-value-change', function(data) {
    console.log('Characteristic change event: ' + (data.accessory.displayName?data.accessory.displayName:data.accessory.UUID) + '/' + (data.service.displayName?data.service.displayName:data.service.UUID) + '/' + (data.characteristic.displayName?data.characteristic.displayName:data.characteristic.UUID) + ' : ' + data.oldValue + ' --> ' + data.newValue);
});

function printAccessory(accessory) {
    for (const service of accessory.services) {
        for (const char of service.characteristics) {
            console.log('Characteristic added: ' + (accessory.displayName?accessory.displayName:accessory.UUID) + '/' + (service.displayName?service.displayName:service.UUID) + '/' + (char.displayName?char.displayName:char.UUID));
        }
    }
}

// Register event handler to get info of an added accessory
// Best is to get all the UUIDs and Names from the accessories,
// services and characteristics you want for later usage
homebridgeWrapper.on('addAccessory', function(accessory) {
    console.log('Bridge addBridgedAccessory ' + accessory.displayName);

    printAccessory(accessory);
});

// Register event handler to get info of an added external accessory
homebridgeWrapper.on('addExternalAccessory', function(accessory) {
    console.log('Bridge addExternalBridgedAccessory ' + accessory.displayName);

    printAccessory(accessory);
});

// Really start the Wrapper logic
homebridgeWrapper.init();

// the plugins are loaded asynchronously
setTimeout(async () => {
    // So you can get a value (calls the get handler of the plugin)
    const temperature = homebridgeWrapper.getCharacteristicByName('Example', 'Example Temperature', 'Current Temperature');
    console.log('Current temperature is ' + await temperature.handleGetRequest());

    // so you can set a value (calls the set handler of the plugin)
    homebridgeWrapper.getCharacteristicByName('Example', 'Example Switch', 'On').setValue(true, err => {
        console.log('Switched on' + (err ? ': ' + err : ''));

        // clean up and let Homebridge persist last values
        homebridgeWrapper.finish();
        process.exit();
    });
}, 3000);
