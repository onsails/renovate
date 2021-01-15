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
const jest_mock_extended_1 = require("jest-mock-extended");
const util_1 = require("../../../test/util");
const _process = __importStar(require("./process"));
const _1 = require(".");
const process = util_1.mocked(_process);
jest.mock('./init');
jest.mock('./process');
jest.mock('./result');
jest.mock('./error');
describe('workers/repository', () => {
    describe('renovateRepository()', () => {
        let config;
        beforeEach(() => {
            config = util_1.getConfig();
        });
        it('runs', async () => {
            process.extractDependencies.mockResolvedValue(jest_mock_extended_1.mock());
            const res = await _1.renovateRepository(config);
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map