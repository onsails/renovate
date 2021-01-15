"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
describe('manager/npm/extract/type', () => {
    describe('.mightBeABrowserLibrary()', () => {
        it('is not a library if private', () => {
            const isLibrary = type_1.mightBeABrowserLibrary({ private: true });
            expect(isLibrary).toBe(false);
        });
        it('is not a library if no main', () => {
            const isLibrary = type_1.mightBeABrowserLibrary({});
            expect(isLibrary).toBe(false);
        });
        it('is a library if has a main', () => {
            const isLibrary = type_1.mightBeABrowserLibrary({ main: 'index.js ' });
            expect(isLibrary).toBe(true);
        });
    });
});
//# sourceMappingURL=type.spec.js.map