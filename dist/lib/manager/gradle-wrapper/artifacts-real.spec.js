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
const fs_extra_1 = require("fs-extra");
const simple_git_1 = __importDefault(require("simple-git"));
const upath_1 = require("upath");
const httpMock = __importStar(require("../../../test/http-mock"));
const util_1 = require("../../../test/util");
const util_2 = require("../../util");
const gradle_1 = require("../gradle/__testutil__/gradle");
const dcUpdate = __importStar(require("."));
jest.mock('../../util/git');
const fixtures = upath_1.resolve(__dirname, './__fixtures__');
const config = {
    localDir: upath_1.resolve(fixtures, './testFiles'),
    toVersion: '5.6.4',
};
function readString(...paths) {
    return fs_extra_1.readFile(upath_1.resolve(fixtures, ...paths), 'utf8');
}
function readBinSync(...paths) {
    return fs_extra_1.readFileSync(upath_1.resolve(fixtures, ...paths));
}
function compareFile(file, path) {
    expect(readBinSync(`./testFiles/${file}`)).toEqual(readBinSync(`./${path}/${file}`));
}
describe(util_1.getName(__filename), () => {
    gradle_1.ifSystemSupportsGradle(6).describe('real tests', () => {
        jest.setTimeout(60 * 1000);
        beforeEach(async () => {
            jest.resetAllMocks();
            await util_2.setUtilConfig(config);
            httpMock.setup();
        });
        afterEach(async () => {
            await simple_git_1.default(fixtures).checkout(['HEAD', '--', '.']);
            httpMock.reset();
        });
        it('replaces existing value', async () => {
            util_1.git.getRepoStatus.mockResolvedValue({
                modified: [
                    'gradle/wrapper/gradle-wrapper.properties',
                    'gradle/wrapper/gradle-wrapper.jar',
                    'gradlew',
                    'gradlew.bat',
                ],
            });
            const res = await dcUpdate.updateArtifacts({
                packageFileName: 'gradle/wrapper/gradle-wrapper.properties',
                updatedDeps: [],
                newPackageFileContent: await readString(`./expectedFiles/gradle/wrapper/gradle-wrapper.properties`),
                config: { ...config, toVersion: '6.3' },
            });
            expect(res).toEqual([
                'gradle/wrapper/gradle-wrapper.properties',
                'gradle/wrapper/gradle-wrapper.jar',
                'gradlew',
                'gradlew.bat',
            ].map((fileProjectPath) => ({
                file: {
                    name: fileProjectPath,
                    contents: readBinSync(`./testFiles/${fileProjectPath}`),
                },
            })));
            [
                'gradle/wrapper/gradle-wrapper.properties',
                'gradle/wrapper/gradle-wrapper.jar',
                'gradlew',
                'gradlew.bat',
            ].forEach((file) => {
                compareFile(file, 'expectedFiles');
            });
        });
        it('updates from version', async () => {
            util_1.git.getRepoStatus.mockResolvedValueOnce(util_1.partial({
                modified: ['gradle/wrapper/gradle-wrapper.properties'],
            }));
            const result = await dcUpdate.updateArtifacts({
                packageFileName: 'gradle/wrapper/gradle-wrapper.properties',
                updatedDeps: [],
                newPackageFileContent: ``,
                config: { ...config, toVersion: '6.3' },
            });
            expect(result).toHaveLength(1);
            expect(result[0].artifactError).toBeUndefined();
            compareFile('gradle/wrapper/gradle-wrapper.properties', 'expectedFiles');
        });
        it('up to date', async () => {
            util_1.git.getRepoStatus.mockResolvedValue({
                modified: [],
            });
            const res = await dcUpdate.updateArtifacts({
                packageFileName: 'gradle/wrapper/gradle-wrapper.properties',
                updatedDeps: [],
                newPackageFileContent: await readString(`./testFiles/gradle/wrapper/gradle-wrapper.properties`),
                config,
            });
            expect(res).toEqual([]);
            // 5.6.4 => 5.6.4 (updates execs)
            // 6.3 => (5.6.4) (downgrades execs)
            // looks like a bug in Gradle
            ['gradle/wrapper/gradle-wrapper.properties'].forEach((file) => {
                compareFile(file, 'testFiles-copy');
            });
        });
        it('getRepoStatus fails', async () => {
            util_1.git.getRepoStatus.mockImplementation(() => {
                throw new Error('failed');
            });
            const res = await dcUpdate.updateArtifacts({
                packageFileName: 'gradle/wrapper/gradle-wrapper.properties',
                updatedDeps: [],
                newPackageFileContent: await readString(`./testFiles/gradle/wrapper/gradle-wrapper.properties`),
                config,
            });
            expect(res[0].artifactError.lockFile).toEqual('gradle/wrapper/gradle-wrapper.properties');
            expect(res[0].artifactError.stderr).toEqual('failed');
            // 5.6.4 => 5.6.4 (updates execs) - unexpected behavior (looks like a bug in Gradle)
            ['gradle/wrapper/gradle-wrapper.properties'].forEach((file) => {
                compareFile(file, 'testFiles-copy');
            });
        });
        it('gradlew failed', async () => {
            const cfg = { ...config, localDir: upath_1.resolve(fixtures, './wrongCmd') };
            await util_2.setUtilConfig(cfg);
            const res = await dcUpdate.updateArtifacts({
                packageFileName: 'gradle/wrapper/gradle-wrapper.properties',
                updatedDeps: [],
                newPackageFileContent: await readString(`./testFiles/gradle/wrapper/gradle-wrapper.properties`),
                config: cfg,
            });
            expect(res[0].artifactError.lockFile).toEqual('gradle/wrapper/gradle-wrapper.properties');
            expect(res[0].artifactError.stderr).not.toBeNull();
            expect(res[0].artifactError.stderr).not.toEqual('');
            // 5.6.4 => 5.6.4 (updates execs) - unexpected behavior (looks like a bug in Gradle)
            ['gradle/wrapper/gradle-wrapper.properties'].forEach((file) => {
                compareFile(file, 'testFiles-copy');
            });
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
        it('updates distributionSha256Sum', async () => {
            httpMock
                .scope('https://services.gradle.org')
                .get('/distributions/gradle-6.3-bin.zip.sha256')
                .reply(200, '038794feef1f4745c6347107b6726279d1c824f3fc634b60f86ace1e9fbd1768');
            util_1.git.getRepoStatus.mockResolvedValueOnce(util_1.partial({
                modified: ['gradle/wrapper/gradle-wrapper.properties'],
            }));
            const newContent = await readString(`./gradle-wrapper-sum.properties`);
            const result = await dcUpdate.updateArtifacts({
                packageFileName: 'gradle/wrapper/gradle-wrapper.properties',
                updatedDeps: [],
                newPackageFileContent: newContent.replace('038794feef1f4745c6347107b6726279d1c824f3fc634b60f86ace1e9fbd1768', '1f3067073041bc44554d0efe5d402a33bc3d3c93cc39ab684f308586d732a80d'),
                config: {
                    ...config,
                    toVersion: '6.3',
                    currentValue: '5.6.4',
                },
            });
            expect(result).toHaveLength(1);
            expect(result[0].artifactError).toBeUndefined();
            expect(await readString(config.localDir, `./gradle/wrapper/gradle-wrapper.properties`)).toEqual(newContent);
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
                packageFileName: 'gradle/wrapper/gradle-wrapper.properties',
                updatedDeps: [],
                newPackageFileContent: `distributionSha256Sum=336b6898b491f6334502d8074a6b8c2d73ed83b92123106bd4bf837f04111043\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-6.3-bin.zip`,
                config,
            });
            expect(result).toEqual([
                {
                    artifactError: {
                        lockFile: 'gradle/wrapper/gradle-wrapper.properties',
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
});
//# sourceMappingURL=artifacts-real.spec.js.map