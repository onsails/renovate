"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const content = fs_1.readFileSync('lib/manager/setup-cfg/__fixtures__/setup-cfg-1.txt', 'utf8');
describe('lib/manager/pip_requirements/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile('nothing here')).toBeNull();
        });
        it('extracts dependencies', () => {
            const res = extract_1.extractPackageFile(content);
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map