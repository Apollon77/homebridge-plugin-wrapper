'use strict';

var crypto = require('crypto');

module.exports = {
  Advertiser: Advertiser
};


/**
 * Advertiser uses mdns to broadcast the presence of an Accessory to the local network.
 *
 * Note that as of iOS 9, an accessory can only pair with a single client. Instead of pairing your
 * accessories with multiple iOS devices in your home, Apple intends for you to use Home Sharing.
 * To support this requirement, we provide the ability to be "discoverable" or not (via a "service flag" on the
 * mdns payload).
 */

function Advertiser(accessoryInfo) {
  this.accessoryInfo = accessoryInfo;
  this._advertisement = false;

  this._setupHash = this._computeSetupHash();
}

Advertiser.prototype.startAdvertising = function(port) {
  this._advertisement = true;
}

Advertiser.prototype.isAdvertising = function() {
  return this._advertisement;
}

Advertiser.prototype.updateAdvertisement = function() {
}

Advertiser.prototype.stopAdvertising = function() {
  this._advertisement = false;
}

Advertiser.prototype._computeSetupHash = function() {
  var setupHashMaterial = this.accessoryInfo.setupID + this.accessoryInfo.username;
  var hash = crypto.createHash('sha512');
  hash.update(setupHashMaterial);
  var setupHash = hash.digest().slice(0, 4).toString('base64');

  return setupHash;
}
