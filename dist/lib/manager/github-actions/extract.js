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
exports.extractPackageFile = void 0;
const githubTagsDatasource = __importStar(require("../../datasource/github-tags"));
const logger_1 = require("../../logger");
const types_1 = require("../../types");
const dockerVersioning = __importStar(require("../../versioning/docker"));
const extract_1 = require("../dockerfile/extract");
function extractPackageFile(content) {
    logger_1.logger.trace('github-actions.extractPackageFile()');
    const deps = [];
    for (const line of content.split('\n')) {
        if (line.trim().startsWith('#')) {
            continue; // eslint-disable-line no-continue
        }
        const dockerMatch = /^\s+uses: docker:\/\/([^"]+)\s*$/.exec(line);
        if (dockerMatch) {
            const [, currentFrom] = dockerMatch;
            const dep = extract_1.getDep(currentFrom);
            dep.depType = 'docker';
            dep.versioning = dockerVersioning.id;
            deps.push(dep);
            continue; // eslint-disable-line no-continue
        }
        const tagMatch = /^\s+-?\s+?uses: (?<depName>[\w-]+\/[\w-]+)(?<path>.*)?@(?<currentValue>.+?)\s*?$/.exec(line);
        if (tagMatch === null || tagMatch === void 0 ? void 0 : tagMatch.groups) {
            const { depName, currentValue } = tagMatch.groups;
            const dep = {
                depName,
                currentValue,
                commitMessageTopic: '{{{depName}}} action',
                datasource: githubTagsDatasource.id,
                versioning: dockerVersioning.id,
                depType: 'action',
                pinDigests: false,
            };
            if (!dockerVersioning.api.isValid(currentValue)) {
                dep.skipReason = types_1.SkipReason.InvalidVersion;
            }
            deps.push(dep);
        }
    }
    if (!deps.length) {
        return null;
    }
    return { deps };
}
exports.extractPackageFile = extractPackageFile;
//# sourceMappingURL=extract.js.map