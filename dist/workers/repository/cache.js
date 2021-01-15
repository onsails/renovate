"use strict";
/* istanbul ignore file */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBranchCache = void 0;
const logger_1 = require("../../logger");
const platform_1 = require("../../platform");
const repository_1 = require("../../util/cache/repository");
const git_1 = require("../../util/git");
function generateBranchUpgradeCache(upgrade) {
    const { datasource, depName, lookupName, fixedVersion, fromVersion, toVersion, currentDigest, newDigest, sourceUrl, } = upgrade;
    return {
        datasource,
        depName,
        lookupName,
        fixedVersion,
        fromVersion,
        toVersion,
        currentDigest,
        newDigest,
        sourceUrl,
    };
}
async function generateBranchCache(branch) {
    const { branchName } = branch;
    try {
        const sha = git_1.getBranchCommit(branchName) || null;
        let prNo = null;
        let parentSha = null;
        if (sha) {
            parentSha = await git_1.getBranchParentSha(branchName);
            const branchPr = await platform_1.platform.getBranchPr(branchName);
            if (branchPr) {
                prNo = branchPr.number;
            }
        }
        const automerge = !!branch.automerge;
        let isModified = false;
        if (sha) {
            try {
                isModified = await git_1.isBranchModified(branchName);
            }
            catch (err) /* istanbul ignore next */ {
                // Do nothing
            }
        }
        const upgrades = branch.upgrades
            ? branch.upgrades.map(generateBranchUpgradeCache)
            : [];
        return {
            branchName,
            sha,
            parentSha,
            prNo,
            automerge,
            isModified,
            upgrades,
        };
    }
    catch (err) {
        logger_1.logger.error({ err, branchName }, 'Error generating branch cache');
        return null;
    }
}
async function setBranchCache(branches) {
    const branchCache = [];
    for (const branch of branches) {
        branchCache.push(await generateBranchCache(branch));
    }
    repository_1.getCache().branches = branchCache.filter(Boolean);
}
exports.setBranchCache = setBranchCache;
//# sourceMappingURL=cache.js.map