"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.once = once;
/**
 * Function wrapper to ensure a function/callback is only called once.
 *
 * @group Utils
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function once(func) {
    let called = false;
    return ((...args) => {
        if (called) {
            throw new Error("This callback function has already been called by someone else; it can only be called one time.");
        }
        else {
            called = true;
            return func(...args);
        }
    });
}
//# sourceMappingURL=once.js.map