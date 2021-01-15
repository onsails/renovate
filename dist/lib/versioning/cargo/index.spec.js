"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
describe('semver.matches()', () => {
    it('handles comma', () => {
        expect(_1.api.matches('4.2.0', '4.2, >= 3.0, < 5.0.0')).toBe(true);
        expect(_1.api.matches('4.2.0', '2.0, >= 3.0, < 5.0.0')).toBe(false);
        expect(_1.api.matches('4.2.0', '4.2.0, < 4.2.4')).toBe(true);
        expect(_1.api.matches('4.2.0', '4.3.0, 3.0.0')).toBe(false);
        expect(_1.api.matches('4.2.0', '> 5.0.0, <= 6.0.0')).toBe(false);
    });
});
describe('semver.getSatisfyingVersion()', () => {
    it('handles comma', () => {
        expect(_1.api.getSatisfyingVersion(['4.2.1', '0.4.0', '0.5.0', '4.0.0', '4.2.0', '5.0.0'], '4.*.0, < 4.2.5')).toBe('4.2.1');
        expect(_1.api.getSatisfyingVersion(['0.4.0', '0.5.0', '4.0.0', '4.2.0', '5.0.0', '5.0.3'], '5.0, > 5.0.0')).toBe('5.0.3');
    });
});
describe('semver.isValid()', () => {
    it('simple constraints are valid', () => {
        expect(_1.api.isValid('1')).toBeTruthy();
        expect(_1.api.isValid('1.2')).toBeTruthy();
        expect(_1.api.isValid('1.2.3')).toBeTruthy();
        expect(_1.api.isValid('^1.2.3')).toBeTruthy();
        expect(_1.api.isValid('~1.2.3')).toBeTruthy();
        expect(_1.api.isValid('1.2.*')).toBeTruthy();
    });
    it('handles comma', () => {
        expect(_1.api.isValid('< 3.0, >= 1.0.0 <= 2.0.0')).toBeTruthy();
        expect(_1.api.isValid('< 3.0, >= 1.0.0 <= 2.0.0, = 5.1.2')).toBeTruthy();
    });
});
describe('semver.isVersion()', () => {
    it('handles comma', () => {
        expect(_1.api.isVersion('1.2.3')).toBeTruthy();
        expect(_1.api.isValid('1.2')).toBeTruthy();
    });
});
describe('semver.isLessThanRange()', () => {
    it('handles comma', () => {
        expect(_1.api.isLessThanRange('0.9.0', '>= 1.0.0 <= 2.0.0')).toBe(true);
        expect(_1.api.isLessThanRange('1.9.0', '>= 1.0.0 <= 2.0.0')).toBe(false);
    });
});
describe('semver.minSatisfyingVersion()', () => {
    it('handles comma', () => {
        expect(_1.api.minSatisfyingVersion(['0.4.0', '0.5.0', '4.2.0', '4.3.0', '5.0.0'], '4.*, > 4.2')).toBe('4.3.0');
        expect(_1.api.minSatisfyingVersion(['0.4.0', '0.5.0', '4.2.0', '5.0.0'], '4.0.0')).toBe('4.2.0');
        expect(_1.api.minSatisfyingVersion(['0.4.0', '0.5.0', '4.2.0', '5.0.0'], '4.0.0, = 0.5.0')).toBeNull();
        expect(_1.api.minSatisfyingVersion(['0.4.0', '0.5.0', '4.2.0', '5.0.0'], '4.0.0, > 4.1.0, <= 4.3.5')).toBe('4.2.0');
        expect(_1.api.minSatisfyingVersion(['0.4.0', '0.5.0', '4.2.0', '5.0.0'], '6.2.0, 3.*')).toBeNull();
    });
});
describe('semver.isSingleVersion()', () => {
    it('returns false if naked version', () => {
        expect(_1.api.isSingleVersion('1.2.3')).toBeFalsy();
        expect(_1.api.isSingleVersion('1.2.3-alpha.1')).toBeFalsy();
    });
    it('returns true if equals', () => {
        expect(_1.api.isSingleVersion('=1.2.3')).toBeTruthy();
        expect(_1.api.isSingleVersion('= 1.2.3')).toBeTruthy();
        expect(_1.api.isSingleVersion('  = 1.2.3')).toBeTruthy();
    });
    it('returns false for partial versions', () => {
        expect(_1.api.isSingleVersion('1')).toBeFalsy();
        expect(_1.api.isSingleVersion('1.2')).toBeFalsy();
    });
    it('returns false for wildcard constraints', () => {
        expect(_1.api.isSingleVersion('*')).toBeFalsy();
        expect(_1.api.isSingleVersion('1.*')).toBeFalsy();
        expect(_1.api.isSingleVersion('1.2.*')).toBeFalsy();
    });
});
describe('semver.getNewValue()', () => {
    it('returns if empty or *', () => {
        expect(_1.api.getNewValue({
            currentValue: null,
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toBeNull();
        expect(_1.api.getNewValue({
            currentValue: '*',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('*');
    });
    it('bumps equals', () => {
        expect(_1.api.getNewValue({
            currentValue: '=1.0.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('=1.1.0');
        expect(_1.api.getNewValue({
            currentValue: '   =1.0.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('=1.1.0');
    });
    it('bumps equals space', () => {
        expect(_1.api.getNewValue({
            currentValue: '= 1.0.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('= 1.1.0');
        expect(_1.api.getNewValue({
            currentValue: '  = 1.0.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('=1.1.0');
        expect(_1.api.getNewValue({
            currentValue: '  =   1.0.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('=1.1.0');
        expect(_1.api.getNewValue({
            currentValue: '=    1.0.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('= 1.1.0');
    });
    it('bumps version range', () => {
        expect(_1.api.getNewValue({
            currentValue: '1.0.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('1.1.0');
    });
    it('bumps short caret to same', () => {
        expect(_1.api.getNewValue({
            currentValue: '^1.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.0.7',
        })).toEqual('^1.0');
    });
    it('replaces with newer', () => {
        expect(_1.api.getNewValue({
            currentValue: '^1.0.0',
            rangeStrategy: 'replace',
            fromVersion: '1.0.0',
            toVersion: '2.0.7',
        })).toEqual('^2.0.0');
    });
    it('replaces with version range', () => {
        expect(_1.api.getNewValue({
            currentValue: '1.0.0',
            rangeStrategy: 'replace',
            fromVersion: '1.0.0',
            toVersion: '2.0.7',
        })).toEqual('2.0.0');
    });
    it('updates naked caret', () => {
        expect(_1.api.getNewValue({
            currentValue: '^1',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '2.1.7',
        })).toEqual('^2');
    });
    it('bumps naked tilde', () => {
        expect(_1.api.getNewValue({
            currentValue: '~1',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.7',
        })).toEqual('~1');
    });
    it('bumps naked major', () => {
        expect(_1.api.getNewValue({
            currentValue: '5',
            rangeStrategy: 'bump',
            fromVersion: '5.0.0',
            toVersion: '5.1.7',
        })).toEqual('5');
        expect(_1.api.getNewValue({
            currentValue: '5',
            rangeStrategy: 'bump',
            fromVersion: '5.0.0',
            toVersion: '6.1.7',
        })).toEqual('6');
    });
    it('bumps naked minor', () => {
        expect(_1.api.getNewValue({
            currentValue: '5.0',
            rangeStrategy: 'bump',
            fromVersion: '5.0.0',
            toVersion: '5.0.7',
        })).toEqual('5.0');
        expect(_1.api.getNewValue({
            currentValue: '5.0',
            rangeStrategy: 'bump',
            fromVersion: '5.0.0',
            toVersion: '5.1.7',
        })).toEqual('5.1');
        expect(_1.api.getNewValue({
            currentValue: '5.0',
            rangeStrategy: 'bump',
            fromVersion: '5.0.0',
            toVersion: '6.1.7',
        })).toEqual('6.1');
    });
    it('replaces minor', () => {
        expect(_1.api.getNewValue({
            currentValue: '5.0',
            rangeStrategy: 'replace',
            fromVersion: '5.0.0',
            toVersion: '6.1.7',
        })).toEqual('6.1');
    });
    it('replaces equals', () => {
        expect(_1.api.getNewValue({
            currentValue: '=1.0.0',
            rangeStrategy: 'replace',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('=1.1.0');
    });
    it('handles long asterisk', () => {
        expect(_1.api.getNewValue({
            currentValue: '1.0.*',
            rangeStrategy: 'replace',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('1.1.*');
    });
    it('handles short asterisk', () => {
        expect(_1.api.getNewValue({
            currentValue: '1.*',
            rangeStrategy: 'replace',
            fromVersion: '1.0.0',
            toVersion: '2.1.0',
        })).toEqual('2.*');
    });
    it('handles updating from stable to unstable', () => {
        expect(_1.api.getNewValue({
            currentValue: '~0.6.1',
            rangeStrategy: 'replace',
            fromVersion: '0.6.8',
            toVersion: '0.7.0-rc.2',
        })).toEqual('~0.7.0-rc');
    });
    it('handles less than version requirements', () => {
        expect(_1.api.getNewValue({
            currentValue: '<1.3.4',
            rangeStrategy: 'replace',
            fromVersion: '1.2.3',
            toVersion: '1.5.0',
        })).toEqual('<1.5.1');
        expect(_1.api.getNewValue({
            currentValue: '< 1.3.4',
            rangeStrategy: 'replace',
            fromVersion: '1.2.3',
            toVersion: '1.5.0',
        })).toEqual('< 1.5.1');
        expect(_1.api.getNewValue({
            currentValue: '<   1.3.4',
            rangeStrategy: 'replace',
            fromVersion: '1.2.3',
            toVersion: '1.5.0',
        })).toEqual('< 1.5.1');
    });
    it('handles less than equals version requirements', () => {
        expect(_1.api.getNewValue({
            currentValue: '<=1.3.4',
            rangeStrategy: 'replace',
            fromVersion: '1.2.3',
            toVersion: '1.5.0',
        })).toEqual('<=1.5.0');
        expect(_1.api.getNewValue({
            currentValue: '<= 1.3.4',
            rangeStrategy: 'replace',
            fromVersion: '1.2.3',
            toVersion: '1.5.0',
        })).toEqual('<= 1.5.0');
        expect(_1.api.getNewValue({
            currentValue: '<=   1.3.4',
            rangeStrategy: 'replace',
            fromVersion: '1.2.3',
            toVersion: '1.5.0',
        })).toEqual('<= 1.5.0');
    });
    it('bumps complex ranges', () => {
        expect(_1.api.getNewValue({
            currentValue: '>= 0.1.21, < 0.2.0',
            rangeStrategy: 'bump',
            fromVersion: '0.1.21',
            toVersion: '0.1.24',
        })).toEqual('>= 0.1.24, < 0.2.0');
        expect(_1.api.getNewValue({
            currentValue: '>= 0.1.21, <= 0.2.0',
            rangeStrategy: 'bump',
            fromVersion: '0.1.21',
            toVersion: '0.1.24',
        })).toEqual('>= 0.1.24, <= 0.2.0');
        expect(_1.api.getNewValue({
            currentValue: '>= 0.0.1, <= 0.1',
            rangeStrategy: 'bump',
            fromVersion: '0.0.1',
            toVersion: '0.0.2',
        })).toEqual('>= 0.0.2, <= 0.1');
        expect(_1.api.getNewValue({
            currentValue: '>= 1.2.3, <= 1',
            rangeStrategy: 'bump',
            fromVersion: '1.2.3',
            toVersion: '1.2.4',
        })).toEqual('>= 1.2.4, <= 1');
        expect(_1.api.getNewValue({
            currentValue: '>= 1.2.3, <= 1.0',
            rangeStrategy: 'bump',
            fromVersion: '1.2.3',
            toVersion: '1.2.4',
        })).toEqual('>= 1.2.4, <= 1.2');
        expect(_1.api.getNewValue({
            currentValue: '>= 0.0.1, < 0.1',
            rangeStrategy: 'bump',
            fromVersion: '0.1.0',
            toVersion: '0.2.1',
        })).toEqual('>= 0.2.1, < 0.3');
    });
});
//# sourceMappingURL=index.spec.js.map