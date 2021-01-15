"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ifSystemSupportsGradle = void 0;
const child_process_1 = require("child_process");
const failIfNoJavaEnv = 'CI';
const gradleJavaVersionSupport = {
    5: { min: 8, max: 12 },
    6: { min: 8, max: 13 },
};
const skipJava = process.env.SKIP_JAVA_TESTS === 'true';
const enforceJava = process.env[failIfNoJavaEnv] === 'true' && !skipJava;
function parseJavaVersion(javaVersionOutput) {
    const versionMatch = /version "(?:1\.)?(\d+)[\d._-]*"/.exec(javaVersionOutput);
    if (versionMatch !== null && versionMatch.length === 2) {
        return parseInt(versionMatch[1], 10);
    }
    if (enforceJava) {
        throw Error(`This test suite needs Java and ${failIfNoJavaEnv} is set. However, we cannot parse the Java version.
The output of java -version was:
${javaVersionOutput}`);
    }
    return 0;
}
let cachedJavaVersion = null;
function determineJavaVersion() {
    if (cachedJavaVersion == null) {
        let javaVersionCommand;
        let error;
        try {
            javaVersionCommand = child_process_1.spawnSync('java', ['-version'], {
                encoding: 'utf8',
                windowsHide: true,
            });
        }
        catch (e) {
            error = e;
        }
        if (javaVersionCommand.error) {
            error = javaVersionCommand.error;
        }
        if (error) {
            if (!enforceJava) {
                return 0;
            }
            throw Error(`This test suite needs Java and ${failIfNoJavaEnv} is set.
Result of java -version:
${error.toString()}`);
        }
        cachedJavaVersion = parseJavaVersion(javaVersionCommand.stderr);
    }
    return cachedJavaVersion;
}
class WithGradle {
    constructor(gradleVersion) {
        const javaVersion = determineJavaVersion();
        if (gradleJavaVersionSupport[gradleVersion] === undefined) {
            throw Error(`Unknown gradle version '${gradleVersion}'!`);
        }
        const supportedJavaVersions = gradleJavaVersionSupport[gradleVersion];
        this.gradleSupportsThisJavaVersion =
            javaVersion >= supportedJavaVersions.min &&
                javaVersion <= supportedJavaVersions.max;
        if (!this.gradleSupportsThisJavaVersion && enforceJava) {
            throw Error(`This test needs a Java version between ${supportedJavaVersions.min} and ${supportedJavaVersions.max}. The current Java version is ${javaVersion} and ${failIfNoJavaEnv} is set!`);
        }
    }
    get it() {
        return !this.gradleSupportsThisJavaVersion || skipJava ? it.skip : it;
    }
    get describe() {
        return !this.gradleSupportsThisJavaVersion || skipJava
            ? describe.skip
            : describe;
    }
}
function ifSystemSupportsGradle(gradleVersion) {
    return new WithGradle(gradleVersion);
}
exports.ifSystemSupportsGradle = ifSystemSupportsGradle;
//# sourceMappingURL=gradle.js.map