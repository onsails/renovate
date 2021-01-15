"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extract_1 = require("./extract");
describe('lib/manager/terraform-version/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns a result', () => {
            const res = extract_1.extractPackageFile('12.0.0\n');
            expect(res.deps).toMatchSnapshot();
        });
        it('skips non ranges', () => {
            const res = extract_1.extractPackageFile('latest');
            expect(res.deps).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map