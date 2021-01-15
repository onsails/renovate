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
const error_messages_1 = require("../constants/error-messages");
const platforms_1 = require("../constants/platforms");
const modules_1 = require("../util/modules");
const platform = __importStar(require("."));
jest.unmock('.');
describe('platform', () => {
    beforeEach(() => {
        jest.resetModules();
    });
    it('validates', () => {
        function validate(module, name) {
            // TODO: test required api
            if (!module.initPlatform) {
                throw Error(`Missing api on ${name}`);
            }
            return true;
        }
        const platforms = platform.getPlatforms();
        const loadedMgr = modules_1.loadModules(__dirname, null, (m) => !['utils', 'git'].includes(m));
        expect(Array.from(platforms.keys())).toEqual(Object.keys(loadedMgr));
        for (const name of platforms.keys()) {
            const value = platforms.get(name);
            expect(validate(value, name)).toBe(true);
        }
    });
    it('throws if no platform', () => {
        expect(() => platform.platform.initPlatform({})).toThrow(error_messages_1.PLATFORM_NOT_FOUND);
    });
    it('throws if wrong platform', async () => {
        const config = { platform: 'wrong', username: 'abc', password: '123' };
        await expect(platform.initPlatform(config)).rejects.toThrow();
    });
    it('initializes', async () => {
        const config = {
            platform: platforms_1.PLATFORM_TYPE_BITBUCKET,
            gitAuthor: 'user@domain.com',
            username: 'abc',
            password: '123',
        };
        expect(await platform.initPlatform(config)).toMatchSnapshot();
    });
    it('initializes no author', async () => {
        const config = {
            platform: platforms_1.PLATFORM_TYPE_BITBUCKET,
            username: 'abc',
            password: '123',
        };
        expect(await platform.initPlatform(config)).toMatchSnapshot();
    });
    it('returns null if empty email given', () => {
        expect(platform.parseGitAuthor(undefined)).toBeNull();
    });
    it('parses bot email', () => {
        expect(platform.parseGitAuthor('some[bot]@users.noreply.github.com')).toMatchSnapshot();
    });
    it('parses bot name and email', () => {
        expect(platform.parseGitAuthor('"some[bot]" <some[bot]@users.noreply.github.com>')).toMatchSnapshot();
    });
    it('escapes names', () => {
        expect(platform.parseGitAuthor('name [what] <name@what.com>').name).toMatchSnapshot();
    });
    it('gives up', () => {
        expect(platform.parseGitAuthor('a.b.c')).toBeNull();
    });
});
//# sourceMappingURL=index.spec.js.map