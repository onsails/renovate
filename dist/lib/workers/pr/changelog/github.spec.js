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
const util_1 = require("../../../../test/util");
const platforms_1 = require("../../../constants/platforms");
const hostRules = __importStar(require("../../../util/host-rules"));
const semverVersioning = __importStar(require("../../../versioning/semver"));
const _1 = require(".");
jest.mock('../../../../lib/datasource/npm');
const upgrade = {
    branchName: undefined,
    depName: 'renovate',
    endpoint: 'https://api.github.com/',
    versioning: semverVersioning.id,
    fromVersion: '1.0.0',
    toVersion: '3.0.0',
    sourceUrl: 'https://github.com/chalk/chalk',
    releases: [
        { version: '0.9.0' },
        { version: '1.0.0', gitRef: 'npm_1.0.0' },
        {
            version: '2.3.0',
            gitRef: 'npm_2.3.0',
            releaseTimestamp: '2017-10-24T03:20:46.238Z',
        },
        { version: '2.2.2', gitRef: 'npm_2.2.2' },
        { version: '2.4.2', releaseTimestamp: '2017-12-24T03:20:46.238Z' },
        { version: '2.5.2' },
    ],
};
describe(util_1.getName(__filename), () => {
    describe('getChangeLogJSON', () => {
        beforeEach(() => {
            hostRules.clear();
            hostRules.add({
                hostType: platforms_1.PLATFORM_TYPE_GITHUB,
                baseUrl: 'https://api.github.com/',
                token: 'abc',
            });
        });
        it('returns null if @types', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                fromVersion: null,
            })).toBeNull();
        });
        it('returns null if no fromVersion', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                sourceUrl: 'https://github.com/DefinitelyTyped/DefinitelyTyped',
            })).toBeNull();
        });
        it('returns null if fromVersion equals toVersion', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                fromVersion: '1.0.0',
                toVersion: '1.0.0',
            })).toBeNull();
        });
        it('skips invalid repos', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                sourceUrl: 'https://github.com/about',
            })).toBeNull();
        });
        it('works without Github', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
            })).toMatchSnapshot();
        });
        it('uses GitHub tags', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
            })).toMatchSnapshot();
        });
        it('filters unnecessary warns', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                depName: '@renovate/no',
            })).toMatchSnapshot();
        });
        it('supports node engines', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                depType: 'engines',
            })).toMatchSnapshot();
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
        it('handles missing Github token', async () => {
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                sourceUrl: 'https://github.com',
            })).toEqual({ error: _1.ChangeLogError.MissingGithubToken });
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
        it('supports github enterprise and github.com changelog', async () => {
            hostRules.add({
                hostType: platforms_1.PLATFORM_TYPE_GITHUB,
                token: 'super_secret',
                baseUrl: 'https://github-enterprise.example.com/',
            });
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                endpoint: 'https://github-enterprise.example.com/',
            })).toMatchSnapshot();
        });
        it('supports github enterprise and github enterprise changelog', async () => {
            hostRules.add({
                hostType: platforms_1.PLATFORM_TYPE_GITHUB,
                baseUrl: 'https://github-enterprise.example.com/',
                token: 'abc',
            });
            process.env.GITHUB_ENDPOINT = '';
            expect(await _1.getChangeLogJSON({
                ...upgrade,
                sourceUrl: 'https://github-enterprise.example.com/chalk/chalk',
                endpoint: 'https://github-enterprise.example.com/',
            })).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=github.spec.js.map