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
const _branchWorker = __importStar(require("../../branch"));
const common_1 = require("../../common");
const limits_1 = require("../../global/limits");
const _limits = __importStar(require("./limits"));
const write_1 = require("./write");
jest.mock('../../../util/git');
const branchWorker = util_1.mocked(_branchWorker);
const limits = util_1.mocked(_limits);
branchWorker.processBranch = jest.fn();
limits.getPrsRemaining = jest.fn().mockResolvedValue(99);
limits.getBranchesRemaining = jest.fn().mockReturnValue(99);
let config;
beforeEach(() => {
    jest.resetAllMocks();
    config = util_1.getConfig();
});
describe('workers/repository/write', () => {
    describe('writeUpdates()', () => {
        it('skips branches blocked by pin', async () => {
            const branches = [
                { updateType: 'pin' },
                { blockedByPin: true },
                {},
            ];
            util_1.git.branchExists.mockReturnValueOnce(false);
            const res = await write_1.writeUpdates(config, branches);
            expect(res).toEqual('done');
            expect(branchWorker.processBranch).toHaveBeenCalledTimes(2);
        });
        it('stops after automerge', async () => {
            const branches = [
                {},
                {},
                { automergeType: 'pr-comment', requiredStatusChecks: null },
                {},
                {},
            ];
            util_1.git.branchExists.mockReturnValue(true);
            branchWorker.processBranch.mockResolvedValueOnce(common_1.ProcessBranchResult.PrCreated);
            branchWorker.processBranch.mockResolvedValueOnce(common_1.ProcessBranchResult.AlreadyExisted);
            branchWorker.processBranch.mockResolvedValueOnce(common_1.ProcessBranchResult.Automerged);
            branchWorker.processBranch.mockResolvedValueOnce(common_1.ProcessBranchResult.Automerged);
            const res = await write_1.writeUpdates(config, branches);
            expect(res).toEqual('automerged');
            expect(branchWorker.processBranch).toHaveBeenCalledTimes(4);
        });
        it('increments branch counter', async () => {
            const branches = [{}];
            branchWorker.processBranch.mockResolvedValueOnce(common_1.ProcessBranchResult.PrCreated);
            util_1.git.branchExists.mockReturnValueOnce(false);
            util_1.git.branchExists.mockReturnValueOnce(true);
            limits.getBranchesRemaining.mockReturnValueOnce(1);
            expect(limits_1.isLimitReached(limits_1.Limit.Branches)).toBeFalse();
            await write_1.writeUpdates({ config }, branches);
            expect(limits_1.isLimitReached(limits_1.Limit.Branches)).toBeTrue();
        });
    });
});
//# sourceMappingURL=write.spec.js.map