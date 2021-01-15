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
exports.extractPackageFile = exports.parseKustomize = exports.extractImage = exports.extractBase = void 0;
const js_yaml_1 = require("js-yaml");
const datasourceDocker = __importStar(require("../../datasource/docker"));
const datasourceGitTags = __importStar(require("../../datasource/git-tags"));
const datasourceGitHubTags = __importStar(require("../../datasource/github-tags"));
const logger_1 = require("../../logger");
const dockerVersioning = __importStar(require("../../versioning/docker"));
// URL specifications should follow the hashicorp URL format
// https://github.com/hashicorp/go-getter#url-format
const gitUrl = /^(?:git::)?(?<url>(?:(?:(?:http|https|ssh):\/\/)?(?:.*@)?)?(?<path>(?:[^:/]+[:/])?(?<project>[^/]+\/[^/]+)))(?<subdir>[^?]*)\?ref=(?<currentValue>.+)$/;
function extractBase(base) {
    const match = gitUrl.exec(base);
    if (!match) {
        return null;
    }
    if (match === null || match === void 0 ? void 0 : match.groups.path.startsWith('github.com')) {
        return {
            currentValue: match.groups.currentValue,
            datasource: datasourceGitHubTags.id,
            depName: match.groups.project.replace('.git', ''),
        };
    }
    return {
        datasource: datasourceGitTags.id,
        depName: match.groups.path.replace('.git', ''),
        depNameShort: match.groups.project.replace('.git', ''),
        lookupName: match.groups.url,
        currentValue: match.groups.currentValue,
    };
}
exports.extractBase = extractBase;
function extractImage(image) {
    var _a;
    if ((image === null || image === void 0 ? void 0 : image.name) && image.newTag) {
        const replaceString = image.newTag;
        let currentValue;
        let currentDigest;
        if (replaceString.startsWith('sha256:')) {
            currentDigest = replaceString;
            currentValue = undefined;
        }
        else {
            currentValue = replaceString;
        }
        return {
            datasource: datasourceDocker.id,
            versioning: dockerVersioning.id,
            depName: (_a = image.newName) !== null && _a !== void 0 ? _a : image.name,
            currentValue,
            currentDigest,
            replaceString,
        };
    }
    return null;
}
exports.extractImage = extractImage;
function parseKustomize(content) {
    let pkg = null;
    try {
        pkg = js_yaml_1.safeLoad(content, { json: true });
    }
    catch (e) /* istanbul ignore next */ {
        return null;
    }
    if (!pkg) {
        return null;
    }
    if (pkg.kind !== 'Kustomization') {
        return null;
    }
    pkg.bases = (pkg.bases || []).concat(pkg.resources || []);
    pkg.images = pkg.images || [];
    return pkg;
}
exports.parseKustomize = parseKustomize;
function extractPackageFile(content) {
    logger_1.logger.trace('kustomize.extractPackageFile()');
    const deps = [];
    const pkg = parseKustomize(content);
    if (!pkg) {
        return null;
    }
    // grab the remote bases
    for (const base of pkg.bases) {
        const dep = extractBase(base);
        if (dep) {
            deps.push(dep);
        }
    }
    // grab the image tags
    for (const image of pkg.images) {
        const dep = extractImage(image);
        if (dep) {
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