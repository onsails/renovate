"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRenovatePRFormat = exports.getBranchNameWithoutRefsPrefix = exports.getBranchNameWithoutRefsheadsPrefix = exports.getGitStatusContextFromCombinedName = exports.getGitStatusContextCombinedName = exports.getNewBranchName = void 0;
const GitInterfaces_1 = require("azure-devops-node-api/interfaces/GitInterfaces");
const logger_1 = require("../../logger");
const types_1 = require("../../types");
function getNewBranchName(branchName) {
    if (branchName && !branchName.startsWith('refs/heads/')) {
        return `refs/heads/${branchName}`;
    }
    return branchName;
}
exports.getNewBranchName = getNewBranchName;
function getGitStatusContextCombinedName(context) {
    if (!context) {
        return undefined;
    }
    const combinedName = `${context.genre ? `${context.genre}/` : ''}${context.name}`;
    logger_1.logger.trace(`Got combined context name of ${combinedName}`);
    return combinedName;
}
exports.getGitStatusContextCombinedName = getGitStatusContextCombinedName;
function getGitStatusContextFromCombinedName(context) {
    if (!context) {
        return undefined;
    }
    let name = context;
    let genre;
    const lastSlash = context.lastIndexOf('/');
    if (lastSlash > 0) {
        name = context.substr(lastSlash + 1);
        genre = context.substr(0, lastSlash);
    }
    return {
        genre,
        name,
    };
}
exports.getGitStatusContextFromCombinedName = getGitStatusContextFromCombinedName;
function getBranchNameWithoutRefsheadsPrefix(branchPath) {
    if (!branchPath) {
        logger_1.logger.error(`getBranchNameWithoutRefsheadsPrefix(${branchPath})`);
        return undefined;
    }
    if (!branchPath.startsWith('refs/heads/')) {
        logger_1.logger.trace(`The refs/heads/ name should have started with 'refs/heads/' but it didn't. (${branchPath})`);
        return branchPath;
    }
    return branchPath.substring(11, branchPath.length);
}
exports.getBranchNameWithoutRefsheadsPrefix = getBranchNameWithoutRefsheadsPrefix;
function getBranchNameWithoutRefsPrefix(branchPath) {
    if (!branchPath) {
        logger_1.logger.error(`getBranchNameWithoutRefsPrefix(${branchPath})`);
        return undefined;
    }
    if (!branchPath.startsWith('refs/')) {
        logger_1.logger.trace(`The ref name should have started with 'refs/' but it didn't. (${branchPath})`);
        return branchPath;
    }
    return branchPath.substring(5, branchPath.length);
}
exports.getBranchNameWithoutRefsPrefix = getBranchNameWithoutRefsPrefix;
function getRenovatePRFormat(azurePr) {
    var _a;
    const number = azurePr.pullRequestId;
    const displayNumber = `Pull Request #${number}`;
    const sourceBranch = getBranchNameWithoutRefsheadsPrefix(azurePr.sourceRefName);
    const targetBranch = getBranchNameWithoutRefsheadsPrefix(azurePr.targetRefName);
    const body = azurePr.description;
    const createdAt = (_a = azurePr.creationDate) === null || _a === void 0 ? void 0 : _a.toISOString();
    const state = {
        [GitInterfaces_1.PullRequestStatus.Abandoned]: types_1.PrState.Closed,
        [GitInterfaces_1.PullRequestStatus.Completed]: types_1.PrState.Merged,
    }[azurePr.status] || types_1.PrState.Open;
    const sourceRefName = azurePr.sourceRefName;
    const isConflicted = azurePr.mergeStatus === GitInterfaces_1.PullRequestAsyncStatus.Conflicts;
    return {
        ...azurePr,
        sourceBranch,
        state,
        number,
        displayNumber,
        body,
        sourceRefName,
        targetBranch,
        createdAt,
        ...(isConflicted && { isConflicted }),
    };
}
exports.getRenovatePRFormat = getRenovatePRFormat;
//# sourceMappingURL=util.js.map