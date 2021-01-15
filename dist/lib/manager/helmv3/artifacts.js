"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateArtifacts = void 0;
const shlex_1 = require("shlex");
const logger_1 = require("../../logger");
const exec_1 = require("../../util/exec");
const fs_1 = require("../../util/fs");
async function helmUpdate(manifestPath) {
    const cmd = `helm dependency update ${shlex_1.quote(fs_1.getSubDirectory(manifestPath))}`;
    const execOptions = {
        docker: {
            image: 'renovate/helm',
        },
    };
    await exec_1.exec(cmd, execOptions);
}
async function updateArtifacts({ packageFileName, updatedDeps, newPackageFileContent, config, }) {
    logger_1.logger.debug(`helmv3.updateArtifacts(${packageFileName})`);
    const isLockFileMaintenance = config.updateType === 'lockFileMaintenance';
    if (!isLockFileMaintenance &&
        (updatedDeps === undefined || updatedDeps.length < 1)) {
        logger_1.logger.debug('No updated helmv3 deps - returning null');
        return null;
    }
    const lockFileName = fs_1.getSiblingFileName(packageFileName, 'Chart.lock');
    const existingLockFileContent = await fs_1.readLocalFile(lockFileName);
    if (!existingLockFileContent) {
        logger_1.logger.debug('No Chart.lock found');
        return null;
    }
    try {
        await fs_1.writeLocalFile(packageFileName, newPackageFileContent);
        logger_1.logger.debug('Updating ' + lockFileName);
        await helmUpdate(packageFileName);
        logger_1.logger.debug('Returning updated Chart.lock');
        const newHelmLockContent = await fs_1.readLocalFile(lockFileName);
        if (existingLockFileContent === newHelmLockContent) {
            logger_1.logger.debug('Chart.lock is unchanged');
            return null;
        }
        return [
            {
                file: {
                    name: lockFileName,
                    contents: newHelmLockContent,
                },
            },
        ];
    }
    catch (err) {
        logger_1.logger.warn({ err }, 'Failed to update Helm lock file');
        return [
            {
                artifactError: {
                    lockFile: lockFileName,
                    stderr: err.message,
                },
            },
        ];
    }
}
exports.updateArtifacts = updateArtifacts;
//# sourceMappingURL=artifacts.js.map