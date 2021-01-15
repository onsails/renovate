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
exports.getConfiguredRegistries = exports.getDefaultRegistries = exports.getRandomString = void 0;
const crypto_random_string_1 = __importDefault(require("crypto-random-string"));
const find_up_1 = __importDefault(require("find-up"));
const upath = __importStar(require("upath"));
const xmldoc_1 = require("xmldoc");
const datasourceNuget = __importStar(require("../../datasource/nuget"));
const logger_1 = require("../../logger");
const fs_1 = require("../../util/fs");
async function readFileAsXmlDocument(file) {
    try {
        return new xmldoc_1.XmlDocument(await fs_1.readFile(file, 'utf8'));
    }
    catch (err) {
        logger_1.logger.debug({ err }, `failed to parse '${file}' as XML document`);
        return undefined;
    }
}
/* istanbul ignore next */
function getRandomString() {
    return crypto_random_string_1.default({ length: 16 });
}
exports.getRandomString = getRandomString;
function getDefaultRegistries() {
    return datasourceNuget.defaultRegistryUrls.map((registryUrl) => ({
        url: registryUrl,
    }));
}
exports.getDefaultRegistries = getDefaultRegistries;
async function getConfiguredRegistries(packageFile, localDir) {
    // Valid file names taken from https://github.com/NuGet/NuGet.Client/blob/f64621487c0b454eda4b98af853bf4a528bef72a/src/NuGet.Core/NuGet.Configuration/Settings/Settings.cs#L34
    const nuGetConfigFileNames = ['nuget.config', 'NuGet.config', 'NuGet.Config'];
    // normalize paths, otherwise startsWith can fail because of path delimitter mismatch
    const baseDir = upath.normalizeSafe(localDir);
    const nuGetConfigPath = await find_up_1.default(nuGetConfigFileNames, {
        cwd: upath.dirname(upath.join(baseDir, packageFile)),
        type: 'file',
    });
    if (!nuGetConfigPath ||
        upath.normalizeSafe(nuGetConfigPath).startsWith(baseDir) !== true) {
        return undefined;
    }
    logger_1.logger.debug({ nuGetConfigPath }, 'found NuGet.config');
    const nuGetConfig = await readFileAsXmlDocument(nuGetConfigPath);
    if (!nuGetConfig) {
        return undefined;
    }
    const packageSources = nuGetConfig.childNamed('packageSources');
    if (!packageSources) {
        return undefined;
    }
    const registries = getDefaultRegistries();
    for (const child of packageSources.children) {
        if (child.type === 'element') {
            if (child.name === 'clear') {
                logger_1.logger.debug(`clearing registry URLs`);
                registries.length = 0;
            }
            else if (child.name === 'add') {
                const isHttpUrl = /^https?:\/\//i.test(child.attr.value);
                if (isHttpUrl) {
                    let registryUrl = child.attr.value;
                    if (child.attr.protocolVersion) {
                        registryUrl += `#protocolVersion=${child.attr.protocolVersion}`;
                    }
                    logger_1.logger.debug({ registryUrl }, 'adding registry URL');
                    registries.push({
                        name: child.attr.key,
                        url: registryUrl,
                    });
                }
                else {
                    logger_1.logger.debug({ registryUrl: child.attr.value }, 'ignoring local registry URL');
                }
            }
            // child.name === 'remove' not supported
        }
    }
    return registries;
}
exports.getConfiguredRegistries = getConfiguredRegistries;
//# sourceMappingURL=util.js.map