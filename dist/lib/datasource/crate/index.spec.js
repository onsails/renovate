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
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
const httpMock = __importStar(require("../../../test/http-mock"));
const _1 = require(".");
const res1 = fs_1.default.readFileSync('lib/datasource/crate/__fixtures__/libc', 'utf8');
const res2 = fs_1.default.readFileSync('lib/datasource/crate/__fixtures__/amethyst', 'utf8');
const baseUrl = 'https://raw.githubusercontent.com/rust-lang/crates.io-index/master/';
describe('datasource/crate', () => {
    describe('getIndexSuffix', () => {
        it('returns correct suffixes', () => {
            expect(_1.getIndexSuffix('a')).toBe('1/a');
            expect(_1.getIndexSuffix('1')).toBe('1/1');
            expect(_1.getIndexSuffix('1234567')).toBe('12/34/1234567');
            expect(_1.getIndexSuffix('ab')).toBe('2/ab');
            expect(_1.getIndexSuffix('abc')).toBe('3/a/abc');
            expect(_1.getIndexSuffix('abcd')).toBe('ab/cd/abcd');
            expect(_1.getIndexSuffix('abcde')).toBe('ab/cd/abcde');
        });
    });
    describe('getReleases', () => {
        it('returns null for empty result', async () => {
            httpMock.scope(baseUrl).get('/no/n_/non_existent_crate').reply(200, {});
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'non_existent_crate',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for missing fields', async () => {
            httpMock
                .scope(baseUrl)
                .get('/no/n_/non_existent_crate')
                .reply(200, undefined);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'non_existent_crate',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for empty list', async () => {
            httpMock.scope(baseUrl).get('/no/n_/non_existent_crate').reply(200, '\n');
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'non_existent_crate',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for 404', async () => {
            httpMock.scope(baseUrl).get('/so/me/some_crate').reply(404);
            expect(await __1.getPkgReleases({ datasource: _1.id, depName: 'some_crate' })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws for 5xx', async () => {
            httpMock.scope(baseUrl).get('/so/me/some_crate').reply(502);
            let e;
            try {
                await __1.getPkgReleases({ datasource: _1.id, depName: 'some_crate' });
            }
            catch (err) {
                e = err;
            }
            expect(e).toBeDefined();
            expect(e).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for unknown error', async () => {
            httpMock.scope(baseUrl).get('/so/me/some_crate').replyWithError('');
            expect(await __1.getPkgReleases({ datasource: _1.id, depName: 'some_crate' })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data: libc', async () => {
            httpMock.scope(baseUrl).get('/li/bc/libc').reply(200, res1);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'libc',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(res).toBeDefined();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data: amethyst', async () => {
            httpMock.scope(baseUrl).get('/am/et/amethyst').reply(200, res2);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'amethyst',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(res).toBeDefined();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map