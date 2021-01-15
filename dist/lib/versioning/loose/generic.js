"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericVersioningApi = exports.create = exports.comparer = exports.parser = void 0;
// since this file was meant for no range support, a range = version
// parse should return null if version not valid
// parse should return an object with property release, an array of version sections major.minor.patch
const parser = (parse) => {
    function isValid(version) {
        if (!version) {
            return null;
        }
        const parsed = parse(version);
        return parsed ? version : null;
    }
    function getSection(version, index) {
        const parsed = parse(version);
        return parsed && parsed.release.length > index
            ? parsed.release[index]
            : null;
    }
    function getMajor(version) {
        return getSection(version, 0);
    }
    function getMinor(version) {
        return getSection(version, 1);
    }
    function getPatch(version) {
        return getSection(version, 2);
    }
    function isStable(version) {
        const parsed = parse(version);
        return parsed && !parsed.prerelease;
    }
    return {
        // validation
        isCompatible: isValid,
        isSingleVersion: isValid,
        isStable,
        isValid,
        isVersion: isValid,
        // digestion of version
        getMajor,
        getMinor,
        getPatch,
    };
};
exports.parser = parser;
// this is the main reason this file was created
// most operations below could be derived from a compare function
const comparer = (compare) => {
    function equals(version, other) {
        return compare(version, other) === 0;
    }
    function isGreaterThan(version, other) {
        return compare(version, other) > 0;
    }
    function isLessThanRange(version, range) {
        return compare(version, range) < 0;
    }
    // we don't not have ranges, so versions has to be equal
    function getSatisfyingVersion(versions, range) {
        return versions.find((v) => equals(v, range)) || null;
    }
    function minSatisfyingVersion(versions, range) {
        return versions.find((v) => equals(v, range)) || null;
    }
    function getNewValue(newValueConfig) {
        const { toVersion } = newValueConfig || {};
        return toVersion;
    }
    function sortVersions(version, other) {
        return compare(version, other);
    }
    return {
        equals,
        isGreaterThan,
        isLessThanRange,
        matches: equals,
        getSatisfyingVersion,
        minSatisfyingVersion,
        getNewValue,
        sortVersions,
    };
};
exports.comparer = comparer;
// helper functions to ease create other versioning schemas with little code
// especially if those schemas do not support ranges
const create = ({ parse, compare, }) => {
    let schema = {};
    if (parse) {
        schema = { ...schema, ...exports.parser(parse) };
    }
    if (compare) {
        schema = { ...schema, ...exports.comparer(compare) };
    }
    return schema;
};
exports.create = create;
class GenericVersioningApi {
    _getSection(version, index) {
        const parsed = this._parse(version);
        return parsed && parsed.release.length > index
            ? parsed.release[index]
            : null;
    }
    isValid(version) {
        return this._parse(version) !== null;
    }
    isCompatible(version, _range) {
        return this.isValid(version);
    }
    isStable(version) {
        const parsed = this._parse(version);
        return parsed && !parsed.prerelease;
    }
    isSingleVersion(version) {
        return this.isValid(version);
    }
    isVersion(version) {
        return this.isValid(version);
    }
    getMajor(version) {
        return this._getSection(version, 0);
    }
    getMinor(version) {
        return this._getSection(version, 1);
    }
    getPatch(version) {
        return this._getSection(version, 2);
    }
    equals(version, other) {
        return this._compare(version, other) === 0;
    }
    isGreaterThan(version, other) {
        return this._compare(version, other) > 0;
    }
    isLessThanRange(version, range) {
        return this._compare(version, range) < 0;
    }
    getSatisfyingVersion(versions, range) {
        return versions.find((v) => this.equals(v, range)) || null;
    }
    minSatisfyingVersion(versions, range) {
        return versions.find((v) => this.equals(v, range)) || null;
    }
    // eslint-disable-next-line class-methods-use-this
    getNewValue(newValueConfig) {
        const { toVersion } = newValueConfig || {};
        return toVersion;
    }
    sortVersions(version, other) {
        return this._compare(version, other);
    }
    matches(version, range) {
        return this.equals(version, range);
    }
}
exports.GenericVersioningApi = GenericVersioningApi;
//# sourceMappingURL=generic.js.map