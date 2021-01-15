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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const bunyan_1 = require("bunyan");
const jest_mock_extended_1 = require("jest-mock-extended");
const util_1 = require("../../../test/util");
const platforms_1 = require("../../constants/platforms");
const types_1 = require("../../types");
const common_1 = require("../common");
const dependencyDashboard = __importStar(require("./dependency-dashboard"));
let config;
beforeEach(() => {
    jest.clearAllMocks();
    config = util_1.getConfig();
    config.platform = platforms_1.PLATFORM_TYPE_GITHUB;
    config.errors = [];
    config.warnings = [];
});
async function dryRun(branches, 
// eslint-disable-next-line @typescript-eslint/no-shadow
platform, ensureIssueClosingCalls = 0, ensureIssueCalls = 0, getBranchPrCalls = 0, findPrCalls = 0) {
    jest.clearAllMocks();
    config.dryRun = true;
    await dependencyDashboard.ensureMasterIssue(config, branches);
    expect(platform.ensureIssueClosing).toHaveBeenCalledTimes(ensureIssueClosingCalls);
    expect(platform.ensureIssue).toHaveBeenCalledTimes(ensureIssueCalls);
    expect(platform.getBranchPr).toHaveBeenCalledTimes(getBranchPrCalls);
    expect(platform.findPr).toHaveBeenCalledTimes(findPrCalls);
}
describe('workers/repository/master-issue', () => {
    describe('ensureMasterIssue()', () => {
        it('do nothing if masterissue is disable', async () => {
            const branches = [];
            await dependencyDashboard.ensureMasterIssue(config, branches);
            expect(util_1.platform.ensureIssueClosing).toHaveBeenCalledTimes(0);
            expect(util_1.platform.ensureIssue).toHaveBeenCalledTimes(0);
            expect(util_1.platform.getBranchPr).toHaveBeenCalledTimes(0);
            expect(util_1.platform.findPr).toHaveBeenCalledTimes(0);
            // same with dry run
            await dryRun(branches, util_1.platform);
        });
        it('do nothing if it has no masterissueapproval branches', async () => {
            const branches = [
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr1',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr2',
                    dependencyDashboardApproval: false,
                },
            ];
            await dependencyDashboard.ensureMasterIssue(config, branches);
            expect(util_1.platform.ensureIssueClosing).toHaveBeenCalledTimes(0);
            expect(util_1.platform.ensureIssue).toHaveBeenCalledTimes(0);
            expect(util_1.platform.getBranchPr).toHaveBeenCalledTimes(0);
            expect(util_1.platform.findPr).toHaveBeenCalledTimes(0);
            // same with dry run
            await dryRun(branches, util_1.platform);
        });
        it('closes Dependency Dashboard when there is 0 PR opened and dependencyDashboardAutoclose is true', async () => {
            const branches = [];
            config.dependencyDashboard = true;
            config.dependencyDashboardAutoclose = true;
            await dependencyDashboard.ensureMasterIssue(config, branches);
            expect(util_1.platform.ensureIssueClosing).toHaveBeenCalledTimes(1);
            expect(util_1.platform.ensureIssueClosing.mock.calls[0][0]).toBe(config.dependencyDashboardTitle);
            expect(util_1.platform.ensureIssue).toHaveBeenCalledTimes(0);
            expect(util_1.platform.getBranchPr).toHaveBeenCalledTimes(0);
            expect(util_1.platform.findPr).toHaveBeenCalledTimes(0);
            // same with dry run
            await dryRun(branches, util_1.platform);
        });
        it('closes Dependency Dashboard when all branches are automerged and dependencyDashboardAutoclose is true', async () => {
            const branches = [
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr1',
                    res: common_1.ProcessBranchResult.Automerged,
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr2',
                    res: common_1.ProcessBranchResult.Automerged,
                    dependencyDashboardApproval: false,
                },
            ];
            config.dependencyDashboard = true;
            config.dependencyDashboardAutoclose = true;
            await dependencyDashboard.ensureMasterIssue(config, branches);
            expect(util_1.platform.ensureIssueClosing).toHaveBeenCalledTimes(1);
            expect(util_1.platform.ensureIssueClosing.mock.calls[0][0]).toBe(config.dependencyDashboardTitle);
            expect(util_1.platform.ensureIssue).toHaveBeenCalledTimes(0);
            expect(util_1.platform.getBranchPr).toHaveBeenCalledTimes(0);
            expect(util_1.platform.findPr).toHaveBeenCalledTimes(0);
            // same with dry run
            await dryRun(branches, util_1.platform);
        });
        it('open or update Dependency Dashboard when all branches are closed and dependencyDashboardAutoclose is false', async () => {
            const branches = [];
            config.dependencyDashboard = true;
            config.dependencyDashboardFooter = 'And this is a footer';
            await dependencyDashboard.ensureMasterIssue(config, branches);
            expect(util_1.platform.ensureIssueClosing).toHaveBeenCalledTimes(0);
            expect(util_1.platform.ensureIssue).toHaveBeenCalledTimes(1);
            expect(util_1.platform.ensureIssue.mock.calls[0][0].title).toBe(config.dependencyDashboardTitle);
            expect(util_1.platform.ensureIssue.mock.calls[0][0].body).toMatchSnapshot();
            expect(util_1.platform.getBranchPr).toHaveBeenCalledTimes(0);
            expect(util_1.platform.findPr).toHaveBeenCalledTimes(0);
            // same with dry run
            await dryRun(branches, util_1.platform);
        });
        it('checks an issue with 2 Pending Approvals, 2 not scheduled, 2 pr-hourly-limit-reached and 2 in error', async () => {
            const branches = [
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr1',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep1' }],
                    res: common_1.ProcessBranchResult.NeedsApproval,
                    branchName: 'branchName1',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr2',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep2' }],
                    res: common_1.ProcessBranchResult.NeedsApproval,
                    branchName: 'branchName2',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr3',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep3' }],
                    res: common_1.ProcessBranchResult.NotScheduled,
                    branchName: 'branchName3',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr4',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep4' }],
                    res: common_1.ProcessBranchResult.NotScheduled,
                    branchName: 'branchName4',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr5',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep5' }],
                    res: common_1.ProcessBranchResult.PrLimitReached,
                    branchName: 'branchName5',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr6',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep6' }],
                    res: common_1.ProcessBranchResult.PrLimitReached,
                    branchName: 'branchName6',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr7',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep7' }],
                    res: common_1.ProcessBranchResult.Error,
                    branchName: 'branchName7',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr8',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep8' }],
                    res: common_1.ProcessBranchResult.Error,
                    branchName: 'branchName8',
                },
            ];
            config.dependencyDashboard = true;
            await dependencyDashboard.ensureMasterIssue(config, branches);
            expect(util_1.platform.ensureIssueClosing).toHaveBeenCalledTimes(0);
            expect(util_1.platform.ensureIssue).toHaveBeenCalledTimes(1);
            expect(util_1.platform.ensureIssue.mock.calls[0][0].title).toBe(config.dependencyDashboardTitle);
            expect(util_1.platform.ensureIssue.mock.calls[0][0].body).toBe(fs_1.default.readFileSync('lib/workers/repository/__fixtures__/master-issue_with_8_PR.txt', 'utf8'));
            expect(util_1.platform.getBranchPr).toHaveBeenCalledTimes(0);
            expect(util_1.platform.findPr).toHaveBeenCalledTimes(0);
            // same with dry run
            await dryRun(branches, util_1.platform);
        });
        it('checks an issue with 2 PR pr-edited', async () => {
            const branches = [
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr1',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep1' }],
                    res: common_1.ProcessBranchResult.PrEdited,
                    branchName: 'branchName1',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr2',
                    upgrades: [
                        { ...jest_mock_extended_1.mock(), depName: 'dep2' },
                        { ...jest_mock_extended_1.mock(), depName: 'dep3' },
                    ],
                    res: common_1.ProcessBranchResult.PrEdited,
                    branchName: 'branchName2',
                },
            ];
            config.dependencyDashboard = true;
            util_1.platform.getBranchPr
                .mockResolvedValueOnce({ ...jest_mock_extended_1.mock(), number: 1 })
                .mockResolvedValueOnce(undefined);
            await dependencyDashboard.ensureMasterIssue(config, branches);
            expect(util_1.platform.ensureIssueClosing).toHaveBeenCalledTimes(0);
            expect(util_1.platform.ensureIssue).toHaveBeenCalledTimes(1);
            expect(util_1.platform.ensureIssue.mock.calls[0][0].title).toBe(config.dependencyDashboardTitle);
            expect(util_1.platform.ensureIssue.mock.calls[0][0].body).toBe(fs_1.default.readFileSync('lib/workers/repository/__fixtures__/master-issue_with_2_PR_edited.txt', 'utf8'));
            expect(util_1.platform.getBranchPr).toHaveBeenCalledTimes(2);
            expect(util_1.platform.getBranchPr.mock.calls[0][0]).toBe('branchName1');
            expect(util_1.platform.getBranchPr.mock.calls[1][0]).toBe('branchName2');
            expect(util_1.platform.findPr).toHaveBeenCalledTimes(0);
            // same with dry run
            await dryRun(branches, util_1.platform, 0, 0, 2, 0);
        });
        it('checks an issue with 3 PR in progress and rebase all option', async () => {
            const branches = [
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr1',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep1' }],
                    res: common_1.ProcessBranchResult.Rebase,
                    branchName: 'branchName1',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr2',
                    upgrades: [
                        { ...jest_mock_extended_1.mock(), depName: 'dep2' },
                        { ...jest_mock_extended_1.mock(), depName: 'dep3' },
                    ],
                    res: common_1.ProcessBranchResult.Rebase,
                    branchName: 'branchName2',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr3',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep3' }],
                    res: common_1.ProcessBranchResult.Rebase,
                    branchName: 'branchName3',
                },
            ];
            config.dependencyDashboard = true;
            util_1.platform.getBranchPr
                .mockResolvedValueOnce({ ...jest_mock_extended_1.mock(), number: 1 })
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce({ ...jest_mock_extended_1.mock(), number: 3 });
            await dependencyDashboard.ensureMasterIssue(config, branches);
            expect(util_1.platform.ensureIssueClosing).toHaveBeenCalledTimes(0);
            expect(util_1.platform.ensureIssue).toHaveBeenCalledTimes(1);
            expect(util_1.platform.ensureIssue.mock.calls[0][0].title).toBe(config.dependencyDashboardTitle);
            expect(util_1.platform.ensureIssue.mock.calls[0][0].body).toBe(fs_1.default.readFileSync('lib/workers/repository/__fixtures__/master-issue_with_3_PR_in_progress.txt', 'utf8'));
            expect(util_1.platform.getBranchPr).toHaveBeenCalledTimes(3);
            expect(util_1.platform.getBranchPr.mock.calls[0][0]).toBe('branchName1');
            expect(util_1.platform.getBranchPr.mock.calls[1][0]).toBe('branchName2');
            expect(util_1.platform.getBranchPr.mock.calls[2][0]).toBe('branchName3');
            expect(util_1.platform.findPr).toHaveBeenCalledTimes(0);
            // same with dry run
            await dryRun(branches, util_1.platform, 0, 0, 3, 0);
        });
        it('checks an issue with 2 PR closed / ignored', async () => {
            const branches = [
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr1',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep1' }],
                    res: common_1.ProcessBranchResult.AlreadyExisted,
                    branchName: 'branchName1',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr2',
                    upgrades: [
                        { ...jest_mock_extended_1.mock(), depName: 'dep2' },
                        { ...jest_mock_extended_1.mock(), depName: 'dep3' },
                    ],
                    res: common_1.ProcessBranchResult.AlreadyExisted,
                    branchName: 'branchName2',
                },
            ];
            config.dependencyDashboard = true;
            util_1.platform.getBranchPr
                .mockResolvedValueOnce({ ...jest_mock_extended_1.mock(), number: 1 })
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce({ ...jest_mock_extended_1.mock(), number: 3 });
            await dependencyDashboard.ensureMasterIssue(config, branches);
            expect(util_1.platform.ensureIssueClosing).toHaveBeenCalledTimes(0);
            expect(util_1.platform.ensureIssue).toHaveBeenCalledTimes(1);
            expect(util_1.platform.ensureIssue.mock.calls[0][0].title).toBe(config.dependencyDashboardTitle);
            expect(util_1.platform.ensureIssue.mock.calls[0][0].body).toBe(fs_1.default.readFileSync('lib/workers/repository/__fixtures__/master-issue_with_2_PR_closed_ignored.txt', 'utf8'));
            expect(util_1.platform.getBranchPr).toHaveBeenCalledTimes(0);
            expect(util_1.platform.findPr).toHaveBeenCalledTimes(2);
            expect(util_1.platform.findPr.mock.calls[0][0].branchName).toBe('branchName1');
            expect(util_1.platform.findPr.mock.calls[0][0].prTitle).toBe('pr1');
            expect(util_1.platform.findPr.mock.calls[0][0].state).toBe(types_1.PrState.NotOpen);
            expect(util_1.platform.findPr.mock.calls[1][0].branchName).toBe('branchName2');
            expect(util_1.platform.findPr.mock.calls[1][0].prTitle).toBe('pr2');
            expect(util_1.platform.findPr.mock.calls[1][0].state).toBe(types_1.PrState.NotOpen);
            // same with dry run
            await dryRun(branches, util_1.platform, 0, 0, 0, 2);
        });
        it('checks an issue with 3 PR in approval', async () => {
            const branches = [
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr1',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep1' }],
                    res: common_1.ProcessBranchResult.NeedsPrApproval,
                    branchName: 'branchName1',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr2',
                    upgrades: [
                        { ...jest_mock_extended_1.mock(), depName: 'dep2' },
                        { ...jest_mock_extended_1.mock(), depName: 'dep3' },
                    ],
                    res: common_1.ProcessBranchResult.NeedsPrApproval,
                    branchName: 'branchName2',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr3',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep3' }],
                    res: common_1.ProcessBranchResult.NeedsPrApproval,
                    branchName: 'branchName3',
                },
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr4',
                    upgrades: [{ ...jest_mock_extended_1.mock(), depName: 'dep4' }],
                    res: common_1.ProcessBranchResult.Pending,
                    branchName: 'branchName4',
                },
            ];
            config.dependencyDashboard = true;
            config.dependencyDashboardPrApproval = true;
            await dependencyDashboard.ensureMasterIssue(config, branches);
            expect(util_1.platform.ensureIssueClosing).toHaveBeenCalledTimes(0);
            expect(util_1.platform.ensureIssue).toHaveBeenCalledTimes(1);
            expect(util_1.platform.ensureIssue.mock.calls[0][0].title).toBe(config.dependencyDashboardTitle);
            expect(util_1.platform.ensureIssue.mock.calls[0][0].body).toBe(fs_1.default.readFileSync('lib/workers/repository/__fixtures__/master-issue_with_3_PR_in_approval.txt', 'utf8'));
            expect(util_1.platform.findPr).toHaveBeenCalledTimes(0);
            // same with dry run
            await dryRun(branches, util_1.platform);
        });
        it('contains logged problems', async () => {
            const branches = [
                {
                    ...jest_mock_extended_1.mock(),
                    prTitle: 'pr1',
                    upgrades: [
                        { ...jest_mock_extended_1.mock(), depName: 'dep1', repository: 'repo1' },
                    ],
                    res: common_1.ProcessBranchResult.Pending,
                    branchName: 'branchName1',
                },
            ];
            util_1.logger.getProblems.mockReturnValueOnce([
                {
                    level: bunyan_1.ERROR,
                    msg: 'everything is broken',
                },
                {
                    level: bunyan_1.WARN,
                    msg: 'just a bit',
                },
                {
                    level: bunyan_1.ERROR,
                    msg: 'i am a duplicated problem',
                },
                {
                    level: bunyan_1.ERROR,
                    msg: 'i am a duplicated problem',
                },
                {
                    level: bunyan_1.ERROR,
                    msg: 'i am a non-duplicated problem',
                },
                {
                    level: bunyan_1.WARN,
                    msg: 'i am a non-duplicated problem',
                },
                {
                    level: bunyan_1.WARN,
                    msg: 'i am an artifact error',
                    artifactErrors: {},
                },
            ]);
            config.dependencyDashboard = true;
            await dependencyDashboard.ensureMasterIssue(config, branches);
            expect(util_1.platform.ensureIssue).toHaveBeenCalledTimes(1);
            expect(util_1.platform.ensureIssue.mock.calls[0][0].body).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=dependency-dashboard.spec.js.map