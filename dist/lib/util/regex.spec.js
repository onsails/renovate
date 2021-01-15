"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line import/no-extraneous-dependencies
const re2_1 = __importDefault(require("re2"));
const error_messages_1 = require("../constants/error-messages");
const regex_1 = require("./regex");
describe('util/regex', () => {
    beforeEach(() => {
        jest.resetModules();
    });
    it('uses RE2', () => {
        expect(regex_1.regEx('foo')).toBeInstanceOf(re2_1.default);
    });
    it('throws unsafe 2', () => {
        expect(() => regex_1.regEx(`x++`)).toThrow(error_messages_1.CONFIG_VALIDATION);
    });
    it('Falls back to RegExp', () => {
        jest.doMock('re2', () => {
            throw new Error();
        });
        const regex = require('./regex');
        expect(regex.regEx('foo')).toBeInstanceOf(RegExp);
    });
});
//# sourceMappingURL=regex.spec.js.map