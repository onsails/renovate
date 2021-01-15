"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
describe('lib/manager/homebrew/util', () => {
    describe('skip()', () => {
        it('handles out of bounds case', () => {
            const content = 'some content';
            const idx = content.length * 2;
            expect(util_1.skip(idx, content, (c) => c === '!')).toBe(idx);
        });
    });
});
//# sourceMappingURL=util.spec.js.map