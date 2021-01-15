"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const GitInterfaces_1 = require("azure-devops-node-api/interfaces/GitInterfaces");
describe('platform/azure/helpers', () => {
    let azureHelper;
    let azureApi;
    beforeEach(() => {
        // reset module
        jest.resetModules();
        jest.mock('./azure-got-wrapper');
        azureHelper = require('./azure-helper');
        azureApi = require('./azure-got-wrapper');
    });
    describe('getStorageExtraCloneOpts', () => {
        it('should configure basic auth', () => {
            const res = azureHelper.getStorageExtraCloneOpts({
                username: 'user',
                password: 'pass',
            });
            expect(res).toMatchSnapshot();
        });
        it('should configure personal access token', () => {
            const res = azureHelper.getStorageExtraCloneOpts({
                token: '1234567890123456789012345678901234567890123456789012',
            });
            expect(res).toMatchSnapshot();
        });
        it('should configure bearer token', () => {
            const res = azureHelper.getStorageExtraCloneOpts({ token: 'token' });
            expect(res).toMatchSnapshot();
        });
    });
    describe('getRef', () => {
        it('should get the ref with short ref name', async () => {
            azureApi.gitApi.mockImplementationOnce(() => ({
                getRefs: jest.fn(() => [{ objectId: 132 }]),
            }));
            const res = await azureHelper.getRefs('123', 'branch');
            expect(res).toMatchSnapshot();
        });
        it('should not get ref', async () => {
            azureApi.gitApi.mockImplementationOnce(() => ({
                getRefs: jest.fn(() => []),
            }));
            const res = await azureHelper.getRefs('123');
            expect(res).toHaveLength(0);
        });
        it('should get the ref with full ref name', async () => {
            azureApi.gitApi.mockImplementationOnce(() => ({
                getRefs: jest.fn(() => [{ objectId: '132' }]),
            }));
            const res = await azureHelper.getRefs('123', 'refs/head/branch1');
            expect(res).toMatchSnapshot();
        });
    });
    describe('getAzureBranchObj', () => {
        it('should get the branch object', async () => {
            azureApi.gitApi.mockImplementationOnce(() => ({
                getRefs: jest.fn(() => [{ objectId: '132' }]),
            }));
            const res = await azureHelper.getAzureBranchObj('123', 'branchName', 'base');
            expect(res).toMatchSnapshot();
        });
        it('should get the branch object when ref missing', async () => {
            azureApi.gitApi.mockImplementationOnce(() => ({
                getRefs: jest.fn(() => []),
            }));
            const res = await azureHelper.getAzureBranchObj('123', 'branchName');
            expect(res).toMatchSnapshot();
        });
    });
    describe('getFile', () => {
        it('should return null error GitItemNotFoundException', async () => {
            let eventCount = 0;
            const mockEventStream = new stream_1.Readable({
                objectMode: true,
                /* eslint-disable func-names */
                /* eslint-disable object-shorthand */
                read: function () {
                    if (eventCount < 1) {
                        eventCount += 1;
                        return this.push('{"typeKey": "GitItemNotFoundException"}');
                    }
                    return this.push(null);
                },
            });
            azureApi.gitApi.mockImplementationOnce(() => ({
                getItemText: jest.fn(() => mockEventStream),
            }));
            const res = await azureHelper.getFile('123', 'repository', './myFilePath/test');
            expect(res).toBeNull();
        });
        it('should return null error GitUnresolvableToCommitException', async () => {
            let eventCount = 0;
            const mockEventStream = new stream_1.Readable({
                objectMode: true,
                /* eslint-disable func-names */
                /* eslint-disable object-shorthand */
                read: function () {
                    if (eventCount < 1) {
                        eventCount += 1;
                        return this.push('{"typeKey": "GitUnresolvableToCommitException"}');
                    }
                    return this.push(null);
                },
            });
            azureApi.gitApi.mockImplementationOnce(() => ({
                getItemText: jest.fn(() => mockEventStream),
            }));
            const res = await azureHelper.getFile('123', 'repository', './myFilePath/test');
            expect(res).toBeNull();
        });
        it('should return the file content because it is not a json', async () => {
            let eventCount = 0;
            const mockEventStream = new stream_1.Readable({
                objectMode: true,
                /* eslint-disable func-names */
                /* eslint-disable object-shorthand */
                read: function () {
                    if (eventCount < 1) {
                        eventCount += 1;
                        return this.push('{"hello"= "test"}');
                    }
                    return this.push(null);
                },
            });
            azureApi.gitApi.mockImplementationOnce(() => ({
                getItemText: jest.fn(() => mockEventStream),
            }));
            const res = await azureHelper.getFile('123', 'repository', './myFilePath/test');
            expect(res).toMatchSnapshot();
        });
        it('should return null because the file is not readable', async () => {
            azureApi.gitApi.mockImplementationOnce(() => ({
                getItemText: jest.fn(() => ({
                    readable: false,
                })),
            }));
            const res = await azureHelper.getFile('123', 'repository', './myFilePath/test');
            expect(res).toBeNull();
        });
    });
    describe('max4000Chars', () => {
        it('should be the same', () => {
            const res = azureHelper.max4000Chars('Hello');
            expect(res).toMatchSnapshot();
        });
        it('should be truncated', () => {
            let str = '';
            for (let i = 0; i < 5000; i += 1) {
                str += 'a';
            }
            const res = azureHelper.max4000Chars(str);
            expect(res).toHaveLength(3999);
        });
    });
    describe('getCommitDetails', () => {
        it('should get commit details', async () => {
            azureApi.gitApi.mockImplementationOnce(() => ({
                getCommit: jest.fn(() => ({
                    parents: ['123456'],
                })),
            }));
            const res = await azureHelper.getCommitDetails('123', '123456');
            expect(res).toMatchSnapshot();
        });
    });
    describe('getProjectAndRepo', () => {
        it('should return the object with same strings', () => {
            const res = azureHelper.getProjectAndRepo('myRepoName');
            expect(res).toMatchSnapshot();
        });
        it('should return the object with project and repo', () => {
            const res = azureHelper.getProjectAndRepo('prjName/myRepoName');
            expect(res).toMatchSnapshot();
        });
        it('should return an error', () => {
            expect(() => azureHelper.getProjectAndRepo('prjName/myRepoName/blalba')).toThrow(Error(`prjName/myRepoName/blalba can be only structured this way : 'repository' or 'projectName/repository'!`));
        });
    });
    describe('getMergeMethod', () => {
        it('should default to NoFastForward', async () => {
            azureApi.policyApi.mockImplementationOnce(() => ({
                getPolicyConfigurations: jest.fn(() => []),
            }));
            expect(await azureHelper.getMergeMethod('', '')).toEqual(GitInterfaces_1.GitPullRequestMergeStrategy.NoFastForward);
        });
        it('should return Squash', async () => {
            azureApi.policyApi.mockImplementationOnce(() => ({
                getPolicyConfigurations: jest.fn(() => [
                    {
                        settings: {
                            allowSquash: true,
                            scope: [
                                {
                                    repositoryId: '',
                                },
                            ],
                        },
                        type: {
                            id: 'fa4e907d-c16b-4a4c-9dfa-4916e5d171ab',
                        },
                    },
                ]),
            }));
            expect(await azureHelper.getMergeMethod('', '')).toEqual(GitInterfaces_1.GitPullRequestMergeStrategy.Squash);
        });
        it('should return most specific exact branch policy', async () => {
            const refMock = 'refs/heads/ding';
            azureApi.policyApi.mockImplementationOnce(() => ({
                getPolicyConfigurations: jest.fn(() => [
                    {
                        settings: {
                            allowSquash: true,
                            scope: [
                                {
                                    repositoryId: 'doo-dee-doo-repository-id',
                                },
                            ],
                        },
                        type: {
                            id: 'fa4e907d-c16b-4a4c-9dfa-4916e5d171ab',
                        },
                    },
                    {
                        settings: {
                            allowSquash: true,
                            scope: [
                                {
                                    repositoryId: '',
                                },
                            ],
                        },
                        type: {
                            id: 'fa4e907d-c16b-4a4c-9dfa-4916e5d171ab',
                        },
                    },
                    {
                        settings: {
                            allowRebase: true,
                            scope: [
                                {
                                    matchKind: 'Exact',
                                    refName: refMock,
                                    repositoryId: '',
                                },
                            ],
                        },
                        type: {
                            id: 'fa4e907d-c16b-4a4c-9dfa-4916e5d171ab',
                        },
                    },
                ]),
            }));
            expect(await azureHelper.getMergeMethod('', '', refMock)).toEqual(GitInterfaces_1.GitPullRequestMergeStrategy.Rebase);
        });
        it('should return most specific prefix branch policy', async () => {
            const refMock = 'refs/heads/ding-wow';
            azureApi.policyApi.mockImplementationOnce(() => ({
                getPolicyConfigurations: jest.fn(() => [
                    {
                        settings: {
                            allowSquash: true,
                            scope: [
                                {
                                    repositoryId: '',
                                },
                            ],
                        },
                        type: {
                            id: 'fa4e907d-c16b-4a4c-9dfa-4916e5d171ab',
                        },
                    },
                    {
                        settings: {
                            allowRebase: true,
                            scope: [
                                {
                                    matchKind: 'Prefix',
                                    refName: 'refs/heads/ding',
                                    repositoryId: '',
                                },
                            ],
                        },
                        type: {
                            id: 'fa4e907d-c16b-4a4c-9dfa-4916e5d171ab',
                        },
                    },
                ]),
            }));
            expect(await azureHelper.getMergeMethod('', '', refMock)).toEqual(GitInterfaces_1.GitPullRequestMergeStrategy.Rebase);
        });
    });
});
//# sourceMappingURL=azure-helper.spec.js.map