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
exports.getReleases = exports.getResourceUrl = exports.getDefaultFeed = void 0;
const is_1 = __importDefault(require("@sindresorhus/is"));
const got_1 = require("got");
const p_all_1 = __importDefault(require("p-all"));
const semver = __importStar(require("semver"));
const xmldoc_1 = require("xmldoc");
const logger_1 = require("../../logger");
const packageCache = __importStar(require("../../util/cache/package"));
const http_1 = require("../../util/http");
const url_1 = require("../../util/url");
const common_1 = require("./common");
const http = new http_1.Http(common_1.id);
// https://api.nuget.org/v3/index.json is a default official nuget feed
const defaultNugetFeed = 'https://api.nuget.org/v3/index.json';
const cacheNamespace = 'datasource-nuget';
function getDefaultFeed() {
    return defaultNugetFeed;
}
exports.getDefaultFeed = getDefaultFeed;
async function getResourceUrl(url, resourceType = 'RegistrationsBaseUrl') {
    // https://docs.microsoft.com/en-us/nuget/api/service-index
    const resultCacheKey = `${url}:${resourceType}`;
    const cachedResult = await packageCache.get(cacheNamespace, resultCacheKey);
    // istanbul ignore if
    if (cachedResult) {
        return cachedResult;
    }
    try {
        const responseCacheKey = url;
        let servicesIndexRaw = await packageCache.get(cacheNamespace, responseCacheKey);
        // istanbul ignore else: currently not testable
        if (!servicesIndexRaw) {
            servicesIndexRaw = (await http.getJson(url)).body;
            await packageCache.set(cacheNamespace, responseCacheKey, servicesIndexRaw, 3 * 24 * 60);
        }
        const services = servicesIndexRaw.resources
            .map(({ '@id': serviceId, '@type': t }) => {
            var _a, _b;
            return ({
                serviceId,
                type: (_a = t === null || t === void 0 ? void 0 : t.split('/')) === null || _a === void 0 ? void 0 : _a.shift(),
                version: (_b = t === null || t === void 0 ? void 0 : t.split('/')) === null || _b === void 0 ? void 0 : _b.pop(),
            });
        })
            .filter(({ type, version }) => type === resourceType && semver.valid(version))
            .sort((x, y) => semver.compare(x.version, y.version));
        const { serviceId, version } = services.pop();
        // istanbul ignore if
        if (resourceType === 'RegistrationsBaseUrl' &&
            !(version === null || version === void 0 ? void 0 : version.startsWith('3.0.0-')) &&
            !semver.satisfies(version, '^3.0.0')) {
            logger_1.logger.warn({ url, version }, `Nuget: Unknown version returned. Only v3 is supported`);
        }
        await packageCache.set(cacheNamespace, resultCacheKey, serviceId, 60);
        return serviceId;
    }
    catch (err) {
        logger_1.logger.debug({ err, url }, `nuget registry failure: can't get ${resourceType}`);
        return null;
    }
}
exports.getResourceUrl = getResourceUrl;
async function getCatalogEntry(catalogPage) {
    let items = catalogPage.items;
    if (!items) {
        const url = catalogPage['@id'];
        const catalogPageFull = await http.getJson(url);
        items = catalogPageFull.body.items;
    }
    return items.map(({ catalogEntry }) => catalogEntry);
}
async function getReleases(registryUrl, feedUrl, pkgName) {
    var _a, _b, _c;
    const baseUrl = feedUrl.replace(/\/*$/, '');
    const url = `${baseUrl}/${pkgName.toLowerCase()}/index.json`;
    const packageRegistration = await http.getJson(url);
    const catalogPages = packageRegistration.body.items || [];
    const catalogPagesQueue = catalogPages.map((page) => () => getCatalogEntry(page));
    const catalogEntries = (await p_all_1.default(catalogPagesQueue, { concurrency: 5 })).flat();
    let homepage = null;
    let latestStable = null;
    const releases = catalogEntries.map(({ version, published: releaseTimestamp, projectUrl, listed }) => {
        const release = { version: common_1.removeBuildMeta(version) };
        if (releaseTimestamp) {
            release.releaseTimestamp = releaseTimestamp;
        }
        if (semver.valid(version) && !semver.prerelease(version)) {
            latestStable = common_1.removeBuildMeta(version);
            homepage = projectUrl || homepage;
        }
        if (listed === false) {
            release.isDeprecated = true;
        }
        return release;
    });
    if (!releases.length) {
        return null;
    }
    const dep = {
        pkgName,
        releases,
    };
    try {
        const packageBaseAddress = await getResourceUrl(registryUrl, 'PackageBaseAddress');
        // istanbul ignore else: this is a required v3 api
        if (is_1.default.nonEmptyString(packageBaseAddress)) {
            const nuspecUrl = `${url_1.ensureTrailingSlash(packageBaseAddress)}${pkgName.toLowerCase()}/${latestStable}/${pkgName.toLowerCase()}.nuspec`;
            const metaresult = await http.get(nuspecUrl);
            const nuspec = new xmldoc_1.XmlDocument(metaresult.body);
            const sourceUrl = nuspec.valueWithPath('metadata.repository@url');
            if (sourceUrl) {
                dep.sourceUrl = sourceUrl;
            }
        }
    }
    catch (err) /* istanbul ignore next */ {
        // ignore / silence 404. Seen on proget, if remote connector is used and package is not yet cached
        if (err instanceof got_1.RequestError && ((_a = err.response) === null || _a === void 0 ? void 0 : _a.statusCode) === 404) {
            logger_1.logger.debug({ registryUrl, pkgName, pkgVersion: latestStable }, `package manifest (.nuspec) not found`);
            return dep;
        }
        logger_1.logger.debug({ err, registryUrl, pkgName, pkgVersion: latestStable }, `Cannot obtain sourceUrl`);
        return dep;
    }
    // istanbul ignore else: not easy testable
    if (homepage) {
        // only assign if not assigned
        (_b = dep.sourceUrl) !== null && _b !== void 0 ? _b : (dep.sourceUrl = homepage);
        (_c = dep.homepage) !== null && _c !== void 0 ? _c : (dep.homepage = homepage);
    }
    return dep;
}
exports.getReleases = getReleases;
//# sourceMappingURL=v3.js.map