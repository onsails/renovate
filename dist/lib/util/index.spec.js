"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../test/util");
const _1 = require(".");
describe(util_1.getName(__filename), () => {
    describe('sampleSize', () => {
        const array = ['a', 'b', 'c', 'd'];
        it('returns correct sized array', () => {
            expect(_1.sampleSize(array, 2)).toHaveLength(2);
        });
        it('returns full array for undefined number', () => {
            expect(_1.sampleSize(array, undefined)).toEqual(array);
        });
        it('returns full array for null number', () => {
            expect(_1.sampleSize(array, null)).toEqual([]);
        });
        it('returns full array for 0 number', () => {
            expect(_1.sampleSize(array, 0)).toEqual([]);
        });
        it('returns empty array for null array', () => {
            expect(_1.sampleSize(null, 1)).toEqual([]);
        });
        it('returns empty array for undefined array', () => {
            expect(_1.sampleSize(undefined, 1)).toEqual([]);
        });
        it('returns empty array for empty array', () => {
            expect(_1.sampleSize([], 1)).toEqual([]);
        });
    });
});
//# sourceMappingURL=index.spec.js.map