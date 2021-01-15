"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../test/util");
const platforms_1 = require("../../../constants/platforms");
const cleanup = __importStar(require("./prune"));
jest.mock('../../../util/git');
let config;
beforeEach(() => {
    jest.resetAllMocks();
    config = util_1.getConfig();
    config.platform = platforms_1.PLATFORM_TYPE_GITHUB;
    config.errors = [];
    config.warnings = [];
});
describe('workers/repository/finalise/prune', () => {
    describe('pruneStaleBranches()', () => {
        it('returns if no branchList', async () => {
            delete config.branchList;
            await cleanup.pruneStaleBranches(config, config.branchList);
            expect(util_1.git.getBranchList).toHaveBeenCalledTimes(0);
        });
        it('returns if no renovate branches', async () => {
            config.branchList = [];
            util_1.git.getBranchList.mockReturnValueOnce([]);
            await expect(cleanup.pruneStaleBranches(config, config.branchList)).resolves.not.toThrow();
        });
        it('returns if no remaining branches', async () => {
            config.branchList = ['renovate/a', 'renovate/b'];
            util_1.git.getBranchList.mockReturnValueOnce(config.branchList);
            await cleanup.pruneStaleBranches(config, config.branchList);
            expect(util_1.git.getBranchList).toHaveBeenCalledTimes(1);
            expect(util_1.git.deleteBranch).toHaveBeenCalledTimes(0);
        });
        it('renames deletes remaining branch', async () => {
            config.branchList = ['renovate/a', 'renovate/b'];
            util_1.git.getBranchList.mockReturnValueOnce(config.branchList.concat(['renovate/c']));
            util_1.platform.findPr.mockResolvedValueOnce({ title: 'foo' });
            await cleanup.pruneStaleBranches(config, config.branchList);
            expect(util_1.git.getBranchList).toHaveBeenCalledTimes(1);
            expect(util_1.git.deleteBranch).toHaveBeenCalledTimes(1);
            expect(util_1.platform.updatePr).toHaveBeenCalledTimes(1);
        });
        it('skips rename but still deletes branch', async () => {
            config.branchList = ['renovate/a', 'renovate/b'];
            util_1.git.getBranchList.mockReturnValueOnce(config.branchList.concat(['renovate/c']));
            util_1.platform.findPr.mockResolvedValueOnce({
                title: 'foo - autoclosed',
            });
            await cleanup.pruneStaleBranches(config, config.branchList);
            expect(util_1.git.getBranchList).toHaveBeenCalledTimes(1);
            expect(util_1.git.deleteBranch).toHaveBeenCalledTimes(1);
            expect(util_1.platform.updatePr).toHaveBeenCalledTimes(1);
        });
        it('does nothing on dryRun', async () => {
            config.branchList = ['renovate/a', 'renovate/b'];
            config.dryRun = true;
            util_1.git.getBranchList.mockReturnValueOnce(config.branchList.concat(['renovate/c']));
            util_1.platform.findPr.mockResolvedValueOnce({ title: 'foo' });
            await cleanup.pruneStaleBranches(config, config.branchList);
            expect(util_1.git.getBranchList).toHaveBeenCalledTimes(1);
            expect(util_1.git.deleteBranch).toHaveBeenCalledTimes(0);
            expect(util_1.platform.updatePr).toHaveBeenCalledTimes(0);
        });
        it('does nothing on prune stale branches disabled', async () => {
            config.branchList = ['renovate/a', 'renovate/b'];
            config.dryRun = false;
            config.pruneStaleBranches = false;
            util_1.git.getBranchList.mockReturnValueOnce(config.branchList.concat(['renovate/c']));
            util_1.platform.findPr.mockResolvedValueOnce({ title: 'foo' });
            await cleanup.pruneStaleBranches(config, config.branchList);
            expect(util_1.git.getBranchList).toHaveBeenCalledTimes(1);
            expect(util_1.git.deleteBranch).toHaveBeenCalledTimes(0);
            expect(util_1.platform.updatePr).toHaveBeenCalledTimes(0);
        });
        it('posts comment if someone pushed to PR', async () => {
            config.branchList = ['renovate/a', 'renovate/b'];
            config.dryRun = false;
            util_1.git.getBranchList.mockReturnValueOnce(config.branchList.concat(['renovate/c']));
            util_1.platform.getBranchPr.mockResolvedValueOnce({});
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            util_1.platform.findPr.mockResolvedValueOnce({ title: 'foo' });
            await cleanup.pruneStaleBranches(config, config.branchList);
            expect(util_1.git.getBranchList).toHaveBeenCalledTimes(1);
            expect(util_1.git.deleteBranch).toHaveBeenCalledTimes(0);
            expect(util_1.platform.updatePr).toHaveBeenCalledTimes(0);
            expect(util_1.platform.ensureComment).toHaveBeenCalledTimes(1);
        });
        it('skips comment if dry run', async () => {
            config.branchList = ['renovate/a', 'renovate/b'];
            config.dryRun = true;
            util_1.git.getBranchList.mockReturnValueOnce(config.branchList.concat(['renovate/c']));
            util_1.platform.getBranchPr.mockResolvedValueOnce({});
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            util_1.platform.findPr.mockResolvedValueOnce({ title: 'foo' });
            await cleanup.pruneStaleBranches(config, config.branchList);
            expect(util_1.git.getBranchList).toHaveBeenCalledTimes(1);
            expect(util_1.git.deleteBranch).toHaveBeenCalledTimes(0);
            expect(util_1.platform.updatePr).toHaveBeenCalledTimes(0);
            expect(util_1.platform.ensureComment).toHaveBeenCalledTimes(0);
        });
        it('dry run delete branch no PR', async () => {
            config.branchList = ['renovate/a', 'renovate/b'];
            config.dryRun = true;
            util_1.git.getBranchList.mockReturnValueOnce(config.branchList.concat(['renovate/c']));
            util_1.platform.findPr.mockResolvedValueOnce(null);
            await cleanup.pruneStaleBranches(config, config.branchList);
            expect(util_1.git.getBranchList).toHaveBeenCalledTimes(1);
            expect(util_1.git.deleteBranch).toHaveBeenCalledTimes(0);
            expect(util_1.platform.updatePr).toHaveBeenCalledTimes(0);
        });
        it('delete branch no PR', async () => {
            config.branchList = ['renovate/a', 'renovate/b'];
            config.dryRun = false;
            util_1.git.getBranchList.mockReturnValueOnce(config.branchList.concat(['renovate/c']));
            util_1.platform.findPr.mockResolvedValueOnce(null);
            await cleanup.pruneStaleBranches(config, config.branchList);
            expect(util_1.git.getBranchList).toHaveBeenCalledTimes(1);
            expect(util_1.git.deleteBranch).toHaveBeenCalledTimes(1);
            expect(util_1.platform.updatePr).toHaveBeenCalledTimes(0);
        });
    });
});
//# sourceMappingURL=prune.spec.js.map