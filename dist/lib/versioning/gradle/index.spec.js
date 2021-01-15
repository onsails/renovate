"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compare_1 = require("./compare");
const _1 = require(".");
describe('versioning/gradle/compare', () => {
    it('returns equality', () => {
        expect(compare_1.compare('1', '1')).toEqual(0);
        expect(compare_1.compare('a', 'a')).toEqual(0);
        expect(compare_1.compare('1a1', '1.a.1')).toEqual(0);
        expect(compare_1.compare('1a1', '1-a-1')).toEqual(0);
        expect(compare_1.compare('1a1', '1_a_1')).toEqual(0);
        expect(compare_1.compare('1a1', '1+a+1')).toEqual(0);
        expect(compare_1.compare('1.a.1', '1a1')).toEqual(0);
        expect(compare_1.compare('1-a-1', '1a1')).toEqual(0);
        expect(compare_1.compare('1_a_1', '1a1')).toEqual(0);
        expect(compare_1.compare('1+a+1', '1a1')).toEqual(0);
        expect(compare_1.compare('1.a.1', '1-a+1')).toEqual(0);
        expect(compare_1.compare('1-a+1', '1.a-1')).toEqual(0);
        expect(compare_1.compare('1.a-1', '1a1')).toEqual(0);
        expect(compare_1.compare('dev', 'dev')).toEqual(0);
        expect(compare_1.compare('rc', 'rc')).toEqual(0);
        expect(compare_1.compare('release', 'release')).toEqual(0);
        expect(compare_1.compare('final', 'final')).toEqual(0);
        expect(compare_1.compare('snapshot', 'SNAPSHOT')).toEqual(0);
        expect(compare_1.compare('SNAPSHOT', 'snapshot')).toEqual(0);
        expect(compare_1.compare('Hoxton.SR1', 'Hoxton.sr-1')).toEqual(0);
    });
    it('returns less than', () => {
        expect(compare_1.compare('1.1', '1.2')).toEqual(-1);
        expect(compare_1.compare('1.a', '1.1')).toEqual(-1);
        expect(compare_1.compare('1.A', '1.B')).toEqual(-1);
        expect(compare_1.compare('1.B', '1.a')).toEqual(-1);
        expect(compare_1.compare('1.a', '1.b')).toEqual(-1);
        expect(compare_1.compare('1.1', '1.1.0')).toEqual(-1);
        expect(compare_1.compare('1.1.a', '1.1')).toEqual(-1);
        expect(compare_1.compare('1.0-dev', '1.0-alpha')).toEqual(-1);
        expect(compare_1.compare('1.0-alpha', '1.0-rc')).toEqual(-1);
        expect(compare_1.compare('1.0-zeta', '1.0-rc')).toEqual(-1);
        expect(compare_1.compare('1.0-rc', '1.0-release')).toEqual(-1);
        expect(compare_1.compare('1.0-release', '1.0-final')).toEqual(-1);
        expect(compare_1.compare('1.0-final', '1.0')).toEqual(-1);
        expect(compare_1.compare('1.0-alpha', '1.0-SNAPSHOT')).toEqual(-1);
        expect(compare_1.compare('1.0-SNAPSHOT', '1.0-zeta')).toEqual(-1);
        expect(compare_1.compare('1.0-zeta', '1.0-rc')).toEqual(-1);
        expect(compare_1.compare('1.0-rc', '1.0')).toEqual(-1);
        expect(compare_1.compare('1.0', '1.0-20150201.121010-123')).toEqual(-1);
        expect(compare_1.compare('1.0-20150201.121010-123', '1.1')).toEqual(-1);
        expect(compare_1.compare('sNaPsHoT', 'snapshot')).toEqual(-1);
        expect(compare_1.compare('Hoxton.RELEASE', 'Hoxton.SR1')).toEqual(-1);
    });
    it('returns greater than', () => {
        expect(compare_1.compare('1.2', '1.1')).toEqual(1);
        expect(compare_1.compare('1.1', '1.1.a')).toEqual(1);
        expect(compare_1.compare('1.B', '1.A')).toEqual(1);
        expect(compare_1.compare('1.a', '1.B')).toEqual(1);
        expect(compare_1.compare('1.b', '1.a')).toEqual(1);
        expect(compare_1.compare('1.1.0', '1.1')).toEqual(1);
        expect(compare_1.compare('1.1', '1.a')).toEqual(1);
        expect(compare_1.compare('1.0-alpha', '1.0-dev')).toEqual(1);
        expect(compare_1.compare('1.0-rc', '1.0-alpha')).toEqual(1);
        expect(compare_1.compare('1.0-rc', '1.0-zeta')).toEqual(1);
        expect(compare_1.compare('1.0-release', '1.0-rc')).toEqual(1);
        expect(compare_1.compare('1.0-final', '1.0-release')).toEqual(1);
        expect(compare_1.compare('1.0', '1.0-final')).toEqual(1);
        expect(compare_1.compare('1.0-SNAPSHOT', '1.0-alpha')).toEqual(1);
        expect(compare_1.compare('1.0-zeta', '1.0-SNAPSHOT')).toEqual(1);
        expect(compare_1.compare('1.0-rc', '1.0-zeta')).toEqual(1);
        expect(compare_1.compare('1.0', '1.0-rc')).toEqual(1);
        expect(compare_1.compare('1.0-20150201.121010-123', '1.0')).toEqual(1);
        expect(compare_1.compare('1.1', '1.0-20150201.121010-123')).toEqual(1);
        expect(compare_1.compare('snapshot', 'sNaPsHoT')).toEqual(1);
        expect(compare_1.compare('Hoxton.SR1', 'Hoxton.RELEASE')).toEqual(1);
    });
    const invalidPrefixRanges = [
        '',
        '1.2.3-SNAPSHOT',
        '1.2..+',
        '1.2.++',
    ];
    it('filters out incorrect prefix ranges', () => {
        invalidPrefixRanges.forEach((rangeStr) => {
            const range = compare_1.parsePrefixRange(rangeStr);
            expect(range).toBeNull();
        });
    });
    const invalidMavenBasedRanges = [
        '',
        '1.2.3-SNAPSHOT',
        '[]',
        '(',
        '[',
        ',',
        '[1.0',
        '1.0]',
        '[1.0],',
        ',[1.0]',
        '[2.0,1.0)',
        '[1.2,1.3],1.4',
        '[1.2,,1.3]',
        '[1,[2,3],4]',
        '[1.3,1.2]',
    ];
    it('filters out incorrect maven-based ranges', () => {
        invalidMavenBasedRanges.forEach((rangeStr) => {
            const range = compare_1.parseMavenBasedRange(rangeStr);
            expect(range).toBeNull();
        });
    });
});
describe('versioning/gradle', () => {
    it('isValid', () => {
        expect(_1.api.isValid('1.0.0')).toBe(true);
        expect(_1.api.isValid('[1.12.6,1.18.6]')).toBe(true);
        expect(_1.api.isValid(undefined)).toBe(false);
    });
    it('isVersion', () => {
        expect(_1.api.isVersion('')).toBe(false);
        expect(_1.api.isVersion('latest.integration')).toBe(false);
        expect(_1.api.isVersion('latest.release')).toBe(false);
        expect(_1.api.isVersion('latest')).toBe(false);
        expect(_1.api.isVersion('1')).toBe(true);
        expect(_1.api.isVersion('a')).toBe(true);
        expect(_1.api.isVersion('A')).toBe(true);
        expect(_1.api.isVersion('1a1')).toBe(true);
        expect(_1.api.isVersion('1.a.1')).toBe(true);
        expect(_1.api.isVersion('1-a-1')).toBe(true);
        expect(_1.api.isVersion('1_a_1')).toBe(true);
        expect(_1.api.isVersion('1+a+1')).toBe(true);
        expect(_1.api.isVersion('1!a!1')).toBe(false);
        expect(_1.api.isVersion('1.0-20150201.121010-123')).toBe(true);
        expect(_1.api.isVersion('dev')).toBe(true);
        expect(_1.api.isVersion('rc')).toBe(true);
        expect(_1.api.isVersion('release')).toBe(true);
        expect(_1.api.isVersion('final')).toBe(true);
        expect(_1.api.isVersion('SNAPSHOT')).toBe(true);
        expect(_1.api.isVersion('1.2')).toBe(true);
        expect(_1.api.isVersion('1..2')).toBe(false);
        expect(_1.api.isVersion('1++2')).toBe(false);
        expect(_1.api.isVersion('1--2')).toBe(false);
        expect(_1.api.isVersion('1__2')).toBe(false);
    });
    it('checks if version is stable', () => {
        expect(_1.api.isStable('')).toBeNull();
        expect(_1.api.isStable('foobar')).toBe(true);
        expect(_1.api.isStable('final')).toBe(true);
        expect(_1.api.isStable('1')).toBe(true);
        expect(_1.api.isStable('1.2')).toBe(true);
        expect(_1.api.isStable('1.2.3')).toBe(true);
        expect(_1.api.isStable('1.2.3.4')).toBe(true);
        expect(_1.api.isStable('v1.2.3.4')).toBe(true);
        expect(_1.api.isStable('1-alpha-1')).toBe(false);
        expect(_1.api.isStable('1-b1')).toBe(false);
        expect(_1.api.isStable('1-foo')).toBe(true);
        expect(_1.api.isStable('1-final-1.0.0')).toBe(true);
        expect(_1.api.isStable('1-release')).toBe(true);
        expect(_1.api.isStable('1.final')).toBe(true);
        expect(_1.api.isStable('1.0milestone1')).toBe(false);
        expect(_1.api.isStable('1-sp')).toBe(true);
        expect(_1.api.isStable('1-ga-1')).toBe(true);
        expect(_1.api.isStable('1.3-groovy-2.5')).toBe(true);
        expect(_1.api.isStable('1.3-RC1-groovy-2.5')).toBe(false);
        expect(_1.api.isStable('Hoxton.RELEASE')).toBe(true);
        expect(_1.api.isStable('Hoxton.SR')).toBe(true);
        expect(_1.api.isStable('Hoxton.SR1')).toBe(true);
        // https://github.com/renovatebot/renovate/pull/5789
        expect(_1.api.isStable('1.3.5-native-mt-1.3.71-release-429')).toBe(false);
    });
    it('returns major version', () => {
        expect(_1.api.getMajor('')).toBeNull();
        expect(_1.api.getMajor('1')).toEqual(1);
        expect(_1.api.getMajor('1.2')).toEqual(1);
        expect(_1.api.getMajor('1.2.3')).toEqual(1);
        expect(_1.api.getMajor('v1.2.3')).toEqual(1);
        expect(_1.api.getMajor('1rc42')).toEqual(1);
    });
    it('returns minor version', () => {
        expect(_1.api.getMinor('')).toBeNull();
        expect(_1.api.getMinor('1')).toEqual(0);
        expect(_1.api.getMinor('1.2')).toEqual(2);
        expect(_1.api.getMinor('1.2.3')).toEqual(2);
        expect(_1.api.getMinor('v1.2.3')).toEqual(2);
        expect(_1.api.getMinor('1.2.3.4')).toEqual(2);
        expect(_1.api.getMinor('1-rc42')).toEqual(0);
    });
    it('returns patch version', () => {
        expect(_1.api.getPatch('')).toBeNull();
        expect(_1.api.getPatch('1')).toEqual(0);
        expect(_1.api.getPatch('1.2')).toEqual(0);
        expect(_1.api.getPatch('1.2.3')).toEqual(3);
        expect(_1.api.getPatch('v1.2.3')).toEqual(3);
        expect(_1.api.getPatch('1.2.3.4')).toEqual(3);
        expect(_1.api.getPatch('1-rc10')).toEqual(0);
        expect(_1.api.getPatch('1-rc42-1')).toEqual(0);
    });
    it('matches against maven ranges', () => {
        expect(_1.api.matches('0', '[0,1]')).toBe(true);
        expect(_1.api.matches('1', '[0,1]')).toBe(true);
        expect(_1.api.matches('0', '(0,1)')).toBe(false);
        expect(_1.api.matches('1', '(0,1)')).toBe(false);
        expect(_1.api.matches('1', '(0,2)')).toBe(true);
        expect(_1.api.matches('1', '[0,2]')).toBe(true);
        expect(_1.api.matches('1', '(,1]')).toBe(true);
        expect(_1.api.matches('1', '(,1)')).toBe(false);
        expect(_1.api.matches('1', '[1,)')).toBe(true);
        expect(_1.api.matches('1', '(1,)')).toBe(false);
        expect(_1.api.matches('1', '[[]]')).toBeNull();
        expect(_1.api.matches('0', '')).toBe(false);
        expect(_1.api.matches('1', '1')).toBe(true);
        expect(_1.api.matches('1.2.3', '1.2.+')).toBe(true);
        expect(_1.api.matches('1.2.3.4', '1.2.+')).toBe(true);
        expect(_1.api.matches('1.3.0', '1.2.+')).toBe(false);
        expect(_1.api.matches('foo', '+')).toBe(true);
        expect(_1.api.matches('1', '+')).toBe(true);
        expect(_1.api.matches('99999999999', '+')).toBe(true);
    });
    it('api', () => {
        expect(_1.api.isGreaterThan('1.1', '1')).toBe(true);
        expect(_1.api.minSatisfyingVersion(['0', '1.5', '1', '2'], '1.+')).toBe('1');
        expect(_1.api.getSatisfyingVersion(['0', '1', '1.5', '2'], '1.+')).toBe('1.5');
        expect(_1.api.getNewValue({
            currentValue: '1',
            rangeStrategy: null,
            fromVersion: null,
            toVersion: '1.1',
        })).toBe('1.1');
        expect(_1.api.getNewValue({
            currentValue: '[1.2.3,]',
            rangeStrategy: null,
            fromVersion: null,
            toVersion: '1.2.4',
        })).toBeNull();
    });
    it('pins maven ranges', () => {
        const sample = [
            ['[1.2.3]', '1.2.3', '1.2.4'],
            ['[1.0.0,1.2.3]', '1.0.0', '1.2.4'],
            ['[1.0.0,1.2.23]', '1.0.0', '1.2.23'],
            ['(,1.0]', '0.0.1', '2.0'],
            ['],1.0]', '0.0.1', '2.0'],
            ['(,1.0)', '0.1', '2.0'],
            ['],1.0[', '2.0', '],2.0['],
            ['[1.0,1.2],[1.3,1.5)', '1.0', '1.2.4'],
            ['[1.0,1.2],[1.3,1.5[', '1.0', '1.2.4'],
            ['[1.2.3,)', '1.2.3', '1.2.4'],
            ['[1.2.3,[', '1.2.3', '1.2.4'],
        ];
        sample.forEach(([currentValue, fromVersion, toVersion]) => {
            expect(_1.api.getNewValue({
                currentValue,
                rangeStrategy: 'pin',
                fromVersion,
                toVersion,
            })).toEqual(toVersion);
        });
    });
});
//# sourceMappingURL=index.spec.js.map