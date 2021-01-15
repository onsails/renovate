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
const os_1 = __importDefault(require("os"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_promise_1 = __importDefault(require("tmp-promise"));
const upath = __importStar(require("upath"));
const exec_util_1 = require("../../../test/exec-util");
const util_1 = require("../../../test/util");
const common_1 = require("../../util/exec/common");
const gradle_updates_report_1 = require("./gradle-updates-report");
const fixtures = 'lib/manager/gradle/__fixtures__';
const standardUpdatesReport = () => fs_extra_1.default.readFile(`${fixtures}/updatesReport.json`, 'utf8');
const emptyUpdatesReport = () => fs_extra_1.default.readFile(`${fixtures}/updatesReportEmpty.json`, 'utf8');
const multiProjectUpdatesReport = () => fs_extra_1.default.readFile(`${fixtures}/MultiProjectUpdatesReport.json`, 'utf8');
const baseConfig = {
    gradle: {
        timeout: 60,
    },
};
const gradleOutput = {
    stdout: 'gradle output',
    stderr: '',
};
util_1.addReplacingSerializer('gradlew.bat', '<gradlew>');
util_1.addReplacingSerializer('./gradlew', '<gradlew>');
function resetMocks() {
    jest.resetAllMocks();
    jest.resetModules();
}
async function setupMocks() {
    resetMocks();
    jest.mock('child_process');
    jest.mock('../../util/exec/env');
    jest.mock('../../util/fs');
    const fs = require('../../util/fs');
    const env = require('../../util/exec/env');
    const exec = require('child_process').exec;
    const util = require('../../util');
    fs.readLocalFile.mockResolvedValue(`
    dependency 'foo:foo:1.2.3'
    dependency "bar:bar:This.Is.Valid.Version.Good.Luck"
    dependency "baz:baz:\${bazVersion}"
  `);
    env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
    await util.setUtilConfig(baseConfig);
    return [require('.'), exec, util];
}
describe(util_1.getName(__filename), () => {
    describe('extractPackageFile', () => {
        let manager;
        let exec;
        let util;
        let docker;
        let config;
        beforeAll(async () => {
            [manager, exec, util] = await setupMocks();
            docker = require('../../util/exec/docker');
        });
        afterAll(resetMocks);
        beforeEach(async () => {
            exec.mockReset();
            docker.resetPrefetchedImages();
            const gradleDir = await tmp_promise_1.default.dir({ unsafeCleanup: true });
            config = { ...baseConfig, localDir: gradleDir.path };
            expect.addSnapshotSerializer(util_1.replacingSerializer(upath.toUnix(gradleDir.path), 'localDir'));
        });
        async function initializeWorkingDir(addGradleWrapper, updatesReport, dir = config.localDir) {
            if (addGradleWrapper) {
                await fs_extra_1.default.copy(`${fixtures}/gradle-wrappers/6`, dir);
            }
            if (updatesReport) {
                await fs_extra_1.default.writeFile(`${dir}/${gradle_updates_report_1.GRADLE_DEPENDENCY_REPORT_FILENAME}`, await updatesReport);
            }
        }
        it('should return gradle dependencies', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await initializeWorkingDir(true, standardUpdatesReport());
            const dependencies = await manager.extractAllPackageFiles(config, [
                'build.gradle',
                'subproject/build.gradle',
            ]);
            expect(dependencies).toMatchSnapshot();
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should return gradle.kts dependencies', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await initializeWorkingDir(true, standardUpdatesReport());
            const dependencies = await manager.extractAllPackageFiles(config, [
                'build.gradle.kts',
                'subproject/build.gradle.kts',
            ]);
            expect(dependencies).toMatchSnapshot();
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should return empty if there are no dependencies', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await initializeWorkingDir(true, emptyUpdatesReport());
            const dependencies = await manager.extractAllPackageFiles(config, [
                'build.gradle',
            ]);
            expect(dependencies).toEqual([]);
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should return empty if there is no dependency report', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await initializeWorkingDir(true, null);
            const dependencies = await manager.extractAllPackageFiles(config, [
                'build.gradle',
            ]);
            expect(dependencies).toEqual([]);
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should return empty if renovate report is invalid', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await initializeWorkingDir(true, `
        Invalid JSON]
      `);
            const dependencies = await manager.extractAllPackageFiles(config, [
                'build.gradle',
            ]);
            expect(dependencies).toEqual([]);
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should use repositories only for current project', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await initializeWorkingDir(true, multiProjectUpdatesReport());
            const dependencies = await manager.extractAllPackageFiles(config, [
                'build.gradle',
            ]);
            expect(dependencies).toMatchSnapshot();
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should execute gradlew when available', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await initializeWorkingDir(true, standardUpdatesReport());
            await manager.extractAllPackageFiles(config, ['build.gradle']);
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should execute gradlew.bat when available on Windows', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await initializeWorkingDir(true, standardUpdatesReport());
            jest.spyOn(os_1.default, 'platform').mockReturnValueOnce('win32');
            await manager.extractAllPackageFiles(config, ['build.gradle']);
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should execute gradle if gradlew is not available', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await initializeWorkingDir(false, standardUpdatesReport());
            await manager.extractAllPackageFiles(config, ['build.gradle']);
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should return null and gradle should not be executed if no root build.gradle', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await initializeWorkingDir(false, null);
            const packageFiles = ['foo/build.gradle'];
            expect(await manager.extractAllPackageFiles(config, packageFiles)).toBeNull();
            expect(exec).toHaveBeenCalledTimes(0);
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should return gradle dependencies for build.gradle in subdirectories if there is gradlew in the same directory', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await initializeWorkingDir(true, standardUpdatesReport());
            await fs_extra_1.default.mkdirs(`${config.localDir}/foo`);
            await initializeWorkingDir(true, standardUpdatesReport(), `${config.localDir}/foo`);
            const dependencies = await manager.extractAllPackageFiles(config, [
                'foo/build.gradle',
            ]);
            expect(dependencies).toMatchSnapshot();
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should configure the renovate report plugin', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await initializeWorkingDir(true, standardUpdatesReport());
            jest.spyOn(os_1.default, 'platform').mockReturnValueOnce('linux');
            await manager.extractAllPackageFiles(config, ['build.gradle']);
            await expect(fs_extra_1.default.access(`${config.localDir}/renovate-plugin.gradle`, fs_extra_1.default.constants.F_OK)).resolves.toBeUndefined();
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should use docker if required', async () => {
            const configWithDocker = { binarySource: common_1.BinarySource.Docker, ...config };
            jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
            await util.setUtilConfig(configWithDocker);
            await initializeWorkingDir(false, standardUpdatesReport());
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await manager.extractAllPackageFiles(configWithDocker, ['build.gradle']);
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should use docker even if gradlew is available', async () => {
            const configWithDocker = { binarySource: common_1.BinarySource.Docker, ...config };
            jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
            await util.setUtilConfig(configWithDocker);
            await initializeWorkingDir(true, standardUpdatesReport());
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await manager.extractAllPackageFiles(configWithDocker, ['build.gradle']);
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should use docker even if gradlew.bat is available on Windows', async () => {
            const configWithDocker = { binarySource: common_1.BinarySource.Docker, ...config };
            jest.spyOn(docker, 'removeDanglingContainers').mockResolvedValueOnce();
            await util.setUtilConfig(configWithDocker);
            jest.spyOn(os_1.default, 'platform').mockReturnValueOnce('win32');
            await initializeWorkingDir(true, standardUpdatesReport());
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            await manager.extractAllPackageFiles(configWithDocker, ['build.gradle']);
            expect(execSnapshots).toMatchSnapshot();
        });
    });
    describe('updateDependency', () => {
        let manager;
        let exec;
        beforeAll(async () => {
            [manager, exec] = await setupMocks();
        });
        afterAll(resetMocks);
        it('should update an existing module dependency', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            const buildGradleContent = await fs_extra_1.default.readFile(`${fixtures}/build.gradle.example1`, 'utf8');
            // prettier-ignore
            const upgrade = {
                depGroup: 'cglib', name: 'cglib-nodep', version: '3.1', newValue: '3.2.8',
            };
            const buildGradleContentUpdated = manager.updateDependency({
                fileContent: buildGradleContent,
                upgrade,
            });
            expect(buildGradleContent).not.toMatch('cglib:cglib-nodep:3.2.8');
            expect(buildGradleContentUpdated).toMatch('cglib:cglib-nodep:3.2.8');
            expect(buildGradleContentUpdated).not.toMatch('cglib:cglib-nodep:3.1');
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should update an existing plugin dependency', () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            const buildGradleContent = `
        plugins {
            id "com.github.ben-manes.versions" version "0.20.0"
        }
        `;
            const upgrade = {
                depGroup: 'com.github.ben-manes.versions',
                name: 'com.github.ben-manes.versions.gradle.plugin',
                version: '0.20.0',
                newValue: '0.21.0',
            };
            const buildGradleContentUpdated = manager.updateDependency({
                fileContent: buildGradleContent,
                upgrade,
            });
            expect(buildGradleContent).not.toMatch('id "com.github.ben-manes.versions" version "0.21.0"');
            expect(buildGradleContentUpdated).toMatch('id "com.github.ben-manes.versions" version "0.21.0"');
            expect(buildGradleContentUpdated).not.toMatch('id "com.github.ben-manes.versions" version "0.20.0"');
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should update an existing plugin dependency with Kotlin DSL', () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            const buildGradleContent = `
        plugins {
            id("com.github.ben-manes.versions") version "0.20.0"
        }
        `;
            const upgrade = {
                depGroup: 'com.github.ben-manes.versions',
                name: 'com.github.ben-manes.versions.gradle.plugin',
                version: '0.20.0',
                newValue: '0.21.0',
            };
            const buildGradleContentUpdated = manager.updateDependency({
                fileContent: buildGradleContent,
                upgrade,
            });
            expect(buildGradleContent).not.toMatch('id("com.github.ben-manes.versions") version "0.21.0"');
            expect(buildGradleContentUpdated).toMatch('id("com.github.ben-manes.versions") version "0.21.0"');
            expect(buildGradleContentUpdated).not.toMatch('id("com.github.ben-manes.versions") version "0.20.0"');
            expect(execSnapshots).toMatchSnapshot();
        });
        it('should update dependencies in same file', async () => {
            const execSnapshots = exec_util_1.mockExecAll(exec, gradleOutput);
            const buildGradleContent = await fs_extra_1.default.readFile(`${fixtures}/build.gradle.example1`, 'utf8');
            const upgrade = {
                depGroup: 'org.apache.openjpa',
                name: 'openjpa',
                version: '3.1.1',
                newValue: '3.1.2',
            };
            const buildGradleContentUpdated = manager.updateDependency({
                fileContent: buildGradleContent,
                upgrade,
            });
            expect(buildGradleContent).not.toContain('org.apache.openjpa:openjpa:3.1.2');
            expect(buildGradleContentUpdated).not.toContain("dependency 'org.apache.openjpa:openjpa:3.1.1'");
            expect(buildGradleContentUpdated).not.toContain("dependency 'org.apache.openjpa:openjpa:3.1.1'");
            expect(buildGradleContentUpdated).toContain("classpath 'org.apache.openjpa:openjpa:3.1.2'");
            expect(buildGradleContentUpdated).toContain("classpath 'org.apache.openjpa:openjpa:3.1.2'");
            expect(execSnapshots).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map