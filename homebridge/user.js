const __importMetaUrl = require('node:url').pathToFileURL(__filename).href;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var user_exports = {};
__export(user_exports, {
  User: () => User
});
module.exports = __toCommonJS(user_exports);
var import_node_os = require("node:os");
var import_node_path = require("node:path");
class User {
  static customStoragePath;
  static storageAccessed = false;
  static configPath() {
    return (0, import_node_path.join)(User.storagePath(), "config.json");
  }
  static persistPath() {
    return (0, import_node_path.join)(User.storagePath(), "persist");
  }
  static matterPath() {
    return (0, import_node_path.join)(User.storagePath(), "matter");
  }
  static cachedAccessoryPath() {
    return (0, import_node_path.join)(User.storagePath(), "accessories");
  }
  static storagePath() {
    User.storageAccessed = true;
    return User.customStoragePath ? User.customStoragePath : (0, import_node_path.join)((0, import_node_os.homedir)(), ".homebridge");
  }
  static setStoragePath(...storagePathSegments) {
    if (User.storageAccessed) {
      throw new Error("Storage path was already accessed and cannot be changed anymore. Try initializing your custom storage path earlier!");
    }
    User.customStoragePath = (0, import_node_path.resolve)(...storagePathSegments);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  User
});
