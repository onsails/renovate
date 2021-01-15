"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPackageFile = void 0;
const pypi_1 = require("../../datasource/pypi");
const pep440_1 = __importDefault(require("../../versioning/pep440"));
function getSectionName(str) {
    const [, sectionName] = /^\[\s*([^\s]+)\s*]\s*$/.exec(str) || [];
    return sectionName;
}
function getSectionRecord(str) {
    const [, sectionRecord] = /^([^\s]+)\s+=/.exec(str) || [];
    return sectionRecord;
}
function getDepType(section, record) {
    if (section === 'options') {
        if (record === 'install_requires') {
            return 'install';
        }
        if (record === 'setup_requires') {
            return 'setup';
        }
        if (record === 'tests_require') {
            return 'test';
        }
    }
    return 'extra';
}
function parseDep(line, section, record) {
    const [, depName, currentValue] = /\s+([-_a-zA-Z0-9]*)\s*(.*)/.exec(line) || [];
    if (section &&
        record &&
        depName &&
        currentValue &&
        pep440_1.default.isValid(currentValue)) {
        const dep = { datasource: pypi_1.id, depName, currentValue };
        const depType = getDepType(section, record);
        if (depType) {
            dep.depType = depType;
        }
        return dep;
    }
    return null;
}
function extractPackageFile(content) {
    let sectionName = null;
    let sectionRecord = null;
    const deps = [];
    content
        .split('\n')
        .map((line) => line.replace(/[;#].*$/, '').trimRight())
        .forEach((rawLine) => {
        let line = rawLine;
        const newSectionName = getSectionName(line);
        const newSectionRecord = getSectionRecord(line);
        if (newSectionName) {
            sectionName = newSectionName;
        }
        else {
            if (newSectionRecord) {
                sectionRecord = newSectionRecord;
                line = rawLine.replace(/^[^=]*=\s*/, '\t');
            }
            const dep = parseDep(line, sectionName, sectionRecord);
            if (dep) {
                deps.push(dep);
            }
        }
    });
    return deps.length > 0 ? { deps } : null;
}
exports.extractPackageFile = extractPackageFile;
//# sourceMappingURL=extract.js.map