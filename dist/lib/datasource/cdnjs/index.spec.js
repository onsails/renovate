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
const error_messages_1 = require("../../constants/error-messages");
const _1 = require(".");
let res1 = fs_1.default.readFileSync('lib/datasource/cdnjs/__fixtures__/d3-force.json', 'utf8');
res1 = JSON.parse(res1);
let res2 = fs_1.default.readFileSync('lib/datasource/cdnjs/__fixtures__/bulma.json', 'utf8');
res2 = JSON.parse(res2);
const baseUrl = 'https://api.cdnjs.com/';
const pathFor = (s) => `/libraries/${s.split('/').shift()}?fields=homepage,repository,assets`;
describe('datasource/cdnjs', () => {
    describe('getReleases', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            httpMock.setup();
        });
        afterEach(() => {
            httpMock.reset();
        });
        it('throws for empty result', async () => {
            httpMock.scope(baseUrl).get(pathFor('foo/bar')).reply(200, null);
            await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'foo/bar' })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws for error', async () => {
            httpMock.scope(baseUrl).get(pathFor('foo/bar')).replyWithError('error');
            await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'foo/bar' })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for 404', async () => {
            httpMock.scope(baseUrl).get(pathFor('foo/bar')).reply(404);
            expect(await __1.getPkgReleases({ datasource: _1.id, depName: 'foo/bar' })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for empty 200 OK', async () => {
            httpMock
                .scope(baseUrl)
                .get(pathFor('doesnotexist/doesnotexist'))
                .reply(200, {});
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'doesnotexist/doesnotexist',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws for 401', async () => {
            httpMock.scope(baseUrl).get(pathFor('foo/bar')).reply(401);
            await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'foo/bar' })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws for 429', async () => {
            httpMock.scope(baseUrl).get(pathFor('foo/bar')).reply(429);
            await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'foo/bar' })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws for 5xx', async () => {
            httpMock.scope(baseUrl).get(pathFor('foo/bar')).reply(502);
            await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'foo/bar' })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for unknown error', async () => {
            httpMock.scope(baseUrl).get(pathFor('foo/bar')).replyWithError('error');
            await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'foo/bar' })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data', async () => {
            httpMock
                .scope(baseUrl)
                .get(pathFor('d3-force/d3-force.js'))
                .reply(200, res1);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'd3-force/d3-force.js',
            });
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('filters releases by asset presence', async () => {
            httpMock
                .scope(baseUrl)
                .get(pathFor('bulma/only/0.7.5/style.css'))
                .reply(200, res2);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'bulma/only/0.7.5/style.css',
            });
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map