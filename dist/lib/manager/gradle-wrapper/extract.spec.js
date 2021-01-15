"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const upath_1 = require("upath");
const extract_1 = require("./extract");
const propertiesFile1 = fs_1.readFileSync(upath_1.resolve(__dirname, './__fixtures__/gradle-wrapper-1.properties'), 'utf8');
const propertiesFile2 = fs_1.readFileSync(upath_1.resolve(__dirname, './__fixtures__/gradle-wrapper-2.properties'), 'utf8');
const whitespacePropertiesFile = fs_1.readFileSync(upath_1.resolve(__dirname, './__fixtures__/gradle-wrapper-whitespace.properties'), 'utf8');
describe('lib/manager/gradle-wrapper/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile('nothing here')).toBeNull();
        });
        it('extracts bin version line', () => {
            const res = extract_1.extractPackageFile(propertiesFile1);
            expect(res.deps).toMatchSnapshot();
        });
        it('extracts all version line', () => {
            const res = extract_1.extractPackageFile(propertiesFile2);
            expect(res.deps).toMatchSnapshot();
        });
        it('handles whitespace', () => {
            const res = extract_1.extractPackageFile(whitespacePropertiesFile);
            expect(res.deps).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map