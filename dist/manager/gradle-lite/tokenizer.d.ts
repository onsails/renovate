import { StringInterpolation, Token, TokenType } from './common';
export declare const rawLexer: {
    main: {
        lineComment: {
            match: RegExp;
        };
        multiComment: {
            match: RegExp;
            lineBreaks: boolean;
        };
        newline: {
            match: RegExp;
            lineBreaks: boolean;
        };
        space: {
            match: RegExp;
        };
        semicolon: string;
        colon: string;
        dot: string;
        comma: string;
        operator: RegExp;
        assignment: string;
        word: {
            match: RegExp;
        };
        leftParen: {
            match: string;
        };
        rightParen: {
            match: string;
        };
        leftBracket: {
            match: string;
        };
        rightBracket: {
            match: string;
        };
        leftBrace: {
            match: string;
            push: string;
        };
        rightBrace: {
            match: string;
            pop: number;
        };
        tripleQuotedStart: {
            match: string;
            push: TokenType;
        };
        tripleDoubleQuotedStart: {
            match: string;
            push: TokenType;
        };
        singleQuotedStart: {
            match: string;
            push: TokenType;
        };
        doubleQuotedStart: {
            match: string;
            push: TokenType;
        };
        unknownChar: {
            match: RegExp;
        };
    };
    tripleQuotedStart: {
        tripleQuotedFinish: {
            match: string;
            pop: number;
        };
        char: {
            match: RegExp;
            lineBreaks: boolean;
        };
        escapedChar: {
            match: RegExp;
            value: (x: string) => string;
        };
    };
    tripleDoubleQuotedStart: {
        tripleQuotedFinish: {
            match: string;
            pop: number;
        };
        char: {
            match: RegExp;
            lineBreaks: boolean;
        };
        escapedChar: {
            match: RegExp;
            value: (x: string) => string;
        };
    };
    singleQuotedStart: {
        singleQuotedFinish: {
            match: string;
            pop: number;
        };
        char: {
            match: RegExp;
            lineBreaks: boolean;
        };
        escapedChar: {
            match: RegExp;
            value: (x: string) => string;
        };
    };
    doubleQuotedStart: {
        doubleQuotedFinish: {
            match: string;
            pop: number;
        };
        variable: {
            match: RegExp;
            value: (x: string) => string;
        };
        ignoredInterpolation: {
            match: RegExp;
            push: TokenType;
        };
        char: {
            match: RegExp;
            lineBreaks: boolean;
        };
        escapedChar: {
            match: RegExp;
            value: (x: string) => string;
        };
    };
    ignoredInterpolation: {
        leftBrace: {
            match: string;
            push: TokenType;
        };
        rightBrace: {
            match: string;
            pop: number;
        };
        unknownChar: {
            match: RegExp;
            lineBreaks: boolean;
        };
    };
};
export declare function isInterpolationToken(token: Token): token is StringInterpolation;
export declare function extractRawTokens(input: string): Token[];
export declare function processTokens(tokens: Token[]): Token[];
export declare function tokenize(input: string): Token[];
