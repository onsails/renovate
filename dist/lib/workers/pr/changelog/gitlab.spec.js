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
const httpMock = __importStar(require("../../../../test/http-mock"));
const util_1 = require("../../../../test/util");
const platforms_1 = require("../../../constants/platforms");
const hostRules = __importStar(require("../../../util/host-rules"));
const semverVersioning = __importStar(require("../../../versioning/semver"));
const _1 = require(".");
jest.mock('../../../../lib/datasource/npm');
const upgrade = {
    branchName: undefined,
    endpoint: 'https://gitlab.com/api/v4/ ',
    depName: 'renovate',
    versioning: semverVersioning.id,
    fromVersion: '5.2.0',
    toVersion: '5.7.0',
    sourceUrl: 'https://gitlab.com/meno/dropzone/',
    releases: [
        // TODO: test gitRef
        { version: '5.2.0' },
        {
            version: '5.4.0',
            releaseTimestamp: '2018-08-24T14:23:00.000Z',
        },
        { version: '5.5.0', gitRef: 'eba303e91c930292198b2fc57040145682162a1b' },
        { version: '5.6.0', releaseTimestamp: '2020-02-13T15:37:00.000Z' },
        { version: '5.6.1' },
    ],
};
const baseUrl = 'https://gitlab.com/';
describe(util_1.getName(__filename), () => {
    describe('getChangeLogJSON', () => {
        beforeEach(() => {
            httpMock.setup();
            hostRules.clear();
            hostRules.add({
                hostType: platforms_1.PLATFORM_TYPE_GITLAB,
                baseUrl,
                token: 'abc',
            });
        });
        afterEach(() => {
            httpMock.reset();
        });
        it('returns null if @types', async () => {
            httpMock.scope(baseUrl);
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                fromVersion: null,
            })).toBeNull();
            expect(httpMock.getTrace()).toBeEmpty();
        });
        it('returns null if fromVersion equals toVersion', async () => {
            httpMock.scope(baseUrl);
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                fromVersion: '1.0.0',
                toVersion: '1.0.0',
            })).toBeNull();
            expect(httpMock.getTrace()).toBeEmpty();
        });
        it('skips invalid repos', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                sourceUrl: 'https://gitlab.com/help',
            })).toBeNull();
        });
        it('works without GitLab', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
            })).toMatchSnapshot();
        });
        it('uses GitLab tags', async () => {
            httpMock
                .scope(baseUrl)
                .get('/api/v4/projects/meno%2fdropzone/repository/tags?per_page=100')
                .reply(200, [
                { name: 'v5.2.0' },
                { name: 'v5.4.0' },
                { name: 'v5.5.0' },
                { name: 'v5.6.0' },
                { name: 'v5.6.1' },
                { name: 'v5.7.0' },
            ])
                .persist()
                .get('/api/v4/projects/meno%2fdropzone/repository/tree?per_page=100')
                .reply(200, [])
                .persist()
                .get('/api/v4/projects/meno%2fdropzone/releases?per_page=100')
                .reply(200, []);
            expect(await _1.getChangeLogJSON({
                ...upgrade,
            })).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('handles empty GitLab tags response', async () => {
            httpMock
                .scope(baseUrl)
                .get('/api/v4/projects/meno%2fdropzone/repository/tags?per_page=100')
                .reply(200, [])
                .persist()
                .get('/api/v4/projects/meno%2fdropzone/repository/tree?per_page=100')
                .reply(200, [])
                .persist()
                .get('/api/v4/projects/meno%2fdropzone/releases?per_page=100')
                .reply(200, []);
            expect(await _1.getChangeLogJSON({
                ...upgrade,
            })).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('uses GitLab tags with error', async () => {
            httpMock
                .scope(baseUrl)
                .get('/api/v4/projects/meno%2fdropzone/repository/tags?per_page=100')
                .replyWithError('Unknown GitLab Repo')
                .persist()
                .get('/api/v4/projects/meno%2fdropzone/repository/tree?per_page=100')
                .reply(200, [])
                .persist()
                .get('/api/v4/projects/meno%2fdropzone/releases?per_page=100')
                .reply(200, []);
            expect(await _1.getChangeLogJSON({
                ...upgrade,
            })).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('handles no sourceUrl', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                sourceUrl: undefined,
            })).toBeNull();
        });
        it('handles invalid sourceUrl', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                sourceUrl: 'http://example.com',
            })).toBeNull();
        });
        it('handles no releases', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                releases: [],
            })).toBeNull();
        });
        it('handles not enough releases', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                releases: [{ version: '0.9.0' }],
            })).toBeNull();
        });
        it('supports gitlab enterprise and gitlab enterprise changelog', async () => {
            hostRules.add({
                hostType: platforms_1.PLATFORM_TYPE_GITLAB,
                baseUrl: 'https://gitlab-enterprise.example.com/',
                token: 'abc',
            });
            process.env.GITHUB_ENDPOINT = '';
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                sourceUrl: 'https://gitlab-enterprise.example.com/meno/dropzone/',
                endpoint: 'https://gitlab-enterprise.example.com/',
            })).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=gitlab.spec.js.map