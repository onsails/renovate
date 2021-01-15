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
const consulData = fs_1.default.readFileSync('lib/datasource/terraform-module/__fixtures__/registry-consul.json');
const serviceDiscoveryResult = fs_1.default.readFileSync('lib/datasource/terraform-module/__fixtures__/service-discovery.json');
const serviceDiscoveryCustomResult = fs_1.default.readFileSync('lib/datasource/terraform-module/__fixtures__/service-custom-discovery.json');
const baseUrl = 'https://registry.terraform.io';
const localTerraformEnterprisebaseUrl = 'https://terraform.foo.bar';
describe('datasource/terraform-module', () => {
    describe('getReleases', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            httpMock.setup();
        });
        afterEach(() => {
            httpMock.reset();
        });
        it('returns null for empty result', async () => {
            httpMock
                .scope(baseUrl)
                .get('/v1/modules/hashicorp/consul/aws')
                .reply(200, {})
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryResult);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'hashicorp/consul/aws',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for 404', async () => {
            httpMock
                .scope(baseUrl)
                .get('/v1/modules/hashicorp/consul/aws')
                .reply(404, {})
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryResult);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'hashicorp/consul/aws',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for unknown error', async () => {
            httpMock
                .scope(baseUrl)
                .get('/v1/modules/hashicorp/consul/aws')
                .replyWithError('')
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryResult);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'hashicorp/consul/aws',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data', async () => {
            httpMock
                .scope(baseUrl)
                .get('/v1/modules/hashicorp/consul/aws')
                .reply(200, consulData)
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryResult);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'hashicorp/consul/aws',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes with registry in name', async () => {
            httpMock
                .scope(baseUrl)
                .get('/v1/modules/hashicorp/consul/aws')
                .reply(200, consulData)
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryResult);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'registry.terraform.io/hashicorp/consul/aws',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('rejects mismatch', async () => {
            httpMock
                .scope('https://terraform.company.com')
                .get('/v1/modules/consul/foo')
                .reply(200, consulData)
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryResult);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'consul/foo',
                registryUrls: ['https://terraform.company.com'],
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('rejects servicediscovery', async () => {
            httpMock
                .scope('https://terraform.company.com')
                .get('/.well-known/terraform.json')
                .reply(404);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'consul/foo',
                registryUrls: ['https://terraform.company.com'],
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data on changed subpath', async () => {
            httpMock
                .scope(localTerraformEnterprisebaseUrl)
                .get('/api/registry/v1/modules/hashicorp/consul/aws')
                .reply(200, consulData)
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryCustomResult);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                registryUrls: ['https://terraform.foo.bar'],
                depName: 'hashicorp/consul/aws',
            });
            expect(httpMock.getTrace()).toMatchSnapshot();
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
        });
    });
});
//# sourceMappingURL=index.spec.js.map