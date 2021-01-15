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
const _extractUpdate = __importStar(require("./extract-update"));
const _1 = require(".");
jest.mock('../../../util/git');
jest.mock('./extract-update');
const extract = util_1.mocked(_extractUpdate).extract;
let config;
beforeEach(() => {
    jest.resetAllMocks();
    config = util_1.getConfig();
});
describe('workers/repository/process/index', () => {
    describe('processRepo()', () => {
        it('processes single branches', async () => {
            const res = await _1.extractDependencies(config);
            expect(res).toMatchSnapshot();
        });
        it('processes baseBranches', async () => {
            extract.mockResolvedValue({});
            config.baseBranches = ['branch1', 'branch2'];
            util_1.git.branchExists.mockReturnValueOnce(false);
            util_1.git.branchExists.mockReturnValueOnce(true);
            util_1.git.branchExists.mockReturnValueOnce(false);
            util_1.git.branchExists.mockReturnValueOnce(true);
            const res = await _1.extractDependencies(config);
            await _1.updateRepo(config, res.branches);
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map