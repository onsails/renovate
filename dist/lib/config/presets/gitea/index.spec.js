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
const gitea_1 = require("../../../util/http/gitea");
const util_2 = require("../util");
const gitea = __importStar(require("."));
jest.mock('../../../util/host-rules');
const hostRules = util_1.mocked(_hostRules);
const giteaApiHost = gitea.Endpoint;
const basePath = '/repos/some/repo/contents';
describe(util_1.getName(__filename), () => {
    beforeEach(() => {
        httpMock.setup();
        hostRules.find.mockReturnValue({ token: 'abc' });
        gitea_1.setBaseUrl(giteaApiHost);
    });
    afterEach(() => httpMock.reset());
    describe('fetchJSONFile()', () => {
        it('returns JSON', async () => {
            httpMock
                .scope(giteaApiHost)
                .get(`${basePath}/some-filename.json`)
                .reply(200, {
                content: Buffer.from('{"from":"api"}').toString('base64'),
            });
            const res = await gitea.fetchJSONFile('some/repo', 'some-filename.json', giteaApiHost);
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
    describe('getPreset()', () => {
        it('tries default then renovate', async () => {
            httpMock
                .scope(giteaApiHost)
                .get(`${basePath}/default.json`)
                .reply(404, {})
                .get(`${basePath}/renovate.json`)
                .reply(200, {});
            await expect(gitea.getPreset({ packageName: 'some/repo' })).rejects.toThrow();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws if no content', async () => {
            httpMock
                .scope(giteaApiHost)
                .get(`${basePath}/default.json`)
                .reply(200, {});
            await expect(gitea.getPreset({ packageName: 'some/repo' })).rejects.toThrow('invalid preset JSON');
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws if fails to parse', async () => {
            httpMock
                .scope(giteaApiHost)
                .get(`${basePath}/default.json`)
                .reply(200, {
                content: Buffer.from('not json').toString('base64'),
            });
            await expect(gitea.getPreset({ packageName: 'some/repo' })).rejects.toThrow('invalid preset JSON');
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('should return default.json', async () => {
            httpMock
                .scope(giteaApiHost)
                .get(`${basePath}/default.json`)
                .reply(200, {
                content: Buffer.from('{"foo":"bar"}').toString('base64'),
            });
            const content = await gitea.getPreset({ packageName: 'some/repo' });
            expect(content).toEqual({ foo: 'bar' });
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('should query preset within the file', async () => {
            httpMock
                .scope(giteaApiHost)
                .get(`${basePath}/somefile.json`)
                .reply(200, {
                content: Buffer.from('{"somename":{"foo":"bar"}}').toString('base64'),
            });
            const content = await gitea.getPreset({
                packageName: 'some/repo',
                presetName: 'somefile/somename',
            });
            expect(content).toEqual({ foo: 'bar' });
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('should query subpreset', async () => {
            httpMock
                .scope(giteaApiHost)
                .get(`${basePath}/somefile.json`)
                .reply(200, {
                content: Buffer.from('{"somename":{"somesubname":{"foo":"bar"}}}').toString('base64'),
            });
            const content = await gitea.getPreset({
                packageName: 'some/repo',
                presetName: 'somefile/somename/somesubname',
            });
            expect(content).toEqual({ foo: 'bar' });
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('should return custom.json', async () => {
            httpMock
                .scope(giteaApiHost)
                .get(`${basePath}/custom.json`)
                .reply(200, {
                content: Buffer.from('{"foo":"bar"}').toString('base64'),
            });
            const content = await gitea.getPreset({
                packageName: 'some/repo',
                presetName: 'custom',
            });
            expect(content).toEqual({ foo: 'bar' });
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('should throws not-found', async () => {
            httpMock
                .scope(giteaApiHost)
                .get(`${basePath}/somefile.json`)
                .reply(200, {
                content: Buffer.from('{}').toString('base64'),
            });
            await expect(gitea.getPreset({
                packageName: 'some/repo',
                presetName: 'somefile/somename/somesubname',
            })).rejects.toThrow(util_2.PRESET_NOT_FOUND);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
    describe('getPresetFromEndpoint()', () => {
        it('uses default endpoint', async () => {
            httpMock
                .scope(giteaApiHost)
                .get(`${basePath}/default.json`)
                .reply(200, {
                content: Buffer.from('{"from":"api"}').toString('base64'),
            });
            expect(await gitea.getPresetFromEndpoint('some/repo', 'default')).toEqual({ from: 'api' });
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('uses custom endpoint', async () => {
            httpMock
                .scope('https://api.gitea.example.org')
                .get(`${basePath}/default.json`)
                .reply(200, {
                content: Buffer.from('{"from":"api"}').toString('base64'),
            });
            expect(await gitea
                .getPresetFromEndpoint('some/repo', 'default', 'https://api.gitea.example.org')
                .catch(() => ({ from: 'api' }))).toEqual({ from: 'api' });
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map