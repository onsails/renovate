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
const defaults_1 = require("../../../config/defaults");
const _lockFiles = __importStar(require("../../../manager/npm/post-update"));
const _lerna = __importStar(require("../../../manager/npm/post-update/lerna"));
const _npm = __importStar(require("../../../manager/npm/post-update/npm"));
const _pnpm = __importStar(require("../../../manager/npm/post-update/pnpm"));
const _yarn = __importStar(require("../../../manager/npm/post-update/yarn"));
const _fs = __importStar(require("../../../util/fs/proxies"));
const _hostRules = __importStar(require("../../../util/host-rules"));
const defaultConfig = defaults_1.getConfig();
const fs = util_1.mocked(_fs);
const lockFiles = util_1.mocked(_lockFiles);
const npm = util_1.mocked(_npm);
const yarn = util_1.mocked(_yarn);
const pnpm = util_1.mocked(_pnpm);
const lerna = util_1.mocked(_lerna);
const hostRules = util_1.mocked(_hostRules);
jest.mock('../../../util/git');
hostRules.find = jest.fn((_) => ({
    token: 'abc',
}));
const { writeUpdatedPackageFiles, getAdditionalFiles } = lockFiles;
describe('manager/npm/post-update', () => {
    describe('writeUpdatedPackageFiles', () => {
        let config;
        beforeEach(() => {
            config = {
                ...defaultConfig,
                localDir: 'some-tmp-dir',
            };
            fs.outputFile = jest.fn();
        });
        it('returns if no updated packageFiles', async () => {
            delete config.updatedPackageFiles;
            await writeUpdatedPackageFiles(config);
            expect(fs.outputFile).toHaveBeenCalledTimes(0);
        });
        it('returns if no updated packageFiles are package.json', async () => {
            config.updatedPackageFiles = [
                {
                    name: 'Dockerfile',
                    contents: 'some-contents',
                },
            ];
            await writeUpdatedPackageFiles(config);
            expect(fs.outputFile).toHaveBeenCalledTimes(0);
        });
        it('writes updated packageFiles', async () => {
            config.updatedPackageFiles = [
                {
                    name: 'package.json',
                    contents: '{ "name": "{{some-template}}" }',
                },
                {
                    name: 'backend/package.json',
                    contents: '{ "name": "some-other-name", "engines": { "node": "^6.0.0" }}',
                },
            ];
            config.upgrades = [];
            await writeUpdatedPackageFiles(config);
            expect(fs.outputFile).toHaveBeenCalledTimes(2);
        });
    });
    describe('getAdditionalFiles', () => {
        let config;
        beforeEach(() => {
            config = {
                ...defaultConfig,
                localDir: 'some-tmp-dir',
            };
            util_1.git.getFile.mockResolvedValueOnce('some lock file contents');
            npm.generateLockFile = jest.fn();
            npm.generateLockFile.mockResolvedValueOnce({
                lockFile: 'some lock file contents',
            });
            yarn.generateLockFile = jest.fn();
            yarn.generateLockFile.mockResolvedValueOnce({
                lockFile: 'some lock file contents',
            });
            pnpm.generateLockFile = jest.fn();
            pnpm.generateLockFile.mockResolvedValueOnce({
                lockFile: 'some lock file contents',
            });
            lerna.generateLockFiles = jest.fn();
            lockFiles.determineLockFileDirs = jest.fn();
        });
        afterEach(() => {
            jest.resetAllMocks();
        });
        it('returns no error and empty lockfiles if updateLockFiles false', async () => {
            config.updateLockFiles = false;
            const res = await getAdditionalFiles(config, { npm: [{}] });
            expect(res).toMatchSnapshot();
            expect(res.artifactErrors).toHaveLength(0);
            expect(res.updatedArtifacts).toHaveLength(0);
        });
        it('returns no error and empty lockfiles if lock file maintenance exists', async () => {
            config.updateType = 'lockFileMaintenance';
            config.reuseExistingBranch = true;
            util_1.git.branchExists.mockReturnValueOnce(true);
            const res = await getAdditionalFiles(config, { npm: [{}] });
            expect(res).toMatchSnapshot();
            expect(res.artifactErrors).toHaveLength(0);
            expect(res.updatedArtifacts).toHaveLength(0);
        });
    });
});
//# sourceMappingURL=index.spec.js.map