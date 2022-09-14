/* jshint -W097 */
// jshint strict:false
/*jslint node: true */
/*jslint esversion: 6 */

const mock = require('mock-require');

const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const fs = require('fs');
const path = require('path');

const hapTypes = require(`${__dirname}/hap-nodejs/accessories/types`);
let User;
let hap;
let hapStorage;
let Server;
let ServerReq;
let Service;
let Accessory;

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
    const that = this;

    mock('hap-nodejs', './hap-nodejs');
    mock('hap-nodejs/accessories/types.js', './hap-nodejs/accessories/types.js');
    mock('hap-nodejs/lib/util/once', './hap-nodejs/lib/util/once');
    mock(path.join(__dirname, '/hap-nodejs/lib/util/eventedhttp.js'), {
        EventedHTTPServer: function() {
            this.listen = function () {};
            this.stop = function () {};
            this.sendEvent = function () {};
            this.on = function () {};
            this.broadcastEvent = function () {};

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
                }
            },
            destroy: function() {}
        }
    });
    mock('@homebridge/ciao', function() {});
    mock('@homebridge/dbus-native', function() {});
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
    this.knownAccessories = {};

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
        that.logger.warn(` Error writing ${path.join(config.homebridgeConfigPath, 'config.json')} - Some Plugins may need that.`);
    }
    User.setStoragePath(config.homebridgeConfigPath);

    function WrapperBridge(displayName, serialNumber) {
        that.logger.debug(`Homebridge Wrapper Bridge constructor displayName=${displayName}, UUID=${serialNumber}`);
        WrapperBridge.super_.call(this, displayName, serialNumber);

        this._origPublish = this.publish;
        this._origAddBridgedAccessory = this.addBridgedAccessory;

        this.publish = function(info, allowInsecureRequest) {
            that.logger.info(`Homebridge Wrapper Bridge publish ${customStringify(info)}`);
            // Вызов метода родительского класса
            // Calling the method of the parent class
            this._origPublish.call(this, info, allowInsecureRequest);
        };

        this.___handleCharacteristicPolling = function(accessory, serviceOrNameOrUUID, characteristicOrNameOrUUID) {
            const service = typeof serviceOrNameOrUUID === 'string' ? accessory.services.find(s => s.displayName === serviceOrNameOrUUID || s.UUID === serviceOrNameOrUUID) : serviceOrNameOrUUID;
            const characteristic = typeof characteristicOrNameOrUUID === 'string' ? service.characteristics.find(c => c.displayName === characteristicOrNameOrUUID || c.UUID === characteristicOrNameOrUUID) : characteristicOrNameOrUUID;
            let pollingInterval;
            if (that.characteristicPollingList && (characteristic.displayName in that.characteristicPollingList)) {
                pollingInterval = that.characteristicPollingList[characteristic.displayName];
            } else {
                pollingInterval = that.characteristicPollingInterval;
            }
            //that.logger.debug('Interval: char=' + characteristic.displayName + ' ; interval= ' + customStringify(pollingInterval));
            if (pollingInterval) {
                const key = `${accessory.UUID}-${accessory.displayName}.${service.UUID}-${service.displayName}-${service.subtype}.${characteristic.UUID}-${characteristic.displayName}`;
                //that.logger.debug('POLLING: char=' + characteristic.displayName + ' ; interval= ' + customStringify(pollingInterval));
                if (that.characteristicPollingTimeouts[key]) {
                    clearTimeout(that.characteristicPollingTimeouts[key]);
                }
                that.characteristicPollingTimeouts[key] = setTimeout(() => {
                    delete that.characteristicPollingTimeouts[key];
                    const currService = accessory.services.find(s => s.UUID === service.UUID && s.displayName === service.displayName && s.subtype === service.subtype);
                    const currCharacteristic = currService.characteristics.find(c => c.UUID === characteristic.UUID && c.displayName === characteristic.displayName);
                    if (!currCharacteristic) {
                        //console.log(`Characteristic not found: ${serviceUUID}/${characteristicUUID} in ${accessory.displayName}`);
                        return;
                    }
                    this.___getAndPollCharacteristic(accessory, currService, currCharacteristic, false);
                }, pollingInterval);
            }
        }

        this.___getAndPollCharacteristic = async function(accessory, service, characteristic, isUpdate) {
            return new Promise(resolve => characteristic.getValue((err, value) => {
                if (!err) {
                    const key = `${accessory.UUID}-${accessory.displayName}.${service.UUID}-${service.displayName}-${service.subtype}.${characteristic.UUID}-${characteristic.displayName}`;
                    if (!that.characteristicValues[key] || that.characteristicValues[key].val !== value || isUpdate) {
                        // for accessory updates we should check if we need to repost the value
                        that.characteristicValues[key] = {
                            val: value,
                            ts: Date.now()
                        };
                        that.emit('characteristic-value-change', {
                            accessory,
                            service,
                            characteristic,
                            newValue: value
                        });
                        that.emit('characteristic-value-update', {
                            accessory,
                            service,
                            characteristic,
                            newValue: value
                        });
                    }
                } else {
                    value = undefined;
                }
                this.___handleCharacteristicPolling(accessory, service, characteristic);
                resolve(value);
            }));
        }

        this.___wrapperAccessoryLogic = async function(accessory, external, isUpdate) {
            if (that.knownAccessories[accessory.UUID]) {
                that.logger.debug(`Accessory ${accessory.displayName} with ID ${accessory.UUID} already known`);
                for (const key of Object.keys(that.characteristicPollingTimeouts)) {
                    // Check if we already know the accessory, if yes remove all polling timeouts because will be re-registered
                    if (key.startsWith(`${accessory.UUID}-`)) {
                        clearTimeout(that.characteristicPollingTimeouts[key]);
                        delete that.characteristicPollingTimeouts[key];
                    }
                }
                isUpdate = true;
            }

            if (external) {
                that.emit('addExternalAccessory', accessory);
            } else {
                if (isUpdate) {
                    that.emit('updateAccessory', accessory);
                } else {
                    that.emit('addAccessory', accessory);
                }
            }

            const changeEventHandler = (accessory, data) => {
                const key = `${accessory.UUID}-${accessory.displayName}.${data.service.UUID}-${data.service.displayName}-${data.service.subtype}.${data.characteristic.UUID}-${data.characteristic.displayName}`;
                const now = Date.now();
                if (that.characteristicValues[key] && that.characteristicValues[key].val === data.newValue && that.characteristicValues[key].ts > now - 2000) {
                    // Sometimes events are submitted twice, so we ignore them if they are submitted within 2 seconds with same value
                    return;
                }
                that.characteristicValues[key] = {
                    val: data.newValue,
                    ts: now
                };
                that.emit('characteristic-value-change', {
                    accessory: accessory,
                    service: data.service,
                    characteristic: data.characteristic,
                    oldValue: data.oldValue,
                    newValue: data.newValue
                });
                that.emit('characteristic-value-update', {
                    accessory: accessory,
                    service: data.service,
                    characteristic: data.characteristic,
                    oldValue: data.oldValue,
                    newValue: data.newValue
                });
                this.___handleCharacteristicPolling(accessory, data.service, data.characteristic);
            };

            if (!isUpdate) {
                accessory.on('service-characteristic-change', (data) => {
                    changeEventHandler(accessory, data);
                });
            }

            that.knownAccessories[accessory.UUID] = accessory;

            await this.___pollAccessory(accessory, isUpdate);
        }

        this.___wrapperAccessoryRemoveLogic = function(accessory) {
            if (that.knownAccessories[accessory.UUID] && !that.knownAccessories[accessory.UUID] === accessory) {
                that.logger.debug(`Accessory ${accessory.displayName} with ID ${accessory.UUID} to remove but not the same object as we know`);
                return;
            }
            if (that.knownAccessories[accessory.UUID]) {
                that.logger.debug(`Delete Accessory ${accessory.displayName} with ID ${accessory.UUID}`);
                for (const key of Object.keys(that.characteristicPollingTimeouts)) {
                    // Check if we already know the accessory, if yes remove all polling timeouts because will be re-registered
                    if (key.startsWith(accessory.UUID)) {
                        clearTimeout(that.characteristicPollingTimeouts[key]);
                        delete that.characteristicPollingTimeouts[key];
                    }
                }
            }
            delete that.knownAccessories[accessory.UUID];

            that.emit('removeAccessory', accessory);
        }

        this.addBridgedAccessory = function(accessory, deferUpdate) {
            // Вызов метода родительского класса
            // Calling the method of the parent class
            accessory = this._origAddBridgedAccessory.call(this, accessory, deferUpdate);
            that.logger.debug(`Homebridge Wrapper Bridge addBridgedAccessory ${customStringify(accessory)}`); //OK

            this.___wrapperAccessoryLogic(accessory);
            return accessory;
        };

        this.___pollAccessory = async function ___pollAccessory(accessory, isUpdate) {
            for (const service of accessory.services) {
                await this.___pollAccessoryService(accessory, service, isUpdate);
            }
        };

        this.___pollAccessoryService = async function ___pollAccessoryService(accessory, serviceOrNameOrUUID, isUpdate) {
            if (typeof serviceOrNameOrUUID === 'string') {
                serviceOrNameOrUUID = accessory.services.find(s => s.displayName === serviceOrNameOrUUID || s.UUID === serviceOrNameOrUUID);
            }
            if (!serviceOrNameOrUUID) {
                return;
            }
            for (const characteristic of serviceOrNameOrUUID.characteristics) {
                await this.___getAndPollCharacteristic(accessory, serviceOrNameOrUUID, characteristic, isUpdate);
            }
        };

        this.___pollAccessoryServiceCharacteristic = async function ___pollAccessoryServiceCharacteristic(accessory, serviceOrNameOrUUID, characteristicOrNameOrUUID, isUpdate) {
            if (typeof serviceOrNameOrUUID === 'string') {
                serviceOrNameOrUUID = accessory.services.find(s => s.displayName === serviceOrNameOrUUID || s.UUID === serviceOrNameOrUUID);
            }
            if (serviceOrNameOrUUID && typeof characteristicOrNameOrUUID === 'string') {
                characteristicOrNameOrUUID = serviceOrNameOrUUID.characteristics.find(c => c.displayName === characteristicOrNameOrUUID || c.UUID === characteristicOrNameOrUUID);
            }

            if (!serviceOrNameOrUUID || !characteristicOrNameOrUUID) {
                return;
            }
            return this.___getAndPollCharacteristic(accessory, serviceOrNameOrUUID, characteristicOrNameOrUUID, isUpdate);
        };
    }

    inherits(WrapperBridge, hap.Bridge);

    WrapperBridge.prototype.getBridgedAccessoryByUUID = function (uuid) {
      return this.bridgedAccessories.find(accessory => accessory.UUID === uuid);
    };

    WrapperBridge.prototype.getBridgedAccessoryByName = function (name) {
      return this.bridgedAccessories.find(accessory => accessory.displayName === name);
    };

    this.WrapperBridge = WrapperBridge;

    Server.prototype.printSetupInfo = function(pin) {
    };

    Service.prototype.getCharacteristicByUUID = function (uuid) {
        return this.characteristics.find(characteristic => characteristic.UUID === uuid);
    };

    Accessory.prototype.getServiceByUUID = function (uuid) {
        return this.services.find(service => service.UUID === uuid);
    };

    Accessory.prototype.getCharacteristicByUUID = function (serviceUUID, characteristicUUID) {
        return this.getServiceByUUID(serviceUUID).getCharacteristicByUUID(characteristicUUID);
    };
}

