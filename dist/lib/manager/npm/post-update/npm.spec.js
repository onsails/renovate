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
const upath_1 = __importDefault(require("upath"));
const exec_util_1 = require("../../../../test/exec-util");
const util_1 = require("../../../../test/util");
const common_1 = require("../../../util/exec/common");
const _env = __importStar(require("../../../util/exec/env"));
const _fs = __importStar(require("../../../util/fs/proxies"));
const npmHelper = __importStar(require("./npm"));
jest.mock('child_process');
jest.mock('../../../util/exec/env');
jest.mock('../../../util/fs/proxies');
jest.mock('./node-version');
const exec = child_process_1.exec;
const env = util_1.mocked(_env);
const fs = util_1.mocked(_fs);
describe('generateLockFile', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
    });
    it('generates lock files', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile = jest.fn(() => 'package-lock-contents');
        const skipInstalls = true;
        const dockerMapDotfiles = true;
        const postUpdateOptions = ['npmDedupe'];
        const updates = [
            { depName: 'some-dep', toVersion: '1.0.1', isLockfileUpdate: false },
        ];
        const res = await npmHelper.generateLockFile('some-dir', {}, 'package-lock.json', { dockerMapDotfiles, skipInstalls, postUpdateOptions }, updates);
        expect(fs.readFile).toHaveBeenCalledTimes(1);
        expect(res.error).toBeUndefined();
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(execSnapshots).toMatchSnapshot();
    });
    it('performs lock file updates', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile = jest.fn(() => 'package-lock-contents');
        const skipInstalls = true;
        const updates = [
            { depName: 'some-dep', toVersion: '1.0.1', isLockfileUpdate: true },
        ];
        const res = await npmHelper.generateLockFile('some-dir', {}, 'package-lock.json', { skipInstalls }, updates);
        expect(fs.readFile).toHaveBeenCalledTimes(1);
        expect(res.error).toBeUndefined();
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(execSnapshots).toMatchSnapshot();
    });
    it('performs npm-shrinkwrap.json updates', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.pathExists.mockResolvedValueOnce(true);
        fs.move = jest.fn();
        fs.readFile = jest.fn(() => 'package-lock-contents');
        const skipInstalls = true;
        const res = await npmHelper.generateLockFile('some-dir', {}, 'npm-shrinkwrap.json', { skipInstalls });
        expect(fs.pathExists).toHaveBeenCalledWith(upath_1.default.join('some-dir', 'package-lock.json'));
        expect(fs.move).toHaveBeenCalledTimes(1);
        expect(fs.move).toHaveBeenCalledWith(upath_1.default.join('some-dir', 'package-lock.json'), upath_1.default.join('some-dir', 'npm-shrinkwrap.json'));
        expect(fs.readFile).toHaveBeenCalledTimes(1);
        expect(fs.readFile).toHaveBeenCalledWith(upath_1.default.join('some-dir', 'npm-shrinkwrap.json'), 'utf8');
        expect(res.error).toBeUndefined();
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(execSnapshots).toMatchSnapshot();
    });
    it('performs npm-shrinkwrap.json updates (no package-lock.json)', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.pathExists.mockResolvedValueOnce(false);
        fs.move = jest.fn();
        fs.readFile = jest.fn((_, _1) => 'package-lock-contents');
        const skipInstalls = true;
        const res = await npmHelper.generateLockFile('some-dir', {}, 'npm-shrinkwrap.json', { skipInstalls });
        expect(fs.pathExists).toHaveBeenCalledWith(upath_1.default.join('some-dir', 'package-lock.json'));
        expect(fs.move).toHaveBeenCalledTimes(0);
        expect(fs.readFile).toHaveBeenCalledTimes(1);
        expect(fs.readFile).toHaveBeenCalledWith(upath_1.default.join('some-dir', 'npm-shrinkwrap.json'), 'utf8');
        expect(res.error).toBeUndefined();
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(execSnapshots).toMatchSnapshot();
    });
    it('performs full install', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile = jest.fn(() => 'package-lock-contents');
        const skipInstalls = false;
        const binarySource = common_1.BinarySource.Global;
        const res = await npmHelper.generateLockFile('some-dir', {}, 'package-lock.json', { skipInstalls, binarySource });
        expect(fs.readFile).toHaveBeenCalledTimes(1);
        expect(res.error).toBeUndefined();
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(execSnapshots).toMatchSnapshot();
    });
    it('catches errors', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile = jest.fn(() => {
            throw new Error('not found');
        });
        const res = await npmHelper.generateLockFile('some-dir', {}, 'package-lock.json');
        expect(fs.readFile).toHaveBeenCalledTimes(1);
        expect(res.error).toBe(true);
        expect(res.lockFile).not.toBeDefined();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('finds npm globally', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile = jest.fn(() => 'package-lock-contents');
        const res = await npmHelper.generateLockFile('some-dir', {}, 'package-lock.json');
        expect(fs.readFile).toHaveBeenCalledTimes(1);
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(execSnapshots).toMatchSnapshot();
    });
    it('uses docker npm', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile = jest.fn(() => 'package-lock-contents');
        const res = await npmHelper.generateLockFile('some-dir', {}, 'package-lock.json', { binarySource: common_1.BinarySource.Docker, constraints: { npm: '^6.0.0' } });
        expect(fs.readFile).toHaveBeenCalledTimes(1);
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(execSnapshots).toMatchSnapshot();
    });
    it('performs lock file maintenance', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile = jest.fn(() => 'package-lock-contents');
        const res = await npmHelper.generateLockFile('some-dir', {}, 'package-lock.json', {}, [{ isLockFileMaintenance: true }]);
        expect(fs.readFile).toHaveBeenCalledTimes(1);
        expect(fs.remove).toHaveBeenCalledTimes(1);
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(execSnapshots).toMatchSnapshot();
    });
});
//# sourceMappingURL=npm.spec.js.map