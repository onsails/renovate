"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const types_1 = require("../../types");
const check_existing_1 = require("./check-existing");
describe('workers/branch/check-existing', () => {
    describe('prAlreadyExisted', () => {
        let config;
        beforeEach(() => {
            config = util_1.partial({
                ...util_1.defaultConfig,
                branchName: 'some-branch',
                prTitle: 'some-title',
            });
            jest.resetAllMocks();
        });
        it('returns false if recreating closed PRs', async () => {
            config.recreateClosed = true;
            expect(await check_existing_1.prAlreadyExisted(config)).toBeNull();
            expect(util_1.platform.findPr).toHaveBeenCalledTimes(0);
        });
        it('returns false if check misses', async () => {
            config.recreatedClosed = true;
            expect(await check_existing_1.prAlreadyExisted(config)).toBeNull();
            expect(util_1.platform.findPr).toHaveBeenCalledTimes(1);
        });
        it('returns true if first check hits', async () => {
            util_1.platform.findPr.mockResolvedValueOnce({ number: 12 });
            util_1.platform.getPr.mockResolvedValueOnce({
                number: 12,
                state: types_1.PrState.Closed,
            });
            expect(await check_existing_1.prAlreadyExisted(config)).toEqual({ number: 12 });
            expect(util_1.platform.findPr).toHaveBeenCalledTimes(1);
        });
    });
});
//# sourceMappingURL=check-existing.spec.js.map