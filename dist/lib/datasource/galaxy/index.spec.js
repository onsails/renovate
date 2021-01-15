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
const res1 = fs_1.default.readFileSync('lib/datasource/galaxy/__fixtures__/timezone', 'utf8');
const empty = fs_1.default.readFileSync('lib/datasource/galaxy/__fixtures__/empty', 'utf8');
const baseUrl = 'https://galaxy.ansible.com/';
describe('datasource/galaxy', () => {
    describe('getReleases', () => {
        beforeEach(() => {
            httpMock.setup();
        });
        afterEach(() => {
            httpMock.reset();
        });
        it('returns null for empty result', async () => {
            httpMock
                .scope(baseUrl)
                .get('/api/v1/roles/?owner__username=non_existent_crate&name=undefined')
                .reply(200);
            expect(await __1.getPkgReleases({ datasource: _1.id, depName: 'non_existent_crate' })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for missing fields', async () => {
            httpMock
                .scope(baseUrl)
                .get('/api/v1/roles/?owner__username=non_existent_crate&name=undefined')
                .reply(200, undefined);
            expect(await __1.getPkgReleases({ datasource: _1.id, depName: 'non_existent_crate' })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for empty list', async () => {
            httpMock
                .scope(baseUrl)
                .get('/api/v1/roles/?owner__username=non_existent_crate&name=undefined')
                .reply(200, '\n');
            expect(await __1.getPkgReleases({ datasource: _1.id, depName: 'non_existent_crate' })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for 404', async () => {
            httpMock
                .scope(baseUrl)
                .get('/api/v1/roles/?owner__username=some_crate&name=undefined')
                .reply(404);
            expect(await __1.getPkgReleases({ datasource: _1.id, depName: 'some_crate' })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for unknown error', async () => {
            httpMock
                .scope(baseUrl)
                .get('/api/v1/roles/?owner__username=some_crate&name=undefined')
                .replyWithError('some unknown error');
            expect(await __1.getPkgReleases({ datasource: _1.id, depName: 'some_crate' })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data', async () => {
            httpMock
                .scope(baseUrl)
                .get('/api/v1/roles/?owner__username=yatesr&name=timezone')
                .reply(200, res1);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'yatesr.timezone',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(res).toBeDefined();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('return null if searching random username and project name', async () => {
            httpMock
                .scope(baseUrl)
                .get('/api/v1/roles/?owner__username=foo&name=bar')
                .reply(200, empty);
            const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foo.bar' });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws for 5xx', async () => {
            httpMock
                .scope(baseUrl)
                .get('/api/v1/roles/?owner__username=some_crate&name=undefined')
                .reply(502);
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
        it('throws for 404', async () => {
            httpMock
                .scope(baseUrl)
                .get('/api/v1/roles/?owner__username=foo&name=bar')
                .reply(404);
            const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foo.bar' });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map