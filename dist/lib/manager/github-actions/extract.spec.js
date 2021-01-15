"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const workflow1 = fs_1.readFileSync('lib/manager/github-actions/__fixtures__/workflow.yml.1', 'utf8');
const workflow2 = fs_1.readFileSync('lib/manager/github-actions/__fixtures__/workflow.yml.2', 'utf8');
describe('lib/manager/github-actions/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile('nothing here')).toBeNull();
        });
        it('extracts multiple docker image lines from yaml configuration file', () => {
            const res = extract_1.extractPackageFile(workflow1);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps.filter((d) => d.datasource === 'docker')).toHaveLength(2);
        });
        it('extracts multiple action tag lines from yaml configuration file', () => {
            const res = extract_1.extractPackageFile(workflow2);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps.filter((d) => d.datasource === 'github-tags')).toHaveLength(3);
        });
    });
});
//# sourceMappingURL=extract.spec.js.map