"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extract_1 = require("./extract");
describe('lib/manager/nvm/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns a result', () => {
            const res = extract_1.extractPackageFile('8.4.0\n');
            expect(res.deps).toMatchSnapshot();
        });
        it('supports ranges', () => {
            const res = extract_1.extractPackageFile('8.4\n');
            expect(res.deps).toMatchSnapshot();
        });
        it('skips non ranges', () => {
            const res = extract_1.extractPackageFile('latestn');
            expect(res.deps).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map