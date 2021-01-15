"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const upath_1 = require("upath");
const _1 = require(".");
const input = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/sample.txt`), 'utf8');
describe('manager/cdnurl/extract', () => {
    it('extractPackageFile', () => {
        expect(_1.extractPackageFile(input)).toMatchSnapshot();
    });
});
//# sourceMappingURL=extract.spec.js.map