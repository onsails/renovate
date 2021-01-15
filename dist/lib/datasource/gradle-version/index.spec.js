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
const fs_1 = __importDefault(require("fs"));
const __1 = require("..");
const httpMock = __importStar(require("../../../test/http-mock"));
const gradle_1 = require("../../versioning/gradle");
const _1 = require(".");
const allResponse = fs_1.default.readFileSync('lib/datasource/gradle-version/__fixtures__/all.json');
let config;
describe('datasource/gradle-version', () => {
    describe('getReleases', () => {
        beforeEach(() => {
            config = {
                datasource: _1.id,
                versioning: gradle_1.id,
                depName: 'abc',
            };
            jest.clearAllMocks();
            httpMock.setup();
        });
        afterEach(() => {
            httpMock.reset();
        });
        it('processes real data', async () => {
            httpMock
                .scope('https://services.gradle.org/')
                .get('/versions/all')
                .reply(200, JSON.parse(allResponse));
            const res = await __1.getPkgReleases(config);
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('calls configured registryUrls', async () => {
            httpMock
                .scope('https://foo.bar')
                .get('/')
                .reply(200, JSON.parse(allResponse));
            httpMock
                .scope('http://baz.qux')
                .get('/')
                .reply(200, JSON.parse(allResponse));
            const res = await __1.getPkgReleases({
                ...config,
                registryUrls: ['https://foo.bar', 'http://baz.qux'],
            });
            // This will have every release duplicated, because we used the same
            // mocked data for both responses.
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map