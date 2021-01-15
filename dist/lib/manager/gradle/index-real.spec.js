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
const fs_extra_1 = __importDefault(require("fs-extra"));
const tmp_promise_1 = __importDefault(require("tmp-promise"));
const util_1 = require("../../../test/util");
const gradle_1 = require("./__testutil__/gradle");
const manager = __importStar(require("."));
const fixtures = 'lib/manager/gradle/__fixtures__';
const baseConfig = {
    gradle: {
        timeout: 60,
    },
};
describe(util_1.getName(__filename), () => {
    gradle_1.ifSystemSupportsGradle(6).describe('executeGradle integration', () => {
        const SUCCESS_FILE_NAME = 'success.indicator';
        let workingDir;
        let testRunConfig;
        let successFile;
        beforeEach(async () => {
            workingDir = await tmp_promise_1.default.dir({ unsafeCleanup: true });
            successFile = '';
            testRunConfig = { ...baseConfig, localDir: workingDir.path };
            await fs_extra_1.default.copy(`${fixtures}/minimal-project`, workingDir.path);
            await fs_extra_1.default.copy(`${fixtures}/gradle-wrappers/6`, workingDir.path);
            const mockPluginContent = `
allprojects {
  tasks.register("renovate") {
    doLast {
      new File('${SUCCESS_FILE_NAME}').write 'success'
    }
  }
}`;
            await fs_extra_1.default.writeFile(`${workingDir.path}/renovate-plugin.gradle`, mockPluginContent);
            successFile = `${workingDir.path}/${SUCCESS_FILE_NAME}`;
        });
        it('executes an executable gradle wrapper', async () => {
            const gradlew = await fs_extra_1.default.stat(`${workingDir.path}/gradlew`);
            await manager.executeGradle(testRunConfig, workingDir.path, gradlew);
            await expect(fs_extra_1.default.readFile(successFile, 'utf8')).resolves.toBe('success');
        }, 120000);
        it('executes a not-executable gradle wrapper', async () => {
            await fs_extra_1.default.chmod(`${workingDir.path}/gradlew`, '444');
            const gradlew = await fs_extra_1.default.stat(`${workingDir.path}/gradlew`);
            await manager.executeGradle(testRunConfig, workingDir.path, gradlew);
            await expect(fs_extra_1.default.readFile(successFile, 'utf8')).resolves.toBe('success');
        }, 120000);
    });
});
//# sourceMappingURL=index-real.spec.js.map