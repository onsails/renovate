"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPackageFile = void 0;
const github_releases_1 = require("../../datasource/github-releases");
const logger_1 = require("../../logger");
const semver_1 = require("../../versioning/semver");
const VERSION_REGEX = /^\s+VERSION="(.*)"$/m;
function extractPackageFile(fileContent) {
    logger_1.logger.trace('batect.extractPackageFile()');
    const match = VERSION_REGEX.exec(fileContent);
    if (match === null) {
        return null;
    }
    const dependency = {
        depName: 'batect/batect',
        commitMessageTopic: 'Batect',
        currentValue: match[1],
        datasource: github_releases_1.id,
        versioning: semver_1.id,
    };
    logger_1.logger.trace(dependency, 'Found Batect wrapper version');
    return { deps: [dependency] };
}
exports.extractPackageFile = extractPackageFile;
//# sourceMappingURL=extract.js.map