"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const limits_1 = require("./limits");
describe('lib/workers/global/limits', () => {
    beforeEach(() => {
        limits_1.resetAllLimits();
    });
    beforeEach(() => {
        limits_1.resetAllLimits();
    });
    it('increments limited value', () => {
        limits_1.setMaxLimit(limits_1.Limit.Commits, 3);
        expect(limits_1.isLimitReached(limits_1.Limit.Commits)).toBe(false);
        limits_1.incLimitedValue(limits_1.Limit.Commits, 2);
        expect(limits_1.isLimitReached(limits_1.Limit.Commits)).toBe(false);
        limits_1.incLimitedValue(limits_1.Limit.Commits);
        expect(limits_1.isLimitReached(limits_1.Limit.Commits)).toBe(true);
        limits_1.incLimitedValue(limits_1.Limit.Commits);
        expect(limits_1.isLimitReached(limits_1.Limit.Commits)).toBe(true);
    });
    it('defaults to unlimited', () => {
        expect(limits_1.isLimitReached(limits_1.Limit.Commits)).toBe(false);
    });
    it('increments undefined', () => {
        limits_1.incLimitedValue(limits_1.Limit.Commits);
        expect(limits_1.isLimitReached(limits_1.Limit.Commits)).toBe(false);
    });
    it('resets counter', () => {
        limits_1.setMaxLimit(limits_1.Limit.Commits, 1);
        limits_1.incLimitedValue(limits_1.Limit.Commits);
        expect(limits_1.isLimitReached(limits_1.Limit.Commits)).toBe(true);
        limits_1.setMaxLimit(limits_1.Limit.Commits, 1);
        expect(limits_1.isLimitReached(limits_1.Limit.Commits)).toBe(false);
    });
    it('resets limit', () => {
        limits_1.setMaxLimit(limits_1.Limit.Commits, 1);
        limits_1.incLimitedValue(limits_1.Limit.Commits);
        expect(limits_1.isLimitReached(limits_1.Limit.Commits)).toBe(true);
        limits_1.setMaxLimit(limits_1.Limit.Commits, null);
        expect(limits_1.isLimitReached(limits_1.Limit.Commits)).toBe(false);
    });
    it('sets non-positive limit as reached', () => {
        limits_1.setMaxLimit(limits_1.Limit.Commits, 0);
        expect(limits_1.isLimitReached(limits_1.Limit.Commits)).toBeTrue();
        limits_1.setMaxLimit(limits_1.Limit.Commits, -1000);
        expect(limits_1.isLimitReached(limits_1.Limit.Commits)).toBeTrue();
    });
});
//# sourceMappingURL=limits.spec.js.map