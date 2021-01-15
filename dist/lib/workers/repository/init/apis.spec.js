"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../test/util");
const error_messages_1 = require("../../../constants/error-messages");
const apis_1 = require("./apis");
describe('workers/repository/init/apis', () => {
    describe('initApis', () => {
        let config;
        beforeEach(() => {
            config = { ...util_1.getConfig() };
            config.errors = [];
            config.warnings = [];
            config.token = 'some-token';
            delete config.optimizeForDisabled;
            delete config.includeForks;
        });
        afterEach(() => {
            jest.resetAllMocks();
        });
        it('runs', async () => {
            util_1.platform.initRepo.mockResolvedValueOnce({
                defaultBranch: 'master',
                isFork: false,
            });
            const workerPlatformConfig = await apis_1.initApis(config);
            expect(workerPlatformConfig).toBeTruthy();
        });
        it('throws for disabled', async () => {
            util_1.platform.initRepo.mockResolvedValueOnce({
                defaultBranch: 'master',
                isFork: false,
            });
            util_1.platform.getJsonFile.mockResolvedValueOnce({ enabled: false });
            await expect(apis_1.initApis({
                ...config,
                optimizeForDisabled: true,
            })).rejects.toThrow(error_messages_1.REPOSITORY_DISABLED);
        });
        it('throws for forked', async () => {
            util_1.platform.initRepo.mockResolvedValueOnce({
                defaultBranch: 'master',
                isFork: true,
            });
            util_1.platform.getJsonFile.mockResolvedValueOnce({ includeForks: false });
            await expect(apis_1.initApis({
                ...config,
                includeForks: false,
            })).rejects.toThrow(error_messages_1.REPOSITORY_FORKED);
        });
        it('uses the onboardingConfigFileName if set', async () => {
            util_1.platform.initRepo.mockResolvedValueOnce({
                defaultBranch: 'master',
                isFork: false,
            });
            util_1.platform.getJsonFile.mockResolvedValueOnce({ includeForks: false });
            const workerPlatformConfig = await apis_1.initApis({
                ...config,
                optimizeForDisabled: true,
                onboardingConfigFileName: '.github/renovate.json',
            });
            expect(workerPlatformConfig).toBeTruthy();
            expect(workerPlatformConfig.onboardingConfigFileName).toBe('.github/renovate.json');
            expect(util_1.platform.getJsonFile).toHaveBeenCalledWith('.github/renovate.json');
            expect(util_1.platform.getJsonFile).not.toHaveBeenCalledWith('renovate.json');
        });
        it('falls back to "renovate.json" if onboardingConfigFileName is not set', async () => {
            util_1.platform.initRepo.mockResolvedValueOnce({
                defaultBranch: 'master',
                isFork: false,
            });
            util_1.platform.getJsonFile.mockResolvedValueOnce({ includeForks: false });
            const workerPlatformConfig = await apis_1.initApis({
                ...config,
                optimizeForDisabled: true,
                onboardingConfigFileName: undefined,
            });
            expect(workerPlatformConfig).toBeTruthy();
            expect(workerPlatformConfig.onboardingConfigFileName).toBeUndefined();
            expect(util_1.platform.getJsonFile).toHaveBeenCalledWith('renovate.json');
        });
        it('falls back to "renovate.json" if onboardingConfigFileName is not valid', async () => {
            util_1.platform.initRepo.mockResolvedValueOnce({
                defaultBranch: 'master',
                isFork: false,
            });
            util_1.platform.getJsonFile.mockResolvedValueOnce({ includeForks: false });
            const workerPlatformConfig = await apis_1.initApis({
                ...config,
                optimizeForDisabled: true,
                onboardingConfigFileName: 'foo.bar',
            });
            expect(workerPlatformConfig).toBeTruthy();
            expect(workerPlatformConfig.onboardingConfigFileName).toBe('foo.bar');
            expect(util_1.platform.getJsonFile).toHaveBeenCalledWith('renovate.json');
        });
    });
});
//# sourceMappingURL=apis.spec.js.map