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
const jest_mock_extended_1 = require("jest-mock-extended");
const util_1 = require("../../../../../test/util");
const types_1 = require("../../../../types");
const _rebase = __importStar(require("./rebase"));
const _1 = require(".");
const rebase = _rebase;
jest.mock('../../../../workers/repository/onboarding/branch/rebase');
jest.mock('../../../../util/fs');
jest.mock('../../../../util/git');
describe('workers/repository/onboarding/branch', () => {
    describe('checkOnboardingBranch', () => {
        let config;
        beforeEach(() => {
            jest.resetAllMocks();
            config = util_1.getConfig();
            config.repository = 'some/repo';
            util_1.git.getFileList.mockResolvedValue([]);
        });
        it('throws if no package files', async () => {
            await expect(_1.checkOnboardingBranch(config)).rejects.toThrow();
        });
        it('throws if fork', async () => {
            config.isFork = true;
            await expect(_1.checkOnboardingBranch(config)).rejects.toThrow();
        });
        it('has default onboarding config', async () => {
            util_1.git.getFileList.mockResolvedValue(['package.json']);
            util_1.fs.readLocalFile.mockResolvedValue('{}');
            await _1.checkOnboardingBranch(config);
            expect(util_1.git.commitFiles.mock.calls[0][0].files[0].contents).toMatchSnapshot();
        });
        it('handles skipped onboarding combined with requireConfig = false', async () => {
            config.requireConfig = false;
            config.onboarding = false;
            const res = await _1.checkOnboardingBranch(config);
            expect(res.repoIsOnboarded).toBe(true);
        });
        it('handles skipped onboarding, requireConfig=true, and a config file', async () => {
            config.requireConfig = true;
            config.onboarding = false;
            util_1.git.getFileList.mockResolvedValueOnce(['renovate.json']);
            const res = await _1.checkOnboardingBranch(config);
            expect(res.repoIsOnboarded).toBe(true);
        });
        it('handles skipped onboarding, requireConfig=true, and no config file', async () => {
            config.requireConfig = true;
            config.onboarding = false;
            util_1.git.getFileList.mockResolvedValueOnce(['package.json']);
            util_1.fs.readLocalFile.mockResolvedValueOnce('{}');
            const onboardingResult = _1.checkOnboardingBranch(config);
            await expect(onboardingResult).rejects.toThrow('disabled');
        });
        it('detects repo is onboarded via file', async () => {
            util_1.git.getFileList.mockResolvedValueOnce(['renovate.json']);
            const res = await _1.checkOnboardingBranch(config);
            expect(res.repoIsOnboarded).toBe(true);
        });
        it('detects repo is onboarded via package.json config', async () => {
            util_1.git.getFileList.mockResolvedValueOnce(['package.json']);
            util_1.fs.readLocalFile.mockResolvedValueOnce('{"renovate":{}}');
            const res = await _1.checkOnboardingBranch(config);
            expect(res.repoIsOnboarded).toBe(true);
        });
        it('detects repo is onboarded via PR', async () => {
            config.requireConfig = false;
            util_1.platform.findPr.mockResolvedValueOnce(jest_mock_extended_1.mock());
            const res = await _1.checkOnboardingBranch(config);
            expect(res.repoIsOnboarded).toBe(true);
        });
        it('throws if no required config', async () => {
            config.requireConfig = true;
            util_1.platform.findPr.mockResolvedValue(jest_mock_extended_1.mock());
            util_1.platform.getPrList.mockResolvedValueOnce([
                {
                    ...jest_mock_extended_1.mock(),
                    sourceBranch: 'renovate/something',
                    state: types_1.PrState.Open,
                },
            ]);
            await expect(_1.checkOnboardingBranch(config)).rejects.toThrow();
        });
        it('updates onboarding branch', async () => {
            util_1.git.getFileList.mockResolvedValue(['package.json']);
            util_1.platform.findPr.mockResolvedValue(null);
            util_1.platform.getBranchPr.mockResolvedValueOnce(jest_mock_extended_1.mock());
            rebase.rebaseOnboardingBranch.mockResolvedValueOnce('abc123');
            const res = await _1.checkOnboardingBranch(config);
            expect(res.repoIsOnboarded).toBe(false);
            expect(res.branchList).toEqual(['renovate/configure']);
            expect(util_1.git.checkoutBranch).toHaveBeenCalledTimes(1);
            expect(util_1.git.commitFiles).toHaveBeenCalledTimes(0);
        });
    });
});
//# sourceMappingURL=index.spec.js.map