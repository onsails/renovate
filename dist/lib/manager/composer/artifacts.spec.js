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
const child_process_1 = require("child_process");
const upath_1 = require("upath");
const exec_util_1 = require("../../../test/exec-util");
const util_1 = require("../../../test/util");
const platforms_1 = require("../../constants/platforms");
const _datasource = __importStar(require("../../datasource"));
const datasourcePackagist = __importStar(require("../../datasource/packagist"));
const util_2 = require("../../util");
const common_1 = require("../../util/exec/common");
const docker = __importStar(require("../../util/exec/docker"));
const hostRules = __importStar(require("../../util/host-rules"));
const composer = __importStar(require("./artifacts"));
jest.mock('child_process');
jest.mock('../../util/exec/env');
jest.mock('../../../lib/datasource');
jest.mock('../../util/fs');
jest.mock('../../util/git');
const exec = child_process_1.exec;
const datasource = util_1.mocked(_datasource);
const config = {
    // `join` fixes Windows CI
    localDir: upath_1.join('/tmp/github/some/repo'),
    cacheDir: upath_1.join('/tmp/renovate/cache'),
    dockerUser: 'foobar',
    composerIgnorePlatformReqs: true,
};
const repoStatus = util_1.partial({
    modified: [],
    not_added: [],
    deleted: [],
});
describe('.updateArtifacts()', () => {
    beforeEach(async () => {
        jest.resetAllMocks();
        jest.resetModules();
        util_1.env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
        await util_2.setUtilConfig(config);
        docker.resetPrefetchedImages();
        hostRules.clear();
        delete global.trustLevel;
    });
    it('returns if no composer.lock found', async () => {
        expect(await composer.updateArtifacts({
            packageFileName: 'composer.json',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config,
        })).toBeNull();
    });
    it('returns null if unchanged', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current composer.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.readLocalFile.mockReturnValueOnce('Current composer.lock');
        util_1.git.getRepoStatus.mockResolvedValue(repoStatus);
        global.trustLevel = 'high';
        expect(await composer.updateArtifacts({
            packageFileName: 'composer.json',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('uses hostRules to set COMPOSER_AUTH', async () => {
        hostRules.add({
            hostType: platforms_1.PLATFORM_TYPE_GITHUB,
            hostName: 'api.github.com',
            token: 'github-token',
        });
        hostRules.add({
            hostType: platforms_1.PLATFORM_TYPE_GITLAB,
            hostName: 'gitlab.com',
            token: 'gitlab-token',
        });
        hostRules.add({
            hostType: datasourcePackagist.id,
            hostName: 'packagist.renovatebot.com',
            username: 'some-username',
            password: 'some-password',
        });
        hostRules.add({
            hostType: datasourcePackagist.id,
            endpoint: 'https://artifactory.yyyyyyy.com/artifactory/api/composer/',
            username: 'some-other-username',
            password: 'some-other-password',
        });
        hostRules.add({
            hostType: datasourcePackagist.id,
            username: 'some-other-username',
            password: 'some-other-password',
        });
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current composer.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.readLocalFile.mockReturnValueOnce('Current composer.lock');
        const authConfig = {
            ...config,
            registryUrls: ['https://packagist.renovatebot.com'],
        };
        util_1.git.getRepoStatus.mockResolvedValue(repoStatus);
        expect(await composer.updateArtifacts({
            packageFileName: 'composer.json',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config: authConfig,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns updated composer.lock', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current composer.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.readLocalFile.mockReturnValueOnce('New composer.lock');
        util_1.git.getRepoStatus.mockResolvedValue({
            ...repoStatus,
            modified: ['composer.lock'],
        });
        expect(await composer.updateArtifacts({
            packageFileName: 'composer.json',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config,
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('supports vendor directory update', async () => {
        const foo = upath_1.join('vendor/foo/Foo.php');
        const bar = upath_1.join('vendor/bar/Bar.php');
        const baz = upath_1.join('vendor/baz/Baz.php');
        util_1.fs.localPathExists.mockResolvedValueOnce(true);
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current composer.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            ...repoStatus,
            modified: ['composer.lock', foo],
            not_added: [bar],
            deleted: [baz],
        });
        util_1.fs.readLocalFile.mockResolvedValueOnce('New composer.lock');
        util_1.fs.readLocalFile.mockResolvedValueOnce('Foo');
        util_1.fs.readLocalFile.mockResolvedValueOnce('Bar');
        util_1.fs.getSiblingFileName.mockReturnValueOnce('vendor');
        const res = await composer.updateArtifacts({
            packageFileName: 'composer.json',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config,
        });
        expect(res).not.toBeNull();
        expect(res === null || res === void 0 ? void 0 : res.map(({ file }) => file)).toEqual([
            { contents: 'New composer.lock', name: 'composer.lock' },
            { contents: 'Foo', name: foo },
            { contents: 'Bar', name: bar },
            { contents: baz, name: '|delete|' },
        ]);
        expect(execSnapshots).toMatchSnapshot();
    });
    it('performs lockFileMaintenance', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current composer.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.readLocalFile.mockReturnValueOnce('New composer.lock');
        util_1.git.getRepoStatus.mockResolvedValue({
            ...repoStatus,
            modified: ['composer.lock'],
        });
        expect(await composer.updateArtifacts({
            packageFileName: 'composer.json',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config: {
                ...config,
                isLockFileMaintenance: true,
            },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('supports docker mode', async () => {
        jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
        await util_2.setUtilConfig({ ...config, binarySource: common_1.BinarySource.Docker });
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current composer.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.readLocalFile.mockReturnValueOnce('New composer.lock');
        datasource.getPkgReleases.mockResolvedValueOnce({
            releases: [
                { version: '1.10.0' },
                { version: '1.10.17' },
                { version: '2.0.0' },
                { version: '2.0.7' },
            ],
        });
        util_1.git.getRepoStatus.mockResolvedValue({
            ...repoStatus,
            modified: ['composer.lock'],
        });
        expect(await composer.updateArtifacts({
            packageFileName: 'composer.json',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config: { ...config, constraints: { composer: '^1.10.0' } },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('supports global mode', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current composer.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.readLocalFile.mockReturnValueOnce('New composer.lock');
        util_1.git.getRepoStatus.mockResolvedValue({
            ...repoStatus,
            modified: ['composer.lock'],
        });
        expect(await composer.updateArtifacts({
            packageFileName: 'composer.json',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config: {
                ...config,
                binarySource: common_1.BinarySource.Global,
            },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('catches errors', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current composer.lock');
        util_1.fs.writeLocalFile.mockImplementationOnce(() => {
            throw new Error('not found');
        });
        expect(await composer.updateArtifacts({
            packageFileName: 'composer.json',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config,
        })).toMatchSnapshot();
    });
    it('catches unmet requirements errors', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current composer.lock');
        util_1.fs.writeLocalFile.mockImplementationOnce(() => {
            throw new Error('fooYour requirements could not be resolved to an installable set of packages.bar');
        });
        expect(await composer.updateArtifacts({
            packageFileName: 'composer.json',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config,
        })).toMatchSnapshot();
    });
    it('throws for disk space', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current composer.lock');
        util_1.fs.writeLocalFile.mockImplementationOnce(() => {
            throw new Error('vendor/composer/07fe2366/sebastianbergmann-php-code-coverage-c896779/src/Report/Html/Renderer/Template/js/d3.min.js:  write error (disk full?).  Continue? (y/n/^C) ');
        });
        await expect(composer.updateArtifacts({
            packageFileName: 'composer.json',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config,
        })).rejects.toThrow();
    });
    it('disables ignorePlatformReqs', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current composer.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.readLocalFile.mockReturnValueOnce('New composer.lock');
        util_1.git.getRepoStatus.mockResolvedValue({
            ...repoStatus,
            modified: ['composer.lock'],
        });
        expect(await composer.updateArtifacts({
            packageFileName: 'composer.json',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config: {
                ...config,
                composerIgnorePlatformReqs: false,
            },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
});
//# sourceMappingURL=artifacts.spec.js.map