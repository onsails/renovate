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
const httpMock = __importStar(require("../../../test/http-mock"));
const util_1 = require("../../../test/util");
const platforms_1 = require("../../constants/platforms");
const proxy_1 = require("../../proxy");
const hostRules = __importStar(require("../host-rules"));
const host_rules_1 = require("./host-rules");
const url = 'https://github.com';
jest.mock('global-agent');
describe(util_1.getName(__filename), () => {
    const options = {
        hostType: platforms_1.PLATFORM_TYPE_GITHUB,
    };
    beforeEach(() => {
        // reset module
        jest.resetAllMocks();
        delete process.env.HTTP_PROXY;
        // clean up hostRules
        hostRules.clear();
        hostRules.add({
            hostType: platforms_1.PLATFORM_TYPE_GITHUB,
            token: 'token',
        });
        hostRules.add({
            hostType: platforms_1.PLATFORM_TYPE_GITEA,
            password: 'password',
        });
        httpMock.reset();
        httpMock.setup();
    });
    afterEach(() => {
        delete process.env.HTTP_PROXY;
    });
    it('adds token', () => {
        expect(host_rules_1.applyHostRules(url, { ...options })).toMatchInlineSnapshot(`
      Object {
        "hostType": "github",
        "token": "token",
      }
    `);
    });
    it('adds auth', () => {
        expect(host_rules_1.applyHostRules(url, { hostType: platforms_1.PLATFORM_TYPE_GITEA }))
            .toMatchInlineSnapshot(`
      Object {
        "hostType": "gitea",
        "password": "password",
        "username": undefined,
      }
    `);
    });
    it('skips', () => {
        expect(host_rules_1.applyHostRules(url, { ...options, token: 'xxx' }))
            .toMatchInlineSnapshot(`
      Object {
        "hostType": "github",
        "token": "xxx",
      }
    `);
    });
    it('uses http2', () => {
        hostRules.add({ enableHttp2: true });
        expect(host_rules_1.applyHostRules(url, { ...options, token: 'xxx' }))
            .toMatchInlineSnapshot(`
      Object {
        "hostType": "github",
        "http2": true,
        "token": "xxx",
      }
    `);
    });
    it('disables http2', () => {
        process.env.HTTP_PROXY = 'http://proxy';
        proxy_1.bootstrap();
        hostRules.add({ enableHttp2: true });
        expect(host_rules_1.applyHostRules(url, { ...options, token: 'xxx' }))
            .toMatchInlineSnapshot(`
      Object {
        "hostType": "github",
        "token": "xxx",
      }
    `);
    });
});
//# sourceMappingURL=host-rules.spec.js.map