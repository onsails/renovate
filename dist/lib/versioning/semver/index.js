"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.getSatisfyingVersion = exports.isValid = exports.isVersion = exports.supportsRanges = exports.urls = exports.displayName = exports.id = void 0;
const semver_1 = __importDefault(require("semver"));
const semver_stable_1 = __importDefault(require("semver-stable"));
exports.id = 'semver';
exports.displayName = 'Semantic';
exports.urls = ['https://semver.org/'];
exports.supportsRanges = false;
const { is: isStable } = semver_stable_1.default;
const { compare: sortVersions, maxSatisfying: getSatisfyingVersion, minSatisfying: minSatisfyingVersion, major: getMajor, minor: getMinor, patch: getPatch, satisfies: matches, valid, ltr: isLessThanRange, gt: isGreaterThan, eq: equals, } = semver_1.default;
exports.getSatisfyingVersion = getSatisfyingVersion;
// If this is left as an alias, inputs like "17.04.0" throw errors
const isVersion = (input) => valid(input);
exports.isVersion = isVersion;
exports.isValid = exports.isVersion;
function getNewValue({ toVersion }) {
    return toVersion;
}
exports.api = {
    equals,
    getMajor,
    getMinor,
    getPatch,
    isCompatible: exports.isVersion,
    isGreaterThan,
    isLessThanRange,
    isSingleVersion: exports.isVersion,
    isStable,
    isValid: exports.isVersion,
    isVersion: exports.isVersion,
    matches,
    getSatisfyingVersion,
    minSatisfyingVersion,
    getNewValue,
    sortVersions,
};
exports.default = exports.api;
//# sourceMappingURL=index.js.map