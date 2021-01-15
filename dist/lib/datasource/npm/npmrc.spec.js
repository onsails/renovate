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
const util_1 = require("../../../test/util");
const _sanitize = __importStar(require("../../util/sanitize"));
const npmrc_1 = require("./npmrc");
jest.mock('../../util/sanitize');
const sanitize = util_1.mocked(_sanitize);
describe(util_1.getName(__filename), () => {
    beforeEach(() => {
        delete process.env.NPM_TOKEN;
        delete global.trustLevel;
        npmrc_1.setNpmrc('');
        jest.resetAllMocks();
    });
    it('sanitize _auth', () => {
        npmrc_1.setNpmrc('_auth=test');
        expect(sanitize.add).toHaveBeenCalledWith('test');
        expect(sanitize.add).toHaveBeenCalledTimes(1);
    });
    it('sanitize _authtoken', () => {
        // eslint-disable-next-line no-template-curly-in-string
        npmrc_1.setNpmrc('//registry.test.com:_authToken=test\n_authToken=${NPM_TOKEN}');
        expect(sanitize.add).toHaveBeenCalledWith('test');
        expect(sanitize.add).toHaveBeenCalledTimes(1);
    });
    it('sanitize _password', () => {
        npmrc_1.setNpmrc(`registry=https://test.org\n//test.org/:username=test\n//test.org/:_password=dGVzdA==`);
        expect(sanitize.add).toHaveBeenNthCalledWith(1, 'dGVzdA==');
        expect(sanitize.add).toHaveBeenNthCalledWith(2, 'test');
        expect(sanitize.add).toHaveBeenNthCalledWith(3, 'dGVzdDp0ZXN0');
        expect(sanitize.add).toHaveBeenCalledTimes(3);
    });
    it('sanitize _authtoken with high trust', () => {
        global.trustLevel = 'high';
        process.env.TEST_TOKEN = 'test';
        npmrc_1.setNpmrc(
        // eslint-disable-next-line no-template-curly-in-string
        '//registry.test.com:_authToken=${TEST_TOKEN}\n_authToken=\nregistry=http://localhost');
        expect(sanitize.add).toHaveBeenCalledWith('test');
        expect(sanitize.add).toHaveBeenCalledTimes(1);
    });
    it('ignores localhost', () => {
        npmrc_1.setNpmrc(`registry=http://localhost`);
        expect(sanitize.add).toHaveBeenCalledTimes(0);
        expect(npmrc_1.getNpmrc()).toBeNull();
    });
});
//# sourceMappingURL=npmrc.spec.js.map