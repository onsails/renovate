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
exports.getPackageUpdates = void 0;
const is_1 = __importDefault(require("@sindresorhus/is"));
const fast_deep_equal_1 = __importDefault(require("fast-deep-equal"));
const datasource_1 = require("../../datasource");
const datasourceGithubTags = __importStar(require("../../datasource/github-tags"));
const logger_1 = require("../../logger");
const schedule_1 = require("../../versioning/node/schedule");
const semver_1 = require("../../versioning/semver");
async function getPackageUpdates(config) {
    logger_1.logger.trace('travis.getPackageUpdates()');
    const { supportPolicy } = config;
    if (!(supportPolicy === null || supportPolicy === void 0 ? void 0 : supportPolicy.length)) {
        return [];
    }
    const policies = schedule_1.getPolicies();
    for (const policy of supportPolicy) {
        if (!Object.keys(policies).includes(policy)) {
            logger_1.logger.warn({ policy }, `Unknown supportPolicy`);
            return [];
        }
    }
    logger_1.logger.debug({ supportPolicy }, `supportPolicy`);
    let newValue = supportPolicy
        .map((policy) => policies[policy])
        .reduce((result, policy) => result.concat(policy), [])
        .sort((a, b) => a - b);
    const newMajor = newValue[newValue.length - 1];
    if (config.rangeStrategy === 'pin' || semver_1.isVersion(config.currentValue[0])) {
        const versions = (await datasource_1.getPkgReleases({
            ...config,
            datasource: datasourceGithubTags.id,
            depName: 'nodejs/node',
        })).releases.map((release) => release.version);
        newValue = newValue
            .map(String)
            .map((value) => semver_1.getSatisfyingVersion(versions, value));
    }
    if (is_1.default.string(config.currentValue[0])) {
        newValue = newValue.map(String);
    }
    newValue.sort((a, b) => a - b);
    // TODO: `config.currentValue` is a string!
    config.currentValue.sort((a, b) => a - b);
    if (fast_deep_equal_1.default(config.currentValue, newValue)) {
        return [];
    }
    return [
        {
            newValue: newValue.join(','),
            newMajor,
            isRange: true,
            sourceUrl: 'https://github.com/nodejs/node',
        },
    ];
}
exports.getPackageUpdates = getPackageUpdates;
//# sourceMappingURL=package.js.map