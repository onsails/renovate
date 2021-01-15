"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureMasterIssue = void 0;
const is_1 = __importDefault(require("@sindresorhus/is"));
const bunyan_1 = require("bunyan");
const logger_1 = require("../../logger");
const platform_1 = require("../../platform");
const types_1 = require("../../types");
const common_1 = require("../common");
function getListItem(branch, type, pr) {
    let item = ' - [ ] ';
    item += `<!-- ${type}-branch=${branch.branchName} -->`;
    if (pr) {
        item += `[${branch.prTitle}](../pull/${pr.number})`;
    }
    else {
        item += branch.prTitle;
    }
    const uniquePackages = [
        ...new Set(branch.upgrades.map((upgrade) => '`' + upgrade.depName + '`')),
    ];
    if (uniquePackages.length < 2) {
        return item + '\n';
    }
    return item + ' (' + uniquePackages.join(', ') + ')\n';
}
function appendRepoProblems(config, issueBody) {
    let newIssueBody = issueBody;
    const repoProblems = new Set(logger_1.getProblems()
        .filter((problem) => problem.repository === config.repository && !problem.artifactErrors)
        .map((problem) => `${bunyan_1.nameFromLevel[problem.level].toUpperCase()}: ${problem.msg}`));
    if (repoProblems.size) {
        newIssueBody += '## Repository problems\n\n';
        newIssueBody +=
            'These problems occurred while renovating this repository.\n\n';
        for (const repoProblem of repoProblems) {
            newIssueBody += ` - ${repoProblem}\n`;
        }
        newIssueBody += '\n';
    }
    return newIssueBody;
}
async function ensureMasterIssue(config, branches) {
    var _a, _b;
    // legacy/migrated issue
    const reuseTitle = 'Update Dependencies (Renovate Bot)';
    if (!(config.dependencyDashboard ||
        branches.some((branch) => branch.dependencyDashboardApproval ||
            branch.dependencyDashboardPrApproval))) {
        return;
    }
    // istanbul ignore if
    if (config.repoIsOnboarded === false) {
        logger_1.logger.debug('Repo is onboarding - skipping dependency dashboard');
        return;
    }
    logger_1.logger.debug('Ensuring Dependency Dashboard');
    const hasBranches = is_1.default.nonEmptyArray(branches) &&
        branches.some((branch) => branch.res !== common_1.ProcessBranchResult.Automerged);
    if (config.dependencyDashboardAutoclose && !hasBranches) {
        if (config.dryRun) {
            logger_1.logger.info('DRY-RUN: Would close Dependency Dashboard ' +
                config.dependencyDashboardTitle);
        }
        else {
            logger_1.logger.debug('Closing Dependency Dashboard');
            await platform_1.platform.ensureIssueClosing(config.dependencyDashboardTitle);
        }
        return;
    }
    let issueBody = '';
    if ((_a = config.dependencyDashboardHeader) === null || _a === void 0 ? void 0 : _a.length) {
        issueBody += `${config.dependencyDashboardHeader}\n\n`;
    }
    issueBody = appendRepoProblems(config, issueBody);
    const pendingApprovals = branches.filter((branch) => branch.res === common_1.ProcessBranchResult.NeedsApproval);
    if (pendingApprovals.length) {
        issueBody += '## Pending Approval\n\n';
        issueBody += `These branches will be created by Renovate only once you click their checkbox below.\n\n`;
        for (const branch of pendingApprovals) {
            issueBody += getListItem(branch, 'approve');
        }
        issueBody += '\n';
    }
    const awaitingSchedule = branches.filter((branch) => branch.res === common_1.ProcessBranchResult.NotScheduled);
    if (awaitingSchedule.length) {
        issueBody += '## Awaiting Schedule\n\n';
        issueBody +=
            'These updates are awaiting their schedule. Click on a checkbox to ignore the schedule.\n';
        for (const branch of awaitingSchedule) {
            issueBody += getListItem(branch, 'unschedule');
        }
        issueBody += '\n';
    }
    const rateLimited = branches.filter((branch) => branch.res === common_1.ProcessBranchResult.BranchLimitReached ||
        branch.res === common_1.ProcessBranchResult.PrLimitReached ||
        branch.res === common_1.ProcessBranchResult.CommitLimitReached);
    if (rateLimited.length) {
        issueBody += '## Rate Limited\n\n';
        issueBody +=
            'These updates are currently rate limited. Click on a checkbox below to force their creation now.\n\n';
        for (const branch of rateLimited) {
            issueBody += getListItem(branch, 'unlimit');
        }
        issueBody += '\n';
    }
    const errorList = branches.filter((branch) => branch.res === common_1.ProcessBranchResult.Error);
    if (errorList.length) {
        issueBody += '## Errored\n\n';
        issueBody +=
            'These updates encountered an error and will be retried. Click a checkbox below to force a retry now.\n\n';
        for (const branch of errorList) {
            issueBody += getListItem(branch, 'retry');
        }
        issueBody += '\n';
    }
    const awaitingPr = branches.filter((branch) => branch.res === common_1.ProcessBranchResult.NeedsPrApproval);
    if (awaitingPr.length) {
        issueBody += '## PR Creation Approval Required\n\n';
        issueBody +=
            "These branches exist but PRs won't be created until you approve by ticking the checkbox.\n\n";
        for (const branch of awaitingPr) {
            issueBody += getListItem(branch, 'approvePr');
        }
        issueBody += '\n';
    }
    const prEdited = branches.filter((branch) => branch.res === common_1.ProcessBranchResult.PrEdited);
    if (prEdited.length) {
        issueBody += '## Edited/Blocked\n\n';
        issueBody += `These updates have been manually edited so Renovate will no longer make changes. To discard all commits and start over, check the box below.\n\n`;
        for (const branch of prEdited) {
            const pr = await platform_1.platform.getBranchPr(branch.branchName);
            issueBody += getListItem(branch, 'rebase', pr);
        }
        issueBody += '\n';
    }
    const prPending = branches.filter((branch) => branch.res === common_1.ProcessBranchResult.Pending);
    if (prPending.length) {
        issueBody += '## Pending Status Checks\n\n';
        issueBody += `These updates await pending status checks. To force their creation now, check the box below.\n\n`;
        for (const branch of prPending) {
            issueBody += getListItem(branch, 'approvePr');
        }
        issueBody += '\n';
    }
    const otherRes = [
        common_1.ProcessBranchResult.Pending,
        common_1.ProcessBranchResult.NeedsApproval,
        common_1.ProcessBranchResult.NeedsPrApproval,
        common_1.ProcessBranchResult.NotScheduled,
        common_1.ProcessBranchResult.PrLimitReached,
        common_1.ProcessBranchResult.CommitLimitReached,
        common_1.ProcessBranchResult.BranchLimitReached,
        common_1.ProcessBranchResult.AlreadyExisted,
        common_1.ProcessBranchResult.Error,
        common_1.ProcessBranchResult.Automerged,
        common_1.ProcessBranchResult.PrEdited,
    ];
    const inProgress = branches.filter((branch) => !otherRes.includes(branch.res));
    if (inProgress.length) {
        issueBody += '## Open\n\n';
        issueBody +=
            'These updates have all been created already. Click a checkbox below to force a retry/rebase of any.\n\n';
        for (const branch of inProgress) {
            const pr = await platform_1.platform.getBranchPr(branch.branchName);
            issueBody += getListItem(branch, 'rebase', pr);
        }
        if (inProgress.length > 2) {
            issueBody += ' - [ ] ';
            issueBody += '<!-- rebase-all-open-prs -->';
            issueBody +=
                '**Check this option to rebase all the above open PRs at once**';
            issueBody += '\n';
        }
        issueBody += '\n';
    }
    const alreadyExisted = branches.filter((branch) => branch.res === common_1.ProcessBranchResult.AlreadyExisted);
    if (alreadyExisted.length) {
        issueBody += '## Ignored or Blocked\n\n';
        issueBody +=
            'These are blocked by an existing closed PR and will not be recreated unless you click a checkbox below.\n\n';
        for (const branch of alreadyExisted) {
            const pr = await platform_1.platform.findPr({
                branchName: branch.branchName,
                prTitle: branch.prTitle,
                state: types_1.PrState.NotOpen,
            });
            issueBody += getListItem(branch, 'recreate', pr);
        }
        issueBody += '\n';
    }
    if (!hasBranches) {
        issueBody +=
            'This repository currently has no open or pending branches.\n\n';
    }
    if ((_b = config.dependencyDashboardFooter) === null || _b === void 0 ? void 0 : _b.length) {
        issueBody += `---\n${config.dependencyDashboardFooter}\n`;
    }
    if (config.dryRun) {
        logger_1.logger.info('DRY-RUN: Would ensure Dependency Dashboard ' +
            config.dependencyDashboardTitle);
    }
    else {
        await platform_1.platform.ensureIssue({
            title: config.dependencyDashboardTitle,
            reuseTitle,
            body: issueBody,
        });
    }
}
exports.ensureMasterIssue = ensureMasterIssue;
//# sourceMappingURL=dependency-dashboard.js.map