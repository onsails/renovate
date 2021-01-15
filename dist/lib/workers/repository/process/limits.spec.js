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
const luxon_1 = require("luxon");
const util_1 = require("../../../../test/util");
const types_1 = require("../../../types");
const limits = __importStar(require("./limits"));
jest.mock('../../../util/git');
let config;
beforeEach(() => {
    jest.resetAllMocks();
    config = util_1.getConfig();
});
describe('workers/repository/process/limits', () => {
    describe('getPrHourlyRemaining()', () => {
        it('calculates hourly limit remaining', async () => {
            const time = luxon_1.DateTime.local();
            const createdAt = time.toISO();
            util_1.platform.getPrList.mockResolvedValueOnce([
                { createdAt, sourceBranch: 'foo/test-1' },
                { createdAt, sourceBranch: 'foo/test-2' },
                { createdAt, sourceBranch: 'foo/test-3' },
                {
                    createdAt: time.minus({ hours: 1 }).toISO(),
                    sourceBranch: 'foo/test-4',
                },
                { createdAt, sourceBranch: 'bar/configure' },
                { createdAt, sourceBranch: 'baz/test' },
            ]);
            const res = await limits.getPrHourlyRemaining({
                ...config,
                prHourlyLimit: 10,
                branchPrefix: 'foo/',
                onboardingBranch: 'bar/configure',
            });
            expect(res).toEqual(7);
        });
        it('returns prHourlyLimit if errored', async () => {
            config.prHourlyLimit = 2;
            util_1.platform.getPrList.mockRejectedValue('Unknown error');
            const res = await limits.getPrHourlyRemaining(config);
            expect(res).toEqual(2);
        });
        it('returns 99 if no hourly limit', async () => {
            const res = await limits.getPrHourlyRemaining(config);
            expect(res).toEqual(99);
        });
    });
    describe('getConcurrentPrsRemaining()', () => {
        it('calculates concurrent limit remaining', async () => {
            config.prConcurrentLimit = 20;
            util_1.platform.getBranchPr.mockImplementation((branchName) => branchName
                ? Promise.resolve({
                    sourceBranch: branchName,
                    state: types_1.PrState.Open,
                })
                : Promise.reject('some error'));
            const branches = [
                { branchName: 'test' },
                { branchName: null },
            ];
            const res = await limits.getConcurrentPrsRemaining(config, branches);
            expect(res).toEqual(19);
        });
        it('returns 99 if no concurrent limit', async () => {
            const res = await limits.getConcurrentPrsRemaining(config, []);
            expect(res).toEqual(99);
        });
    });
    describe('getPrsRemaining()', () => {
        it('returns hourly limit', async () => {
            config.prHourlyLimit = 5;
            util_1.platform.getPrList.mockResolvedValueOnce([]);
            const res = await limits.getPrsRemaining(config, []);
            expect(res).toEqual(5);
        });
        it('returns concurrent limit', async () => {
            config.prConcurrentLimit = 5;
            const res = await limits.getPrsRemaining(config, []);
            expect(res).toEqual(5);
        });
    });
    describe('getConcurrentBranchesRemaining()', () => {
        it('calculates concurrent limit remaining', () => {
            config.branchConcurrentLimit = 20;
            util_1.git.branchExists.mockReturnValueOnce(true);
            const res = limits.getConcurrentBranchesRemaining(config, [
                { branchName: 'foo' },
            ]);
            expect(res).toEqual(19);
        });
        it('defaults to prConcurrentLimit', () => {
            config.branchConcurrentLimit = null;
            config.prConcurrentLimit = 20;
            util_1.git.branchExists.mockReturnValueOnce(true);
            const res = limits.getConcurrentBranchesRemaining(config, [
                { branchName: 'foo' },
            ]);
            expect(res).toEqual(19);
        });
        it('does not use prConcurrentLimit for explicit branchConcurrentLimit=0', () => {
            config.branchConcurrentLimit = 0;
            config.prConcurrentLimit = 20;
            const res = limits.getConcurrentBranchesRemaining(config, []);
            expect(res).toEqual(99);
        });
        it('returns 99 if no limits are set', () => {
            const res = limits.getConcurrentBranchesRemaining(config, []);
            expect(res).toEqual(99);
        });
        it('returns prConcurrentLimit if errored', () => {
            config.branchConcurrentLimit = 2;
            const res = limits.getConcurrentBranchesRemaining(config, null);
            expect(res).toEqual(2);
        });
    });
    describe('getBranchesRemaining()', () => {
        it('returns concurrent branches', () => {
            config.branchConcurrentLimit = 20;
            util_1.git.branchExists.mockReturnValueOnce(true);
            const res = limits.getBranchesRemaining(config, [
                { branchName: 'foo' },
            ]);
            expect(res).toEqual(19);
        });
    });
});
//# sourceMappingURL=limits.spec.js.map