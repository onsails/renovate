"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const yamlFile1 = fs_1.readFileSync('lib/manager/docker-compose/__fixtures__/docker-compose.1.yml', 'utf8');
const yamlFile3 = fs_1.readFileSync('lib/manager/docker-compose/__fixtures__/docker-compose.3.yml', 'utf8');
describe('lib/manager/docker-compose/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile('')).toBeNull();
        });
        it('returns null for non-object YAML', () => {
            expect(extract_1.extractPackageFile('nothing here')).toBeNull();
        });
        it('returns null for malformed YAML', () => {
            expect(extract_1.extractPackageFile('nothing here\n:::::::')).toBeNull();
        });
        it('extracts multiple image lines for version 1', () => {
            const res = extract_1.extractPackageFile(yamlFile1);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(8);
        });
        it('extracts multiple image lines for version 3', () => {
            const res = extract_1.extractPackageFile(yamlFile3);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(8);
        });
    });
});
//# sourceMappingURL=extract.spec.js.map