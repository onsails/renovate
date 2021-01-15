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
const _hostRules = __importStar(require("../../util/host-rules"));
const _1 = require(".");
const hostRules = _hostRules;
let res1 = fs_1.default.readFileSync('lib/datasource/hex/__fixtures__/certifi.json', 'utf8');
res1 = JSON.parse(res1);
jest.mock('../../util/host-rules');
const baseUrl = 'https://hex.pm/api/packages/';
describe('datasource/hex', () => {
    beforeEach(() => {
        hostRules.hosts.mockReturnValue([]);
        hostRules.find.mockReturnValue({});
        httpMock.setup();
    });
    afterEach(() => {
        jest.resetAllMocks();
        httpMock.reset();
    });
    describe('getReleases', () => {
        it('returns null for empty result', async () => {
            httpMock.scope(baseUrl).get('/non_existent_package').reply(200, null);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'non_existent_package',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for missing fields', async () => {
            httpMock.scope(baseUrl).get('/non_existent_package').reply(200, {});
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'non_existent_package',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for 404', async () => {
            httpMock.scope(baseUrl).get('/some_package').reply(404);
            expect(await __1.getPkgReleases({ datasource: _1.id, depName: 'some_package' })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for 401', async () => {
            httpMock.scope(baseUrl).get('/some_package').reply(401);
            expect(await __1.getPkgReleases({ datasource: _1.id, depName: 'some_package' })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws for 429', async () => {
            httpMock.scope(baseUrl).get('/some_crate').reply(429);
            await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'some_crate' })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws for 5xx', async () => {
            httpMock.scope(baseUrl).get('/some_crate').reply(502);
            await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'some_crate' })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for unknown error', async () => {
            httpMock.scope(baseUrl).get('/some_package').replyWithError('');
            expect(await __1.getPkgReleases({ datasource: _1.id, depName: 'some_package' })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null with wrong auth token', async () => {
            httpMock.scope(baseUrl).get('/certifi').reply(401);
            hostRules.find.mockReturnValueOnce({ token: 'this_simple_token' });
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'certifi',
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data', async () => {
            httpMock.scope(baseUrl).get('/certifi').reply(200, res1);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'certifi',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(res).toBeDefined();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('process public repo without auth', async () => {
            httpMock.scope(baseUrl).get('/certifi').reply(200, res1);
            hostRules.find.mockReturnValueOnce({});
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'certifi',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(res).toBeDefined();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map