"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrement = exports.increment = exports.floor = exports.parse = void 0;
const ruby_semver_1 = require("@renovatebot/ruby-semver");
const version_1 = require("@renovatebot/ruby-semver/dist/ruby/version");
function releaseSegments(version) {
    const v = version_1.create(version);
    if (v) {
        return v.release().getSegments();
    }
    /* istanbul ignore next */
    return [];
}
const parse = (version) => ({
    major: ruby_semver_1.major(version),
    minor: ruby_semver_1.minor(version),
    patch: ruby_semver_1.patch(version),
    prerelease: ruby_semver_1.prerelease(version),
});
exports.parse = parse;
const adapt = (left, right) => left.split('.').slice(0, right.split('.').length).join('.');
const floor = (version) => [...releaseSegments(version).slice(0, -1), 0].join('.');
exports.floor = floor;
// istanbul ignore next
const incrementLastSegment = (version) => {
    const segments = releaseSegments(version);
    const nextLast = parseInt(segments.pop(), 10) + 1;
    return [...segments, nextLast].join('.');
};
// istanbul ignore next
const incrementMajor = (maj, min, ptch, pre) => (min === 0 || ptch === 0 || pre.length === 0 ? maj + 1 : maj);
// istanbul ignore next
const incrementMinor = (min, ptch, pre) => ptch === 0 || pre.length === 0 ? min + 1 : min;
// istanbul ignore next
const incrementPatch = (ptch, pre) => pre.length === 0 ? ptch + 1 : ptch;
// istanbul ignore next
const increment = (from, to) => {
    const parsed = parse(from);
    const { major: maj, prerelease: pre } = parsed;
    let { minor: min, patch: ptch } = parsed;
    min = min || 0;
    ptch = ptch || 0;
    let nextVersion;
    const adapted = adapt(to, from);
    if (ruby_semver_1.eq(from, adapted)) {
        return incrementLastSegment(from);
    }
    const isStable = (x) => /^[0-9.-/]+$/.test(x);
    if (ruby_semver_1.major(from) !== ruby_semver_1.major(adapted)) {
        nextVersion = [incrementMajor(maj, min, ptch, pre || []), 0, 0].join('.');
    }
    else if (ruby_semver_1.minor(from) !== ruby_semver_1.minor(adapted)) {
        nextVersion = [maj, incrementMinor(min, ptch, pre || []), 0].join('.');
    }
    else if (ruby_semver_1.patch(from) !== ruby_semver_1.patch(adapted)) {
        nextVersion = [maj, min, incrementPatch(ptch, pre || [])].join('.');
    }
    else if (isStable(from) && isStable(adapted)) {
        nextVersion = [maj, min, incrementPatch(ptch, pre || [])].join('.');
    }
    else {
        nextVersion = [maj, min, ptch].join('.');
    }
    return increment(nextVersion, to);
};
exports.increment = increment;
// istanbul ignore next
const decrement = (version) => {
    const segments = releaseSegments(version);
    const nextSegments = segments
        .reverse()
        .reduce((accumulator, segment, index) => {
        if (index === 0) {
            return [segment - 1];
        }
        if (accumulator[index - 1] === -1) {
            return [
                ...accumulator.slice(0, index - 1),
                0,
                segment - 1,
            ];
        }
        return [...accumulator, segment];
    }, []);
    return nextSegments.reverse().join('.');
};
exports.decrement = decrement;
//# sourceMappingURL=version.js.map