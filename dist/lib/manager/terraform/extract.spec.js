"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const tf1 = fs_1.readFileSync('lib/manager/terraform/__fixtures__/1.tf', 'utf8');
const tf2 = `module "relative" {
  source = "../../modules/fe"
}
`;
const helm = fs_1.readFileSync('lib/manager/terraform/__fixtures__/helm.tf', 'utf8');
describe('lib/manager/terraform/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile('nothing here')).toBeNull();
        });
        it('extracts', () => {
            const res = extract_1.extractPackageFile(tf1);
            expect(res).toMatchSnapshot();
            expect(res.deps).toHaveLength(44);
            expect(res.deps.filter((dep) => dep.skipReason)).toHaveLength(8);
        });
        it('returns null if only local deps', () => {
            expect(extract_1.extractPackageFile(tf2)).toBeNull();
        });
        it('extract helm releases', () => {
            const res = extract_1.extractPackageFile(helm);
            expect(res).toMatchSnapshot();
            expect(res.deps).toHaveLength(6);
            expect(res.deps.filter((dep) => dep.skipReason)).toHaveLength(2);
        });
    });
});
//# sourceMappingURL=extract.spec.js.map