"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const tg1 = fs_1.readFileSync('lib/manager/terragrunt/__fixtures__/2.hcl', 'utf8');
const tg2 = `terragrunt {
  source = "../../modules/fe"
}
`;
describe('lib/manager/terragrunt/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile('nothing here')).toBeNull();
        });
        it('extracts terragrunt sources', () => {
            const res = extract_1.extractPackageFile(tg1);
            expect(res).toMatchSnapshot();
            expect(res.deps).toHaveLength(30);
            expect(res.deps.filter((dep) => dep.skipReason)).toHaveLength(5);
        });
        it('returns null if only local terragrunt deps', () => {
            expect(extract_1.extractPackageFile(tg2)).toBeNull();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map