"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const types_1 = require("../../types");
const reuse_1 = require("./reuse");
jest.mock('../../util/git');
describe('workers/branch/parent', () => {
    describe('getParentBranch(config)', () => {
        const pr = {
            sourceBranch: 'master',
            state: types_1.PrState.Open,
            title: 'any',
        };
        let config;
        beforeEach(() => {
            config = {
                branchName: 'renovate/some-branch',
                rebaseLabel: 'rebase',
                rebaseWhen: 'behind-base-branch',
            };
        });
        it('returns undefined if branch does not exist', async () => {
            util_1.git.branchExists.mockReturnValueOnce(false);
            const res = await reuse_1.shouldReuseExistingBranch(config);
            expect(res.reuseExistingBranch).toBe(false);
        });
        it('returns branchName if no PR', async () => {
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockReturnValue(null);
            const res = await reuse_1.shouldReuseExistingBranch(config);
            expect(res.reuseExistingBranch).toBe(true);
        });
        it('returns branchName if does not need rebasing', async () => {
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                ...pr,
                isConflicted: false,
            });
            const res = await reuse_1.shouldReuseExistingBranch(config);
            expect(res.reuseExistingBranch).toBe(true);
        });
        it('returns branchName if unmergeable and cannot rebase', async () => {
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                ...pr,
                isConflicted: true,
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            const res = await reuse_1.shouldReuseExistingBranch(config);
            expect(res.reuseExistingBranch).toBe(true);
        });
        it('returns branchName if unmergeable and can rebase, but rebaseWhen is never', async () => {
            config.rebaseWhen = 'never';
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                ...pr,
                isConflicted: true,
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(false);
            const res = await reuse_1.shouldReuseExistingBranch(config);
            expect(res.reuseExistingBranch).toBe(true);
        });
        it('returns undefined if PR title rebase!', async () => {
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                ...pr,
                title: 'rebase!Update foo to v4',
            });
            const res = await reuse_1.shouldReuseExistingBranch(config);
            expect(res.reuseExistingBranch).toBe(false);
        });
        it('returns undefined if PR body check rebase', async () => {
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                ...pr,
                title: 'Update foo to v4',
                body: 'blah\nblah\n- [x] <!-- rebase-check -->foo\n',
            });
            const res = await reuse_1.shouldReuseExistingBranch(config);
            expect(res.reuseExistingBranch).toBe(false);
        });
        it('aaa2 returns undefined if manual rebase by label', async () => {
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                ...pr,
                labels: ['rebase'],
            });
            const res = await reuse_1.shouldReuseExistingBranch(config);
            expect(res.reuseExistingBranch).toBe(false);
        });
        it('aaa1 returns undefined if unmergeable and can rebase', async () => {
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                ...pr,
                isConflicted: true,
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(false);
            const res = await reuse_1.shouldReuseExistingBranch(config);
            expect(res.reuseExistingBranch).toBe(false);
        });
        it('returns branchName if automerge branch and not stale', async () => {
            config.automerge = true;
            config.automergeType = 'branch';
            util_1.git.branchExists.mockReturnValueOnce(true);
            const res = await reuse_1.shouldReuseExistingBranch(config);
            expect(res.reuseExistingBranch).toBe(true);
        });
        it('returns undefined if automerge branch and stale', async () => {
            config.automerge = true;
            config.automergeType = 'branch';
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.git.isBranchStale.mockResolvedValueOnce(true);
            const res = await reuse_1.shouldReuseExistingBranch(config);
            expect(res.reuseExistingBranch).toBe(false);
        });
        it('returns branch if rebaseWhen=behind-base-branch but cannot rebase', async () => {
            config.rebaseWhen = 'behind-base-branch';
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.git.isBranchStale.mockResolvedValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                ...pr,
                isConflicted: true,
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            const res = await reuse_1.shouldReuseExistingBranch(config);
            expect(res.reuseExistingBranch).toBe(true);
        });
    });
});
//# sourceMappingURL=reuse.spec.js.map