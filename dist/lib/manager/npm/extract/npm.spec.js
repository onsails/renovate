"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("../../../../test/util");
const npm_1 = require("./npm");
jest.mock('../../../util/fs');
describe('manager/npm/extract/npm', () => {
    describe('.getNpmLock()', () => {
        it('returns empty if failed to parse', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce('abcd');
            const res = await npm_1.getNpmLock('package.json');
            expect(Object.keys(res.lockedVersions)).toHaveLength(0);
        });
        it('extracts', async () => {
            const plocktest1Lock = fs_1.readFileSync('lib/manager/npm/__fixtures__/plocktest1/package-lock.json');
            util_1.fs.readLocalFile.mockResolvedValueOnce(plocktest1Lock);
            const res = await npm_1.getNpmLock('package.json');
            expect(res).toMatchSnapshot();
            expect(Object.keys(res.lockedVersions)).toHaveLength(7);
        });
        it('extracts npm 7 lockfile', async () => {
            const npm7Lock = fs_1.readFileSync('lib/manager/npm/__fixtures__/npm7/package-lock.json');
            util_1.fs.readLocalFile.mockResolvedValueOnce(npm7Lock);
            const res = await npm_1.getNpmLock('package.json');
            expect(res).toMatchSnapshot();
            expect(Object.keys(res.lockedVersions)).toHaveLength(7);
            expect(res.lockfileVersion).toEqual(2);
        });
        it('returns empty if no deps', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce('{}');
            const res = await npm_1.getNpmLock('package.json');
            expect(Object.keys(res.lockedVersions)).toHaveLength(0);
        });
    });
});
//# sourceMappingURL=npm.spec.js.map