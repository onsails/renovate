"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const upath_1 = __importDefault(require("upath"));
const _1 = require(".");
const simplePodfile = fs_extra_1.default.readFileSync(upath_1.default.resolve(__dirname, './__fixtures__/Podfile.simple'), 'utf-8');
const complexPodfile = fs_extra_1.default.readFileSync(upath_1.default.resolve(__dirname, './__fixtures__/Podfile.complex'), 'utf-8');
describe('lib/manager/cocoapods/extract', () => {
    describe('extractPackageFile()', () => {
        it('extracts all dependencies', () => {
            const simpleResult = _1.extractPackageFile(simplePodfile).deps;
            expect(simpleResult).toMatchSnapshot();
            const complexResult = _1.extractPackageFile(complexPodfile).deps;
            expect(complexResult).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map