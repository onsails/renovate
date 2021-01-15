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
exports.getChangelogs = void 0;
const markdown_1 = require("../../../util/markdown");
const template = __importStar(require("../../../util/template"));
const hbs_template_1 = __importDefault(require("../changelog/hbs-template"));
function getChangelogs(config) {
    let releaseNotes = '';
    // istanbul ignore if
    if (!config.hasReleaseNotes) {
        return releaseNotes;
    }
    releaseNotes +=
        '\n\n---\n\n' + template.compile(hbs_template_1.default, config, false) + '\n\n';
    releaseNotes = releaseNotes.replace(/### \[`vv/g, '### [`v');
    releaseNotes = markdown_1.sanitizeMarkdown(releaseNotes);
    return releaseNotes;
}
exports.getChangelogs = getChangelogs;
//# sourceMappingURL=changelogs.js.map