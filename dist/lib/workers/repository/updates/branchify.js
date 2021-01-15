"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchifyUpgrades = void 0;
const logger_1 = require("../../../logger");
const changelog_1 = require("../changelog");
const flatten_1 = require("./flatten");
const generate_1 = require("./generate");
async function branchifyUpgrades(config, packageFiles) {
    logger_1.logger.debug('branchifyUpgrades');
    const updates = await flatten_1.flattenUpdates(config, packageFiles);
    logger_1.logger.debug(`${updates.length} flattened updates found: ${updates
        .map((u) => u.depName)
        .filter((txt) => txt === null || txt === void 0 ? void 0 : txt.length)
        .join(', ')}`);
    const errors = [];
    const warnings = [];
    const branchUpgrades = {};
    const branches = [];
    for (const u of updates) {
        const update = { ...u };
        branchUpgrades[update.branchName] = branchUpgrades[update.branchName] || [];
        branchUpgrades[update.branchName] = [update].concat(branchUpgrades[update.branchName]);
    }
    logger_1.logger.debug(`Returning ${Object.keys(branchUpgrades).length} branch(es)`);
    if (config.fetchReleaseNotes) {
        await changelog_1.embedChangelogs(branchUpgrades);
    }
    for (const branchName of Object.keys(branchUpgrades)) {
        // Add branch name to metadata before generating branch config
        logger_1.addMeta({
            branch: branchName,
        });
        const seenUpdates = {};
        // Filter out duplicates
        branchUpgrades[branchName] = branchUpgrades[branchName]
            .reverse()
            .filter((upgrade) => {
            const { manager, packageFile, depName, currentValue, newValue, } = upgrade;
            const upgradeKey = `${packageFile}:${depName}:${currentValue}`;
            const previousNewValue = seenUpdates[upgradeKey];
            if (previousNewValue && previousNewValue !== newValue) {
                logger_1.logger.info({
                    manager,
                    packageFile,
                    depName,
                    currentValue,
                    previousNewValue,
                    thisNewValue: newValue,
                }, 'Ignoring upgrade collision');
                return false;
            }
            seenUpdates[upgradeKey] = newValue;
            return true;
        })
            .reverse();
        const branch = generate_1.generateBranchConfig(branchUpgrades[branchName]);
        branch.branchName = branchName;
        branch.packageFiles = packageFiles;
        branches.push(branch);
    }
    logger_1.removeMeta(['branch']);
    logger_1.logger.debug(`config.repoIsOnboarded=${config.repoIsOnboarded}`);
    const branchList = config.repoIsOnboarded
        ? branches.map((upgrade) => upgrade.branchName)
        : config.branchList;
    // istanbul ignore next
    try {
        // Here we check if there are updates from the same source repo
        // that are not grouped into the same branch
        const branchUpdates = {};
        for (const branch of branches) {
            const { sourceUrl, branchName, depName, toVersion } = branch;
            if (sourceUrl && toVersion) {
                const key = `${sourceUrl}|${toVersion}`;
                branchUpdates[key] = branchUpdates[key] || {};
                if (!branchUpdates[key][branchName]) {
                    branchUpdates[key][branchName] = depName;
                }
            }
        }
        for (const [key, value] of Object.entries(branchUpdates)) {
            if (Object.keys(value).length > 1) {
                const [sourceUrl, toVersion] = key.split('|');
                logger_1.logger.debug({ sourceUrl, toVersion, branches: value }, 'Found sourceUrl with multiple branches that should probably be combined into a group');
            }
        }
    }
    catch (err) {
        logger_1.logger.debug({ err }, 'Error checking branch duplicates');
    }
    return {
        errors: config.errors.concat(errors),
        warnings: config.warnings.concat(warnings),
        branches,
        branchList,
    };
}
exports.branchifyUpgrades = branchifyUpgrades;
//# sourceMappingURL=branchify.js.map