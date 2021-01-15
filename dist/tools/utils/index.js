"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
/**
 * Get environment variable or empty string.
 * Used for easy mocking.
 * @param key variable name
 */
function getEnv(key) {
    var _a;
    return (_a = process.env[key]) !== null && _a !== void 0 ? _a : '';
}
exports.getEnv = getEnv;
//# sourceMappingURL=index.js.map