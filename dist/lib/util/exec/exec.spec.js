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
/* eslint-disable @typescript-eslint/naming-convention */
const child_process_1 = require("child_process");
const exec_util_1 = require("../../../test/exec-util");
const common_1 = require("./common");
const dockerModule = __importStar(require("./docker"));
const _1 = require(".");
const cpExec = child_process_1.exec;
jest.mock('child_process');
describe(`Child process execution wrapper`, () => {
    let processEnvOrig;
    let trustLevelOrig;
    const cacheDir = '/tmp/renovate/cache/';
    const cwd = '/tmp/renovate/github/some/repo/';
    const defaultCwd = `-w "${cwd}"`;
    const defaultVolumes = `-v "${cwd}":"${cwd}" -v "${cacheDir}":"${cacheDir}"`;
    const execConfig = {
        cacheDir,
        localDir: cwd,
    };
    beforeEach(() => {
        dockerModule.resetPrefetchedImages();
        jest.resetAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
        processEnvOrig = process.env;
        trustLevelOrig = global.trustLevel;
    });
    afterEach(() => {
        process.env = processEnvOrig;
        global.trustLevel = trustLevelOrig;
    });
    const image = 'renovate/image';
    const name = image.replace(/\//g, '_');
    const tag = '1.2.3';
    const inCmd = 'echo hello';
    const outCmd = ['echo hello'];
    const volume_1 = '/path/to/volume-1';
    const volume_2_from = '/path/to/volume-2';
    const volume_2_to = '/path/to/volume-3';
    const volumes = [
        volume_1,
        null,
        undefined,
        [volume_2_from, volume_2_to],
    ];
    const encoding = 'utf-8';
    const docker = { image };
    const processEnv = exec_util_1.envMock.full;
    const dockerPullCmd = `docker pull ${image}`;
    const dockerRemoveCmd = `docker ps --filter name=${name} -aq`;
    const dockerPullOpts = { encoding };
    const dockerRemoveOpts = dockerPullOpts;
    const testInputs = [
        [
            'Single command',
            {
                execConfig,
                processEnv,
                inCmd,
                inOpts: {},
                outCmd,
                outOpts: [
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.basic,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Multiple commands',
            {
                execConfig,
                processEnv,
                inCmd: ['echo "begin"', inCmd, "echo 'end'"],
                inOpts: {},
                outCmd: ['echo "begin"', ...outCmd, "echo 'end'"],
                outOpts: [
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.basic,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.basic,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.basic,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Explicit env option',
            {
                execConfig,
                processEnv,
                inCmd,
                inOpts: { env: { FOO: 'BAR' } },
                outCmd,
                outOpts: [
                    {
                        cwd,
                        encoding,
                        env: { ...exec_util_1.envMock.basic, FOO: 'BAR' },
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Low trust level',
            {
                execConfig,
                processEnv,
                inCmd,
                inOpts: {},
                outCmd,
                outOpts: [
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.basic,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'High trust level',
            {
                execConfig,
                processEnv: exec_util_1.envMock.full,
                inCmd,
                inOpts: {},
                outCmd,
                outOpts: [
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.full,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
                trustLevel: 'high',
            },
        ],
        [
            'Docker',
            {
                execConfig: { ...execConfig, binarySource: common_1.BinarySource.Docker },
                processEnv,
                inCmd,
                inOpts: { docker, cwd },
                outCmd: [
                    dockerPullCmd,
                    dockerRemoveCmd,
                    `docker run --rm --name=${name} --label=renovate_child ${defaultVolumes} ${defaultCwd} ${image} bash -l -c "${inCmd}"`,
                ],
                outOpts: [
                    dockerPullOpts,
                    dockerRemoveOpts,
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.basic,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Extra env vars',
            {
                execConfig,
                processEnv,
                inCmd,
                inOpts: {
                    extraEnv: {
                        SELECTED_ENV_VAR: exec_util_1.envMock.full.SELECTED_ENV_VAR,
                        FILTERED_ENV_VAR: null,
                        FOO: null,
                        BAR: undefined,
                    },
                },
                outCmd,
                outOpts: [
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.filtered,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Extra env vars (Docker)',
            {
                execConfig: { ...execConfig, binarySource: common_1.BinarySource.Docker },
                processEnv,
                inCmd,
                inOpts: {
                    docker,
                    extraEnv: {
                        SELECTED_ENV_VAR: exec_util_1.envMock.full.SELECTED_ENV_VAR,
                        FILTERED_ENV_VAR: null,
                        FOO: null,
                        BAR: undefined,
                    },
                    cwd,
                },
                outCmd: [
                    dockerPullCmd,
                    dockerRemoveCmd,
                    `docker run --rm --name=${name} --label=renovate_child ${defaultVolumes} -e SELECTED_ENV_VAR ${defaultCwd} ${image} bash -l -c "${inCmd}"`,
                ],
                outOpts: [
                    dockerPullOpts,
                    dockerRemoveOpts,
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.filtered,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Extra env vars defaults',
            {
                execConfig,
                processEnv: exec_util_1.envMock.basic,
                inCmd,
                inOpts: { cwd, extraEnv: { SELECTED_ENV_VAR: 'Default value' } },
                outCmd,
                outOpts: [
                    {
                        cwd,
                        encoding,
                        env: { ...exec_util_1.envMock.basic, SELECTED_ENV_VAR: 'Default value' },
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Extra env vars defaults (Docker)',
            {
                execConfig: { ...execConfig, binarySource: common_1.BinarySource.Docker },
                processEnv: exec_util_1.envMock.basic,
                inCmd,
                inOpts: {
                    docker,
                    extraEnv: { SELECTED_ENV_VAR: 'Default value' },
                    cwd,
                },
                outCmd: [
                    dockerPullCmd,
                    dockerRemoveCmd,
                    `docker run --rm --name=${name} --label=renovate_child ${defaultVolumes} -e SELECTED_ENV_VAR ${defaultCwd} ${image} bash -l -c "${inCmd}"`,
                ],
                outOpts: [
                    dockerPullOpts,
                    dockerRemoveOpts,
                    {
                        cwd,
                        encoding,
                        env: { ...exec_util_1.envMock.basic, SELECTED_ENV_VAR: 'Default value' },
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Docker tags',
            {
                execConfig: { ...execConfig, binarySource: common_1.BinarySource.Docker },
                processEnv,
                inCmd,
                inOpts: { docker: { image, tag }, cwd },
                outCmd: [
                    `${dockerPullCmd}:${tag}`,
                    dockerRemoveCmd,
                    `docker run --rm --name=${name} --label=renovate_child ${defaultVolumes} ${defaultCwd} ${image}:${tag} bash -l -c "${inCmd}"`,
                ],
                outOpts: [
                    dockerPullOpts,
                    dockerRemoveOpts,
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.basic,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Docker volumes',
            {
                execConfig: { ...execConfig, binarySource: common_1.BinarySource.Docker },
                processEnv,
                inCmd,
                inOpts: { cwd, docker: { image, volumes } },
                outCmd: [
                    dockerPullCmd,
                    dockerRemoveCmd,
                    `docker run --rm --name=${name} --label=renovate_child ${defaultVolumes} -v "${volume_1}":"${volume_1}" -v "${volume_2_from}":"${volume_2_to}" -w "${cwd}" ${image} bash -l -c "${inCmd}"`,
                ],
                outOpts: [
                    dockerPullOpts,
                    dockerRemoveOpts,
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.basic,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Docker user',
            {
                execConfig: {
                    ...execConfig,
                    binarySource: common_1.BinarySource.Docker,
                    dockerUser: 'foobar',
                },
                processEnv,
                inCmd,
                inOpts: { docker },
                outCmd: [
                    dockerPullCmd,
                    dockerRemoveCmd,
                    `docker run --rm --name=${name} --label=renovate_child --user=foobar ${defaultVolumes} -w "${cwd}" ${image} bash -l -c "${inCmd}"`,
                ],
                outOpts: [
                    dockerPullOpts,
                    dockerRemoveOpts,
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.basic,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Docker image prefix',
            {
                execConfig: {
                    ...execConfig,
                    binarySource: common_1.BinarySource.Docker,
                    dockerImagePrefix: 'ghcr.io/renovatebot',
                },
                processEnv,
                inCmd,
                inOpts: { docker },
                outCmd: [
                    `docker pull ghcr.io/renovatebot/image`,
                    dockerRemoveCmd,
                    `docker run --rm --name=${name} --label=renovate_child ${defaultVolumes} -w "${cwd}" ghcr.io/renovatebot/image bash -l -c "${inCmd}"`,
                ],
                outOpts: [
                    dockerPullOpts,
                    dockerRemoveOpts,
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.basic,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Docker extra commands',
            {
                execConfig: {
                    ...execConfig,
                    binarySource: common_1.BinarySource.Docker,
                },
                processEnv,
                inCmd,
                inOpts: {
                    docker: {
                        image,
                        preCommands: ['preCommand1', 'preCommand2', null],
                        postCommands: ['postCommand1', undefined, 'postCommand2'],
                    },
                },
                outCmd: [
                    dockerPullCmd,
                    dockerRemoveCmd,
                    `docker run --rm --name=${name} --label=renovate_child ${defaultVolumes} -w "${cwd}" ${image} bash -l -c "preCommand1 && preCommand2 && ${inCmd} && postCommand1 && postCommand2"`,
                ],
                outOpts: [
                    dockerPullOpts,
                    dockerRemoveOpts,
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.basic,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Docker commands are nullable',
            {
                execConfig: {
                    ...execConfig,
                    binarySource: common_1.BinarySource.Docker,
                },
                processEnv,
                inCmd,
                inOpts: {
                    docker: {
                        image,
                        preCommands: null,
                        postCommands: undefined,
                    },
                },
                outCmd: [
                    dockerPullCmd,
                    dockerRemoveCmd,
                    `docker run --rm --name=${name} --label=renovate_child ${defaultVolumes} -w "${cwd}" ${image} bash -l -c "${inCmd}"`,
                ],
                outOpts: [
                    dockerPullOpts,
                    dockerRemoveOpts,
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.basic,
                        timeout: 900000,
                        maxBuffer: 10485760,
                    },
                ],
            },
        ],
        [
            'Explicit maxBuffer',
            {
                execConfig,
                processEnv,
                inCmd,
                inOpts: {
                    maxBuffer: 1024,
                },
                outCmd,
                outOpts: [
                    {
                        cwd,
                        encoding,
                        env: exec_util_1.envMock.basic,
                        timeout: 900000,
                        maxBuffer: 1024,
                    },
                ],
            },
        ],
    ];
    test.each(testInputs)('%s', async (_msg, testOpts) => {
        const { execConfig: config, processEnv: procEnv, inCmd: cmd, inOpts, outCmd: outCommand, outOpts, trustLevel, } = testOpts;
        process.env = procEnv;
        if (trustLevel) {
            global.trustLevel = trustLevel;
        }
        if (config) {
            jest
                .spyOn(dockerModule, 'removeDanglingContainers')
                .mockResolvedValueOnce();
            await _1.setExecConfig(config);
        }
        const actualCmd = [];
        const actualOpts = [];
        cpExec.mockImplementation((execCmd, execOpts, callback) => {
            actualCmd.push(execCmd);
            actualOpts.push(execOpts);
            callback(null, { stdout: '', stderr: '' });
            return undefined;
        });
        await _1.exec(cmd, inOpts);
        expect(actualCmd).toEqual(outCommand);
        expect(actualOpts).toEqual(outOpts);
    });
    it('Supports image prefetch', async () => {
        process.env = processEnv;
        const actualCmd = [];
        cpExec.mockImplementation((execCmd, execOpts, callback) => {
            actualCmd.push(execCmd);
            callback(null, { stdout: '', stderr: '' });
            return undefined;
        });
        await _1.setExecConfig({ binarySource: common_1.BinarySource.Global });
        await _1.exec(inCmd, { docker });
        await _1.exec(inCmd, { docker });
        await _1.setExecConfig({ binarySource: common_1.BinarySource.Docker });
        await _1.exec(inCmd, { docker });
        await _1.exec(inCmd, { docker });
        await _1.setExecConfig({ binarySource: common_1.BinarySource.Global });
        await _1.exec(inCmd, { docker });
        await _1.exec(inCmd, { docker });
        await _1.setExecConfig({ binarySource: common_1.BinarySource.Docker });
        await _1.exec(inCmd, { docker });
        await _1.exec(inCmd, { docker });
        expect(actualCmd).toMatchSnapshot();
    });
    it('only calls removeDockerContainer in catch block is useDocker is set', async () => {
        cpExec.mockImplementation(() => {
            throw new Error('some error occurred');
        });
        const removeDockerContainerSpy = jest.spyOn(dockerModule, 'removeDockerContainer');
        const promise = _1.exec('foobar', {});
        await expect(promise).rejects.toThrow('some error occurred');
        expect(removeDockerContainerSpy).toHaveBeenCalledTimes(0);
    });
    it('wraps error if removeDockerContainer throws an error', async () => {
        cpExec.mockImplementationOnce((_execCmd, _execOpts, callback) => callback(null, { stdout: '', stderr: '' }));
        await _1.setExecConfig({ binarySource: common_1.BinarySource.Docker });
        cpExec.mockImplementation(() => {
            throw new Error('some error occurred');
        });
        jest
            .spyOn(dockerModule, 'generateDockerCommand')
            .mockImplementation(() => 'asdf');
        // The `removeDockerContainer` function is called once before it's used in the `catch` block.
        // We want it to fail in the catch block so we can assert the error is wrapped.
        let calledOnce = false;
        const removeDockerContainerSpy = jest.spyOn(dockerModule, 'removeDockerContainer');
        removeDockerContainerSpy.mockImplementation(() => {
            if (!calledOnce) {
                calledOnce = true;
                return Promise.resolve();
            }
            return Promise.reject(new Error('removeDockerContainer failed'));
        });
        const promise = _1.exec('foobar', { docker });
        await expect(promise).rejects.toThrow(new Error('Error: "removeDockerContainer failed" - Original Error: "some error occurred"'));
        expect(removeDockerContainerSpy).toHaveBeenCalledTimes(2);
    });
});
//# sourceMappingURL=exec.spec.js.map