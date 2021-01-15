"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const commit_1 = require("./commit");
jest.mock('../../util/git');
describe('workers/branch/automerge', () => {
    describe('commitFilesToBranch', () => {
        let config;
        beforeEach(() => {
            config = util_1.partial({
                ...util_1.defaultConfig,
                branchName: 'renovate/some-branch',
                commitMessage: 'some commit message',
                semanticCommits: 'disabled',
                semanticCommitType: 'a',
                semanticCommitScope: 'b',
                updatedPackageFiles: [],
                updatedArtifacts: [],
            });
            jest.resetAllMocks();
            util_1.git.commitFiles.mockResolvedValueOnce('abc123');
        });
        it('handles empty files', async () => {
            await commit_1.commitFilesToBranch(config);
            expect(util_1.git.commitFiles).toHaveBeenCalledTimes(0);
        });
        it('commits files', async () => {
            config.updatedPackageFiles.push({
                name: 'package.json',
                contents: 'some contents',
            });
            await commit_1.commitFilesToBranch(config);
            expect(util_1.git.commitFiles).toHaveBeenCalledTimes(1);
            expect(util_1.git.commitFiles.mock.calls).toMatchSnapshot();
        });
        it('dry runs', async () => {
            config.dryRun = true;
            config.updatedPackageFiles.push({
                name: 'package.json',
                contents: 'some contents',
            });
            await commit_1.commitFilesToBranch(config);
            expect(util_1.git.commitFiles).toHaveBeenCalledTimes(0);
        });
    });
});
//# sourceMappingURL=commit.spec.js.map