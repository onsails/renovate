"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../test/util");
const deprecated_1 = require("./deprecated");
describe('workers/repository/process/deprecated', () => {
    describe('raiseDeprecationWarnings()', () => {
        it('returns if onboarding', async () => {
            const config = {};
            await expect(deprecated_1.raiseDeprecationWarnings(config, {})).resolves.not.toThrow();
        });
        it('returns if disabled', async () => {
            const config = {
                repoIsOnboarded: true,
                suppressNotifications: ['deprecationWarningIssues'],
            };
            await expect(deprecated_1.raiseDeprecationWarnings(config, {})).resolves.not.toThrow();
        });
        it('raises deprecation warnings', async () => {
            const config = {
                repoIsOnboarded: true,
                suppressNotifications: [],
            };
            const packageFiles = {
                npm: [
                    {
                        packageFile: 'package.json',
                        deps: [
                            {
                                depName: 'foo',
                                deprecationMessage: 'foo is deprecated',
                            },
                            {
                                depName: 'bar',
                            },
                        ],
                    },
                    {
                        packageFile: 'backend/package.json',
                        deps: [],
                    },
                    {
                        packageFile: 'frontend/package.json',
                        deps: [
                            {
                                depName: 'abc',
                            },
                            {
                                depName: 'foo',
                                deprecationMessage: 'foo is deprecated',
                            },
                        ],
                    },
                ],
            };
            const mockIssue = [
                {
                    title: 'Dependency deprecation warning: mockDependency (mockManager)',
                    state: 'open',
                },
            ];
            util_1.platform.getIssueList.mockResolvedValue(mockIssue);
            await deprecated_1.raiseDeprecationWarnings(config, packageFiles);
            expect(util_1.platform.ensureIssue.mock.calls).toMatchSnapshot();
            expect(util_1.platform.getIssueList).toHaveBeenCalledTimes(1);
            expect(util_1.platform.ensureIssue).toHaveBeenCalledTimes(1);
        });
    });
});
//# sourceMappingURL=deprecated.spec.js.map