"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../../test/util");
const pr_list_1 = require("./pr-list");
describe('workers/repository/onboarding/pr/pr-list', () => {
    describe('getPrList()', () => {
        let config;
        beforeEach(() => {
            jest.resetAllMocks();
            config = util_1.getConfig();
        });
        it('handles empty', () => {
            const branches = [];
            const res = pr_list_1.getPrList(config, branches);
            expect(res).toMatchSnapshot();
        });
        it('has special lock file maintenance description', () => {
            const branches = [
                {
                    prTitle: 'Lock file maintenance',
                    schedule: ['before 5am'],
                    branchName: 'renovate/lock-file-maintenance',
                    upgrades: [
                        {
                            updateType: 'lockFileMaintenance',
                        },
                    ],
                },
            ];
            const res = pr_list_1.getPrList(config, branches);
            expect(res).toMatchSnapshot();
        });
        it('handles multiple', () => {
            const branches = [
                {
                    prTitle: 'Pin dependencies',
                    baseBranch: 'some-other',
                    branchName: 'renovate/pin-dependencies',
                    upgrades: [
                        {
                            updateType: 'pin',
                            sourceUrl: 'https://a',
                            depName: 'a',
                            depType: 'devDependencies',
                            newValue: '1.1.0',
                        },
                        {
                            updateType: 'pin',
                            depName: 'b',
                            newValue: '1.5.3',
                        },
                    ],
                },
                {
                    prTitle: 'Update a to v2',
                    branchName: 'renovate/a-2.x',
                    upgrades: [
                        {
                            sourceUrl: 'https://a',
                            depName: 'a',
                            currentValue: '^1.0.0',
                            depType: 'devDependencies',
                            newValue: '2.0.1',
                            isLockfileUpdate: true,
                        },
                    ],
                },
            ];
            config.prHourlyLimit = 1;
            const res = pr_list_1.getPrList(config, branches);
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=pr-list.spec.js.map