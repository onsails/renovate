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
const httpMock = __importStar(require("../../../../test/http-mock"));
const util_1 = require("../../../../test/util");
const _hostRules = __importStar(require("../../../util/host-rules"));
const util_2 = require("../util");
const bitbucketServer = __importStar(require("."));
jest.mock('../../../util/host-rules');
const hostRules = util_1.mocked(_hostRules);
const bitbucketApiHost = 'https://git.company.org';
const basePath = '/rest/api/1.0/projects/some/repos/repo/browse';
describe(util_1.getName(__filename), () => {
    beforeEach(() => {
        httpMock.setup();
        hostRules.find.mockReturnValue({ token: 'abc' });
    });
    afterEach(() => httpMock.reset());
    describe('fetchJSONFile()', () => {
        it('returns JSON', async () => {
            httpMock
                .scope(bitbucketApiHost)
                .get(`${basePath}/some-filename.json`)
                .query({ limit: 20000 })
                .reply(200, {
                isLastPage: true,
                lines: [{ text: '{"from":"api"' }, { text: '}' }],
            });
            const res = await bitbucketServer.fetchJSONFile('some/repo', 'some-filename.json', bitbucketApiHost);
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws 404', async () => {
            httpMock
                .scope(bitbucketApiHost)
                .get(`${basePath}/some-filename.json`)
                .query({ limit: 20000 })
                .reply(404);
            await expect(bitbucketServer.fetchJSONFile('some/repo', 'some-filename.json', bitbucketApiHost)).rejects.toThrow(util_2.PRESET_DEP_NOT_FOUND);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws to big', async () => {
            httpMock
                .scope(bitbucketApiHost)
                .get(`${basePath}/some-filename.json`)
                .query({ limit: 20000 })
                .reply(200, {
                isLastPage: false,
                size: 50000,
                lines: [{ text: '{"from":"api"}' }],
            });
            await expect(bitbucketServer.fetchJSONFile('some/repo', 'some-filename.json', bitbucketApiHost)).rejects.toThrow('invalid preset JSON');
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws to invalid', async () => {
            httpMock
                .scope(bitbucketApiHost)
                .get(`${basePath}/some-filename.json`)
                .query({ limit: 20000 })
                .reply(200, {
                isLastPage: true,
                lines: [{ text: '{"from":"api"' }],
            });
            await expect(bitbucketServer.fetchJSONFile('some/repo', 'some-filename.json', bitbucketApiHost)).rejects.toThrow('invalid preset JSON');
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
    describe('getPresetFromEndpoint()', () => {
        it('uses custom endpoint', async () => {
            httpMock
                .scope('https://api.github.example.org')
                .get(`${basePath}/default.json`)
                .query({ limit: 20000 })
                .reply(200, {
                isLastPage: true,
                lines: [{ text: '{"from":"api"}' }],
            });
            expect(await bitbucketServer.getPresetFromEndpoint('some/repo', 'default', 'https://api.github.example.org')).toEqual({ from: 'api' });
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map