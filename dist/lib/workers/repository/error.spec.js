"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const error_messages_1 = require("../../constants/error-messages");
const external_host_error_1 = require("../../types/errors/external-host-error");
const error_1 = __importDefault(require("./error"));
jest.mock('./error-config');
let config;
beforeEach(() => {
    jest.resetAllMocks();
    config = util_1.getConfig();
});
describe('workers/repository/error', () => {
    describe('handleError()', () => {
        const errors = [
            error_messages_1.REPOSITORY_UNINITIATED,
            error_messages_1.REPOSITORY_EMPTY,
            error_messages_1.REPOSITORY_DISABLED,
            error_messages_1.REPOSITORY_CHANGED,
            error_messages_1.REPOSITORY_FORKED,
            error_messages_1.MANAGER_NO_PACKAGE_FILES,
            error_messages_1.CONFIG_SECRETS_EXPOSED,
            error_messages_1.CONFIG_VALIDATION,
            error_messages_1.REPOSITORY_ARCHIVED,
            error_messages_1.REPOSITORY_MIRRORED,
            error_messages_1.REPOSITORY_RENAMED,
            error_messages_1.REPOSITORY_BLOCKED,
            error_messages_1.REPOSITORY_NOT_FOUND,
            error_messages_1.REPOSITORY_ACCESS_FORBIDDEN,
            error_messages_1.PLATFORM_BAD_CREDENTIALS,
            error_messages_1.PLATFORM_RATE_LIMIT_EXCEEDED,
            error_messages_1.MANAGER_LOCKFILE_ERROR,
            error_messages_1.SYSTEM_INSUFFICIENT_DISK_SPACE,
            error_messages_1.SYSTEM_INSUFFICIENT_MEMORY,
            error_messages_1.REPOSITORY_NO_VULNERABILITY,
            error_messages_1.REPOSITORY_CANNOT_FORK,
            error_messages_1.PLATFORM_INTEGRATION_UNAUTHORIZED,
            error_messages_1.PLATFORM_AUTHENTICATION_ERROR,
            error_messages_1.REPOSITORY_TEMPORARY_ERROR,
        ];
        errors.forEach((err) => {
            it(`errors ${err}`, async () => {
                const res = await error_1.default(config, new Error(err));
                expect(res).toEqual(err);
            });
        });
        it(`handles ExternalHostError`, async () => {
            const res = await error_1.default(config, new external_host_error_1.ExternalHostError(new Error(), 'some-host-type'));
            expect(res).toEqual(error_messages_1.EXTERNAL_HOST_ERROR);
        });
        it('rewrites git 5xx error', async () => {
            const gitError = new Error("fatal: unable to access 'https://**redacted**@gitlab.com/learnox/learnox.git/': The requested URL returned error: 500\n");
            const res = await error_1.default(config, gitError);
            expect(res).toEqual(error_messages_1.EXTERNAL_HOST_ERROR);
        });
        it('rewrites git remote error', async () => {
            const gitError = new Error('fatal: remote error: access denied or repository not exported: /b/nw/bd/27/47/159945428/108610112.git\n');
            const res = await error_1.default(config, gitError);
            expect(res).toEqual(error_messages_1.EXTERNAL_HOST_ERROR);
        });
        it('rewrites git fatal error', async () => {
            const gitError = new Error('fatal: not a git repository (or any parent up to mount point /mnt)\nStopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).\n');
            const res = await error_1.default(config, gitError);
            expect(res).toEqual(error_messages_1.REPOSITORY_TEMPORARY_ERROR);
        });
        it('handles unknown error', async () => {
            const res = await error_1.default(config, new Error('abcdefg'));
            expect(res).toEqual(error_messages_1.UNKNOWN_ERROR);
        });
    });
});
//# sourceMappingURL=error.spec.js.map