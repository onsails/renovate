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
/* eslint jest/no-standalone-expect: 0 */
const child_process_1 = require("child_process");
const fs_extra_1 = require("fs-extra");
const upath_1 = require("upath");
const exec_util_1 = require("../../../test/exec-util");
const httpMock = __importStar(require("../../../test/http-mock"));
const util_1 = require("../../../test/util");
const util_2 = require("../../util");
const common_1 = require("../../util/exec/common");
const docker_1 = require("../../util/exec/docker");
const dcUpdate = __importStar(require("."));
jest.mock('child_process');
jest.mock('../../util/fs');
jest.mock('../../util/git');
jest.mock('../../util/exec/env');
const exec = child_process_1.exec;
const fixtures = upath_1.resolve(__dirname, './__fixtures__');
const config = {
    localDir: upath_1.resolve(fixtures, './testFiles'),
    toVersion: '5.6.4',
};
const dockerConfig = { ...config, binarySource: common_1.BinarySource.Docker };
util_1.addReplacingSerializer('gradlew.bat', '<gradlew>');
util_1.addReplacingSerializer('./gradlew', '<gradlew>');
function readString(...paths) {
    return fs_extra_1.readFile(upath_1.resolve(fixtures, ...paths), 'utf8');
}
describe(util_1.getName(__filename), () => {
    beforeEach(async () => {
        jest.resetAllMocks();
        httpMock.setup();
        util_1.env.getChildProcessEnv.mockReturnValue({
            ...exec_util_1.envMock.basic,
            LANG: 'en_US.UTF-8',
            LC_ALL: 'en_US',
        });
        await util_2.setUtilConfig(config);
        docker_1.resetPrefetchedImages();
        util_1.fs.readLocalFile.mockResolvedValue('test');
    });
    afterEach(() => {
        httpMock.reset();
    });
    it('replaces existing value', async () => {
        util_1.git.getRepoStatus.mockResolvedValue({
            modified: [
                'gradle/wrapper/gradle-wrapper.properties',
                'gradlew',
                'gradlew.bat',
            ],
        });
        const execSnapshots = exec_util_1.mockExecAll(exec);
        const res = await dcUpdate.updateArtifacts({
            packageFileName: 'gradle/wrapper/gradle-wrapper.properties',
            updatedDeps: [],
            newPackageFileContent: await readString(`./expectedFiles/gradle/wrapper/gradle-wrapper.properties`),
            config: { ...config, toVersion: '6.3' },
        });
        expect(res).toEqual([
            'gradle/wrapper/gradle-wrapper.properties',
            'gradlew',
            'gradlew.bat',
        ].map((fileProjectPath) => ({
            file: {
                name: fileProjectPath,
                contents: 'test',
            },
        })));
        expect(execSnapshots).toMatchSnapshot();
    });
    it('gradlew not found', async () => {
        const res = await dcUpdate.updateArtifacts({
            packageFileName: 'gradle-wrapper.properties',
            updatedDeps: [],
            newPackageFileContent: undefined,
            config: {
                localDir: 'some-dir',
            },
        });
        expect(res).toBeNull();
    });
    it('gradlew failed', async () => {
        const execSnapshots = exec_util_1.mockExecAll(exec, new Error('failed'));
        util_1.git.getRepoStatus.mockResolvedValueOnce(util_1.partial({
            modified: [],
        }));
        const res = await dcUpdate.updateArtifacts({
            packageFileName: 'gradle-wrapper.properties',
            updatedDeps: [],
            newPackageFileContent: '',
            config,
        });
        expect(execSnapshots).toMatchSnapshot();
        expect(res).toEqual([]);
    });
    it('updates distributionSha256Sum', async () => {
        httpMock
            .scope('https://services.gradle.org')
            .get('/distributions/gradle-6.3-bin.zip.sha256')
            .reply(200, '038794feef1f4745c6347107b6726279d1c824f3fc634b60f86ace1e9fbd1768');
        util_1.git.getRepoStatus.mockResolvedValueOnce(util_1.partial({
            modified: ['gradle/wrapper/gradle-wrapper.properties'],
        }));
        const execSnapshots = exec_util_1.mockExecAll(exec);
        const result = await dcUpdate.updateArtifacts({
            packageFileName: 'gradle-wrapper.properties',
            updatedDeps: [],
            newPackageFileContent: `distributionSha256Sum=336b6898b491f6334502d8074a6b8c2d73ed83b92123106bd4bf837f04111043\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-6.3-bin.zip`,
            config: dockerConfig,
        });
        expect(result).toHaveLength(1);
        expect(result[0].artifactError).toBeUndefined();
        expect(execSnapshots).toMatchSnapshot();
        expect(httpMock.getTrace()).toEqual([
            {
                headers: {
                    'accept-encoding': 'gzip, deflate',
                    host: 'services.gradle.org',
                    'user-agent': 'https://github.com/renovatebot/renovate',
                },
                method: 'GET',
                url: 'https://services.gradle.org/distributions/gradle-6.3-bin.zip.sha256',
            },
        ]);
    });
    it('distributionSha256Sum 404', async () => {
        httpMock
            .scope('https://services.gradle.org')
            .get('/distributions/gradle-6.3-bin.zip.sha256')
            .reply(404);
        const result = await dcUpdate.updateArtifacts({
            packageFileName: 'gradle-wrapper.properties',
            updatedDeps: [],
            newPackageFileContent: `distributionSha256Sum=336b6898b491f6334502d8074a6b8c2d73ed83b92123106bd4bf837f04111043\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-6.3-bin.zip`,
            config,
        });
        expect(result).toEqual([
            {
                artifactError: {
                    lockFile: 'gradle-wrapper.properties',
                    stderr: 'Response code 404 (Not Found)',
                },
            },
        ]);
        expect(httpMock.getTrace()).toEqual([
            {
                headers: {
                    'accept-encoding': 'gzip, deflate',
                    host: 'services.gradle.org',
                    'user-agent': 'https://github.com/renovatebot/renovate',
                },
                method: 'GET',
                url: 'https://services.gradle.org/distributions/gradle-6.3-bin.zip.sha256',
            },
        ]);
    });
});
//# sourceMappingURL=artifacts.spec.js.map