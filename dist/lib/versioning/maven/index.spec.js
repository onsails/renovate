"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compare_1 = require("./compare");
const _1 = __importDefault(require("."));
const { isValid, isVersion, isStable, getMajor, getMinor, getPatch, matches, getNewValue, } = _1.default;
describe('versioning/maven/compare', () => {
    it('returns equality', () => {
        expect(compare_1.compare('1.0.0', '1')).toEqual(0);
        expect(compare_1.compare('1-a1', '1-alpha-1')).toEqual(0);
        expect(compare_1.compare('1-b1', '1-beta-1')).toEqual(0);
        expect(compare_1.compare('1.0.0', '1.ga')).toEqual(0);
        expect(compare_1.compare('1-ga', '1.ga')).toEqual(0);
        expect(compare_1.compare('1-ga-1', '1-1')).toEqual(0);
        expect(compare_1.compare('1.final', '1.0')).toEqual(0);
        expect(compare_1.compare('1', '1.0')).toEqual(0);
        expect(compare_1.compare('1.', '1-')).toEqual(0);
        expect(compare_1.compare('1.0.0-0.0.0', '1-final')).toEqual(0);
        expect(compare_1.compare('1-1.foo-bar1baz-.1', '1-1.foo-bar-1-baz-0.1')).toEqual(0);
        expect(compare_1.compare('1.0ALPHA1', '1.0-a1')).toEqual(0);
        expect(compare_1.compare('1.0Alpha1', '1.0-a1')).toEqual(0);
        expect(compare_1.compare('1.0AlphA1', '1.0-a1')).toEqual(0);
        expect(compare_1.compare('1.0BETA1', '1.0-b1')).toEqual(0);
        expect(compare_1.compare('1.0MILESTONE1', '1.0-m1')).toEqual(0);
        expect(compare_1.compare('1.0RC1', '1.0-cr1')).toEqual(0);
        expect(compare_1.compare('1.0GA', '1.0')).toEqual(0);
        expect(compare_1.compare('1.0FINAL', '1.0')).toEqual(0);
        expect(compare_1.compare('1.0-SNAPSHOT', '1-snapshot')).toEqual(0);
        expect(compare_1.compare('1.0-SNAP', '1-snapshot')).toEqual(0);
        expect(compare_1.compare('1.0alpha1', '1.0-a1')).toEqual(0);
        expect(compare_1.compare('1.0alpha-1', '1.0-a1')).toEqual(0);
        expect(compare_1.compare('1.0beta1', '1.0-b1')).toEqual(0);
        expect(compare_1.compare('1.0beta-1', '1.0-b1')).toEqual(0);
        expect(compare_1.compare('1.0milestone1', '1.0-m1')).toEqual(0);
        expect(compare_1.compare('1.0milestone-1', '1.0-m1')).toEqual(0);
        expect(compare_1.compare('1.0rc1', '1.0-cr1')).toEqual(0);
        expect(compare_1.compare('1.0rc-1', '1.0-cr1')).toEqual(0);
        expect(compare_1.compare('1.0ga', '1.0')).toEqual(0);
        expect(compare_1.compare('1-0.ga', '1.0')).toEqual(0);
        expect(compare_1.compare('1.0-final', '1.0')).toEqual(0);
        expect(compare_1.compare('1-0-ga', '1.0')).toEqual(0);
        expect(compare_1.compare('1-0-final', '1-0')).toEqual(0);
        expect(compare_1.compare('1-0', '1.0')).toEqual(0);
        expect(compare_1.compare('v1.2.3', '1.2.3')).toEqual(0);
        expect(compare_1.compare('0.0-1552', '0.0-1552')).toEqual(0);
        expect(compare_1.compare('v0.0-1552', '0.0-1552')).toEqual(0);
        expect(compare_1.compare('v0.0.1', '0.0.1')).toEqual(0);
        expect(compare_1.compare('5.0.7', '5.0.7.RELEASE')).toEqual(0);
        expect(compare_1.compare('Hoxton.RELEASE', 'hoxton')).toEqual(0);
        expect(compare_1.compare('Hoxton.SR1', 'hoxton.sr-1')).toEqual(0);
    });
    it('returns less than', () => {
        expect(compare_1.compare('1', '1.1')).toEqual(-1);
        expect(compare_1.compare('1', '2')).toEqual(-1);
        expect(compare_1.compare('1-snapshot', '1')).toEqual(-1);
        expect(compare_1.compare('1-snap', '1')).toEqual(-1);
        expect(compare_1.compare('1.2.3-snap1', '1.2.3-snap2')).toEqual(-1);
        expect(compare_1.compare('1', '1-sp')).toEqual(-1);
        expect(compare_1.compare('1-foo2', '1-foo10')).toEqual(-1);
        expect(compare_1.compare('1-m1', '1-milestone-2')).toEqual(-1);
        expect(compare_1.compare('1.foo', '1-foo')).toEqual(-1);
        expect(compare_1.compare('1-foo', '1-1')).toEqual(-1);
        expect(compare_1.compare('1-alpha.1', '1-beta.1')).toEqual(-1);
        expect(compare_1.compare('1-1', '1.1')).toEqual(-1);
        expect(compare_1.compare('1-ga', '1-ap')).toEqual(-1);
        expect(compare_1.compare('1-ga.1', '1-sp.1')).toEqual(-1);
        expect(compare_1.compare('1-sp-1', '1-ga-1')).toEqual(-1);
        expect(compare_1.compare('1-cr1', '1')).toEqual(-1);
        expect(compare_1.compare('0.0-1552', '1.10.520')).toEqual(-1);
        expect(compare_1.compare('0.0.1', '999')).toEqual(-1);
        expect(compare_1.compare('1.3-RC1-groovy-2.5', '1.3-groovy-2.5')).toEqual(-1);
        expect(compare_1.compare('1-abc', '1-xyz')).toEqual(-1);
        expect(compare_1.compare('Hoxton.RELEASE', 'Hoxton.SR1')).toEqual(-1);
    });
    it('returns greater than', () => {
        expect(compare_1.compare('1.1', '1')).toEqual(1);
        expect(compare_1.compare('2', '1')).toEqual(1);
        expect(compare_1.compare('1', '1-snapshot')).toEqual(1);
        expect(compare_1.compare('1', '1-snap')).toEqual(1);
        expect(compare_1.compare('1.2.3-snap2', '1.2.3-snap1')).toEqual(1);
        expect(compare_1.compare('1-sp', '1')).toEqual(1);
        expect(compare_1.compare('1-foo10', '1-foo2')).toEqual(1);
        expect(compare_1.compare('1-milestone-2', '1-m1')).toEqual(1);
        expect(compare_1.compare('1-foo', '1.foo')).toEqual(1);
        expect(compare_1.compare('1-1', '1-foo')).toEqual(1);
        expect(compare_1.compare('1-beta.1', '1-alpha.1')).toEqual(1);
        expect(compare_1.compare('1.1', '1-1')).toEqual(1);
        expect(compare_1.compare('1-sp', '1-ga')).toEqual(1);
        expect(compare_1.compare('1-sp.1', '1-ga.1')).toEqual(1);
        expect(compare_1.compare('1-ga-1', '1-sp-1')).toEqual(1);
        expect(compare_1.compare('1', '1-cr1')).toEqual(1);
        expect(compare_1.compare('1.10.520', '0.0-1552')).toEqual(1);
        expect(compare_1.compare('999', '0.0.1')).toEqual(1);
        expect(compare_1.compare('1.3-groovy-2.5', '1.3-RC1-groovy-2.5')).toEqual(1);
        expect(compare_1.compare('1-xyz', '1-abc')).toEqual(1);
        expect(compare_1.compare('Hoxton.SR1', 'Hoxton.RELEASE')).toEqual(1);
    });
    const invalidRanges = [
        '1.2.3-SNAPSHOT',
        '[]',
        '[,]',
        '(',
        '[',
        ',',
        '[1.0',
        '1.0]',
        '[1.0],',
        ',[1.0]',
        '(,1.1),(1.0,)',
        '(0,1.1),(1.0,2.0)',
        '(0,1.1),(,2.0)',
        '(,1.0],,[1.2,)',
        '(,1.0],[1.2,),',
        '[1.5,]',
        '[2.0,1.0)',
        '[1.2,1.3],1.4',
        '[1.2,,1.3]',
        '[1.3,1.2]',
        '[1,[2,3],4]',
        '[,1.0]',
    ];
    it('filters out incorrect ranges', () => {
        invalidRanges.forEach((rangeStr) => {
            const range = compare_1.parseRange(rangeStr);
            expect(range).toBeNull();
            expect(compare_1.rangeToStr(range)).toBeNull();
        });
    });
    it('parses version ranges and translates them back to string', () => {
        const presetRanges = {
            ...invalidRanges.reduce((acc, str) => ({ ...acc, [str]: null }), {}),
            '[1.0]': [
                {
                    leftType: 'INCLUDING_POINT',
                    leftValue: '1.0',
                    leftBracket: '[',
                    rightType: 'INCLUDING_POINT',
                    rightValue: '1.0',
                    rightBracket: ']',
                },
            ],
            '(,1.0]': [
                {
                    leftType: 'EXCLUDING_POINT',
                    leftValue: null,
                    leftBracket: '(',
                    rightType: 'INCLUDING_POINT',
                    rightValue: '1.0',
                    rightBracket: ']',
                },
            ],
            '[1.2,1.3]': [
                {
                    leftType: 'INCLUDING_POINT',
                    leftValue: '1.2',
                    leftBracket: '[',
                    rightType: 'INCLUDING_POINT',
                    rightValue: '1.3',
                    rightBracket: ']',
                },
            ],
            '[1.0,2.0)': [
                {
                    leftType: 'INCLUDING_POINT',
                    leftValue: '1.0',
                    leftBracket: '[',
                    rightType: 'EXCLUDING_POINT',
                    rightValue: '2.0',
                    rightBracket: ')',
                },
            ],
            '[1.5,)': [
                {
                    leftType: 'INCLUDING_POINT',
                    leftValue: '1.5',
                    leftBracket: '[',
                    rightType: 'EXCLUDING_POINT',
                    rightValue: null,
                    rightBracket: ')',
                },
            ],
            '(,1.0],[1.2,)': [
                {
                    leftType: 'EXCLUDING_POINT',
                    leftValue: null,
                    leftBracket: '(',
                    rightType: 'INCLUDING_POINT',
                    rightValue: '1.0',
                    rightBracket: ']',
                },
                {
                    leftType: 'INCLUDING_POINT',
                    leftValue: '1.2',
                    leftBracket: '[',
                    rightType: 'EXCLUDING_POINT',
                    rightValue: null,
                    rightBracket: ')',
                },
            ],
            '(,1.1),(1.1,)': [
                {
                    leftType: 'EXCLUDING_POINT',
                    leftValue: null,
                    leftBracket: '(',
                    rightType: 'EXCLUDING_POINT',
                    rightValue: '1.1',
                    rightBracket: ')',
                },
                {
                    leftType: 'EXCLUDING_POINT',
                    leftValue: '1.1',
                    leftBracket: '(',
                    rightType: 'EXCLUDING_POINT',
                    rightValue: null,
                    rightBracket: ')',
                },
            ],
        };
        Object.keys(presetRanges).forEach((rangeStr) => {
            const presetValue = presetRanges[rangeStr];
            const fullRange = compare_1.parseRange(rangeStr);
            expect(presetValue).toEqual(fullRange);
            if (fullRange === null) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(presetValue).toBeNull();
            }
            else {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(compare_1.rangeToStr(fullRange)).toEqual(rangeStr);
            }
        });
    });
    it('extends ranges with new versions', () => {
        const sample = [
            ['[1.2.3]', '1.2.3', '[1.2.3]'],
            ['[1.2.3]', '1.2.4', '[1.2.4]'],
            ['[1.0.0,1.2.3]', '0.0.1', '[1.0.0,1.2.3]'],
            ['[1.0.0,1.2.3]', '1.2.4', '[1.0.0,1.2.4]'],
            ['[1.0.0,1.2.23]', '1.1.0', '[1.0.0,1.2.23]'],
            ['(,1.0]', '2.0', '(,2.0]'],
            ['],1.0]', '2.0', '],2.0]'],
            ['(,1.0)', '2.0', '(,3.0)'],
            ['],1.0[', '2.0', '],3.0['],
            ['[1.0,1.2.3],[1.3,1.5)', '1.2.4', '[1.0,1.2.4],[1.3,1.5)'],
            ['[1.0,1.2.3],[1.3,1.5[', '1.2.4', '[1.0,1.2.4],[1.3,1.5['],
            ['[1.2.3,)', '1.2.4', '[1.2.4,)'],
            ['[1.2.3,[', '1.2.4', '[1.2.4,['],
            ['[1.2.3,]', '1.2.4', '[1.2.3,]'],
            ['[0.21,0.22)', '0.20.21', '[0.21,0.22)'],
            ['[0.21,0.22)', '0.21.1', '[0.21,0.22)'],
            ['[0.21,0.22.0)', '0.22.1', '[0.21,0.22.2)'],
            ['[0.21,0.22)', '0.23', '[0.23,0.24)'],
            ['[1.8,1.9)', '1.9.0.1', '[1.9,1.10)'],
            ['[1.8a,1.9)', '1.9.0.1', '[1.8a,1.10)'],
            ['[1.8,1.9.0)', '1.9.0.1', '[1.8,1.10.0)'],
            ['[1.8,1.9.0.0)', '1.9.0.1', '[1.8,1.9.0.2)'],
            ['[1.8,1.9.0.0)', '1.10.1', '[1.8,1.10.2.0)'],
            ['[1.8,1.9)', '1.9.1', '[1.9,1.10)'],
            ['[1.8,1.9)', '1.10.0', '[1.10,1.11)'],
            ['[1.8,1.9)', '1.10.1', '[1.10,1.11)'],
            ['(,1.0.0]', '2.0.0', '(,2.0.0]'],
            ['(,1.0]', '2.0.0', '(,2.0]'],
            ['(,1]', '2.0.0', '(,2]'],
            ['(,1.0.0-foobar]', '2.0.0', '(,2.0.0]'],
        ];
        sample.forEach(([oldRepr, newValue, newRepr]) => {
            expect(compare_1.autoExtendMavenRange(oldRepr, newValue)).toEqual(newRepr);
        });
    });
});
describe('versioning/maven/index', () => {
    it('returns valid', () => {
        expect(isValid('1.0.0')).toBe(true);
        expect(isValid('[1.12.6,1.18.6]')).toBe(true);
        expect(isValid(undefined)).toBe(false);
    });
    it('validates version string', () => {
        expect(isVersion('')).toBe(false);
        expect(isVersion('1.0.0')).toBe(true);
        expect(isVersion('0')).toBe(true);
        expect(isVersion('0.1-2-sp')).toBe(true);
        expect(isVersion('1-final')).toBe(true);
        expect(isVersion('1-foo')).toBe(true);
        expect(isVersion('v1.0.0')).toBe(true);
        expect(isVersion('x1.0.0')).toBe(true);
        expect(isVersion('2.1.1.RELEASE')).toBe(true);
        expect(isVersion('Greenwich.SR1')).toBe(true);
        expect(isVersion('.1')).toBe(false);
        expect(isVersion('1.')).toBe(false);
        expect(isVersion('-1')).toBe(false);
        expect(isVersion('1-')).toBe(false);
        expect(isVersion('[1.12.6,1.18.6]')).toBe(false);
        expect(isVersion('RELEASE')).toBe(false);
        expect(isVersion('release')).toBe(false);
        expect(isVersion('LATEST')).toBe(false);
        expect(isVersion('latest')).toBe(false);
        expect(isVersion('foobar')).toBe(true);
    });
    it('checks if version is stable', () => {
        expect(isStable('')).toBeNull();
        expect(isStable('foobar')).toBe(true);
        expect(isStable('final')).toBe(true);
        expect(isStable('1')).toBe(true);
        expect(isStable('1.2')).toBe(true);
        expect(isStable('1.2.3')).toBe(true);
        expect(isStable('1.2.3.4')).toBe(true);
        expect(isStable('v1.2.3.4')).toBe(true);
        expect(isStable('1-alpha-1')).toBe(false);
        expect(isStable('1-b1')).toBe(false);
        expect(isStable('1-foo')).toBe(true);
        expect(isStable('1-final-1.0.0')).toBe(true);
        expect(isStable('1-release')).toBe(true);
        expect(isStable('1.final')).toBe(true);
        expect(isStable('1.0milestone1')).toBe(false);
        expect(isStable('1-sp')).toBe(true);
        expect(isStable('1-ga-1')).toBe(true);
        expect(isStable('1.3-groovy-2.5')).toBe(true);
        expect(isStable('1.3-RC1-groovy-2.5')).toBe(false);
        expect(isStable('Hoxton.RELEASE')).toBe(true);
        expect(isStable('Hoxton.SR')).toBe(true);
        expect(isStable('Hoxton.SR1')).toBe(true);
    });
    it('returns major version', () => {
        expect(getMajor('')).toBeNull();
        expect(getMajor('1')).toEqual(1);
        expect(getMajor('1.2')).toEqual(1);
        expect(getMajor('1.2.3')).toEqual(1);
        expect(getMajor('v1.2.3')).toEqual(1);
        expect(getMajor('1rc42')).toEqual(1);
    });
    it('returns minor version', () => {
        expect(getMinor('')).toBeNull();
        expect(getMinor('1')).toEqual(0);
        expect(getMinor('1.2')).toEqual(2);
        expect(getMinor('1.2.3')).toEqual(2);
        expect(getMinor('v1.2.3')).toEqual(2);
        expect(getMinor('1.2.3.4')).toEqual(2);
        expect(getMinor('1-rc42')).toEqual(0);
    });
    it('returns patch version', () => {
        expect(getPatch('')).toBeNull();
        expect(getPatch('1')).toEqual(0);
        expect(getPatch('1.2')).toEqual(0);
        expect(getPatch('1.2.3')).toEqual(3);
        expect(getPatch('v1.2.3')).toEqual(3);
        expect(getPatch('1.2.3.4')).toEqual(3);
        expect(getPatch('1-rc10')).toEqual(0);
        expect(getPatch('1-rc42-1')).toEqual(0);
    });
    it('matches against maven ranges', () => {
        expect(matches('0', '[0,1]')).toBe(true);
        expect(matches('1', '[0,1]')).toBe(true);
        expect(matches('0', '(0,1)')).toBe(false);
        expect(matches('1', '(0,1)')).toBe(false);
        expect(matches('1', '(0,2)')).toBe(true);
        expect(matches('1', '[0,2]')).toBe(true);
        expect(matches('1', '(,1]')).toBe(true);
        expect(matches('1', '(,1)')).toBe(false);
        expect(matches('1', '[1,)')).toBe(true);
        expect(matches('1', '(1,)')).toBe(false);
        expect(matches('1', '(,1),(1,)')).toBe(false);
        expect(matches('1', '(0,1),(1,2)')).toBe(false);
        expect(matches('1.0.0.RC9.2', '(,1.0.0.RC9.2),(1.0.0.RC9.2,)')).toBe(false);
        expect(matches('1.0.0-RC14', '(,1.0.0.RC9.2),(1.0.0.RC9.2,)')).toBe(true);
        expect(matches('0', '')).toBe(false);
        expect(matches('1', '1')).toBe(true);
        expect(matches('1', '(1')).toBe(false);
    });
    it('api', () => {
        expect(_1.default.isGreaterThan('1.1', '1')).toBe(true);
        expect(_1.default.getSatisfyingVersion(['1'], '1')).toBe('1');
        expect(_1.default.getNewValue({
            currentValue: '1',
            rangeStrategy: null,
            fromVersion: null,
            toVersion: '1.1',
        })).toBe('1.1');
        expect(_1.default.getNewValue({
            currentValue: '[1.2.3,]',
            rangeStrategy: null,
            fromVersion: null,
            toVersion: '1.2.4',
        })).toBe('[1.2.3,]');
    });
    it('pins maven ranges', () => {
        const sample = [
            ['[1.2.3]', '1.2.3', '1.2.4'],
            ['[1.0.0,1.2.3]', '1.0.0', '1.2.4'],
            ['[1.0.0,1.2.23]', '1.0.0', '1.2.23'],
            ['(,1.0]', '0.0.1', '2.0'],
            ['],1.0]', '0.0.1', '2.0'],
            ['(,1.0)', '0.1', '2.0'],
            ['],1.0[', '2.0', '],2.0['],
            ['[1.0,1.2],[1.3,1.5)', '1.0', '1.2.4'],
            ['[1.0,1.2],[1.3,1.5[', '1.0', '1.2.4'],
            ['[1.2.3,)', '1.2.3', '1.2.4'],
            ['[1.2.3,[', '1.2.3', '1.2.4'],
        ];
        sample.forEach(([currentValue, fromVersion, toVersion]) => {
            expect(getNewValue({
                currentValue,
                rangeStrategy: 'pin',
                fromVersion,
                toVersion,
            })).toEqual(toVersion);
        });
    });
});
//# sourceMappingURL=index.spec.js.map