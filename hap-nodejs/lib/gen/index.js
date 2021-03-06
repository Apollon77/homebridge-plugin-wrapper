"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStream = exports.Remote = exports.TV = exports.Bridged = exports.Generated = exports.BASE_UUID = void 0;
var gen = __importStar(require("./HomeKit"));
var bridged = __importStar(require("./HomeKit-Bridge"));
var tv = __importStar(require("./HomeKit-TV"));
var remote = __importStar(require("./HomeKit-Remote"));
var dataStream = __importStar(require("./HomeKit-DataStream"));
exports.BASE_UUID = '-0000-1000-8000-0026BB765291';
exports.Generated = gen;
exports.Bridged = bridged;
exports.TV = tv;
exports.Remote = remote;
exports.DataStream = dataStream;
//# sourceMappingURL=index.js.map