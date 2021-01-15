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
const external_host_error_1 = require("../../types/errors/external-host-error");
const get_1 = require("./get");
const npmrc_1 = require("./npmrc");
function getPath(s = '') {
    const [x] = s.split('\n');
    const prePath = x.replace(/^.*https:\/\/test\.org/, '');
    return `${prePath}/@myco%2Ftest`;
}
describe(util_1.getName(__filename), () => {
    beforeEach(() => {
        jest.clearAllMocks();
        get_1.resetMemCache();
        httpMock.setup();
    });
    afterEach(() => {
        httpMock.reset();
    });
    describe('has bearer auth', () => {
        const configs = [
            `registry=https://test.org\n//test.org/:_authToken=XXX`,
            `registry=https://test.org/sub\n//test.org/:_authToken=XXX`,
            `registry=https://test.org/sub\n//test.org/sub/:_authToken=XXX`,
            `registry=https://test.org/sub\n_authToken=XXX`,
            `registry=https://test.org\n_authToken=XXX`,
            `registry=https://test.org\n_authToken=XXX`,
            `@myco:registry=https://test.org\n//test.org/:_authToken=XXX`,
        ];
        it.each(configs)('%p', async (npmrc) => {
            expect.assertions(2);
            httpMock
                .scope('https://test.org')
                .get(getPath(npmrc))
                .reply(200, { name: '@myco/test' });
            npmrc_1.setNpmrc(npmrc);
            await get_1.getDependency('@myco/test', 0);
            const trace = httpMock.getTrace();
            expect(trace[0].headers.authorization).toEqual('Bearer XXX');
            expect(trace).toMatchSnapshot();
        });
    });
    describe('has basic auth', () => {
        const configs = [
            `registry=https://test.org\n//test.org/:_auth=dGVzdDp0ZXN0`,
            `registry=https://test.org\n//test.org/:username=test\n//test.org/:_password=dGVzdA==`,
            `registry=https://test.org/sub\n//test.org/:_auth=dGVzdDp0ZXN0`,
            `registry=https://test.org/sub\n//test.org/sub/:_auth=dGVzdDp0ZXN0`,
            `registry=https://test.org/sub\n_auth=dGVzdDp0ZXN0`,
            `registry=https://test.org\n_auth=dGVzdDp0ZXN0`,
            `registry=https://test.org\n_auth=dGVzdDp0ZXN0`,
            `@myco:registry=https://test.org\n//test.org/:_auth=dGVzdDp0ZXN0`,
            `@myco:registry=https://test.org\n_auth=dGVzdDp0ZXN0`,
        ];
        it.each(configs)('%p', async (npmrc) => {
            expect.assertions(2);
            httpMock
                .scope('https://test.org')
                .get(getPath(npmrc))
                .reply(200, { name: '@myco/test' });
            npmrc_1.setNpmrc(npmrc);
            await get_1.getDependency('@myco/test', 0);
            const trace = httpMock.getTrace();
            expect(trace[0].headers.authorization).toEqual('Basic dGVzdDp0ZXN0');
            expect(trace).toMatchSnapshot();
        });
    });
    describe('no auth', () => {
        const configs = [
            `@myco:registry=https://test.org\n_authToken=XXX`,
            `@myco:registry=https://test.org\n//test.org/sub/:_authToken=XXX`,
            `@myco:registry=https://test.org\n//test.org/sub/:_auth=dGVzdDp0ZXN0`,
            `@myco:registry=https://test.org`,
            `registry=https://test.org`,
        ];
        it.each(configs)('%p', async (npmrc) => {
            expect.assertions(2);
            httpMock
                .scope('https://test.org')
                .get(getPath(npmrc))
                .reply(200, { name: '@myco/test' });
            npmrc_1.setNpmrc(npmrc);
            await get_1.getDependency('@myco/test', 0);
            const trace = httpMock.getTrace();
            expect(trace[0].headers.authorization).toBeUndefined();
            expect(trace).toMatchSnapshot();
        });
    });
    it('cover all paths', async () => {
        expect.assertions(10);
        npmrc_1.setNpmrc('registry=https://test.org\n_authToken=XXX');
        httpMock
            .scope('https://test.org')
            .get('/none')
            .reply(200, { name: '@myco/test' });
        expect(await get_1.getDependency('none', 0)).toBeNull();
        httpMock
            .scope('https://test.org')
            .get('/@myco%2Ftest')
            .reply(200, {
            name: '@myco/test',
            repository: {},
            versions: { '1.0.0': {} },
            'dist-tags': { latest: '1.0.0' },
        });
        expect(await get_1.getDependency('@myco/test', 0)).toBeDefined();
        httpMock
            .scope('https://test.org')
            .get('/@myco%2Ftest2')
            .reply(200, {
            name: '@myco/test2',
            versions: { '1.0.0': {} },
            'dist-tags': { latest: '1.0.0' },
        });
        expect(await get_1.getDependency('@myco/test2', 0)).toBeDefined();
        httpMock.scope('https://test.org').get('/error-401').reply(401);
        expect(await get_1.getDependency('error-401', 0)).toBeNull();
        httpMock.scope('https://test.org').get('/error-402').reply(402);
        expect(await get_1.getDependency('error-402', 0)).toBeNull();
        httpMock.scope('https://test.org').get('/error-404').reply(404);
        expect(await get_1.getDependency('error-404', 0)).toBeNull();
        httpMock.scope('https://test.org').get('/error4').reply(200, null);
        expect(await get_1.getDependency('error4', 0)).toBeNull();
        npmrc_1.setNpmrc();
        httpMock
            .scope('https://registry.npmjs.org')
            .get('/npm-parse-error')
            .reply(200, 'not-a-json');
        await expect(get_1.getDependency('npm-parse-error', 0)).rejects.toThrow(external_host_error_1.ExternalHostError);
        httpMock
            .scope('https://registry.npmjs.org')
            .get('/npm-error-402')
            .reply(402);
        expect(await get_1.getDependency('npm-error-402', 0)).toBeNull();
        expect(httpMock.getTrace()).toMatchSnapshot();
    });
});
//# sourceMappingURL=get.spec.js.map