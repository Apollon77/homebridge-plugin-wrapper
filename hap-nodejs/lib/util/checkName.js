"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkName = checkName;
/**
 * Checks that supplied field meets Apple HomeKit naming rules
 * https://developer.apple.com/design/human-interface-guidelines/homekit#Help-people-choose-useful-names
 * @private Private API
 */
function checkName(displayName, name, value) {
    // Ensure the string starts and ends with a Unicode letter or number.
    // Allow letters, numbers, space-like characters, apostrophes, and
    // common punctuation in the middle only.
    // Use \p{Zs} instead of \p{Z} to avoid matching line and paragraph separators.
    // Home app validation currently rejects names ending in apostrophes,
    // including U+2019 (curly apostrophe), so the end character is restricted
    // to a Unicode letter or number only.
    if (typeof value === "string" &&
        !/^[\p{L}\p{N}][\p{L}\p{N}\p{Zs}\u2019'&!._:;()/,-]*[\p{L}\p{N}]$/u.test(value)) {
        console.warn("HAP-NodeJS WARNING: The accessory '" + displayName +
            "' has an invalid '" + name +
            "' characteristic ('" + value +
            "'). Please ensure the name starts and ends with a letter or number. " +
            "Only letters, numbers, spaces, apostrophes, and common punctuation " +
            "are supported. Avoid emojis or unsupported symbols. This may prevent " +
            "the accessory from being added in the Home App or cause unresponsiveness.");
    }
}
//# sourceMappingURL=checkName.js.map