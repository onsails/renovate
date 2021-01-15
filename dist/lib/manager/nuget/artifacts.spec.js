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
const util_2 = require("../../util");
const common_1 = require("../../util/exec/common");
const docker = __importStar(require("../../util/exec/docker"));
const _env = __importStar(require("../../util/exec/env"));
const _hostRules = __importStar(require("../../util/host-rules"));
const nuget = __importStar(require("./artifacts"));
const util_3 = require("./util");
jest.mock('child_process');
jest.mock('../../util/exec/env');
jest.mock('../../util/fs');
jest.mock('../../util/host-rules');
jest.mock('./util');
const exec = child_process_1.exec;
const env = util_1.mocked(_env);
const getConfiguredRegistries = util_3.getConfiguredRegistries;
const getDefaultRegistries = util_3.getDefaultRegistries;
const getRandomString = util_3.getRandomString;
const hostRules = util_1.mocked(_hostRules);
const config = {
    // `join` fixes Windows CI
    localDir: upath_1.join('/tmp/github/some/repo'),
    cacheDir: upath_1.join('/tmp/renovate/cache'),
    dockerUser: 'foobar',
};
describe('updateArtifacts', () => {
    beforeEach(async () => {
        jest.resetAllMocks();
        jest.resetModules();
        getDefaultRegistries.mockReturnValue([]);
        env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
        util_1.fs.ensureCacheDir.mockImplementation((dirName) => Promise.resolve(dirName));
        getRandomString.mockReturnValue('not-so-random');
        await util_2.setUtilConfig(config);
        docker.resetPrefetchedImages();
    });
    it('aborts if no lock file found', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.getSiblingFileName.mockReturnValueOnce('packages.lock.json');
        expect(await nuget.updateArtifacts({
            packageFileName: 'project.csproj',
            updatedDeps: ['foo', 'bar'],
            newPackageFileContent: '{}',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('aborts if lock file is unchanged', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.getSiblingFileName.mockReturnValueOnce('packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current packages.lock.json');
        expect(await nuget.updateArtifacts({
            packageFileName: 'project.csproj',
            updatedDeps: ['foo', 'bar'],
            newPackageFileContent: '{}',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('updates lock file', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.getSiblingFileName.mockReturnValueOnce('packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('New packages.lock.json');
        expect(await nuget.updateArtifacts({
            packageFileName: 'project.csproj',
            updatedDeps: ['dep'],
            newPackageFileContent: '{}',
            config,
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('does not update lock file when non-proj file is changed', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.getSiblingFileName.mockReturnValueOnce('packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('New packages.lock.json');
        expect(await nuget.updateArtifacts({
            packageFileName: 'otherfile.props',
            updatedDeps: ['dep'],
            newPackageFileContent: '{}',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('does not update lock file when no deps changed', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.getSiblingFileName.mockReturnValueOnce('packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('New packages.lock.json');
        expect(await nuget.updateArtifacts({
            packageFileName: 'project.csproj',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('performs lock file maintenance', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.getSiblingFileName.mockReturnValueOnce('packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('New packages.lock.json');
        expect(await nuget.updateArtifacts({
            packageFileName: 'project.csproj',
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
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.getSiblingFileName.mockReturnValueOnce('packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('New packages.lock.json');
        expect(await nuget.updateArtifacts({
            packageFileName: 'project.csproj',
            updatedDeps: ['dep'],
            newPackageFileContent: '{}',
            config,
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('supports global mode', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.getSiblingFileName.mockReturnValueOnce('packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('New packages.lock.json');
        expect(await nuget.updateArtifacts({
            packageFileName: 'project.csproj',
            updatedDeps: ['dep'],
            newPackageFileContent: '{}',
            config: {
                ...config,
                binarySource: common_1.BinarySource.Global,
            },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('catches errors', async () => {
        util_1.fs.getSiblingFileName.mockReturnValueOnce('packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current packages.lock.json');
        util_1.fs.writeLocalFile.mockImplementationOnce(() => {
            throw new Error('not found');
        });
        expect(await nuget.updateArtifacts({
            packageFileName: 'project.csproj',
            updatedDeps: ['dep'],
            newPackageFileContent: '{}',
            config,
        })).toMatchSnapshot();
    });
    it('authenticates at registries', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.fs.getSiblingFileName.mockReturnValueOnce('packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current packages.lock.json');
        util_1.fs.readLocalFile.mockResolvedValueOnce('New packages.lock.json');
        getConfiguredRegistries.mockResolvedValueOnce([
            {
                name: 'myRegistry',
                url: 'https://my-registry.example.org',
            },
        ]);
        hostRules.find.mockImplementationOnce((search) => {
            if (search.hostType === 'nuget' &&
                search.url === 'https://my-registry.example.org') {
                return {
                    username: 'some-username',
                    password: 'some-password',
                };
            }
            return undefined;
        });
        expect(await nuget.updateArtifacts({
            packageFileName: 'project.csproj',
            updatedDeps: ['dep'],
            newPackageFileContent: '{}',
            config,
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
});
//# sourceMappingURL=artifacts.spec.js.map