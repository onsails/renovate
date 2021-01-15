"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
describe('lib/versioning/hex', () => {
    describe('hexScheme.matches()', () => {
        it('handles tilde greater than', () => {
            expect(_1.api.matches('4.2.0', '~> 4.0')).toBe(true);
            expect(_1.api.matches('2.1.0', '~> 2.0.0')).toBe(false);
            expect(_1.api.matches('2.0.0', '>= 2.0.0 and < 2.1.0')).toBe(true);
            expect(_1.api.matches('2.1.0', '== 2.0.0 or < 2.1.0')).toBe(false);
            expect(_1.api.matches('1.9.4', '== 1.9.4')).toBe(true);
            expect(_1.api.matches('1.9.5', '== 1.9.4')).toBe(false);
        });
    });
    it('handles tilde greater than', () => {
        expect(_1.api.getSatisfyingVersion(['0.4.0', '0.5.0', '4.0.0', '4.2.0', '5.0.0'], '~> 4.0')).toBe('4.2.0');
        expect(_1.api.getSatisfyingVersion(['0.4.0', '0.5.0', '4.0.0', '4.2.0', '5.0.0'], '~> 4.0.0')).toBe('4.0.0');
    });
    describe('hexScheme.isValid()', () => {
        it('handles and', () => {
            expect(_1.api.isValid('>= 1.0.0 and <= 2.0.0')).toBeTruthy();
        });
        it('handles or', () => {
            expect(_1.api.isValid('>= 1.0.0 or <= 2.0.0')).toBeTruthy();
        });
        it('handles !=', () => {
            expect(_1.api.isValid('!= 1.0.0')).toBeTruthy();
        });
        it('handles ==', () => {
            expect(_1.api.isValid('== 1.0.0')).toBeTruthy();
        });
    });
    describe('hexScheme.isLessThanRange()', () => {
        it('handles and', () => {
            expect(_1.api.isLessThanRange('0.1.0', '>= 1.0.0 and <= 2.0.0')).toBe(true);
            expect(_1.api.isLessThanRange('1.9.0', '>= 1.0.0 and <= 2.0.0')).toBe(false);
        });
        it('handles or', () => {
            expect(_1.api.isLessThanRange('0.9.0', '>= 1.0.0 or >= 2.0.0')).toBe(true);
            expect(_1.api.isLessThanRange('1.9.0', '>= 1.0.0 or >= 2.0.0')).toBe(false);
        });
    });
    describe('hexScheme.minSatisfyingVersion()', () => {
        it('handles tilde greater than', () => {
            expect(_1.api.minSatisfyingVersion(['0.4.0', '0.5.0', '4.2.0', '5.0.0'], '~> 4.0')).toBe('4.2.0');
            expect(_1.api.minSatisfyingVersion(['0.4.0', '0.5.0', '4.2.0', '5.0.0'], '~> 4.0.0')).toBeNull();
        });
    });
    describe('hexScheme.getNewValue()', () => {
        it('handles exact pin', () => {
            expect(_1.api.getNewValue({
                currentValue: '== 1.2.3',
                rangeStrategy: 'pin',
                fromVersion: '1.2.3',
                toVersion: '2.0.7',
            })).toEqual('== 2.0.7');
        });
        it('handles exact bump', () => {
            expect(_1.api.getNewValue({
                currentValue: '== 3.6.1',
                rangeStrategy: 'bump',
                fromVersion: '3.6.1',
                toVersion: '3.6.2',
            })).toEqual('== 3.6.2');
        });
        it('handles exact replace', () => {
            expect(_1.api.getNewValue({
                currentValue: '== 3.6.1',
                rangeStrategy: 'replace',
                fromVersion: '3.6.1',
                toVersion: '3.6.2',
            })).toEqual('== 3.6.2');
        });
        it('handles tilde greater than', () => {
            expect(_1.api.getNewValue({
                currentValue: '~> 1.2',
                rangeStrategy: 'replace',
                fromVersion: '1.2.3',
                toVersion: '2.0.7',
            })).toEqual('~> 2.0');
            expect(_1.api.getNewValue({
                currentValue: '~> 1.2',
                rangeStrategy: 'pin',
                fromVersion: '1.2.3',
                toVersion: '2.0.7',
            })).toEqual('== 2.0.7');
            expect(_1.api.getNewValue({
                currentValue: '~> 1.2',
                rangeStrategy: 'bump',
                fromVersion: '1.2.3',
                toVersion: '2.0.7',
            })).toEqual('~> 2');
            expect(_1.api.getNewValue({
                currentValue: '~> 1.2.0',
                rangeStrategy: 'replace',
                fromVersion: '1.2.3',
                toVersion: '2.0.7',
            })).toEqual('~> 2.0.0');
            expect(_1.api.getNewValue({
                currentValue: '~> 1.2.0',
                rangeStrategy: 'pin',
                fromVersion: '1.2.3',
                toVersion: '2.0.7',
            })).toEqual('== 2.0.7');
            expect(_1.api.getNewValue({
                currentValue: '~> 1.2.0',
                rangeStrategy: 'bump',
                fromVersion: '1.2.3',
                toVersion: '2.0.7',
            })).toEqual('~> 2.0.7');
        });
    });
    it('handles and', () => {
        expect(_1.api.getNewValue({
            currentValue: '>= 1.0.0 and <= 2.0.0',
            rangeStrategy: 'widen',
            fromVersion: '1.2.3',
            toVersion: '2.0.7',
        })).toEqual('>= 1.0.0 and <= 2.0.7');
        expect(_1.api.getNewValue({
            currentValue: '>= 1.0.0 and <= 2.0.0',
            rangeStrategy: 'replace',
            fromVersion: '1.2.3',
            toVersion: '2.0.7',
        })).toEqual('<= 2.0.7');
        expect(_1.api.getNewValue({
            currentValue: '>= 1.0.0 and <= 2.0.0',
            rangeStrategy: 'pin',
            fromVersion: '1.2.3',
            toVersion: '2.0.7',
        })).toEqual('== 2.0.7');
    });
    it('handles or', () => {
        expect(_1.api.getNewValue({
            currentValue: '>= 1.0.0 or <= 2.0.0',
            rangeStrategy: 'widen',
            fromVersion: '1.2.3',
            toVersion: '2.0.7',
        })).toEqual('>= 1.0.0 or <= 2.0.7');
        expect(_1.api.getNewValue({
            currentValue: '>= 1.0.0 or <= 2.0.0',
            rangeStrategy: 'replace',
            fromVersion: '1.2.3',
            toVersion: '2.0.7',
        })).toEqual('<= 2.0.7');
        expect(_1.api.getNewValue({
            currentValue: '>= 1.0.0 or <= 2.0.0',
            rangeStrategy: 'pin',
            fromVersion: '1.2.3',
            toVersion: '2.0.7',
        })).toEqual('== 2.0.7');
    });
});
//# sourceMappingURL=index.spec.js.map