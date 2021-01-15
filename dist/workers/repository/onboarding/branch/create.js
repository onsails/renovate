"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnboardingBranch = void 0;
const app_strings_1 = require("../../../../config/app-strings");
const logger_1 = require("../../../../logger");
const git_1 = require("../../../../util/git");
const commit_message_1 = require("../../util/commit-message");
const config_1 = require("./config");
const defaultConfigFile = app_strings_1.configFileNames[0];
async function createOnboardingBranch(config) {
    logger_1.logger.debug('createOnboardingBranch()');
    const contents = await config_1.getOnboardingConfig(config);
    logger_1.logger.debug('Creating onboarding branch');
    const configFile = app_strings_1.configFileNames.includes(config.onboardingConfigFileName)
        ? config.onboardingConfigFileName
        : defaultConfigFile;
    let commitMessagePrefix = '';
    if (config.commitMessagePrefix) {
        commitMessagePrefix = config.commitMessagePrefix;
    }
    else if (config.semanticCommits === 'enabled') {
        commitMessagePrefix = config.semanticCommitType;
        if (config.semanticCommitScope) {
            commitMessagePrefix += `(${config.semanticCommitScope})`;
        }
    }
    if (commitMessagePrefix) {
        commitMessagePrefix = commit_message_1.formatCommitMessagePrefix(commitMessagePrefix);
    }
    let onboardingCommitMessage;
    if (config.onboardingCommitMessage) {
        onboardingCommitMessage = config.onboardingCommitMessage;
    }
    else {
        onboardingCommitMessage = `${commitMessagePrefix ? 'add' : 'Add'} ${configFile}`;
    }
    const commitMessage = `${commitMessagePrefix} ${onboardingCommitMessage}`.trim();
    // istanbul ignore if
    if (config.dryRun) {
        logger_1.logger.info('DRY-RUN: Would commit files to onboarding branch');
        return null;
    }
    return git_1.commitFiles({
        branchName: config.onboardingBranch,
        files: [
            {
                name: configFile,
                contents,
            },
        ],
        message: commitMessage,
    });
}
exports.createOnboardingBranch = createOnboardingBranch;
//# sourceMappingURL=create.js.map