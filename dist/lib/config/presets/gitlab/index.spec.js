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
const error_messages_1 = require("../../../constants/error-messages");
const util_2 = require("../util");
const gitlab = __importStar(require("."));
const gitlabApiHost = 'https://gitlab.com';
const basePath = '/api/v4/projects/some%2Frepo/repository';
describe(util_1.getName(__filename), () => {
    beforeEach(() => {
        jest.resetAllMocks();
        httpMock.setup();
    });
    afterEach(() => {
        httpMock.reset();
    });
    describe('getPreset()', () => {
        it('throws EXTERNAL_HOST_ERROR', async () => {
            httpMock.scope(gitlabApiHost).get(`${basePath}/branches`).reply(500);
            await expect(gitlab.getPreset({
                packageName: 'some/repo',
                presetName: 'non-default',
            })).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws if missing', async () => {
            httpMock
                .scope(gitlabApiHost)
                .get(`${basePath}/branches`)
                .twice()
                .reply(200, [])
                .get(`${basePath}/files/default.json/raw?ref=master`)
                .reply(404, null)
                .get(`${basePath}/files/renovate.json/raw?ref=master`)
                .reply(404, null);
            await expect(gitlab.getPreset({ packageName: 'some/repo' })).rejects.toThrow(util_2.PRESET_DEP_NOT_FOUND);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('should return the preset', async () => {
            httpMock
                .scope(gitlabApiHost)
                .get(`${basePath}/branches`)
                .reply(200, [
                {
                    name: 'devel',
                },
                {
                    name: 'master',
                    default: true,
                },
            ])
                .get(`${basePath}/files/default.json/raw?ref=master`)
                .reply(200, { foo: 'bar' }, {});
            const content = await gitlab.getPreset({ packageName: 'some/repo' });
            expect(content).toEqual({ foo: 'bar' });
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
    describe('getPresetFromEndpoint()', () => {
        it('uses default endpoint', async () => {
            httpMock
                .scope(gitlabApiHost)
                .get(`${basePath}/branches`)
                .reply(200, [
                {
                    name: 'devel',
                    default: true,
                },
            ])
                .get(`${basePath}/files/some.json/raw?ref=devel`)
                .reply(200, { preset: { file: {} } });
            expect(await gitlab.getPresetFromEndpoint('some/repo', 'some/preset/file')).toEqual({});
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('uses custom endpoint', async () => {
            httpMock
                .scope('https://gitlab.example.org')
                .get(`${basePath}/branches`)
                .reply(200, [
                {
                    name: 'devel',
                    default: true,
                },
            ])
                .get(`${basePath}/files/some.json/raw?ref=devel`)
                .reply(404);
            await expect(gitlab.getPresetFromEndpoint('some/repo', 'some/preset/file', 'https://gitlab.example.org/api/v4')).rejects.toThrow(util_2.PRESET_DEP_NOT_FOUND);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map