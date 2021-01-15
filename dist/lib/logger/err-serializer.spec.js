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
const httpMock = __importStar(require("../../test/http-mock"));
const util_1 = require("../../test/util");
const hostRules = __importStar(require("../util/host-rules"));
const http_1 = require("../util/http");
const err_serializer_1 = __importDefault(require("./err-serializer"));
const utils_1 = require("./utils");
describe('logger/err-serializer', () => {
    it('expands errors', () => {
        const err = util_1.partial({
            a: 1,
            b: 2,
            message: 'some message',
            response: {
                body: 'some response body',
                url: 'some/path',
            },
            options: {
                headers: {
                    authorization: 'Bearer abc',
                },
            },
        });
        expect(err_serializer_1.default(err)).toMatchSnapshot();
    });
    it('handles missing fields', () => {
        const err = util_1.partial({
            a: 1,
            stack: 'foo',
            body: 'some body',
        });
        expect(err_serializer_1.default(err)).toMatchSnapshot();
    });
    describe('got', () => {
        const baseUrl = 'https://github.com';
        beforeEach(() => {
            // reset module
            jest.resetAllMocks();
            httpMock.setup();
            // clean up hostRules
            hostRules.clear();
            hostRules.add({
                hostType: 'any',
                baseUrl,
                token: 'token',
            });
        });
        afterEach(() => httpMock.reset());
        it('handles http error', async () => {
            httpMock
                .scope(baseUrl)
                .post('/api')
                .reply(412, { err: { message: 'failed' } });
            let err;
            try {
                await new http_1.Http('any').postJson('https://:token@github.com/api');
            }
            catch (error) {
                err = err_serializer_1.default(error);
            }
            expect(httpMock.getTrace()).toMatchSnapshot();
            expect(err).toBeDefined();
            expect(err.response.body).toBeDefined();
            expect(err.options).toBeDefined();
        });
        it('sanitize http error', async () => {
            httpMock
                .scope(baseUrl)
                .post('/api')
                .reply(412, { err: { message: 'failed' } });
            let err;
            try {
                await new http_1.Http('any').postJson('https://:token@github.com/api');
            }
            catch (error) {
                err = error;
            }
            expect(httpMock.getTrace()).toMatchSnapshot();
            expect(err).toBeDefined();
            // remove platform related props
            delete err.timings;
            delete err.stack;
            // sanitize like Bunyan
            expect(utils_1.sanitizeValue(err)).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=err-serializer.spec.js.map