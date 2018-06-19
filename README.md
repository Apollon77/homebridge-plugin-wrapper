# homebridge-plugin-wrapper
A wrapper to use Homebridge plugins without big dependecies in own projects

## Why a Homebridge Wrapper?
Homebridge is a great project with currently 1200 available plugins and many
active developers that provide integrations for many IoT devices.

So the idea was to allow other Node-JS based projects to use the work done by
all the Homebridge-Plugin developers in their projects. First of all I use it
for ioBroker (https://iobroker.net).

## How it works?
This project contains copies and slightly changed files from Homebridge and
HAP-NodeJS and only minimal dependecies. Especially the whole MDNS and
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
Then you can start the example via **node example.js** and it outputs all available characteristics.
The example file also contain an example how to get and set a value.

## How to use it?
Basically you create an object instance and providing a configuration object to the constructor. The configuration needs to have a "logger" object with *info* and *debug* functions, a directory to store Homebridge Persist-Files in "homebridgeConfigPath" and finally the Homebridge configuration in "wrapperConfig". See the example file.

After that you can register to the following events:
* characteristic-value-change: This Event will be triggered as soon as a value of one of the characteristics change and also initially to get the initial value. The event contains one object with keys for "accessory", "service", "characteristic" objects, "oldValue" and "newValue". See example.
* addAccessory: this event is triggered with the added accessory on initialization and allows you to get ober all services and characteristics and get all data that you want and need (like displayNames or UUIDs)

To really start you call *init* method and at the end *finish* to clean up.

The example contains code how to get and set values.

## What's changed on Homebridge/HAP-NodeJS?
* Homeebridge: version.js to return the version of the files "static" instead of a dynamic lookup
* HAP-NodeJS: HAPServer.js only has minimal functions because not needed
* HAP-NodeJS: Advertiser.js only has minimal functions because not needed
* Mocked away: qrcode-terminal, ed25519-hap

## Todo
* More/Better Documentation :-) (open Issue if you need it)

# Changelog

## 0.4.7
* add modules ip and chalk as dependecies and remove from mocked

## < 0.4.6
* initial versions

## Credits
This Wrapper is based on the outstanding work and code from the following projects:
* [Homebridge](https://github.com/nfarina/homebridge) from [nfarina](http://twitter.com/nfarina)
* [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) from [KhaosT](http://twitter.com/khaost)

This project uses copies of most of the code from both projects tp provide the functionality
