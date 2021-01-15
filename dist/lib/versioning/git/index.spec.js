"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
describe('git.', () => {
    describe('isValid(version)', () => {
        it('should return true', () => {
            expect(_1.default.isValid('a1')).toBeTruthy();
        });
    });
    describe('isCompatible(version)', () => {
        it('should return true', () => {
            expect(_1.default.isCompatible('')).toBeTruthy();
        });
    });
    describe('isGreaterThan(version1, version2)', () => {
        it('should return false', () => {
            expect(_1.default.isGreaterThan('', '')).toBeFalsy();
        });
    });
    describe('valueToVersion(version)', () => {
        it('should return same as input', () => {
            expect(_1.default.valueToVersion('')).toEqual('');
        });
    });
});
//# sourceMappingURL=index.spec.js.map