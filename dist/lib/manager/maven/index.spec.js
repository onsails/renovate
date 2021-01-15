"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("../../../test/util");
const extract_1 = require("./extract");
const _1 = require(".");
jest.mock('../../util/fs');
const pomContent = fs_1.readFileSync('lib/manager/maven/__fixtures__/simple.pom.xml', 'utf8');
const pomParent = fs_1.readFileSync('lib/manager/maven/__fixtures__/parent.pom.xml', 'utf8');
const pomChild = fs_1.readFileSync('lib/manager/maven/__fixtures__/child.pom.xml', 'utf8');
const origContent = fs_1.readFileSync('lib/manager/maven/__fixtures__/grouping.pom.xml', 'utf8');
function selectDep(deps, name = 'org.example:quuz') {
    return deps.find((dep) => dep.depName === name);
}
describe('manager/maven', () => {
    describe('extractAllPackageFiles', () => {
        it('should return empty if package has no content', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce(null);
            const res = await _1.extractAllPackageFiles({}, ['random.pom.xml']);
            expect(res).toEqual([]);
        });
        it('should return empty for packages with invalid content', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce('invalid content');
            const res = await _1.extractAllPackageFiles({}, ['random.pom.xml']);
            expect(res).toEqual([]);
        });
        it('should return package files info', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce(pomContent);
            const packages = await _1.extractAllPackageFiles({}, ['random.pom.xml']);
            // windows path fix
            for (const p of packages) {
                if (p.parent) {
                    p.parent = p.parent.replace(/\\/g, '/');
                }
            }
            expect(packages).toMatchSnapshot();
        });
    });
    describe('updateDependency', () => {
        it('should update an existing dependency', () => {
            const newValue = '9.9.9.9-final';
            const { deps } = extract_1.extractPackage(pomContent);
            const dep = selectDep(deps);
            const upgrade = { ...dep, newValue };
            const updatedContent = _1.updateDependency({
                fileContent: pomContent,
                upgrade,
            });
            const updatedDep = selectDep(extract_1.extractPackage(updatedContent).deps);
            expect(updatedDep.currentValue).toEqual(newValue);
        });
        it('should update existing dependency defined via properties', () => {
            const finder = ({ depName }) => depName === 'org.example:quux';
            const newValue = '9.9.9.9-final';
            const packages = extract_1.resolveParents([
                extract_1.extractPackage(pomParent, 'parent.pom.xml'),
                extract_1.extractPackage(pomChild, 'child.pom.xml'),
            ]);
            const [{ deps }] = packages;
            const dep = deps.find(finder);
            const upgrade = { ...dep, newValue };
            const updatedContent = _1.updateDependency({
                fileContent: pomParent,
                upgrade,
            });
            const [updatedPkg] = extract_1.resolveParents([
                extract_1.extractPackage(updatedContent, 'parent.pom.xml'),
                extract_1.extractPackage(pomChild, 'child.pom.xml'),
            ]);
            const updatedDep = updatedPkg.deps.find(finder);
            expect(updatedDep.registryUrls).toContain('http://example.com/');
            expect(updatedDep.currentValue).toEqual(newValue);
        });
        it('should include registryUrls from parent pom files', async () => {
            util_1.fs.readLocalFile
                .mockResolvedValueOnce(pomParent)
                .mockResolvedValueOnce(pomChild);
            const packages = await _1.extractAllPackageFiles({}, [
                'parent.pom.xml',
                'child.pom.xml',
            ]);
            const urls = new Set([
                'https://repo.maven.apache.org/maven2',
                'http://example.com/',
                'http://example.com/nexus/xyz',
            ]);
            packages.forEach(({ deps }) => {
                deps.forEach(({ registryUrls }) => {
                    const depUrls = new Set([...registryUrls]);
                    expect(depUrls).toEqual(urls);
                });
            });
            expect(packages).toMatchSnapshot();
        });
        it('should not touch content if new and old versions are equal', () => {
            const newValue = '1.2.3';
            const { deps } = extract_1.extractPackage(pomContent);
            const dep = selectDep(deps);
            const upgrade = { ...dep, newValue };
            const updatedContent = _1.updateDependency({
                fileContent: pomContent,
                upgrade,
            });
            expect(pomContent).toBe(updatedContent);
        });
        it('should update to version of the latest dep in implicit group', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce(origContent);
            const [{ deps }] = await _1.extractAllPackageFiles({}, ['pom.xml']);
            const dep1 = selectDep(deps, 'org.example:foo-1');
            const upgrade1 = { ...dep1, newValue: '1.0.2' };
            const dep2 = selectDep(deps, 'org.example:foo-2');
            const upgrade2 = { ...dep2, newValue: '1.0.3' };
            const updatedOutside = origContent.replace('1.0.0', '1.0.1');
            expect(_1.updateDependency({ fileContent: origContent, upgrade: upgrade1 })).toEqual(origContent.replace('1.0.0', '1.0.2'));
            expect(_1.updateDependency({
                fileContent: updatedOutside,
                upgrade: upgrade1,
            })).toEqual(origContent.replace('1.0.0', '1.0.2'));
            const updatedByPrevious = _1.updateDependency({
                fileContent: origContent,
                upgrade: upgrade1,
            });
            expect(_1.updateDependency({
                fileContent: updatedByPrevious,
                upgrade: upgrade2,
            })).toEqual(origContent.replace('1.0.0', '1.0.3'));
            expect(_1.updateDependency({
                fileContent: updatedOutside,
                upgrade: upgrade2,
            })).toEqual(origContent.replace('1.0.0', '1.0.3'));
            expect(_1.updateDependency({ fileContent: origContent, upgrade: upgrade2 })).toEqual(origContent.replace('1.0.0', '1.0.3'));
        });
        it('should return null for ungrouped deps if content was updated outside', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce(origContent);
            const [{ deps }] = await _1.extractAllPackageFiles({}, ['pom.xml']);
            const dep = selectDep(deps, 'org.example:bar');
            const upgrade = { ...dep, newValue: '2.0.2' };
            const updatedOutside = origContent.replace('2.0.0', '2.0.1');
            expect(_1.updateDependency({ fileContent: updatedOutside, upgrade })).toBeNull();
        });
        it('should return null if current versions in content and upgrade are not same', () => {
            const currentValue = '1.2.2';
            const newValue = '1.2.4';
            const { deps } = extract_1.extractPackage(pomContent);
            const dep = selectDep(deps);
            const upgrade = { ...dep, currentValue, newValue };
            const updatedContent = _1.updateDependency({
                fileContent: pomContent,
                upgrade,
            });
            expect(updatedContent).toBeNull();
        });
        it('should update ranges', () => {
            const newValue = '[1.2.3]';
            const select = (depSet) => selectDep(depSet.deps, 'org.example:hard-range');
            const oldContent = extract_1.extractPackage(pomContent);
            const dep = select(oldContent);
            const upgrade = { ...dep, newValue };
            const newContent = extract_1.extractPackage(_1.updateDependency({ fileContent: pomContent, upgrade }));
            const newDep = select(newContent);
            expect(newDep.currentValue).toEqual(newValue);
        });
        it('should preserve ranges', () => {
            const newValue = '[1.0.0]';
            const select = (depSet) => (depSet === null || depSet === void 0 ? void 0 : depSet.deps) ? selectDep(depSet.deps, 'org.example:hard-range') : null;
            const oldContent = extract_1.extractPackage(pomContent);
            const dep = select(oldContent);
            expect(dep).not.toBeNull();
            const upgrade = { ...dep, newValue };
            expect(_1.updateDependency({ fileContent: pomContent, upgrade })).toEqual(pomContent);
        });
    });
});
//# sourceMappingURL=index.spec.js.map