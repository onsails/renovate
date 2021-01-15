"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = exports.extractAllPackageFiles = void 0;
const extract_1 = require("./extract");
Object.defineProperty(exports, "extractAllPackageFiles", { enumerable: true, get: function () { return extract_1.extractAllPackageFiles; } });
exports.defaultConfig = {
    fileMatch: ['(^|/)batect(-bundle)?\\.yml$'],
};
//# sourceMappingURL=index.js.map