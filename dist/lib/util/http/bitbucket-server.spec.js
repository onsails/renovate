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
const platforms_1 = require("../../constants/platforms");
const hostRules = __importStar(require("../host-rules"));
const bitbucket_server_1 = require("./bitbucket-server");
const baseUrl = 'https://git.example.com';
describe(util_1.getName(__filename), () => {
    let api;
    beforeEach(() => {
        api = new bitbucket_server_1.BitbucketServerHttp();
        // reset module
        jest.resetAllMocks();
        // clean up hostRules
        hostRules.clear();
        hostRules.add({
            hostType: platforms_1.PLATFORM_TYPE_BITBUCKET_SERVER,
            baseUrl,
            token: 'token',
        });
        httpMock.reset();
        httpMock.setup();
        bitbucket_server_1.setBaseUrl(baseUrl);
    });
    it('posts', async () => {
        const body = ['a', 'b'];
        httpMock.scope(baseUrl).post('/some-url').reply(200, body);
        const res = await api.postJson('some-url');
        expect(res.body).toEqual(body);
        expect(httpMock.getTrace()).toMatchSnapshot();
    });
});
//# sourceMappingURL=bitbucket-server.spec.js.map