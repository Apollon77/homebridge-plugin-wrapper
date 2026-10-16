"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bridge = void 0;
const Accessory_1 = require("./Accessory");
/**
 * Bridge is a special type of HomeKit Accessory that hosts other Accessories "behind" it. This way you
 * can simply publish() the Bridge (with a single HAPServer on a single port) and all bridged Accessories
 * will be hosted automatically, instead of needed to publish() every single Accessory as a separate server.
 *
 * @group Accessory
 */
class Bridge extends Accessory_1.Accessory {
    constructor(displayName, UUID) {
        super(displayName, UUID);
        this._isBridge = true;
    }
}
exports.Bridge = Bridge;
//# sourceMappingURL=Bridge.js.map