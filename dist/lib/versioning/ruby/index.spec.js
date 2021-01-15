"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
describe('semverRuby', () => {
    describe('.equals', () => {
        it('returns true when versions are equal', () => {
            expect(_1.api.equals('1.0.0', '1')).toBe(true);
            expect(_1.api.equals('1.2.0', '1.2')).toBe(true);
            expect(_1.api.equals('1.2.0', '1.2.0')).toBe(true);
            expect(_1.api.equals('1.0.0.rc1', '1.0.0.rc1')).toBe(true);
        });
        it('returns false when versions are different', () => {
            expect(_1.api.equals('1.2.0', '2')).toBe(false);
            expect(_1.api.equals('1.2.0', '1.1')).toBe(false);
            expect(_1.api.equals('1.2.0', '1.2.1')).toBe(false);
            expect(_1.api.equals('1.0.0.rc1', '1.0.0.rc2')).toBe(false);
        });
    });
    describe('.getMajor', () => {
        it('returns major segment of version', () => {
            expect(_1.api.getMajor('1')).toEqual(1);
            expect(_1.api.getMajor('1.2')).toEqual(1);
            expect(_1.api.getMajor('1.2.0')).toEqual(1);
            expect(_1.api.getMajor('1.2.0.alpha.4')).toEqual(1);
        });
    });
    describe('.getMinor', () => {
        it('returns minor segment of version when it present', () => {
            expect(_1.api.getMinor('1.2')).toEqual(2);
            expect(_1.api.getMinor('1.2.0')).toEqual(2);
            expect(_1.api.getMinor('1.2.0.alpha.4')).toEqual(2);
        });
        it('returns null when minor segment absent', () => {
            expect(_1.api.getMinor('1')).toBeNull();
        });
    });
    describe('.getPatch', () => {
        it('returns patch segment of version when it present', () => {
            expect(_1.api.getPatch('1.2.2')).toEqual(2);
            expect(_1.api.getPatch('1.2.1.alpha.4')).toEqual(1);
        });
        it('returns null when patch segment absent', () => {
            expect(_1.api.getPatch('1')).toBeNull();
            expect(_1.api.getPatch('1.2')).toBeNull();
        });
    });
    describe('.isVersion', () => {
        it('returns true when version is valid', () => {
            expect(_1.api.isVersion('0')).toBe(true);
            expect(_1.api.isVersion('v0')).toBe(true);
            expect(_1.api.isVersion('v1')).toBe(true);
            expect(_1.api.isVersion('v1.2')).toBe(true);
            expect(_1.api.isVersion('v1.2.3')).toBe(true);
            expect(_1.api.isVersion('1')).toBe(true);
            expect(_1.api.isVersion('1.1')).toBe(true);
            expect(_1.api.isVersion('1.1.2')).toBe(true);
            expect(_1.api.isVersion('1.1.2.3')).toBe(true);
            expect(_1.api.isVersion('1.1.2-4')).toBe(true);
            expect(_1.api.isVersion('1.1.2.pre.4')).toBe(true);
            expect(_1.api.isVersion('v1.1.2.pre.4')).toBe(true);
        });
        it('returns false when version is invalid', () => {
            expect(_1.api.isVersion(undefined)).toBe(false);
            expect(_1.api.isVersion('')).toBe(false);
            expect(_1.api.isVersion(null)).toBe(false);
            expect(_1.api.isVersion('v')).toBe(false);
            expect(_1.api.isVersion('tottally-not-a-version')).toBe(false);
        });
    });
    describe('.isGreaterThan', () => {
        it('returns true when version is greater than another', () => {
            expect(_1.api.isGreaterThan('2', '1')).toBe(true);
            expect(_1.api.isGreaterThan('2.2', '2.1')).toBe(true);
            expect(_1.api.isGreaterThan('2.2.1', '2.2.0')).toBe(true);
            expect(_1.api.isGreaterThan('3.0.0.rc2', '3.0.0.rc1')).toBe(true);
            expect(_1.api.isGreaterThan('3.0.0-rc.2', '3.0.0-rc.1')).toBe(true);
            expect(_1.api.isGreaterThan('3.0.0.rc1', '3.0.0.beta')).toBe(true);
            expect(_1.api.isGreaterThan('3.0.0-rc.1', '3.0.0-beta')).toBe(true);
            expect(_1.api.isGreaterThan('3.0.0.beta', '3.0.0.alpha')).toBe(true);
            expect(_1.api.isGreaterThan('3.0.0-beta', '3.0.0-alpha')).toBe(true);
            expect(_1.api.isGreaterThan('5.0.1.rc1', '5.0.1.beta1')).toBe(true);
            expect(_1.api.isGreaterThan('5.0.1-rc.1', '5.0.1-beta.1')).toBe(true);
        });
        it('returns false when version is lower than another', () => {
            expect(_1.api.isGreaterThan('1', '2')).toBe(false);
            expect(_1.api.isGreaterThan('2.1', '2.2')).toBe(false);
            expect(_1.api.isGreaterThan('2.2.0', '2.2.1')).toBe(false);
            expect(_1.api.isGreaterThan('3.0.0.rc1', '3.0.0.rc2')).toBe(false);
            expect(_1.api.isGreaterThan('3.0.0-rc.1', '3.0.0-rc.2')).toBe(false);
            expect(_1.api.isGreaterThan('3.0.0.beta', '3.0.0.rc1')).toBe(false);
            expect(_1.api.isGreaterThan('3.0.0-beta', '3.0.0-rc.1')).toBe(false);
            expect(_1.api.isGreaterThan('3.0.0.alpha', '3.0.0.beta')).toBe(false);
            expect(_1.api.isGreaterThan('3.0.0-alpha', '3.0.0-beta')).toBe(false);
            expect(_1.api.isGreaterThan('5.0.1.beta1', '5.0.1.rc1')).toBe(false);
            expect(_1.api.isGreaterThan('5.0.1-beta.1', '5.0.1-rc.1')).toBe(false);
        });
        it('returns false when versions are equal', () => {
            expect(_1.api.isGreaterThan('1', '1')).toBe(false);
            expect(_1.api.isGreaterThan('2.1', '2.1')).toBe(false);
            expect(_1.api.isGreaterThan('2.2.0', '2.2.0')).toBe(false);
            expect(_1.api.isGreaterThan('3.0.0.rc1', '3.0.0.rc1')).toBe(false);
            expect(_1.api.isGreaterThan('3.0.0-rc.1', '3.0.0-rc.1')).toBe(false);
            expect(_1.api.isGreaterThan('3.0.0.beta', '3.0.0.beta')).toBe(false);
            expect(_1.api.isGreaterThan('3.0.0-beta', '3.0.0-beta')).toBe(false);
            expect(_1.api.isGreaterThan('3.0.0.alpha', '3.0.0.alpha')).toBe(false);
            expect(_1.api.isGreaterThan('3.0.0-alpha', '3.0.0-alpha')).toBe(false);
            expect(_1.api.isGreaterThan('5.0.1.beta1', '5.0.1.beta1')).toBe(false);
            expect(_1.api.isGreaterThan('5.0.1-beta.1', '5.0.1-beta.1')).toBe(false);
        });
    });
    describe('.isStable', () => {
        it('returns true when version is stable', () => {
            expect(_1.api.isStable('1')).toBe(true);
            expect(_1.api.isStable('1.2')).toBe(true);
            expect(_1.api.isStable('1.2.3')).toBe(true);
        });
        it('returns false when version is prerelease', () => {
            expect(_1.api.isStable('1.2.0-alpha')).toBe(false);
            expect(_1.api.isStable('1.2.0.alpha')).toBe(false);
            expect(_1.api.isStable('1.2.0.alpha1')).toBe(false);
            expect(_1.api.isStable('1.2.0-alpha.1')).toBe(false);
        });
        it('returns false when version is invalid', () => {
            expect(_1.api.isStable(undefined)).toBe(false);
            expect(_1.api.isStable('')).toBe(false);
            expect(_1.api.isStable(null)).toBe(false);
            expect(_1.api.isStable('tottally-not-a-version')).toBe(false);
        });
    });
    describe('.sortVersions', () => {
        it('sorts versions in an ascending order', () => {
            expect(['1.2.3-beta', '2.0.1', '1.3.4', '1.2.3'].sort(_1.api.sortVersions)).toEqual(['1.2.3-beta', '1.2.3', '1.3.4', '2.0.1']);
        });
    });
    describe('.minSatisfyingVersion', () => {
        it('returns lowest version that matches range', () => {
            expect(_1.api.minSatisfyingVersion(['2.1.5', '2.1.6'], '~> 2.1')).toEqual('2.1.5');
            expect(_1.api.minSatisfyingVersion(['2.1.6', '2.1.5'], '~> 2.1.6')).toEqual('2.1.6');
            expect(_1.api.minSatisfyingVersion(['4.7.3', '4.7.4', '4.7.5', '4.7.9'], '~> 4.7, >= 4.7.4')).toEqual('4.7.4');
            expect(_1.api.minSatisfyingVersion(['2.5.3', '2.5.4', '2.5.5', '2.5.6'], '~>2.5.3')).toEqual('2.5.3');
            expect(_1.api.minSatisfyingVersion(['2.1.0', '3.0.0.beta', '2.3', '3.0.0-rc.1', '3.0.0', '3.1.1'], '~> 3.0')).toEqual('3.0.0');
        });
        it('returns null if version that matches range absent', () => {
            expect(_1.api.minSatisfyingVersion(['1.2.3', '1.2.4'], '>= 3.5.0')).toBeNull();
        });
    });
    describe('.getSatisfyingVersion', () => {
        it('returns greatest version that matches range', () => {
            expect(_1.api.getSatisfyingVersion(['2.1.5', '2.1.6'], '~> 2.1')).toEqual('2.1.6');
            expect(_1.api.getSatisfyingVersion(['2.1.6', '2.1.5'], '~> 2.1.6')).toEqual('2.1.6');
            expect(_1.api.getSatisfyingVersion(['4.7.3', '4.7.4', '4.7.5', '4.7.9'], '~> 4.7, >= 4.7.4')).toEqual('4.7.9');
            expect(_1.api.getSatisfyingVersion(['2.5.3', '2.5.4', '2.5.5', '2.5.6'], '~>2.5.3')).toEqual('2.5.6');
            expect(_1.api.getSatisfyingVersion(['2.1.0', '3.0.0.beta', '2.3', '3.0.0-rc.1', '3.0.0', '3.1.1'], '~> 3.0')).toEqual('3.1.1');
        });
        it('returns null if version that matches range absent', () => {
            expect(_1.api.getSatisfyingVersion(['1.2.3', '1.2.4'], '>= 3.5.0')).toBeNull();
        });
    });
    describe('.matches', () => {
        it('returns true when version match range', () => {
            expect(_1.api.matches('1.2', '>= 1.2')).toBe(true);
            expect(_1.api.matches('1.2.3', '~> 1.2.1')).toBe(true);
            expect(_1.api.matches('1.2.7', '1.2.7')).toBe(true);
            expect(_1.api.matches('1.1.6', '>= 1.1.5, < 2.0')).toBe(true);
        });
        it('returns false when version not match range', () => {
            expect(_1.api.matches('1.2', '>= 1.3')).toBe(false);
            expect(_1.api.matches('1.3.8', '~> 1.2.1')).toBe(false);
            expect(_1.api.matches('1.3.9', '1.3.8')).toBe(false);
            expect(_1.api.matches('2.0.0', '>= 1.1.5, < 2.0')).toBe(false);
        });
    });
    describe('.isLessThanRange', () => {
        it('returns true when version less than range', () => {
            expect(_1.api.isLessThanRange('1.2.2', '< 1.2.2')).toBe(true);
            expect(_1.api.isLessThanRange('1.1.4', '>= 1.1.5, < 2.0')).toBe(true);
            expect(_1.api.isLessThanRange('1.2.0-alpha', '1.2.0-beta')).toBe(true);
            expect(_1.api.isLessThanRange('1.2.2', '> 1.2.2, ~> 2.0.0')).toBe(true);
        });
        it('returns false when version greater or satisfies range', () => {
            expect(_1.api.isLessThanRange('1.2.2', '<= 1.2.2')).toBe(false);
            expect(_1.api.isLessThanRange('2.0.0', '>= 1.1.5, < 2.0')).toBe(false);
            expect(_1.api.isLessThanRange('1.2.0-beta', '1.2.0-alpha')).toBe(false);
            expect(_1.api.isLessThanRange('2.0.0', '> 1.2.2, ~> 2.0.0')).toBe(false);
        });
        it('returns null for garbage version input', () => {
            expect(_1.api.isLessThanRange('asdf', '> 1.2.2, ~> 2.0.0')).toBeNull();
            expect(_1.api.isLessThanRange(null, '> 1.2.2, ~> 2.0.0')).toBeNull();
        });
    });
    describe('.isValid', () => {
        it('returns true when version is valid', () => {
            expect(_1.api.isValid('1')).toBe(true);
            expect(_1.api.isValid('1.1')).toBe(true);
            expect(_1.api.isValid('1.1.2')).toBe(true);
            expect(_1.api.isValid('1.2.0.alpha1')).toBe(true);
            expect(_1.api.isValid('1.2.0-alpha.1')).toBe(true);
            expect(_1.api.isValid('= 1')).toBe(true);
            expect(_1.api.isValid('!= 1.1')).toBe(true);
            expect(_1.api.isValid('> 1.1.2')).toBe(true);
            expect(_1.api.isValid('< 1.0.0-beta')).toBe(true);
            expect(_1.api.isValid('>= 1.0.0.beta')).toBe(true);
            expect(_1.api.isValid('<= 1.2.0.alpha1')).toBe(true);
            expect(_1.api.isValid('~> 1.2.0-alpha.1')).toBe(true);
        });
        it('returns true when range is valid', () => {
            expect(_1.api.isValid('>= 3.0.5, < 3.2')).toBe(true);
        });
        it('returns false when version is invalid', () => {
            expect(_1.api.isVersion(undefined)).toBe(false);
            expect(_1.api.isVersion('')).toBe(false);
            expect(_1.api.isVersion(null)).toBe(false);
            expect(_1.api.isVersion('tottally-not-a-version')).toBe(false);
            expect(_1.api.isValid('+ 1')).toBe(false);
            expect(_1.api.isValid('- 1.1')).toBe(false);
            expect(_1.api.isValid('=== 1.1.2')).toBe(false);
            expect(_1.api.isValid('! 1.0.0-beta')).toBe(false);
            expect(_1.api.isValid('& 1.0.0.beta')).toBe(false);
        });
    });
    describe('.isSingleVersion', () => {
        it('returns true when version is single', () => {
            expect(_1.api.isSingleVersion('1')).toBe(true);
            expect(_1.api.isSingleVersion('1.2')).toBe(true);
            expect(_1.api.isSingleVersion('1.2.1')).toBe(true);
            expect(_1.api.isSingleVersion('=1')).toBe(true);
            expect(_1.api.isSingleVersion('=1.2')).toBe(true);
            expect(_1.api.isSingleVersion('=1.2.1')).toBe(true);
            expect(_1.api.isSingleVersion('= 1')).toBe(true);
            expect(_1.api.isSingleVersion('= 1.2')).toBe(true);
            expect(_1.api.isSingleVersion('= 1.2.1')).toBe(true);
            expect(_1.api.isSingleVersion('1.2.1.rc1')).toBe(true);
            expect(_1.api.isSingleVersion('1.2.1-rc.1')).toBe(true);
            expect(_1.api.isSingleVersion('= 1.2.0.alpha')).toBe(true);
            expect(_1.api.isSingleVersion('= 1.2.0-alpha')).toBe(true);
        });
        it('returns false when version is multiple', () => {
            expect(_1.api.isSingleVersion('!= 1')).toBe(false);
            expect(_1.api.isSingleVersion('> 1.2')).toBe(false);
            expect(_1.api.isSingleVersion('< 1.2.1')).toBe(false);
            expect(_1.api.isSingleVersion('>= 1')).toBe(false);
            expect(_1.api.isSingleVersion('<= 1.2')).toBe(false);
            expect(_1.api.isSingleVersion('~> 1.2.1')).toBe(false);
        });
        it('returns false when version is invalid', () => {
            expect(_1.api.isSingleVersion(undefined)).toBe(false);
            expect(_1.api.isSingleVersion('')).toBe(false);
            expect(_1.api.isSingleVersion(null)).toBe(false);
            expect(_1.api.isSingleVersion('tottally-not-a-version')).toBe(false);
        });
    });
    describe('.getNewValue', () => {
        it('returns correct version for pin strategy', () => {
            [
                ['1.2.3', '1.0.3', 'pin', '1.0.3', '1.2.3'],
                ['v1.2.3', 'v1.0.3', 'pin', '1.0.3', '1.2.3'],
                ['= 1.2.3', '= 1.0.3', 'pin', '1.0.3', '1.2.3'],
                ['1.2.3', '!= 1.0.3', 'pin', '1.0.4', '1.2.3'],
                ['1.2.3', '> 1.0.3', 'pin', '1.0.4', '1.2.3'],
                ['1.2.3', '< 1.0.3', 'pin', '1.0.2', '1.2.3'],
                ['1.2.3', '>= 1.0.3', 'pin', '1.0.4', '1.2.3'],
                ['1.2.3', '<= 1.0.3', 'pin', '1.0.3', '1.2.3'],
                ['1.2.3', '~> 1.0.3', 'pin', '1.0.4', '1.2.3'],
                ['4.7.8', '~> 4.7, >= 4.7.4', 'pin', '4.7.5', '4.7.8'],
                [
                    "'>= 3.0.5', '< 3.3'",
                    "'>= 3.0.5', '< 3.2'",
                    'replace',
                    '3.1.5',
                    '3.2.1',
                ],
                ["'0.0.11'", "'0.0.10'", 'replace', '0.0.10', '0.0.11'],
            ].forEach(([expected, currentValue, rangeStrategy, fromVersion, toVersion]) => {
                expect(_1.api.getNewValue({
                    currentValue,
                    rangeStrategy: rangeStrategy,
                    fromVersion,
                    toVersion,
                })).toEqual(expected);
            });
        });
        it('returns correct version for bump strategy', () => {
            [
                ['1.2.3', '1.0.3', 'bump', '1.0.3', '1.2.3'],
                ['v1.2.3', 'v1.0.3', 'bump', '1.0.3', '1.2.3'],
                ['= 1.2.3', '= 1.0.3', 'bump', '1.0.3', '1.2.3'],
                ['!= 1.0.3', '!= 1.0.3', 'bump', '1.0.0', '1.2.3'],
                ['> 1.2.2', '> 1.0.3', 'bump', '1.0.4', '1.2.3'],
                ['> 1.2.3', '> 1.2.3', 'bump', '1.0.0', '1.0.3'],
                ['< 1.2.4', '< 1.0.3', 'bump', '1.0.0', '1.2.3'],
                ['< 1.2.3', '< 1.2.3', 'bump', '1.0.0', '1.0.3'],
                ['< 1.2.4', '< 1.2.2', 'bump', '1.0.0', '1.2.3'],
                ['< 1.2.4', '< 1.2.3', 'bump', '1.0.0', '1.2.3'],
                ['< 1.3', '< 1.2', 'bump', '1.0.0', '1.2.3'],
                ['< 2', '< 1', 'bump', '0.9.0', '1.2.3'],
                ['>= 1.2.3', '>= 1.0.3', 'bump', '1.0.3', '1.2.3'],
                ['<= 1.2.3', '<= 1.0.3', 'bump', '1.0.3', '1.2.3'],
                ['~> 1.2.0', '~> 1.0.3', 'bump', '1.0.3', '1.2.3'],
                ['~> 1.0.0', '~> 1.0.3', 'bump', '1.0.3', '1.0.4'],
                ['~> 4.7.0, >= 4.7.9', '~> 4.7, >= 4.7.4', 'bump', '4.7.5', '4.7.9'],
            ].forEach(([expected, currentValue, rangeStrategy, from, toVersion]) => {
                expect(_1.api.getNewValue({
                    currentValue,
                    rangeStrategy: rangeStrategy,
                    toVersion,
                })).toEqual(expected);
            });
        });
        it('does not error', () => {
            expect(_1.api.getNewValue({
                currentValue: '>= 3.2, < 5.0',
                rangeStrategy: 'replace',
                fromVersion: '4.0.2',
                toVersion: '6.0.1',
            })).toMatchSnapshot();
        });
        it('handles updates to bundler common complex ranges major', () => {
            expect(_1.api.getNewValue({
                currentValue: '~> 5.2, >= 5.2.5',
                rangeStrategy: 'replace',
                fromVersion: '5.3.0',
                toVersion: '6.0.1',
            })).toEqual('~> 6.0, >= 6.0.1');
        });
        it('handles updates to bundler common complex ranges minor', () => {
            expect(_1.api.getNewValue({
                currentValue: '~> 5.2.0, >= 5.2.5',
                rangeStrategy: 'replace',
                fromVersion: '5.2.5',
                toVersion: '5.3.1',
            })).toEqual('~> 5.3.0, >= 5.3.1');
        });
        it('handles change in precision', () => {
            expect(_1.api.getNewValue({
                currentValue: '4.2.0',
                rangeStrategy: 'replace',
                fromVersion: '4.2.0',
                toVersion: '4.2.5.1',
            })).toEqual('4.2.5.1');
            expect(_1.api.getNewValue({
                currentValue: '4.2.5.1',
                rangeStrategy: 'replace',
                fromVersion: '4.2.5.1',
                toVersion: '4.3.0',
            })).toEqual('4.3.0');
        });
        it('handles major ranges', () => {
            expect(_1.api.getNewValue({
                currentValue: '~> 1',
                rangeStrategy: 'replace',
                fromVersion: '1.2.0',
                toVersion: '2.0.3',
            })).toEqual('~> 2');
        });
        it('handles explicit equals', () => {
            expect(_1.api.getNewValue({
                currentValue: '= 5.2.2',
                rangeStrategy: 'replace',
                fromVersion: '5.2.2',
                toVersion: '5.2.2.1',
            })).toEqual('= 5.2.2.1');
        });
        it('returns correct version for replace strategy', () => {
            [
                ['1.2.3', '1.0.3', 'replace', '1.0.3', '1.2.3'],
                ['v1.2.3', 'v1.0.3', 'replace', '1.0.3', '1.2.3'],
                ['= 1.2.3', '= 1.0.3', 'replace', '1.0.3', '1.2.3'],
                ['!= 1.0.3', '!= 1.0.3', 'replace', '1.0.0', '1.2.3'],
                ['< 1.2.4', '< 1.0.3', 'replace', '1.0.0', '1.2.3'],
                ['< 1.2.4', '< 1.2.2', 'replace', '1.0.0', '1.2.3'],
                ['< 1.2.4', '< 1.2.3', 'replace', '1.0.0', '1.2.3'],
                ['< 1.3', '< 1.2', 'replace', '1.0.0', '1.2.3'],
                ['< 2', '< 1', 'replace', '0.9.0', '1.2.3'],
                ['< 1.2.3', '< 1.2.3', 'replace', '1.0.0', '1.2.2'],
                ['>= 1.0.3', '>= 1.0.3', 'replace', '1.0.3', '1.2.3'],
                ['<= 1.2.3', '<= 1.0.3', 'replace', '1.0.0', '1.2.3'],
                ['<= 1.0.3', '<= 1.0.3', 'replace', '1.0.0', '1.0.2'],
                ['~> 1.2.0', '~> 1.0.3', 'replace', '1.0.0', '1.2.3'],
                ['~> 1.0.3', '~> 1.0.3', 'replace', '1.0.0', '1.0.4'],
                ['~> 4.7, >= 4.7.4', '~> 4.7, >= 4.7.4', 'replace', '1.0.0', '4.7.9'],
                [
                    '>= 2.0.0, <= 2.20.1',
                    '>= 2.0.0, <= 2.15',
                    'replace',
                    '2.15.0',
                    '2.20.1',
                ],
                ['~> 6.0.0', '~> 5.2.0', 'replace', '5.2.4.1', '6.0.2.1'],
                ['~> 5.0, < 6', '~> 4.0, < 5', 'replace', '4.7.5', '5.0.0'],
                ['~> 5.0, < 6', '~> 4.0, < 5', 'replace', '4.7.5', '5.0.1'],
                ['~> 5.1, < 6', '~> 4.0, < 5', 'replace', '4.7.5', '5.1.0'],
            ].forEach(([expected, currentValue, rangeStrategy, fromVersion, toVersion]) => {
                expect(_1.api.getNewValue({
                    currentValue,
                    rangeStrategy: rangeStrategy,
                    fromVersion,
                    toVersion,
                })).toEqual(expected);
            });
        });
        it('returns correct version for update-lockfile strategy', () => {
            [
                ['~> 6.0.0', '~> 6.0.0', 'update-lockfile', '6.0.2', '6.0.3'],
                ['~> 7.0.0', '~> 6.0.0', 'update-lockfile', '6.0.2', '7.0.0'],
            ].forEach(([expected, currentValue, rangeStrategy, fromVersion, toVersion]) => {
                expect(_1.api.getNewValue({
                    currentValue,
                    rangeStrategy: rangeStrategy,
                    fromVersion,
                    toVersion,
                })).toEqual(expected);
            });
        });
    });
});
//# sourceMappingURL=index.spec.js.map