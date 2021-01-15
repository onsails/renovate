"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const upath_1 = require("upath");
const _1 = require(".");
const sample = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/sample.html`), 'utf8');
const nothing = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/nothing.html`), 'utf8');
describe('manager/html/extract', () => {
    it('extractPackageFile', () => {
        expect(_1.extractPackageFile(sample)).toMatchSnapshot();
    });
    it('returns null', () => {
        expect(_1.extractPackageFile(nothing)).toBeNull();
    });
});
//# sourceMappingURL=extract.spec.js.map