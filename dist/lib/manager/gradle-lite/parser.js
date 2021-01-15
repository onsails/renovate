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
exports.parseProps = exports.parseGradle = void 0;
const url = __importStar(require("url"));
const is_1 = __importDefault(require("@sindresorhus/is"));
const logger_1 = require("../../logger");
const regex_1 = require("../../util/regex");
const common_1 = require("./common");
const tokenizer_1 = require("./tokenizer");
const utils_1 = require("./utils");
function matchTokens(tokens, matchers) {
    let lookaheadCount = 0;
    const result = {};
    for (let idx = 0; idx < matchers.length; idx += 1) {
        const token = tokens[idx];
        const matcher = matchers[idx];
        if (!token) {
            if (matcher.lookahead) {
                break;
            }
            return null;
        }
        const typeMatches = is_1.default.string(matcher.matchType)
            ? matcher.matchType === token.type
            : matcher.matchType.includes(token.type);
        if (!typeMatches) {
            return null;
        }
        if (is_1.default.string(matcher.matchValue) && token.value !== matcher.matchValue) {
            return null;
        }
        if (is_1.default.array(matcher.matchValue) &&
            !matcher.matchValue.includes(token.value)) {
            return null;
        }
        lookaheadCount = matcher.lookahead ? lookaheadCount + 1 : 0;
        if (matcher.tokenMapKey) {
            result[matcher.tokenMapKey] = token;
        }
    }
    tokens.splice(0, matchers.length - lookaheadCount);
    return result;
}
const endOfInstruction = {
    // Ensure we skip assignments of complex expressions (not strings)
    matchType: [
        common_1.TokenType.Semicolon,
        common_1.TokenType.RightBrace,
        common_1.TokenType.Word,
        common_1.TokenType.String,
        common_1.TokenType.StringInterpolation,
    ],
    lookahead: true,
};
const potentialStringTypes = [common_1.TokenType.String, common_1.TokenType.Word];
function coercePotentialString(token, variables) {
    const tokenType = token === null || token === void 0 ? void 0 : token.type;
    if (tokenType === common_1.TokenType.String) {
        return token === null || token === void 0 ? void 0 : token.value;
    }
    if (tokenType === common_1.TokenType.Word &&
        typeof variables[token === null || token === void 0 ? void 0 : token.value] !== 'undefined') {
        return variables[token.value].value;
    }
    return null;
}
function handleAssignment({ packageFile, tokenMap, }) {
    const { keyToken, valToken } = tokenMap;
    const variableData = {
        key: keyToken.value,
        value: valToken.value,
        fileReplacePosition: valToken.offset,
        packageFile,
    };
    return { vars: { [variableData.key]: variableData } };
}
function processDepString({ packageFile, tokenMap, }) {
    const { token } = tokenMap;
    const dep = utils_1.parseDependencyString(token.value);
    if (dep) {
        dep.managerData = {
            fileReplacePosition: token.offset + dep.depName.length + 1,
            packageFile,
        };
        return { deps: [dep] };
    }
    return null;
}
function processDepInterpolation({ tokenMap, variables, }) {
    const token = tokenMap.depInterpolation;
    const interpolationResult = utils_1.interpolateString(token.children, variables);
    if (interpolationResult && utils_1.isDependencyString(interpolationResult)) {
        const dep = utils_1.parseDependencyString(interpolationResult);
        if (dep) {
            const lastChild = token.children[token.children.length - 1];
            const lastChildValue = lastChild === null || lastChild === void 0 ? void 0 : lastChild.value;
            const variable = variables[lastChildValue];
            if ((lastChild === null || lastChild === void 0 ? void 0 : lastChild.type) === common_1.TokenType.Variable &&
                variable &&
                (variable === null || variable === void 0 ? void 0 : variable.value) === dep.currentValue) {
                dep.managerData = {
                    fileReplacePosition: variable.fileReplacePosition,
                    packageFile: variable.packageFile,
                };
                dep.groupName = variable.key;
                return { deps: [dep] };
            }
        }
    }
    return null;
}
function processPlugin({ tokenMap, packageFile, }) {
    const { pluginName, pluginVersion, methodName } = tokenMap;
    const plugin = pluginName.value;
    const depName = methodName.value === 'kotlin' ? `org.jetbrains.kotlin.${plugin}` : plugin;
    const lookupName = methodName.value === 'kotlin'
        ? `org.jetbrains.kotlin.${plugin}:org.jetbrains.kotlin.${plugin}.gradle.plugin`
        : `${plugin}:${plugin}.gradle.plugin`;
    const currentValue = pluginVersion.value;
    const fileReplacePosition = pluginVersion.offset;
    const dep = {
        depType: 'plugin',
        depName,
        lookupName,
        registryUrls: ['https://plugins.gradle.org/m2/'],
        currentValue,
        commitMessageTopic: `plugin ${depName}`,
        managerData: {
            fileReplacePosition,
            packageFile,
        },
    };
    return { deps: [dep] };
}
function processCustomRegistryUrl({ tokenMap, }) {
    var _a;
    const registryUrl = (_a = tokenMap.registryUrl) === null || _a === void 0 ? void 0 : _a.value;
    try {
        if (registryUrl) {
            const { host, protocol } = url.parse(registryUrl);
            if (host && protocol) {
                return { urls: [registryUrl] };
            }
        }
    }
    catch (e) {
        // no-op
    }
    return null;
}
function processPredefinedRegistryUrl({ tokenMap, }) {
    var _a;
    const registryName = (_a = tokenMap.registryName) === null || _a === void 0 ? void 0 : _a.value;
    const registryUrl = {
        mavenCentral: common_1.MAVEN_REPO,
        jcenter: common_1.JCENTER_REPO,
        google: common_1.GOOGLE_REPO,
    }[registryName];
    return { urls: [registryUrl] };
}
function processLongFormDep({ tokenMap, variables, packageFile, }) {
    const groupId = coercePotentialString(tokenMap.groupId, variables);
    const artifactId = coercePotentialString(tokenMap.artifactId, variables);
    const version = coercePotentialString(tokenMap.version, variables);
    const dep = utils_1.parseDependencyString([groupId, artifactId, version].join(':'));
    if (dep) {
        const versionToken = tokenMap.version;
        if (versionToken.type === common_1.TokenType.Word) {
            const variable = variables[versionToken.value];
            dep.managerData = {
                fileReplacePosition: variable.fileReplacePosition,
                packageFile: variable.packageFile,
            };
        }
        else {
            dep.managerData = {
                fileReplacePosition: versionToken.offset,
                packageFile,
            };
        }
        return { deps: [dep] };
    }
    return null;
}
const matcherConfigs = [
    {
        // foo = 'bar'
        matchers: [
            { matchType: common_1.TokenType.Word, tokenMapKey: 'keyToken' },
            { matchType: common_1.TokenType.Assignment },
            { matchType: common_1.TokenType.String, tokenMapKey: 'valToken' },
            endOfInstruction,
        ],
        handler: handleAssignment,
    },
    {
        // 'foo.bar:baz:1.2.3'
        matchers: [
            {
                matchType: common_1.TokenType.String,
                tokenMapKey: 'token',
            },
        ],
        handler: processDepString,
    },
    {
        // "foo.bar:baz:${bazVersion}"
        matchers: [
            {
                matchType: common_1.TokenType.StringInterpolation,
                tokenMapKey: 'depInterpolation',
            },
        ],
        handler: processDepInterpolation,
    },
    {
        // id 'foo.bar' version '1.2.3'
        matchers: [
            {
                matchType: common_1.TokenType.Word,
                matchValue: ['id', 'kotlin'],
                tokenMapKey: 'methodName',
            },
            { matchType: common_1.TokenType.String, tokenMapKey: 'pluginName' },
            { matchType: common_1.TokenType.Word, matchValue: 'version' },
            { matchType: common_1.TokenType.String, tokenMapKey: 'pluginVersion' },
            endOfInstruction,
        ],
        handler: processPlugin,
    },
    {
        // id('foo.bar') version '1.2.3'
        matchers: [
            {
                matchType: common_1.TokenType.Word,
                matchValue: ['id', 'kotlin'],
                tokenMapKey: 'methodName',
            },
            { matchType: common_1.TokenType.LeftParen },
            { matchType: common_1.TokenType.String, tokenMapKey: 'pluginName' },
            { matchType: common_1.TokenType.RightParen },
            { matchType: common_1.TokenType.Word, matchValue: 'version' },
            { matchType: common_1.TokenType.String, tokenMapKey: 'pluginVersion' },
            endOfInstruction,
        ],
        handler: processPlugin,
    },
    {
        // mavenCentral()
        matchers: [
            {
                matchType: common_1.TokenType.Word,
                matchValue: ['mavenCentral', 'jcenter', 'google'],
                tokenMapKey: 'registryName',
            },
            { matchType: common_1.TokenType.LeftParen },
            { matchType: common_1.TokenType.RightParen },
            endOfInstruction,
        ],
        handler: processPredefinedRegistryUrl,
    },
    {
        // url 'https://repo.spring.io/snapshot/'
        matchers: [
            { matchType: common_1.TokenType.Word, matchValue: ['uri', 'url'] },
            { matchType: common_1.TokenType.String, tokenMapKey: 'registryUrl' },
            endOfInstruction,
        ],
        handler: processCustomRegistryUrl,
    },
    {
        // url('https://repo.spring.io/snapshot/')
        matchers: [
            { matchType: common_1.TokenType.Word, matchValue: ['uri', 'url'] },
            { matchType: common_1.TokenType.LeftParen },
            { matchType: common_1.TokenType.String, tokenMapKey: 'registryUrl' },
            { matchType: common_1.TokenType.RightParen },
            endOfInstruction,
        ],
        handler: processCustomRegistryUrl,
    },
    {
        // group: "com.example", name: "my.dependency", version: "1.2.3"
        matchers: [
            { matchType: common_1.TokenType.Word, matchValue: 'group' },
            { matchType: common_1.TokenType.Colon },
            { matchType: potentialStringTypes, tokenMapKey: 'groupId' },
            { matchType: common_1.TokenType.Comma },
            { matchType: common_1.TokenType.Word, matchValue: 'name' },
            { matchType: common_1.TokenType.Colon },
            { matchType: potentialStringTypes, tokenMapKey: 'artifactId' },
            { matchType: common_1.TokenType.Comma },
            { matchType: common_1.TokenType.Word, matchValue: 'version' },
            { matchType: common_1.TokenType.Colon },
            { matchType: potentialStringTypes, tokenMapKey: 'version' },
            endOfInstruction,
        ],
        handler: processLongFormDep,
    },
    {
        // ("com.example", "my.dependency", "1.2.3")
        matchers: [
            { matchType: common_1.TokenType.LeftParen },
            { matchType: potentialStringTypes, tokenMapKey: 'groupId' },
            { matchType: common_1.TokenType.Comma },
            { matchType: potentialStringTypes, tokenMapKey: 'artifactId' },
            { matchType: common_1.TokenType.Comma },
            { matchType: potentialStringTypes, tokenMapKey: 'version' },
            { matchType: common_1.TokenType.RightParen },
        ],
        handler: processLongFormDep,
    },
    {
        // (group = "com.example", name = "my.dependency", version = "1.2.3")
        matchers: [
            { matchType: common_1.TokenType.LeftParen },
            { matchType: common_1.TokenType.Word, matchValue: 'group' },
            { matchType: common_1.TokenType.Assignment },
            { matchType: potentialStringTypes, tokenMapKey: 'groupId' },
            { matchType: common_1.TokenType.Comma },
            { matchType: common_1.TokenType.Word, matchValue: 'name' },
            { matchType: common_1.TokenType.Assignment },
            { matchType: potentialStringTypes, tokenMapKey: 'artifactId' },
            { matchType: common_1.TokenType.Comma },
            { matchType: common_1.TokenType.Word, matchValue: 'version' },
            { matchType: common_1.TokenType.Assignment },
            { matchType: potentialStringTypes, tokenMapKey: 'version' },
            { matchType: common_1.TokenType.RightParen },
        ],
        handler: processLongFormDep,
    },
];
function tryMatch({ tokens, variables, packageFile, }) {
    for (const { matchers, handler } of matcherConfigs) {
        const tokenMap = matchTokens(tokens, matchers);
        if (tokenMap) {
            const result = handler({
                packageFile,
                variables,
                tokenMap,
            });
            if (result !== null) {
                return result;
            }
        }
    }
    tokens.shift();
    return null;
}
function parseGradle(input, initVars = {}, packageFile) {
    var _a;
    const vars = { ...initVars };
    const deps = [];
    const urls = [];
    const tokens = tokenizer_1.tokenize(input);
    let prevTokensLength = tokens.length;
    while (tokens.length) {
        const matchResult = tryMatch({ tokens, variables: vars, packageFile });
        if ((_a = matchResult === null || matchResult === void 0 ? void 0 : matchResult.deps) === null || _a === void 0 ? void 0 : _a.length) {
            deps.push(...matchResult.deps);
        }
        if (matchResult === null || matchResult === void 0 ? void 0 : matchResult.vars) {
            Object.assign(vars, matchResult.vars);
        }
        if (matchResult === null || matchResult === void 0 ? void 0 : matchResult.urls) {
            urls.push(...matchResult.urls);
        }
        // istanbul ignore if
        if (tokens.length >= prevTokensLength) {
            // Should not happen, but it's better to be prepared
            logger_1.logger.warn({ packageFile }, `${packageFile} parsing error, results can be incomplete`);
            break;
        }
        prevTokensLength = tokens.length;
    }
    return { deps, urls };
}
exports.parseGradle = parseGradle;
const propWord = '[a-zA-Z_][a-zA-Z0-9_]*(?:\\.[a-zA-Z_][a-zA-Z0-9_]*)*';
const propRegex = regex_1.regEx(`^(?<leftPart>\\s*(?<key>${propWord})\\s*=\\s*['"]?)(?<value>[^\\s'"]+)['"]?\\s*$`);
function parseProps(input, packageFile) {
    let offset = 0;
    const vars = {};
    const deps = [];
    for (const line of input.split('\n')) {
        const lineMatch = propRegex.exec(line);
        if (lineMatch) {
            const { key, value, leftPart } = lineMatch.groups;
            if (utils_1.isDependencyString(value)) {
                const dep = utils_1.parseDependencyString(value);
                deps.push({
                    ...dep,
                    managerData: {
                        fileReplacePosition: offset + leftPart.length + dep.depName.length + 1,
                        packageFile,
                    },
                });
            }
            else {
                vars[key] = {
                    key,
                    value,
                    fileReplacePosition: offset + leftPart.length,
                    packageFile,
                };
            }
        }
        offset += line.length + 1;
    }
    return { vars, deps };
}
exports.parseProps = parseProps;
//# sourceMappingURL=parser.js.map