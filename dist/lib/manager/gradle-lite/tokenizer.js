"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = exports.processTokens = exports.extractRawTokens = exports.isInterpolationToken = exports.rawLexer = void 0;
const moo_1 = __importDefault(require("moo"));
const common_1 = require("./common");
const escapedCharRegex = /\\['"bfnrt\\]/;
const escapedChars = {
    [common_1.TokenType.EscapedChar]: {
        match: escapedCharRegex,
        value: (x) => ({
            "\\'": "'",
            '\\"': '"',
            '\\b': '\b',
            '\\f': '\f',
            '\\n': '\n',
            '\\r': '\r',
            '\\t': '\t',
            '\\\\': '\\',
        }[x]),
    },
};
exports.rawLexer = {
    // Top-level Groovy lexemes
    main: {
        [common_1.TokenType.LineComment]: { match: /\/\/.*?$/ },
        [common_1.TokenType.MultiComment]: { match: /\/\*[^]*?\*\//, lineBreaks: true },
        [common_1.TokenType.Newline]: { match: /\r?\n/, lineBreaks: true },
        [common_1.TokenType.Space]: { match: /[ \t\r]+/ },
        [common_1.TokenType.Semicolon]: ';',
        [common_1.TokenType.Colon]: ':',
        [common_1.TokenType.Dot]: '.',
        [common_1.TokenType.Comma]: ',',
        [common_1.TokenType.Operator]: /(?:==|\+=?|-=?|\/=?|\*\*?|\.+|:)/,
        [common_1.TokenType.Assignment]: '=',
        [common_1.TokenType.Word]: { match: /[a-zA-Z$_][a-zA-Z0-9$_]+/ },
        [common_1.TokenType.LeftParen]: { match: '(' },
        [common_1.TokenType.RightParen]: { match: ')' },
        [common_1.TokenType.LeftBracket]: { match: '[' },
        [common_1.TokenType.RightBracket]: { match: ']' },
        [common_1.TokenType.LeftBrace]: { match: '{', push: 'main' },
        [common_1.TokenType.RightBrace]: { match: '}', pop: 1 },
        [common_1.TokenType.TripleSingleQuotedStart]: {
            match: "'''",
            push: common_1.TokenType.TripleSingleQuotedStart,
        },
        [common_1.TokenType.TripleDoubleQuotedStart]: {
            match: '"""',
            push: common_1.TokenType.TripleDoubleQuotedStart,
        },
        [common_1.TokenType.SingleQuotedStart]: {
            match: "'",
            push: common_1.TokenType.SingleQuotedStart,
        },
        [common_1.TokenType.DoubleQuotedStart]: {
            match: '"',
            push: common_1.TokenType.DoubleQuotedStart,
        },
        [common_1.TokenType.UnknownLexeme]: { match: /./ },
    },
    // Tokenize triple-quoted string literal characters
    [common_1.TokenType.TripleSingleQuotedStart]: {
        ...escapedChars,
        [common_1.TokenType.TripleQuotedFinish]: { match: "'''", pop: 1 },
        [common_1.TokenType.Char]: { match: /[^]/, lineBreaks: true },
    },
    [common_1.TokenType.TripleDoubleQuotedStart]: {
        ...escapedChars,
        [common_1.TokenType.TripleQuotedFinish]: { match: '"""', pop: 1 },
        [common_1.TokenType.Char]: { match: /[^]/, lineBreaks: true },
    },
    // Tokenize single-quoted string literal characters
    [common_1.TokenType.SingleQuotedStart]: {
        ...escapedChars,
        [common_1.TokenType.SingleQuotedFinish]: { match: "'", pop: 1 },
        [common_1.TokenType.Char]: { match: /[^]/, lineBreaks: true },
    },
    // Tokenize double-quoted string literal chars and interpolations
    [common_1.TokenType.DoubleQuotedStart]: {
        ...escapedChars,
        [common_1.TokenType.DoubleQuotedFinish]: { match: '"', pop: 1 },
        variable: {
            // Supported: ${foo}, $foo, ${ foo.bar.baz }, $foo.bar.baz
            match: /\${\s*[a-zA-Z_][a-zA-Z0-9_]*(?:\s*\.\s*[a-zA-Z_][a-zA-Z0-9_]*)*\s*}|\$[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*/,
            value: (x) => x.replace(/^\${?\s*/, '').replace(/\s*}$/, ''),
        },
        [common_1.TokenType.IgnoredInterpolationStart]: {
            match: /\${/,
            push: common_1.TokenType.IgnoredInterpolationStart,
        },
        [common_1.TokenType.Char]: { match: /[^]/, lineBreaks: true },
    },
    // Ignore interpolation of complex expressions˙,
    // but track the balance of braces to find the end of interpolation.
    [common_1.TokenType.IgnoredInterpolationStart]: {
        [common_1.TokenType.LeftBrace]: {
            match: '{',
            push: common_1.TokenType.IgnoredInterpolationStart,
        },
        [common_1.TokenType.RightBrace]: { match: '}', pop: 1 },
        [common_1.TokenType.UnknownLexeme]: { match: /[^]/, lineBreaks: true },
    },
};
/*
  Turn UnknownLexeme chars to UnknownFragment strings
 */
function processUnknownLexeme(acc, token) {
    if (token.type === common_1.TokenType.UnknownLexeme) {
        const prevToken = acc[acc.length - 1];
        if ((prevToken === null || prevToken === void 0 ? void 0 : prevToken.type) === common_1.TokenType.UnknownFragment) {
            prevToken.value += token.value;
        }
        else {
            acc.push({ ...token, type: common_1.TokenType.UnknownFragment });
        }
    }
    else {
        acc.push(token);
    }
    return acc;
}
//
// Turn separated chars of string literal to single String token
//
function processChar(acc, token) {
    const tokenType = token.type;
    const prevToken = acc[acc.length - 1];
    if ([common_1.TokenType.Char, common_1.TokenType.EscapedChar].includes(tokenType)) {
        if ((prevToken === null || prevToken === void 0 ? void 0 : prevToken.type) === common_1.TokenType.String) {
            prevToken.value += token.value;
        }
        else {
            acc.push({ ...token, type: common_1.TokenType.String });
        }
    }
    else {
        acc.push(token);
    }
    return acc;
}
function isInterpolationToken(token) {
    return (token === null || token === void 0 ? void 0 : token.type) === common_1.TokenType.StringInterpolation;
}
exports.isInterpolationToken = isInterpolationToken;
//
// Turn all tokens between double quote pairs into StringInterpolation token
//
function processInterpolation(acc, token) {
    if (token.type === common_1.TokenType.DoubleQuotedStart) {
        // This token will accumulate further strings and variables
        const interpolationToken = {
            type: common_1.TokenType.StringInterpolation,
            children: [],
            isValid: true,
            isComplete: false,
            offset: token.offset + 1,
            value: '',
        };
        acc.push(interpolationToken);
        return acc;
    }
    const prevToken = acc[acc.length - 1];
    if (isInterpolationToken(prevToken) && !prevToken.isComplete) {
        const type = token.type;
        if (type === common_1.TokenType.DoubleQuotedFinish) {
            if (prevToken.isValid &&
                prevToken.children.every(({ type: t }) => t === common_1.TokenType.String)) {
                // Nothing to interpolate, replace to String
                acc[acc.length - 1] = {
                    type: common_1.TokenType.String,
                    value: prevToken.children.map(({ value }) => value).join(''),
                    offset: prevToken.offset,
                };
                return acc;
            }
            prevToken.isComplete = true;
        }
        else if (type === common_1.TokenType.String || type === common_1.TokenType.Variable) {
            prevToken.children.push(token);
        }
        else {
            prevToken.children.push(token);
            prevToken.isValid = false;
        }
    }
    else {
        acc.push(token);
    }
    return acc;
}
const filteredTokens = [
    common_1.TokenType.Space,
    common_1.TokenType.LineComment,
    common_1.TokenType.MultiComment,
    common_1.TokenType.Newline,
    common_1.TokenType.Semicolon,
    common_1.TokenType.SingleQuotedStart,
    common_1.TokenType.SingleQuotedFinish,
    common_1.TokenType.DoubleQuotedFinish,
    common_1.TokenType.TripleSingleQuotedStart,
    common_1.TokenType.TripleDoubleQuotedStart,
    common_1.TokenType.TripleQuotedFinish,
];
function filterTokens({ type }) {
    return !filteredTokens.includes(type);
}
function extractRawTokens(input) {
    const lexer = moo_1.default.states(exports.rawLexer);
    lexer.reset(input);
    return Array.from(lexer).map(({ type, offset, value }) => ({ type, offset, value }));
}
exports.extractRawTokens = extractRawTokens;
function processTokens(tokens) {
    return tokens
        .reduce(processUnknownLexeme, [])
        .reduce(processChar, [])
        .reduce(processInterpolation, [])
        .filter(filterTokens);
}
exports.processTokens = processTokens;
function tokenize(input) {
    return processTokens(extractRawTokens(input));
}
exports.tokenize = tokenize;
//# sourceMappingURL=tokenizer.js.map