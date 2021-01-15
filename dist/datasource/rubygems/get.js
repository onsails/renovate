"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDependency = exports.fetch = void 0;
const url_join_1 = __importDefault(require("url-join"));
const logger_1 = require("../../logger");
const http_1 = require("../../util/http");
const common_1 = require("./common");
const http = new http_1.Http(common_1.id);
const INFO_PATH = '/api/v1/gems';
const VERSIONS_PATH = '/api/v1/versions';
const getHeaders = () => ({ hostType: common_1.id });
async function fetch(dependency, registry, path) {
    const headers = getHeaders();
    const url = url_join_1.default(registry, path, `${dependency}.json`);
    logger_1.logger.trace({ dependency }, `RubyGems lookup request: ${String(url)}`);
    const response = (await http.getJson(url, { headers })) || {
        body: undefined,
    };
    return response.body;
}
exports.fetch = fetch;
async function getDependency(dependency, registry) {
    logger_1.logger.debug({ dependency }, 'RubyGems lookup for dependency');
    const info = await fetch(dependency, registry, INFO_PATH);
    if (!info) {
        logger_1.logger.debug({ dependency }, 'RubyGems package not found.');
        return null;
    }
    if (dependency.toLowerCase() !== info.name.toLowerCase()) {
        logger_1.logger.warn({ lookup: dependency, returned: info.name }, 'Lookup name does not match with returned.');
        return null;
    }
    let versions = [];
    let releases = [];
    try {
        versions = await fetch(dependency, registry, VERSIONS_PATH);
    }
    catch (err) {
        if (err.statusCode === 400 || err.statusCode === 404) {
            logger_1.logger.debug({ registry }, 'versions endpoint returns error - falling back to info endpoint');
        }
        else {
            throw err;
        }
    }
    if (versions.length === 0 && info.version) {
        logger_1.logger.warn('falling back to the version from the info endpoint');
        releases = [
            {
                version: info.version,
                rubyPlatform: info.platform,
            },
        ];
    }
    else {
        releases = versions.map(({ number: version, platform: rubyPlatform, created_at: releaseTimestamp, rubygems_version: rubygemsVersion, ruby_version: rubyVersion, }) => ({
            version,
            rubyPlatform,
            releaseTimestamp,
            rubygemsVersion,
            rubyVersion,
        }));
    }
    return {
        releases,
        homepage: info.homepage_uri,
        sourceUrl: info.source_code_uri,
        changelogUrl: info.changelog_uri,
    };
}
exports.getDependency = getDependency;
//# sourceMappingURL=get.js.map