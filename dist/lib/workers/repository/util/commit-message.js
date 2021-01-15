"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCommitMessagePrefix = exports.COMMIT_MESSAGE_PREFIX_SEPARATOR = void 0;
exports.COMMIT_MESSAGE_PREFIX_SEPARATOR = ':';
const formatCommitMessagePrefix = (commitMessagePrefix) => `${commitMessagePrefix}${commitMessagePrefix.endsWith(exports.COMMIT_MESSAGE_PREFIX_SEPARATOR)
    ? ''
    : exports.COMMIT_MESSAGE_PREFIX_SEPARATOR}`;
exports.formatCommitMessagePrefix = formatCommitMessagePrefix;
//# sourceMappingURL=commit-message.js.map