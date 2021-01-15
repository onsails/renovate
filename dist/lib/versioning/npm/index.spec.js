"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
describe('semver.isValid(input)', () => {
    it('should return null for irregular versions', () => {
        expect(_1.api.isValid('17.04.0')).toBeFalsy();
    });
    it('should support simple semver', () => {
        expect(_1.api.isValid('1.2.3')).toBeTruthy();
    });
    it('should support semver with dash', () => {
        expect(_1.api.isValid('1.2.3-foo')).toBeTruthy();
    });
    it('should reject semver without dash', () => {
        expect(_1.api.isValid('1.2.3foo')).toBeFalsy();
    });
    it('should support ranges', () => {
        expect(_1.api.isValid('~1.2.3')).toBeTruthy();
        expect(_1.api.isValid('^1.2.3')).toBeTruthy();
        expect(_1.api.isValid('>1.2.3')).toBeTruthy();
    });
    it('should reject github repositories', () => {
        expect(_1.api.isValid('renovatebot/renovate')).toBeFalsy();
        expect(_1.api.isValid('renovatebot/renovate#master')).toBeFalsy();
        expect(_1.api.isValid('https://github.com/renovatebot/renovate.git')).toBeFalsy();
    });
});
describe('semver.isSingleVersion()', () => {
    it('returns true if naked version', () => {
        expect(_1.api.isSingleVersion('1.2.3')).toBeTruthy();
        expect(_1.api.isSingleVersion('1.2.3-alpha.1')).toBeTruthy();
    });
    it('returns true if equals', () => {
        expect(_1.api.isSingleVersion('=1.2.3')).toBeTruthy();
        expect(_1.api.isSingleVersion('= 1.2.3')).toBeTruthy();
    });
    it('returns false when not version', () => {
        expect(_1.api.isSingleVersion('1.x')).toBeFalsy();
    });
});
describe('semver.getNewValue()', () => {
    it('bumps equals', () => {
        expect(_1.api.getNewValue({
            currentValue: '=1.0.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('=1.1.0');
    });
    it('bumps short caret to same', () => {
        expect(_1.api.getNewValue({
            currentValue: '^1.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.0.7',
        })).toEqual('^1.0');
    });
    it('bumps caret to prerelease', () => {
        expect(_1.api.getNewValue({
            currentValue: '^1',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.0.7-prerelease.1',
        })).toEqual('^1.0.7-prerelease.1');
    });
    it('replaces with newer', () => {
        expect(_1.api.getNewValue({
            currentValue: '^1.0.0',
            rangeStrategy: 'replace',
            fromVersion: '1.0.0',
            toVersion: '1.0.7',
        })).toEqual('^1.0.7');
    });
    it('supports tilde greater than', () => {
        expect(_1.api.getNewValue({
            currentValue: '~> 1.0.0',
            rangeStrategy: 'replace',
            fromVersion: '1.0.0',
            toVersion: '1.1.7',
        })).toEqual('~> 1.1.0');
    });
    it('bumps short caret to new', () => {
        expect(_1.api.getNewValue({
            currentValue: '^1.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.7',
        })).toEqual('^1.1');
    });
    it('bumps short tilde', () => {
        expect(_1.api.getNewValue({
            currentValue: '~1.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.7',
        })).toEqual('~1.1');
    });
    it('bumps tilde to prerelease', () => {
        expect(_1.api.getNewValue({
            currentValue: '~1.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.0.7-prerelease.1',
        })).toEqual('~1.0.7-prerelease.1');
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
    it('bumps greater or equals', () => {
        expect(_1.api.getNewValue({
            currentValue: '>=1.0.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('>=1.1.0');
        expect(_1.api.getNewValue({
            currentValue: '>= 1.0.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('>= 1.1.0');
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
    it('bumps complex ranges', () => {
        expect(_1.api.getNewValue({
            currentValue: '>= 0.1.21 < 0.2.0',
            rangeStrategy: 'bump',
            fromVersion: '0.1.21',
            toVersion: '0.1.24',
        })).toEqual('>= 0.1.24 < 0.2.0');
        expect(_1.api.getNewValue({
            currentValue: '>= 0.1.21 <= 0.2.0',
            rangeStrategy: 'bump',
            fromVersion: '0.1.21',
            toVersion: '0.1.24',
        })).toEqual('>= 0.1.24 <= 0.2.0');
        expect(_1.api.getNewValue({
            currentValue: '>= 0.0.1 <= 0.1',
            rangeStrategy: 'bump',
            fromVersion: '0.0.1',
            toVersion: '0.0.2',
        })).toEqual('>= 0.0.2 <= 0.1');
        expect(_1.api.getNewValue({
            currentValue: '>= 0.0.1 < 0.1',
            rangeStrategy: 'bump',
            fromVersion: '0.1.0',
            toVersion: '0.2.1',
        })).toEqual('>= 0.2.1 < 0.3');
        expect(_1.api.getNewValue({
            currentValue: '>= 0.0.1 < 0.0.4',
            rangeStrategy: 'bump',
            fromVersion: '0.0.4',
            toVersion: '0.0.5',
        })).toEqual('>= 0.0.5 < 0.0.6');
        expect(_1.api.getNewValue({
            currentValue: '>= 0.0.1 < 1',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.0.1',
        })).toEqual('>= 1.0.1 < 2');
        expect(_1.api.getNewValue({
            currentValue: '>= 0.0.1 < 1',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.0.1',
        })).toEqual('>= 1.0.1 < 2');
    });
});
//# sourceMappingURL=index.spec.js.map