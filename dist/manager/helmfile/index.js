"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = exports.extractPackageFile = void 0;
var extract_1 = require("./extract");
Object.defineProperty(exports, "extractPackageFile", { enumerable: true, get: function () { return extract_1.extractPackageFile; } });
exports.defaultConfig = {
    aliases: {
        stable: 'https://charts.helm.sh/stable',
    },
    commitMessageTopic: 'helm chart {{depName}}',
    fileMatch: ['(^|/)helmfile.yaml$'],
};
//# sourceMappingURL=index.js.map