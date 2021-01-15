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
const httpMock = __importStar(require("../../../test/http-mock"));
const util_1 = require("../../../test/util");
const error_messages_1 = require("../../constants/error-messages");
const platforms_1 = require("../../constants/platforms");
const hostRules = __importStar(require("../host-rules"));
const gitlab_1 = require("./gitlab");
hostRules.add({
    hostType: platforms_1.PLATFORM_TYPE_GITLAB,
    token: 'abc123',
});
const gitlabApiHost = 'https://gitlab.com';
describe(util_1.getName(__filename), () => {
    let gitlabApi;
    beforeEach(() => {
        gitlabApi = new gitlab_1.GitlabHttp();
        gitlab_1.setBaseUrl(`${gitlabApiHost}/api/v4/`);
        httpMock.setup();
    });
    afterEach(() => {
        jest.resetAllMocks();
        httpMock.reset();
    });
    it('paginates', async () => {
        httpMock
            .scope(gitlabApiHost)
            .get('/api/v4/some-url')
            .reply(200, ['a'], {
            link: '<https://gitlab.com/api/v4/some-url&page=2>; rel="next", <https://gitlab.com/api/v4/some-url&page=3>; rel="last"',
        })
            .get('/api/v4/some-url&page=2')
            .reply(200, ['b', 'c'], {
            link: '<https://gitlab.com/api/v4/some-url&page=3>; rel="next", <https://gitlab.com/api/v4/some-url&page=3>; rel="last"',
        })
            .get('/api/v4/some-url&page=3')
            .reply(200, ['d']);
        const res = await gitlabApi.getJson('some-url', { paginate: true });
        expect(res.body).toHaveLength(4);
        const trace = httpMock.getTrace();
        expect(trace).toHaveLength(3);
        expect(trace).toMatchSnapshot();
    });
    it('attempts to paginate', async () => {
        httpMock.scope(gitlabApiHost).get('/api/v4/some-url').reply(200, ['a'], {
            link: '<https://gitlab.com/api/v4/some-url&page=3>; rel="last"',
        });
        const res = await gitlabApi.getJson('some-url', { paginate: true });
        expect(res.body).toHaveLength(1);
        const trace = httpMock.getTrace();
        expect(trace).toHaveLength(1);
        expect(trace).toMatchSnapshot();
    });
    it('posts', async () => {
        const body = ['a', 'b'];
        httpMock.scope(gitlabApiHost).post('/api/v4/some-url').reply(200, body);
        const res = await gitlabApi.postJson('some-url');
        expect(res.body).toEqual(body);
        expect(httpMock.getTrace()).toMatchSnapshot();
    });
    it('sets baseUrl', () => {
        expect(() => gitlab_1.setBaseUrl('https://gitlab.renovatebot.com/api/v4/')).not.toThrow();
    });
    describe('fails with', () => {
        it('403', async () => {
            httpMock.scope(gitlabApiHost).get('/api/v4/some-url').reply(403);
            await expect(gitlabApi.get('some-url')).rejects.toThrowErrorMatchingInlineSnapshot(`"Response code 403 (Forbidden)"`);
        });
        it('404', async () => {
            httpMock.scope(gitlabApiHost).get('/api/v4/some-url').reply(404);
            await expect(gitlabApi.get('some-url')).rejects.toThrowErrorMatchingInlineSnapshot(`"Response code 404 (Not Found)"`);
        });
        it('500', async () => {
            httpMock.scope(gitlabApiHost).get('/api/v4/some-url').reply(500);
            await expect(gitlabApi.get('some-url')).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
        });
        it('EAI_AGAIN', async () => {
            httpMock
                .scope(gitlabApiHost)
                .get('/api/v4/some-url')
                .replyWithError({ code: 'EAI_AGAIN' });
            await expect(gitlabApi.get('some-url')).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
        });
        it('ParseError', async () => {
            httpMock.scope(gitlabApiHost).get('/api/v4/some-url').reply(200, '{{');
            await expect(gitlabApi.getJson('some-url')).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
        });
    });
});
//# sourceMappingURL=gitlab.spec.js.map