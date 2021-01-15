"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = exports.getRangeStrategy = exports.language = exports.updateArtifacts = exports.extractPackageFile = exports.supportsLockFileMaintenance = void 0;
const languages_1 = require("../../constants/languages");
const artifacts_1 = require("./artifacts");
Object.defineProperty(exports, "updateArtifacts", { enumerable: true, get: function () { return artifacts_1.updateArtifacts; } });
const extract_1 = require("./extract");
Object.defineProperty(exports, "extractPackageFile", { enumerable: true, get: function () { return extract_1.extractPackageFile; } });
const range_1 = require("./range");
Object.defineProperty(exports, "getRangeStrategy", { enumerable: true, get: function () { return range_1.getRangeStrategy; } });
const utils_1 = require("./utils");
const language = languages_1.LANGUAGE_PHP;
exports.language = language;
exports.supportsLockFileMaintenance = true;
exports.defaultConfig = {
    fileMatch: ['(^|/)([\\w-]*)composer.json$'],
    versioning: utils_1.composerVersioningId,
};
//# sourceMappingURL=index.js.map