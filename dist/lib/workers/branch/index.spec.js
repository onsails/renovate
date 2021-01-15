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
const _fs = __importStar(require("fs-extra"));
const util_1 = require("../../../test/util");
const error_messages_1 = require("../../constants/error-messages");
const _npmPostExtract = __importStar(require("../../manager/npm/post-update"));
const types_1 = require("../../types");
const _exec = __importStar(require("../../util/exec"));
const common_1 = require("../common");
const _limits = __importStar(require("../global/limits"));
const _prWorker = __importStar(require("../pr"));
const _automerge = __importStar(require("./automerge"));
const _checkExisting = __importStar(require("./check-existing"));
const _commit = __importStar(require("./commit"));
const _getUpdated = __importStar(require("./get-updated"));
const _reuse = __importStar(require("./reuse"));
const _schedule = __importStar(require("./schedule"));
const branchWorker = __importStar(require("."));
jest.mock('./get-updated');
jest.mock('./schedule');
jest.mock('./check-existing');
jest.mock('./reuse');
jest.mock('../../manager/npm/post-update');
jest.mock('./automerge');
jest.mock('./commit');
jest.mock('../pr');
jest.mock('../../util/exec');
jest.mock('../../util/git');
jest.mock('fs-extra');
jest.mock('../global/limits');
const getUpdated = util_1.mocked(_getUpdated);
const schedule = util_1.mocked(_schedule);
const checkExisting = util_1.mocked(_checkExisting);
const reuse = util_1.mocked(_reuse);
const npmPostExtract = util_1.mocked(_npmPostExtract);
const automerge = util_1.mocked(_automerge);
const commit = util_1.mocked(_commit);
const prWorker = util_1.mocked(_prWorker);
const exec = util_1.mocked(_exec);
const fs = util_1.mocked(_fs);
const limits = util_1.mocked(_limits);
describe('workers/branch', () => {
    describe('processBranch', () => {
        const updatedPackageFiles = {
            updatedPackageFiles: [],
            artifactErrors: [],
            updatedArtifacts: [],
        };
        let config;
        beforeEach(() => {
            prWorker.ensurePr = jest.fn();
            prWorker.checkAutoMerge = jest.fn();
            config = {
                ...util_1.defaultConfig,
                branchName: 'renovate/some-branch',
                errors: [],
                warnings: [],
                upgrades: [{ depName: 'some-dep-name' }],
            };
            schedule.isScheduledNow.mockReturnValue(true);
            commit.commitFilesToBranch.mockResolvedValue('abc123');
        });
        afterEach(() => {
            util_1.platform.ensureComment.mockClear();
            util_1.platform.ensureCommentRemoval.mockClear();
            commit.commitFilesToBranch.mockClear();
            jest.resetAllMocks();
        });
        it('skips branch if not scheduled and branch does not exist', async () => {
            schedule.isScheduledNow.mockReturnValueOnce(false);
            const res = await branchWorker.processBranch(config);
            expect(res).toEqual(common_1.ProcessBranchResult.NotScheduled);
        });
        it('skips branch if not scheduled and not updating out of schedule', async () => {
            schedule.isScheduledNow.mockReturnValueOnce(false);
            config.updateNotScheduled = false;
            util_1.git.branchExists.mockReturnValueOnce(true);
            const res = await branchWorker.processBranch(config);
            expect(res).toEqual(common_1.ProcessBranchResult.NotScheduled);
        });
        it('skips branch for fresh release with stabilityDays', async () => {
            schedule.isScheduledNow.mockReturnValueOnce(true);
            config.prCreation = 'not-pending';
            config.upgrades = [
                {
                    releaseTimestamp: new Date('2019-01-01').getTime(),
                    stabilityDays: 1,
                },
                {
                    releaseTimestamp: new Date().getTime(),
                    stabilityDays: 1,
                },
            ];
            util_1.git.branchExists.mockReturnValueOnce(false);
            const res = await branchWorker.processBranch(config);
            expect(res).toEqual(common_1.ProcessBranchResult.Pending);
        });
        it('skips branch if not stabilityDays not met', async () => {
            schedule.isScheduledNow.mockReturnValueOnce(true);
            config.prCreation = 'not-pending';
            config.upgrades = [
                {
                    releaseTimestamp: '2099-12-31',
                    stabilityDays: 1,
                },
            ];
            const res = await branchWorker.processBranch(config);
            expect(res).toEqual(common_1.ProcessBranchResult.Pending);
        });
        it('processes branch if not scheduled but updating out of schedule', async () => {
            schedule.isScheduledNow.mockReturnValueOnce(false);
            config.updateNotScheduled = true;
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                state: types_1.PrState.Open,
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(false);
            await branchWorker.processBranch(config);
            expect(reuse.shouldReuseExistingBranch).toHaveBeenCalled();
        });
        it('skips branch if closed major PR found', async () => {
            schedule.isScheduledNow.mockReturnValueOnce(false);
            util_1.git.branchExists.mockReturnValueOnce(true);
            config.updateType = 'major';
            checkExisting.prAlreadyExisted.mockResolvedValueOnce({
                number: 13,
                state: types_1.PrState.Closed,
            });
            await branchWorker.processBranch(config);
            expect(reuse.shouldReuseExistingBranch).toHaveBeenCalledTimes(0);
        });
        it('skips branch if closed digest PR found', async () => {
            schedule.isScheduledNow.mockReturnValueOnce(false);
            util_1.git.branchExists.mockReturnValueOnce(true);
            config.updateType = 'digest';
            checkExisting.prAlreadyExisted.mockResolvedValueOnce({
                number: 13,
                state: types_1.PrState.Closed,
            });
            await branchWorker.processBranch(config);
            expect(reuse.shouldReuseExistingBranch).toHaveBeenCalledTimes(0);
        });
        it('skips branch if closed minor PR found', async () => {
            schedule.isScheduledNow.mockReturnValueOnce(false);
            util_1.git.branchExists.mockReturnValueOnce(true);
            checkExisting.prAlreadyExisted.mockResolvedValueOnce({
                number: 13,
                state: types_1.PrState.Closed,
            });
            await branchWorker.processBranch(config);
            expect(reuse.shouldReuseExistingBranch).toHaveBeenCalledTimes(0);
        });
        it('skips branch if merged PR found', async () => {
            schedule.isScheduledNow.mockReturnValueOnce(false);
            util_1.git.branchExists.mockReturnValueOnce(true);
            checkExisting.prAlreadyExisted.mockResolvedValueOnce({
                number: 13,
                state: types_1.PrState.Merged,
            });
            await branchWorker.processBranch(config);
            expect(reuse.shouldReuseExistingBranch).toHaveBeenCalledTimes(0);
        });
        it('throws error if closed PR found', async () => {
            schedule.isScheduledNow.mockReturnValueOnce(false);
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                state: types_1.PrState.Merged,
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            await expect(branchWorker.processBranch(config)).rejects.toThrow(error_messages_1.REPOSITORY_CHANGED);
        });
        it('does not skip branch if edited PR found with rebaseLabel', async () => {
            schedule.isScheduledNow.mockReturnValueOnce(false);
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                state: types_1.PrState.Open,
                labels: ['rebase'],
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            const res = await branchWorker.processBranch(config);
            expect(res).not.toEqual(common_1.ProcessBranchResult.PrEdited);
        });
        it('skips branch if edited PR found', async () => {
            schedule.isScheduledNow.mockReturnValueOnce(false);
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                state: types_1.PrState.Open,
                body: '**Rebasing**: something',
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            const res = await branchWorker.processBranch(config);
            expect(res).toEqual(common_1.ProcessBranchResult.PrEdited);
        });
        it('skips branch if target branch changed', async () => {
            schedule.isScheduledNow.mockReturnValueOnce(false);
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                state: types_1.PrState.Open,
                targetBranch: 'v6',
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(false);
            config.baseBranch = 'master';
            const res = await branchWorker.processBranch(config);
            expect(res).toEqual(common_1.ProcessBranchResult.PrEdited);
        });
        it('skips branch if branch edited and no PR found', async () => {
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            const res = await branchWorker.processBranch(config);
            expect(res).toEqual(common_1.ProcessBranchResult.PrEdited);
        });
        it('returns if branch creation limit exceeded', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                ...updatedPackageFiles,
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [],
            });
            limits.isLimitReached.mockReturnValueOnce(true);
            limits.isLimitReached.mockReturnValueOnce(false);
            expect(await branchWorker.processBranch(config)).toEqual(common_1.ProcessBranchResult.BranchLimitReached);
        });
        it('returns if pr creation limit exceeded and branch exists', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                ...updatedPackageFiles,
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [],
            });
            util_1.git.branchExists.mockReturnValue(true);
            prWorker.ensurePr.mockResolvedValueOnce({
                prResult: common_1.PrResult.LimitReached,
            });
            limits.isLimitReached.mockReturnValue(false);
            expect(await branchWorker.processBranch(config)).toEqual(common_1.ProcessBranchResult.PrLimitReached);
        });
        it('returns if commit limit exceeded', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                ...updatedPackageFiles,
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [],
            });
            util_1.git.branchExists.mockReturnValue(false);
            limits.isLimitReached.mockReturnValueOnce(false);
            limits.isLimitReached.mockReturnValueOnce(true);
            expect(await branchWorker.processBranch(config)).toEqual(common_1.ProcessBranchResult.CommitLimitReached);
        });
        it('returns if no work', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                ...updatedPackageFiles,
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [],
            });
            util_1.git.branchExists.mockReturnValueOnce(false);
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            expect(await branchWorker.processBranch(config)).toEqual(common_1.ProcessBranchResult.NoWork);
        });
        it('returns if branch automerged', async () => {
            getUpdated.getUpdatedPackageFiles.mockReturnValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockReturnValueOnce({
                artifactErrors: [],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            automerge.tryBranchAutomerge.mockResolvedValueOnce('automerged');
            await branchWorker.processBranch(config);
            expect(automerge.tryBranchAutomerge).toHaveBeenCalledTimes(1);
            expect(prWorker.ensurePr).toHaveBeenCalledTimes(0);
        });
        it('returns if branch automerged and no checks', async () => {
            getUpdated.getUpdatedPackageFiles.mockReturnValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockReturnValueOnce({
                artifactErrors: [],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(false);
            automerge.tryBranchAutomerge.mockResolvedValueOnce('automerged');
            await branchWorker.processBranch({
                ...config,
                requiredStatusChecks: null,
            });
            expect(automerge.tryBranchAutomerge).toHaveBeenCalledTimes(1);
            expect(prWorker.ensurePr).toHaveBeenCalledTimes(0);
        });
        it('returns if branch automerged (dry-run)', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            automerge.tryBranchAutomerge.mockResolvedValueOnce('automerged');
            await branchWorker.processBranch({ ...config, dryRun: true });
            expect(automerge.tryBranchAutomerge).toHaveBeenCalledTimes(1);
            expect(prWorker.ensurePr).toHaveBeenCalledTimes(0);
        });
        it('returns if branch exists and prCreation set to approval', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            automerge.tryBranchAutomerge.mockResolvedValueOnce('failed');
            prWorker.ensurePr.mockResolvedValueOnce({
                prResult: common_1.PrResult.AwaitingApproval,
            });
            expect(await branchWorker.processBranch(config)).toEqual(common_1.ProcessBranchResult.NeedsPrApproval);
        });
        it('returns if branch exists but pending', async () => {
            expect.assertions(1);
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            automerge.tryBranchAutomerge.mockResolvedValueOnce('failed');
            prWorker.ensurePr.mockResolvedValueOnce({
                prResult: common_1.PrResult.AwaitingNotPending,
            });
            expect(await branchWorker.processBranch(config)).toEqual(common_1.ProcessBranchResult.Pending);
        });
        it('returns if branch exists but updated', async () => {
            expect.assertions(3);
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [{}],
            });
            expect(await branchWorker.processBranch({
                ...config,
                requiredStatusChecks: null,
                prCreation: 'not-pending',
            })).toEqual(common_1.ProcessBranchResult.Pending);
            expect(automerge.tryBranchAutomerge).toHaveBeenCalledTimes(0);
            expect(prWorker.ensurePr).toHaveBeenCalledTimes(0);
        });
        it('ensures PR and tries automerge', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockReturnValueOnce({
                artifactErrors: [],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            automerge.tryBranchAutomerge.mockResolvedValueOnce('failed');
            prWorker.ensurePr.mockResolvedValueOnce({
                result: common_1.PrResult.Created,
                pr: {},
            });
            prWorker.checkAutoMerge.mockResolvedValueOnce(true);
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            await branchWorker.processBranch(config);
            expect(prWorker.ensurePr).toHaveBeenCalledTimes(1);
            expect(util_1.platform.ensureCommentRemoval).toHaveBeenCalledTimes(1);
            expect(prWorker.checkAutoMerge).toHaveBeenCalledTimes(1);
        });
        it('ensures PR and adds lock file error comment if no releaseTimestamp', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [{}],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            automerge.tryBranchAutomerge.mockResolvedValueOnce('failed');
            prWorker.ensurePr.mockResolvedValueOnce({
                result: common_1.PrResult.Created,
                pr: {},
            });
            prWorker.checkAutoMerge.mockResolvedValueOnce(true);
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            await branchWorker.processBranch(config);
            expect(util_1.platform.ensureComment).toHaveBeenCalledTimes(1);
            expect(prWorker.ensurePr).toHaveBeenCalledTimes(1);
            expect(prWorker.checkAutoMerge).toHaveBeenCalledTimes(0);
        });
        it('ensures PR and adds lock file error comment if old releaseTimestamp', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [{}],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            automerge.tryBranchAutomerge.mockResolvedValueOnce('failed');
            prWorker.ensurePr.mockResolvedValueOnce({
                result: common_1.PrResult.Created,
                pr: {},
            });
            prWorker.checkAutoMerge.mockResolvedValueOnce(true);
            config.releaseTimestamp = '2018-04-26T05:15:51.877Z';
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            await branchWorker.processBranch(config);
            expect(util_1.platform.ensureComment).toHaveBeenCalledTimes(1);
            expect(prWorker.ensurePr).toHaveBeenCalledTimes(1);
            expect(prWorker.checkAutoMerge).toHaveBeenCalledTimes(0);
        });
        it('ensures PR and adds lock file error comment if new releaseTimestamp and branch exists', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [{}],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            automerge.tryBranchAutomerge.mockResolvedValueOnce('failed');
            prWorker.ensurePr.mockResolvedValueOnce({
                result: common_1.PrResult.Created,
                pr: {},
            });
            prWorker.checkAutoMerge.mockResolvedValueOnce(true);
            config.releaseTimestamp = new Date().toISOString();
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            await branchWorker.processBranch(config);
            expect(util_1.platform.ensureComment).toHaveBeenCalledTimes(1);
            expect(prWorker.ensurePr).toHaveBeenCalledTimes(1);
            expect(prWorker.checkAutoMerge).toHaveBeenCalledTimes(0);
        });
        it('throws error if lock file errors and new releaseTimestamp', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [{}],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(false);
            automerge.tryBranchAutomerge.mockResolvedValueOnce('failed');
            prWorker.ensurePr.mockResolvedValueOnce({
                result: common_1.PrResult.Created,
                pr: {},
            });
            prWorker.checkAutoMerge.mockResolvedValueOnce(true);
            config.releaseTimestamp = new Date().toISOString();
            await expect(branchWorker.processBranch(config)).rejects.toThrow(Error(error_messages_1.MANAGER_LOCKFILE_ERROR));
        });
        it('ensures PR and adds lock file error comment recreate closed', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [{}],
                updatedArtifacts: [{}],
            });
            config.recreateClosed = true;
            util_1.git.branchExists.mockReturnValueOnce(true);
            automerge.tryBranchAutomerge.mockResolvedValueOnce('failed');
            prWorker.ensurePr.mockResolvedValueOnce({
                result: common_1.PrResult.Created,
                pr: {},
            });
            prWorker.checkAutoMerge.mockResolvedValueOnce(true);
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            await branchWorker.processBranch(config);
            expect(util_1.platform.ensureComment).toHaveBeenCalledTimes(1);
            expect(prWorker.ensurePr).toHaveBeenCalledTimes(1);
            expect(prWorker.checkAutoMerge).toHaveBeenCalledTimes(0);
        });
        it('swallows branch errors', async () => {
            getUpdated.getUpdatedPackageFiles.mockImplementationOnce(() => {
                throw new Error('some error');
            });
            const processBranchResult = await branchWorker.processBranch(config);
            expect(processBranchResult).not.toBeNull();
        });
        it('throws and swallows branch errors', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [{}],
                updatedArtifacts: [{}],
            });
            const processBranchResult = await branchWorker.processBranch(config);
            expect(processBranchResult).not.toBeNull();
        });
        it('swallows pr errors', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            automerge.tryBranchAutomerge.mockResolvedValueOnce(false);
            prWorker.ensurePr.mockImplementationOnce(() => {
                throw new Error('some error');
            });
            const processBranchResult = await branchWorker.processBranch(config);
            expect(processBranchResult).not.toBeNull();
        });
        it('closed pr (dry run)', async () => {
            util_1.git.branchExists.mockReturnValueOnce(true);
            checkExisting.prAlreadyExisted.mockResolvedValueOnce({
                state: types_1.PrState.Closed,
            });
            expect(await branchWorker.processBranch({ ...config, dryRun: true })).toEqual(common_1.ProcessBranchResult.AlreadyExisted);
        });
        it('branch pr no rebase (dry run)', async () => {
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                state: types_1.PrState.Open,
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            expect(await branchWorker.processBranch({ ...config, dryRun: true })).toEqual(common_1.ProcessBranchResult.PrEdited);
        });
        it('branch pr no schedule lockfile (dry run)', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
                artifactErrors: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                title: 'rebase!',
                state: types_1.PrState.Open,
                body: `- [x] <!-- rebase-check -->`,
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            schedule.isScheduledNow.mockReturnValueOnce(false);
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            expect(await branchWorker.processBranch({
                ...config,
                dryRun: true,
                updateType: 'lockFileMaintenance',
                reuseExistingBranch: false,
                updatedArtifacts: [{ name: '|delete|', contents: 'dummy' }],
            })).toEqual(common_1.ProcessBranchResult.Done);
        });
        it('branch pr no schedule (dry run)', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
                artifactErrors: [{}],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                title: 'rebase!',
                state: types_1.PrState.Open,
                body: `- [x] <!-- rebase-check -->`,
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            schedule.isScheduledNow.mockReturnValueOnce(false);
            prWorker.ensurePr.mockResolvedValueOnce({
                result: common_1.PrResult.Created,
                pr: {},
            });
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            expect(await branchWorker.processBranch({
                ...config,
                dryRun: true,
                artifactErrors: [{}],
            })).toEqual(common_1.ProcessBranchResult.Done);
        });
        it('branch pr no schedule', async () => {
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [{}],
                artifactErrors: [],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [{}],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                title: 'rebase!',
                state: types_1.PrState.Open,
                body: `- [x] <!-- rebase-check -->`,
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            schedule.isScheduledNow.mockReturnValueOnce(false);
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            expect(await branchWorker.processBranch({
                ...config,
                updateType: 'lockFileMaintenance',
                reuseExistingBranch: false,
                updatedArtifacts: [{ name: '|delete|', contents: 'dummy' }],
            })).toEqual(common_1.ProcessBranchResult.Done);
        });
        it('executes post-upgrade tasks if trust is high', async () => {
            const updatedPackageFile = {
                name: 'pom.xml',
                contents: 'pom.xml file contents',
            };
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [updatedPackageFile],
                artifactErrors: [],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [
                    {
                        name: 'yarn.lock',
                        contents: Buffer.from([1, 2, 3]) /* Binary content */,
                    },
                ],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                title: 'rebase!',
                state: types_1.PrState.Open,
                body: `- [x] <!-- rebase-check -->`,
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            util_1.git.getRepoStatus.mockResolvedValueOnce({
                modified: ['modified_file'],
                not_added: [],
                deleted: ['deleted_file'],
            });
            global.trustLevel = 'high';
            fs.outputFile.mockReturnValue();
            fs.readFile.mockResolvedValueOnce(Buffer.from('modified file content'));
            schedule.isScheduledNow.mockReturnValueOnce(false);
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            const result = await branchWorker.processBranch({
                ...config,
                postUpgradeTasks: {
                    commands: ['echo {{{versioning}}}', 'disallowed task'],
                    fileFilters: ['modified_file', 'deleted_file'],
                },
                localDir: '/localDir',
                allowedPostUpgradeCommands: ['^echo {{{versioning}}}$'],
                allowPostUpgradeCommandTemplating: true,
                upgrades: [
                    {
                        ...util_1.defaultConfig,
                        depName: 'some-dep-name',
                        postUpgradeTasks: {
                            commands: ['echo {{{versioning}}}', 'disallowed task'],
                            fileFilters: ['modified_file', 'deleted_file'],
                        },
                    },
                ],
            });
            expect(result).toEqual(common_1.ProcessBranchResult.Done);
            expect(exec.exec).toHaveBeenCalledWith('echo semver', {
                cwd: '/localDir',
            });
        });
        it('executes post-upgrade tasks with disabled post-upgrade command templating', async () => {
            const updatedPackageFile = {
                name: 'pom.xml',
                contents: 'pom.xml file contents',
            };
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [updatedPackageFile],
                artifactErrors: [],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [
                    {
                        name: 'yarn.lock',
                        contents: Buffer.from([1, 2, 3]) /* Binary content */,
                    },
                ],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                title: 'rebase!',
                state: types_1.PrState.Open,
                body: `- [x] <!-- rebase-check -->`,
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            util_1.git.getRepoStatus.mockResolvedValueOnce({
                modified: ['modified_file'],
                not_added: [],
                deleted: ['deleted_file'],
            });
            global.trustLevel = 'high';
            fs.outputFile.mockReturnValue();
            fs.readFile.mockResolvedValueOnce(Buffer.from('modified file content'));
            schedule.isScheduledNow.mockReturnValueOnce(false);
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            const result = await branchWorker.processBranch({
                ...config,
                postUpgradeTasks: {
                    commands: ['echo {{{versioning}}}', 'disallowed task'],
                    fileFilters: ['modified_file', 'deleted_file'],
                },
                localDir: '/localDir',
                allowedPostUpgradeCommands: ['^echo {{{versioning}}}$'],
                allowPostUpgradeCommandTemplating: false,
                upgrades: [
                    {
                        ...util_1.defaultConfig,
                        depName: 'some-dep-name',
                        postUpgradeTasks: {
                            commands: ['echo {{{versioning}}}', 'disallowed task'],
                            fileFilters: ['modified_file', 'deleted_file'],
                        },
                    },
                ],
            });
            expect(result).toEqual(common_1.ProcessBranchResult.Done);
            expect(exec.exec).toHaveBeenCalledWith('echo {{{versioning}}}', {
                cwd: '/localDir',
            });
        });
        it('executes post-upgrade tasks with multiple dependecy in one branch', async () => {
            const updatedPackageFile = {
                name: 'pom.xml',
                contents: 'pom.xml file contents',
            };
            getUpdated.getUpdatedPackageFiles.mockResolvedValueOnce({
                updatedPackageFiles: [updatedPackageFile],
                artifactErrors: [],
            });
            npmPostExtract.getAdditionalFiles.mockResolvedValueOnce({
                artifactErrors: [],
                updatedArtifacts: [
                    {
                        name: 'yarn.lock',
                        contents: Buffer.from([1, 2, 3]) /* Binary content */,
                    },
                ],
            });
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.platform.getBranchPr.mockResolvedValueOnce({
                title: 'rebase!',
                state: types_1.PrState.Open,
                body: `- [x] <!-- rebase-check -->`,
            });
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            util_1.git.getRepoStatus
                .mockResolvedValueOnce({
                modified: ['modified_file', 'modified_then_deleted_file'],
                not_added: [],
                deleted: ['deleted_file', 'deleted_then_created_file'],
            })
                .mockResolvedValueOnce({
                modified: ['modified_file', 'deleted_then_created_file'],
                not_added: [],
                deleted: ['deleted_file', 'modified_then_deleted_file'],
            });
            global.trustLevel = 'high';
            fs.outputFile.mockReturnValue();
            fs.readFile
                .mockResolvedValueOnce(Buffer.from('modified file content'))
                .mockResolvedValueOnce(Buffer.from('this file will not exists'))
                .mockResolvedValueOnce(Buffer.from('modified file content again'))
                .mockResolvedValueOnce(Buffer.from('this file was once deleted'));
            schedule.isScheduledNow.mockReturnValueOnce(false);
            commit.commitFilesToBranch.mockResolvedValueOnce(null);
            const inconfig = {
                ...config,
                postUpgradeTasks: {
                    commands: ['echo {{{depName}}}', 'disallowed task'],
                    fileFilters: [
                        'modified_file',
                        'deleted_file',
                        'deleted_then_created_file',
                        'modified_then_deleted_file',
                    ],
                },
                localDir: '/localDir',
                allowedPostUpgradeCommands: ['^echo {{{depName}}}$'],
                allowPostUpgradeCommandTemplating: true,
                upgrades: [
                    {
                        ...util_1.defaultConfig,
                        depName: 'some-dep-name-1',
                        postUpgradeTasks: {
                            commands: ['echo {{{depName}}}', 'disallowed task'],
                            fileFilters: [
                                'modified_file',
                                'deleted_file',
                                'deleted_then_created_file',
                                'modified_then_deleted_file',
                            ],
                        },
                    },
                    {
                        ...util_1.defaultConfig,
                        depName: 'some-dep-name-2',
                        postUpgradeTasks: {
                            commands: ['echo {{{depName}}}', 'disallowed task'],
                            fileFilters: [
                                'modified_file',
                                'deleted_file',
                                'deleted_then_created_file',
                                'modified_then_deleted_file',
                            ],
                        },
                    },
                ],
            };
            const result = await branchWorker.processBranch(inconfig);
            expect(result).toEqual(common_1.ProcessBranchResult.Done);
            expect(exec.exec).toHaveBeenNthCalledWith(1, 'echo some-dep-name-1', {
                cwd: '/localDir',
            });
            expect(exec.exec).toHaveBeenNthCalledWith(2, 'echo some-dep-name-2', {
                cwd: '/localDir',
            });
            expect(exec.exec).toHaveBeenCalledTimes(2);
            expect(commit.commitFilesToBranch.mock.calls[0][0].updatedArtifacts.find((f) => f.name === 'modified_file').contents.toString()).toBe('modified file content again');
            expect(commit.commitFilesToBranch.mock.calls[0][0].updatedArtifacts.find((f) => f.name === 'deleted_then_created_file').contents.toString()).toBe('this file was once deleted');
            expect(commit.commitFilesToBranch.mock.calls[0][0].updatedArtifacts.find((f) => f.contents === 'deleted_then_created_file' && f.name === '|delete|')).toBeUndefined();
            expect(commit.commitFilesToBranch.mock.calls[0][0].updatedArtifacts.find((f) => f.name === 'modified_then_deleted_file')).toBeUndefined();
            expect(commit.commitFilesToBranch.mock.calls[0][0].updatedArtifacts.find((f) => f.contents === 'modified_then_deleted_file' && f.name === '|delete|')).not.toBeUndefined();
        });
    });
});
//# sourceMappingURL=index.spec.js.map