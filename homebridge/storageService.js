"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class StorageService {
    constructor(baseDirectory) {
        this.baseDirectory = baseDirectory;
    }
    initSync() {
        return fs.ensureDirSync(this.baseDirectory);
    }
    getItemSync(itemName) {
        const filePath = path.resolve(this.baseDirectory, itemName);
        if (!fs.pathExistsSync(filePath)) {
            return null;
        }
        return fs.readJsonSync(filePath);
    }
    async getItem(itemName) {
        const filePath = path.resolve(this.baseDirectory, itemName);
        if (!await fs.pathExists(filePath)) {
            return null;
        }
        return await fs.readJson(filePath);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setItemSync(itemName, data) {
        return fs.writeJsonSync(path.resolve(this.baseDirectory, itemName), data);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setItem(itemName, data) {
        return fs.writeJson(path.resolve(this.baseDirectory, itemName), data);
    }
    copyItem(srcItemName, destItemName) {
        return fs.copyFile(path.resolve(this.baseDirectory, srcItemName), path.resolve(this.baseDirectory, destItemName));
    }
    copyItemSync(srcItemName, destItemName) {
        return fs.copyFileSync(path.resolve(this.baseDirectory, srcItemName), path.resolve(this.baseDirectory, destItemName));
    }
    removeItemSync(itemName) {
        return fs.removeSync(path.resolve(this.baseDirectory, itemName));
    }
}
exports.StorageService = StorageService;
//# sourceMappingURL=storageService.js.map