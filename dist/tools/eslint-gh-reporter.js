"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = require("path");
const core_1 = require("@actions/core");
const command_1 = require("@actions/core/lib/command");
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const ROOT = process.cwd();
function getCmd(severity) {
    switch (severity) {
        case 2:
            return 'error';
        case 1:
            return 'warning';
        default:
            return 'debug';
    }
}
function getPath(path) {
    return path_1.relative(ROOT, path).replace(/\\/g, '/');
}
const formatter = (results) => {
    try {
        for (const { filePath, messages } of results) {
            const file = getPath(filePath);
            for (const { severity, line, column, ruleId, message } of messages) {
                const cmd = getCmd(severity);
                const pos = { line: line.toString(), col: column.toString() };
                command_1.issueCommand(cmd, { file, ...pos }, strip_ansi_1.default(`[${ruleId}] ${message}`));
            }
        }
    }
    catch (e) {
        core_1.error(`Unexpected error: ${e.toString()}`);
    }
    return '';
};
module.exports = formatter;
//# sourceMappingURL=eslint-gh-reporter.js.map