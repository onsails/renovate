"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const _1 = require(".");
const brokenYaml = fs_1.readFileSync('lib/manager/pub/__fixtures__/update.yaml', 'utf8');
const packageFile = fs_1.readFileSync('lib/manager/pub/__fixtures__/extract.yaml', 'utf8');
describe('manager/pub', () => {
    describe('extractPackageFile', () => {
        it('should return null if package does not contain any deps', () => {
            const res = _1.extractPackageFile('foo: bar', 'pubspec.yaml');
            expect(res).toBeNull();
        });
        it('should return null if package is invalid', () => {
            const res = _1.extractPackageFile(brokenYaml, 'pubspec.yaml');
            expect(res).toBeNull();
        });
        it('should return valid dependencies', () => {
            const res = _1.extractPackageFile(packageFile, 'pubspec.yaml');
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map