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
const child_process_1 = require("child_process");
const upath_1 = require("upath");
const exec_util_1 = require("../../../test/exec-util");
const util_1 = require("../../../test/util");
const _datasource = __importStar(require("../../datasource"));
const util_2 = require("../../util");
const common_1 = require("../../util/exec/common");
const docker = __importStar(require("../../util/exec/docker"));
const _env = __importStar(require("../../util/exec/env"));
const _bundlerHostRules = __importStar(require("./host-rules"));
const _1 = require(".");
const exec = child_process_1.exec;
const env = util_1.mocked(_env);
const datasource = util_1.mocked(_datasource);
const bundlerHostRules = util_1.mocked(_bundlerHostRules);
jest.mock('fs-extra');
jest.mock('child_process');
jest.mock('../../../lib/util/exec/env');
jest.mock('../../../lib/datasource');
jest.mock('../../../lib/util/fs');
jest.mock('../../../lib/util/git');
jest.mock('../../../lib/util/host-rules');
jest.mock('./host-rules');
let config;
describe('bundler.updateArtifacts()', () => {
    beforeEach(async () => {
        jest.resetAllMocks();
        jest.resetModules();
        delete process.env.GEM_HOME;
        config = {
            // `join` fixes Windows CI
            localDir: upath_1.join('/tmp/github/some/repo'),
            cacheDir: upath_1.join('/tmp/cache'),
            dockerUser: 'foobar',
        };
        env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
        bundlerHostRules.findAllAuthenticatable.mockReturnValue([]);
        docker.resetPrefetchedImages();
        await util_2.setUtilConfig(config);
    });
    it('returns null by default', async () => {
        expect(await _1.updateArtifacts({
            packageFileName: '',
            updatedDeps: ['foo', 'bar'],
            newPackageFileContent: '',
            config,
        })).toBeNull();
    });
    it('returns null if Gemfile.lock was not changed', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current Gemfile.lock');
        util_1.fs.writeLocalFile.mockResolvedValueOnce(null);
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: [],
        });
        util_1.fs.readLocalFile.mockResolvedValueOnce('Updated Gemfile.lock');
        expect(await _1.updateArtifacts({
            packageFileName: 'Gemfile',
            updatedDeps: ['foo', 'bar'],
            newPackageFileContent: 'Updated Gemfile content',
            config,
        })).toMatchSnapshot();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('works for default binarySource', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current Gemfile.lock');
        util_1.fs.writeLocalFile.mockResolvedValueOnce(null);
        util_1.fs.readLocalFile.mockResolvedValueOnce(null);
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: ['Gemfile.lock'],
        });
        util_1.fs.readLocalFile.mockResolvedValueOnce('Updated Gemfile.lock');
        expect(await _1.updateArtifacts({
            packageFileName: 'Gemfile',
            updatedDeps: ['foo', 'bar'],
            newPackageFileContent: 'Updated Gemfile content',
            config,
        })).toMatchSnapshot();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('works explicit global binarySource', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current Gemfile.lock');
        util_1.fs.writeLocalFile.mockResolvedValueOnce(null);
        util_1.fs.readLocalFile.mockResolvedValueOnce(null);
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: ['Gemfile.lock'],
        });
        util_1.fs.readLocalFile.mockResolvedValueOnce('Updated Gemfile.lock');
        expect(await _1.updateArtifacts({
            packageFileName: 'Gemfile',
            updatedDeps: ['foo', 'bar'],
            newPackageFileContent: 'Updated Gemfile content',
            config: {
                ...config,
                binarySource: common_1.BinarySource.Global,
            },
        })).toMatchSnapshot();
        expect(execSnapshots).toMatchSnapshot();
    });
    describe('Docker', () => {
        beforeEach(async () => {
            jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
            await util_2.setUtilConfig({ ...config, binarySource: common_1.BinarySource.Docker });
        });
        it('.ruby-version', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce('Current Gemfile.lock');
            util_1.fs.writeLocalFile.mockResolvedValueOnce(null);
            util_1.fs.readLocalFile.mockResolvedValueOnce('1.2.0');
            datasource.getPkgReleases.mockResolvedValueOnce({
                releases: [
                    { version: '1.0.0' },
                    { version: '1.2.0' },
                    { version: '1.3.0' },
                ],
            });
            const execSnapshots = exec_util_1.mockExecAll(exec);
            util_1.git.getRepoStatus.mockResolvedValueOnce({
                modified: ['Gemfile.lock'],
            });
            util_1.fs.readLocalFile.mockResolvedValueOnce('Updated Gemfile.lock');
            expect(await _1.updateArtifacts({
                packageFileName: 'Gemfile',
                updatedDeps: ['foo', 'bar'],
                newPackageFileContent: 'Updated Gemfile content',
                config: {
                    ...config,
                    binarySource: common_1.BinarySource.Docker,
                },
            })).toMatchSnapshot();
            expect(execSnapshots).toMatchSnapshot();
        });
        it('constraints options', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce('Current Gemfile.lock');
            util_1.fs.writeLocalFile.mockResolvedValueOnce(null);
            datasource.getPkgReleases.mockResolvedValueOnce({
                releases: [
                    { version: '1.0.0' },
                    { version: '1.2.0' },
                    { version: '1.3.0' },
                ],
            });
            const execSnapshots = exec_util_1.mockExecAll(exec);
            util_1.git.getRepoStatus.mockResolvedValueOnce({
                modified: ['Gemfile.lock'],
            });
            util_1.fs.readLocalFile.mockResolvedValueOnce('Updated Gemfile.lock');
            expect(await _1.updateArtifacts({
                packageFileName: 'Gemfile',
                updatedDeps: ['foo', 'bar'],
                newPackageFileContent: 'Updated Gemfile content',
                config: {
                    ...config,
                    binarySource: common_1.BinarySource.Docker,
                    dockerUser: 'foobar',
                    constraints: {
                        ruby: '1.2.5',
                        bundler: '3.2.1',
                    },
                },
            })).toMatchSnapshot();
            expect(execSnapshots).toMatchSnapshot();
        });
        it('invalid constraints options', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce('Current Gemfile.lock');
            util_1.fs.writeLocalFile.mockResolvedValueOnce(null);
            datasource.getPkgReleases.mockResolvedValueOnce({
                releases: [
                    { version: '1.0.0' },
                    { version: '1.2.0' },
                    { version: '1.3.0' },
                ],
            });
            const execSnapshots = exec_util_1.mockExecAll(exec);
            util_1.git.getRepoStatus.mockResolvedValueOnce({
                modified: ['Gemfile.lock'],
            });
            util_1.fs.readLocalFile.mockResolvedValueOnce('Updated Gemfile.lock');
            expect(await _1.updateArtifacts({
                packageFileName: 'Gemfile',
                updatedDeps: ['foo', 'bar'],
                newPackageFileContent: 'Updated Gemfile content',
                config: {
                    ...config,
                    binarySource: common_1.BinarySource.Docker,
                    dockerUser: 'foobar',
                    constraints: {
                        ruby: 'foo',
                        bundler: 'bar',
                    },
                },
            })).toMatchSnapshot();
            expect(execSnapshots).toMatchSnapshot();
        });
        it('injects bundler host configuration environment variables', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce('Current Gemfile.lock');
            util_1.fs.writeLocalFile.mockResolvedValueOnce(null);
            util_1.fs.readLocalFile.mockResolvedValueOnce('1.2.0');
            datasource.getPkgReleases.mockResolvedValueOnce({
                releases: [
                    { version: '1.0.0' },
                    { version: '1.2.0' },
                    { version: '1.3.0' },
                ],
            });
            bundlerHostRules.findAllAuthenticatable.mockReturnValue([
                {
                    hostType: 'bundler',
                    hostName: 'gems.private.com',
                    username: 'some-user',
                    password: 'some-password',
                },
            ]);
            bundlerHostRules.getDomain.mockReturnValue('gems.private.com');
            bundlerHostRules.getAuthenticationHeaderValue.mockReturnValue('some-user:some-password');
            const execSnapshots = exec_util_1.mockExecAll(exec);
            util_1.git.getRepoStatus.mockResolvedValueOnce({
                modified: ['Gemfile.lock'],
            });
            util_1.fs.readLocalFile.mockResolvedValueOnce('Updated Gemfile.lock');
            expect(await _1.updateArtifacts({
                packageFileName: 'Gemfile',
                updatedDeps: ['foo', 'bar'],
                newPackageFileContent: 'Updated Gemfile content',
                config: {
                    ...config,
                    binarySource: common_1.BinarySource.Docker,
                },
            })).toMatchSnapshot();
            expect(execSnapshots).toMatchSnapshot();
        });
    });
    it('returns error when failing in lockFileMaintenance true', async () => {
        const execError = new Error();
        execError.stdout = ' foo was resolved to';
        execError.stderr = '';
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current Gemfile.lock');
        util_1.fs.writeLocalFile.mockResolvedValueOnce(null);
        const execSnapshots = exec_util_1.mockExecAll(exec, execError);
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: ['Gemfile.lock'],
        });
        expect(await _1.updateArtifacts({
            packageFileName: 'Gemfile',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config: {
                ...config,
                isLockFileMaintenance: true,
            },
        })).toMatchSnapshot();
        expect(execSnapshots).toMatchSnapshot();
    });
    it('performs lockFileMaintenance', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce('Current Gemfile.lock');
        util_1.fs.writeLocalFile.mockResolvedValueOnce(null);
        const execSnapshots = exec_util_1.mockExecAll(exec);
        util_1.git.getRepoStatus.mockResolvedValueOnce({
            modified: ['Gemfile.lock'],
        });
        util_1.fs.readLocalFile.mockResolvedValueOnce('Updated Gemfile.lock');
        expect(await _1.updateArtifacts({
            packageFileName: 'Gemfile',
            updatedDeps: [],
            newPackageFileContent: '{}',
            config: {
                ...config,
                isLockFileMaintenance: true,
            },
        })).not.toBeNull();
        expect(execSnapshots).toMatchSnapshot();
    });
});
//# sourceMappingURL=artifacts.spec.js.map