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
const exec_util_1 = require("../../../../test/exec-util");
const util_1 = require("../../../../test/util");
const _env = __importStar(require("../../../util/exec/env"));
const _yarnHelper = __importStar(require("./yarn"));
jest.mock('child_process');
jest.mock('../../../util/exec/env');
jest.mock('../../../util/fs');
jest.mock('./node-version');
const exec = child_process_1.exec;
const env = util_1.mocked(_env);
const yarnHelper = util_1.mocked(_yarnHelper);
delete process.env.NPM_CONFIG_CACHE;
// TODO: figure out snapshot similarity for each CI platform
const fixSnapshots = (snapshots) => snapshots.map((snapshot) => ({
    ...snapshot,
    cmd: snapshot.cmd.replace(/^.*\/yarn.*?\.js\s+/, '<yarn> '),
}));
describe(util_1.getName(__filename), () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
    });
    it.each([
        ['1.22.0', '^1.10.0', 2],
        ['2.1.0', '>= 2.0.0', 1],
        ['2.2.0', '2.2.0', 1],
    ])('generates lock files using yarn v%s', async (yarnVersion, yarnCompatibility, expectedFsCalls) => {
        const execSnapshots = exec_util_1.mockExecAll(exec, {
            stdout: yarnVersion,
            stderr: '',
        });
        util_1.fs.readFile.mockImplementation((filename, encoding) => {
            if (filename.endsWith('.yarnrc')) {
                return new Promise((resolve) => resolve(null));
            }
            return new Promise((resolve) => resolve('package-lock-contents'));
        });
        const config = {
            dockerMapDotfiles: true,
            constraints: {
                yarn: yarnCompatibility,
            },
            postUpdateOptions: ['yarnDedupeFewer', 'yarnDedupeHighest'],
        };
        const res = await yarnHelper.generateLockFile('some-dir', {}, config);
        expect(util_1.fs.readFile).toHaveBeenCalledTimes(expectedFsCalls);
        expect(util_1.fs.remove).toHaveBeenCalledTimes(0);
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(fixSnapshots(execSnapshots)).toMatchSnapshot();
    });
    it.each([['1.22.0'], ['2.1.0']])('performs lock file updates using yarn v%s', async (yarnVersion) => {
        const execSnapshots = exec_util_1.mockExecAll(exec, {
            stdout: yarnVersion,
            stderr: '',
        });
        util_1.fs.readFile.mockImplementation((filename, encoding) => {
            if (filename.endsWith('.yarnrc')) {
                return new Promise((resolve) => resolve(null));
            }
            return new Promise((resolve) => resolve('package-lock-contents'));
        });
        const config = {
            constraints: {
                yarn: yarnVersion === '1.22.0' ? '^1.10.0' : '>= 2.0.0',
            },
        };
        const res = await yarnHelper.generateLockFile('some-dir', {}, config, [
            {
                depName: 'some-dep',
                newValue: '^1.0.0',
                isLockfileUpdate: true,
            },
        ]);
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(fixSnapshots(execSnapshots)).toMatchSnapshot();
    });
    it.each([['1.22.0']])('performs lock file updates and full install using yarn v%s', async (yarnVersion) => {
        const execSnapshots = exec_util_1.mockExecAll(exec, {
            stdout: yarnVersion,
            stderr: '',
        });
        util_1.fs.readFile
            .mockResolvedValueOnce('yarn-offline-mirror ./npm-packages-offline-cache')
            .mockResolvedValueOnce('package-lock-contents');
        const res = await yarnHelper.generateLockFile('some-dir', {}, {}, [
            {
                depName: 'some-dep',
                isLockfileUpdate: true,
            },
        ]);
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(fixSnapshots(execSnapshots)).toMatchSnapshot();
    });
    it.each([
        ['1.22.0', '^1.10.0', 2],
        ['2.1.0', '>= 2.0.0', 1],
        ['2.2.0', '2.2.0', 1],
    ])('performs lock file maintenance using yarn v%s', async (yarnVersion, yarnCompatibility, expectedFsCalls) => {
        const execSnapshots = exec_util_1.mockExecAll(exec, {
            stdout: yarnVersion,
            stderr: '',
        });
        util_1.fs.readFile.mockImplementation((filename, encoding) => {
            if (filename.endsWith('.yarnrc')) {
                return new Promise((resolve) => resolve(null));
            }
            return new Promise((resolve) => resolve('package-lock-contents'));
        });
        const config = {
            dockerMapDotfiles: true,
            constraints: {
                yarn: yarnCompatibility,
            },
            postUpdateOptions: ['yarnDedupeFewer', 'yarnDedupeHighest'],
        };
        const res = await yarnHelper.generateLockFile('some-dir', {}, config, [
            { isLockFileMaintenance: true },
        ]);
        expect(util_1.fs.readFile).toHaveBeenCalledTimes(expectedFsCalls);
        expect(util_1.fs.remove).toHaveBeenCalledTimes(1);
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(fixSnapshots(execSnapshots)).toMatchSnapshot();
    });
    it('catches errors', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec, {
            stdout: '1.9.4',
            stderr: 'some-error',
        });
        util_1.fs.readFile.mockResolvedValueOnce(null).mockRejectedValueOnce(() => {
            throw new Error('not-found');
        });
        const res = await yarnHelper.generateLockFile('some-dir', {});
        expect(util_1.fs.readFile).toHaveBeenCalledTimes(2);
        expect(res.error).toBe(true);
        expect(res.lockFile).not.toBeDefined();
        expect(fixSnapshots(execSnapshots)).toMatchSnapshot();
    });
});
//# sourceMappingURL=yarn.spec.js.map