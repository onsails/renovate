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
const platforms_1 = require("../../constants/platforms");
const platform = __importStar(require("../../platform"));
const _ghApi = __importStar(require("../../platform/github"));
const _hostRules = __importStar(require("../../util/host-rules"));
const autodiscover_1 = require("./autodiscover");
jest.mock('../../platform/github');
jest.unmock('../../platform');
// imports are readonly
const hostRules = _hostRules;
const ghApi = _ghApi;
describe('lib/workers/global/autodiscover', () => {
    let config;
    beforeEach(async () => {
        jest.resetAllMocks();
        config = {};
        await platform.initPlatform({
            platform: platforms_1.PLATFORM_TYPE_GITHUB,
            token: 'abc123',
            endpoint: 'endpoint',
        });
    });
    it('returns if not autodiscovering', async () => {
        expect(await autodiscover_1.autodiscoverRepositories(config)).toEqual(config);
    });
    it('autodiscovers github but empty', async () => {
        config.autodiscover = true;
        config.platform = platforms_1.PLATFORM_TYPE_GITHUB;
        hostRules.find = jest.fn(() => ({
            token: 'abc',
        }));
        ghApi.getRepos = jest.fn(() => Promise.resolve([]));
        const res = await autodiscover_1.autodiscoverRepositories(config);
        expect(res).toEqual(config);
    });
    it('autodiscovers github repos', async () => {
        config.autodiscover = true;
        config.platform = platforms_1.PLATFORM_TYPE_GITHUB;
        hostRules.find = jest.fn(() => ({
            token: 'abc',
        }));
        ghApi.getRepos = jest.fn(() => Promise.resolve(['a', 'b']));
        const res = await autodiscover_1.autodiscoverRepositories(config);
        expect(res.repositories).toHaveLength(2);
    });
    it('filters autodiscovered github repos', async () => {
        config.autodiscover = true;
        config.autodiscoverFilter = 'project/re*';
        config.platform = platforms_1.PLATFORM_TYPE_GITHUB;
        hostRules.find = jest.fn(() => ({
            token: 'abc',
        }));
        ghApi.getRepos = jest.fn(() => Promise.resolve(['project/repo', 'project/another-repo']));
        const res = await autodiscover_1.autodiscoverRepositories(config);
        expect(res.repositories).toEqual(['project/repo']);
    });
    it('filters autodiscovered github repos but nothing matches', async () => {
        config.autodiscover = true;
        config.autodiscoverFilter = 'project/re*';
        config.platform = 'github';
        hostRules.find = jest.fn(() => ({
            token: 'abc',
        }));
        ghApi.getRepos = jest.fn(() => Promise.resolve(['another-project/repo', 'another-project/another-repo']));
        const res = await autodiscover_1.autodiscoverRepositories(config);
        expect(res).toEqual(config);
    });
});
//# sourceMappingURL=autodiscover.spec.js.map