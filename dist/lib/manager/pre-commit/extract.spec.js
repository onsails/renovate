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
const fs_1 = require("fs");
const util_1 = require("../../../test/util");
const _hostRules = __importStar(require("../../util/host-rules"));
const extract_1 = require("./extract");
jest.mock('../../util/host-rules');
const hostRules = util_1.mocked(_hostRules);
const filename = '.pre-commit.yaml';
const complexPrecommitConfig = fs_1.readFileSync('lib/manager/pre-commit/__fixtures__/complex.pre-commit-config.yaml', 'utf8');
const examplePrecommitConfig = fs_1.readFileSync('lib/manager/pre-commit/__fixtures__/.pre-commit-config.yaml', 'utf8');
const emptyReposPrecommitConfig = fs_1.readFileSync('lib/manager/pre-commit/__fixtures__/empty_repos.pre-commit-config.yaml', 'utf8');
const noReposPrecommitConfig = fs_1.readFileSync('lib/manager/pre-commit/__fixtures__/no_repos.pre-commit-config.yaml', 'utf8');
const invalidRepoPrecommitConfig = fs_1.readFileSync('lib/manager/pre-commit/__fixtures__/invalid_repo.pre-commit-config.yaml', 'utf8');
const enterpriseGitPrecommitConfig = fs_1.readFileSync('lib/manager/pre-commit/__fixtures__/enterprise.pre-commit-config.yaml', 'utf8');
describe('lib/manager/precommit/extract', () => {
    describe('extractPackageFile()', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });
        it('returns null for invalid yaml file content', () => {
            const result = extract_1.extractPackageFile('nothing here: [', filename);
            expect(result).toBeNull();
        });
        it('returns null for empty yaml file content', () => {
            const result = extract_1.extractPackageFile('', filename);
            expect(result).toBeNull();
        });
        it('returns null for no file content', () => {
            const result = extract_1.extractPackageFile(null, filename);
            expect(result).toBeNull();
        });
        it('returns null for no repos', () => {
            const result = extract_1.extractPackageFile(noReposPrecommitConfig, filename);
            expect(result).toBeNull();
        });
        it('returns null for empty repos', () => {
            const result = extract_1.extractPackageFile(emptyReposPrecommitConfig, filename);
            expect(result).toBeNull();
        });
        it('returns null for invalid repo', () => {
            const result = extract_1.extractPackageFile(invalidRepoPrecommitConfig, filename);
            expect(result).toBeNull();
        });
        it('extracts from values.yaml correctly with same structure as "pre-commit sample-config"', () => {
            const result = extract_1.extractPackageFile(examplePrecommitConfig, filename);
            expect(result).toMatchSnapshot();
        });
        it('extracts from complex config file correctly', () => {
            const result = extract_1.extractPackageFile(complexPrecommitConfig, filename);
            expect(result).toMatchSnapshot();
        });
        it('can handle private git repos', () => {
            hostRules.find.mockReturnValue({ token: 'value' });
            const result = extract_1.extractPackageFile(enterpriseGitPrecommitConfig, filename);
            expect(result).toMatchSnapshot();
        });
        it('can handle invalid private git repos', () => {
            hostRules.find.mockReturnValue({});
            const result = extract_1.extractPackageFile(enterpriseGitPrecommitConfig, filename);
            expect(result).toMatchSnapshot();
        });
        it('can handle unknown private git repos', () => {
            // First attemp returns a result
            hostRules.find.mockReturnValueOnce({ token: 'value' });
            // But all subsequent checks (those with hostType), then fail:
            hostRules.find.mockReturnValue({});
            const result = extract_1.extractPackageFile(enterpriseGitPrecommitConfig, filename);
            expect(result).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map