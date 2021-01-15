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
const util_1 = require("../../../../test/util");
const _managerFiles = __importStar(require("./manager-files"));
const _1 = require(".");
jest.mock('./manager-files');
jest.mock('../../../util/git');
const managerFiles = util_1.mocked(_managerFiles);
describe('workers/repository/extract/index', () => {
    describe('extractAllDependencies()', () => {
        let config;
        const fileList = ['README', 'package.json', 'tasks/ansible.yaml'];
        beforeEach(() => {
            jest.resetAllMocks();
            util_1.git.getFileList.mockResolvedValue(fileList);
            config = { ...util_1.defaultConfig };
        });
        it('runs', async () => {
            managerFiles.getManagerPackageFiles.mockResolvedValue([{}]);
            const res = await _1.extractAllDependencies(config);
            expect(Object.keys(res)).toContain('ansible');
        });
        it('skips non-enabled managers', async () => {
            config.enabledManagers = ['npm'];
            managerFiles.getManagerPackageFiles.mockResolvedValue([{}]);
            const res = await _1.extractAllDependencies(config);
            expect(res).toMatchSnapshot();
        });
        it('checks custom managers', async () => {
            managerFiles.getManagerPackageFiles.mockResolvedValue([{}]);
            config.regexManagers = [{ fileMatch: ['README'], matchStrings: [''] }];
            const res = await _1.extractAllDependencies(config);
            expect(Object.keys(res)).toContain('regex');
        });
    });
});
//# sourceMappingURL=index.spec.js.map