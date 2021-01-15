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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const upath_1 = __importDefault(require("upath"));
const file_1 = __importDefault(require("./config/__fixtures__/file"));
const file = __importStar(require("./file"));
describe('config/file', () => {
    describe('.getConfig()', () => {
        it('returns empty env', () => {
            expect(file.getConfig({ RENOVATE_CONFIG_FILE: 'dummylocation' })).toEqual({});
        });
        it('parses custom config file', () => {
            const configFile = upath_1.default.resolve(__dirname, './config/__fixtures__/file.js');
            expect(file.getConfig({ RENOVATE_CONFIG_FILE: configFile })).toEqual(file_1.default);
        });
        it('migrates', () => {
            const configFile = upath_1.default.resolve(__dirname, './config/__fixtures__/file2.js');
            const res = file.getConfig({ RENOVATE_CONFIG_FILE: configFile });
            expect(res).toMatchSnapshot();
            expect(res.rangeStrategy).toEqual('bump');
        });
        it('informs user when error in parsing config.js', () => {
            const configFile = upath_1.default.resolve(__dirname, './config/__fixtures__/file3.ts');
            const fileContent = `module.exports = {
        "platform": "github",
        "token":"abcdef",
        "logFileLevel": "warn",
        "logLevel": "info",
        "onboarding": false,
        "gitAuthor": "Renovate Bot <renovate@whitesourcesoftware.com>"
        "onboardingConfig": {
          "extends": ["config:base"],
        },
        "repositories": [ "test/test" ],
      };`;
            fs_1.default.writeFileSync(configFile, fileContent, { encoding: 'utf8' });
            expect(file.getConfig({ RENOVATE_CONFIG_FILE: configFile })).toStrictEqual({});
            fs_1.default.unlinkSync(configFile);
        });
    });
    it('handles when invalid file location is provided', () => {
        const configFile = upath_1.default.resolve(__dirname, './config/__fixtures__/file4.ts');
        expect(file.getConfig({ RENOVATE_CONFIG_FILE: configFile })).toStrictEqual({});
    });
});
//# sourceMappingURL=file.spec.js.map