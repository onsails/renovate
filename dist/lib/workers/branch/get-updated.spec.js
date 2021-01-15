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
const util_1 = require("../../../test/util");
const datasourceGitSubmodules = __importStar(require("../../datasource/git-submodules"));
const _composer = __importStar(require("../../manager/composer"));
const _gitSubmodules = __importStar(require("../../manager/git-submodules"));
const _helmv3 = __importStar(require("../../manager/helmv3"));
const _npm = __importStar(require("../../manager/npm"));
const _autoReplace = __importStar(require("./auto-replace"));
const get_updated_1 = require("./get-updated");
const composer = util_1.mocked(_composer);
const gitSubmodules = util_1.mocked(_gitSubmodules);
const helmv3 = util_1.mocked(_helmv3);
const npm = util_1.mocked(_npm);
const autoReplace = util_1.mocked(_autoReplace);
jest.mock('../../manager/composer');
jest.mock('../../manager/helmv3');
jest.mock('../../manager/npm');
jest.mock('../../manager/git-submodules');
jest.mock('../../util/git');
jest.mock('./auto-replace');
describe('workers/branch/get-updated', () => {
    describe('getUpdatedPackageFiles()', () => {
        let config;
        beforeEach(() => {
            config = {
                ...util_1.defaultConfig,
                upgrades: [],
            };
            npm.updateDependency = jest.fn();
            util_1.git.getFile.mockResolvedValueOnce('existing content');
        });
        it('handles autoreplace base updated', async () => {
            config.upgrades.push({ manager: 'html', branchName: undefined });
            autoReplace.doAutoReplace.mockResolvedValueOnce('updated-file');
            const res = await get_updated_1.getUpdatedPackageFiles(config);
            expect(res).toMatchSnapshot();
        });
        it('handles autoreplace branch no update', async () => {
            config.upgrades.push({ manager: 'html', branchName: undefined });
            autoReplace.doAutoReplace.mockResolvedValueOnce('existing content');
            const res = await get_updated_1.getUpdatedPackageFiles(config);
            expect(res).toMatchSnapshot();
        });
        it('handles autoreplace failure', async () => {
            config.upgrades.push({ manager: 'html', branchName: undefined });
            autoReplace.doAutoReplace.mockResolvedValueOnce(null);
            await expect(get_updated_1.getUpdatedPackageFiles(config)).rejects.toThrow();
        });
        it('handles autoreplace branch needs update', async () => {
            config.reuseExistingBranch = true;
            config.upgrades.push({ manager: 'html', branchName: undefined });
            autoReplace.doAutoReplace.mockResolvedValueOnce(null);
            autoReplace.doAutoReplace.mockResolvedValueOnce('updated-file');
            const res = await get_updated_1.getUpdatedPackageFiles(config);
            expect(res).toMatchSnapshot();
        });
        it('handles empty', async () => {
            const res = await get_updated_1.getUpdatedPackageFiles(config);
            expect(res).toMatchSnapshot();
        });
        it('handles null content', async () => {
            config.reuseExistingBranch = true;
            config.upgrades.push({
                manager: 'npm',
            });
            await expect(get_updated_1.getUpdatedPackageFiles(config)).rejects.toThrow();
        });
        it('handles content change', async () => {
            config.reuseExistingBranch = true;
            config.upgrades.push({
                manager: 'npm',
            });
            npm.updateDependency.mockReturnValue('some new content');
            const res = await get_updated_1.getUpdatedPackageFiles(config);
            expect(res).toMatchSnapshot();
        });
        it('handles lock files', async () => {
            config.reuseExistingBranch = true;
            config.upgrades.push({
                manager: 'composer',
                branchName: undefined,
            });
            autoReplace.doAutoReplace.mockResolvedValueOnce('some new content');
            composer.updateArtifacts.mockResolvedValueOnce([
                {
                    file: {
                        name: 'composer.json',
                        contents: 'some contents',
                    },
                },
            ]);
            const res = await get_updated_1.getUpdatedPackageFiles(config);
            expect(res).toMatchSnapshot();
        });
        it('handles lockFileMaintenance', async () => {
            config.upgrades.push({
                manager: 'composer',
                updateType: 'lockFileMaintenance',
            });
            composer.updateArtifacts.mockResolvedValueOnce([
                {
                    file: {
                        name: 'composer.json',
                        contents: 'some contents',
                    },
                },
            ]);
            const res = await get_updated_1.getUpdatedPackageFiles(config);
            expect(res).toMatchSnapshot();
        });
        it('handles lockFileMaintenance error', async () => {
            config.upgrades.push({
                manager: 'composer',
                updateType: 'lockFileMaintenance',
            });
            composer.updateArtifacts.mockResolvedValueOnce([
                {
                    artifactError: {
                        lockFile: 'composer.lock',
                        stderr: 'some error',
                    },
                },
            ]);
            const res = await get_updated_1.getUpdatedPackageFiles(config);
            expect(res).toMatchSnapshot();
        });
        it('handles lock file errors', async () => {
            config.reuseExistingBranch = true;
            config.upgrades.push({
                manager: 'composer',
                branchName: undefined,
            });
            autoReplace.doAutoReplace.mockResolvedValueOnce('some new content');
            composer.updateArtifacts.mockResolvedValueOnce([
                {
                    artifactError: {
                        lockFile: 'composer.lock',
                        stderr: 'some error',
                    },
                },
            ]);
            const res = await get_updated_1.getUpdatedPackageFiles(config);
            expect(res).toMatchSnapshot();
        });
        it('handles git submodules', async () => {
            config.upgrades.push({
                manager: 'git-submodules',
                datasource: datasourceGitSubmodules.id,
            });
            gitSubmodules.updateDependency.mockResolvedValueOnce('existing content');
            const res = await get_updated_1.getUpdatedPackageFiles(config);
            expect(res).toMatchSnapshot();
        });
        it('update artifacts on update-lockfile strategy', async () => {
            config.upgrades.push({
                manager: 'composer',
                branchName: undefined,
                rangeStrategy: 'update-lockfile',
            });
            autoReplace.doAutoReplace.mockResolvedValueOnce('existing content');
            composer.updateArtifacts.mockResolvedValueOnce([
                {
                    file: {
                        name: 'composer.lock',
                        contents: 'some contents',
                    },
                },
            ]);
            const res = await get_updated_1.getUpdatedPackageFiles(config);
            expect(res).toMatchSnapshot();
        });
        it('bumps versions in updateDependency managers', async () => {
            config.upgrades.push({
                branchName: undefined,
                bumpVersion: 'patch',
                manager: 'npm',
            });
            npm.updateDependency.mockReturnValue('old version');
            npm.bumpPackageVersion.mockReturnValue({ bumpedContent: 'new version' });
            const res = await get_updated_1.getUpdatedPackageFiles(config);
            expect(res).toMatchSnapshot();
        });
        it('bumps versions in autoReplace managers', async () => {
            config.upgrades.push({
                branchName: undefined,
                bumpVersion: 'patch',
                manager: 'helmv3',
            });
            autoReplace.doAutoReplace.mockResolvedValueOnce('version: 0.0.1');
            helmv3.bumpPackageVersion.mockReturnValue({
                bumpedContent: 'version: 0.0.2',
            });
            const res = await get_updated_1.getUpdatedPackageFiles(config);
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=get-updated.spec.js.map