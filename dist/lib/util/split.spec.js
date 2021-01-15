"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const split_1 = require("./split");
describe('util/split', () => {
    it('adds splits and returns results', () => {
        split_1.splitInit();
        split_1.addSplit('one');
        split_1.addSplit('two');
        const res = split_1.getSplits();
        expect(res.total).toBeDefined();
        expect(Object.keys(res.splits)).toHaveLength(2);
    });
});
//# sourceMappingURL=split.spec.js.map