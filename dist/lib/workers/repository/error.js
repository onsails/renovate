"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_messages_1 = require("../../constants/error-messages");
const logger_1 = require("../../logger");
const external_host_error_1 = require("../../types/errors/external-host-error");
const error_config_1 = require("./error-config");
async function handleError(config, err) {
    if (err.message === error_messages_1.REPOSITORY_UNINITIATED) {
        logger_1.logger.info('Repository is uninitiated - skipping');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message === error_messages_1.REPOSITORY_EMPTY) {
        logger_1.logger.info('Repository is empty - skipping');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message === error_messages_1.REPOSITORY_DISABLED) {
        logger_1.logger.info('Repository is disabled - skipping');
        return err.message;
    }
    if (err.message === error_messages_1.REPOSITORY_ARCHIVED) {
        logger_1.logger.info('Repository is archived - skipping');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message === error_messages_1.REPOSITORY_MIRRORED) {
        logger_1.logger.info('Repository is a mirror - skipping');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message === error_messages_1.REPOSITORY_RENAMED) {
        logger_1.logger.info('Repository has been renamed - skipping');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message === error_messages_1.REPOSITORY_BLOCKED) {
        delete config.branchList; // eslint-disable-line no-param-reassign
        logger_1.logger.info('Repository is blocked - skipping');
        return err.message;
    }
    if (err.message === error_messages_1.REPOSITORY_ACCESS_FORBIDDEN) {
        delete config.branchList; // eslint-disable-line no-param-reassign
        logger_1.logger.info('Repository is forbidden');
        return err.message;
    }
    if (err.message === error_messages_1.REPOSITORY_NOT_FOUND) {
        delete config.branchList; // eslint-disable-line no-param-reassign
        logger_1.logger.error('Repository is not found');
        return err.message;
    }
    if (err.message === error_messages_1.REPOSITORY_FORKED) {
        logger_1.logger.info('Repository is a fork and not manually configured - skipping');
        return err.message;
    }
    if (err.message === error_messages_1.REPOSITORY_CANNOT_FORK) {
        logger_1.logger.info('Cannot fork repository - skipping');
        return err.message;
    }
    if (err.message === error_messages_1.MANAGER_NO_PACKAGE_FILES) {
        logger_1.logger.info('Repository has no package files - skipping');
        return err.message;
    }
    if (err.message === error_messages_1.REPOSITORY_NO_VULNERABILITY) {
        logger_1.logger.info('Repository has no vulnerability alerts - skipping');
        return err.message;
    }
    if (err.message === error_messages_1.REPOSITORY_CHANGED) {
        logger_1.logger.info('Repository has changed during renovation - aborting');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message === error_messages_1.CONFIG_VALIDATION) {
        delete config.branchList; // eslint-disable-line no-param-reassign
        logger_1.logger.info({ error: err }, 'Repository has invalid config');
        await error_config_1.raiseConfigWarningIssue(config, err);
        return err.message;
    }
    if (err.message === error_messages_1.CONFIG_SECRETS_EXPOSED) {
        delete config.branchList; // eslint-disable-line no-param-reassign
        logger_1.logger.warn({ error: err }, 'Repository aborted due to potential secrets exposure');
        return err.message;
    }
    if (err instanceof external_host_error_1.ExternalHostError) {
        logger_1.logger.warn({ hostType: err.hostType, lookupName: err.lookupName, err: err.err }, 'Host error');
        logger_1.logger.info('External host error causing abort - skipping');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message.includes('No space left on device') ||
        err.message === error_messages_1.SYSTEM_INSUFFICIENT_DISK_SPACE) {
        logger_1.logger.error('Disk space error - skipping');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message === error_messages_1.PLATFORM_RATE_LIMIT_EXCEEDED) {
        logger_1.logger.warn('Rate limit exceeded - aborting');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message === error_messages_1.SYSTEM_INSUFFICIENT_MEMORY) {
        logger_1.logger.warn('Insufficient memory - aborting');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message === error_messages_1.PLATFORM_BAD_CREDENTIALS) {
        logger_1.logger.warn('Bad credentials - aborting');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message === error_messages_1.PLATFORM_INTEGRATION_UNAUTHORIZED) {
        logger_1.logger.warn('Integration unauthorized - aborting');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message === error_messages_1.PLATFORM_AUTHENTICATION_ERROR) {
        logger_1.logger.warn('Authentication error - aborting');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message === error_messages_1.REPOSITORY_TEMPORARY_ERROR) {
        logger_1.logger.info('Temporary error - aborting');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message === error_messages_1.MANAGER_LOCKFILE_ERROR) {
        delete config.branchList; // eslint-disable-line no-param-reassign
        logger_1.logger.info('Lock file error - aborting');
        delete config.branchList; // eslint-disable-line no-param-reassign
        return err.message;
    }
    if (err.message.includes('The requested URL returned error: 5')) {
        logger_1.logger.warn({ err }, 'Git error - aborting');
        delete config.branchList; // eslint-disable-line no-param-reassign
        // rewrite this error
        return error_messages_1.EXTERNAL_HOST_ERROR;
    }
    if (err.message.includes('remote end hung up unexpectedly') ||
        err.message.includes('access denied or repository not exported')) {
        logger_1.logger.warn({ err }, 'Git error - aborting');
        delete config.branchList; // eslint-disable-line no-param-reassign
        // rewrite this error
        return error_messages_1.EXTERNAL_HOST_ERROR;
    }
    if (err.message.includes('fatal: not a git repository')) {
        delete config.branchList; // eslint-disable-line no-param-reassign
        return error_messages_1.REPOSITORY_TEMPORARY_ERROR;
    }
    // Swallow this error so that other repositories can be processed
    logger_1.logger.error({ err }, `Repository has unknown error`);
    // delete branchList to avoid cleaning up branches
    delete config.branchList; // eslint-disable-line no-param-reassign
    // eslint-disable-next-line no-undef
    return error_messages_1.UNKNOWN_ERROR;
}
exports.default = handleError;
//# sourceMappingURL=error.js.map