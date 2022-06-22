/* jshint -W097 */// jshint strict:false
/*jslint node: true */
/*jshint expr: true*/

// get the object
var HomebridgeWrapper = require('../index.js').Wrapper;
var homebridgeWrapper;

// prepare configuration like normally
var config = {
    logger: {info: console.log, debug: console.log},
    homebridgeConfigPath: "./",
    wrapperConfig: {
        "accessories": [
    		{
                "accessory" : "SunPosition",
                "name" : "Sun",
                "location" : {
                	"lat" : 51.035924,
                	"long" : 9.345736
                }
            }
        ],
        "platforms": [
        ]
    }
};

// Initialize
homebridgeWrapper = new HomebridgeWrapper(config);

// Register event handler to get changes of object values (including initial values)
homebridgeWrapper.on('characteristic-value-change', function(data) {
    console.log('Characteristic change event: ' + (data.accessory.displayName?data.accessory.displayName:data.accessory.UUID) + '/' + (data.service.displayName?data.service.displayName:data.service.UUID) + '/' + (data.characteristic.displayName?data.characteristic.displayName:data.characteristic.UUID) + ' : ' + data.oldValue + ' --> ' + data.newValue);
});

function printAccessory(accessory) {
    for (var index in accessory.services) {
        var service = accessory.services[index];

        function iterateCharArray(chars) {
            for (var chindex in chars) {
                var char = chars[chindex];
                console.log('Characteristic added: ' + (accessory.displayName?accessory.displayName:accessory.UUID) + '/' + (service.displayName?service.displayName:service.UUID) + '/' + (char.displayName?char.displayName:char.UUID));
            }
        }

        iterateCharArray(service.characteristics);
        if (service.optionalCharacteristics) {
            iterateCharArray(service.optionalCharacteristics);
        }
    }

}

// Register event handler to get info of an added accessory
// Best is to get all the UUIDs and Names from the accessories,
// services and characteristics you want for later usage
homebridgeWrapper.on('addAccessory', function(accessory) {
    console.log('Bridge addBridgedAccessory ' + accessory.displayName);

    printAccessory(accessory)
});

// Register event handler to get info of an added external accessory
homebridgeWrapper.on('addExternalAccessory', function(accessory) {
    console.log('Bridge addExternalBridgedAccessory ' + accessory.displayName);

    printAccessory(accessory)
});

// Really start the Wrapper logic
homebridgeWrapper.init();

// So you can get a value
homebridgeWrapper.getCharacteristicByName('Sun', 'Sun', 'Altitude').getValue(function(err, value) {
    if (err) {
        console.log('ERROR: ' + err);
    }
    console.log('Current Sun-Altitude is ' + value);
});

// so you can set a value
homebridgeWrapper.getCharacteristicByName('Sun', 'Sun', 'Altitude').setValue(88);

// clean up and let Homebridge persist last values
homebridgeWrapper.finish();

process.exit();
