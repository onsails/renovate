"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPresetFromEndpoint = exports.fetchJSONFile = void 0;
const logger_1 = require("../../../logger");
const external_host_error_1 = require("../../../types/errors/external-host-error");
const bitbucket_server_1 = require("../../../util/http/bitbucket-server");
const util_1 = require("../util");
const http = new bitbucket_server_1.BitbucketServerHttp();
async function fetchJSONFile(repo, fileName, endpoint) {
    const [projectKey, repositorySlug] = repo.split('/');
    bitbucket_server_1.setBaseUrl(endpoint);
    const url = `rest/api/1.0/projects/${projectKey}/repos/${repositorySlug}/browse/${fileName}?limit=20000`;
    let res;
    try {
        res = await http.getJson(url);
    }
    catch (err) {
        // istanbul ignore if: not testable with nock
        if (err instanceof external_host_error_1.ExternalHostError) {
            throw err;
        }
        logger_1.logger.debug({ statusCode: err.statusCode, url: `${endpoint}${url}` }, `Failed to retrieve ${fileName} from repo`);
        throw new Error(util_1.PRESET_DEP_NOT_FOUND);
    }
    if (!res.body.isLastPage) {
        logger_1.logger.warn({ size: res.body.size }, 'Renovate config to big');
        throw new Error('invalid preset JSON');
    }
    try {
        const content = res.body.lines.map((l) => l.text).join('');
        const parsed = JSON.parse(content);
        return parsed;
    }
    catch (err) {
        throw new Error('invalid preset JSON');
    }
}
exports.fetchJSONFile = fetchJSONFile;
function getPresetFromEndpoint(pkgName, filePreset, endpoint) {
    return util_1.fetchPreset({
        pkgName,
        filePreset,
        endpoint,
        fetch: fetchJSONFile,
    });
}
exports.getPresetFromEndpoint = getPresetFromEndpoint;
//# sourceMappingURL=index.js.map