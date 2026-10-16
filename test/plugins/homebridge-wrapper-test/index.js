'use strict';

/**
 * Accessory plugin for the tests, written with the Homebridge 2 API (onGet / onSet).
 * - CurrentTemperature: read-only, the value is counted up on every read (to test the polling)
 * - On (Switch): read/write, remembers the written value
 */
class WrapperTestAccessory {
    constructor(log, config, api) {
        const { Service, Characteristic } = api.hap;
        this.temperature = config.temperature !== undefined ? config.temperature : 20;
        this.on = false;

        this.information = new Service.AccessoryInformation()
            .setCharacteristic(Characteristic.Manufacturer, 'ioBroker')
            .setCharacteristic(Characteristic.Model, 'Wrapper Test');

        this.sensor = new Service.TemperatureSensor(`${config.name} Temperature`);
        this.sensor.getCharacteristic(Characteristic.CurrentTemperature).onGet(() => this.temperature++);

        this.switch = new Service.Switch(`${config.name} Switch`);
        this.switch
            .getCharacteristic(Characteristic.On)
            .onGet(() => this.on)
            .onSet(value => {
                log.info(`set On to ${value}`);
                this.on = value;
            });
    }

    getServices() {
        return [this.information, this.sensor, this.switch];
    }
}

module.exports = api => {
    api.registerAccessory('WrapperTest', WrapperTestAccessory);
};
