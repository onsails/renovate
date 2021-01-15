"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("../../../test/util");
const extract_1 = require("./extract");
const pluginsFile = fs_1.readFileSync('lib/manager/jenkins/__fixtures__/plugins.txt', 'utf8');
const pluginsEmptyFile = fs_1.readFileSync('lib/manager/jenkins/__fixtures__/empty.txt', 'utf8');
describe(util_1.getName(__filename), () => {
    describe('extractPackageFile()', () => {
        it('returns empty list for an empty file', () => {
            const res = extract_1.extractPackageFile(pluginsEmptyFile);
            expect(res.deps).toHaveLength(0);
        });
        it('extracts multiple image lines', () => {
            const res = extract_1.extractPackageFile(pluginsFile);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(6);
        });
    });
});
//# sourceMappingURL=extract.spec.js.map