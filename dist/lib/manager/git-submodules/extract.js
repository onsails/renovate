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
const url_1 = __importDefault(require("url"));
const simple_git_1 = __importDefault(require("simple-git"));
const upath_1 = __importDefault(require("upath"));
const datasourceGitSubmodules = __importStar(require("../../datasource/git-submodules"));
const logger_1 = require("../../logger");
const git_1 = require("../../util/git");
const hostRules = __importStar(require("../../util/host-rules"));
async function getUrl(git, gitModulesPath, submoduleName) {
    var _a;
    const path = (_a = (await simple_git_1.default().raw([
        'config',
        '--file',
        gitModulesPath,
        '--get',
        `submodule.${submoduleName}.url`,
    ]))) === null || _a === void 0 ? void 0 : _a.trim();
    if (!(path === null || path === void 0 ? void 0 : path.startsWith('../'))) {
        return path;
    }
    const remoteUrl = (await git.raw(['config', '--get', 'remote.origin.url'])).trim();
    return url_1.default.resolve(`${remoteUrl}/`, path);
}
const headRefRe = /ref: refs\/heads\/(?<branch>\w+)\s/;
async function getDefaultBranch(subModuleUrl) {
    var _a, _b, _c;
    const val = await simple_git_1.default().listRemote(['--symref', subModuleUrl, 'HEAD']);
    return (_c = (_b = (_a = headRefRe.exec(val)) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.branch) !== null && _c !== void 0 ? _c : 'master';
}
async function getBranch(gitModulesPath, submoduleName, subModuleUrl) {
    return ((await simple_git_1.default().raw([
        'config',
        '--file',
        gitModulesPath,
        '--get',
        `submodule.${submoduleName}.branch`,
    ])) || (await getDefaultBranch(subModuleUrl))).trim();
}
async function getModules(git, gitModulesPath) {
    var _a;
    const res = [];
    try {
        const modules = ((_a = (await git.raw([
            'config',
            '--file',
            gitModulesPath,
            '--get-regexp',
            'path',
        ]))) !== null && _a !== void 0 ? _a : '')
            .trim()
            .split(/\n/)
            .filter((s) => !!s);
        for (const line of modules) {
            const [, name, path] = line.split(/submodule\.(.+?)\.path\s(.+)/);
            res.push({ name, path });
        }
    }
    catch (err) /* istanbul ignore next */ {
        logger_1.logger.warn({ err }, 'Error getting git submodules during extract');
    }
    return res;
}
async function extractPackageFile(_content, fileName, config) {
    const git = simple_git_1.default(config.localDir);
    const gitModulesPath = upath_1.default.join(config.localDir, fileName);
    const depNames = await getModules(git, gitModulesPath);
    if (!depNames.length) {
        return null;
    }
    const deps = (await Promise.all(depNames.map(async ({ name, path }) => {
        try {
            const [currentValue] = (await git.subModule(['status', path]))
                .trim()
                .replace(/^[-+]/, '')
                .split(/\s/);
            const subModuleUrl = await getUrl(git, gitModulesPath, name);
            // hostRules only understands HTTP URLs
            // Find HTTP URL, then apply token
            let httpSubModuleUrl = git_1.getHttpUrl(subModuleUrl);
            const hostRule = hostRules.find({ url: httpSubModuleUrl });
            httpSubModuleUrl = git_1.getHttpUrl(subModuleUrl, hostRule === null || hostRule === void 0 ? void 0 : hostRule.token);
            const submoduleBranch = await getBranch(gitModulesPath, name, httpSubModuleUrl);
            return {
                depName: path,
                registryUrls: [httpSubModuleUrl, submoduleBranch],
                currentValue,
                currentDigest: currentValue,
            };
        }
        catch (err) /* istanbul ignore next */ {
            logger_1.logger.warn({ err }, 'Error mapping git submodules during extraction');
            return null;
        }
    }))).filter(Boolean);
    return { deps, datasource: datasourceGitSubmodules.id };
}
exports.default = extractPackageFile;
//# sourceMappingURL=extract.js.map