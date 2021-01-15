"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const yamlFile = fs_1.readFileSync('lib/manager/gitlabci/__fixtures__/gitlab-ci.yaml', 'utf8');
const yamlFile1 = fs_1.readFileSync('lib/manager/gitlabci/__fixtures__/gitlab-ci.1.yaml', 'utf8');
describe('lib/manager/gitlabci/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile('nothing here')).toBeNull();
        });
        it('extracts multiple image lines', () => {
            const res = extract_1.extractPackageFile(yamlFile);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(7);
            expect(res.deps.some((dep) => dep.currentValue.includes("'"))).toBe(false);
        });
        it('extracts multiple image lines with comments', () => {
            const res = extract_1.extractPackageFile(yamlFile1);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(3);
        });
    });
});
//# sourceMappingURL=extract.spec.js.map