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
const consulData = fs_1.default.readFileSync('lib/datasource/terraform-provider/__fixtures__/azurerm-provider.json');
const hashicorpReleases = fs_1.default.readFileSync('lib/datasource/terraform-provider/__fixtures__/releaseBackendIndex.json');
const serviceDiscoveryResult = fs_1.default.readFileSync('lib/datasource/terraform-module/__fixtures__/service-discovery.json');
const primaryUrl = _1.defaultRegistryUrls[0];
const secondaryUrl = _1.defaultRegistryUrls[1];
describe('datasource/terraform', () => {
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
                .scope(primaryUrl)
                .get('/v1/providers/hashicorp/azurerm')
                .reply(200, {})
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryResult);
            httpMock.scope(secondaryUrl).get('/index.json').reply(200, {});
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'azurerm',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for 404', async () => {
            httpMock
                .scope(primaryUrl)
                .get('/v1/providers/hashicorp/azurerm')
                .reply(404)
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryResult);
            httpMock.scope(secondaryUrl).get('/index.json').reply(404);
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'azurerm',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for unknown error', async () => {
            httpMock
                .scope(primaryUrl)
                .get('/v1/providers/hashicorp/azurerm')
                .replyWithError('')
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryResult);
            httpMock.scope(secondaryUrl).get('/index.json').replyWithError('');
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'azurerm',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data', async () => {
            httpMock
                .scope(primaryUrl)
                .get('/v1/providers/hashicorp/azurerm')
                .reply(200, JSON.parse(consulData))
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryResult);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'azurerm',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data from lookupName', async () => {
            httpMock
                .scope('https://registry.company.com')
                .get('/v1/providers/hashicorp/azurerm')
                .reply(200, JSON.parse(consulData))
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryResult);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'azure',
                lookupName: 'hashicorp/azurerm',
                registryUrls: ['https://registry.company.com'],
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes data with alternative backend', async () => {
            httpMock
                .scope(primaryUrl)
                .get('/v1/providers/hashicorp/google-beta')
                .reply(404, {
                errors: ['Not Found'],
            })
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryResult);
            httpMock
                .scope(secondaryUrl)
                .get('/index.json')
                .reply(200, JSON.parse(hashicorpReleases));
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'google-beta',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('simulate failing secondary release source', async () => {
            httpMock
                .scope(primaryUrl)
                .get('/v1/providers/hashicorp/google-beta')
                .reply(404, {
                errors: ['Not Found'],
            })
                .get('/.well-known/terraform.json')
                .reply(200, serviceDiscoveryResult);
            httpMock.scope(secondaryUrl).get('/index.json').reply(404);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'datadog',
            });
            expect(res).toMatchSnapshot();
            expect(res).toBeNull();
        });
        it('returns null for error in service discovery', async () => {
            httpMock.scope(primaryUrl).get('/.well-known/terraform.json').reply(404);
            httpMock.scope(secondaryUrl).get('/index.json').replyWithError('');
            expect(await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'azurerm',
            })).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map