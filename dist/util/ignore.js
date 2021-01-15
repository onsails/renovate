"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSkipComment = void 0;
const logger_1 = require("../logger");
function isSkipComment(comment) {
    if (/^(renovate|pyup):/.test(comment)) {
        const command = comment.split('#')[0].split(':')[1].trim();
        if (command === 'ignore') {
            return true;
        }
        logger_1.logger.debug('Unknown comment command: ' + command);
    }
    return false;
}
exports.isSkipComment = isSkipComment;
//# sourceMappingURL=ignore.js.map