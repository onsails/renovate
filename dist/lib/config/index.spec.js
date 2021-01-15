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
const upath_1 = __importDefault(require("upath"));
const fs_1 = require("../util/fs");
const argv_1 = __importDefault(require("./config/__fixtures__/argv"));
const defaults_1 = require("./defaults");
jest.mock('../datasource/npm');
try {
    jest.mock('../../config.js');
}
catch (err) {
    // file does not exist
}
const defaultConfig = defaults_1.getConfig();
describe('config/index', () => {
    describe('.parseConfigs(env, defaultArgv)', () => {
        let configParser;
        let defaultArgv;
        let defaultEnv;
        beforeEach(async () => {
            jest.resetModules();
            configParser = await Promise.resolve().then(() => __importStar(require('./index')));
            defaultArgv = argv_1.default();
            defaultEnv = { RENOVATE_CONFIG_FILE: 'abc' };
            jest.mock('delay', () => Promise.resolve());
        });
        it('supports token in env', async () => {
            const env = { ...defaultEnv, RENOVATE_TOKEN: 'abc' };
            const parsedConfig = await configParser.parseConfigs(env, defaultArgv);
            expect(parsedConfig).toContainEntries([['token', 'abc']]);
        });
        it('supports token in CLI options', async () => {
            defaultArgv = defaultArgv.concat([
                '--token=abc',
                '--pr-footer=custom',
                '--log-context=abc123',
            ]);
            const parsedConfig = await configParser.parseConfigs(defaultEnv, defaultArgv);
            expect(parsedConfig).toContainEntries([
                ['token', 'abc'],
                ['prFooter', 'custom'],
                ['logContext', 'abc123'],
                ['customPrFooter', true],
            ]);
        });
        it('supports forceCli', async () => {
            defaultArgv = defaultArgv.concat(['--force-cli=false']);
            const env = {
                ...defaultEnv,
                RENOVATE_TOKEN: 'abc',
            };
            const parsedConfig = await configParser.parseConfigs(env, defaultArgv);
            expect(parsedConfig).toContainEntries([
                ['token', 'abc'],
                ['force', null],
            ]);
            expect(parsedConfig).not.toContainKey('configFile');
        });
        it('supports config.force', async () => {
            const configPath = upath_1.default.join(__dirname, 'config/__fixtures__/with-force.js');
            const env = {
                ...defaultEnv,
                RENOVATE_CONFIG_FILE: configPath,
            };
            const parsedConfig = await configParser.parseConfigs(env, defaultArgv);
            expect(parsedConfig).toContainEntries([
                ['token', 'abcdefg'],
                [
                    'force',
                    {
                        schedule: null,
                    },
                ],
            ]);
        });
        it('reads private key from file', async () => {
            const privateKeyPath = upath_1.default.join(__dirname, 'keys/__fixtures__/private.pem');
            const env = {
                ...defaultEnv,
                RENOVATE_PRIVATE_KEY_PATH: privateKeyPath,
            };
            const expected = await fs_1.readFile(privateKeyPath);
            const parsedConfig = await configParser.parseConfigs(env, defaultArgv);
            expect(parsedConfig).toContainEntries([['privateKey', expected]]);
        });
        it('supports Bitbucket username/passwod', async () => {
            defaultArgv = defaultArgv.concat([
                '--platform=bitbucket',
                '--username=user',
                '--password=pass',
            ]);
            const parsedConfig = await configParser.parseConfigs(defaultEnv, defaultArgv);
            expect(parsedConfig).toContainEntries([
                ['platform', 'bitbucket'],
                ['username', 'user'],
                ['password', 'pass'],
            ]);
        });
        it('massages trailing slash into endpoint', async () => {
            defaultArgv = defaultArgv.concat([
                '--endpoint=https://github.renovatebot.com/api/v3',
            ]);
            const parsed = await configParser.parseConfigs(defaultEnv, defaultArgv);
            expect(parsed.endpoint).toEqual('https://github.renovatebot.com/api/v3/');
        });
    });
    describe('mergeChildConfig(parentConfig, childConfig)', () => {
        it('merges', async () => {
            const parentConfig = { ...defaultConfig };
            const childConfig = {
                foo: 'bar',
                rangeStrategy: 'replace',
                lockFileMaintenance: {
                    schedule: ['on monday'],
                },
            };
            const configParser = await Promise.resolve().then(() => __importStar(require('./index')));
            const config = configParser.mergeChildConfig(parentConfig, childConfig);
            expect(config.foo).toEqual('bar');
            expect(config.rangeStrategy).toEqual('replace');
            expect(config.lockFileMaintenance.schedule).toEqual(['on monday']);
            expect(config.lockFileMaintenance).toMatchSnapshot();
        });
        it('merges packageRules', async () => {
            const parentConfig = { ...defaultConfig };
            Object.assign(parentConfig, {
                packageRules: [{ a: 1 }, { a: 2 }],
            });
            const childConfig = {
                packageRules: [{ a: 3 }, { a: 4 }],
            };
            const configParser = await Promise.resolve().then(() => __importStar(require('./index')));
            const config = configParser.mergeChildConfig(parentConfig, childConfig);
            expect(config.packageRules.map((rule) => rule.a)).toMatchObject([
                1,
                2,
                3,
                4,
            ]);
        });
        it('merges constraints', async () => {
            const parentConfig = { ...defaultConfig };
            Object.assign(parentConfig, {
                constraints: {
                    node: '>=12',
                    npm: '^6.0.0',
                },
            });
            const childConfig = {
                constraints: {
                    node: '<15',
                },
            };
            const configParser = await Promise.resolve().then(() => __importStar(require('./index')));
            const config = configParser.mergeChildConfig(parentConfig, childConfig);
            expect(config.constraints).toMatchSnapshot();
            expect(config.constraints.node).toEqual('<15');
        });
        it('handles null parent packageRules', async () => {
            const parentConfig = { ...defaultConfig };
            Object.assign(parentConfig, {
                packageRules: null,
            });
            const childConfig = {
                packageRules: [{ a: 3 }, { a: 4 }],
            };
            const configParser = await Promise.resolve().then(() => __importStar(require('./index')));
            const config = configParser.mergeChildConfig(parentConfig, childConfig);
            expect(config.packageRules).toHaveLength(2);
        });
        it('handles null child packageRules', async () => {
            const parentConfig = { ...defaultConfig };
            parentConfig.packageRules = [{ a: 3 }, { a: 4 }];
            const configParser = await Promise.resolve().then(() => __importStar(require('./index')));
            const config = configParser.mergeChildConfig(parentConfig, {});
            expect(config.packageRules).toHaveLength(2);
        });
        it('handles undefined childConfig', async () => {
            const parentConfig = { ...defaultConfig };
            const configParser = await Promise.resolve().then(() => __importStar(require('./index')));
            const config = configParser.mergeChildConfig(parentConfig, undefined);
            expect(config).toMatchObject(parentConfig);
        });
        it('getManagerConfig()', async () => {
            const parentConfig = { ...defaultConfig };
            const configParser = await Promise.resolve().then(() => __importStar(require('./index')));
            const config = configParser.getManagerConfig(parentConfig, 'npm');
            expect(config).toContainEntries([
                ['fileMatch', ['(^|/)package.json$']],
                ['rollbackPrs', true],
            ]);
            expect(configParser.getManagerConfig(parentConfig, 'html')).toContainEntries([['fileMatch', ['\\.html?$']]]);
        });
        it('filterConfig()', async () => {
            const parentConfig = { ...defaultConfig };
            const configParser = await Promise.resolve().then(() => __importStar(require('./index')));
            const config = configParser.filterConfig(parentConfig, 'pr');
            expect(config).toBeObject();
        });
    });
});
//# sourceMappingURL=index.spec.js.map