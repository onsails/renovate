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
const chalk_1 = __importDefault(require("chalk"));
const prettyStdout = __importStar(require("./pretty-stdout"));
jest.mock('chalk', () => ['bgRed', 'blue', 'gray', 'green', 'magenta', 'red'].reduce((r, c) => Object.defineProperty(r, c, { value: (s) => s }), {}));
describe('logger/pretty-stdout', () => {
    describe('getMeta(rec)', () => {
        it('returns empty string if null rec', () => {
            expect(prettyStdout.getMeta(null)).toEqual('');
        });
        it('returns empty string if empty rec', () => {
            expect(prettyStdout.getMeta({})).toEqual('');
        });
        it('returns empty string if no meta fields', () => {
            const rec = {
                foo: 'bar',
            };
            expect(prettyStdout.getMeta(rec)).toEqual('');
        });
        it('supports single meta', () => {
            const rec = {
                foo: 'bar',
                repository: 'a/b',
            };
            expect(prettyStdout.getMeta(rec)).toEqual(chalk_1.default.gray(' (repository=a/b)'));
        });
        it('supports multi meta', () => {
            const rec = {
                foo: 'bar',
                branch: 'c',
                repository: 'a/b',
                module: 'test',
            };
            expect(prettyStdout.getMeta(rec)).toEqual(chalk_1.default.gray(' (repository=a/b, branch=c) [test]'));
        });
    });
    describe('getDetails(rec)', () => {
        it('returns empty string if null rec', () => {
            expect(prettyStdout.getDetails(null)).toEqual('');
        });
        it('returns empty string if empty rec', () => {
            expect(prettyStdout.getDetails({})).toEqual('');
        });
        it('returns empty string if all are meta fields', () => {
            const rec = {
                branch: 'bar',
                v: 0,
            };
            expect(prettyStdout.getDetails(rec)).toEqual('');
        });
        it('supports a config', () => {
            const rec = {
                v: 0,
                config: {
                    a: 'b',
                    d: ['e', 'f'],
                },
            };
            expect(prettyStdout.getDetails(rec)).toMatchSnapshot();
        });
    });
    describe('formatRecord(rec)', () => {
        beforeEach(() => {
            process.env.FORCE_COLOR = '1';
        });
        afterEach(() => {
            delete process.env.FORCE_COLOR;
        });
        it('formats record', () => {
            const rec = {
                level: 10,
                msg: 'test message',
                v: 0,
                config: {
                    a: 'b',
                    d: ['e', 'f'],
                },
            };
            expect(prettyStdout.formatRecord(rec)).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=pretty-stdout.spec.js.map