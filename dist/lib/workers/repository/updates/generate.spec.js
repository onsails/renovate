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
const datasourceNpm = __importStar(require("../../../datasource/npm"));
const generate_1 = require("./generate");
beforeEach(() => {
    jest.resetAllMocks();
});
describe('workers/repository/updates/generate', () => {
    describe('generateBranchConfig()', () => {
        it('does not group single upgrade', () => {
            const branch = [
                {
                    depName: 'some-dep',
                    groupName: 'some-group',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    releaseTimestamp: '2017-02-07T20:01:41+00:00',
                    foo: 1,
                    group: {
                        foo: 2,
                    },
                },
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.foo).toBe(1);
            expect(res.groupName).toBeUndefined();
            expect(res.releaseTimestamp).toBeDefined();
        });
        it('does not group same upgrades', () => {
            const branch = [
                {
                    depName: 'some-dep',
                    groupName: 'some-group',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    foo: 1,
                    group: {
                        foo: 2,
                    },
                },
                {
                    depName: 'some-dep',
                    groupName: 'some-group',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    foo: 1,
                    group: {
                        foo: 2,
                    },
                },
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.foo).toBe(1);
            expect(res.groupName).toBeUndefined();
        });
        it('groups multiple upgrades same version', () => {
            const branch = [
                {
                    depName: 'some-dep',
                    groupName: 'some-group',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    commitMessageExtra: 'to {{#if isMajor}}v{{newMajor}}{{else}}{{#unless isRange}}v{{/unless}}{{newValue}}{{/if}}',
                    foo: 1,
                    newValue: '5.1.2',
                    toVersion: '5.1.2',
                    group: {
                        foo: 2,
                    },
                    releaseTimestamp: '2017-02-07T20:01:41+00:00',
                    automerge: true,
                    constraints: {
                        foo: '1.0.0',
                    },
                },
                {
                    depName: 'some-other-dep',
                    groupName: 'some-group',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    commitMessageExtra: 'to {{#if isMajor}}v{{newMajor}}{{else}}{{#unless isRange}}v{{/unless}}{{newValue}}{{/if}}',
                    foo: 1,
                    newValue: '5.1.2',
                    toVersion: '5.1.2',
                    group: {
                        foo: 2,
                    },
                    releaseTimestamp: '2017-02-06T20:01:41+00:00',
                    automerge: false,
                    constraints: {
                        foo: '1.0.0',
                        bar: '2.0.0',
                    },
                },
                {
                    depName: 'another-dep',
                    groupName: 'some-group',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    commitMessageExtra: 'to {{#if isMajor}}v{{newMajor}}{{else}}{{#unless isRange}}v{{/unless}}{{newValue}}{{/if}}',
                    foo: 1,
                    newValue: '5.1.2',
                    toVersion: '5.1.2',
                    group: {
                        foo: 2,
                    },
                    releaseTimestamp: '2017-02-06T20:01:41+00:00',
                    automerge: false,
                },
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.foo).toBe(2);
            expect(res.groupName).toBeDefined();
            expect(res.releaseTimestamp).toEqual('2017-02-07T20:01:41+00:00');
            expect(res.automerge).toBe(false);
            expect(res.constraints).toEqual({
                foo: '1.0.0',
                bar: '2.0.0',
            });
        });
        it('groups multiple upgrades different version', () => {
            const branch = [
                {
                    depName: 'depB',
                    groupName: 'some-group',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    commitMessageExtra: 'to {{#if isMajor}}v{{newMajor}}{{else}}{{#unless isRange}}v{{/unless}}{{newValue}}{{/if}}',
                    foo: 1,
                    newValue: '5.1.2',
                    toVersion: '5.1.2',
                    group: {
                        foo: 2,
                    },
                    releaseTimestamp: '2017-02-07T20:01:41+00:00',
                },
                {
                    depName: 'depA',
                    groupName: 'some-group',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    commitMessageExtra: 'to {{#if isMajor}}v{{newMajor}}{{else}}{{#unless isRange}}v{{/unless}}{{newValue}}{{/if}}',
                    foo: 1,
                    newValue: '1.1.0',
                    toVersion: '1.1.0',
                    group: {
                        foo: 2,
                    },
                    releaseTimestamp: '2017-02-08T20:01:41+00:00',
                },
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.foo).toBe(2);
            expect(res.singleVersion).toBeUndefined();
            expect(res.recreateClosed).toBe(true);
            expect(res.groupName).toBeDefined();
            expect(res.releaseTimestamp).toEqual('2017-02-08T20:01:41+00:00');
        });
        it('groups multiple digest updates', () => {
            const branch = [
                {
                    depName: 'foo/bar',
                    groupName: 'foo docker images',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    commitMessageExtra: 'to {{#if isMajor}}v{{newMajor}}{{else}}{{#unless isRange}}v{{/unless}}{{newValue}}{{/if}}',
                    isDigest: true,
                    currentDigest: 'abcdefghijklmnopqrstuvwxyz',
                    newDigest: '123abcdefghijklmnopqrstuvwxyz',
                    foo: 1,
                    group: {
                        foo: 2,
                    },
                },
                {
                    depName: 'foo/baz',
                    groupName: 'foo docker images',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    commitMessageExtra: 'to {{#if isMajor}}v{{newMajor}}{{else}}{{#unless isRange}}v{{/unless}}{{newValue}}{{/if}}',
                    foo: 1,
                    newValue: 'zzzzzzzzzz',
                    group: {
                        foo: 2,
                    },
                },
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.foo).toBe(2);
            expect(res.singleVersion).toBeUndefined();
            expect(res.recreateClosed).toBe(true);
            expect(res.groupName).toBeDefined();
        });
        it('fixes different messages', () => {
            const branch = [
                {
                    depName: 'depA',
                    groupName: 'some-group',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    commitMessageExtra: 'to {{#if isMajor}}v{{newMajor}}{{else}}{{#unless isRange}}v{{/unless}}{{newValue}}{{/if}}',
                    foo: 1,
                    newValue: '>= 5.1.2',
                    toVersion: '5.1.2',
                    group: {
                        foo: 2,
                    },
                    releaseTimestamp: '2017-02-07T20:01:41+00:00',
                },
                {
                    depName: 'depA',
                    groupName: 'some-group',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    commitMessageExtra: 'to {{#if isMajor}}v{{newMajor}}{{else}}{{#unless isRange}}v{{/unless}}{{newValue}}{{/if}}',
                    foo: 1,
                    newValue: '^5,1,2',
                    toVersion: '5.1.2',
                    group: {
                        foo: 2,
                    },
                    releaseTimestamp: '2017-02-08T20:01:41+00:00',
                },
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.foo).toBe(1);
            expect(res.groupName).toBeUndefined();
        });
        it('uses semantic commits', () => {
            const branch = [
                util_1.partial({
                    ...util_1.defaultConfig,
                    depName: 'some-dep',
                    semanticCommits: 'enabled',
                    semanticCommitType: 'chore',
                    semanticCommitScope: 'package',
                    newValue: '1.2.0',
                    isSingleVersion: true,
                    toVersion: '1.2.0',
                    foo: 1,
                    group: {
                        foo: 2,
                    },
                }),
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.prTitle).toEqual('chore(package): update dependency some-dep to v1.2.0');
        });
        it('scopes monorepo commits', () => {
            const branch = [
                util_1.partial({
                    ...util_1.defaultConfig,
                    depName: 'some-dep',
                    packageFile: 'package.json',
                    baseDir: '',
                    semanticCommits: 'enabled',
                    semanticCommitType: 'chore',
                    semanticCommitScope: '{{baseDir}}',
                    newValue: '1.2.0',
                    isSingleVersion: true,
                    toVersion: '1.2.0',
                    foo: 1,
                    group: {
                        foo: 2,
                    },
                }),
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.prTitle).toEqual('chore(): update dependency some-dep to v1.2.0');
        });
        it('scopes monorepo commits with nested package files using parent directory', () => {
            const branch = [
                util_1.partial({
                    ...util_1.defaultConfig,
                    commitBodyTable: false,
                    depName: 'some-dep',
                    packageFile: 'foo/bar/package.json',
                    parentDir: 'bar',
                    semanticCommits: 'enabled',
                    semanticCommitType: 'chore',
                    semanticCommitScope: '{{parentDir}}',
                    newValue: '1.2.0',
                    isSingleVersion: true,
                    toVersion: '1.2.0',
                    foo: 1,
                    group: {
                        foo: 2,
                    },
                }),
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.prTitle).toEqual('chore(bar): update dependency some-dep to v1.2.0');
        });
        it('scopes monorepo commits with nested package files using base directory', () => {
            const branch = [
                util_1.partial({
                    ...util_1.defaultConfig,
                    depName: 'some-dep',
                    packageFile: 'foo/bar/package.json',
                    baseDir: 'foo/bar',
                    semanticCommits: 'enabled',
                    semanticCommitType: 'chore',
                    semanticCommitScope: '{{baseDir}}',
                    newValue: '1.2.0',
                    isSingleVersion: true,
                    toVersion: '1.2.0',
                    foo: 1,
                    group: {
                        foo: 2,
                    },
                }),
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.prTitle).toEqual('chore(foo/bar): update dependency some-dep to v1.2.0');
        });
        it('adds commit message body', () => {
            const branch = [
                util_1.partial({
                    ...util_1.defaultConfig,
                    depName: 'some-dep',
                    commitBody: '[skip-ci]',
                    newValue: '1.2.0',
                    isSingleVersion: true,
                    toVersion: '1.2.0',
                }),
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.commitMessage).toMatchSnapshot();
            expect(res.commitMessage).toContain('\n');
        });
        it('supports manual prTitle', () => {
            const branch = [
                util_1.partial({
                    ...util_1.defaultConfig,
                    depName: 'some-dep',
                    prTitle: 'Upgrade {{depName}}',
                    toLowerCase: true,
                }),
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.prTitle).toMatchSnapshot();
        });
        it('handles @types specially', () => {
            const branch = [
                {
                    commitBodyTable: true,
                    datasource: datasourceNpm.id,
                    depName: '@types/some-dep',
                    groupName: null,
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    currentValue: '0.5.7',
                    fromVersion: '0.5.7',
                    toVersion: '0.5.8',
                    group: {},
                },
                {
                    commitBodyTable: true,
                    datasource: datasourceNpm.id,
                    depName: 'some-dep',
                    groupName: null,
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    newValue: '0.6.0',
                    group: {},
                },
                {
                    commitBodyTable: true,
                    datasource: datasourceNpm.id,
                    depName: 'some-dep',
                    groupName: null,
                    branchName: 'some-branch',
                    prTitle: 'some-other-title',
                    newValue: '1.0.0',
                    group: {},
                },
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.recreateClosed).toBe(false);
            expect(res.groupName).toBeUndefined();
            expect(generate_1.generateBranchConfig(branch)).toMatchSnapshot();
        });
        it('handles @types specially (reversed)', () => {
            const branch = [
                {
                    depName: 'some-dep',
                    groupName: null,
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    newValue: '0.6.0',
                    group: {},
                },
                {
                    commitBodyTable: true,
                    datasource: datasourceNpm.id,
                    depName: 'some-dep',
                    groupName: null,
                    branchName: 'some-branch',
                    prTitle: 'some-other-title',
                    newValue: '1.0.0',
                    group: {},
                },
                {
                    depName: '@types/some-dep',
                    groupName: null,
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    newValue: '0.5.7',
                    group: {},
                },
            ];
            expect(generate_1.generateBranchConfig(branch)).toMatchSnapshot();
        });
        it('handles upgrades', () => {
            const branch = [
                {
                    depName: 'some-dep',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    newValue: '0.6.0',
                    hasBaseBranches: true,
                    fileReplacePosition: 5,
                },
                {
                    ...util_1.defaultConfig,
                    depName: 'some-dep',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    newValue: '0.6.0',
                    isGroup: true,
                    separateMinorPatch: true,
                    updateType: 'minor',
                    fileReplacePosition: 1,
                },
                {
                    ...util_1.defaultConfig,
                    depName: 'some-dep',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    newValue: '0.6.0',
                    isGroup: true,
                    separateMajorMinor: true,
                    updateType: 'major',
                    fileReplacePosition: 2,
                },
                {
                    ...util_1.defaultConfig,
                    depName: 'some-dep',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    newValue: '0.6.0',
                    isGroup: true,
                    separateMajorMinor: true,
                    updateType: 'patch',
                    fileReplacePosition: 0,
                },
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.prTitle).toMatchSnapshot();
        });
        it('sorts upgrades, without position first', () => {
            const branch = [
                {
                    depName: 'some-dep1',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    newValue: '0.6.0',
                    fileReplacePosition: 1,
                },
                {
                    depName: 'some-dep2',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    newValue: '0.6.0',
                    fileReplacePosition: undefined,
                },
                {
                    depName: 'some-dep3',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    newValue: '0.6.0',
                    fileReplacePosition: 4,
                },
                {
                    depName: 'some-dep4',
                    branchName: 'some-branch',
                    prTitle: 'some-title',
                    newValue: '0.6.0',
                    fileReplacePosition: undefined,
                },
            ];
            const res = generate_1.generateBranchConfig(branch);
            expect(res.upgrades.map((upgrade) => upgrade.fileReplacePosition)).toStrictEqual([undefined, undefined, 4, 1]);
        });
    });
});
//# sourceMappingURL=generate.spec.js.map