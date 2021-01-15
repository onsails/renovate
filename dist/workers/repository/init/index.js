"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRepo = void 0;
const logger_1 = require("../../../logger");
const clone_1 = require("../../../util/clone");
const git_1 = require("../../../util/git");
const configured_1 = require("../configured");
const apis_1 = require("./apis");
const cache_1 = require("./cache");
const config_1 = require("./config");
const vulnerability_1 = require("./vulnerability");
function initializeConfig(config) {
    return { ...clone_1.clone(config), errors: [], warnings: [], branchList: [] };
}
async function initRepo(config_) {
    let config = initializeConfig(config_);
    await cache_1.initializeCaches(config);
    config = await apis_1.initApis(config);
    config = await config_1.getRepoConfig(config);
    configured_1.checkIfConfigured(config);
    await git_1.setBranchPrefix(config.branchPrefix);
    config = await vulnerability_1.detectVulnerabilityAlerts(config);
    // istanbul ignore if
    if (config.printConfig) {
        logger_1.logger.debug({ config }, 'Full resolved config including presets');
    }
    return config;
}
exports.initRepo = initRepo;
//# sourceMappingURL=index.js.map