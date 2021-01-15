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
const mockdate_1 = __importDefault(require("mockdate"));
const nock_1 = __importDefault(require("nock"));
const registry_auth_token_1 = __importDefault(require("registry-auth-token"));
const __1 = require("..");
const util_1 = require("../../../test/util");
const error_messages_1 = require("../../constants/error-messages");
const hostRules = __importStar(require("../../util/host-rules"));
const _1 = require(".");
jest.mock('registry-auth-token');
jest.mock('delay');
const registryAuthToken = registry_auth_token_1.default;
let npmResponse;
describe(util_1.getName(__filename), () => {
    delete process.env.NPM_TOKEN;
    beforeEach(() => {
        jest.resetAllMocks();
        global.trustLevel = 'low';
        _1.resetCache();
        _1.setNpmrc();
        npmResponse = {
            name: 'foobar',
            versions: {
                '0.0.1': {
                    foo: 1,
                },
                '0.0.2': {
                    foo: 2,
                },
            },
            repository: {
                type: 'git',
                url: 'git://github.com/renovateapp/dummy.git',
                directory: 'src/a',
            },
            homepage: 'https://github.com/renovateapp/dummy',
            'dist-tags': {
                latest: '0.0.1',
            },
            time: {
                '0.0.1': '2018-05-06T07:21:53+02:00',
                '0.0.2': '2018-05-07T07:21:53+02:00',
            },
        };
        nock_1.default.cleanAll();
    });
    afterEach(() => {
        delete process.env.RENOVATE_CACHE_NPM_MINUTES;
        mockdate_1.default.reset();
    });
    it('should return null for no versions', async () => {
        const missingVersions = { ...npmResponse };
        missingVersions.versions = {};
        nock_1.default('https://registry.npmjs.org')
            .get('/foobar')
            .reply(200, missingVersions);
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar' });
        expect(res).toBeNull();
    });
    it('should fetch package info from npm', async () => {
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(200, npmResponse);
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar' });
        expect(res).toMatchSnapshot();
    });
    it('should parse repo url', async () => {
        const pkg = {
            name: 'foobar',
            versions: {
                '0.0.1': {
                    foo: 1,
                },
            },
            repository: {
                type: 'git',
                url: 'git:github.com/renovateapp/dummy',
            },
            'dist-tags': {
                latest: '0.0.1',
            },
            time: {
                '0.0.1': '2018-05-06T07:21:53+02:00',
            },
        };
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(200, pkg);
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar' });
        expect(res).toMatchSnapshot();
        expect(res.sourceUrl).toBeDefined();
    });
    it('should parse repo url (string)', async () => {
        const pkg = {
            name: 'foobar',
            versions: {
                '0.0.1': {
                    repository: 'git:github.com/renovateapp/dummy',
                },
            },
            'dist-tags': {
                latest: '0.0.1',
            },
            time: {
                '0.0.1': '2018-05-06T07:21:53+02:00',
            },
        };
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(200, pkg);
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar' });
        expect(res).toMatchSnapshot();
        expect(res.sourceUrl).toBeDefined();
    });
    it('should return deprecated', async () => {
        const deprecatedPackage = {
            name: 'foobar',
            versions: {
                '0.0.1': {
                    foo: 1,
                },
                '0.0.2': {
                    foo: 2,
                    deprecated: 'This is deprecated',
                },
            },
            repository: {
                type: 'git',
                url: 'git://github.com/renovateapp/dummy.git',
            },
            'dist-tags': {
                latest: '0.0.2',
            },
            time: {
                '0.0.1': '2018-05-06T07:21:53+02:00',
                '0.0.2': '2018-05-07T07:21:53+02:00',
            },
        };
        nock_1.default('https://registry.npmjs.org')
            .get('/foobar')
            .reply(200, deprecatedPackage);
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar' });
        expect(res).toMatchSnapshot();
        expect(res.deprecationMessage).toMatchSnapshot();
    });
    it('should handle foobar', async () => {
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(200, npmResponse);
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar' });
        expect(res).toMatchSnapshot();
    });
    it('should reject name mismatch', async () => {
        nock_1.default('https://registry.npmjs.org')
            .get('/different')
            .reply(200, npmResponse);
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'different' });
        expect(res).toBeNull();
    });
    it('should handle no time', async () => {
        delete npmResponse.time['0.0.2'];
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(200, npmResponse);
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar' });
        expect(res).toMatchSnapshot();
    });
    it('should return null if lookup fails 401', async () => {
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(401);
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar' });
        expect(res).toBeNull();
    });
    it('should return null if lookup fails', async () => {
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(404);
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar' });
        expect(res).toBeNull();
    });
    it('should throw error for unparseable', async () => {
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(200, 'oops');
        await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'foobar' })).rejects.toThrow();
    });
    it('should throw error for 429', async () => {
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(429);
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(429);
        await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'foobar' })).rejects.toThrow();
    });
    it('should throw error for 5xx', async () => {
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(503);
        await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'foobar' })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
    });
    it('should throw error for 408', async () => {
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(408);
        await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'foobar' })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
    });
    it('should throw error for others', async () => {
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(451);
        await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'foobar' })).rejects.toThrow();
    });
    it('should send an authorization header if provided', async () => {
        registryAuthToken.mockImplementation(() => ({
            type: 'Basic',
            token: '1234',
        }));
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(200, npmResponse);
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar' });
        expect(res).toMatchSnapshot();
    });
    it('should use NPM_TOKEN if provided', async () => {
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(200, npmResponse);
        const oldToken = process.env.NPM_TOKEN;
        process.env.NPM_TOKEN = 'some-token';
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar' });
        process.env.NPM_TOKEN = oldToken;
        expect(res).toMatchSnapshot();
    });
    it('should use host rules by hostName if provided', async () => {
        hostRules.add({
            hostType: 'npm',
            hostName: 'npm.mycustomregistry.com',
            token: 'abcde',
        });
        nock_1.default('https://npm.mycustomregistry.com')
            .get('/foobar')
            .reply(200, npmResponse);
        const npmrc = 'registry=https://npm.mycustomregistry.com/';
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar', npmrc });
        expect(res).toMatchSnapshot();
    });
    it('should use host rules by baseUrl if provided', async () => {
        hostRules.add({
            hostType: 'npm',
            baseUrl: 'https://npm.mycustomregistry.com/_packaging/mycustomregistry/npm/registry/',
            token: 'abcde',
        });
        nock_1.default('https://npm.mycustomregistry.com/_packaging/mycustomregistry/npm/registry')
            .get('/foobar')
            .reply(200, npmResponse);
        const npmrc = 'registry=https://npm.mycustomregistry.com/_packaging/mycustomregistry/npm/registry/';
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar', npmrc });
        expect(res).toMatchSnapshot();
    });
    it('resets npmrc', () => {
        const npmrcContent = 'something=something';
        _1.setNpmrc(npmrcContent);
        _1.setNpmrc(npmrcContent);
        _1.setNpmrc();
        expect(_1.getNpmrc()).toBeNull();
    });
    it('should use default registry if missing from npmrc', async () => {
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(200, npmResponse);
        const npmrc = 'foo=bar';
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar', npmrc });
        expect(res).toMatchSnapshot();
    });
    it('should cache package info from npm', async () => {
        nock_1.default('https://registry.npmjs.org').get('/foobar').reply(200, npmResponse);
        const npmrc = '//registry.npmjs.org/:_authToken=abcdefghijklmnopqrstuvwxyz';
        const res1 = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar', npmrc });
        const res2 = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar', npmrc });
        expect(res1).not.toBeNull();
        expect(res1).toEqual(res2);
    });
    it('should fetch package info from custom registry', async () => {
        nock_1.default('https://npm.mycustomregistry.com')
            .get('/foobar')
            .reply(200, npmResponse);
        const npmrc = 'registry=https://npm.mycustomregistry.com/\n//npm.mycustomregistry.com/:_auth = ' +
            Buffer.from('abcdef').toString('base64');
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar', npmrc });
        expect(res).toMatchSnapshot();
    });
    it('should replace any environment variable in npmrc', async () => {
        nock_1.default('https://registry.from-env.com')
            .get('/foobar')
            .reply(200, npmResponse);
        process.env.REGISTRY = 'https://registry.from-env.com';
        process.env.RENOVATE_CACHE_NPM_MINUTES = '15';
        global.trustLevel = 'high';
        // eslint-disable-next-line no-template-curly-in-string
        const npmrc = 'registry=${REGISTRY}';
        const res = await __1.getPkgReleases({ datasource: _1.id, depName: 'foobar', npmrc });
        expect(res).toMatchSnapshot();
    });
    it('should throw error if necessary env var is not present', () => {
        global.trustLevel = 'high';
        // eslint-disable-next-line no-template-curly-in-string
        expect(() => _1.setNpmrc('registry=${REGISTRY_MISSING}')).toThrow(Error('env-replace'));
    });
});
//# sourceMappingURL=index.spec.js.map