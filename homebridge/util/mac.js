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
var mac_exports = {};
__export(mac_exports, {
  generate: () => generate,
  validMacAddress: () => validMacAddress
});
module.exports = __toCommonJS(mac_exports);
var import_node_crypto = require("node:crypto");
const validMac = /^(?:[0-9A-F]{2}:){5}[0-9A-F]{2}$/;
const PLACEHOLDER_RE = /x/g;
function validMacAddress(address) {
  return validMac.test(address);
}
function generate(data) {
  const sha1sum = (0, import_node_crypto.createHash)("sha1");
  sha1sum.update(data);
  const s = sha1sum.digest("hex");
  let i = 0;
  return "xx:xx:xx:xx:xx:xx".replace(PLACEHOLDER_RE, () => s[i++]).toUpperCase();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generate,
  validMacAddress
});
