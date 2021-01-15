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
exports.extractPackageFile = exports.parseAzurePipelines = exports.extractContainer = exports.extractRepository = void 0;
const js_yaml_1 = require("js-yaml");
const datasourceGitTags = __importStar(require("../../datasource/git-tags"));
const logger_1 = require("../../logger");
const extract_1 = require("../dockerfile/extract");
function extractRepository(repository) {
    var _a;
    if (repository.type !== 'github') {
        return null;
    }
    if (!((_a = repository.ref) === null || _a === void 0 ? void 0 : _a.startsWith('refs/tags/'))) {
        return null;
    }
    return {
        autoReplaceStringTemplate: 'refs/tags/{{newValue}}',
        currentValue: repository.ref.replace('refs/tags/', ''),
        datasource: datasourceGitTags.id,
        depName: repository.name,
        depType: 'gitTags',
        lookupName: `https://github.com/${repository.name}.git`,
        replaceString: repository.ref,
    };
}
exports.extractRepository = extractRepository;
function extractContainer(container) {
    if (!container.image) {
        return null;
    }
    const dep = extract_1.getDep(container.image);
    logger_1.logger.debug({
        depName: dep.depName,
        currentValue: dep.currentValue,
        currentDigest: dep.currentDigest,
    }, 'Azure pipelines docker image');
    dep.depType = 'docker';
    return dep;
}
exports.extractContainer = extractContainer;
function parseAzurePipelines(content, filename) {
    let pkg = null;
    try {
        pkg = js_yaml_1.safeLoad(content, { json: true });
    }
    catch (err) /* istanbul ignore next */ {
        logger_1.logger.info({ filename, err }, 'Error parsing azure-pipelines content');
        return null;
    }
    if (!pkg || !pkg.resources) {
        return null;
    }
    pkg.resources.containers = pkg.resources.containers || [];
    pkg.resources.repositories = pkg.resources.repositories || [];
    return pkg;
}
exports.parseAzurePipelines = parseAzurePipelines;
function extractPackageFile(content, filename) {
    logger_1.logger.trace(`azurePipelines.extractPackageFile(${filename})`);
    const deps = [];
    const pkg = parseAzurePipelines(content, filename);
    if (!pkg) {
        return null;
    }
    // grab the repositories tags
    for (const repository of pkg.resources.repositories) {
        const dep = extractRepository(repository);
        if (dep) {
            deps.push(dep);
        }
    }
    // grab the containers tags
    for (const container of pkg.resources.containers) {
        const dep = extractContainer(container);
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