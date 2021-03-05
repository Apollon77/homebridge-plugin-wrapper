/* jshint -W097 */
// jshint strict:false
/*jslint node: true */
/*jslint esversion: 6 */

var mock = require('mock-require');

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var path = require('path');

var hapTypes = require(__dirname + '/hap-nodejs/accessories/types');
var User;
var hap;
var hapStorage;
var Server;
var ServerReq;
var Service;
var Accessory;

function customStringify(v, func, intent) {
    const cache = new Map();
    return JSON.stringify(v, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.get(value)) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our map
            cache.set(value, true);
        }
        return value;
    }, intent);
}


function HomebridgeWrapper(config) {
    var that = this;

    mock('hap-nodejs', './hap-nodejs');
    mock('hap-nodejs/accessories/types.js', './hap-nodejs/accessories/types.js');
    mock('hap-nodejs/lib/util/once', './hap-nodejs/lib/util/once');
    mock(path.join(__dirname, '/hap-nodejs/lib/util/eventedhttp.js'), {
        EventedHTTPServer: function() {
            this.listen = function () {};
            this.stop = function () {};
            this.sendEvent = function () {};
            this.on = function () {};

            that.logger.debug('Fake EventedHTTPServer initialized');
            return this;
        }
    });
    mock('qrcode-terminal', {
        generate: function() {}
    });
    mock('tweetnacl', {
        sign: {
            keyPair: function () {
                return {secretKey: '', publicKey: ''};
            }
        }
    });
    mock('fast-srp-hap', {});
    mock('bonjour-hap', function() {
        return {
            publish: function() {
                return {
                    updateTxt: function() {},
                    stop: function() {},
                    destroy: function() {},
                    updateTxt: function() {},
                }
            },
            destroy: function() {}
        }
    });
    mock(path.join(__dirname, '/homebridge/version.js'), path.join(__dirname, '/homebridge-version.js'));


    User = require(path.join(__dirname, 'homebridge/user')).User;
    hap = require('./hap-nodejs');
    hapStorage = require(path.join(__dirname, 'hap-nodejs/lib/model/HAPStorage')).HAPStorage;

    ServerReq = require(path.join(__dirname, 'homebridge/server'));
    Server = ServerReq.Server;
    Service = hap.Service;
    Accessory = hap.Accessory;

    this.logger = config.logger;
    this.wrapperConfig = config.wrapperConfig;
    this.characteristicPollingInterval = config.characteristicPollingInterval;
    this.characteristicPollingList = config.characteristicPollingList;
    this.characteristicPollingTimeouts = {};
    this.characteristicValues = {};
    this.insecureAccess = config.insecureAccess;

    if (!this.wrapperConfig.bridge) {
        this.wrapperConfig.bridge = {
            "name": "Homebridge-Wrapper-Bridge",
            "username": "FF:FF:FF:FF:FF:FF",
            "port": 0,
            "pin": "0",
//            "advertiser": "ciao"
        };
    }

    try {
        if (!fs.existsSync(config.homebridgeConfigPath)) {
            fs.mkdirSync(config.homebridgeConfigPath);
        }
        // some Plugins want to have config file
        fs.writeFileSync(path.join(config.homebridgeConfigPath, 'config.json'), JSON.stringify(this.wrapperConfig));
    }
    catch (e) {
        that.logger.warn(' Error writing ' + path.join(config.homebridgeConfigPath, 'config.json') + ' - Some Plugins may need that.');
    }
    User.setStoragePath(config.homebridgeConfigPath);

    function WrapperBridge(displayName, serialNumber) {
        that.logger.debug('Homebridge Wrapper Bridge constructor displayName=' + displayName + ', UUID=' + serialNumber);
        WrapperBridge.super_.call(this, displayName, serialNumber);

        this._origPublish = this.publish;
        this._origAddBridgedAccessory = this.addBridgedAccessory;

        this.publish = function(info, allowInsecureRequest) {
            that.logger.info('Homebridge Wrapper Bridge publish ' + customStringify(info));
            // Вызов метода родительского класса
            // Calling the method of the parent class
            this._origPublish.call(this, info, allowInsecureRequest);
        };

        this.addBridgedAccessory = function(accessory, deferUpdate) {
            // Вызов метода родительского класса
            // Calling the method of the parent class
            accessory = this._origAddBridgedAccessory.call(this, accessory, deferUpdate);
            that.logger.debug('Homebridge Wrapper Bridge addBridgedAccessory ' + customStringify(accessory)); //OK

            that.emit('addAccessory', accessory);

            function handleCharacteristicPolling(accessory, service, characteristic) {
                var pollingInterval;
                if (that.characteristicPollingList && (characteristic.displayName in that.characteristicPollingList)) {
                    pollingInterval = that.characteristicPollingList[characteristic.displayName];
                } else {
                    pollingInterval = that.characteristicPollingInterval;
                }
                //that.logger.debug('Interval: char=' + characteristic.displayName + ' ; interval= ' + customStringify(pollingInterval));
                if (pollingInterval) {
                    //that.logger.debug('POLLING: char=' + characteristic.displayName + ' ; interval= ' + customStringify(pollingInterval));
                    if (that.characteristicPollingTimeouts[accessory.UUID + '.' + service.UUID + '.' + characteristic.UUID]) {
                        clearTimeout(that.characteristicPollingTimeouts[accessory.UUID + '.' + service.UUID + '.' + characteristic.UUID]);
                    }
                    that.characteristicPollingTimeouts[accessory.UUID + '.' + service.UUID + '.' + characteristic.UUID] = setTimeout(function() {
                        characteristic.getValue(function(err, value) {
                            if (value !== that.characteristicValues[accessory.UUID + '.' + service.UUID + '.' + characteristic.UUID]) {
                                that.characteristicValues[accessory.UUID + '.' + service.UUID + '.' + characteristic.UUID] = value;
                                that.emit('characteristic-value-change', {accessory: accessory, service: service, characteristic: characteristic, newValue: value});
                            }
                            that.emit('characteristic-value-update', {accessory: accessory, service: service, characteristic: characteristic, newValue: value});
                            handleCharacteristicPolling(accessory, service, characteristic);
                        });
                    }, pollingInterval);
                }
            }

            function registerEventsForCharacteristic(accessory, service, characteristic) {
                characteristic.on('change', function(data) {
                    that.characteristicValues[accessory.UUID + '.' + service.UUID + '.' + characteristic.UUID] = data.newValue;
                    that.emit('characteristic-value-change', {accessory: accessory, service: service, characteristic: characteristic, oldValue: data.oldValue, newValue: data.newValue});
                    that.emit('characteristic-value-update', {accessory: accessory, service: service, characteristic: characteristic, oldValue: data.oldValue, newValue: data.newValue});
                    handleCharacteristicPolling(accessory, service, characteristic);
                });
                characteristic.getValue(function(err, value) {
                    that.characteristicValues[accessory.UUID + '.' + service.UUID + '.' + characteristic.UUID] = value;
                    that.emit('characteristic-value-change', {accessory: accessory, service: service, characteristic: characteristic, newValue: value});
                });
                handleCharacteristicPolling(accessory, service, characteristic);
            }

            for (var index in accessory.services) {
                var service = accessory.services[index];
                for (var chindex in service.characteristics) {
                    registerEventsForCharacteristic(accessory, service, service.characteristics[chindex]);
                }
                for (chindex in service.optionalCharacteristics) {
                    registerEventsForCharacteristic(accessory, service, service.optionalCharacteristics[chindex]);
                }
            }

            return accessory;
        };
    }

    inherits(WrapperBridge, hap.Bridge);

    WrapperBridge.prototype.getBridgedAccessoryByUUID = function (uuid) {
      for (var index in this.bridgedAccessories) {
        var accessory = this.bridgedAccessories[index];
        if (accessory.UUID === uuid)
          return accessory;
      }
    };

    WrapperBridge.prototype.getBridgedAccessoryByName = function (name) {
      for (var index in this.bridgedAccessories) {
        var accessory = this.bridgedAccessories[index];
        if (accessory.displayName === name)
          return accessory;
      }
    };

    this.WrapperBridge = WrapperBridge;

    Server.prototype._createBridge = function() {
        that.logger.debug('Homebridge Wrapper Bridge create'); //OK
        // pull out our custom Bridge settings from config.json, if any
        var bridgeConfig = this.config.bridge || {};

        // Create our Bridge which will host all loaded Accessories
        return new WrapperBridge(bridgeConfig.name || 'Homebridge', hap.uuid.generate("HomeBridge"));
    };

    Server.prototype.printSetupInfo = function(pin) {
    };

    Service.prototype.getCharacteristicByUUID = function (uuid) {
        for (var index in this.characteristics) {
            var characteristic = this.characteristics[index];
            if (characteristic.uuid === uuid)
                return characteristic;
        }
    };

    Accessory.prototype.getServiceByUUID = function (uuid) {
        for (var index in this.services) {
            var service = this.services[index];
            if (services.uuid === uuid)
                return service;
        }
    };

    Accessory.prototype.getCharacteristicByUUID = function (serviceUUID, characteristicUUID) {
        return this.getServiceByUUID(serviceUUID).getCharacteristicByUUID(characteristicUUID);
    };
}

