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
const definitions_1 = require("../config/definitions");
const modules_1 = require("../util/modules");
const common_1 = require("./common");
const generic_1 = require("./loose/generic");
const semverVersioning = __importStar(require("./semver"));
const allVersioning = __importStar(require("."));
const supportedSchemes = definitions_1.getOptions().find((option) => option.name === 'versioning').allowedValues;
describe('allVersioning.get(versioning)', () => {
    it('has api', () => {
        expect(Object.keys(allVersioning.get('semver')).sort()).toMatchSnapshot();
    });
    it('validates', () => {
        function validate(module, name) {
            // eslint-disable-next-line new-cap
            const mod = common_1.isVersioningApiConstructor(module) ? new module() : module;
            // TODO: test required api
            if (!mod.isValid || !mod.isVersion) {
                throw Error(`Missing api on ${name}`);
            }
            return true;
        }
        const vers = allVersioning.getVersionings();
        const loadedVers = modules_1.loadModules(__dirname);
        expect(Array.from(vers.keys())).toEqual(Object.keys(loadedVers));
        for (const name of vers.keys()) {
            const ver = vers.get(name);
            expect(validate(ver, name)).toBe(true);
        }
    });
    it('should fallback to semver', () => {
        expect(allVersioning.get(undefined)).toBe(allVersioning.get(semverVersioning.id));
        expect(allVersioning.get('unknown')).toBe(allVersioning.get(semverVersioning.id));
    });
    it('should accept config', () => {
        expect(allVersioning.get('semver:test')).toBeDefined();
    });
    describe('should return the same interface', () => {
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
        const npmApi = Object.keys(allVersioning.get(semverVersioning.id))
            .filter((val) => !optionalFunctions.includes(val))
            .sort();
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
        for (const supportedScheme of supportedSchemes) {
            it(supportedScheme, () => {
                const schemeKeys = getAllPropertyNames(allVersioning.get(supportedScheme))
                    .filter((val) => !optionalFunctions.includes(val) && !val.startsWith('_'))
                    .sort();
                expect(schemeKeys).toEqual(npmApi);
                const apiOrCtor = require('./' + supportedScheme).api;
                if (allVersioning.isVersioningApiConstructor(apiOrCtor)) {
                    return;
                }
                expect(Object.keys(apiOrCtor).sort()).toEqual(Object.keys(allVersioning.get(supportedScheme)).sort());
            });
        }
        it('dummy', () => {
            class DummyScheme extends generic_1.GenericVersioningApi {
                // eslint-disable-next-line class-methods-use-this
                _compare(_version, _other) {
                    throw new Error('Method not implemented.');
                }
                // eslint-disable-next-line class-methods-use-this
                _parse(_version) {
                    throw new Error('Method not implemented.');
                }
            }
            const api = new DummyScheme();
            const schemeKeys = getAllPropertyNames(api)
                .filter((val) => !optionalFunctions.includes(val) && !val.startsWith('_'))
                .sort();
            expect(schemeKeys).toEqual(npmApi);
        });
    });
});
//# sourceMappingURL=index.spec.js.map