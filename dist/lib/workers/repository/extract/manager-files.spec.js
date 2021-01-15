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
const _html = __importStar(require("../../../manager/html"));
const _fileMatch = __importStar(require("./file-match"));
const manager_files_1 = require("./manager-files");
jest.mock('./file-match');
jest.mock('../../../manager/html');
jest.mock('../../../util/fs');
const fileMatch = util_1.mocked(_fileMatch);
const html = util_1.mocked(_html);
describe('workers/repository/extract/manager-files', () => {
    describe('getManagerPackageFiles()', () => {
        let config;
        beforeEach(() => {
            jest.resetAllMocks();
            config = util_1.getConfig();
        });
        it('returns empty of manager is disabled', async () => {
            const managerConfig = { manager: 'travis', enabled: false };
            const res = await manager_files_1.getManagerPackageFiles(managerConfig);
            expect(res).toHaveLength(0);
        });
        it('returns empty of manager is not enabled', async () => {
            config.enabledManagers = ['npm'];
            const managerConfig = { manager: 'docker', enabled: true };
            const res = await manager_files_1.getManagerPackageFiles(managerConfig);
            expect(res).toHaveLength(0);
        });
        it('skips files if null content returned', async () => {
            const managerConfig = { manager: 'npm', enabled: true };
            fileMatch.getMatchingFiles.mockReturnValue(['package.json']);
            const res = await manager_files_1.getManagerPackageFiles(managerConfig);
            expect(res).toHaveLength(0);
        });
        it('returns files with extractPackageFile', async () => {
            const managerConfig = {
                manager: 'html',
                enabled: true,
                fileList: ['Dockerfile'],
            };
            fileMatch.getMatchingFiles.mockReturnValue(['Dockerfile']);
            util_1.fs.readLocalFile.mockResolvedValueOnce('some content');
            html.extractPackageFile = jest.fn(() => ({
                deps: [{}, { replaceString: 'abc' }],
            }));
            const res = await manager_files_1.getManagerPackageFiles(managerConfig);
            expect(res).toMatchSnapshot();
        });
        it('returns files with extractAllPackageFiles', async () => {
            const managerConfig = {
                manager: 'npm',
                enabled: true,
                fileList: ['package.json'],
            };
            fileMatch.getMatchingFiles.mockReturnValue(['package.json']);
            util_1.fs.readLocalFile.mockResolvedValueOnce('{"dependencies":{"chalk":"2.0.0"}}');
            const res = await manager_files_1.getManagerPackageFiles(managerConfig);
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=manager-files.spec.js.map