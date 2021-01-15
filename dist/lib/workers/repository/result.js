"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processResult = void 0;
const error_messages_1 = require("../../constants/error-messages");
const logger_1 = require("../../logger");
function processResult(config, res) {
    const disabledStatuses = [
        error_messages_1.REPOSITORY_ARCHIVED,
        error_messages_1.REPOSITORY_BLOCKED,
        error_messages_1.REPOSITORY_CANNOT_FORK,
        error_messages_1.REPOSITORY_DISABLED,
        error_messages_1.REPOSITORY_ACCESS_FORBIDDEN,
        error_messages_1.REPOSITORY_FORKED,
        error_messages_1.REPOSITORY_MIRRORED,
        error_messages_1.MANAGER_NO_PACKAGE_FILES,
        error_messages_1.REPOSITORY_RENAMED,
        error_messages_1.REPOSITORY_UNINITIATED,
        error_messages_1.REPOSITORY_EMPTY,
    ];
    const enabledStatuses = [error_messages_1.CONFIG_SECRETS_EXPOSED, error_messages_1.CONFIG_VALIDATION];
    let status;
    let enabled;
    let onboarded;
    // istanbul ignore next
    if (disabledStatuses.includes(res)) {
        status = 'disabled';
        enabled = false;
    }
    else if (enabledStatuses.includes(res) || config.repoIsOnboarded) {
        status = 'enabled';
        enabled = true;
        onboarded = true;
    }
    else if (config.repoIsOnboarded === false) {
        status = 'onboarding';
        enabled = true;
        onboarded = false;
    }
    else {
        logger_1.logger.debug({ res }, 'Unknown res');
        status = 'unknown';
    }
    return { res, status, enabled, onboarded };
}
exports.processResult = processResult;
//# sourceMappingURL=result.js.map