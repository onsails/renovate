"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../../test/util");
const rebase_1 = require("./rebase");
jest.mock('../../../../util/git');
describe('workers/repository/onboarding/branch/rebase', () => {
    describe('rebaseOnboardingBranch()', () => {
        let config;
        beforeEach(() => {
            jest.resetAllMocks();
            config = {
                ...util_1.defaultConfig,
                repository: 'some/repo',
            };
        });
        it('does not rebase modified branch', async () => {
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            await rebase_1.rebaseOnboardingBranch(config);
            expect(util_1.git.commitFiles).toHaveBeenCalledTimes(0);
        });
        it('does nothing if branch is up to date', async () => {
            const contents = JSON.stringify(util_1.defaultConfig.onboardingConfig, null, 2) + '\n';
            util_1.git.getFile
                .mockResolvedValueOnce(contents) // package.json
                .mockResolvedValueOnce(contents); // renovate.json
            await rebase_1.rebaseOnboardingBranch(config);
            expect(util_1.git.commitFiles).toHaveBeenCalledTimes(0);
        });
        it('rebases onboarding branch', async () => {
            util_1.git.isBranchStale.mockResolvedValueOnce(true);
            await rebase_1.rebaseOnboardingBranch(config);
            expect(util_1.git.commitFiles).toHaveBeenCalledTimes(1);
        });
        it('uses the onboardingConfigFileName if set', async () => {
            util_1.git.isBranchStale.mockResolvedValueOnce(true);
            await rebase_1.rebaseOnboardingBranch({
                ...config,
                onboardingConfigFileName: '.github/renovate.json',
            });
            expect(util_1.git.commitFiles).toHaveBeenCalledTimes(1);
            expect(util_1.git.commitFiles.mock.calls[0][0].message).toContain('.github/renovate.json');
            expect(util_1.git.commitFiles.mock.calls[0][0].files[0].name).toBe('.github/renovate.json');
        });
        it('falls back to "renovate.json" if onboardingConfigFileName is not set', async () => {
            util_1.git.isBranchStale.mockResolvedValueOnce(true);
            await rebase_1.rebaseOnboardingBranch({
                ...config,
                onboardingConfigFileName: undefined,
            });
            expect(util_1.git.commitFiles).toHaveBeenCalledTimes(1);
            expect(util_1.git.commitFiles.mock.calls[0][0].message).toContain('renovate.json');
            expect(util_1.git.commitFiles.mock.calls[0][0].files[0].name).toBe('renovate.json');
        });
    });
});
//# sourceMappingURL=rebase.spec.js.map