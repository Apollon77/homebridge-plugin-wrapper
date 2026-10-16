"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HapStatusError = void 0;
const HAPServer_1 = require("../HAPServer");
/**
 * Throws a HAP status error that is sent back to HomeKit.
 *
 * @example
 * ```ts
 * throw new HapStatusError(HAPStatus.OPERATION_TIMED_OUT);
 * ```
 *
 * @group Utils
 */
class HapStatusError extends Error {
    hapStatus;
    constructor(status) {
        super("HAP Status Error: " + status);
        Object.setPrototypeOf(this, HapStatusError.prototype);
        if ((0, HAPServer_1.IsKnownHAPStatusError)(status)) {
            this.hapStatus = status;
        }
        else {
            this.hapStatus = -70402 /* HAPStatus.SERVICE_COMMUNICATION_FAILURE */;
        }
    }
}
exports.HapStatusError = HapStatusError;
//# sourceMappingURL=hapStatusError.js.map