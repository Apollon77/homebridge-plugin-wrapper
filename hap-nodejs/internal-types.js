"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consideredTrue = exports.ResourceRequestType = void 0;
var ResourceRequestType;
(function (ResourceRequestType) {
    ResourceRequestType["IMAGE"] = "image";
})(ResourceRequestType = exports.ResourceRequestType || (exports.ResourceRequestType = {}));
function consideredTrue(input) {
    if (!input) {
        return false;
    }
    return input === "true" || input === "1";
}
exports.consideredTrue = consideredTrue;
//# sourceMappingURL=internal-types.js.map