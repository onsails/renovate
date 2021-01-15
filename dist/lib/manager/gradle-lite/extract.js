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
const upath = __importStar(require("upath"));
const datasourceMaven = __importStar(require("../../datasource/maven"));
const logger_1 = require("../../logger");
const fs_1 = require("../../util/fs");
const parser_1 = require("./parser");
const utils_1 = require("./utils");
// Enables reverse sorting in generateBranchConfig()
//
// Required for grouped dependencies to be upgraded
// correctly in single branch.
//
// https://github.com/renovatebot/renovate/issues/8224
function elevateFileReplacePositionField(deps) {
    return deps.map((dep) => {
        var _a;
        return ({
            ...dep,
            fileReplacePosition: (_a = dep === null || dep === void 0 ? void 0 : dep.managerData) === null || _a === void 0 ? void 0 : _a.fileReplacePosition,
        });
    });
}
async function extractAllPackageFiles(config, packageFiles) {
    const extractedDeps = [];
    const registry = {};
    const packageFilesByName = {};
    const registryUrls = [];
    for (const packageFile of utils_1.reorderFiles(packageFiles)) {
        packageFilesByName[packageFile] = {
            packageFile,
            datasource: datasourceMaven.id,
            deps: [],
        };
        try {
            const content = await fs_1.readLocalFile(packageFile, 'utf8');
            const dir = upath.dirname(utils_1.toAbsolutePath(packageFile));
            if (utils_1.isPropsFile(packageFile)) {
                const { vars, deps } = parser_1.parseProps(content, packageFile);
                registry[dir] = vars;
                extractedDeps.push(...deps);
            }
            else if (utils_1.isGradleFile(packageFile)) {
                const vars = utils_1.getVars(registry, dir);
                const { deps, urls } = parser_1.parseGradle(content, vars, packageFile);
                urls.forEach((url) => {
                    if (!registryUrls.includes(url)) {
                        registryUrls.push(url);
                    }
                });
                extractedDeps.push(...deps);
            }
        }
        catch (e) {
            logger_1.logger.warn({ config, packageFile }, `Failed to process Gradle file: ${packageFile}`);
        }
    }
    if (!extractedDeps.length) {
        return null;
    }
    elevateFileReplacePositionField(extractedDeps).forEach((dep) => {
        const key = dep.managerData.packageFile;
        const pkgFile = packageFilesByName[key];
        const { deps } = pkgFile;
        deps.push({
            ...dep,
            registryUrls: [...(dep.registryUrls || []), ...registryUrls],
        });
        packageFilesByName[key] = pkgFile;
    });
    return Object.values(packageFilesByName);
}
exports.extractAllPackageFiles = extractAllPackageFiles;
//# sourceMappingURL=extract.js.map