inherits(HomebridgeWrapper, EventEmitter);

HomebridgeWrapper.prototype.init = function init() {
    // Initialize HAP-NodeJS with a custom persist directory
    hapStorage.setCustomStoragePath(User.persistPath());

    const serverOpts = {
        config: this.wrapperConfig,
        hideQRCode: true,
        insecureAccess: this.insecureAccess
    };
    this.server = new Server(serverOpts);
    this.server.bridgeService.bridge = new this.WrapperBridge(this.server.config.bridge.name, hap.uuid.generate("HomeBridge"));
    this.server.bridgeService.bridge.on("characteristic-warning" /* CHARACTERISTIC_WARNING */, function() {
        //TODO
    }.bind(this.server.bridgeService));
    this.server.bridgeService.bridge.on('advertised', () => {
        this.server.setServerStatus('ok');
    });

    // watch for the paired event to update the server status
    this.server.bridgeService.bridge.on('paired', () => {
        this.server.setServerStatus(this.server.serverStatus);
    });

    // watch for the unpaired event to update the server status
    this.server.bridgeService.bridge.on('unpaired', () => {
        this.server.setServerStatus(this.server.serverStatus);
    });

    this.server.bridgeService.api.on('updatePlatformAccessories', (accessories) => {
        if (!Array.isArray(accessories)) {
            return;
        }
        accessories.forEach(accessory => {
            if (!accessory._associatedHAPAccessory) return;

            this.server.bridgeService.bridge.___wrapperAccessoryLogic(accessory._associatedHAPAccessory, false, true)
        });
    });

    this.server.bridgeService.api.on('unregisterPlatformAccessories', (accessories) => {
        if (!Array.isArray(accessories)) {
            return;
        }
        accessories.forEach(accessory => {
            if (!accessory._associatedHAPAccessory) return;
            this.server.bridgeService.bridge.___wrapperAccessoryRemoveLogic(accessory._associatedHAPAccessory)
        });
    });

    const origHandlePublishExternalAccessories = this.server.bridgeService.handlePublishExternalAccessories;
    this.server.bridgeService.handlePublishExternalAccessories = async accessories => {
        for (const accessory of accessories) {
            this.server.bridgeService.bridge.___wrapperAccessoryLogic(accessory, true);
        }
        return origHandlePublishExternalAccessories.call(this.server.bridgeService, accessories);
    }

    this.server.start();
};

