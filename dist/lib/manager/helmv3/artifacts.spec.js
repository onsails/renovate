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
const exec_1 = require("../../util/exec");
const common_1 = require("../../util/exec/common");
const docker = __importStar(require("../../util/exec/docker"));
const _env = __importStar(require("../../util/exec/env"));
const helmv3 = __importStar(require("./artifacts"));
jest.mock('fs-extra');
jest.mock('child_process');
jest.mock('../../util/exec/env');
jest.mock('../../util/git');
jest.mock('../../util/http');
const fs = fs_extra_1.default;
const exec = child_process_1.exec;
const env = util_1.mocked(_env);
const config = {
    // `join` fixes Windows CI
    localDir: upath_1.join('/tmp/github/some/repo'),
    dockerUser: 'foobar',
};
describe('.updateArtifacts()', () => {
    beforeEach(async () => {
        jest.resetAllMocks();
        jest.resetModules();
        env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
        await exec_1.setExecConfig(config);
        docker.resetPrefetchedImages();
    });
    it('returns null if no Chart.lock found', async () => {
        const updatedDeps = ['dep1'];
        expect(await helmv3.updateArtifacts({
            packageFileName: 'Chart.yaml',
            updatedDeps,
            newPackageFileContent: '',
            config,
        })).toBeNull();
    });
    it('returns null if updatedDeps is empty', async () => {
        expect(await helmv3.updateArtifacts({
            packageFileName: 'Chart.yaml',
            updatedDeps: [],
            newPackageFileContent: '',
            config,
        })).toBeNull();
    });
    it('returns null if unchanged', async () => {
        fs.readFile.mockResolvedValueOnce('Current Chart.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockResolvedValueOnce('Current Chart.lock');
        const updatedDeps = ['dep1'];
        expect(await helmv3.updateArtifacts({
            packageFileName: 'Chart.yaml',
            updatedDeps,
            newPackageFileContent: '',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns updated Chart.lock', async () => {
        util_1.git.getFile.mockResolvedValueOnce('Old Chart.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockResolvedValueOnce('New Chart.lock');
        const updatedDeps = ['dep1'];
        expect(await helmv3.updateArtifacts({
            packageFileName: 'Chart.yaml',
            updatedDeps,
            newPackageFileContent: '{}',
            config,
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns updated Chart.lock for lockfile maintenance', async () => {
        util_1.git.getFile.mockResolvedValueOnce('Old Chart.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockResolvedValueOnce('New Chart.lock');
        expect(await helmv3.updateArtifacts({
            packageFileName: 'Chart.yaml',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config: { ...config, updateType: 'lockFileMaintenance' },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns updated Chart.lock with docker', async () => {
        jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
        await exec_1.setExecConfig({ ...config, binarySource: common_1.BinarySource.Docker });
        util_1.git.getFile.mockResolvedValueOnce('Old Chart.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockResolvedValueOnce('New Chart.lock');
        const updatedDeps = ['dep1'];
        expect(await helmv3.updateArtifacts({
            packageFileName: 'Chart.yaml',
            updatedDeps,
            newPackageFileContent: '{}',
            config,
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('catches errors', async () => {
        fs.readFile.mockResolvedValueOnce('Current Chart.lock');
        fs.outputFile.mockImplementationOnce(() => {
            throw new Error('not found');
        });
        const updatedDeps = ['dep1'];
        expect(await helmv3.updateArtifacts({
            packageFileName: 'Chart.yaml',
            updatedDeps,
            newPackageFileContent: '{}',
            config,
        })).toMatchSnapshot();
    });
});
//# sourceMappingURL=artifacts.spec.js.map