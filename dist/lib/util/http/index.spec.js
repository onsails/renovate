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
const nock_1 = __importDefault(require("nock"));
const util_1 = require("../../../test/util");
const error_messages_1 = require("../../constants/error-messages");
const hostRules = __importStar(require("../host-rules"));
const queue = __importStar(require("./queue"));
const _1 = require(".");
const baseUrl = 'http://renovate.com';
describe(util_1.getName(__filename), () => {
    let http;
    beforeEach(() => {
        http = new _1.Http('dummy');
        nock_1.default.cleanAll();
        hostRules.clear();
        queue.clear();
    });
    it('get', async () => {
        nock_1.default(baseUrl).get('/test').reply(200);
        expect(await http.get('http://renovate.com/test')).toMatchSnapshot();
        expect(nock_1.default.isDone()).toBe(true);
    });
    it('returns 429 error', async () => {
        nock_1.default(baseUrl).get('/test').reply(429);
        await expect(http.get('http://renovate.com/test')).rejects.toThrow('Response code 429 (Too Many Requests)');
        expect(nock_1.default.isDone()).toBe(true);
    });
    it('converts 404 error to ExternalHostError', async () => {
        nock_1.default(baseUrl).get('/test').reply(404);
        hostRules.add({ abortOnError: true });
        await expect(http.get('http://renovate.com/test')).rejects.toThrow(error_messages_1.EXTERNAL_HOST_ERROR);
        expect(nock_1.default.isDone()).toBe(true);
    });
    it('disables hosts', async () => {
        hostRules.add({ hostName: 'renovate.com', enabled: false });
        await expect(http.get('http://renovate.com/test')).rejects.toThrow(error_messages_1.HOST_DISABLED);
    });
    it('ignores 404 error and does not throw ExternalHostError', async () => {
        nock_1.default(baseUrl).get('/test').reply(404);
        hostRules.add({ abortOnError: true, abortIgnoreStatusCodes: [404] });
        await expect(http.get('http://renovate.com/test')).rejects.toThrow('Response code 404 (Not Found)');
        expect(nock_1.default.isDone()).toBe(true);
    });
    it('getJson', async () => {
        nock_1.default(baseUrl).get('/').reply(200, '{ "test": true }');
        expect(await http.getJson('http://renovate.com')).toMatchSnapshot();
    });
    it('postJson', async () => {
        nock_1.default(baseUrl).post('/').reply(200, {});
        expect(await http.postJson('http://renovate.com', { body: {}, baseUrl })).toMatchSnapshot();
        expect(nock_1.default.isDone()).toBe(true);
    });
    it('putJson', async () => {
        nock_1.default(baseUrl).put('/').reply(200, {});
        expect(await http.putJson('http://renovate.com', { body: {}, baseUrl })).toMatchSnapshot();
        expect(nock_1.default.isDone()).toBe(true);
    });
    it('patchJson', async () => {
        nock_1.default(baseUrl).patch('/').reply(200, {});
        expect(await http.patchJson('http://renovate.com', { body: {}, baseUrl })).toMatchSnapshot();
        expect(nock_1.default.isDone()).toBe(true);
    });
    it('deleteJson', async () => {
        nock_1.default(baseUrl).delete('/').reply(200, {});
        expect(await http.deleteJson('http://renovate.com', { body: {}, baseUrl })).toMatchSnapshot();
        expect(nock_1.default.isDone()).toBe(true);
    });
    it('headJson', async () => {
        nock_1.default(baseUrl).head('/').reply(200, {});
        expect(await http.headJson('http://renovate.com', { baseUrl })).toMatchSnapshot();
        expect(nock_1.default.isDone()).toBe(true);
    });
    it('stream', async () => {
        nock_1.default(baseUrl).get('/some').reply(200, {});
        const stream = http.stream('/some', {
            baseUrl,
        });
        expect(stream).toBeDefined();
        let data = '';
        stream.on('data', (c) => {
            data += c;
        });
        const done = new Promise((resolve, reject) => {
            stream.on('end', resolve);
            stream.on('error', reject);
        });
        await done;
        expect(data).toBe('{}');
        expect(nock_1.default.isDone()).toBe(true);
    });
    it('retries', async () => {
        const NODE_ENV = process.env.NODE_ENV;
        try {
            delete process.env.NODE_ENV;
            nock_1.default(baseUrl)
                .head('/')
                .reply(500)
                .head('/')
                .reply(200, undefined, { 'x-some-header': 'abc' });
            expect(await http.head('http://renovate.com')).toMatchSnapshot();
            expect(nock_1.default.isDone()).toBe(true);
        }
        finally {
            process.env.NODE_ENV = NODE_ENV;
        }
    });
    it('limits concurrency by host', async () => {
        hostRules.add({ hostName: 'renovate.com', concurrentRequestLimit: 1 });
        let foo = false;
        let bar = false;
        let baz = false;
        const mockRequestResponse = () => {
            let resolveRequest;
            const request = new Promise((resolve) => {
                resolveRequest = resolve;
            });
            let resolveResponse;
            const response = new Promise((resolve) => {
                resolveResponse = resolve;
            });
            return [request, resolveRequest, response, resolveResponse];
        };
        const [fooReq, fooStart, fooResp, fooFinish] = mockRequestResponse();
        const [barReq, barStart, barResp, barFinish] = mockRequestResponse();
        nock_1.default(baseUrl)
            .get('/foo')
            .reply(200, () => {
            foo = true;
            fooStart();
            return fooResp;
        })
            .get('/bar')
            .reply(200, () => {
            bar = true;
            barStart();
            return barResp;
        })
            .get('/baz')
            .reply(200, () => {
            baz = true;
            return 'baz';
        });
        const all = Promise.all([
            http.get('http://renovate.com/foo'),
            http.get('http://renovate.com/bar'),
            http.get('http://renovate.com/baz'),
        ]);
        await fooReq;
        expect(foo).toBeTrue();
        expect(bar).toBeFalse();
        expect(baz).toBeFalse();
        fooFinish();
        await barReq;
        expect(foo).toBeTrue();
        expect(bar).toBeTrue();
        expect(baz).toBeFalse();
        barFinish();
        await all;
        expect(foo).toBeTrue();
        expect(bar).toBeTrue();
        expect(baz).toBeTrue();
    });
});
//# sourceMappingURL=index.spec.js.map