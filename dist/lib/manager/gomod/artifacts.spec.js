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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const upath_1 = require("upath");
const exec_util_1 = require("../../../test/exec-util");
const util_1 = require("../../../test/util");
const util_2 = require("../../util");
const common_1 = require("../../util/exec/common");
const docker = __importStar(require("../../util/exec/docker"));
const _env = __importStar(require("../../util/exec/env"));
const _hostRules = __importStar(require("../../util/host-rules"));
const gomod = __importStar(require("./artifacts"));
jest.mock('fs-extra');
jest.mock('child_process');
jest.mock('../../util/exec/env');
jest.mock('../../util/git');
jest.mock('../../util/host-rules');
jest.mock('../../util/http');
const fs = fs_extra_1.default;
const exec = child_process_1.exec;
const env = util_1.mocked(_env);
const hostRules = util_1.mocked(_hostRules);
const gomod1 = `module github.com/renovate-tests/gomod1

require github.com/pkg/errors v0.7.0
require github.com/aws/aws-sdk-go v1.15.21
require github.com/davecgh/go-spew v1.0.0
require golang.org/x/foo v1.0.0
require github.com/rarkins/foo abcdef1
require gopkg.in/russross/blackfriday.v1 v1.0.0

replace github.com/pkg/errors => ../errors
`;
const config = {
    // `join` fixes Windows CI
    localDir: upath_1.join('/tmp/github/some/repo'),
    cacheDir: upath_1.join('/tmp/renovate/cache'),
    dockerUser: 'foobar',
    constraints: { go: '1.14' },
};
const goEnv = {
    GONOSUMDB: '1',
    GOPROXY: 'proxy.example.com',
    CGO_ENABLED: '1',
};
describe('.updateArtifacts()', () => {
    beforeEach(async () => {
        jest.resetAllMocks();
        jest.resetModules();
        delete process.env.GOPATH;
        env.getChildProcessEnv.mockReturnValue({ ...exec_util_1.envMock.basic, ...goEnv });
        await util_2.setUtilConfig(config);
        docker.resetPrefetchedImages();
    });
    it('returns if no go.sum found', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        expect(await gomod.updateArtifacts({
            packageFileName: 'go.mod',
            updatedDeps: [],
            newPackageFileContent: gomod1,
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns null if unchanged', async () => {
        fs.readFile.mockResolvedValueOnce('Current go.sum');
        fs.readFile.mockResolvedValueOnce(null); // vendor modules filename
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: [],
        });
        expect(await gomod.updateArtifacts({
            packageFileName: 'go.mod',
            updatedDeps: [],
            newPackageFileContent: gomod1,
            config,
        })).toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('returns updated go.sum', async () => {
        fs.readFile.mockResolvedValueOnce('Current go.sum');
        fs.readFile.mockResolvedValueOnce(null); // vendor modules filename
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: ['go.sum'],
        });
        fs.readFile.mockResolvedValueOnce('New go.sum');
        expect(await gomod.updateArtifacts({
            packageFileName: 'go.mod',
            updatedDeps: [],
            newPackageFileContent: gomod1,
            config,
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('supports vendor directory update', async () => {
        const foo = upath_1.join('vendor/github.com/foo/foo/go.mod');
        const bar = upath_1.join('vendor/github.com/bar/bar/go.mod');
        const baz = upath_1.join('vendor/github.com/baz/baz/go.mod');
        fs.readFile.mockResolvedValueOnce('Current go.sum');
        fs.readFile.mockResolvedValueOnce('modules.txt content'); // vendor modules filename
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: ['go.sum', foo],
            not_added: [bar],
            deleted: [baz],
        });
        fs.readFile.mockResolvedValueOnce('New go.sum');
        fs.readFile.mockResolvedValueOnce('Foo go.sum');
        fs.readFile.mockResolvedValueOnce('Bar go.sum');
        fs.readFile.mockResolvedValueOnce('New go.mod');
        const res = await gomod.updateArtifacts({
            packageFileName: 'go.mod',
            updatedDeps: [],
            newPackageFileContent: gomod1,
            config: {
                ...config,
                postUpdateOptions: ['gomodTidy'],
            },
        });
        expect(res).not.toBeNull();
        expect(res === null || res === void 0 ? void 0 : res.map(({ file }) => file)).toEqual([
            { contents: 'New go.sum', name: 'go.sum' },
            { contents: 'Foo go.sum', name: foo },
            { contents: 'Bar go.sum', name: bar },
            { contents: baz, name: '|delete|' },
            { contents: 'New go.mod', name: 'go.mod' },
        ]);
        expect(execSnapshots).toMatchSnapshot();
    });
    it('supports docker mode without credentials', async () => {
        jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
        await util_2.setUtilConfig({ ...config, binarySource: common_1.BinarySource.Docker });
        fs.readFile.mockResolvedValueOnce('Current go.sum');
        fs.readFile.mockResolvedValueOnce(null); // vendor modules filename
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: ['go.sum'],
        });
        fs.readFile.mockResolvedValueOnce('New go.sum');
        expect(await gomod.updateArtifacts({
            packageFileName: 'go.mod',
            updatedDeps: [],
            newPackageFileContent: gomod1,
            config: {
                ...config,
                binarySource: common_1.BinarySource.Docker,
            },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('supports global mode', async () => {
        fs.readFile.mockResolvedValueOnce('Current go.sum');
        fs.readFile.mockResolvedValueOnce(null); // vendor modules filename
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: ['go.sum'],
        });
        fs.readFile.mockResolvedValueOnce('New go.sum');
        expect(await gomod.updateArtifacts({
            packageFileName: 'go.mod',
            updatedDeps: [],
            newPackageFileContent: gomod1,
            config: {
                ...config,
                binarySource: common_1.BinarySource.Global,
            },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('supports docker mode with credentials', async () => {
        jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
        await util_2.setUtilConfig({ ...config, binarySource: common_1.BinarySource.Docker });
        hostRules.find.mockReturnValueOnce({
            token: 'some-token',
        });
        fs.readFile.mockResolvedValueOnce('Current go.sum');
        fs.readFile.mockResolvedValueOnce(null); // vendor modules filename
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: ['go.sum'],
        });
        fs.readFile.mockResolvedValueOnce('New go.sum');
        expect(await gomod.updateArtifacts({
            packageFileName: 'go.mod',
            updatedDeps: [],
            newPackageFileContent: gomod1,
            config: {
                ...config,
                binarySource: common_1.BinarySource.Docker,
            },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('supports docker mode with goModTidy', async () => {
        jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
        await util_2.setUtilConfig({ ...config, binarySource: common_1.BinarySource.Docker });
        hostRules.find.mockReturnValueOnce({});
        fs.readFile.mockResolvedValueOnce('Current go.sum');
        fs.readFile.mockResolvedValueOnce(null); // vendor modules filename
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: ['go.sum'],
        });
        fs.readFile.mockResolvedValueOnce('New go.sum 1');
        fs.readFile.mockResolvedValueOnce('New go.sum 2');
        fs.readFile.mockResolvedValueOnce('New go.sum 3');
        fs.readFile.mockResolvedValueOnce('New go.mod');
        expect(await gomod.updateArtifacts({
            packageFileName: 'go.mod',
            updatedDeps: [],
            newPackageFileContent: gomod1,
            config: {
                ...config,
                binarySource: common_1.BinarySource.Docker,
                postUpdateOptions: ['gomodTidy'],
            },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('catches errors', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec);
        fs.readFile.mockResolvedValueOnce('Current go.sum');
        fs.readFile.mockResolvedValueOnce(null); // vendor modules filename
        fs.outputFile.mockImplementationOnce(() => {
            throw new Error('This update totally doesnt work');
        });
        expect(await gomod.updateArtifacts({
            packageFileName: 'go.mod',
            updatedDeps: [],
            newPackageFileContent: gomod1,
            config,
        })).toMatchSnapshot();
        expect(execSnapshots).toMatchSnapshot();
    });
});
//# sourceMappingURL=artifacts.spec.js.map