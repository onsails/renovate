"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mask_1 = require("./mask");
describe('util/mask', () => {
    describe('.maskToken', () => {
        it('returns value if passed value is falsy', () => {
            expect(mask_1.maskToken('')).toEqual('');
        });
        it('hides value content', () => {
            expect(mask_1.maskToken('123456789')).toEqual('12*****89');
        });
    });
});
//# sourceMappingURL=mask.spec.js.map