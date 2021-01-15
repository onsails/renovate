"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortBranches = void 0;
const logger_1 = require("../../../logger");
function sortBranches(branches) {
    // Sort branches
    const sortOrder = [
        'pin',
        'digest',
        'patch',
        'minor',
        'major',
        'lockFileMaintenance',
    ];
    logger_1.logger.trace({ branches }, 'branches');
    branches.sort((a, b) => {
        if (a.prPriority !== b.prPriority) {
            return b.prPriority - a.prPriority;
        }
        const sortDiff = sortOrder.indexOf(a.updateType) - sortOrder.indexOf(b.updateType);
        if (sortDiff !== 0) {
            return sortDiff;
        }
        // Sort by prTitle if updateType is the same
        return a.prTitle < b.prTitle ? -1 : 1;
    });
}
exports.sortBranches = sortBranches;
//# sourceMappingURL=sort.js.map