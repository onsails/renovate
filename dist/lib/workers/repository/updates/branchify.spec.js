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
const defaults_1 = require("../../../config/defaults");
const _changelog = __importStar(require("../changelog"));
const branchify_1 = require("./branchify");
const _flatten = __importStar(require("./flatten"));
const flattenUpdates = util_1.mocked(_flatten).flattenUpdates;
const embedChangelogs = util_1.mocked(_changelog).embedChangelogs;
jest.mock('./flatten');
jest.mock('../changelog');
let config;
beforeEach(() => {
    jest.resetAllMocks();
    config = defaults_1.getConfig();
    config.errors = [];
    config.warnings = [];
});
describe('workers/repository/updates/branchify', () => {
    describe('branchifyUpgrades()', () => {
        it('returns empty', async () => {
            flattenUpdates.mockResolvedValueOnce([]);
            const res = await branchify_1.branchifyUpgrades(config, {});
            expect(res.branches).toEqual([]);
        });
        it('returns one branch if one input', async () => {
            flattenUpdates.mockResolvedValueOnce([
                {
                    depName: 'foo',
                    branchName: 'foo-{{version}}',
                    version: '1.1.0',
                    prTitle: 'some-title',
                    updateType: 'minor',
                    packageFile: 'foo/package.json',
                },
            ]);
            config.repoIsOnboarded = true;
            const res = await branchify_1.branchifyUpgrades(config, {});
            expect(Object.keys(res.branches)).toHaveLength(1);
        });
        it('deduplicates', async () => {
            flattenUpdates.mockResolvedValueOnce([
                {
                    depName: 'foo',
                    branchName: 'foo-{{version}}',
                    currentValue: '1.1.0',
                    newValue: '1.3.0',
                    prTitle: 'some-title',
                    updateType: 'minor',
                    packageFile: 'foo/package.json',
                },
                {
                    depName: 'foo',
                    branchName: 'foo-{{version}}',
                    currentValue: '1.1.0',
                    newValue: '1.2.0',
                    prTitle: 'some-title',
                    updateType: 'minor',
                    packageFile: 'foo/package.json',
                },
            ]);
            config.repoIsOnboarded = true;
            const res = await branchify_1.branchifyUpgrades(config, {});
            expect(Object.keys(res.branches)).toHaveLength(1);
        });
        it('groups if same compiled branch names', async () => {
            flattenUpdates.mockResolvedValueOnce([
                {
                    depName: 'foo',
                    branchName: 'foo',
                    version: '1.1.0',
                    prTitle: 'some-title',
                },
                {
                    depName: 'foo',
                    branchName: 'foo',
                    version: '2.0.0',
                    prTitle: 'some-title',
                },
                {
                    depName: 'bar',
                    branchName: 'bar-{{version}}',
                    version: '1.1.0',
                    prTitle: 'some-title',
                },
            ]);
            const res = await branchify_1.branchifyUpgrades(config, {});
            expect(Object.keys(res.branches)).toHaveLength(2);
        });
        it('groups if same compiled group name', async () => {
            flattenUpdates.mockResolvedValueOnce([
                {
                    depName: 'foo',
                    branchName: 'foo',
                    prTitle: 'some-title',
                    version: '1.1.0',
                    groupName: 'My Group',
                    group: { branchName: 'renovate/{{groupSlug}}' },
                },
                {
                    depName: 'foo',
                    branchName: 'foo',
                    prTitle: 'some-title',
                    version: '2.0.0',
                },
                {
                    depName: 'bar',
                    branchName: 'bar-{{version}}',
                    prTitle: 'some-title',
                    version: '1.1.0',
                    groupName: 'My Group',
                    group: { branchName: 'renovate/my-group' },
                },
            ]);
            const res = await branchify_1.branchifyUpgrades(config, {});
            expect(Object.keys(res.branches)).toHaveLength(2);
        });
        it('no fetch changelogs', async () => {
            config.fetchReleaseNotes = false;
            flattenUpdates.mockResolvedValueOnce([
                {
                    depName: 'foo',
                    branchName: 'foo',
                    prTitle: 'some-title',
                    version: '1.1.0',
                    groupName: 'My Group',
                    group: { branchName: 'renovate/{{groupSlug}}' },
                },
                {
                    depName: 'foo',
                    branchName: 'foo',
                    prTitle: 'some-title',
                    version: '2.0.0',
                },
                {
                    depName: 'bar',
                    branchName: 'bar-{{version}}',
                    prTitle: 'some-title',
                    version: '1.1.0',
                    groupName: 'My Group',
                    group: { branchName: 'renovate/my-group' },
                },
            ]);
            const res = await branchify_1.branchifyUpgrades(config, {});
            expect(embedChangelogs).not.toHaveBeenCalled();
            expect(Object.keys(res.branches)).toHaveLength(2);
        });
    });
});
//# sourceMappingURL=branchify.spec.js.map