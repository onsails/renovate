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
const _1 = require(".");
const rubyReleasesHtml = fs_1.default.readFileSync('lib/datasource/ruby-version/__fixtures__/releases.html', 'utf8');
describe('datasource/gradle', () => {
    describe('getReleases', () => {
        beforeEach(() => {
            httpMock.setup();
        });
        afterEach(() => {
            httpMock.reset();
        });
        it('parses real data', async () => {
            httpMock
                .scope('https://www.ruby-lang.org')
                .get('/en/downloads/releases/')
                .reply(200, rubyReleasesHtml);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'ruby',
            });
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws for empty result', async () => {
            httpMock
                .scope('https://www.ruby-lang.org')
                .get('/en/downloads/releases/')
                .reply(200, {});
            await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'ruby' })).rejects.toThrow();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('throws for 404', async () => {
            httpMock
                .scope('https://www.ruby-lang.org')
                .get('/en/downloads/releases/')
                .reply(404);
            await expect(__1.getPkgReleases({ datasource: _1.id, depName: 'ruby' })).rejects.toThrow();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map