HomebridgeWrapper.prototype.finish = function finish() {
    if (this.server) {
        this.server.teardown();
        // Save cached accessories to persist storage.
        this.server.bridgeService && this.server.bridgeService.saveCachedPlatformAccessoriesOnDisk();
    }
    this.removeAllListeners();
    this.server = null;
    if (this.characteristicPollingInterval || this.characteristicPollingList) {
        for (const id of Object.keys(this.characteristicPollingTimeouts)) {
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

HomebridgeWrapper.prototype.pollAccessory = async function pollAccessory(accessory, isUpdate) {
    return this.server.bridgeService.bridge.___pollAccessory(accessory, isUpdate);
};

HomebridgeWrapper.prototype.pollAccessoryService = async function pollAccessoryService(accessory, serviceOrNameOrUUID, isUpdate) {
    return this.server.bridgeService.bridge.___pollAccessoryService(accessory, serviceOrNameOrUUID, isUpdate);
};

HomebridgeWrapper.prototype.pollAccessoryServiceCharacteristic = async function pollAccessoryServiceCharacteristic(accessory, serviceOrNameOrUUID, characteristicOrNameOrUUID, isUpdate) {
    return this.server.bridgeService.bridge.___pollAccessoryServiceCharacteristic(accessory, serviceOrNameOrUUID, characteristicOrNameOrUUID, isUpdate);
};

module.exports = {
    Wrapper: HomebridgeWrapper,
    HapTypes: hapTypes
};
