"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../../test/util");
const git_1 = require("../../../../util/git");
const commit_message_1 = require("../../util/commit-message");
const create_1 = require("./create");
jest.mock('../../../../util/git');
jest.mock('./config', () => ({
    getOnboardingConfig: () => JSON.stringify({
        foo: 'bar',
    }),
}));
const buildExpectedCommitFilesArgument = (message, filename = 'renovate.json') => ({
    branchName: 'renovate/configure',
    files: [
        {
            name: filename,
            contents: '{"foo":"bar"}',
        },
    ],
    message,
});
describe('workers/repository/onboarding/branch', () => {
    let config;
    beforeEach(() => {
        jest.clearAllMocks();
        config = util_1.getConfig();
    });
    describe('createOnboardingBranch', () => {
        it('applies the default commit message', async () => {
            await create_1.createOnboardingBranch(config);
            expect(git_1.commitFiles).toHaveBeenCalledWith(buildExpectedCommitFilesArgument('Add renovate.json'));
        });
        it('applies supplied commit message', async () => {
            const message = 'We can Renovate if we want to, we can leave PRs in decline';
            config.onboardingCommitMessage = message;
            await create_1.createOnboardingBranch(config);
            expect(git_1.commitFiles).toHaveBeenCalledWith(buildExpectedCommitFilesArgument(`${message}`));
        });
        describe('applies the commitMessagePrefix value', () => {
            it('to the default commit message', async () => {
                const prefix = 'RENOV-123';
                config.commitMessagePrefix = prefix;
                await create_1.createOnboardingBranch(config);
                expect(git_1.commitFiles).toHaveBeenCalledWith(buildExpectedCommitFilesArgument(`${prefix}${commit_message_1.COMMIT_MESSAGE_PREFIX_SEPARATOR} add renovate.json`));
            });
            it('to the supplied commit message', async () => {
                const prefix = 'RENOV-123';
                const message = "Cause your deps need an update and if they dont update, well they're no deps of mine";
                config.commitMessagePrefix = prefix;
                config.onboardingCommitMessage = message;
                await create_1.createOnboardingBranch(config);
                expect(git_1.commitFiles).toHaveBeenCalledWith(buildExpectedCommitFilesArgument(`${prefix}${commit_message_1.COMMIT_MESSAGE_PREFIX_SEPARATOR} ${message}`));
            });
        });
        describe('applies semanticCommit prefix', () => {
            it('to the default commit message', async () => {
                const prefix = 'chore(deps)';
                config.semanticCommits = 'enabled';
                await create_1.createOnboardingBranch(config);
                expect(git_1.commitFiles).toHaveBeenCalledWith(buildExpectedCommitFilesArgument(`${prefix}${commit_message_1.COMMIT_MESSAGE_PREFIX_SEPARATOR} add renovate.json`));
            });
            it('to the supplied commit message', async () => {
                const prefix = 'chore(deps)';
                const message = 'I say, we can update when we want to, a commit they will never mind';
                config.semanticCommits = 'enabled';
                config.onboardingCommitMessage = message;
                await create_1.createOnboardingBranch(config);
                expect(git_1.commitFiles).toHaveBeenCalledWith(buildExpectedCommitFilesArgument(`${prefix}${commit_message_1.COMMIT_MESSAGE_PREFIX_SEPARATOR} ${message}`));
            });
        });
        describe('setting the onboarding configuration file name', () => {
            it('falls back to the default option if not present', async () => {
                const prefix = 'chore(deps)';
                config.semanticCommits = 'enabled';
                config.onboardingConfigFileName = undefined;
                await create_1.createOnboardingBranch(config);
                expect(git_1.commitFiles).toHaveBeenCalledWith(buildExpectedCommitFilesArgument(`${prefix}${commit_message_1.COMMIT_MESSAGE_PREFIX_SEPARATOR} add renovate.json`));
            });
            it('falls back to the default option if in list of allowed names', async () => {
                const prefix = 'chore(deps)';
                config.semanticCommits = 'enabled';
                config.onboardingConfigFileName = 'superConfigFile.yaml';
                await create_1.createOnboardingBranch(config);
                expect(git_1.commitFiles).toHaveBeenCalledWith(buildExpectedCommitFilesArgument(`${prefix}${commit_message_1.COMMIT_MESSAGE_PREFIX_SEPARATOR} add renovate.json`));
            });
            it('uses the given name if valid', async () => {
                const prefix = 'chore(deps)';
                config.semanticCommits = 'enabled';
                config.onboardingConfigFileName = '.gitlab/renovate.json';
                await create_1.createOnboardingBranch(config);
                expect(git_1.commitFiles).toHaveBeenCalledWith(buildExpectedCommitFilesArgument(`${prefix}${commit_message_1.COMMIT_MESSAGE_PREFIX_SEPARATOR} add ${config.onboardingConfigFileName}`, config.onboardingConfigFileName));
            });
            it('applies to the default commit message', async () => {
                const prefix = 'chore(deps)';
                config.semanticCommits = 'enabled';
                config.onboardingConfigFileName = `.renovaterc`;
                await create_1.createOnboardingBranch(config);
                expect(git_1.commitFiles).toHaveBeenCalledWith(buildExpectedCommitFilesArgument(`${prefix}${commit_message_1.COMMIT_MESSAGE_PREFIX_SEPARATOR} add ${config.onboardingConfigFileName}`, config.onboardingConfigFileName));
            });
        });
    });
});
//# sourceMappingURL=create.spec.js.map