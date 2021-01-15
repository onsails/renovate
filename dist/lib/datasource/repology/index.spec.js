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
const util_1 = require("../../../test/util");
const error_messages_1 = require("../../constants/error-messages");
const loose_1 = require("../../versioning/loose");
const _1 = require(".");
const repologyHost = 'https://repology.org/';
const mockApiCall = (name, response) => {
    const interceptor = httpMock
        .scope(repologyHost)
        .get(`/api/v1/project/${name}`);
    if (response.status) {
        interceptor.reply(response.status, response.body);
    }
    else {
        interceptor.replyWithError({ code: response.code });
    }
};
const mockResolverCall = (repo, name, name_type, response) => {
    const query = {
        repo,
        name_type,
        target_page: 'api_v1_project',
        noautoresolve: 'on',
        name,
    };
    const interceptor = httpMock
        .scope(repologyHost)
        .get('/tools/project-by')
        .query(query);
    if (response.status) {
        interceptor.reply(response.status, response.body);
    }
    else {
        interceptor.replyWithError({ code: response.code });
    }
};
const fixtureNginx = fs_1.default.readFileSync(`${__dirname}/__fixtures__/nginx.json`, 'utf8');
const fixtureGccDefaults = fs_1.default.readFileSync(`${__dirname}/__fixtures__/gcc-defaults.json`, 'utf8');
const fixtureGcc = fs_1.default.readFileSync(`${__dirname}/__fixtures__/gcc.json`, 'utf8');
const fixturePulseaudio = fs_1.default.readFileSync(`${__dirname}/__fixtures__/pulseaudio.json`, 'utf8');
describe(util_1.getName(__filename), () => {
    describe('getReleases', () => {
        beforeEach(() => {
            httpMock.setup();
        });
        afterEach(() => httpMock.reset());
        it('returns null for empty result', async () => {
            mockResolverCall('debian_stable', 'nginx', 'binname', {
                status: 200,
                body: '[]',
            });
            mockResolverCall('debian_stable', 'nginx', 'srcname', {
                status: 200,
                body: '[]',
            });
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'debian_stable/nginx',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for missing repository or package', async () => {
            mockResolverCall('this_should', 'never-exist', 'binname', {
                status: 404,
            });
            mockResolverCall('this_should', 'never-exist', 'srcname', {
                status: 404,
            });
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'this_should/never-exist',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws error on unexpected API response', async () => {
            mockResolverCall('debian_stable', 'nginx', 'binname', {
                status: 200,
                body: '[]',
            });
            mockResolverCall('debian_stable', 'nginx', 'srcname', {
                status: 403,
            });
            mockApiCall('nginx', { status: 500 });
            await expect(__1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'debian_stable/nginx',
            })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws error on unexpected Resolver response with binary package', async () => {
            mockResolverCall('debian_stable', 'nginx', 'binname', {
                status: 500,
            });
            await expect(__1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'debian_stable/nginx',
            })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws error on unexpected Resolver response with source package', async () => {
            mockResolverCall('debian_stable', 'nginx', 'binname', {
                status: 200,
                body: '[]',
            });
            mockResolverCall('debian_stable', 'nginx', 'srcname', {
                status: 500,
            });
            await expect(__1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'debian_stable/nginx',
            })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws error on API request timeout', async () => {
            mockResolverCall('debian_stable', 'nginx', 'binname', {
                status: 200,
                body: '[]',
            });
            mockResolverCall('debian_stable', 'nginx', 'srcname', {
                status: 403,
            });
            mockApiCall('nginx', { code: 'ETIMEDOUT' });
            await expect(__1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'debian_stable/nginx',
            })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws error on Resolver request timeout', async () => {
            mockResolverCall('debian_stable', 'nginx', 'binname', {
                code: 'ETIMEDOUT',
            });
            await expect(__1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'debian_stable/nginx',
            })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws without repository and package name', async () => {
            await expect(__1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'invalid-lookup-name',
            })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns correct version for binary package', async () => {
            mockResolverCall('debian_stable', 'nginx', 'binname', {
                status: 200,
                body: fixtureNginx,
            });
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'debian_stable/nginx',
            });
            expect(res).toMatchSnapshot();
            expect(res.releases).toHaveLength(1);
            expect(res.releases[0].version).toEqual('1.14.2-2+deb10u1');
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns correct version for source package', async () => {
            mockResolverCall('debian_stable', 'gcc-defaults', 'binname', {
                status: 404,
            });
            mockResolverCall('debian_stable', 'gcc-defaults', 'srcname', {
                status: 200,
                body: fixtureGccDefaults,
            });
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'debian_stable/gcc-defaults',
            });
            expect(res).toMatchSnapshot();
            expect(res.releases).toHaveLength(1);
            expect(res.releases[0].version).toEqual('1.181');
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns correct version for api package', async () => {
            mockResolverCall('debian_stable', 'gcc-defaults', 'binname', {
                status: 403,
            });
            mockApiCall('gcc-defaults', { status: 200, body: fixtureGccDefaults });
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'debian_stable/gcc-defaults',
            });
            expect(res).toMatchSnapshot();
            expect(res.releases).toHaveLength(1);
            expect(res.releases[0].version).toEqual('1.181');
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns correct version for multi-package project with same name', async () => {
            mockResolverCall('alpine_3_12', 'gcc', 'binname', {
                status: 200,
                body: fixtureGcc,
            });
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'alpine_3_12/gcc',
            });
            expect(res).toMatchSnapshot();
            expect(res.releases).toHaveLength(1);
            expect(res.releases[0].version).toEqual('9.3.0-r2');
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns correct version for multi-package project with different name', async () => {
            mockResolverCall('debian_stable', 'pulseaudio-utils', 'binname', {
                status: 200,
                body: fixturePulseaudio,
            });
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'debian_stable/pulseaudio-utils',
            });
            expect(res).toMatchSnapshot();
            expect(res.releases).toHaveLength(1);
            expect(res.releases[0].version).toEqual('12.2-4+deb10u1');
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for ambiguous package results', async () => {
            const pkgs = [
                { repo: 'dummy', version: '1.0.0', visiblename: 'example' },
                { repo: 'dummy', version: '2.0.0', visiblename: 'example' },
            ];
            const pkgsJSON = JSON.stringify(pkgs);
            mockResolverCall('dummy', 'example', 'binname', {
                status: 200,
                body: pkgsJSON,
            });
            mockResolverCall('dummy', 'example', 'srcname', {
                status: 200,
                body: pkgsJSON,
            });
            const release = await __1.getPkgReleases({
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'dummy/example',
            });
            expect(release).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map