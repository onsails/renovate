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
const nock_1 = __importDefault(require("nock"));
const npm = __importStar(require("."));
jest.mock('registry-auth-token');
jest.mock('delay');
describe('config/presets/npm', () => {
    delete process.env.NPM_TOKEN;
    beforeEach(() => {
        jest.resetAllMocks();
        global.trustLevel = 'low';
        nock_1.default.cleanAll();
    });
    afterEach(() => {
        delete process.env.RENOVATE_CACHE_NPM_MINUTES;
    });
    it('should throw if no package', async () => {
        nock_1.default('https://registry.npmjs.org').get('/nopackage').reply(404);
        await expect(npm.getPreset({ packageName: 'nopackage', presetName: 'default' })).rejects.toThrow(/dep not found/);
    });
    it('should throw if no renovate-config', async () => {
        const presetPackage = {
            name: 'norenovateconfig',
            versions: {
                '0.0.1': {
                    foo: 1,
                },
                '0.0.2': {
                    foo: 2,
                    deprecated: 'This is deprecated',
                },
            },
            repository: {
                type: 'git',
                url: 'git://github.com/renovateapp/dummy.git',
            },
            'dist-tags': {
                latest: '0.0.2',
            },
            time: {
                '0.0.1': '2018-05-06T07:21:53+02:00',
                '0.0.2': '2018-05-07T07:21:53+02:00',
            },
        };
        nock_1.default('https://registry.npmjs.org')
            .get('/norenovateconfig')
            .reply(200, presetPackage);
        await expect(npm.getPreset({ packageName: 'norenovateconfig', presetName: 'default' })).rejects.toThrow(/preset renovate-config not found/);
    });
    it('should throw if preset name not found', async () => {
        const presetPackage = {
            name: 'presetnamenotfound',
            versions: {
                '0.0.1': {
                    foo: 1,
                },
                '0.0.2': {
                    foo: 2,
                    deprecated: 'This is deprecated',
                    'renovate-config': { default: { rangeStrategy: 'auto' } },
                },
            },
            repository: {
                type: 'git',
                url: 'git://github.com/renovateapp/dummy.git',
            },
            'dist-tags': {
                latest: '0.0.2',
            },
            time: {
                '0.0.1': '2018-05-06T07:21:53+02:00',
                '0.0.2': '2018-05-07T07:21:53+02:00',
            },
        };
        nock_1.default('https://registry.npmjs.org')
            .get('/presetnamenotfound')
            .reply(200, presetPackage);
        await expect(npm.getPreset({
            packageName: 'presetnamenotfound',
            presetName: 'missing',
        })).rejects.toThrow(/preset not found/);
    });
    it('should return preset', async () => {
        const presetPackage = {
            name: 'workingpreset',
            versions: {
                '0.0.1': {
                    foo: 1,
                },
                '0.0.2': {
                    foo: 2,
                    deprecated: 'This is deprecated',
                    'renovate-config': { default: { rangeStrategy: 'auto' } },
                },
            },
            repository: {
                type: 'git',
                url: 'https://github.com/renovateapp/dummy.git',
            },
            'dist-tags': {
                latest: '0.0.2',
            },
            time: {
                '0.0.1': '2018-05-06T07:21:53+02:00',
                '0.0.2': '2018-05-07T07:21:53+02:00',
            },
        };
        nock_1.default('https://registry.npmjs.org')
            .get('/workingpreset')
            .reply(200, presetPackage);
        const res = await npm.getPreset({ packageName: 'workingpreset' });
        expect(res).toMatchSnapshot();
    });
});
//# sourceMappingURL=index.spec.js.map