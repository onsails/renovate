"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const file1 = fs_1.readFileSync('lib/manager/circleci/__fixtures__/config.yml', 'utf8');
const file2 = fs_1.readFileSync('lib/manager/circleci/__fixtures__/config2.yml', 'utf8');
const file3 = fs_1.readFileSync('lib/manager/circleci/__fixtures__/config3.yml', 'utf8');
describe('lib/manager/circleci/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile('nothing here')).toBeNull();
        });
        it('extracts multiple image lines', () => {
            const res = extract_1.extractPackageFile(file1);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(4);
        });
        it('extracts orbs too', () => {
            const res = extract_1.extractPackageFile(file2);
            expect(res.deps).toMatchSnapshot();
            // expect(res.deps).toHaveLength(4);
        });
        it('extracts image without leading dash', () => {
            const res = extract_1.extractPackageFile(file3);
            expect(res.deps).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map