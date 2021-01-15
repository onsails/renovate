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
exports.extractPackageFile = exports.defaultConfig = void 0;
const url_1 = __importDefault(require("url"));
const logger_1 = require("../../logger");
const regex_1 = require("../../util/regex");
const template = __importStar(require("../../util/template"));
exports.defaultConfig = {
    pinDigests: false,
};
const validMatchFields = [
    'depName',
    'lookupName',
    'currentValue',
    'currentDigest',
    'datasource',
    'versioning',
    'extractVersion',
    'registryUrl',
];
function regexMatchAll(regex, content) {
    const matches = [];
    let matchResult;
    do {
        matchResult = regex.exec(content);
        if (matchResult) {
            matches.push(matchResult);
        }
    } while (matchResult);
    return matches;
}
function createDependency(matchResult, config, dep) {
    const dependency = dep || {};
    const { groups } = matchResult;
    for (const field of validMatchFields) {
        const fieldTemplate = `${field}Template`;
        if (config[fieldTemplate]) {
            try {
                dependency[field] = template.compile(config[fieldTemplate], groups);
            }
            catch (err) {
                logger_1.logger.warn({ template: config[fieldTemplate] }, 'Error compiling template for custom manager');
                return null;
            }
        }
        else if (groups[field]) {
            switch (field) {
                case 'registryUrl':
                    // check if URL is valid and pack inside an array
                    if (url_1.default.parse(groups[field])) {
                        dependency.registryUrls = [groups[field]];
                    }
                    break;
                default:
                    dependency[field] = groups[field];
                    break;
            }
        }
    }
    dependency.replaceString = String(matchResult[0]);
    return dependency;
}
function mergeDependency(deps) {
    const result = {};
    deps.forEach((dep) => {
        validMatchFields.forEach((field) => {
            if (dep[field]) {
                result[field] = dep[field];
                // save the line replaceString of the section which contains the current Value for a speed up lookup during the replace phase
                if (field === 'currentValue') {
                    result.replaceString = dep.replaceString;
                }
            }
        });
    });
    return result;
}
function handleAny(content, packageFile, config) {
    return config.matchStrings
        .map((matchString) => regex_1.regEx(matchString, 'g'))
        .flatMap((regex) => regexMatchAll(regex, content)) // match all regex to content, get all matches, reduce to single array
        .map((matchResult) => createDependency(matchResult, config));
}
function handleCombination(content, packageFile, config) {
    const dep = handleAny(content, packageFile, config).reduce((mergedDep, currentDep) => mergeDependency([mergedDep, currentDep]), {}); // merge fields of dependencies
    return [dep];
}
function handleRecursive(content, packageFile, config, index = 0) {
    const regexes = config.matchStrings.map((matchString) => regex_1.regEx(matchString, 'g'));
    // abort if we have no matchString anymore
    if (regexes[index] == null) {
        return [];
    }
    return regexMatchAll(regexes[index], content).flatMap((match) => {
        var _a, _b;
        // if we have a depName and a currentValue with have the minimal viable definition
        if (((_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.depName) && ((_b = match === null || match === void 0 ? void 0 : match.groups) === null || _b === void 0 ? void 0 : _b.currentValue)) {
            return createDependency(match, config);
        }
        return handleRecursive(match[0], packageFile, config, index + 1);
    });
}
function extractPackageFile(content, packageFile, config) {
    let deps;
    switch (config.matchStringsStrategy) {
        default:
        case 'any':
            deps = handleAny(content, packageFile, config);
            break;
        case 'combination':
            deps = handleCombination(content, packageFile, config);
            break;
        case 'recursive':
            deps = handleRecursive(content, packageFile, config);
            break;
    }
    // filter all null values
    deps = deps.filter(Boolean);
    if (deps.length) {
        const res = { deps, matchStrings: config.matchStrings };
        if (config.matchStringsStrategy) {
            res.matchStringsStrategy = config.matchStringsStrategy;
        }
        // copy over templates for autoreplace
        for (const field of validMatchFields.map((f) => `${f}Template`)) {
            if (config[field]) {
                res[field] = config[field];
            }
        }
        return res;
    }
    return null;
}
exports.extractPackageFile = extractPackageFile;
//# sourceMappingURL=index.js.map