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
exports.getReleases = exports.getIndexSuffix = exports.id = void 0;
const external_host_error_1 = require("../../types/errors/external-host-error");
const packageCache = __importStar(require("../../util/cache/package"));
const http_1 = require("../../util/http");
exports.id = 'crate';
const http = new http_1.Http(exports.id);
const BASE_URL = 'https://raw.githubusercontent.com/rust-lang/crates.io-index/master/';
function getIndexSuffix(lookupName) {
    const len = lookupName.length;
    if (len === 1) {
        return '1/' + lookupName;
    }
    if (len === 2) {
        return '2/' + lookupName;
    }
    if (len === 3) {
        return '3/' + lookupName[0] + '/' + lookupName;
    }
    return (lookupName.slice(0, 2) + '/' + lookupName.slice(2, 4) + '/' + lookupName);
}
exports.getIndexSuffix = getIndexSuffix;
async function getReleases({ lookupName, }) {
    const cacheNamespace = 'datasource-crate';
    const cacheKey = lookupName;
    const cachedResult = await packageCache.get(cacheNamespace, cacheKey);
    // istanbul ignore if
    if (cachedResult) {
        return cachedResult;
    }
    const crateUrl = BASE_URL + getIndexSuffix(lookupName);
    const dependencyUrl = `https://crates.io/crates/${lookupName}`;
    try {
        const lines = (await http.get(crateUrl)).body
            .split('\n') // break into lines
            .map((line) => line.trim()) // remove whitespace
            .filter((line) => line.length !== 0) // remove empty lines
            .map((line) => JSON.parse(line)); // parse
        const result = {
            dependencyUrl,
            releases: [],
        };
        result.releases = lines
            .map((version) => {
            const release = {
                version: version.vers,
            };
            if (version.yanked) {
                release.isDeprecated = true;
            }
            return release;
        })
            .filter((release) => release.version);
        if (!result.releases.length) {
            return null;
        }
        const cacheMinutes = 10;
        await packageCache.set(cacheNamespace, cacheKey, result, cacheMinutes);
        return result;
    }
    catch (err) {
        if (err.statusCode === 429 ||
            (err.statusCode >= 500 && err.statusCode < 600)) {
            throw new external_host_error_1.ExternalHostError(err);
        }
        throw err;
    }
}
exports.getReleases = getReleases;
//# sourceMappingURL=index.js.map