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
const exec_util_1 = require("../../../test/exec-util");
const util_1 = require("../../../test/util");
const common_1 = require("../../util/exec/common");
const _env = __importStar(require("../../util/exec/env"));
const _1 = require(".");
const fs = fs_extra_1.default;
const exec = child_process_1.exec;
const env = util_1.mocked(_env);
jest.mock('fs-extra');
jest.mock('child_process');
jest.mock('../../util/exec/env');
const config = {
    localDir: '/tmp/github/some/repo',
};
describe('.updateArtifacts()', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
    });
    it('returns null if no mix.lock found', async () => {
        expect(await _1.updateArtifacts({
            packageFileName: 'mix.exs',
            updatedDeps: ['plug'],
            newPackageFileContent: '',
            config,
        })).toBeNull();
    });
    it('returns null if no updatedDeps were provided', async () => {
        expect(await _1.updateArtifacts({
            packageFileName: 'mix.exs',
            updatedDeps: [],
            newPackageFileContent: '',
            config,
        })).toBeNull();
    });
    it('returns null if no local directory found', async () => {
        const noLocalDirConfig = {
            localDir: null,
        };
        expect(await _1.updateArtifacts({
            packageFileName: 'mix.exs',
            updatedDeps: ['plug'],
            newPackageFileContent: '',
            config: noLocalDirConfig,
        })).toBeNull();
    });
    it('returns null if updatedDeps is empty', async () => {
        expect(await _1.updateArtifacts({
            packageFileName: 'mix.exs',
            updatedDeps: ['plug'],
            newPackageFileContent: '',
            config,
        })).toBeNull();
    });
    it('returns null if unchanged', async () => {
        fs.readFile.mockResolvedValueOnce('Current mix.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockResolvedValueOnce('Current mix.lock');
        expect(await _1.updateArtifacts({
            packageFileName: 'mix.exs',
            updatedDeps: ['plug'],
            newPackageFileContent: '',
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns updated mix.lock', async () => {
        fs.readFile.mockResolvedValueOnce('Old mix.lock');
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockResolvedValueOnce('New mix.lock');
        expect(await _1.updateArtifacts({
            packageFileName: 'mix.exs',
            updatedDeps: ['plug'],
            newPackageFileContent: '{}',
            config: {
                ...config,
                binarySource: common_1.BinarySource.Docker,
            },
        })).toMatchSnapshot();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('catches errors', async () => {
        fs.readFile.mockResolvedValueOnce('Current mix.lock');
        fs.outputFile.mockImplementationOnce(() => {
            throw new Error('not found');
        });
        expect(await _1.updateArtifacts({
            packageFileName: 'mix.exs',
            updatedDeps: ['plug'],
            newPackageFileContent: '{}',
            config,
        })).toMatchSnapshot();
    });
});
//# sourceMappingURL=artifacts.spec.js.map