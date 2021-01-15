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
// Truncated index.yaml file
const indexYaml = fs_1.default.readFileSync('lib/datasource/helm/__fixtures__/index.yaml', 'utf8');
describe('datasource/helm', () => {
    describe('getReleases', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            httpMock.setup();
        });
        afterEach(() => {
            httpMock.reset();
        });
        it('returns null if lookupName was not provided', async () => {
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: undefined,
                registryUrls: ['https://example-repository.com'],
            })).toBeNull();
        });
        it('returns null if repository was not provided', async () => {
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'some_chart',
                registryUrls: [],
            })).toBeNull();
        });
        it('returns null for empty response', async () => {
            httpMock
                .scope('https://example-repository.com')
                .get('/index.yaml')
                .reply(200, null);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'non_existent_chart',
                registryUrls: ['https://example-repository.com'],
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for missing response body', async () => {
            httpMock
                .scope('https://example-repository.com')
                .get('/index.yaml')
                .reply(200, undefined);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'non_existent_chart',
                registryUrls: ['https://example-repository.com'],
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for 404', async () => {
            httpMock
                .scope('https://example-repository.com')
                .get('/index.yaml')
                .reply(404);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'some_chart',
                registryUrls: ['https://example-repository.com'],
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws for 5xx', async () => {
            httpMock
                .scope('https://example-repository.com')
                .get('/index.yaml')
                .reply(502);
            let e;
            try {
                await __1.getPkgReleases({
                    datasource: _1.id,
                    depName: 'some_chart',
                    registryUrls: ['https://example-repository.com'],
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
            httpMock
                .scope('https://example-repository.com')
                .get('/index.yaml')
                .replyWithError('');
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'some_chart',
                registryUrls: ['https://example-repository.com'],
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null if index.yaml in response is empty', async () => {
            httpMock
                .scope('https://example-repository.com')
                .get('/index.yaml')
                .reply(200, '# A comment');
            const releases = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'non_existent_chart',
                registryUrls: ['https://example-repository.com'],
            });
            expect(releases).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null if index.yaml in response is invalid', async () => {
            const res = {
                body: `some
                     invalid:
                     [
                     yaml`,
            };
            httpMock
                .scope('https://example-repository.com')
                .get('/index.yaml')
                .reply(200, res);
            const releases = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'non_existent_chart',
                registryUrls: ['https://example-repository.com'],
            });
            expect(releases).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null if lookupName is not in index.yaml', async () => {
            httpMock
                .scope('https://example-repository.com')
                .get('/index.yaml')
                .reply(200, indexYaml);
            const releases = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'non_existent_chart',
                registryUrls: ['https://example-repository.com'],
            });
            expect(releases).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns list of versions for normal response', async () => {
            httpMock
                .scope('https://example-repository.com')
                .get('/index.yaml')
                .reply(200, indexYaml);
            const releases = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'ambassador',
                registryUrls: ['https://example-repository.com'],
            });
            expect(releases).not.toBeNull();
            expect(releases).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('adds trailing slash to subdirectories', async () => {
            httpMock
                .scope('https://example-repository.com')
                .get('/subdir/index.yaml')
                .reply(200, indexYaml);
            await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'ambassador',
                registryUrls: ['https://example-repository.com/subdir'],
            });
            const trace = httpMock.getTrace();
            expect(trace[0].url).toEqual('https://example-repository.com/subdir/index.yaml');
            expect(trace).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map