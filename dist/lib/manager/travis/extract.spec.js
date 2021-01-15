"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const upath_1 = require("upath");
const extract_1 = require("./extract");
const invalidYAML = fs_1.readFileSync(upath_1.resolve('lib/manager/travis/__fixtures__/invalid.yml'), 'utf8');
describe('lib/manager/travis/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns empty if fails to parse', () => {
            const res = extract_1.extractPackageFile('blahhhhh:foo:@what\n');
            expect(res).toBeNull();
        });
        it('returns results', () => {
            const res = extract_1.extractPackageFile('node_js:\n  - 6\n  - 8\n');
            expect(res).toMatchSnapshot();
            expect(res.deps).toHaveLength(1);
        });
        it('should handle invalid YAML', () => {
            const res = extract_1.extractPackageFile(invalidYAML);
            expect(res).toBeNull();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map