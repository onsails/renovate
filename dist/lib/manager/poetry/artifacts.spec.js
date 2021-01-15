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
const fs_1 = require("fs");
const fs_extra_1 = __importDefault(require("fs-extra"));
const upath_1 = require("upath");
const exec_util_1 = require("../../../test/exec-util");
const util_1 = require("../../../test/util");
const _datasource = __importStar(require("../../datasource"));
const exec_1 = require("../../util/exec");
const common_1 = require("../../util/exec/common");
const docker = __importStar(require("../../util/exec/docker"));
const _env = __importStar(require("../../util/exec/env"));
const _hostRules = __importStar(require("../../util/host-rules"));
const artifacts_1 = require("./artifacts");
const pyproject10toml = fs_1.readFileSync('lib/manager/poetry/__fixtures__/pyproject.10.toml', 'utf8');
jest.mock('fs-extra');
jest.mock('child_process');
jest.mock('../../util/exec/env');
jest.mock('../../datasource');
jest.mock('../../util/host-rules');
const fs = fs_extra_1.default;
const exec = child_process_1.exec;
const env = util_1.mocked(_env);
const datasource = util_1.mocked(_datasource);
const hostRules = util_1.mocked(_hostRules);
const config = {
    localDir: upath_1.join('/tmp/github/some/repo'),
};
describe('.updateArtifacts()', () => {
    beforeEach(async () => {
        jest.resetAllMocks();
        env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
        await exec_1.setExecConfig(config);
        docker.resetPrefetchedImages();
    });
    it('returns null if no poetry.lock found', async () => {
        const updatedDeps = ['dep1'];
        expect(await artifacts_1.updateArtifacts({
            packageFileName: 'pyproject.toml',
            updatedDeps,
            newPackageFileContent: '',
            config,
        })).toBeNull();
    });
    it('returns null if updatedDeps is empty', async () => {
        expect(await artifacts_1.updateArtifacts({
            packageFileName: 'pyproject.toml',
            updatedDeps: [],
            newPackageFileContent: '',
            config,
        })).toBeNull();
    });
    it('returns null if unchanged', async () => {
        fs.readFile.mockReturnValueOnce('Current poetry.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockReturnValueOnce('Current poetry.lock');
        const updatedDeps = ['dep1'];
        expect(await artifacts_1.updateArtifacts({
            packageFileName: 'pyproject.toml',
            updatedDeps,
            newPackageFileContent: '',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns updated poetry.lock', async () => {
        fs.readFile.mockResolvedValueOnce('[metadata]\n');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockReturnValueOnce('New poetry.lock');
        const updatedDeps = ['dep1'];
        expect(await artifacts_1.updateArtifacts({
            packageFileName: 'pyproject.toml',
            updatedDeps,
            newPackageFileContent: '{}',
            config,
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('passes private credential environment vars', async () => {
        fs.readFile.mockResolvedValueOnce(null);
        fs.readFile.mockResolvedValueOnce('[metadata]\n');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockReturnValueOnce('New poetry.lock');
        hostRules.find.mockReturnValueOnce({
            username: 'usernameOne',
            password: 'passwordOne',
        });
        hostRules.find.mockReturnValueOnce({ username: 'usernameTwo' });
        hostRules.find.mockReturnValueOnce({ password: 'passwordFour' });
        const updatedDeps = ['dep1'];
        expect(await artifacts_1.updateArtifacts({
            packageFileName: 'pyproject.toml',
            updatedDeps,
            newPackageFileContent: pyproject10toml,
            config,
        })).not.toBeNull();
        expect(hostRules.find.mock.calls).toHaveLength(3);
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns updated pyproject.lock', async () => {
        fs.readFile.mockResolvedValueOnce(null);
        fs.readFile.mockResolvedValueOnce('[metadata]\n');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockReturnValueOnce('New poetry.lock');
        const updatedDeps = ['dep1'];
        expect(await artifacts_1.updateArtifacts({
            packageFileName: 'pyproject.toml',
            updatedDeps,
            newPackageFileContent: '{}',
            config,
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns updated poetry.lock using docker', async () => {
        jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
        await exec_1.setExecConfig({
            ...config,
            binarySource: common_1.BinarySource.Docker,
            dockerUser: 'foobar',
        });
        fs.readFile.mockResolvedValueOnce('[metadata]\n');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockReturnValueOnce('New poetry.lock');
        datasource.getPkgReleases.mockResolvedValueOnce({
            releases: [{ version: '2.7.5' }, { version: '3.4.2' }],
        });
        const updatedDeps = ['dep1'];
        expect(await artifacts_1.updateArtifacts({
            packageFileName: 'pyproject.toml',
            updatedDeps,
            newPackageFileContent: '{}',
            config: {
                ...config,
                constraints: { python: '~2.7 || ^3.4' },
            },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns updated poetry.lock using docker (constraints)', async () => {
        jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
        await exec_1.setExecConfig({
            ...config,
            binarySource: common_1.BinarySource.Docker,
            dockerUser: 'foobar',
        });
        fs.readFile.mockResolvedValueOnce('[metadata]\npython-versions = "~2.7 || ^3.4"');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockReturnValueOnce('New poetry.lock');
        datasource.getPkgReleases.mockResolvedValueOnce({
            releases: [{ version: '2.7.5' }, { version: '3.3.2' }],
        });
        const updatedDeps = ['dep1'];
        expect(await artifacts_1.updateArtifacts({
            packageFileName: 'pyproject.toml',
            updatedDeps,
            newPackageFileContent: '{}',
            config: {
                ...config,
                constraints: { poetry: 'poetry>=1.0' },
            },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('catches errors', async () => {
        fs.readFile.mockResolvedValueOnce('Current poetry.lock');
        fs.outputFile.mockImplementationOnce(() => {
            throw new Error('not found');
        });
        const updatedDeps = ['dep1'];
        expect(await artifacts_1.updateArtifacts({
            packageFileName: 'pyproject.toml',
            updatedDeps,
            newPackageFileContent: '{}',
            config,
        })).toMatchSnapshot();
    });
    it('returns updated poetry.lock when doing lockfile maintenance', async () => {
        fs.readFile.mockResolvedValueOnce('Old poetry.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockReturnValueOnce('New poetry.lock');
        expect(await artifacts_1.updateArtifacts({
            packageFileName: 'pyproject.toml',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config: {
                ...config,
                isLockFileMaintenance: true,
            },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
});
//# sourceMappingURL=artifacts.spec.js.map