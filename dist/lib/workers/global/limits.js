"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLimitReached = exports.incLimitedValue = exports.setMaxLimit = exports.resetAllLimits = exports.Limit = void 0;
const logger_1 = require("../../logger");
var Limit;
(function (Limit) {
    Limit["Commits"] = "Commits";
    Limit["PullRequests"] = "PullRequests";
    Limit["Branches"] = "Branches";
})(Limit = exports.Limit || (exports.Limit = {}));
const limits = new Map();
function resetAllLimits() {
    limits.clear();
}
exports.resetAllLimits = resetAllLimits;
function setMaxLimit(key, val) {
    const max = typeof val === 'number' ? Math.max(0, val) : null;
    limits.set(key, { current: 0, max });
    logger_1.logger.debug(`${key} limit = ${max}`);
}
exports.setMaxLimit = setMaxLimit;
function incLimitedValue(key, incBy = 1) {
    const limit = limits.get(key) || { max: null, current: 0 };
    limits.set(key, {
        ...limit,
        current: limit.current + incBy,
    });
}
exports.incLimitedValue = incLimitedValue;
function isLimitReached(key) {
    const limit = limits.get(key);
    if (!limit || limit.max === null) {
        return false;
    }
    const { max, current } = limit;
    return max - current <= 0;
}
exports.isLimitReached = isLimitReached;
//# sourceMappingURL=limits.js.map