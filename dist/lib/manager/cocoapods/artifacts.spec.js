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
const _datasource = __importStar(require("../../datasource"));
const exec_1 = require("../../util/exec");
const common_1 = require("../../util/exec/common");
const _env = __importStar(require("../../util/exec/env"));
const _1 = require(".");
jest.mock('fs-extra');
jest.mock('child_process');
jest.mock('../../util/exec/env');
jest.mock('../../util/git');
jest.mock('../../platform');
jest.mock('../../datasource');
const fs = fs_extra_1.default;
const exec = child_process_1.exec;
const env = util_1.mocked(_env);
const datasource = util_1.mocked(_datasource);
delete process.env.CP_HOME_DIR;
const config = {
    localDir: upath_1.join('/tmp/github/some/repo'),
    cacheDir: upath_1.join('/tmp/cache'),
};
describe('.updateArtifacts()', () => {
    beforeEach(async () => {
        jest.resetAllMocks();
        env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
        await exec_1.setExecConfig(config);
        datasource.getPkgReleases.mockResolvedValue({
            releases: [
                { version: '1.2.0' },
                { version: '1.2.1' },
                { version: '1.2.2' },
                { version: '1.2.3' },
                { version: '1.2.4' },
                { version: '1.2.5' },
            ],
        });
    });
    it('returns null if no Podfile.lock found', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        expect(await _1.updateArtifacts({
            packageFileName: 'Podfile',
            updatedDeps: ['foo'],
            newPackageFileContent: '',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns null if no updatedDeps were provided', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        expect(await _1.updateArtifacts({
            packageFileName: 'Podfile',
            updatedDeps: [],
            newPackageFileContent: '',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns null for invalid local directory', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        const noLocalDirConfig = {
            localDir: undefined,
        };
        expect(await _1.updateArtifacts({
            packageFileName: 'Podfile',
            updatedDeps: ['foo'],
            newPackageFileContent: '',
            config: noLocalDirConfig,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns null if updatedDeps is empty', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        expect(await _1.updateArtifacts({
            packageFileName: 'Podfile',
            updatedDeps: [],
            newPackageFileContent: '',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns null if unchanged', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockResolvedValueOnce('Current Podfile');
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: [],
        });
        fs.readFile.mockResolvedValueOnce('Current Podfile');
        expect(await _1.updateArtifacts({
            packageFileName: 'Podfile',
            updatedDeps: ['foo'],
            newPackageFileContent: '',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns updated Podfile', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        await exec_1.setExecConfig({ ...config, binarySource: common_1.BinarySource.Docker });
        fs.readFile.mockResolvedValueOnce('Old Podfile');
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: ['Podfile.lock'],
        });
        fs.readFile.mockResolvedValueOnce('New Podfile');
        expect(await _1.updateArtifacts({
            packageFileName: 'Podfile',
            updatedDeps: ['foo'],
            newPackageFileContent: 'plugin "cocoapods-acknowledgements"',
            config,
        })).toMatchSnapshot();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns updated Podfile and Pods files', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        await exec_1.setExecConfig({ ...config, binarySource: common_1.BinarySource.Docker });
        fs.readFile.mockResolvedValueOnce('Old Manifest.lock');
        fs.readFile.mockResolvedValueOnce('New Podfile');
        fs.readFile.mockResolvedValueOnce('Pods manifest');
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            not_added: ['Pods/New'],
            modified: ['Podfile.lock', 'Pods/Manifest.lock'],
            deleted: ['Pods/Deleted'],
        });
        expect(await _1.updateArtifacts({
            packageFileName: 'Podfile',
            updatedDeps: ['foo'],
            newPackageFileContent: '',
            config,
        })).toMatchSnapshot();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('catches write error', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockResolvedValueOnce('Current Podfile');
        fs.outputFile.mockImplementationOnce(() => {
            throw new Error('not found');
        });
        expect(await _1.updateArtifacts({
            packageFileName: 'Podfile',
            updatedDeps: ['foo'],
            newPackageFileContent: '',
            config,
        })).toMatchSnapshot();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns pod exec error', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec, new Error('exec exception'));
        fs.readFile.mockResolvedValueOnce('Old Podfile.lock');
        fs.outputFile.mockResolvedValueOnce(null);
        fs.readFile.mockResolvedValueOnce('Old Podfile.lock');
        expect(await _1.updateArtifacts({
            packageFileName: 'Podfile',
            updatedDeps: ['foo'],
            newPackageFileContent: '',
            config,
        })).toMatchSnapshot();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('dynamically selects Docker image tag', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        await exec_1.setExecConfig({
            ...config,
            binarySource: 'docker',
            dockerUser: 'ubuntu',
        });
        fs.readFile.mockResolvedValueOnce('COCOAPODS: 1.2.4');
        fs.readFile.mockResolvedValueOnce('New Podfile');
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: ['Podfile.lock'],
        });
        await _1.updateArtifacts({
            packageFileName: 'Podfile',
            updatedDeps: ['foo'],
            newPackageFileContent: '',
            config,
        });
        expect(execSnapshots).toMatchSnapshot();
    });
    it('falls back to the `latest` Docker image tag', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        await exec_1.setExecConfig({
            ...config,
            binarySource: 'docker',
            dockerUser: 'ubuntu',
        });
        fs.readFile.mockResolvedValueOnce('COCOAPODS: 1.2.4');
        datasource.getPkgReleases.mockResolvedValueOnce({
            releases: [],
        });
        fs.readFile.mockResolvedValueOnce('New Podfile');
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: ['Podfile.lock'],
        });
        await _1.updateArtifacts({
            packageFileName: 'Podfile',
            updatedDeps: ['foo'],
            newPackageFileContent: '',
            config,
        });
        expect(execSnapshots).toMatchSnapshot();
    });
});
//# sourceMappingURL=artifacts.spec.js.map