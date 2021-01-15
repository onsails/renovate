"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jest_mock_extended_1 = require("jest-mock-extended");
const util_1 = require("../../../test/util");
const error_messages_1 = require("../../constants/error-messages");
const types_1 = require("../../types");
const error_config_1 = require("./error-config");
jest.mock('../../platform');
let config;
beforeEach(() => {
    jest.resetAllMocks();
    config = util_1.getConfig();
});
describe('workers/repository/error-config', () => {
    describe('raiseConfigWarningIssue()', () => {
        it('creates issues', async () => {
            const error = new Error(error_messages_1.CONFIG_VALIDATION);
            error.configFile = 'package.json';
            error.validationMessage = 'some-message';
            util_1.platform.ensureIssue.mockResolvedValueOnce('created');
            const res = await error_config_1.raiseConfigWarningIssue(config, error);
            expect(res).toBeUndefined();
        });
        it('creates issues (dryRun)', async () => {
            const error = new Error(error_messages_1.CONFIG_VALIDATION);
            error.configFile = 'package.json';
            error.validationMessage = 'some-message';
            util_1.platform.ensureIssue.mockResolvedValueOnce('created');
            const res = await error_config_1.raiseConfigWarningIssue({ ...config, dryRun: true }, error);
            expect(res).toBeUndefined();
        });
        it('handles onboarding', async () => {
            const error = new Error(error_messages_1.CONFIG_VALIDATION);
            error.configFile = 'package.json';
            error.validationMessage = 'some-message';
            util_1.platform.getBranchPr.mockResolvedValue({
                ...jest_mock_extended_1.mock(),
                number: 1,
                state: types_1.PrState.Open,
            });
            const res = await error_config_1.raiseConfigWarningIssue(config, error);
            expect(res).toBeUndefined();
        });
        it('handles onboarding (dryRun)', async () => {
            const error = new Error(error_messages_1.CONFIG_VALIDATION);
            error.configFile = 'package.json';
            error.validationMessage = 'some-message';
            util_1.platform.getBranchPr.mockResolvedValue({
                ...jest_mock_extended_1.mock(),
                number: 1,
                state: types_1.PrState.Open,
            });
            const res = await error_config_1.raiseConfigWarningIssue({ ...config, dryRun: true }, error);
            expect(res).toBeUndefined();
        });
    });
});
//# sourceMappingURL=error-config.spec.js.map