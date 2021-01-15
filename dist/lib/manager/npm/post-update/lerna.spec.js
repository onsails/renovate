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
const _lernaHelper = __importStar(require("./lerna"));
jest.mock('child_process');
jest.mock('../../../util/exec/env');
jest.mock('../../../manager/npm/post-update/node-version');
const exec = child_process_1.exec;
const env = util_1.mocked(_env);
const lernaHelper = util_1.mocked(_lernaHelper);
function lernaPkgFile(lernaClient) {
    return {
        lernaClient,
        deps: [{ depName: 'lerna', currentValue: '2.0.0' }],
    };
}
function lernaPkgFileWithoutLernaDep(lernaClient) {
    return {
        lernaClient,
    };
}
describe(util_1.getName(__filename), () => {
    describe('generateLockFiles()', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            jest.resetModules();
            env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
        });
        it('returns if no lernaClient', async () => {
            const res = await lernaHelper.generateLockFiles({}, 'some-dir', {}, {});
            expect(res.error).toBe(false);
        });
        it('returns if invalid lernaClient', async () => {
            const res = await lernaHelper.generateLockFiles(lernaPkgFile('foo'), 'some-dir', {}, {});
            expect(res.error).toBe(false);
        });
        it('generates package-lock.json files', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec);
            const skipInstalls = true;
            const res = await lernaHelper.generateLockFiles(lernaPkgFile('npm'), 'some-dir', {}, {}, skipInstalls);
            expect(res.error).toBe(false);
            expect(execSnapshots).toMatchSnapshot();
        });
        it('performs full npm install', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec);
            const skipInstalls = false;
            const res = await lernaHelper.generateLockFiles(lernaPkgFile('npm'), 'some-dir', {}, {}, skipInstalls);
            expect(res.error).toBe(false);
            expect(execSnapshots).toMatchSnapshot();
        });
        it('generates yarn.lock files', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec);
            const res = await lernaHelper.generateLockFiles(lernaPkgFile('yarn'), 'some-dir', { constraints: { yarn: '^1.10.0' } }, {});
            expect(execSnapshots).toMatchSnapshot();
            expect(res.error).toBe(false);
        });
        it('defaults to latest if lerna version unspecified', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec);
            const res = await lernaHelper.generateLockFiles(lernaPkgFileWithoutLernaDep('npm'), 'some-dir', {}, {});
            expect(res.error).toBe(false);
            expect(execSnapshots).toMatchSnapshot();
        });
        it('maps dot files', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec);
            const res = await lernaHelper.generateLockFiles(lernaPkgFile('npm'), 'some-dir', {
                dockerMapDotfiles: true,
                constraints: { npm: '^6.0.0' },
            }, {});
            expect(res.error).toBe(false);
            expect(execSnapshots).toMatchSnapshot();
        });
        it('allows scripts for trust level high', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec);
            global.trustLevel = 'high';
            const res = await lernaHelper.generateLockFiles(lernaPkgFile('npm'), 'some-dir', {}, {});
            delete global.trustLevel;
            expect(res.error).toBe(false);
            expect(execSnapshots).toMatchSnapshot();
        });
    });
    describe('getLernaVersion()', () => {
        it('returns specified version', () => {
            const pkg = {
                deps: [{ depName: 'lerna', currentValue: '2.0.0' }],
            };
            expect(lernaHelper.getLernaVersion(pkg)).toBe('2.0.0');
        });
        it('returns specified range', () => {
            const pkg = {
                deps: [
                    { depName: 'lerna', currentValue: '1.x || >=2.5.0 || 5.0.0 - 7.2.3' },
                ],
            };
            expect(lernaHelper.getLernaVersion(pkg)).toBe('1.x || >=2.5.0 || 5.0.0 - 7.2.3');
        });
        it('returns latest if no lerna dep is specified', () => {
            const pkg = {
                deps: [{ depName: 'something-else', currentValue: '1.2.3' }],
            };
            expect(lernaHelper.getLernaVersion(pkg)).toBe('latest');
        });
        it('returns latest if pkg has no deps at all', () => {
            const pkg = {};
            expect(lernaHelper.getLernaVersion(pkg)).toBe('latest');
        });
        it('returns latest if specified lerna version is not a valid semVer range', () => {
            const pkg = {
                deps: [{ depName: 'lerna', currentValue: '[a.b.c;' }],
            };
            expect(lernaHelper.getLernaVersion(pkg)).toBe('latest');
        });
    });
});
//# sourceMappingURL=lerna.spec.js.map