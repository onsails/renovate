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
const fs = __importStar(require("fs-extra"));
const tmp_promise_1 = __importDefault(require("tmp-promise"));
const upath = __importStar(require("upath"));
const util_1 = require("../../../test/util");
const exec_1 = require("../../util/exec");
const gradle_1 = require("./__testutil__/gradle");
const gradle_updates_report_1 = require("./gradle-updates-report");
const utils_1 = require("./utils");
const _1 = require(".");
const fixtures = 'lib/manager/gradle/__fixtures__';
describe(util_1.getName(__filename), () => {
    for (const gradleVersion of [5, 6]) {
        gradle_1.ifSystemSupportsGradle(gradleVersion).describe('createRenovateGradlePlugin', () => {
            let workingDir;
            beforeEach(async () => {
                workingDir = await tmp_promise_1.default.dir({ unsafeCleanup: true });
            });
            it(`generates a report for Gradle version ${gradleVersion}`, async () => {
                await fs.copy(`${fixtures}/minimal-project`, workingDir.path);
                await fs.copy(`${fixtures}/gradle-wrappers/${gradleVersion}`, workingDir.path);
                await gradle_updates_report_1.createRenovateGradlePlugin(workingDir.path);
                const gradlew = upath.join(workingDir.path, 'gradlew');
                await exec_1.exec(`${gradlew} ${_1.GRADLE_DEPENDENCY_REPORT_OPTIONS}`, {
                    cwd: workingDir.path,
                    extraEnv: utils_1.extraEnv,
                });
                expect(fs.readJSONSync(`${workingDir.path}/${gradle_updates_report_1.GRADLE_DEPENDENCY_REPORT_FILENAME}`)).toMatchSnapshot();
            }, 120000);
        });
    }
});
//# sourceMappingURL=gradle-updates-report.spec.js.map