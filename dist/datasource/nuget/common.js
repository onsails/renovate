"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBuildMeta = exports.id = void 0;
exports.id = 'nuget';
const buildMetaRe = /\+.+$/g;
function removeBuildMeta(version) {
    return version === null || version === void 0 ? void 0 : version.replace(buildMetaRe, '');
}
exports.removeBuildMeta = removeBuildMeta;
//# sourceMappingURL=common.js.map