"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const upath_1 = __importDefault(require("upath"));
const _1 = require(".");
const sample = fs_extra_1.default.readFileSync(upath_1.default.resolve(__dirname, './__fixtures__/mix.exs'), 'utf-8');
describe('lib/manager/mix/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns empty for invalid dependency file', () => {
            expect(_1.extractPackageFile('nothing here')).toMatchSnapshot();
        });
        it('extracts all dependencies', () => {
            const res = _1.extractPackageFile(sample).deps;
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map