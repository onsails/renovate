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
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const httpMock = __importStar(require("../../../test/http-mock"));
const error_messages_1 = require("../../constants/error-messages");
const rubyVersioning = __importStar(require("../../versioning/ruby"));
const pod = __importStar(require("."));
const config = {
    versioning: rubyVersioning.id,
    datasource: pod.id,
    depName: 'foo',
    registryUrls: [],
};
const githubApiHost = 'https://api.github.com';
const cocoapodsHost = 'https://cdn.cocoapods.org';
describe('datasource/cocoapods', () => {
    describe('getReleases', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            httpMock.setup();
        });
        afterEach(() => {
            httpMock.reset();
        });
        it('returns null for invalid inputs', async () => {
            expect(await __1.getPkgReleases({
                datasource: pod.id,
                depName: 'foobar',
                registryUrls: [],
            })).toBeNull();
        });
        it('returns null for empty result', async () => {
            expect(await __1.getPkgReleases(config)).toBeNull();
        });
        it('returns null for 404', async () => {
            httpMock
                .scope(githubApiHost)
                .get('/repos/foo/bar/contents/Specs/foo')
                .reply(404)
                .get('/repos/foo/bar/contents/Specs/a/c/b/foo')
                .reply(404);
            const res = await __1.getPkgReleases({
                ...config,
                registryUrls: [...config.registryUrls, 'https://github.com/foo/bar'],
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for 401', async () => {
            httpMock
                .scope(cocoapodsHost)
                .get('/all_pods_versions_a_c_b.txt')
                .reply(401);
            expect(await __1.getPkgReleases(config)).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws for 429', async () => {
            httpMock
                .scope(cocoapodsHost)
                .get('/all_pods_versions_a_c_b.txt')
                .reply(429);
            await expect(__1.getPkgReleases(config)).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for unknown error', async () => {
            httpMock
                .scope(cocoapodsHost)
                .get('/all_pods_versions_a_c_b.txt')
                .replyWithError('foobar');
            expect(await __1.getPkgReleases(config)).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data from CDN', async () => {
            httpMock
                .scope(cocoapodsHost)
                .get('/all_pods_versions_a_c_b.txt')
                .reply(200, 'foo/1.2.3');
            expect(await __1.getPkgReleases({
                ...config,
                registryUrls: ['https://github.com/CocoaPods/Specs'],
            })).toEqual({
                releases: [
                    {
                        version: '1.2.3',
                    },
                ],
            });
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data from Github', async () => {
            httpMock
                .scope(githubApiHost)
                .get('/repos/Artsy/Specs/contents/Specs/foo')
                .reply(404)
                .get('/repos/Artsy/Specs/contents/Specs/a/c/b/foo')
                .reply(200, [{ name: '1.2.3' }]);
            const res = await __1.getPkgReleases({
                ...config,
                registryUrls: ['https://github.com/Artsy/Specs'],
            });
            expect(res).toEqual({
                releases: [
                    {
                        version: '1.2.3',
                    },
                ],
            });
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map