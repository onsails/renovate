"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = require("path");
const core_1 = require("@actions/core");
const command_1 = require("@actions/core/lib/command");
const reporters_1 = require("@jest/reporters");
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const utils_1 = require("./utils");
const ROOT = process.cwd();
function getCmd(test) {
    switch (test.status) {
        case 'failed':
            return 'error';
        case 'pending':
        case 'todo':
            return 'warning';
        default:
            return 'debug';
    }
}
function getPath(suite) {
    return path_1.relative(ROOT, suite.testFilePath).replace(/\\/g, '/');
}
const ignoreStates = new Set(['passed', 'pending']);
const lineRe = /\.spec\.ts:(?<line>\d+):(?<col>\d+)\)/;
function getPos(msg) {
    const pos = lineRe.exec(msg);
    if (!pos || !pos.groups) {
        return {};
    }
    const line = pos.groups.line;
    const col = pos.groups.col;
    return {
        line,
        col,
    };
}
class GitHubReporter extends reporters_1.BaseReporter {
    // eslint-disable-next-line class-methods-use-this
    onRunComplete(_contexts, testResult) {
        var _a;
        try {
            if (utils_1.getEnv('GITHUB_ACTIONS') !== 'true') {
                return;
            }
            for (const suite of testResult.testResults.filter((s) => !s.skipped)) {
                const file = getPath(suite);
                for (const test of suite.testResults.filter((t) => !ignoreStates.has(t.status))) {
                    const message = strip_ansi_1.default((_a = test.failureMessages) === null || _a === void 0 ? void 0 : _a.join('\n ')) ||
                        `test status: ${test.status}`;
                    const pos = getPos(message);
                    const cmd = getCmd(test);
                    command_1.issueCommand(cmd, { file, ...pos }, message);
                }
            }
        }
        catch (e) {
            core_1.error(`Unexpected error: ${e.toString()}`);
        }
    }
}
module.exports = GitHubReporter;
