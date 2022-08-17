# homebridge-plugin-wrapper
A wrapper to use Homebridge plugins without big dependecies in own projects

[![NPM version](http://img.shields.io/npm/v/homebridge-plugin-wrapper.svg)](https://www.npmjs.com/package/homebridge-plugin-wrapper)
[![Downloads](https://img.shields.io/npm/dm/homebridge-plugin-wrapper.svg)](https://www.npmjs.com/package/homebridge-plugin-wrapper)
![Test and Release](https://github.com/Apollon77/homebridge-plugin-wrapper/workflows/Test%20and%20Release/badge.svg)


## Why a Homebridge Wrapper?
Homebridge is a great project with currently more than 1200 available plugins, and many
active developers that provide integrations for many IoT devices.

So the idea was to allow other Node-JS based projects to use the work done by
all the Homebridge-Plugin developers in their projects. I use it
for ioBroker (https://iobroker.net).

Also, very important is to note, that this project will NOT provide any "Bridge", it just interacts on data level with the plugins.

## How it works?
This project contains copies and slightly changed files from Homebridge and
HAP-NodeJS and only minimal dependencies. Especially the whole MDNS and
Encryption stuff is not included because using the Wrapper is not publishing
the bridge (because not needed).

The wrapper also uses the great "mock-require" module to further minimize
dependencies for modules that are not needed in this usage.
*But this has a side-effect!! The following modules are not usable in your projects currently:*
* qrcode-terminal
* ed25519-hap
If you have a problem with this please contact me via an issue and we can try to find a solution.

## Example?
In the example folder you find a very easy example.
For this to work please install homebridge-sun-position to your testing directory to get the needed plugin.
Then you can start the example via **node example.js**, and it outputs all available characteristics.
The example file also contain an example how to get and set a value.

## How to use it?
Basically you create an object instance and providing a configuration object to the constructor. The configuration needs to have:
* logger: an object with *info* and *debug* functions
* homebridgeConfigPath: a directory to store Homebridge Persist-Files
* wrapperConfig: the Homebridge configuration in "wrapperConfig".
* characteristicPollingInterval: a number in ms in which interval all values will be read to always stay up to date. This can be used if plugins do not send updates from itself

See the example file.

After that you can register to the following events:
* characteristic-value-change: This Event will be triggered as soon as a value of one of the characteristics change and also initially to get the initial value. The event contains one object with keys for "accessory", "service", "characteristic" objects, "oldValue" and "newValue". See example.
* addAccessory: this event is triggered with the added accessory on initialization and allows you to get ober all services and characteristics and get all data that you want and need (like displayNames or UUIDs)

To really start you call *init* method and at the end *finish* to clean up.

The example contains code how to get and set values.

## What will NOT work?
* Since homebridge 1.3.x it is possible to define child bridges for the devices. This idea basically makes no sense when using this library. This means that a configuration with child bridges will fork separate processes, but in fact the library can not access those data, so please do not configure it that way.
* The homebridge UI/config plugins are not working.
* Since homebridge 1.5.0 there might work plugins that run as ESM modules. Not sure if such modules will work with this library.

## What's changed on Homebridge/HAP-NodeJS?
* Homebridge: version.js to return the version of the files "static" instead of a dynamic lookup
* Mocked away: qrcode-terminal, and some more
* In Accessory.js the MAX settings for accessories and services are increased

## Todo
* More/Better Documentation :-) (open Issue if you need it)

## Changelog

### __WORK IN PROGRESS__
* Upgrade to homebridge 1.5.0 (and hap-nodejs 0.10.2)

### 2.2.1 (2022-06-22)
* Fix missing include files

### 2.2.0 (2022-06-22)
* Upgrade to homebridge 1.4.1 (and hap-nodejs 0.10.2)
* Add further tests

### 2.1.1 (2021-05-08)
* fix internal homebridge version file to reflect 1.3.4

### 2.1.0 (2021-03-24)
* upgrade to homebridge 1.3.4 (and hap-nodejs 0.9.4)

### 2.0.3 (2020-11-29)
* upgrade to homebridge 1.1.6 (and hap-nodejs 0.7.9)

### 2.0.1 (2020-08-08)
* set a very high limit (again) on allowed accessories and services because irrelevant

### 2.0.0 (2020-08-03)
* Update to homebridge 1.1.1 with HAP-NodeJS 0.7.7
* characteristicPollingList: Option to poll only specific characteristics instead of all
* event characteristic-value-update: notify even when value does not change. Useful for downstream APIs that timeout without regular updates.

### 1.1.1 (2019-07-08)
* set a very high limit on allowed accessories because irrelevant

### 1.1.0 (2019-06-30)
* sync to homebridge 0.4.50 (Github version from 2019-06-03)

### 1.0.0 (2018-12-04)
* allow to set "insecureAccess" as option and hand this over when initializing Homebridge
* sync to homebridge 0.4.45 (Github version from 2018-12-03)

### 0.5.4 (2018-08-21)
* change logging to prevent crashed on circular structures
* sync to homebridge 0.4.44 (Github version from 2018-08-21)
* sync to HAP-Nodejs 0.4.47 (GitHub version from 2018-08-21)

### 0.5.2
* also store config.json with adapter config in the given config directory because some plugins need it there

### 0.5.1
* add option to poll values in defined intervals
* add semver as dep

### 0.4.7
* add modules ip and chalk as dependecies and remove from mocked

### < 0.4.6
* initial versions

## Credits
This Wrapper is based on the outstanding work and code from the following projects:
* [Homebridge](https://github.com/nfarina/homebridge) from [nfarina](http://twitter.com/nfarina)
* [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) from [KhaosT](http://twitter.com/khaost)

This project uses copies of most of the code from both projects tp provide the functionality
