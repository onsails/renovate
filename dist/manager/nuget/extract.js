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
const xmldoc_1 = require("xmldoc");
const datasourceNuget = __importStar(require("../../datasource/nuget"));
const logger_1 = require("../../logger");
const util_1 = require("./util");
/**
 * https://docs.microsoft.com/en-us/nuget/concepts/package-versioning
 * This article mentions that  Nuget 3.x and later tries to restore the lowest possible version
 * regarding to given version range.
 * 1.3.4 equals [1.3.4,)
 * Due to guarantee that an update of package version will result in its usage by the next restore + build operation,
 * only following constrained versions make sense
 * 1.3.4, [1.3.4], [1.3.4, ], [1.3.4, )
 * The update of the right boundary does not make sense regarding to the lowest version restore rule,
 * so we don't include it in the extracting regexp
 */
const checkVersion = /^\s*(?:[[])?(?:(?<currentValue>[^"(,[\]]+)\s*(?:,\s*[)\]]|])?)\s*$/;
function extractDepsFromXml(xmlNode) {
    var _a, _b, _c;
    const results = [];
    const itemGroups = xmlNode.childrenNamed('ItemGroup');
    for (const itemGroup of itemGroups) {
        const relevantChildren = [
            ...itemGroup.childrenNamed('PackageReference'),
            ...itemGroup.childrenNamed('PackageVersion'),
            ...itemGroup.childrenNamed('DotNetCliToolReference'),
            ...itemGroup.childrenNamed('GlobalPackageReference'),
        ];
        for (const child of relevantChildren) {
            const { attr } = child;
            const depName = (attr === null || attr === void 0 ? void 0 : attr.Include) || (attr === null || attr === void 0 ? void 0 : attr.Update);
            const version = (attr === null || attr === void 0 ? void 0 : attr.Version) ||
                child.valueWithPath('Version') || (attr === null || attr === void 0 ? void 0 : attr.VersionOverride) ||
                child.valueWithPath('VersionOverride');
            const currentValue = (_c = (_b = (_a = checkVersion === null || checkVersion === void 0 ? void 0 : checkVersion.exec(version)) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.currentValue) === null || _c === void 0 ? void 0 : _c.trim();
            if (depName && currentValue) {
                results.push({
                    datasource: datasourceNuget.id,
                    depType: 'nuget',
                    depName,
                    currentValue,
                });
            }
        }
    }
    return results;
}
async function extractPackageFile(content, packageFile, config) {
    logger_1.logger.trace({ packageFile }, 'nuget.extractPackageFile()');
    const registries = await util_1.getConfiguredRegistries(packageFile, config.localDir);
    const registryUrls = registries
        ? registries.map((registry) => registry.url)
        : undefined;
    if (packageFile.endsWith('.config/dotnet-tools.json')) {
        const deps = [];
        let manifest;
        try {
            manifest = JSON.parse(content);
        }
        catch (err) {
            logger_1.logger.debug({ fileName: packageFile }, 'Invalid JSON');
            return null;
        }
        if (manifest.version !== 1) {
            logger_1.logger.debug({ contents: manifest }, 'Unsupported dotnet tools version');
            return null;
        }
        for (const depName of Object.keys(manifest.tools)) {
            const tool = manifest.tools[depName];
            const currentValue = tool.version;
            const dep = {
                depType: 'nuget',
                depName,
                currentValue,
                datasource: datasourceNuget.id,
            };
            if (registryUrls) {
                dep.registryUrls = registryUrls;
            }
            deps.push(dep);
        }
        return { deps };
    }
    let deps = [];
    try {
        const parsedXml = new xmldoc_1.XmlDocument(content);
        deps = extractDepsFromXml(parsedXml).map((dep) => ({
            ...dep,
            ...(registryUrls && { registryUrls }),
        }));
        return { deps };
    }
    catch (err) {
        logger_1.logger.debug({ err }, `Failed to parse ${packageFile}`);
    }
    return { deps };
}
exports.extractPackageFile = extractPackageFile;
//# sourceMappingURL=extract.js.map