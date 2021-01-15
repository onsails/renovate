"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
describe('versioning/ubuntu', () => {
    // validation
    it('isValid', () => {
        expect(_1.api.isValid(undefined)).toBe(false);
        expect(_1.api.isValid(null)).toBe(false);
        expect(_1.api.isValid('')).toBe(false);
        expect(_1.api.isValid('xenial')).toBe(false);
        expect(_1.api.isValid('04.10')).toBe(true);
        expect(_1.api.isValid('05.04')).toBe(true);
        expect(_1.api.isValid('05.10')).toBe(true);
        expect(_1.api.isValid('6.06')).toBe(true);
        expect(_1.api.isValid('6.10')).toBe(true);
        expect(_1.api.isValid('7.04')).toBe(true);
        expect(_1.api.isValid('7.10')).toBe(true);
        expect(_1.api.isValid('8.04')).toBe(true);
        expect(_1.api.isValid('8.10')).toBe(true);
        expect(_1.api.isValid('9.04')).toBe(true);
        expect(_1.api.isValid('9.10')).toBe(true);
        expect(_1.api.isValid('10.04.4')).toBe(true);
        expect(_1.api.isValid('10.10')).toBe(true);
        expect(_1.api.isValid('11.04')).toBe(true);
        expect(_1.api.isValid('11.10')).toBe(true);
        expect(_1.api.isValid('12.04.5')).toBe(true);
        expect(_1.api.isValid('12.10')).toBe(true);
        expect(_1.api.isValid('13.04')).toBe(true);
        expect(_1.api.isValid('13.10')).toBe(true);
        expect(_1.api.isValid('14.04.6')).toBe(true);
        expect(_1.api.isValid('14.10')).toBe(true);
        expect(_1.api.isValid('15.04')).toBe(true);
        expect(_1.api.isValid('15.10')).toBe(true);
        expect(_1.api.isValid('16.04.7')).toBe(true);
        expect(_1.api.isValid('16.10')).toBe(true);
        expect(_1.api.isValid('17.04')).toBe(true);
        expect(_1.api.isValid('17.10')).toBe(true);
        expect(_1.api.isValid('18.04.5')).toBe(true);
        expect(_1.api.isValid('18.10')).toBe(true);
        expect(_1.api.isValid('19.04')).toBe(true);
        expect(_1.api.isValid('19.10')).toBe(true);
        expect(_1.api.isValid('20.04')).toBe(true);
        expect(_1.api.isValid('20.10')).toBe(true);
        expect(_1.api.isValid('2020.04')).toBe(false);
    });
    it('isCompatible', () => {
        expect(_1.api.isCompatible(undefined)).toBe(false);
        expect(_1.api.isCompatible(null)).toBe(false);
        expect(_1.api.isCompatible('')).toBe(false);
        expect(_1.api.isCompatible('04.10')).toBe(true);
        expect(_1.api.isCompatible('20.10')).toBe(true);
    });
    it('isSingleVersion', () => {
        expect(_1.api.isSingleVersion(undefined)).toBeNull();
        expect(_1.api.isSingleVersion(null)).toBeNull();
        expect(_1.api.isSingleVersion('')).toBeNull();
        expect(_1.api.isSingleVersion('20.04')).toBe(true);
        expect(_1.api.isSingleVersion('>=20.04')).toBeNull();
    });
    it('isStable', () => {
        expect(_1.api.isStable(undefined)).toBe(false);
        expect(_1.api.isStable(null)).toBe(false);
        expect(_1.api.isStable('')).toBe(false);
        expect(_1.api.isStable('04.10')).toBe(false);
        expect(_1.api.isStable('05.04')).toBe(false);
        expect(_1.api.isStable('05.10')).toBe(false);
        expect(_1.api.isStable('6.06')).toBe(false); // it's okay
        expect(_1.api.isStable('6.10')).toBe(false);
        expect(_1.api.isStable('7.04')).toBe(false);
        expect(_1.api.isStable('7.10')).toBe(false);
        expect(_1.api.isStable('8.04')).toBe(true);
        expect(_1.api.isStable('8.10')).toBe(false);
        expect(_1.api.isStable('9.04')).toBe(false);
        expect(_1.api.isStable('9.10')).toBe(false);
        expect(_1.api.isStable('10.04.4')).toBe(true);
        expect(_1.api.isStable('10.10')).toBe(false);
        expect(_1.api.isStable('11.04')).toBe(false);
        expect(_1.api.isStable('11.10')).toBe(false);
        expect(_1.api.isStable('12.04.5')).toBe(true);
        expect(_1.api.isStable('12.10')).toBe(false);
        expect(_1.api.isStable('13.04')).toBe(false);
        expect(_1.api.isStable('13.10')).toBe(false);
        expect(_1.api.isStable('14.04.6')).toBe(true);
        expect(_1.api.isStable('14.10')).toBe(false);
        expect(_1.api.isStable('15.04')).toBe(false);
        expect(_1.api.isStable('15.10')).toBe(false);
        expect(_1.api.isStable('16.04.7')).toBe(true);
        expect(_1.api.isStable('16.10')).toBe(false);
        expect(_1.api.isStable('17.04')).toBe(false);
        expect(_1.api.isStable('17.10')).toBe(false);
        expect(_1.api.isStable('18.04.5')).toBe(true);
        expect(_1.api.isStable('18.10')).toBe(false);
        expect(_1.api.isStable('19.04')).toBe(false);
        expect(_1.api.isStable('19.10')).toBe(false);
        expect(_1.api.isStable('20.04')).toBe(true);
        expect(_1.api.isStable('20.10')).toBe(false);
        expect(_1.api.isStable('42.01')).toBe(false);
        expect(_1.api.isStable('42.02')).toBe(false);
        expect(_1.api.isStable('42.03')).toBe(false);
        expect(_1.api.isStable('42.04')).toBe(true);
        expect(_1.api.isStable('42.05')).toBe(false);
        expect(_1.api.isStable('42.06')).toBe(false);
        expect(_1.api.isStable('42.07')).toBe(false);
        expect(_1.api.isStable('42.08')).toBe(false);
        expect(_1.api.isStable('42.09')).toBe(false);
        expect(_1.api.isStable('42.10')).toBe(false);
        expect(_1.api.isStable('42.11')).toBe(false);
        expect(_1.api.isStable('2020.04')).toBe(false);
    });
    it('isVersion', () => {
        expect(_1.api.isVersion(undefined)).toBe(false);
        expect(_1.api.isVersion(null)).toBe(false);
        expect(_1.api.isVersion('')).toBe(false);
        expect(_1.api.isVersion('02.10')).toBe(false);
        expect(_1.api.isVersion('04.10')).toBe(true);
        expect(_1.api.isVersion('05.04')).toBe(true);
        expect(_1.api.isVersion('6.06')).toBe(true);
        expect(_1.api.isVersion('8.04')).toBe(true);
        expect(_1.api.isVersion('9.04')).toBe(true);
        expect(_1.api.isVersion('10.04.4')).toBe(true);
        expect(_1.api.isVersion('12.04.5')).toBe(true);
        expect(_1.api.isVersion('13.04')).toBe(true);
        expect(_1.api.isVersion('14.04.6')).toBe(true);
        expect(_1.api.isVersion('15.04')).toBe(true);
        expect(_1.api.isVersion('16.04.7')).toBe(true);
        expect(_1.api.isVersion('16.10')).toBe(true);
        expect(_1.api.isVersion('17.04')).toBe(true);
        expect(_1.api.isVersion('18.04.5')).toBe(true);
        expect(_1.api.isVersion('18.10')).toBe(true);
        expect(_1.api.isVersion('20.04')).toBe(true);
        expect(_1.api.isVersion('20.10')).toBe(true);
        expect(_1.api.isVersion('30.11')).toBe(true);
        expect(_1.api.isVersion('2020.04')).toBe(false);
    });
    // digestion of version
    it('getMajor', () => {
        expect(_1.api.getMajor(undefined)).toBeNull();
        expect(_1.api.getMajor(null)).toBeNull();
        expect(_1.api.getMajor('')).toBeNull();
        expect(_1.api.getMajor('42')).toBeNull();
        expect(_1.api.getMajor('2020.04')).toBeNull();
        expect(_1.api.getMajor('04.10')).toBe(4);
        expect(_1.api.getMajor('18.04.5')).toBe(18);
        expect(_1.api.getMajor('20.04')).toBe(20);
    });
    it('getMinor', () => {
        expect(_1.api.getMinor(undefined)).toBeNull();
        expect(_1.api.getMinor(null)).toBeNull();
        expect(_1.api.getMinor('')).toBeNull();
        expect(_1.api.getMinor('42')).toBeNull();
        expect(_1.api.getMinor('2020.04')).toBeNull();
        expect(_1.api.getMinor('04.10')).toBe(10);
        expect(_1.api.getMinor('18.04.5')).toBe(4);
        expect(_1.api.getMinor('20.04')).toBe(4);
    });
    it('getPatch', () => {
        expect(_1.api.getPatch(undefined)).toBeNull();
        expect(_1.api.getPatch(null)).toBeNull();
        expect(_1.api.getPatch('')).toBeNull();
        expect(_1.api.getPatch('42')).toBeNull();
        expect(_1.api.getPatch('2020.04')).toBeNull();
        expect(_1.api.getPatch('04.10')).toBeNull();
        expect(_1.api.getPatch('18.04.5')).toBe(5);
        expect(_1.api.getPatch('20.04')).toBeNull();
    });
    // comparison
    it('equals', () => {
        expect(_1.api.equals('20.04', '2020.04')).toBe(false);
        expect(_1.api.equals('focal', '20.04')).toBe(false);
        expect(_1.api.equals('20.04', 'focal')).toBe(false);
        expect(_1.api.equals('19.10', '19.10')).toBe(true);
    });
    it('isGreaterThan', () => {
        expect(_1.api.isGreaterThan('20.04', '20.10')).toBe(false);
        expect(_1.api.isGreaterThan('20.10', '20.04')).toBe(true);
        expect(_1.api.isGreaterThan('19.10', '20.04')).toBe(false);
        expect(_1.api.isGreaterThan('20.04', '19.10')).toBe(true);
        expect(_1.api.isGreaterThan('16.04', '16.04.7')).toBe(false);
        expect(_1.api.isGreaterThan('16.04.7', '16.04')).toBe(true);
        expect(_1.api.isGreaterThan('16.04.1', '16.04.7')).toBe(false);
        expect(_1.api.isGreaterThan('16.04.7', '16.04.1')).toBe(true);
        expect(_1.api.isGreaterThan('19.10.1', '20.04.1')).toBe(false);
        expect(_1.api.isGreaterThan('20.04.1', '19.10.1')).toBe(true);
    });
    it('getSatisfyingVersion', () => {
        const versions = ['18.10', '19.04', '19.10', '20.04'];
        expect(_1.api.getSatisfyingVersion(versions, '2020.04')).toBeNull();
        expect(_1.api.getSatisfyingVersion(versions, 'foobar')).toBeNull();
        expect(_1.api.getSatisfyingVersion(versions, '20.04')).toBe('20.04');
        expect(_1.api.getSatisfyingVersion(versions, '19.10')).toBe('19.10');
        expect(_1.api.getSatisfyingVersion(versions, '04.10')).toBeNull();
    });
    it('minSatisfyingVersion', () => {
        const versions = ['18.10', '19.04', '19.10', '20.04'];
        expect(_1.api.minSatisfyingVersion(versions, '2020.04')).toBeNull();
        expect(_1.api.minSatisfyingVersion(versions, 'foobar')).toBeNull();
        expect(_1.api.minSatisfyingVersion(versions, '20.04')).toBe('20.04');
        expect(_1.api.minSatisfyingVersion(versions, '19.10')).toBe('19.10');
        expect(_1.api.minSatisfyingVersion(versions, '04.10')).toBeNull();
    });
    it('getNewValue simply returns toVersion', () => {
        expect(_1.api.getNewValue({ toVersion: 'foobar' })).toEqual('foobar');
    });
    it('sortVersions', () => {
        const sortedVersions = ['6.10', '17.03', '18.04', '18.04', '19.10'];
        const versions = [
            ...sortedVersions.slice(2),
            ...sortedVersions.slice(0, 2),
        ];
        expect(versions.sort(_1.api.sortVersions)).toEqual(sortedVersions);
    });
    it('matches', () => {
        expect(_1.api.matches('20.04', '2020.04')).toBe(false);
        expect(_1.api.matches('20.04', '20.04')).toBe(true);
        expect(_1.api.matches('20.04', '20.04.0')).toBe(false);
    });
});
//# sourceMappingURL=index.spec.js.map