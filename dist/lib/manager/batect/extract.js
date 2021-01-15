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
exports.extractAllPackageFiles = void 0;
const js_yaml_1 = require("js-yaml");
const upath = __importStar(require("upath"));
const git_tags_1 = require("../../datasource/git-tags");
const logger_1 = require("../../logger");
const fs_1 = require("../../util/fs");
const docker_1 = require("../../versioning/docker");
const semver_1 = require("../../versioning/semver");
const extract_1 = require("../dockerfile/extract");
function loadConfig(content) {
    const config = js_yaml_1.safeLoad(content);
    if (typeof config !== 'object') {
        throw new Error(`Configuration file does not contain a YAML object (it is ${typeof config}).`);
    }
    return config;
}
function extractImages(config) {
    if (config.containers === undefined) {
        return [];
    }
    return Object.values(config.containers)
        .filter((container) => container.image !== undefined)
        .map((container) => container.image);
}
function createImageDependency(tag) {
    return {
        ...extract_1.getDep(tag),
        versioning: docker_1.id,
    };
}
function extractImageDependencies(config) {
    const images = extractImages(config);
    const deps = images.map((image) => createImageDependency(image));
    logger_1.logger.trace({ deps }, 'Loaded images from Batect configuration file');
    return deps;
}
function includeIsGitInclude(include) {
    return typeof include === 'object' && include.type === 'git';
}
function extractGitBundles(config) {
    if (config.include === undefined) {
        return [];
    }
    return config.include.filter(includeIsGitInclude);
}
function createBundleDependency(bundle) {
    return {
        depName: bundle.repo,
        currentValue: bundle.ref,
        versioning: semver_1.id,
        datasource: git_tags_1.id,
        commitMessageTopic: 'bundle {{depName}}',
    };
}
function extractBundleDependencies(config) {
    const bundles = extractGitBundles(config);
    const deps = bundles.map((bundle) => createBundleDependency(bundle));
    logger_1.logger.trace({ deps }, 'Loaded bundles from Batect configuration file');
    return deps;
}
function includeIsStringFileInclude(include) {
    return typeof include === 'string';
}
function includeIsObjectFileInclude(include) {
    return typeof include === 'object' && include.type === 'file';
}
function extractReferencedConfigFiles(config, fileName) {
    if (config.include === undefined) {
        return [];
    }
    const dirName = upath.dirname(fileName);
    const paths = [
        ...config.include.filter(includeIsStringFileInclude),
        ...config.include
            .filter(includeIsObjectFileInclude)
            .map((include) => include.path),
    ].filter((p) => p !== undefined && p !== null);
    return paths.map((p) => upath.join(dirName, p));
}
function extractPackageFile(content, fileName) {
    logger_1.logger.debug({ fileName }, 'batect.extractPackageFile()');
    try {
        const config = loadConfig(content);
        const deps = [
            ...extractImageDependencies(config),
            ...extractBundleDependencies(config),
        ];
        const referencedConfigFiles = extractReferencedConfigFiles(config, fileName);
        return { deps, referencedConfigFiles };
    }
    catch (err) {
        logger_1.logger.warn({ err, fileName }, 'Extracting dependencies from Batect configuration file failed');
        return null;
    }
}
async function extractAllPackageFiles(config, packageFiles) {
    const filesToExamine = new Set(packageFiles);
    const filesAlreadyExamined = new Set();
    const results = [];
    while (filesToExamine.size > 0) {
        const packageFile = filesToExamine.values().next().value;
        filesToExamine.delete(packageFile);
        filesAlreadyExamined.add(packageFile);
        const content = await fs_1.readLocalFile(packageFile, 'utf8');
        const result = extractPackageFile(content, packageFile);
        if (result !== null) {
            result.referencedConfigFiles.forEach((f) => {
                if (!filesAlreadyExamined.has(f) && !filesToExamine.has(f)) {
                    filesToExamine.add(f);
                }
            });
            results.push({
                packageFile,
                deps: result.deps,
            });
        }
    }
    return results;
}
exports.extractAllPackageFiles = extractAllPackageFiles;
//# sourceMappingURL=extract.js.map