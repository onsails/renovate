"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
describe('getRangeStrategy', () => {
    it('returns same if not auto', () => {
        const config = { rangeStrategy: 'widen' };
        expect(_1.getRangeStrategy(config)).toEqual('widen');
    });
    it('replaces if auto', () => {
        const config = { rangeStrategy: 'auto' };
        expect(_1.getRangeStrategy(config)).toEqual('replace');
    });
});
//# sourceMappingURL=range.spec.js.map