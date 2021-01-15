"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
describe('getRangeStrategy', () => {
    it('returns same if not auto', () => {
        const config = {
            manager: 'npm',
            rangeStrategy: 'widen',
        };
        expect(_1.getRangeStrategy(config)).toEqual('widen');
    });
    it('returns manager strategy', () => {
        const config = {
            manager: 'npm',
            rangeStrategy: 'auto',
            depType: 'dependencies',
            packageJsonType: 'app',
        };
        expect(_1.getRangeStrategy(config)).toEqual('pin');
    });
    it('defaults to replace', () => {
        const config = {
            manager: 'circleci',
            rangeStrategy: 'auto',
        };
        expect(_1.getRangeStrategy(config)).toEqual('replace');
    });
    it('returns rangeStrategy if not auto', () => {
        const config = {
            manager: 'circleci',
            rangeStrategy: 'future',
        };
        expect(_1.getRangeStrategy(config)).toEqual('future');
    });
});
//# sourceMappingURL=range.spec.js.map