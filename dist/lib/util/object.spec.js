"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("./object");
describe('util/object', () => {
    beforeEach(() => {
        jest.resetModules();
    });
    it('finds key in regular object', () => {
        expect(object_1.hasKey('foo', { foo: true })).toBeTrue();
    });
    it('detects missing key in regular object', () => {
        expect(object_1.hasKey('foo', { bar: true })).toBeFalse();
    });
    it('returns false for wrong instance type', () => {
        expect(object_1.hasKey('foo', 'i-am-not-an-object')).toBeFalse();
    });
});
//# sourceMappingURL=object.spec.js.map