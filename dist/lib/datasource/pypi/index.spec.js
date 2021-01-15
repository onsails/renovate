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
const res1 = fs_1.default.readFileSync('lib/datasource/pypi/__fixtures__/azure-cli-monitor.json');
const res2 = fs_1.default.readFileSync('lib/datasource/pypi/__fixtures__/azure-cli-monitor-updated.json');
const htmlResponse = fs_1.default.readFileSync('lib/datasource/pypi/__fixtures__/versions-html.html');
const badResponse = fs_1.default.readFileSync('lib/datasource/pypi/__fixtures__/versions-html-badfile.html');
const dataRequiresPythonResponse = fs_1.default.readFileSync('lib/datasource/pypi/__fixtures__/versions-html-data-requires-python.html');
const mixedHyphensResponse = fs_1.default.readFileSync('lib/datasource/pypi/__fixtures__/versions-html-mixed-hyphens.html');
const baseUrl = 'https://pypi.org/pypi';
describe('datasource/pypi', () => {
    describe('getReleases', () => {
        const OLD_ENV = process.env;
        beforeEach(() => {
            process.env = { ...OLD_ENV };
            delete process.env.PIP_INDEX_URL;
            httpMock.setup();
            jest.resetAllMocks();
        });
        afterEach(() => {
            process.env = OLD_ENV;
            httpMock.reset();
        });
        it('returns null for empty result', async () => {
            httpMock.scope(baseUrl).get('/something/json').reply(200);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'something',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for 404', async () => {
            httpMock.scope(baseUrl).get('/something/json').reply(404);
            httpMock.scope(baseUrl).get('/something').reply(404);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'something',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data', async () => {
            httpMock
                .scope(baseUrl)
                .get('/azure-cli-monitor/json')
                .reply(200, JSON.parse(res1));
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'azure-cli-monitor',
            })).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('supports custom datasource url', async () => {
            httpMock
                .scope('https://custom.pypi.net/foo')
                .get('/azure-cli-monitor/json')
                .reply(200, JSON.parse(res1));
            const config = {
                registryUrls: ['https://custom.pypi.net/foo'],
            };
            await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                depName: 'azure-cli-monitor',
            });
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('supports multiple custom datasource urls', async () => {
            httpMock
                .scope('https://custom.pypi.net/foo')
                .get('/azure-cli-monitor/json')
                .replyWithError('error');
            httpMock
                .scope('https://second-index/foo')
                .get('/azure-cli-monitor/json')
                .reply(200, JSON.parse(res1));
            httpMock
                .scope('https://third-index/foo')
                .get('/azure-cli-monitor/json')
                .reply(200, JSON.parse(res2));
            const config = {
                registryUrls: [
                    'https://custom.pypi.net/foo',
                    'https://second-index/foo',
                    'https://third-index/foo',
                ],
            };
            const res = await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                depName: 'azure-cli-monitor',
            });
            expect(res.releases.pop()).toMatchObject({
                version: '0.2.15',
                releaseTimestamp: '2019-06-18T13:58:55',
            });
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns non-github home_page', async () => {
            httpMock
                .scope(baseUrl)
                .get('/something/json')
                .reply(200, {
                ...JSON.parse(res1),
                info: {
                    name: 'something',
                    home_page: 'https://microsoft.com',
                },
            });
            expect((await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'something',
            })).homepage).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('find url from project_urls', async () => {
            const info = {
                name: 'flexget',
                home_page: 'https://flexget.com',
                project_urls: {
                    Forum: 'https://discuss.flexget.com',
                    Homepage: 'https://flexget.com',
                    changelog: 'https://github.com/Flexget/wiki/blob/master/ChangeLog.md',
                    'Issue Tracker': 'https://github.com/Flexget/Flexget/issues',
                    Repository: 'https://github.com/Flexget/Flexget',
                },
            };
            httpMock
                .scope(baseUrl)
                .get('/flexget/json')
                .reply(200, { ...JSON.parse(res1), info });
            const result = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'flexget',
            });
            expect(result.sourceUrl).toBe(info.project_urls.Repository);
            expect(result.changelogUrl).toBe(info.project_urls.changelog);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null if mismatched name', async () => {
            httpMock
                .scope(baseUrl)
                .get('/something/json')
                .reply(200, {
                info: {
                    name: 'something-else',
                    home_page: 'https://microsoft.com',
                },
            });
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'something',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('respects constraints', async () => {
            httpMock
                .scope(baseUrl)
                .get('/doit/json')
                .reply(200, {
                info: {
                    name: 'doit',
                },
                releases: {
                    '0.30.3': [{ requires_python: null }],
                    '0.31.0': [
                        { requires_python: '>=3.4' },
                        { requires_python: '>=2.7' },
                    ],
                    '0.31.1': [{ requires_python: '>=3.4' }],
                    '0.4.0': [{ requires_python: '>=3.4' }, { requires_python: null }],
                },
            });
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                constraints: { python: '2.7' },
                depName: 'doit',
            })).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('process data from simple endpoint', async () => {
            httpMock
                .scope('https://pypi.org/simple/')
                .get('/dj-database-url')
                .reply(200, htmlResponse);
            const config = {
                registryUrls: ['https://pypi.org/simple/'],
            };
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                ...config,
                constraints: { python: '2.7' },
                depName: 'dj-database-url',
            })).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('process data from +simple endpoint', async () => {
            httpMock
                .scope('https://some.registry.org/+simple/')
                .get('/dj-database-url')
                .reply(200, htmlResponse);
            const config = {
                registryUrls: ['https://some.registry.org/+simple/'],
            };
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                ...config,
                constraints: { python: '2.7' },
                depName: 'dj-database-url',
            })).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('process data from simple endpoint with hyphens replaced with underscores', async () => {
            httpMock
                .scope('https://pypi.org/simple/')
                .get('/image-collector')
                .reply(200, mixedHyphensResponse);
            const config = {
                registryUrls: ['https://pypi.org/simple/'],
            };
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                ...config,
                constraints: { python: '2.7' },
                depName: 'image-collector',
            })).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for empty response', async () => {
            httpMock
                .scope('https://pypi.org/simple/')
                .get('/dj-database-url')
                .reply(200);
            const config = {
                registryUrls: ['https://pypi.org/simple/'],
            };
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                ...config,
                constraints: { python: '2.7' },
                depName: 'dj-database-url',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for 404 response from simple endpoint', async () => {
            httpMock
                .scope('https://pypi.org/simple/')
                .get('/dj-database-url')
                .replyWithError('error');
            const config = {
                registryUrls: ['https://pypi.org/simple/'],
            };
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                ...config,
                constraints: { python: '2.7' },
                depName: 'dj-database-url',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for response with no versions', async () => {
            httpMock
                .scope('https://pypi.org/simple/')
                .get('/dj-database-url')
                .reply(200, badResponse);
            const config = {
                registryUrls: ['https://pypi.org/simple/'],
            };
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                ...config,
                constraints: { python: '2.7' },
                depName: 'dj-database-url',
            })).toBeNull();
        });
        it('fall back from json and process data from simple endpoint', async () => {
            httpMock
                .scope('https://custom.pypi.net/foo')
                .get('/dj-database-url/json')
                .reply(404);
            httpMock
                .scope('https://custom.pypi.net/foo')
                .get('/dj-database-url')
                .reply(200, htmlResponse);
            const config = {
                registryUrls: ['https://custom.pypi.net/foo'],
            };
            const result = await __1.getPkgReleases({
                datasource: _1.id,
                ...config,
                depName: 'dj-database-url',
            });
            expect(result).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('parses data-requires-python and respects constraints from simple endpoint', async () => {
            httpMock
                .scope('https://pypi.org/simple/')
                .get('/dj-database-url')
                .reply(200, dataRequiresPythonResponse);
            const config = {
                registryUrls: ['https://pypi.org/simple/'],
            };
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                constraints: { python: '2.7' },
                ...config,
                depName: 'dj-database-url',
            })).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map