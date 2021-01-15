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
const _fs = __importStar(require("fs-extra"));
const util_1 = require("../../../../test/util");
const repositoryCache = __importStar(require("."));
jest.mock('fs-extra');
const fs = util_1.mocked(_fs);
describe('lib/util/cache/repository', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    const config = {
        cacheDir: '/tmp/renovate/cache/',
        platform: 'github',
        repository: 'abc/def',
    };
    it('catches and returns', async () => {
        await repositoryCache.initialize({});
        expect(fs.readFile.mock.calls).toHaveLength(0);
    });
    it('returns if cache not enabled', async () => {
        await repositoryCache.initialize({
            ...config,
            repositoryCache: 'disabled',
        });
        expect(fs.readFile.mock.calls).toHaveLength(0);
    });
    it('resets if invalid', async () => {
        fs.readFile.mockResolvedValueOnce('{}');
        await repositoryCache.initialize({
            ...config,
            repositoryCache: 'enabled',
        });
        expect(repositoryCache.getCache()).toEqual({
            repository: 'abc/def',
            scan: {},
        });
    });
    it('reads from cache and finalizes', async () => {
        fs.readFile.mockResolvedValueOnce('{"repository":"abc/def"}');
        await repositoryCache.initialize({
            ...config,
            repositoryCache: 'enabled',
        });
        await repositoryCache.finalize();
        expect(fs.readFile.mock.calls).toHaveLength(1);
        expect(fs.outputFile.mock.calls).toHaveLength(1);
    });
    it('gets', () => {
        expect(repositoryCache.getCache()).toEqual({ scan: {} });
    });
});
//# sourceMappingURL=index.spec.js.map