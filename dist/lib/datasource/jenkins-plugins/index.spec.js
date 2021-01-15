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
const __1 = require("..");
const httpMock = __importStar(require("../../../test/http-mock"));
const util_1 = require("../../../test/util");
const versioning = __importStar(require("../../versioning/docker"));
const plugin_versions_json_1 = __importDefault(require("./__fixtures__/plugin-versions.json"));
const update_center_actual_json_1 = __importDefault(require("./__fixtures__/update-center.actual.json"));
const get_1 = require("./get");
const jenkins = __importStar(require("."));
describe(util_1.getName(__filename), () => {
    describe('getReleases', () => {
        const SKIP_CACHE = process.env.RENOVATE_SKIP_CACHE;
        const params = {
            versioning: versioning.id,
            datasource: jenkins.id,
            depName: 'email-ext',
            registryUrls: ['https://updates.jenkins.io/'],
        };
        beforeEach(() => {
            get_1.resetCache();
            httpMock.setup();
            process.env.RENOVATE_SKIP_CACHE = 'true';
            jest.resetAllMocks();
        });
        afterEach(() => {
            if (!httpMock.allUsed()) {
                throw new Error('Not all http mocks have been used!');
            }
            httpMock.reset();
            process.env.RENOVATE_SKIP_CACHE = SKIP_CACHE;
        });
        it('returns null for a package miss', async () => {
            const newparams = { ...params };
            newparams.depName = 'non-existing';
            httpMock
                .scope('https://updates.jenkins.io')
                .get('/current/update-center.actual.json')
                .reply(200, update_center_actual_json_1.default);
            httpMock
                .scope('https://updates.jenkins.io')
                .get('/current/plugin-versions.json')
                .reply(200, plugin_versions_json_1.default);
            expect(await __1.getPkgReleases(newparams)).toBeNull();
        });
        it('returns package releases for a hit for info and releases', async () => {
            httpMock
                .scope('https://updates.jenkins.io')
                .get('/current/update-center.actual.json')
                .reply(200, update_center_actual_json_1.default);
            httpMock
                .scope('https://updates.jenkins.io')
                .get('/current/plugin-versions.json')
                .reply(200, plugin_versions_json_1.default);
            let res = await __1.getPkgReleases(params);
            expect(res.releases).toHaveLength(75);
            expect(res).toMatchSnapshot();
            expect(res.sourceUrl).toBe('https://github.com/jenkinsci/email-ext-plugin');
            expect(res.name).toBe('email-ext');
            expect(res.releases.find((release) => release.version === '2.69')).toBeDefined();
            expect(res.releases.find((release) => release.version === '12.98')).toBeUndefined();
            // check that caching is working and no http requests are done after the first call to getPkgReleases
            res = await __1.getPkgReleases(params);
            expect(res.releases).toHaveLength(75);
        });
        it('returns package releases for a hit for info and miss for releases', async () => {
            httpMock
                .scope('https://updates.jenkins.io')
                .get('/current/update-center.actual.json')
                .reply(200, update_center_actual_json_1.default);
            httpMock
                .scope('https://updates.jenkins.io')
                .get('/current/plugin-versions.json')
                .reply(200, '{}');
            const res = await __1.getPkgReleases(params);
            expect(res.releases).toBeEmpty();
            expect(res).toMatchSnapshot();
            expect(res.sourceUrl).toBe('https://github.com/jenkinsci/email-ext-plugin');
            expect(res.name).toBe('email-ext');
        });
        it('returns null empty response', async () => {
            httpMock
                .scope('https://updates.jenkins.io')
                .get('/current/update-center.actual.json')
                .reply(200, '{}');
            httpMock
                .scope('https://updates.jenkins.io')
                .get('/current/plugin-versions.json')
                .reply(200, '{}');
            expect(await __1.getPkgReleases(params)).toBeNull();
        });
    });
});
//# sourceMappingURL=index.spec.js.map