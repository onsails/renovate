"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generic_1 = require("./generic");
describe('loose/utils', () => {
    const optionalFunctions = [
        'isLessThanRange',
        'valueToVersion',
        'constructor',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'should',
        'toLocaleString',
        'toString',
        'valueOf',
    ];
    function getAllPropertyNames(obj) {
        const props = [];
        let o = obj;
        do {
            Object.getOwnPropertyNames(o).forEach((prop) => {
                if (!props.includes(prop)) {
                    props.push(prop);
                }
            });
            // eslint-disable-next-line no-cond-assign
        } while ((o = Object.getPrototypeOf(o)));
        return props;
    }
    describe('GenericVersioningApi', () => {
        class DummyScheme extends generic_1.GenericVersioningApi {
            // eslint-disable-next-line class-methods-use-this
            _compare(_version, _other) {
                return _version ? _version.localeCompare(_other) : 0;
            }
            // eslint-disable-next-line class-methods-use-this
            _parse(_version) {
                return _version === 'test' ? null : { release: [1, 0, 0] };
            }
        }
        const api = new DummyScheme();
        const schemeKeys = getAllPropertyNames(api)
            .filter((val) => !optionalFunctions.includes(val) && !val.startsWith('_'))
            .filter((val) => !['minSatisfyingVersion', 'getSatisfyingVersion'].includes(val))
            .sort();
        for (const key of schemeKeys) {
            it(`${key}`, () => {
                expect(api[key]()).toMatchSnapshot();
            });
        }
        it('getMajor is null', () => {
            expect(api.getMajor('test')).toBeNull();
        });
        it('isLessThanRange', () => {
            expect(api.isLessThanRange('', '')).toBeFalsy();
        });
        it('minSatisfyingVersion', () => {
            expect(api.minSatisfyingVersion([''], '')).toBeNull();
        });
        it('getSatisfyingVersion', () => {
            expect(api.getSatisfyingVersion([''], '')).toBeNull();
        });
    });
});
//# sourceMappingURL=utils.spec.js.map