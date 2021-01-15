"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const tokenizer_1 = require("./tokenizer");
function tokenTypes(input) {
    return tokenizer_1.extractRawTokens(input).map((token) => token.type);
}
describe('manager/gradle-lite/tokenizer', () => {
    it('extractTokens', () => {
        const samples = {
            ' ': [common_1.TokenType.Space],
            '\t': [common_1.TokenType.Space],
            '\r': [common_1.TokenType.Space],
            '\t\r': [common_1.TokenType.Space],
            '\r\t': [common_1.TokenType.Space],
            '// foobar': [common_1.TokenType.LineComment],
            '/* foobar */': [common_1.TokenType.MultiComment],
            '/* foo *//* bar */': [common_1.TokenType.MultiComment, common_1.TokenType.MultiComment],
            '/* foo\nbar\nbaz */': [common_1.TokenType.MultiComment],
            '/* foo\r\nbar\r\nbaz */': [common_1.TokenType.MultiComment],
            '\n\n': [common_1.TokenType.Newline, common_1.TokenType.Newline],
            ':': [common_1.TokenType.Colon],
            ';': [common_1.TokenType.Semicolon],
            '.': [common_1.TokenType.Dot],
            '==': [common_1.TokenType.Operator],
            '=': [common_1.TokenType.Assignment],
            foo: [common_1.TokenType.Word],
            'foo.bar': [common_1.TokenType.Word, common_1.TokenType.Dot, common_1.TokenType.Word],
            'foo()': [common_1.TokenType.Word, common_1.TokenType.LeftParen, common_1.TokenType.RightParen],
            'foo[]': [common_1.TokenType.Word, common_1.TokenType.LeftBracket, common_1.TokenType.RightBracket],
            '{{}}': [
                common_1.TokenType.LeftBrace,
                common_1.TokenType.LeftBrace,
                common_1.TokenType.RightBrace,
                common_1.TokenType.RightBrace,
            ],
            '@': [common_1.TokenType.UnknownLexeme],
            "'\\''": [
                common_1.TokenType.SingleQuotedStart,
                common_1.TokenType.EscapedChar,
                common_1.TokenType.SingleQuotedFinish,
            ],
            "'\\\"'": [
                common_1.TokenType.SingleQuotedStart,
                common_1.TokenType.EscapedChar,
                common_1.TokenType.SingleQuotedFinish,
            ],
            "'\\'\\\"'": [
                common_1.TokenType.SingleQuotedStart,
                common_1.TokenType.EscapedChar,
                common_1.TokenType.EscapedChar,
                common_1.TokenType.SingleQuotedFinish,
            ],
            "'x'": [
                common_1.TokenType.SingleQuotedStart,
                common_1.TokenType.Char,
                common_1.TokenType.SingleQuotedFinish,
            ],
            "'\n'": [
                common_1.TokenType.SingleQuotedStart,
                common_1.TokenType.Char,
                common_1.TokenType.SingleQuotedFinish,
            ],
            "'$x'": [
                common_1.TokenType.SingleQuotedStart,
                common_1.TokenType.Char,
                common_1.TokenType.Char,
                common_1.TokenType.SingleQuotedFinish,
            ],
            "''''''": ['tripleQuotedStart', 'tripleQuotedFinish'],
            "'''x'''": ['tripleQuotedStart', common_1.TokenType.Char, 'tripleQuotedFinish'],
            "'''\n'''": ['tripleQuotedStart', common_1.TokenType.Char, 'tripleQuotedFinish'],
            "'''\\''''": [
                'tripleQuotedStart',
                common_1.TokenType.EscapedChar,
                'tripleQuotedFinish',
            ],
            "'''\\\"'''": [
                'tripleQuotedStart',
                common_1.TokenType.EscapedChar,
                'tripleQuotedFinish',
            ],
            "'''\\'\\\"'''": [
                'tripleQuotedStart',
                common_1.TokenType.EscapedChar,
                common_1.TokenType.EscapedChar,
                'tripleQuotedFinish',
            ],
            '""': [common_1.TokenType.DoubleQuotedStart, common_1.TokenType.DoubleQuotedFinish],
            '"\\""': [
                common_1.TokenType.DoubleQuotedStart,
                common_1.TokenType.EscapedChar,
                common_1.TokenType.DoubleQuotedFinish,
            ],
            '"\\\'"': [
                common_1.TokenType.DoubleQuotedStart,
                common_1.TokenType.EscapedChar,
                common_1.TokenType.DoubleQuotedFinish,
            ],
            '"\\"\\\'"': [
                common_1.TokenType.DoubleQuotedStart,
                common_1.TokenType.EscapedChar,
                common_1.TokenType.EscapedChar,
                common_1.TokenType.DoubleQuotedFinish,
            ],
            '"x"': [
                common_1.TokenType.DoubleQuotedStart,
                common_1.TokenType.Char,
                common_1.TokenType.DoubleQuotedFinish,
            ],
            '"\n"': [
                common_1.TokenType.DoubleQuotedStart,
                common_1.TokenType.Char,
                common_1.TokenType.DoubleQuotedFinish,
            ],
            // eslint-disable-next-line no-template-curly-in-string
            '"${x}"': [
                common_1.TokenType.DoubleQuotedStart,
                common_1.TokenType.Variable,
                common_1.TokenType.DoubleQuotedFinish,
            ],
            // eslint-disable-next-line no-template-curly-in-string
            '"${foo}"': [
                common_1.TokenType.DoubleQuotedStart,
                common_1.TokenType.Variable,
                common_1.TokenType.DoubleQuotedFinish,
            ],
            // eslint-disable-next-line no-template-curly-in-string
            '"${x()}"': [
                common_1.TokenType.DoubleQuotedStart,
                common_1.TokenType.IgnoredInterpolationStart,
                common_1.TokenType.UnknownLexeme,
                common_1.TokenType.UnknownLexeme,
                common_1.TokenType.UnknownLexeme,
                common_1.TokenType.RightBrace,
                common_1.TokenType.DoubleQuotedFinish,
            ],
            // eslint-disable-next-line no-template-curly-in-string
            '"${x{}}"': [
                common_1.TokenType.DoubleQuotedStart,
                common_1.TokenType.IgnoredInterpolationStart,
                common_1.TokenType.UnknownLexeme,
                common_1.TokenType.LeftBrace,
                common_1.TokenType.RightBrace,
                common_1.TokenType.RightBrace,
                common_1.TokenType.DoubleQuotedFinish,
            ],
        };
        for (const [str, result] of Object.entries(samples)) {
            expect(tokenTypes(str)).toStrictEqual(result);
        }
    });
    it('tokenize', () => {
        const samples = {
            '@': [{ type: common_1.TokenType.UnknownFragment }],
            '@@@': [{ type: common_1.TokenType.UnknownFragment }],
            "'foobar'": [{ type: common_1.TokenType.String, value: 'foobar' }],
            "'\\b'": [{ type: common_1.TokenType.String, value: '\b' }],
            "'''foobar'''": [{ type: common_1.TokenType.String, value: 'foobar' }],
            '"foobar"': [{ type: common_1.TokenType.String, value: 'foobar' }],
            '"$foo"': [
                {
                    type: common_1.TokenType.StringInterpolation,
                    children: [{ type: common_1.TokenType.Variable }],
                },
            ],
            // eslint-disable-next-line no-template-curly-in-string
            '" foo ${ bar } baz "': [
                {
                    type: common_1.TokenType.StringInterpolation,
                    children: [
                        { type: common_1.TokenType.String, value: ' foo ' },
                        { type: common_1.TokenType.Variable, value: 'bar' },
                        { type: common_1.TokenType.String, value: ' baz ' },
                    ],
                },
            ],
            // eslint-disable-next-line no-template-curly-in-string
            '"${ x + y }"': [{ type: common_1.TokenType.StringInterpolation, isValid: false }],
        };
        for (const [str, result] of Object.entries(samples)) {
            expect(tokenizer_1.tokenize(str)).toMatchObject(result);
        }
    });
});
//# sourceMappingURL=tokenizer.spec.js.map