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
const _fs = __importStar(require("../../../util/fs/proxies"));
const _pnpmHelper = __importStar(require("./pnpm"));
jest.mock('child_process');
jest.mock('../../../util/exec/env');
jest.mock('../../../util/fs/proxies');
jest.mock('./node-version');
const exec = child_process_1.exec;
const env = util_1.mocked(_env);
const fs = util_1.mocked(_fs);
const pnpmHelper = util_1.mocked(_pnpmHelper);
delete process.env.NPM_CONFIG_CACHE;
describe('generateLockFile', () => {
    let config;
    beforeEach(() => {
        config = { cacheDir: 'some-cache-dir', constraints: { pnpm: '^2.0.0' } };
        env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
    });
    it('generates lock files', async () => {
        config.dockerMapDotfiles = true;
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile = jest.fn(() => 'package-lock-contents');
        const res = await pnpmHelper.generateLockFile('some-dir', {}, config);
        expect(fs.readFile).toHaveBeenCalledTimes(1);
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(execSnapshots).toMatchSnapshot();
    });
    it('catches errors', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile = jest.fn(() => {
            throw new Error('not found');
        });
        const res = await pnpmHelper.generateLockFile('some-dir', {}, config);
        expect(fs.readFile).toHaveBeenCalledTimes(1);
        expect(res.error).toBe(true);
        expect(res.lockFile).not.toBeDefined();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('finds pnpm globally', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile = jest.fn(() => 'package-lock-contents');
        const res = await pnpmHelper.generateLockFile('some-dir', {}, config);
        expect(fs.readFile).toHaveBeenCalledTimes(1);
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(execSnapshots).toMatchSnapshot();
    });
    it('performs lock file maintenance', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile = jest.fn(() => 'package-lock-contents');
        const res = await pnpmHelper.generateLockFile('some-dir', {}, config, [
            { isLockFileMaintenance: true },
        ]);
        expect(fs.readFile).toHaveBeenCalledTimes(1);
        expect(fs.remove).toHaveBeenCalledTimes(1);
        expect(res.lockFile).toEqual('package-lock-contents');
        expect(execSnapshots).toMatchSnapshot();
    });
});
//# sourceMappingURL=pnpm.spec.js.map