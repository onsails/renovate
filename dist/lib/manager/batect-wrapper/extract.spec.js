"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const github_releases_1 = require("../../datasource/github-releases");
const semver_1 = require("../../versioning/semver");
const extract_1 = require("./extract");
const validWrapperContent = fs_1.readFileSync('lib/manager/batect-wrapper/__fixtures__/valid-wrapper', 'utf8');
const malformedWrapperContent = fs_1.readFileSync('lib/manager/batect-wrapper/__fixtures__/malformed-wrapper', 'utf8');
describe('lib/manager/batect-wrapper/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty wrapper file', () => {
            expect(extract_1.extractPackageFile('')).toBeNull();
        });
        it('returns null for file without version information', () => {
            expect(extract_1.extractPackageFile('nothing here')).toBeNull();
        });
        it('extracts the current version from a valid wrapper script', () => {
            const res = extract_1.extractPackageFile(validWrapperContent);
            const expectedDependency = {
                depName: 'batect/batect',
                commitMessageTopic: 'Batect',
                currentValue: '0.60.1',
                datasource: github_releases_1.id,
                versioning: semver_1.id,
            };
            expect(res).toEqual({ deps: [expectedDependency] });
        });
        it('returns the first version from a wrapper script with multiple versions', () => {
            const res = extract_1.extractPackageFile(malformedWrapperContent);
            const expectedDependency = {
                depName: 'batect/batect',
                commitMessageTopic: 'Batect',
                currentValue: '0.60.1',
                datasource: github_releases_1.id,
                versioning: semver_1.id,
            };
            expect(res).toEqual({ deps: [expectedDependency] });
        });
    });
});
//# sourceMappingURL=extract.spec.js.map