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
const datasourceGitTags = __importStar(require("../../datasource/git-tags"));
const regExps = {
    wildcard: /^.*?/,
    space: /(\s+|\/\/[^\n]*|\/\*.*\*\/)+/s,
    depsKeyword: /dependencies/,
    colon: /:/,
    beginSection: /\[/,
    endSection: /],?/,
    package: /\s*.\s*package\s*\(\s*/,
    urlKey: /url/,
    stringLiteral: /"[^"]+"/,
    comma: /,/,
    from: /from/,
    rangeOp: /\.\.[.<]/,
    exactVersion: /\.\s*exact\s*\(\s*/,
};
const WILDCARD = 'wildcard';
const SPACE = 'space';
const DEPS = 'depsKeyword';
const COLON = 'colon';
const BEGIN_SECTION = 'beginSection';
const END_SECTION = 'endSection';
const PACKAGE = 'package';
const URL_KEY = 'urlKey';
const STRING_LITERAL = 'stringLiteral';
const COMMA = 'comma';
const FROM = 'from';
const RANGE_OP = 'rangeOp';
const EXACT_VERSION = 'exactVersion';
const searchLabels = {
    wildcard: WILDCARD,
    space: SPACE,
    depsKeyword: DEPS,
    colon: COLON,
    beginSection: BEGIN_SECTION,
    endSection: END_SECTION,
    package: PACKAGE,
    urlKey: URL_KEY,
    stringLiteral: STRING_LITERAL,
    comma: COMMA,
    from: FROM,
    rangeOp: RANGE_OP,
    exactVersion: EXACT_VERSION,
};
function searchKeysForState(state) {
    switch (state) {
        case 'dependencies':
            return [SPACE, COLON, WILDCARD];
        case 'dependencies:':
            return [SPACE, BEGIN_SECTION, WILDCARD];
        case 'dependencies: [':
            return [SPACE, PACKAGE, END_SECTION];
        case '.package(':
            return [SPACE, URL_KEY, PACKAGE, END_SECTION];
        case '.package(url':
            return [SPACE, COLON, PACKAGE, END_SECTION];
        case '.package(url:':
            return [SPACE, STRING_LITERAL, PACKAGE, END_SECTION];
        case '.package(url: [depName]':
            return [SPACE, COMMA, PACKAGE, END_SECTION];
        case '.package(url: [depName],':
            return [
                SPACE,
                FROM,
                STRING_LITERAL,
                RANGE_OP,
                EXACT_VERSION,
                PACKAGE,
                END_SECTION,
            ];
        case '.package(url: [depName], .exact(':
            return [SPACE, STRING_LITERAL, PACKAGE, END_SECTION];
        case '.package(url: [depName], from':
            return [SPACE, COLON, PACKAGE, END_SECTION];
        case '.package(url: [depName], from:':
            return [SPACE, STRING_LITERAL, PACKAGE, END_SECTION];
        case '.package(url: [depName], [value]':
            return [SPACE, RANGE_OP, PACKAGE, END_SECTION];
        case '.package(url: [depName], [rangeFrom][rangeOp]':
            return [SPACE, STRING_LITERAL, PACKAGE, END_SECTION];
        default:
            return [DEPS];
    }
}
function getMatch(str, state) {
    const keys = searchKeysForState(state);
    let result = null;
    for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const regex = regExps[key];
        const label = searchLabels[key];
        const match = regex.exec(str);
        if (match) {
            const idx = match.index;
            const substr = match[0];
            const len = substr.length;
            if (idx === 0) {
                return { idx, len, label, substr };
            }
            if (!result || idx < result.idx) {
                result = { idx, len, label, substr };
            }
        }
    }
    return result;
}
function getDepName(url) {
    try {
        const { host, pathname } = new URL(url);
        if (host === 'github.com' || host === 'gitlab.com') {
            return pathname
                .replace(/^\//, '')
                .replace(/\.git$/, '')
                .replace(/\/$/, '');
        }
        return url;
    }
    catch (e) {
        return null;
    }
}
function extractPackageFile(content, packageFile = null) {
    if (!content) {
        return null;
    }
    const result = {
        packageFile,
        deps: null,
    };
    const deps = [];
    let restStr = content;
    let state = null;
    let match = getMatch(restStr, state);
    let lookupName = null;
    let currentValue = null;
    function yieldDep() {
        const depName = getDepName(lookupName);
        if (depName && currentValue) {
            const dep = {
                datasource: datasourceGitTags.id,
                depName,
                lookupName,
                currentValue,
            };
            deps.push(dep);
        }
        lookupName = null;
        currentValue = null;
    }
    while (match) {
        const { idx, len, label, substr } = match;
        // eslint-disable-next-line default-case
        switch (state) {
            case null:
                if (deps.length) {
                    break;
                }
                if (label === DEPS) {
                    state = 'dependencies';
                }
                break;
            case 'dependencies':
                if (label === COLON) {
                    state = 'dependencies:';
                }
                else if (label !== SPACE) {
                    state = null;
                }
                break;
            case 'dependencies:':
                if (label === BEGIN_SECTION) {
                    state = 'dependencies: [';
                }
                else if (label !== SPACE) {
                    state = null;
                }
                break;
            case 'dependencies: [':
                if (label === END_SECTION) {
                    yieldDep();
                    state = null;
                }
                else if (label === PACKAGE) {
                    yieldDep();
                    state = '.package(';
                }
                break;
            case '.package(':
                if (label === END_SECTION) {
                    yieldDep();
                    state = null;
                }
                else if (label === URL_KEY) {
                    state = '.package(url';
                }
                else if (label === PACKAGE) {
                    yieldDep();
                }
                break;
            case '.package(url':
                if (label === END_SECTION) {
                    yieldDep();
                    state = null;
                }
                else if (label === COLON) {
                    state = '.package(url:';
                }
                else if (label === PACKAGE) {
                    yieldDep();
                    state = '.package(';
                }
                break;
            case '.package(url:':
                if (label === END_SECTION) {
                    yieldDep();
                    state = null;
                }
                else if (label === STRING_LITERAL) {
                    lookupName = substr.replace(/^"/, '').replace(/"$/, '');
                    state = '.package(url: [depName]';
                }
                else if (label === PACKAGE) {
                    yieldDep();
                    state = '.package(';
                }
                break;
            case '.package(url: [depName]':
                if (label === END_SECTION) {
                    yieldDep();
                    state = null;
                }
                else if (label === COMMA) {
                    state = '.package(url: [depName],';
                }
                else if (label === PACKAGE) {
                    yieldDep();
                    state = '.package(';
                }
                break;
            case '.package(url: [depName],':
                if (label === END_SECTION) {
                    yieldDep();
                    state = null;
                }
                else if (label === FROM) {
                    currentValue = substr;
                    state = '.package(url: [depName], from';
                }
                else if (label === STRING_LITERAL) {
                    currentValue = substr;
                    state = '.package(url: [depName], [value]';
                }
                else if (label === RANGE_OP) {
                    currentValue = substr;
                    state = '.package(url: [depName], [rangeFrom][rangeOp]';
                }
                else if (label === EXACT_VERSION) {
                    state = '.package(url: [depName], .exact(';
                }
                else if (label === PACKAGE) {
                    yieldDep();
                    state = '.package(';
                }
                break;
            case '.package(url: [depName], .exact(':
                if (label === END_SECTION) {
                    yieldDep();
                    state = null;
                }
                else if (label === STRING_LITERAL) {
                    currentValue = substr.slice(1, substr.length - 1);
                    yieldDep();
                }
                else if (label === PACKAGE) {
                    yieldDep();
                    state = '.package(';
                }
                break;
            case '.package(url: [depName], from':
                if (label === END_SECTION) {
                    yieldDep();
                    state = null;
                }
                else if (label === COLON) {
                    currentValue += substr;
                    state = '.package(url: [depName], from:';
                }
                else if (label === SPACE) {
                    currentValue += substr;
                }
                else if (label === PACKAGE) {
                    yieldDep();
                    state = '.package(';
                }
                break;
            case '.package(url: [depName], from:':
                if (label === END_SECTION) {
                    yieldDep();
                    state = null;
                }
                else if (label === STRING_LITERAL) {
                    currentValue += substr;
                    yieldDep();
                    state = 'dependencies: [';
                }
                else if (label === SPACE) {
                    currentValue += substr;
                }
                else if (label === PACKAGE) {
                    yieldDep();
                    state = '.package(';
                }
                break;
            case '.package(url: [depName], [value]':
                if (label === END_SECTION) {
                    yieldDep();
                    state = null;
                }
                else if (label === RANGE_OP) {
                    currentValue += substr;
                    state = '.package(url: [depName], [rangeFrom][rangeOp]';
                }
                else if (label === SPACE) {
                    currentValue += substr;
                }
                else if (label === PACKAGE) {
                    yieldDep();
                    state = '.package(';
                }
                break;
            case '.package(url: [depName], [rangeFrom][rangeOp]':
                if (label === END_SECTION) {
                    yieldDep();
                    state = null;
                }
                else if (label === STRING_LITERAL) {
                    currentValue += substr;
                    state = 'dependencies: [';
                }
                else if (label === SPACE) {
                    currentValue += substr;
                }
                else if (label === PACKAGE) {
                    yieldDep();
                    state = '.package(';
                }
                break;
        }
        restStr = restStr.slice(idx + len);
        match = getMatch(restStr, state);
    }
    return deps.length ? { ...result, deps } : null;
}
exports.extractPackageFile = extractPackageFile;
//# sourceMappingURL=extract.js.map