"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const types_1 = require("../../types");
const status_checks_1 = require("./status-checks");
describe('workers/branch/status-checks', () => {
    describe('setStability', () => {
        let config;
        beforeEach(() => {
            config = {
                ...util_1.defaultConfig,
                branchName: 'renovate/some-branch',
            };
        });
        afterEach(() => {
            jest.resetAllMocks();
        });
        it('returns if not configured', async () => {
            await status_checks_1.setStability(config);
            expect(util_1.platform.getBranchStatusCheck).toHaveBeenCalledTimes(0);
        });
        it('sets status yellow', async () => {
            config.stabilityStatus = types_1.BranchStatus.yellow;
            await status_checks_1.setStability(config);
            expect(util_1.platform.getBranchStatusCheck).toHaveBeenCalledTimes(1);
            expect(util_1.platform.setBranchStatus).toHaveBeenCalledTimes(1);
        });
        it('sets status green', async () => {
            config.stabilityStatus = types_1.BranchStatus.green;
            await status_checks_1.setStability(config);
            expect(util_1.platform.getBranchStatusCheck).toHaveBeenCalledTimes(1);
            expect(util_1.platform.setBranchStatus).toHaveBeenCalledTimes(1);
        });
        it('skips status if already set', async () => {
            config.stabilityStatus = types_1.BranchStatus.green;
            util_1.platform.getBranchStatusCheck.mockResolvedValueOnce(types_1.BranchStatus.green);
            await status_checks_1.setStability(config);
            expect(util_1.platform.getBranchStatusCheck).toHaveBeenCalledTimes(1);
            expect(util_1.platform.setBranchStatus).toHaveBeenCalledTimes(0);
        });
    });
});
//# sourceMappingURL=status-checks.spec.js.map