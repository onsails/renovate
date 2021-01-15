"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRangeStrategy = void 0;
const semver_utils_1 = require("semver-utils");
const logger_1 = require("../../logger");
function getRangeStrategy(config) {
    const { depType, depName, packageJsonType, currentValue, rangeStrategy, } = config;
    const isComplexRange = semver_utils_1.parseRange(currentValue).length > 1;
    if (rangeStrategy === 'bump' && isComplexRange) {
        logger_1.logger.debug({ currentValue }, 'Replacing bump strategy for complex range with widen');
        return 'widen';
    }
    if (rangeStrategy !== 'auto') {
        return rangeStrategy;
    }
    if (depType === 'devDependencies') {
        // Always pin devDependencies
        logger_1.logger.trace({ dependency: depName }, 'Pinning devDependency');
        return 'pin';
    }
    if (depType === 'dependencies' && packageJsonType === 'app') {
        // Pin dependencies if we're pretty sure it's not a browser library
        logger_1.logger.trace({ dependency: depName }, 'Pinning app dependency');
        return 'pin';
    }
    if (depType === 'peerDependencies') {
        // Widen peer dependencies
        logger_1.logger.debug('Widening peer dependencies');
        return 'widen';
    }
    if (isComplexRange) {
        return 'widen';
    }
    return 'replace';
}
exports.getRangeStrategy = getRangeStrategy;
//# sourceMappingURL=range.js.map