"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseTimeout = PromiseTimeout;
exports.awaitEventOnce = awaitEventOnce;
/**
 * @group Utils
 */
function PromiseTimeout(timeout) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), timeout);
    });
}
function awaitEventOnce(element, event, timeout = 5000) {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line prefer-const
        let timeoutId;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resolveListener = (...args) => {
            clearTimeout(timeoutId);
            resolve(args.length ? (args.length === 1 ? args[0] : args) : undefined);
        };
        timeoutId = setTimeout(() => {
            element.removeListener(event, resolveListener);
            reject(new Error(`awaitEvent for event ${event} timed out!`));
        }, timeout);
        element.once(event, resolveListener);
    });
}
//# sourceMappingURL=promise-utils.js.map