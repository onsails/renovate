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
const platforms_1 = require("../constants/platforms");
const env = __importStar(require("./env"));
describe('config/env', () => {
    describe('.getConfig(env)', () => {
        it('returns empty env', () => {
            expect(env.getConfig({})).toEqual({ hostRules: [] });
        });
        it('supports boolean true', () => {
            const envParam = { RENOVATE_RECREATE_CLOSED: 'true' };
            expect(env.getConfig(envParam).recreateClosed).toBe(true);
        });
        it('supports boolean false', () => {
            const envParam = { RENOVATE_RECREATE_CLOSED: 'false' };
            expect(env.getConfig(envParam).recreateClosed).toBe(false);
        });
        it('supports boolean nonsense as false', () => {
            const envParam = { RENOVATE_RECREATE_CLOSED: 'foo' };
            expect(env.getConfig(envParam).recreateClosed).toBe(false);
        });
        delete process.env.RENOVATE_RECREATE_CLOSED;
        it('supports list single', () => {
            const envParam = { RENOVATE_LABELS: 'a' };
            expect(env.getConfig(envParam).labels).toEqual(['a']);
        });
        it('supports list multiple', () => {
            const envParam = { RENOVATE_LABELS: 'a,b,c' };
            expect(env.getConfig(envParam).labels).toEqual(['a', 'b', 'c']);
        });
        it('supports string', () => {
            const envParam = { RENOVATE_TOKEN: 'a' };
            expect(env.getConfig(envParam).token).toBe('a');
        });
        it('supports json', () => {
            const envParam = {
                RENOVATE_LOCK_FILE_MAINTENANCE: '{}',
            };
            expect(env.getConfig(envParam).lockFileMaintenance).toEqual({});
        });
        it('supports GitHub token', () => {
            const envParam = {
                RENOVATE_TOKEN: 'github.com token',
            };
            expect(env.getConfig(envParam)).toMatchSnapshot();
        });
        it('supports GitHub custom endpoint', () => {
            const envParam = {
                RENOVATE_ENDPOINT: 'a ghe endpoint',
            };
            expect(env.getConfig(envParam)).toMatchSnapshot();
        });
        it('supports GitHub custom endpoint and github.com', () => {
            const envParam = {
                GITHUB_COM_TOKEN: 'a github.com token',
                RENOVATE_ENDPOINT: 'a ghe endpoint',
                RENOVATE_TOKEN: 'a ghe token',
            };
            expect(env.getConfig(envParam)).toMatchSnapshot();
        });
        it('supports GitHub custom endpoint and gitlab.com', () => {
            const envParam = {
                RENOVATE_ENDPOINT: 'a ghe endpoint',
                RENOVATE_TOKEN: 'a ghe token',
            };
            expect(env.getConfig(envParam)).toMatchSnapshot();
        });
        it('supports GitLab token', () => {
            const envParam = {
                RENOVATE_PLATFORM: platforms_1.PLATFORM_TYPE_GITLAB,
                RENOVATE_TOKEN: 'a gitlab.com token',
            };
            expect(env.getConfig(envParam)).toMatchSnapshot();
        });
        it('supports GitLab custom endpoint', () => {
            const envParam = {
                RENOVATE_PLATFORM: platforms_1.PLATFORM_TYPE_GITLAB,
                RENOVATE_TOKEN: 'a gitlab token',
                RENOVATE_ENDPOINT: 'a gitlab endpoint',
            };
            expect(env.getConfig(envParam)).toMatchSnapshot();
        });
        it('supports Azure DevOps', () => {
            const envParam = {
                RENOVATE_PLATFORM: 'azure',
                RENOVATE_TOKEN: 'an Azure DevOps token',
                RENOVATE_ENDPOINT: 'an Azure DevOps endpoint',
            };
            expect(env.getConfig(envParam)).toMatchSnapshot();
        });
        it('supports docker username/password', () => {
            const envParam = {
                DOCKER_USERNAME: 'some-username',
                DOCKER_PASSWORD: 'some-password',
            };
            expect(env.getConfig(envParam)).toMatchSnapshot();
        });
        it('supports Bitbucket token', () => {
            const envParam = {
                RENOVATE_PLATFORM: platforms_1.PLATFORM_TYPE_BITBUCKET,
                RENOVATE_ENDPOINT: 'a bitbucket endpoint',
                RENOVATE_USERNAME: 'some-username',
                RENOVATE_PASSWORD: 'app-password',
            };
            expect(env.getConfig(envParam)).toMatchSnapshot();
        });
        it('supports Bitbucket username/password', () => {
            const envParam = {
                RENOVATE_PLATFORM: platforms_1.PLATFORM_TYPE_BITBUCKET,
                RENOVATE_ENDPOINT: 'a bitbucket endpoint',
                RENOVATE_USERNAME: 'some-username',
                RENOVATE_PASSWORD: 'app-password',
            };
            expect(env.getConfig(envParam)).toMatchSnapshot();
        });
    });
    describe('.getEnvName(definition)', () => {
        it('returns empty', () => {
            const option = {
                name: 'foo',
                env: false,
            };
            expect(env.getEnvName(option)).toEqual('');
        });
        it('returns existing env', () => {
            const option = {
                name: 'foo',
                env: 'FOO',
            };
            expect(env.getEnvName(option)).toEqual('FOO');
        });
        it('generates RENOVATE_ env', () => {
            const option = {
                name: 'oneTwoThree',
            };
            expect(env.getEnvName(option)).toEqual('RENOVATE_ONE_TWO_THREE');
        });
    });
});
//# sourceMappingURL=env.spec.js.map