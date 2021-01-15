"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = exports.language = exports.getRangeStrategy = exports.extractPackageFile = void 0;
const languages_1 = require("../../constants/languages");
const pep440_1 = require("../../versioning/pep440");
var extract_1 = require("./extract");
Object.defineProperty(exports, "extractPackageFile", { enumerable: true, get: function () { return extract_1.extractPackageFile; } });
var range_1 = require("./range");
Object.defineProperty(exports, "getRangeStrategy", { enumerable: true, get: function () { return range_1.getRangeStrategy; } });
exports.language = languages_1.LANGUAGE_PYTHON;
exports.defaultConfig = {
    fileMatch: ['(^|/)setup\\.cfg$'],
    versioning: pep440_1.id,
};
//# sourceMappingURL=index.js.map