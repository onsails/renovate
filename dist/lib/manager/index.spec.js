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
const modules_1 = require("../util/modules");
const manager = __importStar(require("."));
describe('manager', () => {
    describe('get()', () => {
        it('gets something', () => {
            expect(manager.get('dockerfile', 'extractPackageFile')).not.toBeNull();
        });
    });
    describe('getLanguageList()', () => {
        it('gets', () => {
            expect(manager.getLanguageList()).not.toBeNull();
        });
    });
    describe('getManagerList()', () => {
        it('gets', () => {
            expect(manager.getManagerList()).not.toBeNull();
        });
    });
    it('validates', () => {
        function validate(module) {
            if (!module.defaultConfig) {
                return false;
            }
            if (!module.extractPackageFile && !module.extractAllPackageFiles) {
                return false;
            }
            return true;
        }
        const mgrs = manager.getManagers();
        const loadedMgr = modules_1.loadModules(__dirname, validate);
        expect(Array.from(mgrs.keys())).toEqual(Object.keys(loadedMgr));
        for (const name of mgrs.keys()) {
            const mgr = mgrs.get(name);
            expect(validate(mgr)).toBe(true);
        }
    });
    describe('extractAllPackageFiles()', () => {
        it('returns null', async () => {
            manager.getManagers().set('dummy', {
                defaultConfig: {},
            });
            expect(await manager.extractAllPackageFiles('unknown', {}, [])).toBeNull();
            expect(await manager.extractAllPackageFiles('dummy', {}, [])).toBeNull();
        });
        it('returns non-null', async () => {
            manager.getManagers().set('dummy', {
                defaultConfig: {},
                extractAllPackageFiles: () => Promise.resolve([]),
            });
            expect(await manager.extractAllPackageFiles('dummy', {}, [])).not.toBeNull();
        });
        afterEach(() => {
            manager.getManagers().delete('dummy');
        });
    });
    describe('extractPackageFile()', () => {
        it('returns null', () => {
            manager.getManagers().set('dummy', {
                defaultConfig: {},
            });
            expect(manager.extractPackageFile('unknown', null)).toBeNull();
            expect(manager.extractPackageFile('dummy', null)).toBeNull();
        });
        it('returns non-null', () => {
            manager.getManagers().set('dummy', {
                defaultConfig: {},
                extractPackageFile: () => Promise.resolve({ deps: [] }),
            });
            expect(manager.extractPackageFile('dummy', null)).not.toBeNull();
        });
        afterEach(() => {
            manager.getManagers().delete('dummy');
        });
    });
    describe('getPackageUpdates', () => {
        it('returns null', () => {
            manager.getManagers().set('dummy', {
                defaultConfig: {},
            });
            expect(manager.getPackageUpdates('unknown', null)).toBeNull();
            expect(manager.getPackageUpdates('dummy', null)).toBeNull();
        });
        it('returns non-null', () => {
            manager.getManagers().set('dummy', {
                defaultConfig: {},
                getPackageUpdates: () => Promise.resolve([]),
            });
            expect(manager.getPackageUpdates('dummy', {})).not.toBeNull();
        });
        afterEach(() => {
            manager.getManagers().delete('dummy');
        });
    });
    describe('getRangeStrategy', () => {
        it('returns null', () => {
            manager.getManagers().set('dummy', {
                defaultConfig: {},
            });
            expect(manager.getRangeStrategy({ manager: 'unknown', rangeStrategy: 'auto' })).toBeNull();
        });
        it('returns non-null', () => {
            manager.getManagers().set('dummy', {
                defaultConfig: {},
                getRangeStrategy: () => 'replace',
            });
            expect(manager.getRangeStrategy({ manager: 'dummy', rangeStrategy: 'auto' })).not.toBeNull();
            manager.getManagers().set('dummy', {
                defaultConfig: {},
            });
            expect(manager.getRangeStrategy({ manager: 'dummy', rangeStrategy: 'auto' })).not.toBeNull();
            expect(manager.getRangeStrategy({ manager: 'dummy', rangeStrategy: 'bump' })).not.toBeNull();
        });
        afterEach(() => {
            manager.getManagers().delete('dummy');
        });
    });
});
//# sourceMappingURL=index.spec.js.map