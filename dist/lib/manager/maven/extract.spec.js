"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-template-curly-in-string */
const fs_1 = require("fs");
const upath_1 = require("upath");
const extract_1 = require("./extract");
const minimumContent = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/minimum.pom.xml`), 'utf8');
const simpleContent = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/simple.pom.xml`), 'utf8');
describe('manager/maven/extract', () => {
    describe('extractDependencies', () => {
        it('returns null for invalid XML', () => {
            expect(extract_1.extractPackage(undefined)).toBeNull();
            expect(extract_1.extractPackage('invalid xml content')).toBeNull();
            expect(extract_1.extractPackage('<foobar></foobar>')).toBeNull();
            expect(extract_1.extractPackage('<project></project>')).toBeNull();
        });
        it('extract dependencies from any XML position', () => {
            const res = extract_1.extractPackage(simpleContent);
            expect(res).toMatchSnapshot();
        });
        it('tries minimum manifests', () => {
            const res = extract_1.extractPackage(minimumContent);
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map