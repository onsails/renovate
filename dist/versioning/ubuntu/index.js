"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.supportsRanges = exports.urls = exports.displayName = exports.id = void 0;
exports.id = 'ubuntu';
exports.displayName = 'Ubuntu';
exports.urls = ['https://changelogs.ubuntu.com/meta-release'];
exports.supportsRanges = false;
// validation
function isValid(input) {
    return (typeof input === 'string' &&
        /^(0[4-5]|[6-9]|[1-9][0-9])\.[0-9][0-9](\.[0-9]{1,2})?$/.test(input));
}
function isVersion(input) {
    return isValid(input);
}
function isCompatible(version, _range) {
    return isValid(version);
}
function isSingleVersion(version) {
    return isValid(version) ? true : null;
}
function isStable(version) {
    if (!isValid(version)) {
        return false;
    }
    return /^\d?[02468]\.04/.test(version);
}
// digestion of version
function getMajor(version) {
    if (isValid(version)) {
        const [major] = version.split('.') || [];
        return parseInt(major, 10);
    }
    return null;
}
function getMinor(version) {
    if (isValid(version)) {
        const [, minor] = version.split('.') || [];
        return parseInt(minor, 10);
    }
    return null;
}
function getPatch(version) {
    if (isValid(version)) {
        const [, , patch] = version.split('.') || [];
        return patch ? parseInt(patch, 10) : null;
    }
    return null;
}
// comparison
function equals(version, other) {
    return isVersion(version) && isVersion(other) && version === other;
}
function isGreaterThan(version, other) {
    const xMajor = getMajor(version);
    const yMajor = getMajor(other);
    if (xMajor > yMajor) {
        return true;
    }
    if (xMajor < yMajor) {
        return false;
    }
    const xMinor = getMinor(version);
    const yMinor = getMinor(other);
    if (xMinor > yMinor) {
        return true;
    }
    if (xMinor < yMinor) {
        return false;
    }
    const xPatch = getPatch(version) || 0;
    const yPatch = getPatch(other) || 0;
    return xPatch > yPatch;
}
function getSatisfyingVersion(versions, range) {
    return versions.find((version) => equals(version, range)) ? range : null;
}
function minSatisfyingVersion(versions, range) {
    return getSatisfyingVersion(versions, range);
}
function getNewValue(newValueConfig) {
    return newValueConfig.toVersion;
}
function sortVersions(version, other) {
    if (equals(version, other)) {
        return 0;
    }
    if (isGreaterThan(version, other)) {
        return 1;
    }
    return -1;
}
function matches(version, range) {
    return equals(version, range);
}
exports.api = {
    isCompatible,
    isSingleVersion,
    isStable,
    isValid,
    isVersion,
    getMajor,
    getMinor,
    getPatch,
    equals,
    isGreaterThan,
    getSatisfyingVersion,
    minSatisfyingVersion,
    getNewValue,
    sortVersions,
    matches,
};
exports.default = exports.api;
//# sourceMappingURL=index.js.map