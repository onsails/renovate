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
exports.getReleases = exports.getDigest = exports.registryStrategy = exports.defaultRegistryUrls = exports.id = void 0;
const logger_1 = require("../../logger");
const packageCache = __importStar(require("../../util/cache/package"));
const github_1 = require("../../util/http/github");
const url_1 = require("../../util/url");
const githubReleases = __importStar(require("../github-releases"));
exports.id = 'github-tags';
exports.defaultRegistryUrls = ['https://github.com'];
exports.registryStrategy = 'first';
const http = new github_1.GithubHttp();
const cacheNamespace = 'datasource-github-tags';
function getCacheKey(registryUrl, repo, type) {
    return `${registryUrl}:${repo}:${type}`;
}
async function getTagCommit(registryUrl, githubRepo, tag) {
    const cachedResult = await packageCache.get(cacheNamespace, getCacheKey(registryUrl, githubRepo, `tag-${tag}`));
    // istanbul ignore if
    if (cachedResult) {
        return cachedResult;
    }
    // default to GitHub.com if no GHE host is specified.
    const sourceUrlBase = url_1.ensureTrailingSlash(registryUrl !== null && registryUrl !== void 0 ? registryUrl : 'https://github.com/');
    const apiBaseUrl = sourceUrlBase !== 'https://github.com/'
        ? `${sourceUrlBase}api/v3/`
        : `https://api.github.com/`;
    let digest;
    try {
        const url = `${apiBaseUrl}repos/${githubRepo}/git/refs/tags/${tag}`;
        const res = (await http.getJson(url)).body.object;
        if (res.type === 'commit') {
            digest = res.sha;
        }
        else if (res.type === 'tag') {
            digest = (await http.getJson(res.url)).body.object.sha;
        }
        else {
            logger_1.logger.warn({ res }, 'Unknown git tag refs type');
        }
    }
    catch (err) {
        logger_1.logger.debug({ githubRepo, err }, 'Error getting tag commit from GitHub repo');
    }
    if (!digest) {
        return null;
    }
    const cacheMinutes = 120;
    await packageCache.set(cacheNamespace, getCacheKey(registryUrl, githubRepo, `tag-${tag}`), digest, cacheMinutes);
    return digest;
}
/**
 * github.getDigest
 *
 * The `newValue` supplied here should be a valid tag for the docker image.
 *
 * This function will simply return the latest commit hash for the configured repository.
 */
async function getDigest({ lookupName: repo, registryUrl }, newValue) {
    if (newValue === null || newValue === void 0 ? void 0 : newValue.length) {
        return getTagCommit(registryUrl, repo, newValue);
    }
    const cachedResult = await packageCache.get(cacheNamespace, getCacheKey(registryUrl, repo, 'commit'));
    // istanbul ignore if
    if (cachedResult) {
        return cachedResult;
    }
    // default to GitHub.com if no GHE host is specified.
    const sourceUrlBase = url_1.ensureTrailingSlash(registryUrl !== null && registryUrl !== void 0 ? registryUrl : 'https://github.com/');
    const apiBaseUrl = sourceUrlBase !== 'https://github.com/'
        ? `${sourceUrlBase}api/v3/`
        : `https://api.github.com/`;
    let digest;
    try {
        const url = `${apiBaseUrl}repos/${repo}/commits?per_page=1`;
        const res = await http.getJson(url);
        digest = res.body[0].sha;
    }
    catch (err) {
        logger_1.logger.debug({ githubRepo: repo, err, registryUrl }, 'Error getting latest commit from GitHub repo');
    }
    if (!digest) {
        return null;
    }
    const cacheMinutes = 10;
    await packageCache.set(cacheNamespace, getCacheKey(registryUrl, repo, 'commit'), digest, cacheMinutes);
    return digest;
}
exports.getDigest = getDigest;
async function getTags({ registryUrl, lookupName: repo, }) {
    const cachedResult = await packageCache.get(cacheNamespace, getCacheKey(registryUrl, repo, 'tags'));
    // istanbul ignore if
    if (cachedResult) {
        return cachedResult;
    }
    // default to GitHub.com if no GHE host is specified.
    const sourceUrlBase = url_1.ensureTrailingSlash(registryUrl !== null && registryUrl !== void 0 ? registryUrl : 'https://github.com/');
    const apiBaseUrl = sourceUrlBase !== 'https://github.com/'
        ? `${sourceUrlBase}api/v3/`
        : `https://api.github.com/`;
    // tag
    const url = `${apiBaseUrl}repos/${repo}/tags?per_page=100`;
    const versions = (await http.getJson(url, {
        paginate: true,
    })).body.map((o) => o.name);
    const dependency = {
        sourceUrl: `${sourceUrlBase}${repo}`,
        releases: null,
    };
    dependency.releases = versions.map((version) => ({
        version,
        gitRef: version,
    }));
    const cacheMinutes = 10;
    await packageCache.set(cacheNamespace, getCacheKey(registryUrl, repo, 'tags'), dependency, cacheMinutes);
    return dependency;
}
async function getReleases(config) {
    var _a;
    const tagsResult = await getTags(config);
    try {
        // Fetch additional data from releases endpoint when possible
        const releasesResult = await githubReleases.getReleases(config);
        const releaseByVersion = {};
        (_a = releasesResult === null || releasesResult === void 0 ? void 0 : releasesResult.releases) === null || _a === void 0 ? void 0 : _a.forEach((release) => {
            const key = release.version;
            const value = { ...release };
            delete value.version;
            releaseByVersion[key] = value;
        });
        const mergedReleases = [];
        tagsResult.releases.forEach((tag) => {
            const release = releaseByVersion[tag.version];
            mergedReleases.push({ ...release, ...tag });
        });
        tagsResult.releases = mergedReleases;
    }
    catch (e) {
        // no-op
    }
    return tagsResult;
}
exports.getReleases = getReleases;
//# sourceMappingURL=index.js.map