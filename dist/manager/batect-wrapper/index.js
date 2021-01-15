"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = exports.updateArtifacts = exports.extractPackageFile = void 0;
const semver_1 = require("../../versioning/semver");
var extract_1 = require("./extract");
Object.defineProperty(exports, "extractPackageFile", { enumerable: true, get: function () { return extract_1.extractPackageFile; } });
var artifacts_1 = require("./artifacts");
Object.defineProperty(exports, "updateArtifacts", { enumerable: true, get: function () { return artifacts_1.updateArtifacts; } });
exports.defaultConfig = {
    fileMatch: ['(^|/)batect$'],
    versioning: semver_1.id,
};
//# sourceMappingURL=index.js.map