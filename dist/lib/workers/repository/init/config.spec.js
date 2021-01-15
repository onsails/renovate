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
const _migrateAndValidate = __importStar(require("../../../config/migrate-validate"));
const config_1 = require("./config");
jest.mock('../../../util/fs');
jest.mock('../../../util/git');
const migrateAndValidate = util_1.mocked(_migrateAndValidate);
let config;
beforeEach(() => {
    jest.resetAllMocks();
    config = util_1.getConfig();
    config.errors = [];
    config.warnings = [];
});
jest.mock('../../../config/migrate-validate');
describe('workers/repository/init/config', () => {
    describe('detectRepoFileConfig()', () => {
        it('returns config if not found', () => {
            util_1.git.getFileList.mockResolvedValue(['package.json']);
            util_1.fs.readLocalFile.mockResolvedValue('{}');
            expect(config_1.detectRepoFileConfig()).toMatchSnapshot();
        });
        it('uses package.json config if found', () => {
            util_1.git.getFileList.mockResolvedValue(['package.json']);
            const pJson = JSON.stringify({
                name: 'something',
                renovate: {
                    prHourlyLimit: 10,
                },
            });
            util_1.fs.readLocalFile.mockResolvedValue(pJson);
            expect(config_1.detectRepoFileConfig()).toMatchSnapshot();
        });
        it('returns error if cannot parse', () => {
            util_1.git.getFileList.mockResolvedValue(['package.json', 'renovate.json']);
            util_1.fs.readLocalFile.mockResolvedValue('cannot parse');
            expect(config_1.detectRepoFileConfig()).toMatchSnapshot();
        });
        it('throws error if duplicate keys', () => {
            util_1.git.getFileList.mockResolvedValue(['package.json', '.renovaterc']);
            util_1.fs.readLocalFile.mockResolvedValue('{ "enabled": true, "enabled": false }');
            expect(config_1.detectRepoFileConfig()).toMatchSnapshot();
        });
        it('finds and parse renovate.json5', () => {
            util_1.git.getFileList.mockResolvedValue(['package.json', 'renovate.json5']);
            util_1.fs.readLocalFile.mockResolvedValue(`{
        // this is json5 format
      }`);
            expect(config_1.detectRepoFileConfig()).toMatchSnapshot();
        });
        it('finds .github/renovate.json', () => {
            util_1.git.getFileList.mockResolvedValue([
                'package.json',
                '.github/renovate.json',
            ]);
            util_1.fs.readLocalFile.mockResolvedValue('{}');
            expect(config_1.detectRepoFileConfig()).toMatchSnapshot();
        });
        it('finds .gitlab/renovate.json', () => {
            util_1.git.getFileList.mockResolvedValue([
                'package.json',
                '.gitlab/renovate.json',
            ]);
            util_1.fs.readLocalFile.mockResolvedValue('{}');
            expect(config_1.detectRepoFileConfig()).toMatchSnapshot();
        });
        it('finds .renovaterc.json', () => {
            util_1.git.getFileList.mockResolvedValue(['package.json', '.renovaterc.json']);
            util_1.fs.readLocalFile.mockResolvedValue('{}');
            expect(config_1.detectRepoFileConfig()).toMatchSnapshot();
        });
    });
    describe('checkForRepoConfigError', () => {
        it('returns if no error', () => {
            expect(config_1.checkForRepoConfigError({})).toBeUndefined();
        });
        it('throws on error', () => {
            expect(() => config_1.checkForRepoConfigError({
                configFileParseError: { validationError: '', validationMessage: '' },
            })).toThrow();
        });
    });
    describe('mergeRenovateConfig()', () => {
        it('throws error if misconfigured', async () => {
            util_1.git.getFileList.mockResolvedValue(['package.json', '.renovaterc.json']);
            util_1.fs.readLocalFile.mockResolvedValue('{}');
            migrateAndValidate.migrateAndValidate.mockResolvedValueOnce({
                errors: [{ depName: 'dep', message: 'test error' }],
            });
            let e;
            try {
                await config_1.mergeRenovateConfig(config);
            }
            catch (err) {
                e = err;
            }
            expect(e).toBeDefined();
            expect(e).toMatchSnapshot();
        });
        it('continues if no errors', async () => {
            util_1.git.getFileList.mockResolvedValue(['package.json', '.renovaterc.json']);
            util_1.fs.readLocalFile.mockResolvedValue('{}');
            migrateAndValidate.migrateAndValidate.mockResolvedValue({
                warnings: [],
                errors: [],
            });
            config.extends = [':automergeDisabled'];
            expect(await config_1.mergeRenovateConfig(config)).not.toBeUndefined();
        });
    });
});
//# sourceMappingURL=config.spec.js.map