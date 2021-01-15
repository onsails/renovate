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
const body = JSON.parse(fs_1.default.readFileSync('lib/datasource/dart/__fixtures__/shared_preferences.json', 'utf8'));
const baseUrl = 'https://pub.dartlang.org/api/packages/';
describe('datasource/dart', () => {
    beforeEach(() => {
        httpMock.setup();
    });
    afterEach(() => {
        httpMock.reset();
    });
    describe('getReleases', () => {
        it('returns null for empty result', async () => {
            httpMock.scope(baseUrl).get('/non_sense').reply(200, null);
            expect(await __1.getPkgReleases({ datasource: _1.id, depName: 'non_sense' })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for empty fields', async () => {
            const withoutVersions = {
                ...body,
                versions: undefined,
            };
            httpMock
                .scope(baseUrl)
                .get('/shared_preferences')
                .reply(200, withoutVersions);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'shared_preferences',
            })).toBeNull();
            const withoutLatest = {
                ...body,
                latest: undefined,
            };
            httpMock
                .scope(baseUrl)
                .get('/shared_preferences')
                .reply(200, withoutLatest);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'shared_preferences',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for 404', async () => {
            httpMock.scope(baseUrl).get('/shared_preferences').reply(404);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'shared_preferences',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws for 5xx', async () => {
            httpMock.scope(baseUrl).get('/shared_preferences').reply(502);
            let e;
            try {
                await __1.getPkgReleases({
                    datasource: _1.id,
                    depName: 'shared_preferences',
                });
            }
            catch (err) {
                e = err;
            }
            expect(e).toBeDefined();
            expect(e).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for unknown error', async () => {
            httpMock.scope(baseUrl).get('/shared_preferences').replyWithError('');
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'shared_preferences',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data', async () => {
            httpMock.scope(baseUrl).get('/shared_preferences').reply(200, body);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'shared_preferences',
            });
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map