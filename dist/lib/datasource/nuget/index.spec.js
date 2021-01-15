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
const _hostRules = __importStar(require("../../util/host-rules"));
const nuget_1 = require("../../versioning/nuget");
const _1 = require(".");
const hostRules = _hostRules;
jest.mock('../../util/host-rules');
const pkgInfoV3FromNuget = fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/nunit/v3_nuget_org.xml', 'utf8');
const pkgListV3Registration = fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/nunit/v3_registration.json', 'utf8');
const pkgListV2 = fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/nunit/v2.xml', 'utf8');
const pkgListV2NoGitHubProjectUrl = fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/nunit/v2_noGitHubProjectUrl.xml', 'utf8');
const pkgListV2NoRelease = fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/nunit/v2_no_release.xml', 'utf8');
const pkgListV2WithoutProjectUrl = fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/nunit/v2_withoutProjectUrl.xml', 'utf8');
const pkgListV2Page1of2 = fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/nunit/v2_paginated_1.xml', 'utf8');
const pkgListV2Page2of2 = fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/nunit/v2_paginated_2.xml', 'utf8');
const nugetIndexV3 = fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/v3_index.json', 'utf8');
const nlogMocks = [
    {
        url: '/v3/registration5-gz-semver2/nlog/index.json',
        result: fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/nlog/v3_registration.json', 'utf8'),
    },
    {
        url: '/v3/registration5-gz-semver2/nlog/page/1.0.0.505/4.4.0-beta5.json',
        result: fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/nlog/v3_catalog_1.json', 'utf8'),
    },
    {
        url: '/v3/registration5-gz-semver2/nlog/page/4.4.0-beta6/4.6.0-rc2.json',
        result: fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/nlog/v3_catalog_2.json', 'utf8'),
    },
    {
        url: '/v3/registration5-gz-semver2/nlog/page/4.6.0-rc3/5.0.0-beta11.json',
        result: fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/nlog/v3_catalog_3.json', 'utf8'),
    },
    {
        url: '/v3-flatcontainer/nlog/4.7.3/nlog.nuspec',
        result: fs_1.default.readFileSync('lib/datasource/nuget/__fixtures__/nlog/nuspec.xml', 'utf8'),
    },
];
const configV3V2 = {
    datasource: _1.id,
    versioning: nuget_1.id,
    depName: 'nunit',
    registryUrls: [
        'https://api.nuget.org/v3/index.json',
        'https://www.nuget.org/api/v2/',
    ],
};
const configV2 = {
    datasource: _1.id,
    versioning: nuget_1.id,
    depName: 'nunit',
    registryUrls: ['https://www.nuget.org/api/v2/'],
};
const configV3 = {
    datasource: _1.id,
    versioning: nuget_1.id,
    depName: 'nunit',
    registryUrls: ['https://api.nuget.org/v3/index.json'],
};
const configV3NotNugetOrg = {
    datasource: _1.id,
    versioning: nuget_1.id,
    depName: 'nunit',
    registryUrls: ['https://myprivatefeed/index.json'],
};
const configV3Multiple = {
    datasource: _1.id,
    versioning: nuget_1.id,
    depName: 'nunit',
    registryUrls: [
        'https://api.nuget.org/v3/index.json',
        'https://myprivatefeed/index.json',
    ],
};
describe('datasource/nuget', () => {
    describe('getReleases', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            hostRules.hosts.mockReturnValue([]);
            hostRules.find.mockReturnValue({});
            httpMock.setup();
        });
        afterEach(() => {
            httpMock.reset();
        });
        it(`can't detect nuget feed version`, async () => {
            const config = {
                datasource: _1.id,
                versioning: nuget_1.id,
                depName: 'nunit',
                registryUrls: ['#$#api.nuget.org/v3/index.xml'],
            };
            expect(await __1.getPkgReleases({
                ...config,
            })).toBeNull();
        });
        it('extracts feed version from registry URL hash', async () => {
            httpMock.scope('https://my-registry').get('/').reply(200);
            const config = {
                datasource: _1.id,
                versioning: nuget_1.id,
                depName: 'nunit',
                registryUrls: ['https://my-registry#protocolVersion=3'],
            };
            await __1.getPkgReleases({
                ...config,
            });
            const trace = httpMock.getTrace();
            expect(trace[0].url).toEqual('https://my-registry/');
            expect(trace).toMatchSnapshot();
        });
        it(`can't get packages list (v3)`, async () => {
            httpMock
                .scope('https://api.nuget.org')
                .get('/v3/index.json')
                .reply(200, JSON.parse(nugetIndexV3))
                .get('/v3/registration5-gz-semver2/nunit/index.json')
                .reply(500);
            const res = await __1.getPkgReleases({
                ...configV3,
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it(`empty packages list (v3)`, async () => {
            httpMock
                .scope('https://api.nuget.org')
                .get('/v3/index.json')
                .reply(200, JSON.parse(nugetIndexV3))
                .get('/v3/registration5-gz-semver2/nunit/index.json')
                .reply(200, {});
            const res = await __1.getPkgReleases({
                ...configV3,
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for empty result (v3v2)', async () => {
            httpMock
                .scope('https://api.nuget.org')
                .get('/v3/index.json')
                .reply(200, {});
            httpMock
                .scope('https://www.nuget.org')
                .get('/api/v2/FindPackagesById()?id=%27nunit%27&$select=Version,IsLatestVersion,ProjectUrl,Published')
                .reply(200, null);
            expect(await __1.getPkgReleases({
                ...configV3V2,
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for empty result (v2)', async () => {
            httpMock
                .scope('https://www.nuget.org')
                .get('/api/v2/FindPackagesById()?id=%27nunit%27&$select=Version,IsLatestVersion,ProjectUrl,Published')
                .reply(200, {});
            expect(await __1.getPkgReleases({
                ...configV2,
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for empty result (v3)', async () => {
            httpMock
                .scope('https://api.nuget.org')
                .get('/v3/index.json')
                .reply(200, {});
            const res = await __1.getPkgReleases({
                ...configV3,
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for non 200 (v3v2)', async () => {
            httpMock.scope('https://api.nuget.org').get('/v3/index.json').reply(500);
            httpMock
                .scope('https://www.nuget.org')
                .get('/api/v2/FindPackagesById()?id=%27nunit%27&$select=Version,IsLatestVersion,ProjectUrl,Published')
                .reply(500);
            expect(await __1.getPkgReleases({
                ...configV3V2,
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for non 200 (v3)', async () => {
            httpMock.scope('https://api.nuget.org').get('/v3/index.json').reply(500);
            expect(await __1.getPkgReleases({
                ...configV3,
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for non 200 (v2)', async () => {
            httpMock
                .scope('https://www.nuget.org')
                .get('/api/v2/FindPackagesById()?id=%27nunit%27&$select=Version,IsLatestVersion,ProjectUrl,Published')
                .reply(500);
            expect(await __1.getPkgReleases({
                ...configV2,
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for unknown error (v3v2)', async () => {
            httpMock
                .scope('https://api.nuget.org')
                .get('/v3/index.json')
                .replyWithError('');
            httpMock
                .scope('https://www.nuget.org')
                .get('/api/v2/FindPackagesById()?id=%27nunit%27&$select=Version,IsLatestVersion,ProjectUrl,Published')
                .replyWithError('');
            expect(await __1.getPkgReleases({
                ...configV3V2,
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns deduplicated results', async () => {
            httpMock
                .scope('https://api.nuget.org')
                .get('/v3/index.json')
                .twice()
                .reply(200, JSON.parse(nugetIndexV3))
                .get('/v3-flatcontainer/nunit/3.12.0/nunit.nuspec')
                .twice()
                .reply(200, pkgInfoV3FromNuget)
                .get('/v3/registration5-gz-semver2/nunit/index.json')
                .twice()
                .reply(200, pkgListV3Registration);
            httpMock
                .scope('https://myprivatefeed')
                .get('/index.json')
                .twice()
                .reply(200, JSON.parse(nugetIndexV3));
            const res = await __1.getPkgReleases({
                ...configV3Multiple,
            });
            expect(res).not.toBeNull();
            expect(res).toMatchSnapshot();
            expect(res.releases).toHaveLength(45);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for unknown error in getReleasesFromV3Feed (v3)', async () => {
            httpMock
                .scope('https://api.nuget.org')
                .get('/v3/index.json')
                .replyWithError('');
            expect(await __1.getPkgReleases({
                ...configV3,
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for unknown error in getQueryUrlForV3Feed  (v3)', async () => {
            httpMock
                .scope('https://api.nuget.org')
                .get('/v3/index.json')
                .reply(200, JSON.parse(nugetIndexV3))
                .get('/v3/registration5-gz-semver2/nunit/index.json')
                .replyWithError('');
            expect(await __1.getPkgReleases({
                ...configV3,
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for unknown error (v2)', async () => {
            httpMock
                .scope('https://www.nuget.org')
                .get('/api/v2/FindPackagesById()?id=%27nunit%27&$select=Version,IsLatestVersion,ProjectUrl,Published')
                .replyWithError('');
            expect(await __1.getPkgReleases({
                ...configV2,
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data (v3) feed is a nuget.org', async () => {
            httpMock
                .scope('https://api.nuget.org')
                .get('/v3/index.json')
                .twice()
                .reply(200, JSON.parse(nugetIndexV3))
                .get('/v3/registration5-gz-semver2/nunit/index.json')
                .reply(200, pkgListV3Registration)
                .get('/v3-flatcontainer/nunit/3.12.0/nunit.nuspec')
                .reply(200, pkgInfoV3FromNuget);
            const res = await __1.getPkgReleases({
                ...configV3,
            });
            expect(res).not.toBeNull();
            expect(res).toMatchSnapshot();
            expect(res.sourceUrl).toBeDefined();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data (v3) for several catalog pages', async () => {
            const scope = httpMock
                .scope('https://api.nuget.org')
                .get('/v3/index.json')
                .twice()
                .reply(200, JSON.parse(nugetIndexV3));
            nlogMocks.forEach(({ url, result }) => {
                scope.get(url).reply(200, result);
            });
            const res = await __1.getPkgReleases({
                ...configV3,
                depName: 'nlog',
            });
            expect(res).not.toBeNull();
            expect(res).toMatchSnapshot();
            expect(res.sourceUrl).toBeDefined();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data (v3) feed is not a nuget.org', async () => {
            httpMock
                .scope('https://api.nuget.org')
                .get('/v3/registration5-gz-semver2/nunit/index.json')
                .reply(200, pkgListV3Registration
                .replace(/"http:\/\/nunit\.org"/g, '""')
                .replace('"published": "2012-10-23T15:37:48+00:00",', ''))
                .get('/v3-flatcontainer/nunit/3.12.0/nunit.nuspec')
                .reply(200, pkgInfoV3FromNuget.replace('https://github.com/nunit/nunit', ''));
            httpMock
                .scope('https://myprivatefeed')
                .get('/index.json')
                .twice()
                .reply(200, JSON.parse(nugetIndexV3));
            const res = await __1.getPkgReleases({
                ...configV3NotNugetOrg,
            });
            expect(res).not.toBeNull();
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
            expect(res.sourceUrl).toBeDefined();
        });
        it('processes real data (v2)', async () => {
            httpMock
                .scope('https://www.nuget.org')
                .get('/api/v2/FindPackagesById()?id=%27nunit%27&$select=Version,IsLatestVersion,ProjectUrl,Published')
                .reply(200, pkgListV2);
            const res = await __1.getPkgReleases({
                ...configV2,
            });
            expect(res).not.toBeNull();
            expect(res).toMatchSnapshot();
            expect(res.sourceUrl).toBeDefined();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data no relase (v2)', async () => {
            httpMock
                .scope('https://www.nuget.org')
                .get('/api/v2/FindPackagesById()?id=%27nunit%27&$select=Version,IsLatestVersion,ProjectUrl,Published')
                .reply(200, pkgListV2NoRelease);
            const res = await __1.getPkgReleases({
                ...configV2,
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data without project url (v2)', async () => {
            httpMock
                .scope('https://www.nuget.org')
                .get('/api/v2/FindPackagesById()?id=%27nunit%27&$select=Version,IsLatestVersion,ProjectUrl,Published')
                .reply(200, pkgListV2WithoutProjectUrl);
            const res = await __1.getPkgReleases({
                ...configV2,
            });
            expect(res).not.toBeNull();
            expect(res).toMatchSnapshot();
            expect(res.sourceUrl).not.toBeDefined();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data with no github project url (v2)', async () => {
            httpMock
                .scope('https://www.nuget.org')
                .get('/api/v2/FindPackagesById()?id=%27nunit%27&$select=Version,IsLatestVersion,ProjectUrl,Published')
                .reply(200, pkgListV2NoGitHubProjectUrl);
            const res = await __1.getPkgReleases({
                ...configV2,
            });
            expect(res).not.toBeNull();
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('handles paginated results (v2)', async () => {
            httpMock
                .scope('https://www.nuget.org')
                .get('/api/v2/FindPackagesById()?id=%27nunit%27&$select=Version,IsLatestVersion,ProjectUrl,Published')
                .reply(200, pkgListV2Page1of2);
            httpMock
                .scope('https://example.org')
                .get('/')
                .reply(200, pkgListV2Page2of2);
            const res = await __1.getPkgReleases({
                ...configV2,
            });
            expect(res).not.toBeNull();
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map