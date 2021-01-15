"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReport = exports.copyExtractFile = void 0;
const data_files_generated_1 = __importDefault(require("../../data-files.generated"));
const fs_1 = require("../../util/fs");
// need to match filename in `data/extract.py`
const REPORT = 'renovate-pip_setup-report.json';
const EXTRACT = 'renovate-pip_setup-extract.py';
let extractPy;
async function copyExtractFile() {
    if (extractPy === undefined) {
        extractPy = data_files_generated_1.default.get('extract.py');
    }
    await fs_1.writeLocalFile(EXTRACT, extractPy);
    return EXTRACT;
}
exports.copyExtractFile = copyExtractFile;
async function parseReport() {
    const data = await fs_1.readLocalFile(REPORT, 'utf8');
    return JSON.parse(data);
}
exports.parseReport = parseReport;
//# sourceMappingURL=util.js.map