"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-template-curly-in-string */
const fs_1 = require("fs");
const upath_1 = require("upath");
const extract_1 = require("./extract");
const depsEdn = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/deps.edn`), 'utf8');
describe('manager/deps-edn/extract', () => {
    it('extractPackageFile', () => {
        expect(extract_1.extractPackageFile(depsEdn)).toMatchSnapshot();
    });
});
//# sourceMappingURL=extract.spec.js.map