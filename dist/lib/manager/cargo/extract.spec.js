"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const cargo1toml = fs_1.readFileSync('lib/manager/cargo/__fixtures__/Cargo.1.toml', 'utf8');
const cargo2toml = fs_1.readFileSync('lib/manager/cargo/__fixtures__/Cargo.2.toml', 'utf8');
const cargo3toml = fs_1.readFileSync('lib/manager/cargo/__fixtures__/Cargo.3.toml', 'utf8');
const cargo4toml = fs_1.readFileSync('lib/manager/cargo/__fixtures__/Cargo.4.toml', 'utf8');
const cargo5toml = fs_1.readFileSync('lib/manager/cargo/__fixtures__/Cargo.5.toml', 'utf8');
describe('lib/manager/cargo/extract', () => {
    describe('extractPackageFile()', () => {
        let config;
        beforeEach(() => {
            config = {};
        });
        it('returns null for invalid toml', () => {
            expect(extract_1.extractPackageFile('invalid toml', config)).toBeNull();
        });
        it('returns null for empty dependencies', () => {
            const cargotoml = '[dependencies]\n';
            expect(extract_1.extractPackageFile(cargotoml, config)).toBeNull();
        });
        it('returns null for empty dev-dependencies', () => {
            const cargotoml = '[dev-dependencies]\n';
            expect(extract_1.extractPackageFile(cargotoml, config)).toBeNull();
        });
        it('returns null for empty custom target', () => {
            const cargotoml = '[target."foo".dependencies]\n';
            expect(extract_1.extractPackageFile(cargotoml, config)).toBeNull();
        });
        it('extracts multiple dependencies simple', () => {
            const res = extract_1.extractPackageFile(cargo1toml, config);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(15);
        });
        it('extracts multiple dependencies advanced', () => {
            const res = extract_1.extractPackageFile(cargo2toml, config);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(18 + 6 + 1);
        });
        it('handles inline tables', () => {
            const res = extract_1.extractPackageFile(cargo3toml, config);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(8);
        });
        it('handles standard tables', () => {
            const res = extract_1.extractPackageFile(cargo4toml, config);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(6);
        });
        it('extracts platform specific dependencies', () => {
            const res = extract_1.extractPackageFile(cargo5toml, config);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(4);
        });
    });
});
//# sourceMappingURL=extract.spec.js.map