"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const upath_1 = require("upath");
const extract_1 = require("./extract");
const pkgContent = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/SamplePackage.swift`), 'utf8');
describe('lib/manager/swift', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty content', () => {
            expect(extract_1.extractPackageFile(null)).toBeNull();
            expect(extract_1.extractPackageFile(``)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[]`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:["foobar"]`)).toBeNull();
        });
        it('returns null for invalid content', () => {
            expect(extract_1.extractPackageFile(`dependen`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies!: `)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies :`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies...`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:!`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[...`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[]`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package.package(`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(asdf`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package]`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(]`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(.package(`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(]`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url],`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url.package(]`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:.package(`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:]`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"fo`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"fo]`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://example.com/something.git"]`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git"]`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git".package(]`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git", ]`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git", .package(]`)).toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git", .exact(]`)).toBeNull();
        });
        it('parses packages with invalid versions', () => {
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git", from]`)).not.toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git", from.package(`)).not.toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git", from:]`)).not.toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git", from:.package(`)).not.toBeNull();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git","1.2.3")]`)).not.toBeNull();
        });
        it('parses package descriptions', () => {
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git",from:"1.2.3")]`)).toMatchSnapshot();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git","1.2.3"...)]`)).toMatchSnapshot();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git","1.2.3"..."1.2.4")]`)).toMatchSnapshot();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git","1.2.3"..<"1.2.4")]`)).toMatchSnapshot();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git",..."1.2.3")]`)).toMatchSnapshot();
            expect(extract_1.extractPackageFile(`dependencies:[.package(url:"https://github.com/vapor/vapor.git",..<"1.2.3")]`)).toMatchSnapshot();
        });
        it('parses multiple packages', () => {
            expect(extract_1.extractPackageFile(pkgContent)).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map