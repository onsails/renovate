"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../test/util");
const _onboarding = __importStar(require("../onboarding/branch"));
const _apis = __importStar(require("./apis"));
const _config = __importStar(require("./config"));
const _1 = require(".");
jest.mock('../../../util/git');
jest.mock('../onboarding/branch');
jest.mock('../configured');
jest.mock('../init/apis');
jest.mock('../init/config');
jest.mock('../init/semantic');
const apis = util_1.mocked(_apis);
const config = util_1.mocked(_config);
const onboarding = util_1.mocked(_onboarding);
describe('workers/repository/init', () => {
    describe('initRepo', () => {
        it('runs', async () => {
            apis.initApis.mockResolvedValue({});
            onboarding.checkOnboardingBranch.mockResolvedValueOnce({});
            config.getRepoConfig.mockResolvedValueOnce({});
            config.mergeRenovateConfig.mockResolvedValueOnce({});
            const renovateConfig = await _1.initRepo({});
            expect(renovateConfig).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map