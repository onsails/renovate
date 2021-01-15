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
const fs_1 = require("fs");
const exec_util_1 = require("../../../test/exec-util");
const util_1 = require("../../../test/util");
const common_1 = require("../../util/exec/common");
const fs = __importStar(require("../../util/fs"));
const extract = __importStar(require("./extract"));
const _1 = require(".");
const packageFile = 'lib/manager/pip_setup/__fixtures__/setup.py';
const content = fs_1.readFileSync(packageFile, 'utf8');
const packageFileJson = 'lib/manager/pip_setup/__fixtures__/setup.py.json';
const jsonContent = fs_1.readFileSync(packageFileJson, 'utf8');
const config = {
    localDir: '/tmp/github/some/repo',
};
jest.mock('child_process');
jest.mock('../../util/exec/env');
const pythonVersionCallResults = [
    { stdout: '', stderr: 'Python 2.7.17\\n' },
    { stdout: 'Python 3.7.5\\n', stderr: '' },
    new Error(),
];
// TODO: figure out snapshot similarity for each CI platform
const fixSnapshots = (snapshots) => snapshots.map((snapshot) => ({
    ...snapshot,
    cmd: snapshot.cmd.replace(/^.*extract\.py"\s+/, '<extract.py> '),
}));
describe(util_1.getName(__filename), () => {
    describe('extractPackageFile()', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.resetModules();
            extract.resetModule();
            util_1.env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
            // do not copy extract.py
            jest.spyOn(fs, 'writeLocalFile').mockResolvedValue();
        });
        it('returns found deps', async () => {
            const execSnapshots = exec_util_1.mockExecSequence(exec_util_1.exec, [
                ...pythonVersionCallResults,
                {
                    stdout: '',
                    stderr: 'DeprecationWarning: the imp module is deprecated in favour of importlib',
                },
            ]);
            jest.spyOn(fs, 'readLocalFile').mockResolvedValueOnce(jsonContent);
            expect(await _1.extractPackageFile(content, packageFile, config)).toMatchSnapshot();
            expect(exec_util_1.exec).toHaveBeenCalledTimes(4);
            expect(fixSnapshots(execSnapshots)).toMatchSnapshot();
        });
        it('returns found deps (docker)', async () => {
            const execSnapshots = exec_util_1.mockExecSequence(exec_util_1.exec, [
                { stdout: '', stderr: '' },
            ]);
            jest.spyOn(fs, 'readLocalFile').mockResolvedValueOnce(jsonContent);
            expect(await _1.extractPackageFile(content, packageFile, {
                ...config,
                binarySource: common_1.BinarySource.Docker,
            })).toMatchSnapshot();
            expect(execSnapshots).toHaveLength(1); // TODO: figure out volume arguments in Windows
        });
        it('returns no deps', async () => {
            const execSnapshots = exec_util_1.mockExecSequence(exec_util_1.exec, [
                ...pythonVersionCallResults,
                {
                    stdout: '',
                    stderr: 'fatal: No names found, cannot describe anything.',
                },
            ]);
            jest.spyOn(fs, 'readLocalFile').mockResolvedValueOnce('{}');
            expect(await _1.extractPackageFile(content, packageFile, config)).toBeNull();
            expect(exec_util_1.exec).toHaveBeenCalledTimes(4);
            expect(fixSnapshots(execSnapshots)).toMatchSnapshot();
        });
        it('should return null for invalid file', async () => {
            const execSnapshots = exec_util_1.mockExecSequence(exec_util_1.exec, [
                ...pythonVersionCallResults,
                new Error(),
            ]);
            expect(await _1.extractPackageFile('raise Exception()', '/tmp/folders/foobar.py', config)).toBeNull();
            expect(exec_util_1.exec).toHaveBeenCalledTimes(4);
            expect(fixSnapshots(execSnapshots)).toMatchSnapshot();
        });
        it('catches error', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec_util_1.exec, new Error());
            expect(await _1.extractPackageFile('raise Exception()', '/tmp/folders/foobar.py', config)).toBeNull();
            expect(fixSnapshots(execSnapshots)).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map