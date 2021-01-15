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
exports.extractPackageFile = void 0;
const toml_1 = __importDefault(require("@iarna/toml"));
const specifier_1 = require("@renovate/pep440/lib/specifier");
const is_1 = __importDefault(require("@sindresorhus/is"));
const datasourcePypi = __importStar(require("../../datasource/pypi"));
const logger_1 = require("../../logger");
const types_1 = require("../../types");
// based on https://www.python.org/dev/peps/pep-0508/#names
const packageRegex = /^([A-Z0-9]|[A-Z0-9][A-Z0-9._-]*[A-Z0-9])$/i;
const rangePattern = specifier_1.RANGE_PATTERN;
const specifierPartPattern = `\\s*${rangePattern.replace(/\?<\w+>/g, '?:')}\\s*`;
const specifierPattern = `${specifierPartPattern}(?:,${specifierPartPattern})*`;
function extractFromSection(pipfile, section) {
    if (!(section in pipfile)) {
        return [];
    }
    const specifierRegex = new RegExp(`^${specifierPattern}$`);
    const pipfileSection = pipfile[section];
    const deps = Object.entries(pipfileSection)
        .map((x) => {
        const [depName, requirements] = x;
        let currentValue;
        let nestedVersion;
        let skipReason;
        if (requirements.git) {
            skipReason = types_1.SkipReason.GitDependency;
        }
        else if (requirements.file) {
            skipReason = types_1.SkipReason.FileDependency;
        }
        else if (requirements.path) {
            skipReason = types_1.SkipReason.LocalDependency;
        }
        else if (requirements.version) {
            currentValue = requirements.version;
            nestedVersion = true;
        }
        else if (is_1.default.object(requirements)) {
            skipReason = types_1.SkipReason.AnyVersion;
        }
        else {
            currentValue = requirements;
        }
        if (currentValue === '*') {
            skipReason = types_1.SkipReason.AnyVersion;
        }
        if (!skipReason) {
            const packageMatches = packageRegex.exec(depName);
            if (!packageMatches) {
                logger_1.logger.debug(`Skipping dependency with malformed package name "${depName}".`);
                skipReason = types_1.SkipReason.InvalidName;
            }
            const specifierMatches = specifierRegex.exec(currentValue);
            if (!specifierMatches) {
                logger_1.logger.debug(`Skipping dependency with malformed version specifier "${currentValue}".`);
                skipReason = types_1.SkipReason.InvalidVersion;
            }
        }
        const dep = {
            depType: section,
            depName,
            managerData: {},
        };
        if (currentValue) {
            dep.currentValue = currentValue;
        }
        if (skipReason) {
            dep.skipReason = skipReason;
        }
        else {
            dep.datasource = datasourcePypi.id;
        }
        if (nestedVersion) {
            dep.managerData.nestedVersion = nestedVersion;
        }
        if (requirements.index) {
            if (is_1.default.array(pipfile.source)) {
                const source = pipfile.source.find((item) => item.name === requirements.index);
                if (source) {
                    dep.registryUrls = [source.url];
                }
            }
        }
        return dep;
    })
        .filter(Boolean);
    return deps;
}
function extractPackageFile(content) {
    var _a, _b, _c, _d;
    logger_1.logger.debug('pipenv.extractPackageFile()');
    let pipfile;
    try {
        // TODO: fix type
        pipfile = toml_1.default.parse(content);
    }
    catch (err) {
        logger_1.logger.debug({ err }, 'Error parsing Pipfile');
        return null;
    }
    const res = { deps: [] };
    if (pipfile.source) {
        res.registryUrls = pipfile.source.map((source) => source.url);
    }
    res.deps = [
        ...extractFromSection(pipfile, 'packages'),
        ...extractFromSection(pipfile, 'dev-packages'),
    ];
    if (!res.deps.length) {
        return null;
    }
    const constraints = {};
    if (is_1.default.nonEmptyString((_a = pipfile.requires) === null || _a === void 0 ? void 0 : _a.python_version)) {
        constraints.python = `== ${pipfile.requires.python_version}.*`;
    }
    else if (is_1.default.nonEmptyString((_b = pipfile.requires) === null || _b === void 0 ? void 0 : _b.python_full_version)) {
        constraints.python = `== ${pipfile.requires.python_full_version}`;
    }
    if (is_1.default.nonEmptyString((_c = pipfile.packages) === null || _c === void 0 ? void 0 : _c.pipenv)) {
        constraints.pipenv = pipfile.packages.pipenv;
    }
    else if (is_1.default.nonEmptyString((_d = pipfile['dev-packages']) === null || _d === void 0 ? void 0 : _d.pipenv)) {
        constraints.pipenv = pipfile['dev-packages'].pipenv;
    }
    res.constraints = constraints;
    return res;
}
exports.extractPackageFile = extractPackageFile;
//# sourceMappingURL=extract.js.map