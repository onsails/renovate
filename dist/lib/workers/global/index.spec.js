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
const bunyan_1 = require("bunyan");
const util_1 = require("../../../test/util");
const _configParser = __importStar(require("../../config"));
const platforms_1 = require("../../constants/platforms");
const datasourceDocker = __importStar(require("../../datasource/docker"));
const _platform = __importStar(require("../../platform"));
const _repositoryWorker = __importStar(require("../repository"));
const _limits = __importStar(require("./limits"));
const globalWorker = __importStar(require("."));
jest.mock('../repository');
// imports are readonly
const repositoryWorker = _repositoryWorker;
const configParser = _configParser;
const platform = _platform;
const limits = _limits;
describe('lib/workers/global', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        util_1.logger.getProblems.mockImplementationOnce(() => []);
        configParser.parseConfigs = jest.fn();
        platform.initPlatform.mockImplementation((input) => Promise.resolve(input));
    });
    it('handles config warnings and errors', async () => {
        configParser.parseConfigs.mockResolvedValueOnce({
            repositories: [],
            maintainYarnLock: true,
            foo: 1,
        });
        await expect(globalWorker.start()).resolves.toEqual(0);
    });
    it('handles zero repos', async () => {
        configParser.parseConfigs.mockResolvedValueOnce({
            baseDir: '/tmp/base',
            cacheDir: '/tmp/cache',
            repositories: [],
        });
        await expect(globalWorker.start()).resolves.toEqual(0);
    });
    it('processes repositories', async () => {
        configParser.parseConfigs.mockResolvedValueOnce({
            gitAuthor: 'a@b.com',
            enabled: true,
            repositories: ['a', 'b'],
            hostRules: [
                {
                    hostType: datasourceDocker.id,
                    host: 'docker.io',
                    username: 'some-user',
                    password: 'some-password',
                },
            ],
        });
        await globalWorker.start();
        expect(configParser.parseConfigs).toHaveBeenCalledTimes(1);
        expect(repositoryWorker.renovateRepository).toHaveBeenCalledTimes(2);
    });
    it('processes repositories break', async () => {
        limits.isLimitReached = jest.fn(() => true);
        configParser.parseConfigs.mockResolvedValueOnce({
            gitAuthor: 'a@b.com',
            enabled: true,
            repositories: ['a', 'b'],
            hostRules: [
                {
                    hostType: datasourceDocker.id,
                    host: 'docker.io',
                    username: 'some-user',
                    password: 'some-password',
                },
            ],
        });
        await globalWorker.start();
        expect(configParser.parseConfigs).toHaveBeenCalledTimes(1);
        expect(repositoryWorker.renovateRepository).toHaveBeenCalledTimes(0);
    });
    it('exits with non-zero when errors are logged', async () => {
        configParser.parseConfigs.mockResolvedValueOnce({
            baseDir: '/tmp/base',
            cacheDir: '/tmp/cache',
            repositories: [],
        });
        util_1.logger.getProblems.mockReset();
        util_1.logger.getProblems.mockImplementationOnce(() => [
            {
                level: bunyan_1.ERROR,
                msg: 'meh',
            },
        ]);
        await expect(globalWorker.start()).resolves.not.toEqual(0);
    });
    it('exits with zero when warnings are logged', async () => {
        configParser.parseConfigs.mockResolvedValueOnce({
            baseDir: '/tmp/base',
            cacheDir: '/tmp/cache',
            repositories: [],
        });
        util_1.logger.getProblems.mockReset();
        util_1.logger.getProblems.mockImplementationOnce(() => [
            {
                level: bunyan_1.WARN,
                msg: 'meh',
            },
        ]);
        await expect(globalWorker.start()).resolves.toEqual(0);
    });
    describe('processes platforms', () => {
        it('github', async () => {
            configParser.parseConfigs.mockResolvedValueOnce({
                repositories: ['a'],
                platform: platforms_1.PLATFORM_TYPE_GITHUB,
                endpoint: 'https://github.com/',
            });
            await globalWorker.start();
            expect(configParser.parseConfigs).toHaveBeenCalledTimes(1);
            expect(repositoryWorker.renovateRepository).toHaveBeenCalledTimes(1);
        });
        it('gitlab', async () => {
            configParser.parseConfigs.mockResolvedValueOnce({
                repositories: [{ repository: 'a' }],
                platform: platforms_1.PLATFORM_TYPE_GITLAB,
                endpoint: 'https://my.gitlab.com/',
            });
            await globalWorker.start();
            expect(configParser.parseConfigs).toHaveBeenCalledTimes(1);
            expect(repositoryWorker.renovateRepository).toHaveBeenCalledTimes(1);
        });
    });
});
//# sourceMappingURL=index.spec.js.map