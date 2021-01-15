"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.isValid = exports.supportedRangeStrategies = exports.supportsRanges = exports.urls = exports.displayName = exports.id = void 0;
const compare_1 = require("./compare");
Object.defineProperty(exports, "isValid", { enumerable: true, get: function () { return compare_1.isValid; } });
exports.id = 'maven';
exports.displayName = 'Maven';
exports.urls = [
    'https://maven.apache.org/pom.html#Dependency_Version_Requirement_Specification',
    'https://octopus.com/blog/maven-versioning-explained',
    'https://maven.apache.org/enforcer/enforcer-rules/versionRanges.html',
];
exports.supportsRanges = true;
exports.supportedRangeStrategies = ['bump', 'extend', 'pin', 'replace'];
const equals = (a, b) => compare_1.compare(a, b) === 0;
function matches(a, b) {
    if (!b) {
        return false;
    }
    if (compare_1.isVersion(b)) {
        return equals(a, b);
    }
    const ranges = compare_1.parseRange(b);
    if (!ranges) {
        return false;
    }
    return ranges.reduce((result, range) => {
        if (result) {
            return result;
        }
        const { leftType, leftValue, rightType, rightValue } = range;
        let leftResult = true;
        let rightResult = true;
        if (leftValue) {
            leftResult =
                leftType === compare_1.EXCLUDING_POINT
                    ? compare_1.compare(leftValue, a) === -1
                    : compare_1.compare(leftValue, a) !== 1;
        }
        if (rightValue) {
            rightResult =
                rightType === compare_1.EXCLUDING_POINT
                    ? compare_1.compare(a, rightValue) === -1
                    : compare_1.compare(a, rightValue) !== 1;
        }
        return leftResult && rightResult;
    }, false);
}
const getMajor = (version) => {
    if (compare_1.isVersion(version)) {
        const tokens = compare_1.tokenize(version);
        const majorToken = tokens[0];
        return +majorToken.val;
    }
    return null;
};
const getMinor = (version) => {
    if (compare_1.isVersion(version)) {
        const tokens = compare_1.tokenize(version);
        const minorToken = tokens[1];
        if (minorToken && minorToken.type === compare_1.TYPE_NUMBER) {
            return +minorToken.val;
        }
        return 0;
    }
    return null;
};
const getPatch = (version) => {
    if (compare_1.isVersion(version)) {
        const tokens = compare_1.tokenize(version);
        const minorToken = tokens[1];
        const patchToken = tokens[2];
        if (patchToken &&
            minorToken.type === compare_1.TYPE_NUMBER &&
            patchToken.type === compare_1.TYPE_NUMBER) {
            return +patchToken.val;
        }
        return 0;
    }
    return null;
};
const isGreaterThan = (a, b) => compare_1.compare(a, b) === 1;
const isStable = (version) => {
    if (compare_1.isVersion(version)) {
        const tokens = compare_1.tokenize(version);
        for (const token of tokens) {
            if (token.type === compare_1.TYPE_QUALIFIER) {
                const qualType = compare_1.qualifierType(token);
                if (qualType && qualType < compare_1.QualifierTypes.Release) {
                    return false;
                }
            }
        }
        return true;
    }
    return null;
};
// istanbul ignore next
const getSatisfyingVersion = (versions, range) => versions.reduce((result, version) => {
    if (matches(version, range)) {
        if (!result) {
            return version;
        }
        if (isGreaterThan(version, result)) {
            return version;
        }
    }
    return result;
}, null);
function getNewValue({ currentValue, rangeStrategy, toVersion, }) {
    if (compare_1.isVersion(currentValue) || rangeStrategy === 'pin') {
        return toVersion;
    }
    return compare_1.autoExtendMavenRange(currentValue, toVersion);
}
exports.api = {
    equals,
    getMajor,
    getMinor,
    getPatch,
    isCompatible: compare_1.isVersion,
    isGreaterThan,
    isSingleVersion: compare_1.isSingleVersion,
    isStable,
    isValid: compare_1.isValid,
    isVersion: compare_1.isVersion,
    matches,
    getSatisfyingVersion,
    minSatisfyingVersion: getSatisfyingVersion,
    getNewValue,
    sortVersions: compare_1.compare,
};
exports.default = exports.api;
//# sourceMappingURL=index.js.map