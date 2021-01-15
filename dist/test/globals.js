"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nock_1 = __importDefault(require("nock"));
require("jest-extended");
jest.mock('../lib/platform', () => ({
    platform: jest.createMockFromModule('../lib/platform/github'),
    initPlatform: jest.fn(),
    getPlatformList: jest.fn(),
}));
jest.mock('../lib/logger');
beforeAll(() => {
    nock_1.default.disableNetConnect();
});
//# sourceMappingURL=globals.js.map