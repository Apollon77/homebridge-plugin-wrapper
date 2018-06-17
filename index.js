/* jshint -W097 */
// jshint strict:false
/*jslint node: true */
/*jslint esversion: 6 */

var mock = require('mock-require');

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var User = require(__dirname + '/homebridge/user').User;
var hap = require('./hap-nodejs');
var Server = require(__dirname + '/homebridge/server').Server;
var hapTypes = require(__dirname + '/hap-nodejs/accessories/types');
var Service = hap.Service;
var Accessory = hap.Accessory;

function override(child, fn) {
    child.prototype[fn.name] = fn;
    fn.inherited = child.super_.prototype[fn.name];
}


function HomebridgeWrapper(config) {
    mock('hap-nodejs', './hap-nodejs');
    mock('hap-nodejs/accessories/types.js', './hap-nodejs/accessories/types.js');
    mock('hap-nodejs/lib/util/once', './hap-nodejs/lib/util/once');
    mock('qrcode-terminal', {
        generate: function() {}
    });
    mock('ed25519-hap', {
        MakeKeypair: function(seed) { return {privateKey: '', publicKey: ''};}
    });
    mock('ip', {});
    mock('chalk', {
        'gray': function(msg) {return msg;},
        'yellow': function(msg) {return msg;},
        'cyan': function(msg) {return msg;},
        'white': function(msg) {return msg;},
        'bold': {
            'red': function(msg) {return msg;},
        }
    });

    this.logger = config.logger;
    this.wrapperConfig = config.wrapperConfig;

    if (!this.wrapperConfig.bridge) {
        this.wrapperConfig.bridge = {
            "name": "Homebridge-Wrapper-Bridge",
            "username": "FF:FF:FF:FF:FF:FF",
            "port": 0,
            "pin": "0"
        };
    }

    var that = this;

    User.setStoragePath(config.homebridgeConfigPath);

    function WrapperBridge(displayName, serialNumber) {
        that.logger.debug('Homebridge Wrapper Bridge constructor');
        WrapperBridge.super_.call(this, displayName, serialNumber);
    }

    inherits(WrapperBridge, hap.Bridge);

    override(WrapperBridge, function publish(info, allowInsecureRequest) {
        that.logger.info('Homebridge Wrapper Bridge publish ' + JSON.stringify(info));
        // Вызов метода родительского класса
        // Calling the method of the parent class
        publish.inherited.call(this, info, allowInsecureRequest);
    });

    override(WrapperBridge, function addBridgedAccessory(accessory, deferUpdate) {
        // Вызов метода родительского класса
        // Calling the method of the parent class
        accessory = addBridgedAccessory.inherited.call(this, accessory, deferUpdate);
        that.logger.debug('Homebridge Wrapper Bridge addBridgedAccessory '+JSON.stringify(accessory)); //OK

        that.emit('addAccessory', accessory);

        function registerEventsForCharacteristic(accessory, service, characteristic) {
            characteristic.on('change', function(data) {
                that.emit('characteristic-value-change', {accessory: accessory, service: service, characteristic: characteristic, oldValue: data.oldValue, newValue: data.newValue});
            });
            characteristic.getValue(function(err, value) {
                that.emit('characteristic-value-change', {accessory: accessory, service: service, characteristic: characteristic, newValue: value});
            });
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
    });

    Server.prototype._createBridge = function() {
        that.logger.debug('Homebridge Wrapper Bridge create'); //OK
        // pull out our custom Bridge settings from config.json, if any
        var bridgeConfig = this._config.bridge || {};

        // Create our Bridge which will host all loaded Accessories
        return new WrapperBridge(bridgeConfig.name || 'Homebridge', hap.uuid.generate("HomeBridge"));
    };

    Server.prototype._printPin = function(pin) {
    };
    Server.prototype._printSetupInfo = function() {
    };
    Server.prototype.getBridge = function() {
        return this._bridge;
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

    WrapperBridge.prototype.getBridgedAccessoryByUUID = function (uuid) {
      for (var index in this.bridgedAccessories) {
        var accessory = this.bridgedAccessories[index];
        if (accessory.UUID === uuid)
          return accessory;
      }
    };
}

inherits(HomebridgeWrapper, EventEmitter);

HomebridgeWrapper.prototype.init = function init() {
    var insecureAccess = false;
    // Initialize HAP-NodeJS with a custom persist directory
    hap.init(User.persistPath()); // TODO !!

    var serverOpts = {
        config: this.wrapperConfig
    };
    this.server = new Server(insecureAccess, serverOpts);

    this.server.run();
};

HomebridgeWrapper.prototype.finish = function finish() {
    if (this.server) {
        this.server._teardown();
        // Save cached accessories to persist storage.
        this.server._updateCachedAccessories();
    }
};

HomebridgeWrapper.prototype.getAccessoryByUUID = function getAccessoryByUUID(uuid) {
    return server.getBridge().getBridgedAccessoryByUUID(uuid);
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
