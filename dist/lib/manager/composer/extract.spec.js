"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("../../../test/util");
const extract_1 = require("./extract");
jest.mock('../../util/fs');
const requirements1 = fs_1.readFileSync('lib/manager/composer/__fixtures__/composer1.json', 'utf8');
const requirements2 = fs_1.readFileSync('lib/manager/composer/__fixtures__/composer2.json', 'utf8');
const requirements3 = fs_1.readFileSync('lib/manager/composer/__fixtures__/composer3.json', 'utf8');
const requirements4 = fs_1.readFileSync('lib/manager/composer/__fixtures__/composer4.json', 'utf8');
const requirements5 = fs_1.readFileSync('lib/manager/composer/__fixtures__/composer5.json', 'utf8');
const requirements5Lock = fs_1.readFileSync('lib/manager/composer/__fixtures__/composer5.lock', 'utf8');
describe('lib/manager/composer/extract', () => {
    describe('extractPackageFile()', () => {
        let packageFile;
        beforeEach(() => {
            packageFile = 'composer.json';
        });
        it('returns null for invalid json', async () => {
            expect(await extract_1.extractPackageFile('nothing here', packageFile)).toBeNull();
        });
        it('returns null for empty deps', async () => {
            expect(await extract_1.extractPackageFile('{}', packageFile)).toBeNull();
        });
        it('extracts dependencies with no lock file', async () => {
            const res = await extract_1.extractPackageFile(requirements1, packageFile);
            expect(res).toMatchSnapshot();
        });
        it('extracts registryUrls', async () => {
            const res = await extract_1.extractPackageFile(requirements2, packageFile);
            expect(res).toMatchSnapshot();
            expect(res.registryUrls).toHaveLength(1);
        });
        it('extracts object registryUrls', async () => {
            const res = await extract_1.extractPackageFile(requirements3, packageFile);
            expect(res).toMatchSnapshot();
            expect(res.registryUrls).toHaveLength(1);
        });
        it('extracts repositories and registryUrls', async () => {
            const res = await extract_1.extractPackageFile(requirements4, packageFile);
            expect(res).toMatchSnapshot();
            expect(res.registryUrls).toHaveLength(3);
        });
        it('extracts object repositories and registryUrls with lock file', async () => {
            util_1.fs.readLocalFile.mockResolvedValue(requirements5Lock);
            const res = await extract_1.extractPackageFile(requirements5, packageFile);
            expect(res).toMatchSnapshot();
            expect(res.registryUrls).toHaveLength(2);
        });
        it('extracts dependencies with lock file', async () => {
            util_1.fs.readLocalFile.mockResolvedValue('some content');
            const res = await extract_1.extractPackageFile(requirements1, packageFile);
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map