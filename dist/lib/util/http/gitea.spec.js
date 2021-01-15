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
const gitea_1 = require("./gitea");
describe(util_1.getName(__filename), () => {
    const baseUrl = 'https://gitea.renovatebot.com/api/v1';
    let giteaHttp;
    beforeEach(() => {
        giteaHttp = new gitea_1.GiteaHttp();
        jest.resetAllMocks();
        httpMock.reset();
        httpMock.setup();
        gitea_1.setBaseUrl(baseUrl);
    });
    it('supports responses without pagination when enabled', async () => {
        httpMock
            .scope(baseUrl)
            .get('/pagination-example-1')
            .reply(200, { hello: 'world' });
        const res = await giteaHttp.getJson('pagination-example-1', {
            paginate: true,
        });
        expect(res.body).toEqual({ hello: 'world' });
        expect(httpMock.getTrace()).toMatchSnapshot();
    });
    it('supports root-level pagination', async () => {
        httpMock
            .scope(baseUrl)
            .get('/pagination-example-1')
            .reply(200, ['abc', 'def', 'ghi'], { 'x-total-count': '5' })
            .get('/pagination-example-1?page=2')
            .reply(200, ['jkl'])
            .get('/pagination-example-1?page=3')
            .reply(200, ['mno', 'pqr']);
        const res = await giteaHttp.getJson(`${baseUrl}/pagination-example-1`, {
            paginate: true,
        });
        expect(res.body).toHaveLength(6);
        expect(res.body).toEqual(['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr']);
        expect(httpMock.getTrace()).toMatchSnapshot();
    });
    it('supports pagination on data property', async () => {
        httpMock
            .scope(baseUrl)
            .get('/pagination-example-2')
            .reply(200, { data: ['abc', 'def', 'ghi'] }, { 'x-total-count': '5' })
            .get('/pagination-example-2?page=2')
            .reply(200, { data: ['jkl'] })
            .get('/pagination-example-2?page=3')
            .reply(200, { data: ['mno', 'pqr'] });
        const res = await giteaHttp.getJson('pagination-example-2', {
            paginate: true,
        });
        expect(res.body.data).toHaveLength(6);
        expect(res.body.data).toEqual(['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr']);
        expect(httpMock.getTrace()).toMatchSnapshot();
    });
    it('handles pagination with empty response', async () => {
        httpMock
            .scope(baseUrl)
            .get('/pagination-example-3')
            .reply(200, { data: ['abc', 'def', 'ghi'] }, { 'x-total-count': '5' })
            .get('/pagination-example-3?page=2')
            .reply(200, { data: [] });
        const res = await giteaHttp.getJson('pagination-example-3', {
            paginate: true,
        });
        expect(res.body.data).toHaveLength(3);
        expect(res.body.data).toEqual(['abc', 'def', 'ghi']);
        expect(httpMock.getTrace()).toMatchSnapshot();
    });
});
//# sourceMappingURL=gitea.spec.js.map