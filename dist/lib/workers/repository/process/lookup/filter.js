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
exports.filterVersions = void 0;
const semver = __importStar(require("semver"));
const error_messages_1 = require("../../../../constants/error-messages");
const logger_1 = require("../../../../logger");
const regex_1 = require("../../../../util/regex");
const allVersioning = __importStar(require("../../../../versioning"));
const npmVersioning = __importStar(require("../../../../versioning/npm"));
const pep440 = __importStar(require("../../../../versioning/pep440"));
const poetryVersioning = __importStar(require("../../../../versioning/poetry"));
function filterVersions(config, fromVersion, latestVersion, releases) {
    const { ignoreUnstable, ignoreDeprecated, respectLatest, allowedVersions, } = config;
    let versioning;
    function isVersionStable(version) {
        if (!versioning.isStable(version)) {
            return false;
        }
        // Check if the datasource returned isStable = false
        const release = releases.find((r) => r.version === version);
        if ((release === null || release === void 0 ? void 0 : release.isStable) === false) {
            return false;
        }
        return true;
    }
    versioning = allVersioning.get(config.versioning);
    if (!fromVersion) {
        return [];
    }
    // Leave only versions greater than current
    let filteredVersions = releases.filter((v) => versioning.isGreaterThan(v.version, fromVersion));
    // Don't upgrade from non-deprecated to deprecated
    const fromRelease = releases.find((release) => release.version === fromVersion);
    if (ignoreDeprecated && fromRelease && !fromRelease.isDeprecated) {
        filteredVersions = filteredVersions.filter((v) => {
            const versionRelease = releases.find((release) => release.version === v.version);
            if (versionRelease.isDeprecated) {
                logger_1.logger.debug(`Skipping ${config.depName}@${v.version} because it is deprecated`);
                return false;
            }
            return true;
        });
    }
    if (allowedVersions) {
        if (regex_1.isConfigRegex(allowedVersions)) {
            const isAllowed = regex_1.configRegexPredicate(allowedVersions);
            filteredVersions = filteredVersions.filter(({ version }) => isAllowed(version));
        }
        else if (versioning.isValid(allowedVersions)) {
            filteredVersions = filteredVersions.filter((v) => versioning.matches(v.version, allowedVersions));
        }
        else if (config.versioning !== npmVersioning.id &&
            semver.validRange(allowedVersions)) {
            logger_1.logger.debug({ depName: config.depName }, 'Falling back to npm semver syntax for allowedVersions');
            filteredVersions = filteredVersions.filter((v) => semver.satisfies(semver.coerce(v.version), allowedVersions));
        }
        else if (config.versioning === poetryVersioning.id &&
            pep440.isValid(allowedVersions)) {
            logger_1.logger.debug({ depName: config.depName }, 'Falling back to pypi syntax for allowedVersions');
            filteredVersions = filteredVersions.filter((v) => pep440.matches(v.version, allowedVersions));
        }
        else {
            const error = new Error(error_messages_1.CONFIG_VALIDATION);
            error.configFile = 'config';
            error.validationError = 'Invalid `allowedVersions`';
            error.validationMessage =
                'The following allowedVersions does not parse as a valid version or range: ' +
                    JSON.stringify(allowedVersions);
            throw error;
        }
    }
    // Return all versions if we aren't ignore unstable. Also ignore latest
    if (config.followTag || ignoreUnstable === false) {
        return filteredVersions;
    }
    // if current is unstable then allow unstable in the current major only
    if (!isVersionStable(fromVersion)) {
        // Allow unstable only in current major
        return filteredVersions.filter((v) => isVersionStable(v.version) ||
            (versioning.getMajor(v.version) === versioning.getMajor(fromVersion) &&
                versioning.getMinor(v.version) === versioning.getMinor(fromVersion) &&
                versioning.getPatch(v.version) === versioning.getPatch(fromVersion)));
    }
    // Normal case: remove all unstable
    filteredVersions = filteredVersions.filter((v) => isVersionStable(v.version));
    // Filter the latest
    // No filtering if no latest
    // istanbul ignore if
    if (!latestVersion) {
        return filteredVersions;
    }
    // No filtering if not respecting latest
    if (respectLatest === false) {
        return filteredVersions;
    }
    // No filtering if fromVersion is already past latest
    if (versioning.isGreaterThan(fromVersion, latestVersion)) {
        return filteredVersions;
    }
    return filteredVersions.filter((v) => !versioning.isGreaterThan(v.version, latestVersion));
}
exports.filterVersions = filterVersions;
//# sourceMappingURL=filter.js.map