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
const bitbucket_1 = require("../../util/http/bitbucket");
const utils = __importStar(require("./utils"));
const range = (count) => [...Array(count).keys()];
const baseUrl = 'https://api.bitbucket.org';
describe('accumulateValues()', () => {
    it('paginates', async () => {
        httpMock.reset();
        httpMock.setup();
        bitbucket_1.setBaseUrl(baseUrl);
        httpMock
            .scope(baseUrl)
            .get('/some-url?pagelen=10')
            .reply(200, {
            values: range(10),
            next: 'https://api.bitbucket.org/2.0/repositories/?pagelen=10&after=9&role=contributor',
        })
            .get('/2.0/repositories/?pagelen=10&after=9&role=contributor')
            .reply(200, {
            values: range(10),
            next: 'https://api.bitbucket.org/2.0/repositories/?pagelen=10&after=19&role=contributor',
        })
            .get('/2.0/repositories/?pagelen=10&after=19&role=contributor')
            .reply(200, {
            values: range(5),
        });
        const res = await utils.accumulateValues('some-url', 'get', null, 10);
        expect(res).toHaveLength(25);
        expect(httpMock.getTrace()).toHaveLength(3);
        expect(httpMock.getTrace()).toMatchSnapshot();
    });
});
//# sourceMappingURL=utils.spec.js.map