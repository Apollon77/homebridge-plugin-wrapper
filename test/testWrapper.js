/* jshint -W097 */// jshint strict:false
/*jslint node: true */
/*jshint expr: true*/
var expect = require('chai').expect;
var request = require('request');
var http = require('http');

var HomebridgeWrapper = require('../index.js');
var homebridgeWrapper;

var allValues = {};
var allChars = {};
var httpServer;
var lastHTTPRequest = null;

function setupHTTPServer(port, callback) {
    httpServer = http.createServer(function (req, res) {
        lastHTTPRequest = req.url;
        console.log('HTTP Received: ' + lastHTTPRequest);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('OK');
    }).listen(port);
    setTimeout(function() {
        callback();
    }, 5000);
}


describe('Homebridge Wrapper tests ...', function() {

    it('Initialize Homebridge', function (done) {
        this.timeout(30000); // because of first install from npm

        var config = {
            logger: {info: console.log, debug: console.log},
            homebridgeConfigPath: "./", // /Users/ingof/.homebridge/
            wrapperConfig: {
                "accessories": [
            		{
                        "accessory" : "SunPosition",
                        "name" : "Sun",
                        "location" : {
                        	"lat" : 49.035924,
                        	"long" : 8.345736
                        }
                    }
                ],

                "platforms": [
            		{
            			"platform": "HttpWebHooks",
            			"webhook_port": "61828",
            			"cache_directory": "./.node-persist/storage",
            			"sensors": [
            				{
            				"id": "sensor1",
            				"name": "Sensor name 1",
            				"type": "contact"
            				},
            				{
            				"id": "sensor2",
            				"name": "Sensor name 2",
            				"type": "motion"
            				},
            				{
            				"id": "sensor3",
            				"name": "Sensor name 3",
            				"type": "occupancy"
            				},
            				{
            				"id": "sensor4",
            				"name": "Sensor name 4",
            				"type": "smoke"
            				},
            				{
            				"id": "sensor5",
            				"name": "Sensor name 5",
            				"type": "temperature"
            				},
            				{
            				"id": "sensor6",
            				"name": "Sensor name 6",
            				"type": "humidity"
            				},
            				{
            				"id": "sensor7",
            				"name": "Sensor name 7",
            				"type": "airquality"
            				},
            				{
            				"id": "sensor8",
            				"name": "Sensor name 8",
            				"type": "airquality"
            				}
            			],
            			"switches": [
            				{
            				"id": "switch1",
            				"name": "Switch name 1",
            				"on_url": "http://localhost:9080/switch1?on",
            				"on_method": "GET",
            				"off_url": "http://localhost:9080/switch1?off",
            				"off_method": "GET"
            				},
            				{
            				"id": "switch2",
            				"name": "Switch name 2",
            				"on_url": "http://localhost:9080/switch2?on",
            				"on_method": "GET",
            				"off_url": "http://localhost:9080/switch2?off",
            				"off_method": "GET"
            				},
            				{
            				"id": "switch3",
            				"name": "Switch name 3",
            				"on_url": "http://localhost:9080/switch3?on",
            				"on_method": "GET",
            				"off_url": "http://localhost:9080/switch3?off",
            				"off_method": "GET"
            				},
            				{
            				"id": "switch4",
            				"name": "Switch name*3",
            				"on_url": "http://localhost:9080/switch3-2?on",
            				"on_method": "GET",
            				"off_url": "http://localhost:9080/switch3-2?off",
            				"off_method": "GET"
            				}
            			],
            			"pushbuttons": [
            				{
            				"id": "pushbutton1",
            				"name": "Push button name 1",
            				"push_url": "http://localhost:9080/pushbutton1?push",
            				"push_method": "GET"
            				}
            			],
            			"lights": [
            				{
            				"id": "light1",
            				"name": "Light name 1",
            				"on_url": "http://localhost:9080/light1?on",
            				"on_method": "GET",
            				"off_url": "http://localhost:9080/light1?off",
            				"off_method": "GET"
            				}
            			],
            			"thermostats": [
            				{
            				"id": "thermostat1",
            				"name": "Thermostat name 1",
            				"set_target_temperature_url": "http://localhost:9080/thermostat1?targettemperature=%f",
            				"set_target_heating_cooling_state_url": "http://localhost:9080/thermostat1??targetstate=%b"
            				}
            			],
            			"outlets": [
            				{
            				"id": "outlet1",
            				"name": "Outlet name 1",
            				"on_url": "http://localhost:9080/outlet1?on",
            				"on_method": "GET",
            				"off_url": "http://localhost:9080/outlet1?off",
            				"off_method": "GET"
            				}
            			]
            		}
                ]
            }
        };

        homebridgeWrapper = new HomebridgeWrapper(config);

        homebridgeWrapper.on('characteristic-value-change', function(data) {
            console.log('Char change event: ' + data.accessory.displayName + '/' + data.service.displayName + '/' + data.characteristic.displayName + ' : ' + data.oldValue + ' --> ' + data.newValue);
            allValues[data.accessory.displayName + '/' + data.service.displayName + '/' + data.characteristic.displayName] = data.newValue;
        });

        homebridgeWrapper.on('addAccessory', function(accessory) {
            console.log('Bridge addBridgedAccessory ' + accessory.displayName); //OK

            for (var index in accessory.services) {
                var service = accessory.services[index];

                function iterateCharArray(chars) {
                    for (var chindex in chars) {
                        var char = chars[chindex];
                        allChars[accessory.displayName + '/' + service.displayName + '/' + char.displayName] = char;
                    }
                }

                iterateCharArray(service.characteristics);
                if (service.optionalCharacteristics) iterateCharArray(service.optionalCharacteristics);
            }
        });

        setupHTTPServer(9080, function() {
            homebridgeWrapper.init();

            setTimeout(function() {
                done();
            }, 5000);
        })
    });

    it('Tests Homebridge Wrapper: Verify Init', function (done) {
        this.timeout(10000); // because of first install from npm

        expect(Object.keys(allValues).length).to.be.equal(237);
        expect(Object.keys(allChars).length).to.be.equal(237);
        expect(allValues['Switch name 1/Switch name 1/On']).to.be.false;

        done();
    });

    it('Tests Homebridge Wrapper: Test Change from inside', function (done) {
        this.timeout(10000); // because of first install from npm

        request('http://localhost:61828/?accessoryId=switch1&state=true', function (error, response, body) {
            expect(error).to.be.null;
            expect(response && response.statusCode).to.be.equal(200);

            setTimeout(function() {
                expect(lastHTTPRequest).to.be.null;
                expect(allValues['Switch name 1/Switch name 1/On']).to.be.true;
                done();
            }, 2000);
        });

    });

    it('Tests Homebridge Wrapper: Test change via characteristic', function (done) {
        this.timeout(10000); // because of first install from npm

        allChars['Switch name 1/Switch name 1/On'].setValue(false);

        setTimeout(function() {
            expect(allValues['Switch name 1/Switch name 1/On']).to.be.false;
            expect(lastHTTPRequest).to.be.equal('/switch1?off');
            done();
        }, 2000);
    });

    it('Tests Homebridge Wrapper: Test change via characteristic 2', function (done) {
        this.timeout(10000); // because of first install from npm

        allChars['Switch name 1/Switch name 1/On'].setValue(true);

        setTimeout(function() {
            expect(allValues['Switch name 1/Switch name 1/On']).to.be.true;
            expect(lastHTTPRequest).to.be.equal('/switch1?on');
            done();
        }, 2000);
    });

    it('Tests Homebridge Wrapper: Test Change from inside 2', function (done) {
        this.timeout(10000); // because of first install from npm

        lastHTTPRequest = null;
        request('http://localhost:61828/?accessoryId=switch1&state=false', function (error, response, body) {
            expect(error).to.be.null;
            expect(response && response.statusCode).to.be.equal(200);

            setTimeout(function() {
                expect(lastHTTPRequest).to.be.null;
                expect(allValues['Switch name 1/Switch name 1/On']).to.be.false;
                done();
            }, 2000);
        });

    });

    it('End Homebridge Wrapper', function (done) {
        this.timeout(10000); // because of first install from npm

        homebridgeWrapper.finish();
        setTimeout(function() {
            httpServer.close();
            done();
        }, 1000);
    });

});
