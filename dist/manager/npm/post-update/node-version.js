"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNodeConstraint = void 0;
const semver_1 = require("semver");
const logger_1 = require("../../../logger");
const fs_1 = require("../../../util/fs");
const node_1 = require("../../../versioning/node");
async function getNodeFile(filename) {
    try {
        const constraint = (await fs_1.readLocalFile(filename, 'utf8'))
            .split('\n')[0]
            .replace(/^v/, '');
        if (semver_1.validRange(constraint)) {
            logger_1.logger.debug(`Using node constraint "${constraint}" from ${filename}`);
            return constraint;
        }
    }
    catch (err) {
        // do nothing
    }
    return null;
}
function getPackageJsonConstraint(config) {
    var _a;
    const constraint = (_a = config.constraints) === null || _a === void 0 ? void 0 : _a.node;
    if (constraint && semver_1.validRange(constraint)) {
        logger_1.logger.debug(`Using node constraint "${constraint}" from package.json`);
        return constraint;
    }
    return null;
}
async function getNodeConstraint(config) {
    const { packageFile } = config;
    let constraint = (await getNodeFile(fs_1.getSiblingFileName(packageFile, '.nvmrc'))) ||
        (await getNodeFile(fs_1.getSiblingFileName(packageFile, '.node-version'))) ||
        getPackageJsonConstraint(config);
    // Avoid using node 15 if node 14 also satisfies the same constraint
    // Remove this once node 16 is LTS
    if (constraint) {
        if (semver_1.validRange(constraint) &&
            semver_1.satisfies('14.100.0', constraint) &&
            semver_1.satisfies('15.100.0', constraint) &&
            !node_1.isStable('16.100.0') && // this should return false as soon as Node 16 is LTS
            semver_1.validRange(`${constraint} <15`)) {
            logger_1.logger.debug('Augmenting constraint to avoid node 15');
            constraint = `${constraint} <15`;
        }
    }
    else {
        logger_1.logger.debug('No node constraint found - using latest');
    }
    return constraint;
}
exports.getNodeConstraint = getNodeConstraint;
//# sourceMappingURL=node-version.js.map