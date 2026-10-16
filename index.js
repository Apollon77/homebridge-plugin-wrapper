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

/** The bridge is not published: the mDNS service (ciao is the default advertiser since HAP-NodeJS 1.x) does nothing */
const fakeCiaoService = {
    on() {},
    updatePort() {},
    updateTxt() {},
    advertise: () => Promise.resolve(),
    end: () => Promise.resolve(),
    destroy: () => Promise.resolve(),
};

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

    // plugins that require HAP-NodeJS themselves get the copy of this package
    mock('hap-nodejs', './hap-nodejs');
    mock('@homebridge/hap-nodejs', './hap-nodejs');
    mock('hap-nodejs/accessories/types.js', './hap-nodejs/accessories/types.js');
    mock('hap-nodejs/lib/util/once', './hap-nodejs/lib/util/once');
    mock(path.join(__dirname, '/hap-nodejs/lib/util/eventedhttp.js'), {
        EventedHTTPServer: function () {
            this.listen = function () {
            };
            this.stop = function () {
            };
            this.destroy = function () {
            };
            this.sendEvent = function () {
            };
            this.on = function () {
            };
            this.broadcastEvent = function () {
            };

            that.logger.debug('Fake EventedHTTPServer initialized');
            return this;
        }
    });
    mock('qrcode-terminal', {
        generate: function () {
        },
        setErrorLevel: function () {
        }
    });
    mock('tweetnacl', {
        sign: {
            keyPair: function () {
                return {secretKey: '', publicKey: ''};
            }
        }
    });
    mock('fast-srp-hap', {});
    mock('bonjour-hap', function () {
        return {
            publish: function () {
                return {
                    updateTxt: function () {
                    },
                    stop: function () {
                    },
                    destroy: function () {
                    },
                }
            },
            destroy: function () {
            }
        }
    });
    mock('@homebridge/ciao', {
        getResponder: () => ({
            createService: () => fakeCiaoService,
            shutdown: () => Promise.resolve(),
        }),
    });
    mock('@homebridge/dbus-native', function () {
    });

    User = require(path.join(__dirname, 'homebridge/user')).User;
    hap = require('./hap-nodejs');
    hapStorage = require(path.join(__dirname, 'hap-nodejs/lib/model/HAPStorage')).HAPStorage;

    ServerReq = require(path.join(__dirname, 'homebridge/server'));
    Server = ServerReq.Server;
    Service = hap.Service;
    Accessory = hap.Accessory;
    const { Logger } = require(path.join(__dirname, 'homebridge/logger'));
    if (config.debugModeEnabled) {
        Logger.setDebugEnabled(true);
    }

    this.logger = config.logger;
    this.wrapperConfig = config.wrapperConfig;
    this.characteristicPollingInterval = config.characteristicPollingInterval;
    this.characteristicPollingList = config.characteristicPollingList;
    this.characteristicPollingTimeouts = {};
    this.characteristicValues = {};
    this.insecureAccess = config.insecureAccess;
    this.customPluginPath = config.customPluginPath;
    this.knownAccessories = {};

    if (!this.wrapperConfig.bridge) {
        this.wrapperConfig.bridge = {
            "name": "Homebridge-Wrapper-Bridge",
            "username": "FF:FF:FF:FF:FF:FF",
            "port": 0,
            "pin": "0",
        };
    }

    try {
        if (!fs.existsSync(config.homebridgeConfigPath)) {
            fs.mkdirSync(config.homebridgeConfigPath);
        }
        // Homebridge reads its configuration from this file, some plugins too
        fs.writeFileSync(path.join(config.homebridgeConfigPath, 'config.json'), JSON.stringify(this.wrapperConfig));
    }
    catch (e) {
        that.logger.warn(` Error writing ${path.join(config.homebridgeConfigPath, 'config.json')} - Some Plugins may need that.`);
    }
    User.setStoragePath(config.homebridgeConfigPath);

    // The Bridge of HAP-NodeJS is an ES class, so it is extended with a class (not with util.inherits)
    class WrapperBridge extends hap.Bridge {
        constructor(displayName, serialNumber) {
            that.logger.debug(`Homebridge Wrapper Bridge constructor displayName=${displayName}, UUID=${serialNumber}`);
            super(displayName, serialNumber);
        }

        publish(info, allowInsecureRequest) {
            that.logger.info(`Homebridge Wrapper Bridge publish ${customStringify(info)}`);
            // Calling the method of the parent class
            return super.publish(info, allowInsecureRequest);
        }

        ___handleCharacteristicPolling(accessory, serviceOrNameOrUUID, characteristicOrNameOrUUID) {
            const service = typeof serviceOrNameOrUUID === 'string' ? accessory.services.find(s => s.displayName === serviceOrNameOrUUID || s.UUID === serviceOrNameOrUUID) : serviceOrNameOrUUID;
            const characteristic = typeof characteristicOrNameOrUUID === 'string' ? service.characteristics.find(c => c.displayName === characteristicOrNameOrUUID || c.UUID === characteristicOrNameOrUUID) : characteristicOrNameOrUUID;
            let pollingInterval;
            if (that.characteristicPollingList && (characteristic.displayName in that.characteristicPollingList)) {
                pollingInterval = that.characteristicPollingList[characteristic.displayName];
            } else {
                pollingInterval = that.characteristicPollingInterval;
            }
            if (pollingInterval) {
                const key = `${accessory.UUID}-${accessory.displayName}.${service.UUID}-${service.displayName}-${service.subtype}.${characteristic.UUID}-${characteristic.displayName}`;
                if (that.characteristicPollingTimeouts[key]) {
                    clearTimeout(that.characteristicPollingTimeouts[key]);
                }
                that.characteristicPollingTimeouts[key] = setTimeout(() => {
                    delete that.characteristicPollingTimeouts[key];
                    const currService = accessory.services.find(s => s.UUID === service.UUID && s.displayName === service.displayName && s.subtype === service.subtype);
                    const currCharacteristic = currService.characteristics.find(c => c.UUID === characteristic.UUID && c.displayName === characteristic.displayName);
                    if (!currCharacteristic) {
                        return;
                    }
                    this.___getAndPollCharacteristic(accessory, currService, currCharacteristic, false);
                }, pollingInterval);
            }
        }

        async ___getAndPollCharacteristic(accessory, service, characteristic, isUpdate) {
            if (characteristic.props && characteristic.props.perms && !characteristic.props.perms.includes('pr')) {
                // write-only (e.g. Identify): HAP-NodeJS rejects the read with HAPStatus.WRITE_ONLY_CHARACTERISTIC
                return undefined;
            }
            let value;
            try {
                // calls the get handler of the plugin (HAP-NodeJS has no getValue(callback) anymore)
                value = await characteristic.handleGetRequest();
            } catch (e) {
                // e.g. write-only characteristics or a HAP status error of the plugin
                value = undefined;
            }
            if (value !== undefined) {
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
            }
            this.___handleCharacteristicPolling(accessory, service, characteristic);
            return value;
        }

        async ___wrapperAccessoryLogic(accessory, external, isUpdate) {
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

        ___wrapperAccessoryRemoveLogic(accessory) {
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

        addBridgedAccessory(accessory, deferUpdate) {
            // Calling the method of the parent class
            accessory = super.addBridgedAccessory(accessory, deferUpdate);
            that.logger.debug(`Homebridge Wrapper Bridge addBridgedAccessory ${customStringify(accessory)}`); //OK

            this.___wrapperAccessoryLogic(accessory);
            return accessory;
        }

        async ___pollAccessory(accessory, isUpdate) {
            for (const service of accessory.services) {
                await this.___pollAccessoryService(accessory, service, isUpdate);
            }
        }

        async ___pollAccessoryService(accessory, serviceOrNameOrUUID, isUpdate) {
            if (typeof serviceOrNameOrUUID === 'string') {
                serviceOrNameOrUUID = accessory.services.find(s => s.displayName === serviceOrNameOrUUID || s.UUID === serviceOrNameOrUUID);
            }
            if (!serviceOrNameOrUUID) {
                return;
            }
            for (const characteristic of serviceOrNameOrUUID.characteristics) {
                await this.___getAndPollCharacteristic(accessory, serviceOrNameOrUUID, characteristic, isUpdate);
            }
        }

        async ___pollAccessoryServiceCharacteristic(accessory, serviceOrNameOrUUID, characteristicOrNameOrUUID, isUpdate) {
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
        }

        getBridgedAccessoryByUUID(uuid) {
            return this.bridgedAccessories.find(accessory => accessory.UUID === uuid);
        }

        getBridgedAccessoryByName(name) {
            return this.bridgedAccessories.find(accessory => accessory.displayName === name);
        }
    }

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
        // Homebridge reads the config itself from config.json (written in the constructor)
        hideQRCode: true,
        insecureAccess: this.insecureAccess,
        // additional directory to search for plugins
        customPluginPath: this.customPluginPath,
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

    // Homebridge binds handlePublishExternalAccessories to the API event in the BridgeService constructor,
    // so the external accessories are intercepted by replacing that listener
    const bridgeService = this.server.bridgeService;
    const origHandlePublishExternalAccessories = bridgeService.handlePublishExternalAccessories;
    const handlePublishExternalAccessories = async accessories => {
        for (const accessory of accessories) {
            bridgeService.bridge.___wrapperAccessoryLogic(accessory._associatedHAPAccessory || accessory, true);
        }
        return origHandlePublishExternalAccessories.call(bridgeService, accessories);
    };
    bridgeService.api.removeAllListeners('publishExternalAccessories');
    bridgeService.api.on('publishExternalAccessories', handlePublishExternalAccessories);

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
    return this.server.bridgeService.bridge.getBridgedAccessoryByName(name);
};

HomebridgeWrapper.prototype.getServiceByName = function getServiceByName(accessoryName, serviceName) {
    return this.getAccessoryByName(accessoryName).getService(serviceName);
};

HomebridgeWrapper.prototype.getCharacteristicByName = function getCharacteristicByName(accessoryName, serviceName, characteristicName) {
    return this.getAccessoryByName(accessoryName).getService(serviceName).getCharacteristic(characteristicName);
};


HomebridgeWrapper.prototype.getAccessoryByUUID = function getAccessoryByUUID(uuid) {
    return this.server.bridgeService.bridge.getBridgedAccessoryByUUID(uuid);
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
