"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
describe('semver.isValid(input)', () => {
    it('should return null for irregular versions', () => {
        expect(_1.default.isValid('17.04.0')).toBeFalsy();
    });
    it('should support simple semver', () => {
        expect(_1.default.isValid('1.2.3')).toBeTruthy();
    });
    it('should support semver with dash', () => {
        expect(_1.default.isValid('1.2.3-foo')).toBeTruthy();
    });
    it('should reject semver without dash', () => {
        expect(_1.default.isValid('1.2.3foo')).toBeFalsy();
    });
    it('should reject ranges', () => {
        expect(_1.default.isValid('~1.2.3')).toBeFalsy();
        expect(_1.default.isValid('^1.2.3')).toBeFalsy();
        expect(_1.default.isValid('>1.2.3')).toBeFalsy();
    });
    it('should reject github repositories', () => {
        expect(_1.default.isValid('renovatebot/renovate')).toBeFalsy();
        expect(_1.default.isValid('renovatebot/renovate#master')).toBeFalsy();
        expect(_1.default.isValid('https://github.com/renovatebot/renovate.git')).toBeFalsy();
    });
});
describe('semver.isSingleVersion()', () => {
    it('returns true if naked version', () => {
        expect(_1.default.isSingleVersion('1.2.3')).toBeTruthy();
        expect(_1.default.isSingleVersion('1.2.3-alpha.1')).toBeTruthy();
    });
    it('returns false if equals', () => {
        expect(_1.default.isSingleVersion('=1.2.3')).toBeFalsy();
        expect(_1.default.isSingleVersion('= 1.2.3')).toBeFalsy();
    });
    it('returns false when not version', () => {
        expect(_1.default.isSingleVersion('1.x')).toBeFalsy();
    });
});
describe('semver.getNewValue()', () => {
    it('uses toVersion', () => {
        expect(_1.default.getNewValue({
            currentValue: '=1.0.0',
            rangeStrategy: 'bump',
            fromVersion: '1.0.0',
            toVersion: '1.1.0',
        })).toEqual('1.1.0');
    });
});
//# sourceMappingURL=index.spec.js.map