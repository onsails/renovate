"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
describe('platform/azure/helpers', () => {
    describe('getNewBranchName', () => {
        it('should add refs/heads', () => {
            const res = util_1.getNewBranchName('testBB');
            expect(res).toBe(`refs/heads/testBB`);
        });
        it('should be the same', () => {
            const res = util_1.getNewBranchName('refs/heads/testBB');
            expect(res).toBe(`refs/heads/testBB`);
        });
    });
    describe('getGitStatusContextCombinedName', () => {
        it('should return undefined if null context passed', () => {
            const contextName = util_1.getGitStatusContextCombinedName(null);
            expect(contextName).toBeUndefined();
        });
        it('should combine valid genre and name with slash', () => {
            const contextName = util_1.getGitStatusContextCombinedName({
                genre: 'my-genre',
                name: 'status-name',
            });
            expect(contextName).toMatch('my-genre/status-name');
        });
        it('should combine valid empty genre and name without a slash', () => {
            const contextName = util_1.getGitStatusContextCombinedName({
                genre: undefined,
                name: 'status-name',
            });
            expect(contextName).toMatch('status-name');
        });
    });
    describe('getGitStatusContextFromCombinedName', () => {
        it('should return undefined if null context passed', () => {
            const context = util_1.getGitStatusContextFromCombinedName(null);
            expect(context).toBeUndefined();
        });
        it('should parse valid genre and name with slash', () => {
            const context = util_1.getGitStatusContextFromCombinedName('my-genre/status-name');
            expect(context).toEqual({
                genre: 'my-genre',
                name: 'status-name',
            });
        });
        it('should parse valid genre and name with multiple slashes', () => {
            const context = util_1.getGitStatusContextFromCombinedName('my-genre/sub-genre/status-name');
            expect(context).toEqual({
                genre: 'my-genre/sub-genre',
                name: 'status-name',
            });
        });
        it('should parse valid empty genre and name without a slash', () => {
            const context = util_1.getGitStatusContextFromCombinedName('status-name');
            expect(context).toEqual({
                genre: undefined,
                name: 'status-name',
            });
        });
    });
    describe('getBranchNameWithoutRefsheadsPrefix', () => {
        it('should be renamed', () => {
            const res = util_1.getBranchNameWithoutRefsheadsPrefix('refs/heads/testBB');
            expect(res).toBe(`testBB`);
        });
        it('should log error and return undefined', () => {
            const res = util_1.getBranchNameWithoutRefsheadsPrefix(undefined);
            expect(res).toBeUndefined();
        });
        it('should return the input', () => {
            const res = util_1.getBranchNameWithoutRefsheadsPrefix('testBB');
            expect(res).toBe('testBB');
        });
    });
    describe('getRenovatePRFormat', () => {
        it('should be formated (closed)', () => {
            const res = util_1.getRenovatePRFormat({ status: 2 });
            expect(res).toMatchSnapshot();
        });
        it('should be formated (closed v2)', () => {
            const res = util_1.getRenovatePRFormat({ status: 3 });
            expect(res).toMatchSnapshot();
        });
        it('should be formated (not closed)', () => {
            const res = util_1.getRenovatePRFormat({ status: 1 });
            expect(res).toMatchSnapshot();
        });
        it('should be formated (isConflicted)', () => {
            const res = util_1.getRenovatePRFormat({ mergeStatus: 2 });
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=util.spec.js.map