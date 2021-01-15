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
exports.getRepoConfig = exports.mergeRenovateConfig = exports.checkForRepoConfigError = exports.detectRepoFileConfig = void 0;
const is_1 = __importDefault(require("@sindresorhus/is"));
const json_dup_key_validator_1 = __importDefault(require("json-dup-key-validator"));
const json5_1 = __importDefault(require("json5"));
const upath_1 = __importDefault(require("upath"));
const config_1 = require("../../../config");
const app_strings_1 = require("../../../config/app-strings");
const decrypt_1 = require("../../../config/decrypt");
const migrate_validate_1 = require("../../../config/migrate-validate");
const presets = __importStar(require("../../../config/presets"));
const error_messages_1 = require("../../../constants/error-messages");
const npmApi = __importStar(require("../../../datasource/npm"));
const logger_1 = require("../../../logger");
const fs_1 = require("../../../util/fs");
const git_1 = require("../../../util/git");
const hostRules = __importStar(require("../../../util/host-rules"));
const branch_1 = require("../onboarding/branch");
const flatten_1 = require("./flatten");
const semantic_1 = require("./semantic");
async function detectRepoFileConfig() {
    const fileList = await git_1.getFileList();
    async function detectConfigFile() {
        for (const configFileName of app_strings_1.configFileNames) {
            if (configFileName === 'package.json') {
                try {
                    const pJson = JSON.parse(await fs_1.readLocalFile('package.json', 'utf8'));
                    if (pJson.renovate) {
                        logger_1.logger.debug('Using package.json for global renovate config');
                        return 'package.json';
                    }
                }
                catch (err) {
                    // Do nothing
                }
            }
            else if (fileList.includes(configFileName)) {
                return configFileName;
            }
        }
        return null;
    }
    const configFileName = await detectConfigFile();
    if (!configFileName) {
        logger_1.logger.debug('No renovate config file found');
        return {};
    }
    logger_1.logger.debug(`Found ${configFileName} config file`);
    let configFileParsed;
    if (configFileName === 'package.json') {
        // We already know it parses
        configFileParsed = JSON.parse(await fs_1.readLocalFile('package.json', 'utf8'))
            .renovate;
        logger_1.logger.debug({ config: configFileParsed }, 'package.json>renovate config');
    }
    else {
        let rawFileContents = await fs_1.readLocalFile(configFileName, 'utf8');
        // istanbul ignore if
        if (!rawFileContents) {
            logger_1.logger.warn({ configFileName }, 'Null contents when reading config file');
            throw new Error(error_messages_1.REPOSITORY_CHANGED);
        }
        // istanbul ignore if
        if (!rawFileContents.length) {
            rawFileContents = '{}';
        }
        const fileType = upath_1.default.extname(configFileName);
        if (fileType === '.json5') {
            try {
                configFileParsed = json5_1.default.parse(rawFileContents);
            }
            catch (err) /* istanbul ignore next */ {
                logger_1.logger.debug({ renovateConfig: rawFileContents }, 'Error parsing renovate config renovate.json5');
                const validationError = 'Invalid JSON5 (parsing failed)';
                const validationMessage = `JSON5.parse error:  ${String(err.message)}`;
                return {
                    configFileName,
                    configFileParseError: { validationError, validationMessage },
                };
            }
        }
        else {
            let allowDuplicateKeys = true;
            let jsonValidationError = json_dup_key_validator_1.default.validate(rawFileContents, allowDuplicateKeys);
            if (jsonValidationError) {
                const validationError = 'Invalid JSON (parsing failed)';
                const validationMessage = jsonValidationError;
                return {
                    configFileName,
                    configFileParseError: { validationError, validationMessage },
                };
            }
            allowDuplicateKeys = false;
            jsonValidationError = json_dup_key_validator_1.default.validate(rawFileContents, allowDuplicateKeys);
            if (jsonValidationError) {
                const validationError = 'Duplicate keys in JSON';
                const validationMessage = JSON.stringify(jsonValidationError);
                return {
                    configFileName,
                    configFileParseError: { validationError, validationMessage },
                };
            }
            try {
                configFileParsed = JSON.parse(rawFileContents);
            }
            catch (err) /* istanbul ignore next */ {
                logger_1.logger.debug({ renovateConfig: rawFileContents }, 'Error parsing renovate config');
                const validationError = 'Invalid JSON (parsing failed)';
                const validationMessage = `JSON.parse error:  ${String(err.message)}`;
                return {
                    configFileName,
                    configFileParseError: { validationError, validationMessage },
                };
            }
        }
        logger_1.logger.debug({ fileName: configFileName, config: configFileParsed }, 'Repository config');
    }
    return { configFileName, configFileParsed };
}
exports.detectRepoFileConfig = detectRepoFileConfig;
function checkForRepoConfigError(repoConfig) {
    if (!repoConfig.configFileParseError) {
        return;
    }
    const error = new Error(error_messages_1.CONFIG_VALIDATION);
    error.configFile = repoConfig.configFileName;
    error.validationError = repoConfig.configFileParseError.validationError;
    error.validationMessage = repoConfig.configFileParseError.validationMessage;
    throw error;
}
exports.checkForRepoConfigError = checkForRepoConfigError;
// Check for repository config
async function mergeRenovateConfig(config) {
    var _a;
    let returnConfig = { ...config };
    const repoConfig = await detectRepoFileConfig();
    const configFileParsed = (repoConfig === null || repoConfig === void 0 ? void 0 : repoConfig.configFileParsed) || {};
    if (is_1.default.nonEmptyArray(returnConfig.extends)) {
        configFileParsed.extends = [
            ...returnConfig.extends,
            ...(configFileParsed.extends || []),
        ];
        delete returnConfig.extends;
    }
    checkForRepoConfigError(repoConfig);
    const migratedConfig = await migrate_validate_1.migrateAndValidate(config, configFileParsed);
    if (migratedConfig.errors.length) {
        const error = new Error(error_messages_1.CONFIG_VALIDATION);
        error.configFile = repoConfig.configFileName;
        error.validationError =
            'The renovate configuration file contains some invalid settings';
        error.validationMessage = migratedConfig.errors
            .map((e) => e.message)
            .join(', ');
        throw error;
    }
    if (migratedConfig.warnings) {
        returnConfig.warnings = returnConfig.warnings.concat(migratedConfig.warnings);
    }
    delete migratedConfig.errors;
    delete migratedConfig.warnings;
    logger_1.logger.debug({ config: migratedConfig }, 'migrated config');
    // Decrypt before resolving in case we need npm authentication for any presets
    const decryptedConfig = decrypt_1.decryptConfig(migratedConfig, config.privateKey);
    // istanbul ignore if
    if (decryptedConfig.npmrc) {
        logger_1.logger.debug('Found npmrc in decrypted config - setting');
        npmApi.setNpmrc(decryptedConfig.npmrc);
    }
    // Decrypt after resolving in case the preset contains npm authentication instead
    const resolvedConfig = decrypt_1.decryptConfig(await presets.resolveConfigPresets(decryptedConfig, config), config.privateKey);
    delete resolvedConfig.privateKey;
    logger_1.logger.trace({ config: resolvedConfig }, 'resolved config');
    // istanbul ignore if
    if (resolvedConfig.npmrc) {
        logger_1.logger.debug('Ignoring any .npmrc files in repository due to configured npmrc');
        npmApi.setNpmrc(resolvedConfig.npmrc);
        resolvedConfig.ignoreNpmrcFile = true;
    }
    // istanbul ignore if
    if (resolvedConfig.hostRules) {
        logger_1.logger.debug('Setting hostRules from config');
        for (const rule of resolvedConfig.hostRules) {
            try {
                hostRules.add(rule);
            }
            catch (err) {
                logger_1.logger.warn({ err, config: rule }, 'Error setting hostRule from config');
            }
        }
        delete resolvedConfig.hostRules;
    }
    returnConfig = config_1.mergeChildConfig(returnConfig, resolvedConfig);
    returnConfig.renovateJsonPresent = true;
    returnConfig.packageRules = flatten_1.flattenPackageRules(returnConfig.packageRules);
    // istanbul ignore if
    if ((_a = returnConfig.ignorePaths) === null || _a === void 0 ? void 0 : _a.length) {
        logger_1.logger.debug({ ignorePaths: returnConfig.ignorePaths }, `Found repo ignorePaths`);
    }
    return returnConfig;
}
exports.mergeRenovateConfig = mergeRenovateConfig;
// istanbul ignore next
async function getRepoConfig(config_) {
    let config = { ...config_ };
    config.baseBranch = config.defaultBranch;
    config = await branch_1.checkOnboardingBranch(config);
    config = await mergeRenovateConfig(config);
    if (config.semanticCommits === 'auto') {
        config.semanticCommits = await semantic_1.detectSemanticCommits();
    }
    return config;
}
exports.getRepoConfig = getRepoConfig;
//# sourceMappingURL=config.js.map