"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const upath_1 = require("upath");
const extract_1 = require("./extract");
function readFixture(fixture) {
    return fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/${fixture}`), 'utf8');
}
const input01Content = readFixture('package-1.js');
describe('lib/manager/meteor/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns empty if fails to parse', () => {
            const res = extract_1.extractPackageFile('blahhhhh:foo:@what\n');
            expect(res).toBeNull();
        });
        it('returns results', () => {
            const res = extract_1.extractPackageFile(input01Content);
            expect(res).toMatchSnapshot();
            expect(res.deps).toHaveLength(6);
        });
    });
});
//# sourceMappingURL=extract.spec.js.map