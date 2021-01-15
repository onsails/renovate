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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHttpUrl = exports.getUrl = exports.commitFiles = exports.hasDiff = exports.getFile = exports.getBranchFiles = exports.getBranchLastCommitTime = exports.mergeBranch = exports.deleteBranch = exports.isBranchModified = exports.isBranchStale = exports.getBranchList = exports.getFileList = exports.checkoutBranch = exports.getCommitMessages = exports.getBranchParentSha = exports.getBranchCommit = exports.branchExists = exports.getRepoStatus = exports.syncGit = exports.getSubmodules = exports.setBranchPrefix = exports.initRepo = void 0;
const url_1 = __importDefault(require("url"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const git_url_parse_1 = __importDefault(require("git-url-parse"));
const simple_git_1 = __importStar(require("simple-git"));
const upath_1 = require("upath");
const app_strings_1 = require("../../config/app-strings");
const error_messages_1 = require("../../constants/error-messages");
const logger_1 = require("../../logger");
const external_host_error_1 = require("../../types/errors/external-host-error");
const limits_1 = require("../../workers/global/limits");
const private_key_1 = require("./private-key");
__exportStar(require("./private-key"), exports);
// istanbul ignore next
function checkForPlatformFailure(err) {
    if (process.env.NODE_ENV === 'test') {
        return;
    }
    const platformFailureStrings = [
        'remote: Invalid username or password',
        'gnutls_handshake() failed',
        'The requested URL returned error: 5',
        'The remote end hung up unexpectedly',
        'access denied or repository not exported',
        'Could not write new index file',
        'Failed to connect to',
        'Connection timed out',
        'malformed object name',
        'TF401027:',
    ];
    for (const errorStr of platformFailureStrings) {
        if (err.message.includes(errorStr)) {
            logger_1.logger.debug({ err }, 'Converting git error to ExternalHostError');
            throw new external_host_error_1.ExternalHostError(err, 'git');
        }
    }
}
function localName(branchName) {
    return branchName.replace(/^origin\//, '');
}
async function isDirectory(dir) {
    try {
        return (await fs_extra_1.default.stat(dir)).isDirectory();
    }
    catch (err) {
        return false;
    }
}
async function getDefaultBranch(git) {
    // see https://stackoverflow.com/a/44750379/1438522
    try {
        const res = await git.raw(['symbolic-ref', 'refs/remotes/origin/HEAD']);
        return res.replace('refs/remotes/origin/', '').trim();
    }
    catch (err) /* istanbul ignore next */ {
        checkForPlatformFailure(err);
        if (err.message.startsWith('fatal: ref refs/remotes/origin/HEAD is not a symbolic ref')) {
            throw new Error(error_messages_1.REPOSITORY_EMPTY);
        }
        throw err;
    }
}
let config = {};
let git;
let gitInitialized;
let privateKeySet = false;
async function fetchBranchCommits() {
    var _a;
    config.branchCommits = {};
    const opts = ['ls-remote', '--heads', config.url];
    if (config.extraCloneOpts) {
        Object.entries(config.extraCloneOpts).forEach((e) => opts.unshift(e[0], `${e[1]}`));
    }
    try {
        (await git.raw(opts))
            .split('\n')
            .filter(Boolean)
            .map((line) => line.trim().split(/\s+/))
            .forEach(([sha, ref]) => {
            config.branchCommits[ref.replace('refs/heads/', '')] = sha;
        });
    }
    catch (err) /* istanbul ignore next */ {
        logger_1.logger.debug({ err }, 'git error');
        if ((_a = err.message) === null || _a === void 0 ? void 0 : _a.includes('Please ask the owner to check their account')) {
            throw new Error(error_messages_1.REPOSITORY_DISABLED);
        }
        throw err;
    }
}
async function initRepo(args) {
    config = { ...args };
    config.additionalBranches = [];
    config.branchIsModified = {};
    git = simple_git_1.default(config.localDir);
    gitInitialized = false;
    await fetchBranchCommits();
}
exports.initRepo = initRepo;
async function resetToBranch(branchName) {
    logger_1.logger.debug(`resetToBranch(${branchName})`);
    await git.raw(['reset', '--hard']);
    await git.checkout(branchName);
    await git.raw(['reset', '--hard', 'origin/' + branchName]);
    await git.raw(['clean', '-fd']);
}
async function deleteLocalBranch(branchName) {
    await git.branch(['-D', branchName]);
}
async function cleanLocalBranches() {
    const existingBranches = (await git.raw(['branch']))
        .split('\n')
        .map((branch) => branch.trim())
        .filter((branch) => branch.length)
        .filter((branch) => !branch.startsWith('* '));
    logger_1.logger.debug({ existingBranches });
    for (const branchName of existingBranches) {
        await deleteLocalBranch(branchName);
    }
}
/*
 * When we initially clone, we clone only the default branch so how no knowledge of other branches existing.
 * By calling this function once the repo's branchPrefix is known, we can fetch all of Renovate's branches in one command.
 */
async function setBranchPrefix(branchPrefix) {
    config.branchPrefix = branchPrefix;
    // If the repo is already cloned then set branchPrefix now, otherwise it will be called again during syncGit()
    if (gitInitialized) {
        logger_1.logger.debug('Setting branchPrefix: ' + branchPrefix);
        const ref = `refs/heads/${branchPrefix}*:refs/remotes/origin/${branchPrefix}*`;
        try {
            await git.fetch(['origin', ref, '--depth=2', '--force']);
        }
        catch (err) /* istanbul ignore next */ {
            checkForPlatformFailure(err);
            throw err;
        }
    }
}
exports.setBranchPrefix = setBranchPrefix;
async function getSubmodules() {
    try {
        return ((await git.raw([
            'config',
            '--file',
            '.gitmodules',
            '--get-regexp',
            'path',
        ])) || '')
            .trim()
            .split(/[\n\s]/)
            .filter((_e, i) => i % 2);
    }
    catch (err) /* istanbul ignore next */ {
        logger_1.logger.warn({ err }, 'Error getting submodules');
        return [];
    }
}
exports.getSubmodules = getSubmodules;
async function syncGit() {
    var _a;
    if (gitInitialized) {
        return;
    }
    gitInitialized = true;
    logger_1.logger.debug('Initializing git repository into ' + config.localDir);
    const gitHead = upath_1.join(config.localDir, '.git/HEAD');
    let clone = true;
    if (await fs_extra_1.default.exists(gitHead)) {
        try {
            await git.raw(['remote', 'set-url', 'origin', config.url]);
            const fetchStart = Date.now();
            await git.fetch(['--depth=10']);
            config.currentBranch =
                config.currentBranch || (await getDefaultBranch(git));
            await resetToBranch(config.currentBranch);
            await cleanLocalBranches();
            await git.raw(['remote', 'prune', 'origin']);
            const durationMs = Math.round(Date.now() - fetchStart);
            logger_1.logger.debug({ durationMs }, 'git fetch completed');
            clone = false;
        }
        catch (err) /* istanbul ignore next */ {
            if (err.message === error_messages_1.REPOSITORY_EMPTY) {
                throw err;
            }
            logger_1.logger.warn({ err }, 'git fetch error');
        }
    }
    if (clone) {
        await fs_extra_1.default.emptyDir(config.localDir);
        const cloneStart = Date.now();
        try {
            // clone only the default branch
            const opts = ['--depth=10'];
            if (config.extraCloneOpts) {
                Object.entries(config.extraCloneOpts).forEach((e) => opts.push(e[0], `${e[1]}`));
            }
            await git.clone(config.url, '.', opts);
        }
        catch (err) /* istanbul ignore next */ {
            logger_1.logger.debug({ err }, 'git clone error');
            if ((_a = err.message) === null || _a === void 0 ? void 0 : _a.includes('No space left on device')) {
                throw new Error(error_messages_1.SYSTEM_INSUFFICIENT_DISK_SPACE);
            }
            if (err.message === error_messages_1.REPOSITORY_EMPTY) {
                throw err;
            }
            throw new external_host_error_1.ExternalHostError(err, 'git');
        }
        const durationMs = Math.round(Date.now() - cloneStart);
        logger_1.logger.debug({ durationMs }, 'git clone completed');
    }
    config.currentBranchSha = (await git.raw(['rev-parse', 'HEAD'])).trim();
    if (config.cloneSubmodules) {
        const submodules = await getSubmodules();
        for (const submodule of submodules) {
            try {
                logger_1.logger.debug(`Cloning git submodule at ${submodule}`);
                await git.submoduleUpdate(['--init', submodule]);
            }
            catch (err) {
                logger_1.logger.warn(`Unable to initialise git submodule at ${submodule}`);
            }
        }
    }
    try {
        const latestCommitDate = (await git.log({ n: 1 })).latest.date;
        logger_1.logger.debug({ latestCommitDate }, 'latest commit');
    }
    catch (err) /* istanbul ignore next */ {
        checkForPlatformFailure(err);
        if (err.message.includes('does not have any commits yet')) {
            throw new Error(error_messages_1.REPOSITORY_EMPTY);
        }
        logger_1.logger.warn({ err }, 'Cannot retrieve latest commit date');
    }
    try {
        const { gitAuthorName, gitAuthorEmail } = config;
        if (gitAuthorName) {
            logger_1.logger.debug({ gitAuthorName }, 'Setting git author name');
            await git.raw(['config', 'user.name', gitAuthorName]);
        }
        if (gitAuthorEmail) {
            logger_1.logger.debug({ gitAuthorEmail }, 'Setting git author email');
            await git.raw(['config', 'user.email', gitAuthorEmail]);
        }
    }
    catch (err) /* istanbul ignore next */ {
        checkForPlatformFailure(err);
        logger_1.logger.debug({ err }, 'Error setting git author config');
        throw new Error(error_messages_1.REPOSITORY_TEMPORARY_ERROR);
    }
    config.currentBranch = config.currentBranch || (await getDefaultBranch(git));
    if (config.branchPrefix) {
        await setBranchPrefix(config.branchPrefix);
    }
}
exports.syncGit = syncGit;
// istanbul ignore next
async function getRepoStatus() {
    await syncGit();
    return git.status();
}
exports.getRepoStatus = getRepoStatus;
async function syncBranch(branchName) {
    await syncGit();
    if (branchName.startsWith(config.branchPrefix)) {
        return;
    }
    if (config.additionalBranches.includes(branchName)) {
        return;
    }
    config.additionalBranches.push(branchName);
    // fetch the branch only if it's not part of the existing branchPrefix
    try {
        await git.raw(['remote', 'set-branches', '--add', 'origin', branchName]);
        await git.fetch(['origin', branchName, '--depth=2']);
    }
    catch (err) /* istanbul ignore next */ {
        checkForPlatformFailure(err);
    }
}
function branchExists(branchName) {
    return !!config.branchCommits[branchName];
}
exports.branchExists = branchExists;
// Return the commit SHA for a branch
function getBranchCommit(branchName) {
    return config.branchCommits[branchName] || null;
}
exports.getBranchCommit = getBranchCommit;
// Return the parent commit SHA for a branch
async function getBranchParentSha(branchName) {
    try {
        const branchSha = getBranchCommit(branchName);
        const parentSha = await git.revparse([`${branchSha}^`]);
        return parentSha;
    }
    catch (err) {
        logger_1.logger.debug({ err }, 'Error getting branch parent sha');
        return null;
    }
}
exports.getBranchParentSha = getBranchParentSha;
async function getCommitMessages() {
    await syncGit();
    logger_1.logger.debug('getCommitMessages');
    const res = await git.log({
        n: 10,
        format: { message: '%s' },
    });
    return res.all.map((commit) => commit.message);
}
exports.getCommitMessages = getCommitMessages;
async function checkoutBranch(branchName) {
    var _a, _b;
    logger_1.logger.debug(`Setting current branch to ${branchName}`);
    await syncBranch(branchName);
    try {
        config.currentBranch = branchName;
        config.currentBranchSha = (await git.raw(['rev-parse', 'origin/' + branchName])).trim();
        await git.checkout([branchName, '-f']);
        const latestCommitDate = (_b = (_a = (await git.log({ n: 1 }))) === null || _a === void 0 ? void 0 : _a.latest) === null || _b === void 0 ? void 0 : _b.date;
        if (latestCommitDate) {
            logger_1.logger.debug({ branchName, latestCommitDate }, 'latest commit');
        }
        await git.reset(simple_git_1.ResetMode.HARD);
        return config.currentBranchSha;
    }
    catch (err) /* istanbul ignore next */ {
        checkForPlatformFailure(err);
        throw err;
    }
}
exports.checkoutBranch = checkoutBranch;
async function getFileList() {
    await syncGit();
    const branch = config.currentBranch;
    const submodules = await getSubmodules();
    const files = await git.raw(['ls-tree', '-r', branch]);
    // istanbul ignore if
    if (!files) {
        return [];
    }
    return files
        .split('\n')
        .filter(Boolean)
        .filter((line) => line.startsWith('100'))
        .map((line) => line.split(/\t/).pop())
        .filter((file) => submodules.every((submodule) => !file.startsWith(submodule)));
}
exports.getFileList = getFileList;
function getBranchList() {
    return Object.keys(config.branchCommits);
}
exports.getBranchList = getBranchList;
async function isBranchStale(branchName) {
    await syncBranch(branchName);
    try {
        const branches = await git.branch([
            '--remotes',
            '--verbose',
            '--contains',
            config.currentBranchSha,
        ]);
        return !branches.all.map(localName).includes(branchName);
    }
    catch (err) /* istanbul ignore next */ {
        checkForPlatformFailure(err);
        throw err;
    }
}
exports.isBranchStale = isBranchStale;
async function isBranchModified(branchName) {
    await syncBranch(branchName);
    // First check cache
    if (config.branchIsModified[branchName] !== undefined) {
        return config.branchIsModified[branchName];
    }
    if (!branchExists(branchName)) {
        logger_1.logger.debug({ branchName }, 'Branch does not exist - cannot check isModified');
        return false;
    }
    // Retrieve the author of the most recent commit
    const lastAuthor = (await git.raw([
        'log',
        '-1',
        '--pretty=format:%ae',
        `origin/${branchName}`,
        '--',
    ])).trim();
    const { gitAuthorEmail } = config;
    if (lastAuthor === process.env.RENOVATE_LEGACY_GIT_AUTHOR_EMAIL || // remove in next major release
        lastAuthor === gitAuthorEmail) {
        // author matches - branch has not been modified
        config.branchIsModified[branchName] = false;
        return false;
    }
    logger_1.logger.debug({ branchName, lastAuthor, gitAuthorEmail }, 'Last commit author does not match git author email - branch has been modified');
    config.branchIsModified[branchName] = true;
    return true;
}
exports.isBranchModified = isBranchModified;
async function deleteBranch(branchName) {
    await syncBranch(branchName);
    try {
        await git.raw(['push', '--delete', 'origin', branchName]);
        logger_1.logger.debug({ branchName }, 'Deleted remote branch');
    }
    catch (err) /* istanbul ignore next */ {
        checkForPlatformFailure(err);
        logger_1.logger.debug({ branchName }, 'No remote branch to delete');
    }
    try {
        await deleteLocalBranch(branchName);
        // istanbul ignore next
        logger_1.logger.debug({ branchName }, 'Deleted local branch');
    }
    catch (err) {
        checkForPlatformFailure(err);
        logger_1.logger.debug({ branchName }, 'No local branch to delete');
    }
    delete config.branchCommits[branchName];
}
exports.deleteBranch = deleteBranch;
async function mergeBranch(branchName) {
    await syncBranch(branchName);
    await git.reset(simple_git_1.ResetMode.HARD);
    await git.checkout(['-B', branchName, 'origin/' + branchName]);
    await git.checkout(config.currentBranch);
    await git.merge(['--ff-only', branchName]);
    await git.push('origin', config.currentBranch);
    limits_1.incLimitedValue(limits_1.Limit.Commits);
}
exports.mergeBranch = mergeBranch;
async function getBranchLastCommitTime(branchName) {
    await syncBranch(branchName);
    try {
        const time = await git.show(['-s', '--format=%ai', 'origin/' + branchName]);
        return new Date(Date.parse(time));
    }
    catch (err) {
        checkForPlatformFailure(err);
        return new Date();
    }
}
exports.getBranchLastCommitTime = getBranchLastCommitTime;
async function getBranchFiles(branchName) {
    await syncBranch(branchName);
    try {
        const diff = await git.diffSummary([
            `origin/${branchName}`,
            `origin/${branchName}^`,
        ]);
        return diff.files.map((file) => file.file);
    }
    catch (err) /* istanbul ignore next */ {
        logger_1.logger.warn({ err }, 'getBranchFiles error');
        checkForPlatformFailure(err);
        return null;
    }
}
exports.getBranchFiles = getBranchFiles;
async function getFile(filePath, branchName) {
    await syncGit();
    try {
        const content = await git.show([
            'origin/' + (branchName || config.currentBranch) + ':' + filePath,
        ]);
        return content;
    }
    catch (err) {
        checkForPlatformFailure(err);
        return null;
    }
}
exports.getFile = getFile;
async function hasDiff(branchName) {
    await syncBranch(branchName);
    try {
        return (await git.diff(['HEAD', branchName])) !== '';
    }
    catch (err) {
        return true;
    }
}
exports.hasDiff = hasDiff;
async function commitFiles({ branchName, files, message, force = false, }) {
    await syncGit();
    logger_1.logger.debug(`Committing files to branch ${branchName}`);
    if (!privateKeySet) {
        await private_key_1.writePrivateKey();
        privateKeySet = true;
    }
    await private_key_1.configSigningKey(config.localDir);
    try {
        await git.reset(simple_git_1.ResetMode.HARD);
        await git.raw(['clean', '-fd']);
        await git.checkout(['-B', branchName, 'origin/' + config.currentBranch]);
        const fileNames = [];
        const deleted = [];
        for (const file of files) {
            // istanbul ignore if
            if (file.name === '|delete|') {
                deleted.push(file.contents);
            }
            else if (await isDirectory(upath_1.join(config.localDir, file.name))) {
                fileNames.push(file.name);
                await git.add(file.name);
            }
            else {
                fileNames.push(file.name);
                let contents;
                // istanbul ignore else
                if (typeof file.contents === 'string') {
                    contents = Buffer.from(file.contents);
                }
                else {
                    contents = file.contents;
                }
                await fs_extra_1.default.outputFile(upath_1.join(config.localDir, file.name), contents);
            }
        }
        // istanbul ignore if
        if (fileNames.length === 1 && app_strings_1.configFileNames.includes(fileNames[0])) {
            fileNames.unshift('-f');
        }
        if (fileNames.length) {
            await git.add(fileNames);
        }
        if (deleted.length) {
            for (const f of deleted) {
                try {
                    await git.rm([f]);
                }
                catch (err) /* istanbul ignore next */ {
                    checkForPlatformFailure(err);
                    logger_1.logger.debug({ err }, 'Cannot delete ' + f);
                }
            }
        }
        const commitRes = await git.commit(message, [], {
            '--no-verify': null,
        });
        const commit = (commitRes === null || commitRes === void 0 ? void 0 : commitRes.commit) || 'unknown';
        if (!force && !(await hasDiff(`origin/${branchName}`))) {
            logger_1.logger.debug({ branchName, fileNames }, 'No file changes detected. Skipping commit');
            return null;
        }
        await git.push('origin', `${branchName}:${branchName}`, {
            '--force': null,
            '-u': null,
            '--no-verify': null,
        });
        // Fetch it after create
        const ref = `refs/heads/${branchName}:refs/remotes/origin/${branchName}`;
        await git.fetch(['origin', ref, '--depth=2', '--force']);
        config.branchCommits[branchName] = (await git.revparse([branchName])).trim();
        config.branchIsModified[branchName] = false;
        limits_1.incLimitedValue(limits_1.Limit.Commits);
        return commit;
    }
    catch (err) /* istanbul ignore next */ {
        checkForPlatformFailure(err);
        if (err.message.includes('refusing to allow a GitHub App to create or update workflow')) {
            logger_1.logger.warn('App has not been granted permissions to update Workflows - aborting branch.');
            return null;
        }
        if (err.message.includes('remote: error: cannot lock ref')) {
            logger_1.logger.error({ err }, 'Error committing files.');
            return null;
        }
        logger_1.logger.debug({ err }, 'Error committing files');
        throw new Error(error_messages_1.REPOSITORY_CHANGED);
    }
}
exports.commitFiles = commitFiles;
function getUrl({ protocol, auth, hostname, host, repository, }) {
    if (protocol === 'ssh') {
        return `git@${hostname}:${repository}.git`;
    }
    return url_1.default.format({
        protocol: protocol || 'https',
        auth,
        hostname,
        host,
        pathname: repository + '.git',
    });
}
exports.getUrl = getUrl;
function getHttpUrl(url, token) {
    const parsedUrl = git_url_parse_1.default(url);
    parsedUrl.token = token;
    return parsedUrl.toString('https');
}
exports.getHttpUrl = getHttpUrl;
//# sourceMappingURL=index.js.map