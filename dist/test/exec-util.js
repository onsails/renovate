"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envMock = exports.mockExecSequence = exports.mockExecAll = exports.execSnapshot = exports.exec = void 0;
const child_process_1 = require("child_process");
const is_1 = __importDefault(require("@sindresorhus/is"));
const traverse_1 = __importDefault(require("traverse"));
const upath_1 = require("upath");
exports.exec = child_process_1.exec;
function execSnapshot(cmd, options) {
    const snapshot = {
        cmd,
        options,
    };
    const cwd = upath_1.toUnix(process.cwd());
    // eslint-disable-next-line array-callback-return
    return traverse_1.default(snapshot).map(function fixup(v) {
        if (is_1.default.string(v)) {
            const val = v.replace(/\\(\w)/g, '/$1').replace(cwd, '/root/project');
            this.update(val);
        }
    });
}
exports.execSnapshot = execSnapshot;
const defaultExecResult = { stdout: '', stderr: '' };
function mockExecAll(execFn, execResult = defaultExecResult) {
    const snapshots = [];
    execFn.mockImplementation((cmd, options, callback) => {
        snapshots.push(execSnapshot(cmd, options));
        if (execResult instanceof Error) {
            throw execResult;
        }
        callback(null, execResult);
        return undefined;
    });
    return snapshots;
}
exports.mockExecAll = mockExecAll;
function mockExecSequence(execFn, execResults) {
    const snapshots = [];
    execResults.forEach((execResult) => {
        execFn.mockImplementationOnce((cmd, options, callback) => {
            snapshots.push(execSnapshot(cmd, options));
            if (execResult instanceof Error) {
                throw execResult;
            }
            callback(null, execResult);
            return undefined;
        });
    });
    return snapshots;
}
exports.mockExecSequence = mockExecSequence;
const basicEnvMock = {
    HTTP_PROXY: 'http://example.com',
    HTTPS_PROXY: 'https://example.com',
    NO_PROXY: 'localhost',
    HOME: '/home/user',
    PATH: '/tmp/path',
    LANG: 'en_US.UTF-8',
    LC_ALL: 'en_US',
};
const fullEnvMock = {
    ...basicEnvMock,
    SELECTED_ENV_VAR: 'Can be selected',
    FILTERED_ENV_VAR: 'Should be filtered',
};
const filteredEnvMock = {
    ...basicEnvMock,
    SELECTED_ENV_VAR: fullEnvMock.SELECTED_ENV_VAR,
};
exports.envMock = {
    basic: basicEnvMock,
    full: fullEnvMock,
    filtered: filteredEnvMock,
};
//# sourceMappingURL=exec-util.js.map