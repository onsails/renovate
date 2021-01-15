"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeUpdates = void 0;
const logger_1 = require("../../../logger");
const git_1 = require("../../../util/git");
const branch_1 = require("../../branch");
const common_1 = require("../../common");
const limits_1 = require("../../global/limits");
const limits_2 = require("./limits");
async function writeUpdates(config, allBranches) {
    let branches = allBranches;
    logger_1.logger.debug(`Processing ${branches.length} branch${branches.length !== 1 ? 'es' : ''}: ${branches
        .map((b) => b.branchName)
        .sort()
        .join(', ')}`);
    branches = branches.filter((branchConfig) => {
        if (branchConfig.blockedByPin) {
            logger_1.logger.debug(`Branch ${branchConfig.branchName} is blocked by a Pin PR`);
            return false;
        }
        return true;
    });
    const prsRemaining = await limits_2.getPrsRemaining(config, branches);
    logger_1.logger.debug({ prsRemaining }, 'Calculated maximum PRs remaining this run');
    limits_1.setMaxLimit(limits_1.Limit.PullRequests, prsRemaining);
    const branchesRemaining = limits_2.getBranchesRemaining(config, branches);
    logger_1.logger.debug({ branchesRemaining }, 'Calculated maximum branches remaining this run');
    limits_1.setMaxLimit(limits_1.Limit.Branches, branchesRemaining);
    for (const branch of branches) {
        logger_1.addMeta({ branch: branch.branchName });
        const branchExisted = git_1.branchExists(branch.branchName);
        const res = await branch_1.processBranch(branch);
        branch.res = res;
        if (res === common_1.ProcessBranchResult.Automerged &&
            branch.automergeType !== 'pr-comment') {
            // Stop processing other branches because base branch has been changed
            return 'automerged';
        }
        if (!branchExisted && git_1.branchExists(branch.branchName)) {
            limits_1.incLimitedValue(limits_1.Limit.Branches);
        }
    }
    logger_1.removeMeta(['branch']);
    return 'done';
}
exports.writeUpdates = writeUpdates;
//# sourceMappingURL=write.js.map