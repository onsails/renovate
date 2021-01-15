"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../../test/util");
const logger_1 = require("../../../../logger");
const _1 = require(".");
jest.mock('../../../../util/git');
describe('workers/repository/onboarding/pr', () => {
    describe('ensureOnboardingPr()', () => {
        let config;
        let packageFiles;
        let branches;
        beforeEach(() => {
            jest.resetAllMocks();
            config = {
                ...util_1.defaultConfig,
                errors: [],
                warnings: [],
                description: [],
            };
            packageFiles = { npm: [{ packageFile: 'package.json', deps: [] }] };
            branches = [];
            util_1.platform.getPrBody = jest.fn((input) => input);
            util_1.platform.createPr.mockResolvedValueOnce(util_1.partial({}));
        });
        let createPrBody;
        it('returns if onboarded', async () => {
            config.repoIsOnboarded = true;
            await expect(_1.ensureOnboardingPr(config, packageFiles, branches)).resolves.not.toThrow();
        });
        it('creates PR', async () => {
            await _1.ensureOnboardingPr(config, packageFiles, branches);
            expect(util_1.platform.createPr).toHaveBeenCalledTimes(1);
            createPrBody = util_1.platform.createPr.mock.calls[0][0].prBody;
        });
        it('returns if PR does not need updating', async () => {
            util_1.platform.getBranchPr.mockResolvedValue(util_1.partial({
                title: 'Configure Renovate',
                body: createPrBody,
            }));
            await _1.ensureOnboardingPr(config, packageFiles, branches);
            expect(util_1.platform.createPr).toHaveBeenCalledTimes(0);
            expect(util_1.platform.updatePr).toHaveBeenCalledTimes(0);
        });
        it('updates PR when conflicted', async () => {
            config.baseBranch = 'some-branch';
            util_1.platform.getBranchPr.mockResolvedValueOnce(util_1.partial({
                title: 'Configure Renovate',
                body: createPrBody,
                isConflicted: true,
            }));
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            await _1.ensureOnboardingPr(config, {}, branches);
            expect(util_1.platform.createPr).toHaveBeenCalledTimes(0);
            expect(util_1.platform.updatePr).toHaveBeenCalledTimes(1);
        });
        it('updates PR when modified', async () => {
            config.baseBranch = 'some-branch';
            util_1.platform.getBranchPr.mockResolvedValueOnce(util_1.partial({
                title: 'Configure Renovate',
                body: createPrBody,
            }));
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            await _1.ensureOnboardingPr(config, {}, branches);
            expect(util_1.platform.createPr).toHaveBeenCalledTimes(0);
            expect(util_1.platform.updatePr).toHaveBeenCalledTimes(1);
        });
        it('creates PR (no require config)', async () => {
            config.requireConfig = false;
            await _1.ensureOnboardingPr(config, packageFiles, branches);
            expect(util_1.platform.createPr).toHaveBeenCalledTimes(1);
        });
        it('dryrun of updates PR when modified', async () => {
            config.dryRun = true;
            config.baseBranch = 'some-branch';
            util_1.platform.getBranchPr.mockResolvedValueOnce(util_1.partial({
                title: 'Configure Renovate',
                body: createPrBody,
                isConflicted: true,
            }));
            util_1.git.isBranchModified.mockResolvedValueOnce(true);
            await _1.ensureOnboardingPr(config, {}, branches);
            expect(logger_1.logger.info).toHaveBeenCalledWith('DRY-RUN: Would check branch renovate/configure');
            expect(logger_1.logger.info).toHaveBeenLastCalledWith('DRY-RUN: Would update onboarding PR');
        });
        it('dryrun of creates PR', async () => {
            config.dryRun = true;
            await _1.ensureOnboardingPr(config, packageFiles, branches);
            expect(logger_1.logger.info).toHaveBeenCalledWith('DRY-RUN: Would check branch renovate/configure');
            expect(logger_1.logger.info).toHaveBeenLastCalledWith('DRY-RUN: Would create onboarding PR');
        });
    });
});
//# sourceMappingURL=index.spec.js.map