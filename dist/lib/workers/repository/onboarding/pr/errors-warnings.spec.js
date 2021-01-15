"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../../test/util");
const errors_warnings_1 = require("./errors-warnings");
describe('workers/repository/onboarding/pr/errors-warnings', () => {
    describe('getWarnings()', () => {
        let config;
        beforeEach(() => {
            jest.resetAllMocks();
            config = util_1.getConfig();
        });
        it('returns warning text', () => {
            config.warnings = [
                {
                    depName: 'foo',
                    message: 'Failed to look up dependency',
                },
            ];
            const res = errors_warnings_1.getWarnings(config);
            expect(res).toMatchSnapshot();
        });
    });
    describe('getDepWarnings()', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });
        it('returns warning text', () => {
            const packageFiles = {
                npm: [
                    {
                        packageFile: 'package.json',
                        deps: [
                            {
                                warnings: [{ message: 'Warning 1', depName: undefined }],
                            },
                            {},
                        ],
                    },
                    {
                        packageFile: 'backend/package.json',
                        deps: [
                            {
                                warnings: [{ message: 'Warning 1', depName: undefined }],
                            },
                        ],
                    },
                ],
                dockerfile: [
                    {
                        packageFile: 'Dockerfile',
                        deps: [
                            {
                                warnings: [{ message: 'Warning 2', depName: undefined }],
                            },
                        ],
                    },
                ],
            };
            const res = errors_warnings_1.getDepWarnings(packageFiles);
            expect(res).toMatchSnapshot();
        });
    });
    describe('getErrors()', () => {
        let config;
        beforeEach(() => {
            jest.resetAllMocks();
            config = util_1.getConfig();
        });
        it('returns error text', () => {
            config.errors = [
                {
                    depName: 'renovate.json',
                    message: 'Failed to parse',
                },
            ];
            const res = errors_warnings_1.getErrors(config);
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=errors-warnings.spec.js.map