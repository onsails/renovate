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
const _bitbucketServer = __importStar(require("../bitbucket-server"));
const _gitea = __importStar(require("../gitea"));
const _github = __importStar(require("../github"));
const _gitlab = __importStar(require("../gitlab"));
const local = __importStar(require("."));
jest.mock('../gitlab');
jest.mock('../github');
jest.mock('../gitea');
jest.mock('../bitbucket-server');
const gitlab = util_1.mocked(_gitlab);
const github = util_1.mocked(_github);
const gitea = util_1.mocked(_gitea);
const bitbucketServer = util_1.mocked(_bitbucketServer);
describe(util_1.getName(__filename), () => {
    beforeEach(() => {
        jest.resetAllMocks();
        gitlab.getPresetFromEndpoint.mockResolvedValueOnce({ resolved: 'preset' });
        github.getPresetFromEndpoint.mockResolvedValueOnce({ resolved: 'preset' });
    });
    describe('getPreset()', () => {
        it('throws for unsupported platform', async () => {
            await expect(async () => {
                await local.getPreset({
                    packageName: 'some/repo',
                    presetName: 'default',
                    baseConfig: {
                        platform: 'unsupported-platform',
                    },
                });
            }).rejects.toThrow();
        });
        it('throws for missing platform', async () => {
            await expect(async () => {
                await local.getPreset({
                    packageName: 'some/repo',
                    presetName: 'default',
                    baseConfig: {
                        platform: undefined,
                    },
                });
            }).rejects.toThrow();
        });
        it('forwards to gitlab', async () => {
            const content = await local.getPreset({
                packageName: 'some/repo',
                presetName: 'default',
                baseConfig: {
                    platform: 'GitLab',
                },
            });
            expect(gitlab.getPresetFromEndpoint.mock.calls).toMatchSnapshot();
            expect(content).toMatchSnapshot();
        });
        it('forwards to custom gitlab', async () => {
            const content = await local.getPreset({
                packageName: 'some/repo',
                presetName: 'default',
                baseConfig: {
                    platform: 'gitlab',
                    endpoint: 'https://gitlab.example.com/api/v4',
                },
            });
            expect(gitlab.getPresetFromEndpoint.mock.calls).toMatchSnapshot();
            expect(content).toMatchSnapshot();
        });
        it('forwards to github', async () => {
            const content = await local.getPreset({
                packageName: 'some/repo',
                baseConfig: {
                    platform: 'github',
                },
            });
            expect(github.getPresetFromEndpoint.mock.calls).toMatchSnapshot();
            expect(content).toMatchSnapshot();
        });
        it('forwards to custom github', async () => {
            const content = await local.getPreset({
                packageName: 'some/repo',
                presetName: 'default',
                baseConfig: {
                    platform: 'github',
                    endpoint: 'https://api.github.example.com',
                },
            });
            expect(github.getPresetFromEndpoint.mock.calls).toMatchSnapshot();
            expect(content).toMatchSnapshot();
        });
        it('forwards to gitea', async () => {
            const content = await local.getPreset({
                packageName: 'some/repo',
                baseConfig: {
                    platform: 'gitea',
                },
            });
            expect(gitea.getPresetFromEndpoint.mock.calls).toMatchSnapshot();
            expect(content).toMatchSnapshot();
        });
        it('forwards to custom gitea', async () => {
            const content = await local.getPreset({
                packageName: 'some/repo',
                presetName: 'default',
                baseConfig: {
                    platform: 'gitea',
                    endpoint: 'https://api.gitea.example.com',
                },
            });
            expect(gitea.getPresetFromEndpoint.mock.calls).toMatchSnapshot();
            expect(content).toMatchSnapshot();
        });
        it('forwards to custom bitbucket-server', async () => {
            const content = await local.getPreset({
                packageName: 'some/repo',
                presetName: 'default',
                baseConfig: {
                    platform: 'bitbucket-server',
                    endpoint: 'https://git.example.com',
                },
            });
            expect(bitbucketServer.getPresetFromEndpoint.mock.calls).toMatchSnapshot();
            expect(content).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map