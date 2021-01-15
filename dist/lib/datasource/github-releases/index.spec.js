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
const __1 = require("..");
const httpMock = __importStar(require("../../../test/http-mock"));
const _hostRules = __importStar(require("../../util/host-rules"));
const _1 = require(".");
const github = __importStar(require("."));
jest.mock('../../util/host-rules');
const hostRules = _hostRules;
const githubApiHost = 'https://api.github.com';
const githubEnterpriseApiHost = 'https://git.enterprise.com';
const responseBody = [
    { tag_name: 'a', published_at: '2020-03-09T13:00:00Z' },
    { tag_name: 'v', published_at: '2020-03-09T12:00:00Z' },
    { tag_name: '1.0.0', published_at: '2020-03-09T11:00:00Z' },
    { tag_name: 'v1.1.0', published_at: '2020-03-09T10:00:00Z' },
    {
        tag_name: '2.0.0',
        published_at: '2020-04-09T10:00:00Z',
        prerelease: true,
    },
];
describe('datasource/github-releases', () => {
    beforeEach(() => {
        hostRules.hosts.mockReturnValue([]);
        hostRules.find.mockReturnValue({
            token: 'some-token',
        });
        httpMock.setup();
    });
    afterEach(() => {
        httpMock.reset();
    });
    describe('getReleases', () => {
        it('returns releases', async () => {
            httpMock
                .scope(githubApiHost)
                .get('/repos/some/dep/releases?per_page=100')
                .reply(200, responseBody);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'some/dep',
            });
            expect(res).toMatchSnapshot();
            expect(res.releases).toHaveLength(3);
            expect(res.releases.find((release) => release.version === 'v1.1.0')).toBeDefined();
            expect(res.releases.find((release) => release.version === '2.0.0').isStable).toBe(false);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('supports ghe', async () => {
            const lookupName = 'some/dep';
            httpMock
                .scope(githubEnterpriseApiHost)
                .get(`/api/v3/repos/${lookupName}/releases?per_page=100`)
                .reply(200, responseBody);
            const res = await github.getReleases({
                registryUrl: 'https://git.enterprise.com',
                lookupName,
            });
            httpMock.getTrace();
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map