"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
describe('getRangeStrategy', () => {
    it('returns same if not auto', () => {
        const config = { rangeStrategy: 'widen' };
        expect(_1.getRangeStrategy(config)).toEqual('widen');
    });
    it('pins require-dev', () => {
        const config = {
            rangeStrategy: 'auto',
            depType: 'require-dev',
        };
        expect(_1.getRangeStrategy(config)).toEqual('pin');
    });
    it('pins project require', () => {
        const config = {
            rangeStrategy: 'auto',
            managerData: { composerJsonType: 'project' },
            depType: 'require',
        };
        expect(_1.getRangeStrategy(config)).toEqual('pin');
    });
    it('widens complex ranges', () => {
        const config = {
            rangeStrategy: 'auto',
            depType: 'require',
            currentValue: '^1.6.0 || ^2.0.0',
        };
        expect(_1.getRangeStrategy(config)).toEqual('widen');
    });
    it('widens complex bump', () => {
        const config = {
            rangeStrategy: 'bump',
            depType: 'require',
            currentValue: '^1.6.0 || ^2.0.0',
        };
        expect(_1.getRangeStrategy(config)).toEqual('widen');
    });
    it('defaults to replace', () => {
        const config = { rangeStrategy: 'auto', depType: 'require' };
        expect(_1.getRangeStrategy(config)).toEqual('replace');
    });
});
//# sourceMappingURL=range.spec.js.map