const __importMetaUrl = require('node:url').pathToFileURL(__filename).href;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var storageService_exports = {};
__export(storageService_exports, {
  StorageService: () => StorageService
});
module.exports = __toCommonJS(storageService_exports);
var import_node_path = require("node:path");
var import_fs_extra = __toESM(require("fs-extra"), 1);
class StorageService {
  baseDirectory;
  constructor(baseDirectory) {
    this.baseDirectory = baseDirectory;
  }
  initSync() {
    return import_fs_extra.default.ensureDirSync(this.baseDirectory);
  }
  getItemSync(itemName) {
    const filePath = (0, import_node_path.resolve)(this.baseDirectory, itemName);
    if (!import_fs_extra.default.pathExistsSync(filePath)) {
      return null;
    }
    return import_fs_extra.default.readJsonSync(filePath);
  }
  async getItem(itemName) {
    const filePath = (0, import_node_path.resolve)(this.baseDirectory, itemName);
    if (!await import_fs_extra.default.pathExists(filePath)) {
      return null;
    }
    return await import_fs_extra.default.readJson(filePath);
  }
  setItemSync(itemName, data) {
    return import_fs_extra.default.writeJsonSync((0, import_node_path.resolve)(this.baseDirectory, itemName), data);
  }
  setItem(itemName, data) {
    return import_fs_extra.default.writeJson((0, import_node_path.resolve)(this.baseDirectory, itemName), data);
  }
  copyItem(srcItemName, destItemName) {
    return import_fs_extra.default.copyFile((0, import_node_path.resolve)(this.baseDirectory, srcItemName), (0, import_node_path.resolve)(this.baseDirectory, destItemName));
  }
  copyItemSync(srcItemName, destItemName) {
    return import_fs_extra.default.copyFileSync((0, import_node_path.resolve)(this.baseDirectory, srcItemName), (0, import_node_path.resolve)(this.baseDirectory, destItemName));
  }
  removeItemSync(itemName) {
    return import_fs_extra.default.removeSync((0, import_node_path.resolve)(this.baseDirectory, itemName));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StorageService
});
