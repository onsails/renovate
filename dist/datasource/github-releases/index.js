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
exports.getReleases = exports.registryStrategy = exports.defaultRegistryUrls = exports.id = void 0;
const packageCache = __importStar(require("../../util/cache/package"));
const github_1 = require("../../util/http/github");
const url_1 = require("../../util/url");
exports.id = 'github-releases';
exports.defaultRegistryUrls = ['https://github.com'];
exports.registryStrategy = 'first';
const cacheNamespace = 'datasource-github-releases';
const http = new github_1.GithubHttp();
function getCacheKey(depHost, repo) {
    const type = 'tags';
    return `${depHost}:${repo}:${type}`;
}
/**
 * github.getReleases
 *
 * This function can be used to fetch releases with a customisable versioning (e.g. semver) and with releases.
 *
 * This function will:
 *  - Fetch all releases
 *  - Sanitize the versions if desired (e.g. strip out leading 'v')
 *  - Return a dependency object containing sourceUrl string and releases array
 */
async function getReleases({ lookupName: repo, registryUrl, }) {
    const cachedResult = await packageCache.get(cacheNamespace, getCacheKey(registryUrl, repo));
    // istanbul ignore if
    if (cachedResult) {
        return cachedResult;
    }
    // default to GitHub.com if no GHE host is specified.
    const sourceUrlBase = url_1.ensureTrailingSlash(registryUrl !== null && registryUrl !== void 0 ? registryUrl : 'https://github.com/');
    const apiBaseUrl = sourceUrlBase !== 'https://github.com/'
        ? `${sourceUrlBase}api/v3/`
        : `https://api.github.com/`;
    const url = `${apiBaseUrl}repos/${repo}/releases?per_page=100`;
    const res = await http.getJson(url, {
        paginate: true,
    });
    const githubReleases = res.body;
    const dependency = {
        sourceUrl: `${sourceUrlBase}${repo}`,
        releases: null,
    };
    dependency.releases = githubReleases.map(({ tag_name, published_at, prerelease }) => ({
        version: tag_name,
        gitRef: tag_name,
        releaseTimestamp: published_at,
        isStable: prerelease ? false : undefined,
    }));
    const cacheMinutes = 10;
    await packageCache.set(cacheNamespace, getCacheKey(registryUrl, repo), dependency, cacheMinutes);
    return dependency;
}
exports.getReleases = getReleases;
//# sourceMappingURL=index.js.map