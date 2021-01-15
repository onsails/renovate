"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sort_1 = require("./sort");
describe('workers/repository/process/sort', () => {
    describe('sortBranches()', () => {
        it('sorts based on updateType and prTitle', () => {
            const branches = [
                {
                    updateType: 'major',
                    prTitle: 'some major update',
                },
                {
                    updateType: 'pin',
                    prTitle: 'some pin',
                },
                {
                    updateType: 'pin',
                    prTitle: 'some other pin',
                },
                {
                    updateType: 'minor',
                    prTitle: 'a minor update',
                },
            ];
            sort_1.sortBranches(branches);
            expect(branches).toMatchSnapshot();
        });
        it('sorts based on prPriority', () => {
            const branches = [
                {
                    updateType: 'major',
                    prTitle: 'some major update',
                    prPriority: 1,
                },
                {
                    updateType: 'pin',
                    prTitle: 'some pin',
                    prPriority: -1,
                },
                {
                    updateType: 'pin',
                    prTitle: 'some other pin',
                    prPriority: 0,
                },
                {
                    updateType: 'minor',
                    prTitle: 'a minor update',
                    prPriority: -1,
                },
            ];
            sort_1.sortBranches(branches);
            expect(branches).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=sort.spec.js.map