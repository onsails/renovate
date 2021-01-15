"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const pipeline1 = fs_1.readFileSync('lib/manager/buildkite/__fixtures__/pipeline1.yml', 'utf8');
const pipeline2 = fs_1.readFileSync('lib/manager/buildkite/__fixtures__/pipeline2.yml', 'utf8');
const pipeline3 = fs_1.readFileSync('lib/manager/buildkite/__fixtures__/pipeline3.yml', 'utf8');
const pipeline4 = fs_1.readFileSync('lib/manager/buildkite/__fixtures__/pipeline4.yml', 'utf8');
describe('lib/manager/buildkite/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile('nothing here')).toBeNull();
        });
        it('extracts simple single plugin', () => {
            const res = extract_1.extractPackageFile(pipeline1).deps;
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(1);
        });
        it('extracts multiple plugins in same file', () => {
            const res = extract_1.extractPackageFile(pipeline2).deps;
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(2);
        });
        it('adds skipReason', () => {
            const res = extract_1.extractPackageFile(pipeline3).deps;
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(3);
        });
        it('extracts arrays of plugins', () => {
            const res = extract_1.extractPackageFile(pipeline4).deps;
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(4);
        });
    });
});
//# sourceMappingURL=extract.spec.js.map