"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const utils_1 = require("./utils");
describe(util_1.getName(__filename), () => {
    describe('getConstraint', () => {
        it('returns from config', () => {
            expect(utils_1.getConstraint({ constraints: { composer: '1.1.0' } })).toEqual('1.1.0');
        });
        it('returns from null', () => {
            expect(utils_1.getConstraint({})).toBeNull();
        });
    });
    describe('extractContraints', () => {
        it('returns from require', () => {
            expect(utils_1.extractContraints({ require: { php: '>=5.3.2', 'composer/composer': '1.1.0' } }, {})).toEqual({ php: '>=5.3.2', composer: '1.1.0' });
        });
        it('returns from require-dev', () => {
            expect(utils_1.extractContraints({ 'require-dev': { 'composer/composer': '1.1.0' } }, {})).toEqual({ composer: '1.1.0' });
        });
        it('returns from composer-runtime-api', () => {
            expect(utils_1.extractContraints({ require: { 'composer-runtime-api': '^1.1.0' } }, {})).toEqual({ composer: '1.*' });
        });
        it('returns from plugin-api-version', () => {
            expect(utils_1.extractContraints({}, { 'plugin-api-version': '1.1.0' })).toEqual({
                composer: '1.*',
            });
        });
        it('fallback to 1.*', () => {
            expect(utils_1.extractContraints({}, {})).toEqual({ composer: '1.*' });
        });
    });
});
//# sourceMappingURL=utils.spec.js.map