"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
const _1 = require(".");
describe('semver.getNewValue()', () => {
    let dtLocal;
    beforeEach(() => {
        dtLocal = luxon_1.DateTime.local;
    });
    afterEach(() => {
        luxon_1.DateTime.local = dtLocal;
    });
    it('returns normalized toVersion', () => {
        expect(_1.api.getNewValue({
            currentValue: '1.0.0',
            rangeStrategy: 'replace',
            fromVersion: '1.0.0',
            toVersion: 'v1.1.0',
        })).toEqual('1.1.0');
    });
    it('returns range', () => {
        expect(_1.api.getNewValue({
            currentValue: '~8.0.0',
            rangeStrategy: 'replace',
            fromVersion: '8.0.2',
            toVersion: 'v8.2.0',
        })).toEqual('~8.2.0');
    });
    it('isStable', () => {
        const t1 = luxon_1.DateTime.fromISO('2020-09-01');
        const t2 = luxon_1.DateTime.fromISO('2021-06-01');
        [
            ['16.0.0', t1, false],
            ['15.0.0', t1, false],
            ['14.9.0', t1, false],
            ['14.0.0', t2, true],
            ['12.0.3', t1, true],
            ['v12.0.3', t1, true],
            ['12.0.3a', t1, false],
            ['11.0.0', t1, false],
            ['10.0.0', t1, true],
            ['10.0.999', t1, true],
            ['10.1.0', t1, true],
            ['10.0.0a', t1, false],
            ['9.0.0', t1, false],
        ].forEach(([version, time, result]) => {
            luxon_1.DateTime.local = (...args) => args.length ? dtLocal.apply(luxon_1.DateTime, args) : time;
            expect(_1.isStable(version)).toBe(result);
        });
    });
});
//# sourceMappingURL=index.spec.js.map