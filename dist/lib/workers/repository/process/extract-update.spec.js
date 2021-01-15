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
const hasha_1 = __importDefault(require("hasha"));
const util_1 = require("../../../../test/util");
const _repositoryCache = __importStar(require("../../../util/cache/repository"));
const _branchify = __importStar(require("../updates/branchify"));
const extract_update_1 = require("./extract-update");
jest.mock('./write');
jest.mock('./sort');
jest.mock('./fetch');
jest.mock('../updates/branchify');
jest.mock('../extract');
jest.mock('../../../util/cache/repository');
jest.mock('../../../util/git');
const branchify = util_1.mocked(_branchify);
const repositoryCache = util_1.mocked(_repositoryCache);
branchify.branchifyUpgrades.mockResolvedValueOnce({
    branches: [{ branchName: 'some-branch', upgrades: [] }],
    branchList: ['branchName'],
});
describe('workers/repository/process/extract-update', () => {
    describe('extract()', () => {
        it('runs with no baseBranches', async () => {
            const config = {
                repoIsOnboarded: true,
                suppressNotifications: ['deprecationWarningIssues'],
            };
            repositoryCache.getCache.mockReturnValueOnce({ scan: {} });
            util_1.git.checkoutBranch.mockResolvedValueOnce('abc123');
            const packageFiles = await extract_update_1.extract(config);
            const res = await extract_update_1.lookup(config, packageFiles);
            expect(res).toMatchSnapshot();
            await expect(extract_update_1.update(config, res.branches)).resolves.not.toThrow();
        });
        it('runs with baseBranches', async () => {
            const config = {
                baseBranches: ['master', 'dev'],
                repoIsOnboarded: true,
                suppressNotifications: ['deprecationWarningIssues'],
            };
            util_1.git.checkoutBranch.mockResolvedValueOnce('abc123');
            repositoryCache.getCache.mockReturnValueOnce({ scan: {} });
            const packageFiles = await extract_update_1.extract(config);
            expect(packageFiles).toMatchSnapshot();
        });
        it('uses repository cache', async () => {
            const packageFiles = {};
            const config = {
                repoIsOnboarded: true,
                suppressNotifications: ['deprecationWarningIssues'],
                baseBranch: 'master',
            };
            repositoryCache.getCache.mockReturnValueOnce({
                scan: {
                    master: {
                        sha: 'abc123',
                        configHash: hasha_1.default(JSON.stringify(config)),
                        packageFiles,
                    },
                },
            });
            util_1.git.getBranchCommit.mockReturnValueOnce('abc123');
            util_1.git.checkoutBranch.mockResolvedValueOnce('abc123');
            const res = await extract_update_1.extract(config);
            expect(res).toEqual(packageFiles);
        });
    });
});
//# sourceMappingURL=extract-update.spec.js.map