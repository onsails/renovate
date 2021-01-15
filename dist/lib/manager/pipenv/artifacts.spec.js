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
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const upath_1 = require("upath");
const exec_util_1 = require("../../../test/exec-util");
const util_1 = require("../../../test/util");
const util_2 = require("../../util");
const common_1 = require("../../util/exec/common");
const docker = __importStar(require("../../util/exec/docker"));
const _env = __importStar(require("../../util/exec/env"));
const pipenv = __importStar(require("./artifacts"));
jest.mock('fs-extra');
jest.mock('child_process');
jest.mock('../../util/exec/env');
jest.mock('../../util/git');
jest.mock('../../util/host-rules');
jest.mock('../../util/http');
const fs = fs_extra_1.default;
const exec = child_process_1.exec;
const env = util_1.mocked(_env);
const config = {
    // `join` fixes Windows CI
    localDir: upath_1.join('/tmp/github/some/repo'),
    cacheDir: upath_1.join('/tmp/renovate/cache'),
    dockerUser: 'foobar',
};
const dockerConfig = { ...config, binarySource: common_1.BinarySource.Docker };
const lockMaintenanceConfig = { ...config, isLockFileMaintenance: true };
describe('.updateArtifacts()', () => {
    let pipFileLock;
    beforeEach(async () => {
        jest.resetAllMocks();
        env.getChildProcessEnv.mockReturnValue({
            ...exec_util_1.envMock.basic,
            LANG: 'en_US.UTF-8',
            LC_ALL: 'en_US',
        });
        await util_2.setUtilConfig(config);
        docker.resetPrefetchedImages();
        pipFileLock = {
            _meta: { requires: {} },
            default: { pipenv: {} },
            develop: { pipenv: {} },
        };
    });
    it('returns if no Pipfile.lock found', async () => {
        expect(await pipenv.updateArtifacts({
            packageFileName: 'Pipfile',
            updatedDeps: [],
            newPackageFileContent: '',
            config,
        })).toBeNull();
    });
    it('returns null if unchanged', async () => {
        pipFileLock._meta.requires.python_full_version = '3.7.6';
        fs.readFile.mockResolvedValueOnce(JSON.stringify(pipFileLock));
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockReturnValueOnce(JSON.stringify(pipFileLock));
        expect(await pipenv.updateArtifacts({
            packageFileName: 'Pipfile',
            updatedDeps: [],
            newPackageFileContent: 'some new content',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('handles no constraint', async () => {
        fs.readFile.mockResolvedValueOnce('unparseable pipfile lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockReturnValueOnce('unparseable pipfile lock');
        expect(await pipenv.updateArtifacts({
            packageFileName: 'Pipfile',
            updatedDeps: [],
            newPackageFileContent: 'some new content',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns updated Pipfile.lock', async () => {
        fs.readFile.mockResolvedValueOnce('current pipfile.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValue({
            modified: ['Pipfile.lock'],
        });
        fs.readFile.mockReturnValueOnce('New Pipfile.lock');
        expect(await pipenv.updateArtifacts({
            packageFileName: 'Pipfile',
            updatedDeps: [],
            newPackageFileContent: 'some new content',
            config: { ...config, constraints: { python: '3.7' } },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('supports docker mode', async () => {
        jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
        await util_2.setUtilConfig(dockerConfig);
        pipFileLock._meta.requires.python_version = '3.7';
        fs.readFile.mockResolvedValueOnce(JSON.stringify(pipFileLock));
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValue({
            modified: ['Pipfile.lock'],
        });
        fs.readFile.mockReturnValueOnce('new lock');
        expect(await pipenv.updateArtifacts({
            packageFileName: 'Pipfile',
            updatedDeps: [],
            newPackageFileContent: 'some new content',
            config: dockerConfig,
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('catches errors', async () => {
        fs.readFile.mockResolvedValueOnce('Current Pipfile.lock');
        fs.outputFile.mockImplementationOnce(() => {
            throw new Error('not found');
        });
        expect(await pipenv.updateArtifacts({
            packageFileName: 'Pipfile',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config,
        })).toMatchSnapshot();
    });
    it('returns updated Pipenv.lock when doing lockfile maintenance', async () => {
        fs.readFile.mockResolvedValueOnce('Current Pipfile.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValue({
            modified: ['Pipfile.lock'],
        });
        fs.readFile.mockReturnValueOnce('New Pipfile.lock');
        expect(await pipenv.updateArtifacts({
            packageFileName: 'Pipfile',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config: lockMaintenanceConfig,
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('uses pipenv version from Pipfile', async () => {
        jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
        await util_2.setUtilConfig(dockerConfig);
        pipFileLock.default.pipenv.version = '==2020.8.13';
        fs.readFile.mockResolvedValueOnce(JSON.stringify(pipFileLock));
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValue({
            modified: ['Pipfile.lock'],
        });
        fs.readFile.mockReturnValueOnce('new lock');
        expect(await pipenv.updateArtifacts({
            packageFileName: 'Pipfile',
            updatedDeps: [],
            newPackageFileContent: 'some new content',
            config: dockerConfig,
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('uses pipenv version from Pipfile dev packages', async () => {
        jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
        await util_2.setUtilConfig(dockerConfig);
        pipFileLock.develop.pipenv.version = '==2020.8.13';
        fs.readFile.mockResolvedValueOnce(JSON.stringify(pipFileLock));
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValue({
            modified: ['Pipfile.lock'],
        });
        fs.readFile.mockReturnValueOnce('new lock');
        expect(await pipenv.updateArtifacts({
            packageFileName: 'Pipfile',
            updatedDeps: [],
            newPackageFileContent: 'some new content',
            config: dockerConfig,
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('uses pipenv version from config', async () => {
        jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
        await util_2.setUtilConfig(dockerConfig);
        pipFileLock.default.pipenv.version = '==2020.8.13';
        fs.readFile.mockResolvedValueOnce(JSON.stringify(pipFileLock));
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValue({
            modified: ['Pipfile.lock'],
        });
        fs.readFile.mockReturnValueOnce('new lock');
        expect(await pipenv.updateArtifacts({
            packageFileName: 'Pipfile',
            updatedDeps: [],
            newPackageFileContent: 'some new content',
            config: { ...dockerConfig, constraints: { pipenv: '==2020.1.1' } },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
});
//# sourceMappingURL=artifacts.spec.js.map