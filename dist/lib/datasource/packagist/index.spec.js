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
const composerVersioning = __importStar(require("../../versioning/composer"));
const loose_1 = require("../../versioning/loose");
const _1 = require(".");
jest.mock('../../util/host-rules');
const hostRules = _hostRules;
const includesJson = fs_1.default.readFileSync('lib/datasource/packagist/__fixtures__/includes.json');
const beytJson = fs_1.default.readFileSync('lib/datasource/packagist/__fixtures__/1beyt.json');
const mailchimpJson = fs_1.default.readFileSync('lib/datasource/packagist/__fixtures__/mailchimp-api.json');
const baseUrl = 'https://packagist.org';
describe('datasource/packagist', () => {
    describe('getReleases', () => {
        let config;
        beforeEach(() => {
            jest.resetAllMocks();
            httpMock.setup();
            hostRules.find = jest.fn((input) => input);
            hostRules.hosts = jest.fn(() => []);
            config = {
                versioning: composerVersioning.id,
                registryUrls: [
                    'https://composer.renovatebot.com',
                    'https://packagist.org',
                ],
            };
        });
        afterEach(() => {
            httpMock.reset();
        });
        it('supports custom registries', async () => {
            config = {
                registryUrls: ['https://composer.renovatebot.com'],
            };
            const res = await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'something/one',
            });
            expect(res).toBeNull();
        });
        it('supports plain packages', async () => {
            const packagesOnly = {
                packages: {
                    'vendor/package-name': {
                        'dev-master': {},
                        '1.0.x-dev': {},
                        '0.0.1': {},
                        '1.0.0': {},
                    },
                },
            };
            httpMock
                .scope('https://composer.renovatebot.com')
                .get('/packages.json')
                .reply(200, packagesOnly);
            const res = await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'vendor/package-name',
            });
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('handles timeouts', async () => {
            httpMock
                .scope('https://composer.renovatebot.com')
                .get('/packages.json')
                .replyWithError({ code: 'ETIMEDOUT' });
            httpMock.scope(baseUrl).get('/p/vendor/package-name2.json').reply(200);
            const res = await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'vendor/package-name2',
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('handles auth rejections', async () => {
            httpMock
                .scope('https://composer.renovatebot.com')
                .get('/packages.json')
                .reply(403);
            httpMock.scope(baseUrl).get('/p/vendor/package-name.json').reply(200);
            const res = await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'vendor/package-name',
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('handles not found registries', async () => {
            httpMock
                .scope('https://composer.renovatebot.com')
                .get('/packages.json')
                .reply(404);
            httpMock.scope(baseUrl).get('/p/drewm/mailchip-api.json').reply(200);
            const res = await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'drewm/mailchip-api',
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('supports includes packages', async () => {
            hostRules.find = jest.fn(() => ({
                username: 'some-username',
                password: 'some-password',
            }));
            const packagesJson = {
                packages: [],
                includes: {
                    'include/all$afbf74d51f31c7cbb5ff10304f9290bfb4f4e68b.json': {
                        sha1: 'afbf74d51f31c7cbb5ff10304f9290bfb4f4e68b',
                    },
                },
            };
            httpMock
                .scope('https://composer.renovatebot.com')
                .get('/packages.json')
                .reply(200, packagesJson)
                .get('/include/all$afbf74d51f31c7cbb5ff10304f9290bfb4f4e68b.json')
                .reply(200, JSON.parse(includesJson));
            const res = await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'guzzlehttp/guzzle',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('supports lazy repositories', async () => {
            const packagesJson = {
                packages: [],
                'providers-lazy-url': 'https://composer.renovatebot.com/composer/lazy/p/%package%.json',
            };
            config = {
                registryUrls: ['https://composer.renovatebot.com/composer/lazy'],
            };
            const fileJson = {
                packages: {
                    'guzzlehttp/guzzle': {
                        '5.3.4': {
                            name: 'guzzlehttp/guzzle',
                            version: '5.3.4',
                        },
                        '7.0.0-beta.1': {
                            name: 'guzzlehttp/guzzle',
                            version: '7.0.0-beta.1',
                        },
                    },
                },
            };
            httpMock
                .scope('https://composer.renovatebot.com')
                .get('/composer/lazy/packages.json')
                .reply(200, packagesJson)
                .get('/composer/lazy/p/guzzlehttp/guzzle.json')
                .reply(200, fileJson);
            const res = await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'guzzlehttp/guzzle',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('supports provider-includes', async () => {
            const packagesJson = {
                packages: [],
                'providers-url': '/p/%package%$%hash%.json',
                'provider-includes': {
                    'p/providers-2018-09$%hash%.json': {
                        sha256: '14346045d7a7261cb3a12a6b7a1a7c4151982530347b115e5e277d879cad1942',
                    },
                },
            };
            const fileJson = {
                providers: {
                    'wpackagist-plugin/1337-rss-feed-made-for-sharing': {
                        sha256: 'e9b6c98c63f99e59440863a044cc80dd9cddbf5c426b05003dba98983b5757de',
                    },
                    'wpackagist-plugin/1beyt': {
                        sha256: 'b574a802b5bf20a58c0f027e73aea2a75d23a6f654afc298a8dc467331be316a',
                    },
                },
            };
            httpMock
                .scope('https://composer.renovatebot.com')
                .get('/packages.json')
                .reply(200, packagesJson)
                .get('/p/providers-2018-09$14346045d7a7261cb3a12a6b7a1a7c4151982530347b115e5e277d879cad1942.json')
                .reply(200, fileJson)
                .get('/p/wpackagist-plugin/1beyt$b574a802b5bf20a58c0f027e73aea2a75d23a6f654afc298a8dc467331be316a.json')
                .reply(200, JSON.parse(beytJson));
            const res = await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'wpackagist-plugin/1beyt',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('handles provider-includes miss', async () => {
            const packagesJson = {
                packages: [],
                'providers-url': '/p/%package%$%hash%.json',
                'provider-includes': {
                    'p/providers-2018-09$%hash%.json': {
                        sha256: '14346045d7a7261cb3a12a6b7a1a7c4151982530347b115e5e277d879cad1942',
                    },
                },
            };
            const fileJson = {
                providers: {
                    'wpackagist-plugin/1337-rss-feed-made-for-sharing': {
                        sha256: 'e9b6c98c63f99e59440863a044cc80dd9cddbf5c426b05003dba98983b5757de',
                    },
                    'wpackagist-plugin/1beyt': {
                        sha256: 'b574a802b5bf20a58c0f027e73aea2a75d23a6f654afc298a8dc467331be316a',
                    },
                },
            };
            httpMock
                .scope('https://composer.renovatebot.com')
                .get('/packages.json')
                .reply(200, packagesJson)
                .get('/p/providers-2018-09$14346045d7a7261cb3a12a6b7a1a7c4151982530347b115e5e277d879cad1942.json')
                .reply(200, fileJson);
            httpMock
                .scope(baseUrl)
                .get('/p/some/other.json')
                .reply(200, JSON.parse(beytJson));
            const res = await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'some/other',
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('supports providers', async () => {
            const packagesJson = {
                packages: [],
                'providers-url': '/p/%package%$%hash%.json',
                providers: {
                    'wpackagist-plugin/1337-rss-feed-made-for-sharing': {
                        sha256: 'e9b6c98c63f99e59440863a044cc80dd9cddbf5c426b05003dba98983b5757de',
                    },
                    'wpackagist-plugin/1beyt': {
                        sha256: 'b574a802b5bf20a58c0f027e73aea2a75d23a6f654afc298a8dc467331be316a',
                    },
                },
            };
            httpMock
                .scope('https://composer.renovatebot.com')
                .get('/packages.json')
                .reply(200, packagesJson)
                .get('/p/wpackagist-plugin/1beyt$b574a802b5bf20a58c0f027e73aea2a75d23a6f654afc298a8dc467331be316a.json')
                .reply(200, JSON.parse(beytJson));
            const res = await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'wpackagist-plugin/1beyt',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('handles providers miss', async () => {
            const packagesJson = {
                packages: [],
                'providers-url': '/p/%package%$%hash%.json',
                providers: {
                    'wpackagist-plugin/1337-rss-feed-made-for-sharing': {
                        sha256: 'e9b6c98c63f99e59440863a044cc80dd9cddbf5c426b05003dba98983b5757de',
                    },
                    'wpackagist-plugin/1beyt': {
                        sha256: 'b574a802b5bf20a58c0f027e73aea2a75d23a6f654afc298a8dc467331be316a',
                    },
                },
            };
            httpMock
                .scope('https://composer.renovatebot.com')
                .get('/packages.json')
                .reply(200, packagesJson);
            httpMock
                .scope(baseUrl)
                .get('/p/some/other.json')
                .reply(200, JSON.parse(beytJson));
            const res = await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'some/other',
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real versioned data', async () => {
            httpMock
                .scope(baseUrl)
                .get('/p/drewm/mailchimp-api.json')
                .reply(200, JSON.parse(mailchimpJson));
            config.registryUrls = ['https://packagist.org'];
            expect(await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'drewm/mailchimp-api',
            })).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('adds packagist source implicitly', async () => {
            httpMock
                .scope(baseUrl)
                .get('/p/drewm/mailchimp-api.json')
                .reply(200, JSON.parse(mailchimpJson));
            config.registryUrls = [];
            expect(await __1.getPkgReleases({
                ...config,
                datasource: _1.id,
                versioning: loose_1.id,
                depName: 'drewm/mailchimp-api',
            })).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map