"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configRegexPredicate = exports.isConfigRegex = exports.escapeRegExp = exports.regEx = void 0;
const is_1 = __importDefault(require("@sindresorhus/is"));
const error_messages_1 = require("../constants/error-messages");
const logger_1 = require("../logger");
let RegEx;
try {
    // eslint-disable-next-line
    const RE2 = require('re2');
    // Test if native is working
    new RE2('.*').exec('test');
    logger_1.logger.debug('Using RE2 as regex engine');
    RegEx = RE2;
}
catch (err) {
    logger_1.logger.warn({ err }, 'RE2 not usable, falling back to RegExp');
    RegEx = RegExp;
}
function regEx(pattern, flags) {
    try {
        return new RegEx(pattern, flags);
    }
    catch (err) {
        const error = new Error(error_messages_1.CONFIG_VALIDATION);
        error.configFile = pattern;
        error.validationError = `Invalid regular expression: ${pattern}`;
        throw error;
    }
}
exports.regEx = regEx;
function escapeRegExp(input) {
    return input.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
exports.escapeRegExp = escapeRegExp;
const configValStart = /^!?\//;
const configValEnd = /\/$/;
function isConfigRegex(input) {
    return (is_1.default.string(input) && configValStart.test(input) && configValEnd.test(input));
}
exports.isConfigRegex = isConfigRegex;
function parseConfigRegex(input) {
    try {
        const regexString = input
            .replace(configValStart, '')
            .replace(configValEnd, '');
        return regEx(regexString);
    }
    catch (err) {
        // no-op
    }
    return null;
}
function configRegexPredicate(input) {
    const configRegex = parseConfigRegex(input);
    if (configRegex) {
        const isPositive = !input.startsWith('!');
        return (x) => {
            const res = configRegex.test(x);
            return isPositive ? res : !res;
        };
    }
    return null;
}
exports.configRegexPredicate = configRegexPredicate;
//# sourceMappingURL=regex.js.map