"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
describe('semver.matches()', () => {
    it('handles tilde greater than', () => {
        expect(_1.api.matches('4.2.0', '~> 4.0')).toBe(true);
        expect(_1.api.matches('4.2.0', '~> 4.0.0')).toBe(false);
    });
});
describe('semver.getSatisfyingVersion()', () => {
    it('handles tilde greater than', () => {
        expect(_1.api.getSatisfyingVersion(['0.4.0', '0.5.0', '4.0.0', '4.2.0', '5.0.0'], '~> 4.0')).toBe('4.2.0');
        expect(_1.api.getSatisfyingVersion(['0.4.0', '0.5.0', '4.0.0', '4.2.0', '5.0.0'], '~> 4.0.0')).toBe('4.0.0');
    });
});
describe('semver.isValid()', () => {
    it('handles comma', () => {
        expect(_1.api.isValid('>= 1.0.0, <= 2.0.0')).toBeTruthy();
    });
});
describe('semver.isLessThanRange()', () => {
    it('handles comma', () => {
        expect(_1.api.isLessThanRange('0.9.0', '>= 1.0.0, <= 2.0.0')).toBe(true);
        expect(_1.api.isLessThanRange('1.9.0', '>= 1.0.0, <= 2.0.0')).toBe(false);
    });
});
describe('semver.minSatisfyingVersion()', () => {
    it('handles tilde greater than', () => {
        expect(_1.api.minSatisfyingVersion(['0.4.0', '0.5.0', '4.2.0', '5.0.0'], '~> 4.0')).toBe('4.2.0');
        expect(_1.api.minSatisfyingVersion(['0.4.0', '0.5.0', '4.2.0', '5.0.0'], '~> 4.0.0')).toBeNull();
    });
});
describe('semver.getNewValue()', () => {
    it('handles tilde greater than', () => {
        expect(_1.api.getNewValue({
            currentValue: '~> 1.2',
            rangeStrategy: 'replace',
            fromVersion: '1.2.3',
            toVersion: '2.0.7',
        })).toEqual('~> 2.0');
        expect(_1.api.getNewValue({
            currentValue: '~> 1.2.0',
            rangeStrategy: 'replace',
            fromVersion: '1.2.3',
            toVersion: '2.0.7',
        })).toEqual('~> 2.0.0');
    });
    it('handles comma dividers', () => {
        expect(_1.api.getNewValue({
            currentValue: '>= 1.0.0, <= 2.0.0',
            rangeStrategy: 'widen',
            fromVersion: '1.2.3',
            toVersion: '2.0.7',
        })).toEqual('>= 1.0.0, <= 2.0.7');
    });
});
//# sourceMappingURL=index.spec.js.map