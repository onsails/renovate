"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parse_1 = require("./parse");
const _1 = __importDefault(require("."));
const { isVersion, matches } = _1.default;
describe('versioning/ivy/match', () => {
    it('parses dynamic revisions', () => {
        expect(parse_1.parseDynamicRevision(null)).toBeNull();
        expect(parse_1.parseDynamicRevision('')).toBeNull();
        expect(parse_1.parseDynamicRevision('latest')).toEqual({
            type: parse_1.REV_TYPE_LATEST,
            value: null,
        });
        expect(parse_1.parseDynamicRevision('latest.release')).toEqual({
            type: parse_1.REV_TYPE_LATEST,
            value: 'release',
        });
        expect(parse_1.parseDynamicRevision('latest.milestone')).toEqual({
            type: parse_1.REV_TYPE_LATEST,
            value: 'milestone',
        });
        expect(parse_1.parseDynamicRevision('latest.integration')).toEqual({
            type: parse_1.REV_TYPE_LATEST,
            value: null,
        });
        expect(parse_1.parseDynamicRevision('.+')).toBeNull();
        expect(parse_1.parseDynamicRevision('1.0.+')).toEqual({
            type: parse_1.REV_TYPE_SUBREV,
            value: '1.0',
        });
        expect(parse_1.parseDynamicRevision('1.2.3.+')).toEqual({
            type: parse_1.REV_TYPE_SUBREV,
            value: '1.2.3',
        });
        [
            '[1.0,2.0]',
            '[1.0,2.0[',
            ']1.0,2.0]',
            ']1.0,2.0[',
            '[1.0,)',
            ']1.0,)',
            '(,2.0]',
            '(,2.0[',
        ].forEach((value) => {
            expect(parse_1.parseDynamicRevision(value)).toEqual({
                type: parse_1.REV_TYPE_RANGE,
                value,
            });
        });
        expect(parse_1.parseDynamicRevision('[0,1),(1,)')).toBeNull();
    });
});
describe('versioning/ivy/index', () => {
    it('validates version string', () => {
        expect(isVersion('')).toBe(false);
        expect(isVersion('1.0.0')).toBe(true);
        expect(isVersion('0')).toBe(true);
        expect(isVersion('0.1-2-sp')).toBe(true);
        expect(isVersion('1-final')).toBe(true);
        expect(isVersion('v1.0.0')).toBe(true);
        expect(isVersion('x1.0.0')).toBe(true);
        expect(isVersion('2.1.1.RELEASE')).toBe(true);
        expect(isVersion('Greenwich.SR1')).toBe(true);
        expect(isVersion('.1')).toBe(false);
        expect(isVersion('1.')).toBe(false);
        expect(isVersion('-1')).toBe(false);
        expect(isVersion('1-')).toBe(false);
        expect(isVersion('latest')).toBe(true);
        expect(isVersion('latest.release')).toBe(true);
        expect(isVersion('latest.milestone')).toBe(true);
        expect(isVersion('latest.integration')).toBe(true);
        expect(isVersion('1.0.+')).toBe(true);
        expect(isVersion('1.0+')).toBe(false);
        expect(isVersion(']0,1[')).toBe(true);
        expect(isVersion('[0,1]')).toBe(true);
        expect(isVersion('[0,1),(1,2]')).toBe(false);
    });
    it('matches against dynamic revisions', () => {
        expect(matches('', 'latest')).toBe(false);
        expect(matches('0', '')).toBe(false);
        expect(matches('0', 'latest')).toBe(true);
        expect(matches('0', 'latest.integration')).toBe(true);
        expect(matches('0', 'latest.release')).toBe(false);
        expect(matches('release', 'latest.release')).toBe(true);
        expect(matches('0.release', 'latest.release')).toBe(true);
        expect(matches('0-release', 'latest.release')).toBe(true);
        expect(matches('0release', 'latest.release')).toBe(true);
        expect(matches('0.RELEASE', 'latest.release')).toBe(true);
        expect(matches('0', 'latest.milestone')).toBe(false);
        expect(matches('milestone', 'latest.milestone')).toBe(true);
        expect(matches('0.milestone', 'latest.milestone')).toBe(true);
        expect(matches('0-milestone', 'latest.milestone')).toBe(true);
        expect(matches('0milestone', 'latest.milestone')).toBe(true);
        expect(matches('0.MILESTONE', 'latest.milestone')).toBe(true);
        expect(matches('0', '1.0.+')).toBe(false);
        expect(matches('1.1.0', '1.2.+')).toBe(false);
        expect(matches('1.2.0', '1.2.+')).toBe(true);
        expect(matches('1.2.milestone', '1.2.+')).toBe(true);
        expect(matches('1.3', '1.2.+')).toBe(false);
        expect(matches('1', '1')).toBe(true);
        expect(matches('1', '0')).toBe(false);
        expect(matches('1', '[0,1]')).toBe(true);
        expect(matches('0', '(0,1)')).toBe(false);
        expect(matches('0', '(0,1[')).toBe(false);
        expect(matches('0', ']0,1)')).toBe(false);
        expect(matches('1', '(0,1)')).toBe(false);
        expect(matches('1', '(0,2)')).toBe(true);
        expect(matches('1', '[0,2]')).toBe(true);
        expect(matches('1', '(,1]')).toBe(true);
        expect(matches('1', '(,1)')).toBe(false);
        expect(matches('1', '[1,)')).toBe(true);
        expect(matches('1', '(1,)')).toBe(false);
    });
});
//# sourceMappingURL=index.spec.js.map