"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const semver_1 = __importDefault(require("../semver"));
const _1 = __importDefault(require("."));
describe('docker.', () => {
    describe('isValid(version)', () => {
        it('should support all versions length', () => {
            expect(_1.default.isValid(null)).toBeNull();
            expect(_1.default.isValid('1.2.3')).toBe('1.2.3');
            expect(_1.default.isValid('18.04')).toBe('18.04');
            expect(_1.default.isValid('10.1')).toBe('10.1');
            expect(_1.default.isValid('3')).toBe('3');
            expect(_1.default.isValid('foo')).toBeNull();
        });
        it('should return null if the version string looks like a git commit hash', () => {
            [
                '0a1b2c3',
                '0a1b2c3d',
                '0a1b2c3d4e5f6a7b8c9d0a1b2c3d4e5f6a7b8c9d',
            ].forEach((version) => {
                expect(_1.default.isValid(version)).toBeNull();
            });
            [
                '0a1b2c3d4e5f6a7b8c9d0a1b2c3d4e5f6a7b8c9d0',
                '0a1b2C3',
                '0z1b2c3',
                '0A1b2c3d4e5f6a7b8c9d0a1b2c3d4e5f6a7b8c9d',
                '123098140293',
            ].forEach((version) => {
                expect(_1.default.isValid(version)).toBe(version);
            });
        });
    });
    describe('getMajor(version)', () => {
        it('should support all versions length', () => {
            expect(_1.default.getMajor('1.2.3')).toBe(1);
            expect(_1.default.getMajor('18.04')).toBe(18);
            expect(_1.default.getMajor('10.1')).toBe(10);
            expect(_1.default.getMajor('3')).toBe(3);
            expect(_1.default.getMajor('foo')).toBeNull();
        });
    });
    describe('getMinor(version)', () => {
        it('should support all versions length', () => {
            expect(_1.default.getMinor('1.2.3')).toBe(2);
            expect(_1.default.getMinor('18.04')).toBe(4);
            expect(_1.default.getMinor('10.1')).toBe(1);
            expect(_1.default.getMinor('3')).toBeNull();
            expect(_1.default.getMinor('foo')).toBeNull();
        });
    });
    describe('getPatch(version)', () => {
        it('should support all versions length', () => {
            expect(_1.default.getPatch('1.2.3')).toBe(3);
            expect(_1.default.getPatch('18.04')).toBeNull();
            expect(_1.default.getPatch('10.1')).toBeNull();
            expect(_1.default.getPatch('3')).toBeNull();
            expect(_1.default.getPatch('foo')).toBeNull();
        });
    });
    describe('isGreaterThan(version, other)', () => {
        it('should support all versions length', () => {
            expect(_1.default.isGreaterThan('1.2.3', '1.2')).toBe(false);
            expect(_1.default.isGreaterThan('18.04', '18.1')).toBe(true);
            expect(_1.default.isGreaterThan('10.1', '10.1.2')).toBe(true);
            expect(_1.default.isGreaterThan('3', '2')).toBe(true);
            expect(_1.default.isGreaterThan('1.2.3', '1.2.3')).toBe(false);
        });
    });
    describe('isLessThanRange(version, range)', () => {
        it('should support all versions length', () => {
            expect(_1.default.isLessThanRange('1.2.3', '2.0')).toBe(true);
            expect(_1.default.isLessThanRange('18.04', '18.1')).toBe(false);
            expect(_1.default.isLessThanRange('10.1', '10.0.4')).toBe(false);
            expect(_1.default.isLessThanRange('3', '4.0')).toBe(true);
            expect(_1.default.isLessThanRange('1.2', '1.3.4')).toBe(true);
        });
    });
    describe('equals(version, other)', () => {
        it('should support all versions length', () => {
            expect(_1.default.equals('1.2.3', '1.2.3')).toBe(true);
            expect(_1.default.equals('18.04', '18.4')).toBe(true);
            expect(_1.default.equals('10.0', '10.0.4')).toBe(false);
            expect(_1.default.equals('3', '4.0')).toBe(false);
            expect(_1.default.equals('1.2', '1.2.3')).toBe(false);
        });
    });
    describe('getSatisfyingVersion(versions, range)', () => {
        it('should support all versions length', () => {
            [_1.default.minSatisfyingVersion, _1.default.getSatisfyingVersion].forEach((max) => {
                const versions = [
                    '0.9.8',
                    '1.1.1',
                    '1.1',
                    '1.2.3',
                    '1.2',
                    '1',
                    '2.2.2',
                    '2.2',
                    '2',
                ];
                // returns range if found
                expect(max(versions, '1.2.3')).toBe('1.2.3');
                expect(max(versions, '1.2')).toBe('1.2');
                expect(max(versions, '1')).toBe('1');
                // return null if not found
                expect(max(versions, '1.3')).toBeNull();
                expect(max(versions, '0.9')).toBeNull();
            });
        });
    });
    describe('sortVersions(v1, v2)', () => {
        it('behaves like semver.sortVersions', () => {
            [
                ['1.1.1', '1.2.3'],
                ['1.2.3', '1.3.4'],
                ['2.0.1', '1.2.3'],
                ['1.2.3', '0.9.5'],
            ].forEach((pair) => {
                expect(_1.default.sortVersions(pair[0], pair[1])).toBe(semver_1.default.sortVersions(pair[0], pair[1]));
            });
        });
        it('sorts unstable', () => {
            const versions = [
                '3.7.0',
                '3.7-alpine',
                '3.7.0b1',
                '3.7.0b5',
                '3.8.0b1-alpine',
                '3.8.0-alpine',
                '3.8.2',
                '3.8.0',
            ];
            expect(versions.sort(_1.default.sortVersions)).toEqual([
                '3.7.0b1',
                '3.7.0b5',
                '3.7.0',
                '3.7-alpine',
                '3.8.0b1-alpine',
                '3.8.0-alpine',
                '3.8.0',
                '3.8.2',
            ]);
        });
    });
    describe('getNewValue(', () => {
        it('returns toVersion', () => {
            expect(_1.default.getNewValue({
                currentValue: null,
                rangeStrategy: null,
                fromVersion: null,
                toVersion: '1.2.3',
            })).toBe('1.2.3');
        });
    });
    it('isStable(version)', () => {
        const versions = [
            '3.7.0',
            '3.7.0b1',
            '3.7-alpine',
            '3.8.0-alpine',
            '3.8.0b1-alpine',
            '3.8.2',
        ];
        expect(versions.filter(_1.default.isStable)).toEqual([
            '3.7.0',
            '3.7-alpine',
            '3.8.0-alpine',
            '3.8.2',
        ]);
    });
    it('isCompatible(version)', () => {
        const versions = [
            '3.7.0',
            '3.7.0b1',
            '3.7-alpine',
            '3.8.0-alpine',
            '3.8.0b1-alpine',
            '3.8.2',
        ];
        expect(versions.filter((v) => _1.default.isCompatible(v, '3.7.0'))).toEqual([
            '3.7.0',
            '3.7.0b1',
            '3.8.2',
        ]);
        expect(versions.filter((v) => _1.default.isCompatible(v, '3.7.0-alpine'))).toEqual(['3.8.0-alpine', '3.8.0b1-alpine']);
    });
    it('valueToVersion(version)', () => {
        const versions = [
            '3.7.0',
            '3.7.0b1',
            '3.7-alpine',
            '3.8.0-alpine',
            '3.8.0b1-alpine',
            '3.8.2',
            undefined,
        ];
        expect(versions.map(_1.default.valueToVersion)).toEqual([
            '3.7.0',
            '3.7.0b1',
            '3.7',
            '3.8.0',
            '3.8.0b1',
            '3.8.2',
            undefined,
        ]);
    });
});
//# sourceMappingURL=index.spec.js.map