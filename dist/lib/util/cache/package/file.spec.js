"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const file_1 = require("./file");
describe('lib/util/cache/global/file', () => {
    it('returns if uninitiated', async () => {
        await file_1.set('test', 'key', 1234);
        expect(await file_1.get('test', 'key')).toBeUndefined();
    });
    it('gets null', async () => {
        file_1.init(os_1.default.tmpdir());
        expect(await file_1.get('test', 'missing-key')).toBeUndefined();
    });
    it('sets and gets', async () => {
        file_1.init(os_1.default.tmpdir());
        await file_1.set('test', 'key', 1234);
        expect(await file_1.get('test', 'key')).toBe(1234);
    });
    it('expires', async () => {
        file_1.init(os_1.default.tmpdir());
        await file_1.set('test', 'key', 1234, -5);
        expect(await file_1.get('test', 'key')).toBeUndefined();
    });
});
//# sourceMappingURL=file.spec.js.map