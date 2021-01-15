"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("../../../../test/util");
const yarn_1 = require("./yarn");
jest.mock('../../../util/fs');
describe('manager/npm/extract/yarn', () => {
    describe('.getYarnLock()', () => {
        it('returns empty if exception parsing', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce('abcd');
            const res = await yarn_1.getYarnLock('package.json');
            expect(res.isYarn1).toBe(true);
            expect(Object.keys(res.lockedVersions)).toHaveLength(0);
        });
        it('extracts yarn 1', async () => {
            const plocktest1Lock = fs_1.readFileSync('lib/manager/npm/__fixtures__/plocktest1/yarn.lock', 'utf8');
            util_1.fs.readLocalFile.mockResolvedValueOnce(plocktest1Lock);
            const res = await yarn_1.getYarnLock('package.json');
            expect(res.isYarn1).toBe(true);
            expect(res.lockfileVersion).toBeUndefined();
            expect(res.lockedVersions).toMatchSnapshot();
            expect(Object.keys(res.lockedVersions)).toHaveLength(7);
        });
        it('extracts yarn 2', async () => {
            const plocktest1Lock = fs_1.readFileSync('lib/manager/npm/__fixtures__/yarn2/yarn.lock', 'utf8');
            util_1.fs.readLocalFile.mockResolvedValueOnce(plocktest1Lock);
            const res = await yarn_1.getYarnLock('package.json');
            expect(res.isYarn1).toBe(false);
            expect(res.lockfileVersion).toBe(NaN);
            expect(res.lockedVersions).toMatchSnapshot();
            expect(Object.keys(res.lockedVersions)).toHaveLength(8);
        });
        it('extracts yarn 2 cache version', async () => {
            const plocktest1Lock = fs_1.readFileSync('lib/manager/npm/__fixtures__/yarn2.2/yarn.lock', 'utf8');
            util_1.fs.readLocalFile.mockResolvedValueOnce(plocktest1Lock);
            const res = await yarn_1.getYarnLock('package.json');
            expect(res.isYarn1).toBe(false);
            expect(res.lockfileVersion).toBe(6);
            expect(res.lockedVersions).toMatchSnapshot();
            expect(Object.keys(res.lockedVersions)).toHaveLength(10);
        });
    });
});
//# sourceMappingURL=yarn.spec.js.map