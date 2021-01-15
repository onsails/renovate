"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBaseUrl = exports.ensureTrailingSlash = void 0;
const url_join_1 = __importDefault(require("url-join"));
function ensureTrailingSlash(url) {
    return url.replace(/\/?$/, '/');
}
exports.ensureTrailingSlash = ensureTrailingSlash;
function resolveBaseUrl(baseUrl, input) {
    const inputString = input.toString();
    let host;
    let pathname;
    try {
        ({ host, pathname } = new URL(inputString));
    }
    catch (e) {
        pathname = inputString;
    }
    return host ? inputString : url_join_1.default(baseUrl, pathname || '');
}
exports.resolveBaseUrl = resolveBaseUrl;
//# sourceMappingURL=url.js.map