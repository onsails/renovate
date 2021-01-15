"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pruneStaleBranches = void 0;
const error_messages_1 = require("../../../constants/error-messages");
const logger_1 = require("../../../logger");
const platform_1 = require("../../../platform");
const types_1 = require("../../../types");
const git_1 = require("../../../util/git");
async function cleanUpBranches({ dryRun, pruneStaleBranches: enabled }, remainingBranches) {
    var _a;
    if (enabled === false) {
        logger_1.logger.debug('Branch/PR pruning is disabled - skipping');
        return;
    }
    for (const branchName of remainingBranches) {
        try {
            const pr = await platform_1.platform.findPr({
                branchName,
                state: types_1.PrState.Open,
            });
            const branchIsModified = await git_1.isBranchModified(branchName);
            if (pr) {
                if (branchIsModified) {
                    logger_1.logger.debug({ prNo: pr.number, prTitle: pr.title }, 'Branch is modified - skipping PR autoclosing');
                    if (dryRun) {
                        logger_1.logger.info(`DRY-RUN: Would add Autoclosing Skipped comment to PR`);
                    }
                    else {
                        await platform_1.platform.ensureComment({
                            number: pr.number,
                            topic: 'Autoclosing Skipped',
                            content: 'This PR has been flagged for autoclosing, however it is being skipped due to the branch being already modified. Please close/delete it manually or report a bug if you think this is in error.',
                        });
                    }
                }
                else if (dryRun) {
                    logger_1.logger.info({ prNo: pr.number, prTitle: pr.title }, `DRY-RUN: Would autoclose PR`);
                }
                else {
                    logger_1.logger.info({ branchName, prNo: pr.number, prTitle: pr.title }, 'Autoclosing PR');
                    let newPrTitle = pr.title;
                    if (!pr.title.endsWith('- autoclosed')) {
                        newPrTitle += ' - autoclosed';
                    }
                    await platform_1.platform.updatePr({
                        number: pr.number,
                        prTitle: newPrTitle,
                        state: types_1.PrState.Closed,
                    });
                    await git_1.deleteBranch(branchName);
                }
            }
            else if (dryRun) {
                logger_1.logger.info(`DRY-RUN: Would delete orphan branch ${branchName}`);
            }
            else {
                logger_1.logger.info({ branch: branchName }, `Deleting orphan branch`);
                await git_1.deleteBranch(branchName);
            }
        }
        catch (err) /* istanbul ignore next */ {
            if ((_a = err.message) === null || _a === void 0 ? void 0 : _a.includes("bad revision 'origin/")) {
                logger_1.logger.debug({ branchName }, 'Branch not found on origin when attempting to prune');
            }
            else if (err.message !== error_messages_1.REPOSITORY_CHANGED) {
                logger_1.logger.warn({ err, branch: branchName }, 'Error pruning branch');
            }
        }
    }
}
async function pruneStaleBranches(config, branchList) {
    logger_1.logger.debug('Removing any stale branches');
    logger_1.logger.trace({ config }, `pruneStaleBranches`);
    logger_1.logger.debug(`config.repoIsOnboarded=${config.repoIsOnboarded}`);
    if (!branchList) {
        logger_1.logger.debug('No branchList');
        return;
    }
    let renovateBranches = git_1.getBranchList().filter((branchName) => branchName.startsWith(config.branchPrefix));
    if (!(renovateBranches === null || renovateBranches === void 0 ? void 0 : renovateBranches.length)) {
        logger_1.logger.debug('No renovate branches found');
        return;
    }
    logger_1.logger.debug({ branchList, renovateBranches }, 'Branch lists');
    const lockFileBranch = `${config.branchPrefix}lock-file-maintenance`;
    renovateBranches = renovateBranches.filter((branch) => branch !== lockFileBranch);
    const remainingBranches = renovateBranches.filter((branch) => !branchList.includes(branch));
    logger_1.logger.debug(`remainingBranches=${String(remainingBranches)}`);
    if (remainingBranches.length === 0) {
        logger_1.logger.debug('No branches to clean up');
        return;
    }
    await cleanUpBranches(config, remainingBranches);
}
exports.pruneStaleBranches = pruneStaleBranches;
//# sourceMappingURL=prune.js.map