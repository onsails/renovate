"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupUpdates = void 0;
const datasource_1 = require("../../../../datasource");
const datasourceGitSubmodules = __importStar(require("../../../../datasource/git-submodules"));
const logger_1 = require("../../../../logger");
const manager_1 = require("../../../../manager");
const types_1 = require("../../../../types");
const clone_1 = require("../../../../util/clone");
const package_rules_1 = require("../../../../util/package-rules");
const allVersioning = __importStar(require("../../../../versioning"));
const filter_1 = require("./filter");
const rollback_1 = require("./rollback");
function getType(config, fromVersion, toVersion) {
    const { versioning, rangeStrategy, currentValue } = config;
    const version = allVersioning.get(versioning);
    if (rangeStrategy === 'bump' && version.matches(toVersion, currentValue)) {
        return 'bump';
    }
    if (version.getMajor(toVersion) > version.getMajor(fromVersion)) {
        return 'major';
    }
    if (version.getMinor(toVersion) > version.getMinor(fromVersion)) {
        return 'minor';
    }
    if (config.separateMinorPatch) {
        return 'patch';
    }
    if (config.patch.automerge && !config.minor.automerge) {
        return 'patch';
    }
    return 'minor';
}
function getFromVersion(config, rangeStrategy, latestVersion, allVersions) {
    const { currentValue, lockedVersion, versioning } = config;
    const version = allVersioning.get(versioning);
    if (version.isVersion(currentValue)) {
        return currentValue;
    }
    if (version.isSingleVersion(currentValue)) {
        return currentValue.replace(/=/g, '').trim();
    }
    logger_1.logger.trace(`currentValue ${currentValue} is range`);
    let useVersions = allVersions.filter((v) => version.matches(v, currentValue));
    if (latestVersion && version.matches(latestVersion, currentValue)) {
        useVersions = useVersions.filter((v) => !version.isGreaterThan(v, latestVersion));
    }
    if (rangeStrategy === 'pin') {
        return (lockedVersion || version.getSatisfyingVersion(useVersions, currentValue));
    }
    if (rangeStrategy === 'bump') {
        // Use the lowest version in the current range
        return version.minSatisfyingVersion(useVersions, currentValue);
    }
    // Use the highest version in the current range
    return version.getSatisfyingVersion(useVersions, currentValue);
}
function getBucket(config, update) {
    const { separateMajorMinor, separateMultipleMajor } = config;
    const { updateType, newMajor } = update;
    if (updateType === 'lockfileUpdate') {
        return updateType;
    }
    if (!separateMajorMinor ||
        config.major.automerge === true ||
        (config.automerge && config.major.automerge !== false)) {
        return 'latest';
    }
    if (separateMultipleMajor && updateType === 'major') {
        return `major-${newMajor}`;
    }
    return updateType;
}
async function lookupUpdates(inconfig) {
    var _a;
    let config = { ...inconfig };
    const { depName, currentValue, lockedVersion, vulnerabilityAlert } = config;
    logger_1.logger.trace({ dependency: depName, currentValue }, 'lookupUpdates');
    const version = allVersioning.get(config.versioning);
    const res = { updates: [], warnings: [] };
    const isValid = currentValue && version.isValid(currentValue);
    if (!isValid) {
        res.skipReason = types_1.SkipReason.InvalidValue;
    }
    // Record if the dep is fixed to a version
    if (lockedVersion) {
        res.fixedVersion = lockedVersion;
    }
    else if (currentValue && version.isSingleVersion(currentValue)) {
        res.fixedVersion = currentValue.replace(/^=+/, '');
    }
    // istanbul ignore if
    if (!datasource_1.isGetPkgReleasesConfig(config)) {
        res.skipReason = types_1.SkipReason.Unknown;
        return res;
    }
    if (isValid) {
        const dependency = clone_1.clone(await datasource_1.getPkgReleases(config));
        if (!dependency) {
            // If dependency lookup fails then warn and return
            const warning = {
                depName,
                message: `Failed to look up dependency ${depName}`,
            };
            logger_1.logger.debug({ dependency: depName, packageFile: config.packageFile }, warning.message);
            // TODO: return warnings in own field
            res.warnings.push(warning);
            return res;
        }
        if (dependency.deprecationMessage) {
            logger_1.logger.debug({ dependency: depName }, 'Found deprecationMessage');
            res.deprecationMessage = dependency.deprecationMessage;
        }
        res.sourceUrl = dependency === null || dependency === void 0 ? void 0 : dependency.sourceUrl;
        if (dependency.sourceDirectory) {
            res.sourceDirectory = dependency.sourceDirectory;
        }
        res.homepage = dependency.homepage;
        res.changelogUrl = dependency.changelogUrl;
        res.dependencyUrl = dependency === null || dependency === void 0 ? void 0 : dependency.dependencyUrl;
        // TODO: improve this
        // istanbul ignore if
        if (dependency.dockerRegistry) {
            res.dockerRegistry = dependency.dockerRegistry;
            res.dockerRepository = dependency.dockerRepository;
        }
        const { latestVersion, releases } = dependency;
        // Filter out any results from datasource that don't comply with our versioning
        let allVersions = releases.filter((release) => version.isVersion(release.version));
        // istanbul ignore if
        if (allVersions.length === 0) {
            const message = `Found no results from datasource that look like a version`;
            logger_1.logger.debug({ dependency: depName, result: dependency }, message);
            if (!config.currentDigest) {
                return res;
            }
        }
        // Reapply package rules in case we missed something from sourceUrl
        config = package_rules_1.applyPackageRules({ ...config, sourceUrl: res.sourceUrl });
        if (config.followTag) {
            const taggedVersion = dependency.tags[config.followTag];
            if (!taggedVersion) {
                res.warnings.push({
                    depName,
                    message: `Can't find version with tag ${config.followTag} for ${depName}`,
                });
                return res;
            }
            allVersions = allVersions.filter((v) => v.version === taggedVersion ||
                (v.version === currentValue &&
                    version.isGreaterThan(taggedVersion, currentValue)));
        }
        // Check that existing constraint can be satisfied
        const allSatisfyingVersions = allVersions.filter((v) => version.matches(v.version, currentValue));
        if (config.rollbackPrs && !allSatisfyingVersions.length) {
            const rollback = rollback_1.getRollbackUpdate(config, allVersions);
            // istanbul ignore if
            if (!rollback) {
                res.warnings.push({
                    depName,
                    message: `Can't find version matching ${currentValue} for ${depName}`,
                });
                return res;
            }
            res.updates.push(rollback);
        }
        let rangeStrategy = manager_1.getRangeStrategy(config);
        // istanbul ignore next
        if (vulnerabilityAlert &&
            rangeStrategy === 'update-lockfile' &&
            !lockedVersion) {
            rangeStrategy = 'bump';
        }
        const nonDeprecatedVersions = releases
            .filter((release) => !release.isDeprecated)
            .map((release) => release.version);
        const fromVersion = getFromVersion(config, rangeStrategy, latestVersion, nonDeprecatedVersions) ||
            getFromVersion(config, rangeStrategy, latestVersion, allVersions.map((v) => v.version));
        if (fromVersion &&
            rangeStrategy === 'pin' &&
            !version.isSingleVersion(currentValue)) {
            res.updates.push({
                updateType: 'pin',
                isPin: true,
                newValue: version.getNewValue({
                    currentValue,
                    rangeStrategy,
                    fromVersion,
                    toVersion: fromVersion,
                }),
                newMajor: version.getMajor(fromVersion),
            });
        }
        let filterStart = fromVersion;
        if (lockedVersion && rangeStrategy === 'update-lockfile') {
            // Look for versions greater than the current locked version that still satisfy the package.json range
            filterStart = lockedVersion;
        }
        // Filter latest, unstable, etc
        let filteredVersions = filter_1.filterVersions(config, filterStart, dependency.latestVersion, allVersions).filter((v) => 
        // Leave only compatible versions
        version.isCompatible(v.version, currentValue));
        if (vulnerabilityAlert) {
            filteredVersions = filteredVersions.slice(0, 1);
        }
        const buckets = {};
        for (const toVersion of filteredVersions.map((v) => v.version)) {
            const update = { fromVersion, toVersion };
            try {
                update.newValue = version.getNewValue({
                    currentValue,
                    rangeStrategy,
                    fromVersion,
                    toVersion,
                });
            }
            catch (err) /* istanbul ignore next */ {
                logger_1.logger.warn({ err, currentValue, rangeStrategy, fromVersion, toVersion }, 'getNewValue error');
                update.newValue = currentValue;
            }
            if (!update.newValue || update.newValue === currentValue) {
                if (!config.lockedVersion) {
                    continue; // eslint-disable-line no-continue
                }
                // istanbul ignore if
                if (rangeStrategy === 'bump') {
                    logger_1.logger.trace({ depName, currentValue, lockedVersion, toVersion }, 'Skipping bump because newValue is the same');
                    continue; // eslint-disable-line no-continue
                }
                update.updateType = 'lockfileUpdate';
                update.fromVersion = lockedVersion;
                update.displayFrom = lockedVersion;
                update.displayTo = toVersion;
                update.isSingleVersion = true;
            }
            update.newMajor = version.getMajor(toVersion);
            update.newMinor = version.getMinor(toVersion);
            update.updateType =
                update.updateType || getType(config, update.fromVersion, toVersion);
            update.isSingleVersion =
                update.isSingleVersion || !!version.isSingleVersion(update.newValue);
            if (!version.isVersion(update.newValue)) {
                update.isRange = true;
            }
            const updateRelease = releases.find((release) => version.equals(release.version, toVersion));
            // TODO: think more about whether to just Object.assign this
            const releaseFields = ['releaseTimestamp', 'newDigest'];
            releaseFields.forEach((field) => {
                if (updateRelease[field] !== undefined) {
                    update[field] = updateRelease[field];
                }
            });
            const bucket = getBucket(config, update);
            if (buckets[bucket]) {
                if (version.isGreaterThan(update.toVersion, buckets[bucket].toVersion)) {
                    buckets[bucket] = update;
                }
            }
            else {
                buckets[bucket] = update;
            }
        }
        res.updates = res.updates.concat(Object.values(buckets));
    }
    else if (!currentValue) {
        res.skipReason = types_1.SkipReason.UnsupportedValue;
    }
    else {
        logger_1.logger.debug(`Dependency ${depName} has unsupported value ${currentValue}`);
        if (!config.pinDigests && !config.currentDigest) {
            res.skipReason = types_1.SkipReason.UnsupportedValue;
        }
        else {
            delete res.skipReason;
        }
    }
    // Add digests if necessary
    if (config.newDigest || datasource_1.supportsDigests(config)) {
        if (config.currentDigest &&
            config.datasource !== datasourceGitSubmodules.id) {
            if (!config.digestOneAndOnly || !res.updates.length) {
                // digest update
                res.updates.push({
                    updateType: 'digest',
                    newValue: config.currentValue,
                });
            }
        }
        else if (config.pinDigests) {
            // Create a pin only if one doesn't already exists
            if (!res.updates.some((update) => update.updateType === 'pin')) {
                // pin digest
                res.updates.push({
                    updateType: 'pin',
                    newValue: config.currentValue,
                });
            }
        }
        else if (config.datasource === datasourceGitSubmodules.id) {
            const dependency = clone_1.clone(await datasource_1.getPkgReleases(config));
            if ((_a = dependency === null || dependency === void 0 ? void 0 : dependency.releases[0]) === null || _a === void 0 ? void 0 : _a.version) {
                res.updates.push({
                    updateType: 'digest',
                    newValue: dependency.releases[0].version,
                });
            }
        }
        if (version.valueToVersion) {
            for (const update of res.updates || []) {
                update.newVersion = version.valueToVersion(update.newValue);
                update.fromVersion = version.valueToVersion(update.fromVersion);
                update.toVersion = version.valueToVersion(update.toVersion);
            }
        }
        // update digest for all
        for (const update of res.updates) {
            if (config.pinDigests || config.currentDigest) {
                update.newDigest =
                    update.newDigest || (await datasource_1.getDigest(config, update.newValue));
                if (update.newDigest) {
                    update.newDigestShort = update.newDigest
                        .replace('sha256:', '')
                        .substring(0, 7);
                }
                else {
                    logger_1.logger.debug({ newValue: update.newValue }, 'Could not getDigest');
                }
            }
        }
    }
    for (const update of res.updates) {
        const { updateType, fromVersion, toVersion } = update;
        if (['bump', 'lockfileUpdate'].includes(updateType)) {
            update[updateType === 'bump' ? 'isBump' : 'isLockfileUpdate'] = true;
            if (version.getMajor(toVersion) > version.getMajor(fromVersion)) {
                update.updateType = 'major';
            }
            else if (config.separateMinorPatch &&
                version.getMinor(toVersion) === version.getMinor(fromVersion)) {
                update.updateType = 'patch';
            }
            else {
                update.updateType = 'minor';
            }
        }
    }
    if (res.updates.length) {
        delete res.skipReason;
    }
    // Strip out any non-changed ones
    res.updates = res.updates
        .filter((update) => update.newDigest !== null)
        .filter((update) => update.newValue !== config.currentValue ||
        update.isLockfileUpdate ||
        (update.newDigest && !update.newDigest.startsWith(config.currentDigest)));
    if (res.updates.some((update) => update.updateType === 'pin')) {
        for (const update of res.updates) {
            if (update.updateType !== 'pin' && update.updateType !== 'rollback') {
                update.blockedByPin = true;
            }
        }
    }
    return res;
}
exports.lookupUpdates = lookupUpdates;
//# sourceMappingURL=index.js.map