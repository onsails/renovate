"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
describe('getRangeStrategy', () => {
    it('returns same if not auto', () => {
        const config = { rangeStrategy: 'widen' };
        expect(_1.getRangeStrategy(config)).toEqual('widen');
    });
    it('pins devDependencies', () => {
        const config = {
            rangeStrategy: 'auto',
            depType: 'devDependencies',
        };
        expect(_1.getRangeStrategy(config)).toEqual('pin');
    });
    it('pins app dependencies', () => {
        const config = {
            rangeStrategy: 'auto',
            depType: 'dependencies',
            packageJsonType: 'app',
        };
        expect(_1.getRangeStrategy(config)).toEqual('pin');
    });
    it('widens peerDependencies', () => {
        const config = {
            rangeStrategy: 'auto',
            depType: 'peerDependencies',
        };
        expect(_1.getRangeStrategy(config)).toEqual('widen');
    });
    it('widens complex ranges', () => {
        const config = {
            rangeStrategy: 'auto',
            depType: 'dependencies',
            currentValue: '^1.6.0 || ^2.0.0',
        };
        expect(_1.getRangeStrategy(config)).toEqual('widen');
    });
    it('widens complex bump', () => {
        const config = {
            rangeStrategy: 'bump',
            depType: 'dependencies',
            currentValue: '^1.6.0 || ^2.0.0',
        };
        expect(_1.getRangeStrategy(config)).toEqual('widen');
    });
    it('defaults to replace', () => {
        const config = {
            rangeStrategy: 'auto',
            depType: 'dependencies',
        };
        expect(_1.getRangeStrategy(config)).toEqual('replace');
    });
});
//# sourceMappingURL=range.spec.js.map