"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectSemanticCommits = void 0;
const conventional_commits_detector_1 = __importDefault(require("conventional-commits-detector"));
const logger_1 = require("../../../logger");
const git_1 = require("../../../util/git");
async function detectSemanticCommits() {
    logger_1.logger.debug('detectSemanticCommits()');
    const commitMessages = await git_1.getCommitMessages();
    logger_1.logger.trace(`commitMessages=${JSON.stringify(commitMessages)}`);
    const type = conventional_commits_detector_1.default(commitMessages);
    logger_1.logger.debug('Semantic commits detection: ' + type);
    if (type === 'angular') {
        logger_1.logger.debug('angular semantic commits detected');
        return 'enabled';
    }
    logger_1.logger.debug('No semantic commits detected');
    return 'disabled';
}
exports.detectSemanticCommits = detectSemanticCommits;
//# sourceMappingURL=semantic.js.map