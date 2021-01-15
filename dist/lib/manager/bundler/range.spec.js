"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
describe('lib/manager/bundler/range', () => {
    describe('getRangeStrategy()', () => {
        it('returns replace when rangeStrategy is auto', () => {
            const config = { rangeStrategy: 'auto' };
            expect(_1.getRangeStrategy(config)).toEqual('replace');
        });
        it('returns the config value when rangeStrategy is different than auto', () => {
            const config = { rangeStrategy: 'update-lockfile' };
            expect(_1.getRangeStrategy(config)).toEqual('update-lockfile');
        });
    });
});
//# sourceMappingURL=range.spec.js.map