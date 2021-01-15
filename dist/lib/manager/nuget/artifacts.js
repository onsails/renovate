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
exports.updateArtifacts = void 0;
const path_1 = require("path");
const nuget_1 = require("../../datasource/nuget");
const logger_1 = require("../../logger");
const exec_1 = require("../../util/exec");
const fs_1 = require("../../util/fs");
const hostRules = __importStar(require("../../util/host-rules"));
const util_1 = require("./util");
async function addSourceCmds(packageFileName, config, nugetConfigFile) {
    const registries = (await util_1.getConfiguredRegistries(packageFileName, config.localDir)) ||
        util_1.getDefaultRegistries();
    const result = [];
    for (const registry of registries) {
        const { username, password } = hostRules.find({
            hostType: nuget_1.id,
            url: registry.url,
        });
        let addSourceCmd = `dotnet nuget add source ${registry.url} --configfile ${nugetConfigFile}`;
        if (registry.name) {
            // Add name for registry, if known.
            addSourceCmd += ` --name ${registry.name}`;
        }
        if (username && password) {
            // Add registry credentials from host rules, if configured.
            addSourceCmd += ` --username ${username} --password ${password} --store-password-in-clear-text`;
        }
        result.push(addSourceCmd);
    }
    return result;
}
async function runDotnetRestore(packageFileName, config) {
    const execOptions = {
        docker: {
            image: 'renovate/dotnet',
        },
    };
    const nugetConfigDir = await fs_1.ensureCacheDir(`./others/nuget/${util_1.getRandomString()}`);
    const nugetConfigFile = path_1.join(nugetConfigDir, 'nuget.config');
    await fs_1.outputFile(nugetConfigFile, `<?xml version="1.0" encoding="utf-8"?>\n<configuration>\n</configuration>\n`);
    const cmds = [
        ...(await addSourceCmds(packageFileName, config, nugetConfigFile)),
        `dotnet restore ${packageFileName} --force-evaluate --configfile ${nugetConfigFile}`,
    ];
    logger_1.logger.debug({ cmd: cmds }, 'dotnet command');
    await exec_1.exec(cmds, execOptions);
    await fs_1.remove(nugetConfigDir);
}
async function updateArtifacts({ packageFileName, newPackageFileContent, config, updatedDeps, }) {
    logger_1.logger.debug(`nuget.updateArtifacts(${packageFileName})`);
    if (!/(?:cs|vb|fs)proj$/i.test(packageFileName)) {
        // This could be implemented in the future if necessary.
        // It's not that easy though because the questions which
        // project file to restore how to determine which lock files
        // have been changed in such cases.
        logger_1.logger.debug({ packageFileName }, 'Not updating lock file for non project files');
        return null;
    }
    const lockFileName = fs_1.getSiblingFileName(packageFileName, 'packages.lock.json');
    const existingLockFileContent = await fs_1.readLocalFile(lockFileName, 'utf8');
    if (!existingLockFileContent) {
        logger_1.logger.debug({ packageFileName }, 'No lock file found beneath package file.');
        return null;
    }
    try {
        if (updatedDeps.length === 0 && config.isLockFileMaintenance !== true) {
            logger_1.logger.debug(`Not updating lock file because no deps changed and no lock file maintenance.`);
            return null;
        }
        await fs_1.writeLocalFile(packageFileName, newPackageFileContent);
        await runDotnetRestore(packageFileName, config);
        const newLockFileContent = await fs_1.readLocalFile(lockFileName, 'utf8');
        if (existingLockFileContent === newLockFileContent) {
            logger_1.logger.debug(`Lock file is unchanged`);
            return null;
        }
        logger_1.logger.debug('Returning updated lock file');
        return [
            {
                file: {
                    name: lockFileName,
                    contents: await fs_1.readLocalFile(lockFileName),
                },
            },
        ];
    }
    catch (err) {
        logger_1.logger.debug({ err }, 'Failed to generate lock file');
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