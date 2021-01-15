"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../../test/util");
const base_branch_1 = require("./base-branch");
describe('workers/repository/onboarding/pr/base-branch', () => {
    describe('getBaseBranchDesc()', () => {
        let config;
        beforeEach(() => {
            jest.resetAllMocks();
            config = util_1.getConfig();
        });
        it('returns empty if no baseBranch', () => {
            const res = base_branch_1.getBaseBranchDesc(config);
            expect(res).toEqual('');
        });
        it('describes baseBranch', () => {
            config.baseBranches = ['some-branch'];
            const res = base_branch_1.getBaseBranchDesc(config);
            expect(res).toMatchSnapshot();
        });
        it('describes baseBranches', () => {
            config.baseBranches = ['some-branch', 'some-other-branch'];
            const res = base_branch_1.getBaseBranchDesc(config);
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=base-branch.spec.js.map