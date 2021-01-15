"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const types_1 = require("../../types");
const automerge_1 = require("./automerge");
jest.mock('../../util/git');
describe('workers/branch/automerge', () => {
    describe('tryBranchAutomerge', () => {
        let config;
        beforeEach(() => {
            config = {
                ...util_1.defaultConfig,
            };
        });
        it('returns false if not configured for automerge', async () => {
            config.automerge = false;
            expect(await automerge_1.tryBranchAutomerge(config)).toBe('no automerge');
        });
        it('returns false if automergeType is pr', async () => {
            config.automerge = true;
            config.automergeType = 'pr';
            expect(await automerge_1.tryBranchAutomerge(config)).toBe('no automerge');
        });
        it('returns false if branch status is not success', async () => {
            config.automerge = true;
            config.automergeType = 'branch';
            util_1.platform.getBranchStatus.mockResolvedValueOnce(types_1.BranchStatus.yellow);
            expect(await automerge_1.tryBranchAutomerge(config)).toBe('no automerge');
        });
        it('returns branch status error if branch status is failure', async () => {
            config.automerge = true;
            config.automergeType = 'branch';
            util_1.platform.getBranchStatus.mockResolvedValueOnce(types_1.BranchStatus.red);
            expect(await automerge_1.tryBranchAutomerge(config)).toBe('branch status error');
        });
        it('returns false if PR exists', async () => {
            util_1.platform.getBranchPr.mockResolvedValueOnce({});
            config.automerge = true;
            config.automergeType = 'branch';
            util_1.platform.getBranchStatus.mockResolvedValueOnce(types_1.BranchStatus.green);
            expect(await automerge_1.tryBranchAutomerge(config)).toBe('automerge aborted - PR exists');
        });
        it('returns false if automerge fails', async () => {
            config.automerge = true;
            config.automergeType = 'branch';
            util_1.platform.getBranchStatus.mockResolvedValueOnce(types_1.BranchStatus.green);
            util_1.git.mergeBranch.mockImplementationOnce(() => {
                throw new Error('merge error');
            });
            expect(await automerge_1.tryBranchAutomerge(config)).toBe('failed');
        });
        it('returns true if automerge succeeds', async () => {
            config.automerge = true;
            config.automergeType = 'branch';
            util_1.platform.getBranchStatus.mockResolvedValueOnce(types_1.BranchStatus.green);
            expect(await automerge_1.tryBranchAutomerge(config)).toBe('automerged');
        });
        it('returns true if automerge succeeds (dry-run)', async () => {
            config.automerge = true;
            config.automergeType = 'branch';
            config.dryRun = true;
            util_1.platform.getBranchStatus.mockResolvedValueOnce(types_1.BranchStatus.green);
            expect(await automerge_1.tryBranchAutomerge(config)).toBe('automerged');
        });
    });
});
//# sourceMappingURL=automerge.spec.js.map