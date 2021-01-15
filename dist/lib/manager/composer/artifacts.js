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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateArtifacts = void 0;
const url_1 = __importDefault(require("url"));
const is_1 = __importDefault(require("@sindresorhus/is"));
const shlex_1 = require("shlex");
const upath_1 = __importDefault(require("upath"));
const error_messages_1 = require("../../constants/error-messages");
const platforms_1 = require("../../constants/platforms");
const datasourcePackagist = __importStar(require("../../datasource/packagist"));
const logger_1 = require("../../logger");
const exec_1 = require("../../util/exec");
const fs_1 = require("../../util/fs");
const git_1 = require("../../util/git");
const hostRules = __importStar(require("../../util/host-rules"));
const utils_1 = require("./utils");
function getHost({ hostName, domainName, endpoint, baseUrl, }) {
    let host = hostName || domainName;
    if (!host) {
        try {
            host = endpoint || baseUrl;
            host = url_1.default.parse(host).host;
        }
        catch (err) {
            logger_1.logger.warn(`Composer: can't parse ${host}`);
            host = null;
        }
    }
    return host;
}
function getAuthJson() {
    var _a;
    const authJson = {};
    const githubCredentials = hostRules.find({
        hostType: platforms_1.PLATFORM_TYPE_GITHUB,
        url: 'https://api.github.com/',
    });
    if (githubCredentials === null || githubCredentials === void 0 ? void 0 : githubCredentials.token) {
        authJson['github-oauth'] = {
            'github.com': githubCredentials.token.replace('x-access-token:', ''),
        };
    }
    const gitlabCredentials = hostRules.find({
        hostType: platforms_1.PLATFORM_TYPE_GITLAB,
        url: 'https://gitlab.com/api/v4/',
    });
    if (gitlabCredentials === null || gitlabCredentials === void 0 ? void 0 : gitlabCredentials.token) {
        authJson['gitlab-token'] = {
            'gitlab.com': gitlabCredentials.token,
        };
    }
    (_a = hostRules
        .findAll({ hostType: datasourcePackagist.id })) === null || _a === void 0 ? void 0 : _a.forEach((hostRule) => {
        const { username, password } = hostRule;
        const host = getHost(hostRule);
        if (host && username && password) {
            authJson['http-basic'] = authJson['http-basic'] || {};
            authJson['http-basic'][host] = { username, password };
        }
    });
    return is_1.default.emptyObject(authJson) ? null : JSON.stringify(authJson);
}
async function updateArtifacts({ packageFileName, updatedDeps, newPackageFileContent, config, }) {
    var _a, _b;
    logger_1.logger.debug(`composer.updateArtifacts(${packageFileName})`);
    const cacheDir = process.env.COMPOSER_CACHE_DIR ||
        upath_1.default.join(config.cacheDir, './others/composer');
    await fs_1.ensureDir(cacheDir);
    logger_1.logger.debug(`Using composer cache ${cacheDir}`);
    const lockFileName = packageFileName.replace(/\.json$/, '.lock');
    const existingLockFileContent = await fs_1.readLocalFile(lockFileName);
    if (!existingLockFileContent) {
        logger_1.logger.debug('No composer.lock found');
        return null;
    }
    const vendorDir = fs_1.getSiblingFileName(packageFileName, 'vendor');
    const commitVendorFiles = await fs_1.localPathExists(vendorDir);
    await fs_1.ensureLocalDir(vendorDir);
    try {
        await fs_1.writeLocalFile(packageFileName, newPackageFileContent);
        if (config.isLockFileMaintenance) {
            await fs_1.deleteLocalFile(lockFileName);
        }
        const execOptions = {
            cwdFile: packageFileName,
            extraEnv: {
                COMPOSER_CACHE_DIR: cacheDir,
                COMPOSER_AUTH: getAuthJson(),
            },
            docker: {
                image: 'renovate/composer',
                tagConstraint: utils_1.getConstraint(config),
                tagScheme: utils_1.composerVersioningId,
            },
        };
        const cmd = 'composer';
        let args;
        if (config.isLockFileMaintenance) {
            args = 'install';
        }
        else {
            args =
                ('update ' + updatedDeps.map(shlex_1.quote).join(' ')).trim() +
                    ' --with-dependencies';
        }
        if (config.composerIgnorePlatformReqs) {
            args += ' --ignore-platform-reqs';
        }
        args += ' --no-ansi --no-interaction';
        if (global.trustLevel !== 'high' || config.ignoreScripts) {
            args += ' --no-scripts --no-autoloader';
        }
        logger_1.logger.debug({ cmd, args }, 'composer command');
        await exec_1.exec(`${cmd} ${args}`, execOptions);
        const status = await git_1.getRepoStatus();
        if (!status.modified.includes(lockFileName)) {
            return null;
        }
        logger_1.logger.debug('Returning updated composer.lock');
        const res = [
            {
                file: {
                    name: lockFileName,
                    contents: await fs_1.readLocalFile(lockFileName),
                },
            },
        ];
        if (!commitVendorFiles) {
            return res;
        }
        logger_1.logger.debug(`Commiting vendor files in ${vendorDir}`);
        for (const f of [...status.modified, ...status.not_added]) {
            if (f.startsWith(vendorDir)) {
                res.push({
                    file: {
                        name: f,
                        contents: await fs_1.readLocalFile(f),
                    },
                });
            }
        }
        for (const f of status.deleted) {
            res.push({
                file: {
                    name: '|delete|',
                    contents: f,
                },
            });
        }
        return res;
    }
    catch (err) {
        if ((_a = err.message) === null || _a === void 0 ? void 0 : _a.includes('Your requirements could not be resolved to an installable set of packages.')) {
            logger_1.logger.info('Composer requirements cannot be resolved');
        }
        else if ((_b = err.message) === null || _b === void 0 ? void 0 : _b.includes('write error (disk full?)')) {
            throw new Error(error_messages_1.SYSTEM_INSUFFICIENT_DISK_SPACE);
        }
        else {
            logger_1.logger.debug({ err }, 'Failed to generate composer.lock');
        }
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