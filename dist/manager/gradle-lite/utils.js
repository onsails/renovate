"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVars = exports.reorderFiles = exports.toAbsolutePath = exports.isPropsFile = exports.isGradleFile = exports.interpolateString = exports.parseDependencyString = exports.isDependencyString = exports.versionLikeSubstring = void 0;
const upath_1 = __importDefault(require("upath"));
const regex_1 = require("../../util/regex");
const common_1 = require("./common");
const artifactRegex = regex_1.regEx('^[a-zA-Z][-_a-zA-Z0-9]*(?:.[a-zA-Z][-_a-zA-Z0-9]*)*$');
const versionLikeRegex = regex_1.regEx('^(?<version>[-.\\[\\](),a-zA-Z0-9+]+)');
// Extracts version-like and range-like strings
// from the beginning of input
function versionLikeSubstring(input) {
    const match = input ? versionLikeRegex.exec(input) : null;
    return match ? match.groups.version : null;
}
exports.versionLikeSubstring = versionLikeSubstring;
function isDependencyString(input) {
    const split = input === null || input === void 0 ? void 0 : input.split(':');
    if ((split === null || split === void 0 ? void 0 : split.length) !== 3) {
        return false;
    }
    const [groupId, artifactId, versionPart] = split;
    return (groupId &&
        artifactId &&
        versionPart &&
        artifactRegex.test(groupId) &&
        artifactRegex.test(artifactId) &&
        versionPart === versionLikeSubstring(versionPart));
}
exports.isDependencyString = isDependencyString;
function parseDependencyString(input) {
    if (!isDependencyString(input)) {
        return null;
    }
    const [groupId, artifactId, currentValue] = input === null || input === void 0 ? void 0 : input.split(':');
    return {
        depName: `${groupId}:${artifactId}`,
        currentValue,
    };
}
exports.parseDependencyString = parseDependencyString;
function interpolateString(childTokens, variables) {
    const resolvedSubstrings = [];
    for (const childToken of childTokens) {
        const type = childToken.type;
        if (type === common_1.TokenType.String) {
            resolvedSubstrings.push(childToken.value);
        }
        else if (type === common_1.TokenType.Variable) {
            const varName = childToken.value;
            const varData = variables[varName];
            if (varData) {
                resolvedSubstrings.push(varData.value);
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }
    return resolvedSubstrings.join('');
}
exports.interpolateString = interpolateString;
function isGradleFile(path) {
    const filename = upath_1.default.basename(path).toLowerCase();
    return filename.endsWith('.gradle') || filename.endsWith('.gradle.kts');
}
exports.isGradleFile = isGradleFile;
function isPropsFile(path) {
    const filename = upath_1.default.basename(path).toLowerCase();
    return filename === 'gradle.properties';
}
exports.isPropsFile = isPropsFile;
function toAbsolutePath(packageFile) {
    return upath_1.default.join(packageFile.replace(/^[/\\]*/, '/'));
}
exports.toAbsolutePath = toAbsolutePath;
function reorderFiles(packageFiles) {
    return packageFiles.sort((x, y) => {
        const xAbs = toAbsolutePath(x);
        const yAbs = toAbsolutePath(y);
        const xDir = upath_1.default.dirname(xAbs);
        const yDir = upath_1.default.dirname(yAbs);
        if (xDir === yDir) {
            if ((isGradleFile(xAbs) && isGradleFile(yAbs)) ||
                (isPropsFile(xAbs) && isPropsFile(yAbs))) {
                if (xAbs > yAbs) {
                    return 1;
                }
                if (xAbs < yAbs) {
                    return -1;
                }
            }
            else if (isGradleFile(xAbs)) {
                return 1;
            }
            else if (isGradleFile(yAbs)) {
                return -1;
            }
        }
        else if (xDir.startsWith(yDir)) {
            return 1;
        }
        else if (yDir.startsWith(xDir)) {
            return -1;
        }
        return 0;
    });
}
exports.reorderFiles = reorderFiles;
function getVars(registry, dir, vars = registry[dir] || {}) {
    const dirAbs = toAbsolutePath(dir);
    const parentDir = upath_1.default.dirname(dirAbs);
    if (parentDir === dirAbs) {
        return vars;
    }
    const parentVars = registry[parentDir] || {};
    return getVars(registry, parentDir, { ...parentVars, ...vars });
}
exports.getVars = getVars;
//# sourceMappingURL=utils.js.map