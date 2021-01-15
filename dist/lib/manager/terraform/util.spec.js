"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
describe('lib/manager/terraform/extract', () => {
    describe('getTerraformDependencyType()', () => {
        it('returns TerraformDependencyTypes.module', () => {
            expect(util_1.getTerraformDependencyType('module')).toBe(util_1.TerraformDependencyTypes.module);
        });
        it('returns TerraformDependencyTypes.provider', () => {
            expect(util_1.getTerraformDependencyType('provider')).toBe(util_1.TerraformDependencyTypes.provider);
        });
        it('returns TerraformDependencyTypes.unknown', () => {
            expect(util_1.getTerraformDependencyType('unknown')).toBe(util_1.TerraformDependencyTypes.unknown);
        });
        it('returns TerraformDependencyTypes.required_providers', () => {
            expect(util_1.getTerraformDependencyType('required_providers')).toBe(util_1.TerraformDependencyTypes.required_providers);
        });
        it('returns TerraformDependencyTypes.unknown on empty string', () => {
            expect(util_1.getTerraformDependencyType('')).toBe(util_1.TerraformDependencyTypes.unknown);
        });
        it('returns TerraformDependencyTypes.unknown on string with random chars', () => {
            expect(util_1.getTerraformDependencyType('sdfsgdsfadfhfghfhgdfsdf')).toBe(util_1.TerraformDependencyTypes.unknown);
        });
    });
});
//# sourceMappingURL=util.spec.js.map