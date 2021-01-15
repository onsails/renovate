"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../test/util");
const _1 = require(".");
jest.mock('./file');
jest.mock('./redis');
describe(util_1.getName(__filename), () => {
    it('returns undefined if not initialized', async () => {
        expect(await _1.get('test', 'missing-key')).toBeUndefined();
        expect(await _1.set('test', 'some-key', 'some-value', 5)).toBeUndefined();
    });
    it('sets and gets file', async () => {
        _1.init({ cacheDir: 'some-dir' });
        expect(await _1.set('some-namespace', 'some-key', 'some-value', 1)).toBeUndefined();
        expect(await _1.get('some-namespace', 'unknown-key')).toBeUndefined();
    });
    it('sets and gets redis', async () => {
        _1.init({ redisUrl: 'some-url' });
        expect(await _1.set('some-namespace', 'some-key', 'some-value', 1)).toBeUndefined();
        expect(await _1.get('some-namespace', 'unknown-key')).toBeUndefined();
        expect(_1.cleanup({ redisUrl: 'some-url' })).toBeUndefined();
    });
});
//# sourceMappingURL=index.spec.js.map