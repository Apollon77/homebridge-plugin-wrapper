"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseTimeout = void 0;
function PromiseTimeout(timeout) {
    return new Promise(function (resolve) {
        setTimeout(function () { return resolve(); }, timeout);
    });
}
exports.PromiseTimeout = PromiseTimeout;
//# sourceMappingURL=promise-utils.js.map