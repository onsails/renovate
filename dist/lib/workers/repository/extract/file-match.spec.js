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
Object.defineProperty(exports, "__esModule", { value: true });
const fileMatch = __importStar(require("./file-match"));
jest.mock('../../../util/git');
describe('workers/repository/extract/file-match', () => {
    const fileList = ['package.json', 'frontend/package.json'];
    describe('getIncludedFiles()', () => {
        it('returns fileList if no includePaths', () => {
            const res = fileMatch.getIncludedFiles(fileList, []);
            expect(res).toEqual(fileList);
        });
        it('returns exact matches', () => {
            const includePaths = ['frontend/package.json'];
            const res = fileMatch.getIncludedFiles(fileList, includePaths);
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(1);
        });
        it('returns minimatch matches', () => {
            const includePaths = ['frontend/**'];
            const res = fileMatch.getIncludedFiles(fileList, includePaths);
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(1);
        });
    });
    describe('filterIgnoredFiles()', () => {
        it('returns fileList if no ignoredPaths', () => {
            const res = fileMatch.filterIgnoredFiles(fileList, []);
            expect(res).toEqual(fileList);
        });
        it('ignores partial matches', () => {
            const ignoredPaths = ['frontend'];
            const res = fileMatch.filterIgnoredFiles(fileList, ignoredPaths);
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(1);
        });
        it('returns minimatch matches', () => {
            const ignoredPaths = ['frontend/**'];
            const res = fileMatch.filterIgnoredFiles(fileList, ignoredPaths);
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(1);
        });
    });
    describe('getMatchingFiles()', () => {
        const config = {
            includePaths: [],
            ignoredPaths: [],
            manager: 'npm',
            fileMatch: ['(^|/)package.json$'],
        };
        it('returns npm files', () => {
            fileList.push('Dockerfile');
            const res = fileMatch.getMatchingFiles(config, fileList);
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(2);
        });
        it('deduplicates', () => {
            config.fileMatch.push('package.json');
            const res = fileMatch.getMatchingFiles(config, fileList);
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(2);
        });
    });
});
//# sourceMappingURL=file-match.spec.js.map