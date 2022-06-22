"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOSLoopbackAddressIfAvailable = exports.getOSLoopbackAddress = exports.findLoopbackAddress = void 0;
var tslib_1 = require("tslib");
var os_1 = (0, tslib_1.__importDefault)(require("os"));
function findLoopbackAddress() {
    var e_1, _a, e_2, _b;
    var ipv6 = undefined; // ::1/128
    var ipv6LinkLocal = undefined; // fe80::/10
    var ipv4 = undefined; // 127.0.0.1/8
    try {
        for (var _c = (0, tslib_1.__values)(Object.entries(os_1.default.networkInterfaces())), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = (0, tslib_1.__read)(_d.value, 2), name = _e[0], infos = _e[1];
            var internal = false;
            try {
                for (var infos_1 = (e_2 = void 0, (0, tslib_1.__values)(infos)), infos_1_1 = infos_1.next(); !infos_1_1.done; infos_1_1 = infos_1.next()) {
                    var info = infos_1_1.value;
                    if (!info.internal) {
                        continue;
                    }
                    internal = true;
                    // @ts-expect-error Nodejs 18+ uses the number 4 the string "IPv4"
                    if (info.family === "IPv4" || info.family === 4) {
                        if (!ipv4) {
                            ipv4 = info.address;
                        }
                        // @ts-expect-error Nodejs 18+ uses the number 6 the string "IPv6"
                    }
                    else if (info.family === "IPv6" || info.family === 6) {
                        if (info.scopeid) {
                            if (!ipv6LinkLocal) {
                                ipv6LinkLocal = info.address + "%" + name; // ipv6 link local addresses are only valid with a scope
                            }
                        }
                        else if (!ipv6) {
                            ipv6 = info.address;
                        }
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (infos_1_1 && !infos_1_1.done && (_b = infos_1.return)) _b.call(infos_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            if (internal) {
                break;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var address = ipv4 || ipv6 || ipv6LinkLocal;
    if (!address) {
        throw new Error("Could not find a valid loopback address on the platform!");
    }
    return address;
}
exports.findLoopbackAddress = findLoopbackAddress;
var loopbackAddress = undefined; // loopback addressed used for the internal http server (::1 or 127.0.0.1)
/**
 * Returns the loopback address for the machine.
 * Uses IPV4 loopback address by default and falls back to global unique IPv6 loopback and then
 * link local IPv6 loopback address.
 * If no loopback interface could be found a error is thrown.
 */
function getOSLoopbackAddress() {
    return loopbackAddress !== null && loopbackAddress !== void 0 ? loopbackAddress : (loopbackAddress = findLoopbackAddress());
}
exports.getOSLoopbackAddress = getOSLoopbackAddress;
/**
 * Refer to {@link getOSLoopbackAddress}.
 * Instead of throwing an error, undefined is returned if loopback interface couldn't be detected.
 */
function getOSLoopbackAddressIfAvailable() {
    try {
        return loopbackAddress !== null && loopbackAddress !== void 0 ? loopbackAddress : (loopbackAddress = findLoopbackAddress());
    }
    catch (error) {
        console.log(error.stack);
        return undefined;
    }
}
exports.getOSLoopbackAddressIfAvailable = getOSLoopbackAddressIfAvailable;
//# sourceMappingURL=net-utils.js.map