inherits(HomebridgeWrapper, EventEmitter);

HomebridgeWrapper.prototype.init = function init() {
    // Initialize HAP-NodeJS with a custom persist directory
    hapStorage.setCustomStoragePath(User.persistPath());

    var serverOpts = {
        config: this.wrapperConfig,
        hideQRCode: true,
        insecureAccess: this.insecureAccess
    };
    this.server = new Server(serverOpts);
    this.server.bridge = new this.WrapperBridge(this.server.config.bridge.name, hap.uuid.generate("HomeBridge"));

    this.server.start();
};

HomebridgeWrapper.prototype.finish = function finish() {
    if (this.server) {
        this.server.teardown();
        // Save cached accessories to persist storage.
        this.server.saveCachedPlatformAccessoriesOnDisk();
    }
    this.removeAllListeners();
    this.server = null;
    if (this.characteristicPollingInterval || this.characteristicPollingList) {
        for (var id in this.characteristicPollingTimeouts) {
            clearTimeout(this.characteristicPollingTimeouts[id]);
        }
    }
};

HomebridgeWrapper.prototype.getAccessoryByName = function getAccessoryByName(name) {
    return this.server.getBridge().getBridgedAccessoryByName(name);
};

HomebridgeWrapper.prototype.getServiceByName = function getServiceByName(accessoryName, serviceName) {
    return this.getAccessoryByName(accessoryName).getService(serviceName);
};

HomebridgeWrapper.prototype.getCharacteristicByName = function getCharacteristicByName(accessoryName, serviceName, characteristicName) {
    return this.getAccessoryByName(accessoryName).getService(serviceName).getCharacteristic(characteristicName);
};


HomebridgeWrapper.prototype.getAccessoryByUUID = function getAccessoryByUUID(uuid) {
    return this.server.getBridge().getBridgedAccessoryByUUID(uuid);
};

HomebridgeWrapper.prototype.getServiceByUUID = function getServiceByUUID(accessoryUUID, serviceUUID) {
    return this.getAccessoryByUUID(accessoryUUID).getServiceByUUID(serviceUUID);
};

HomebridgeWrapper.prototype.getCharacteristicByUUID = function getCharacteristicByUUID(accessoryUUID, serviceUUID, characteristicUUID) {
    return this.getAccessoryByUUID(accessoryUUID).getCharacteristicByUUID(serviceUUID, characteristicUUID);
};

module.exports = {
    Wrapper: HomebridgeWrapper,
    HapTypes: hapTypes
};
