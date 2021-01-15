"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
describe('lib/manager/terragrunt/extract', () => {
    describe('getTerragruntDependencyType()', () => {
        it('returns TerragruntDependencyTypes.terragrunt', () => {
            expect(util_1.getTerragruntDependencyType('terraform')).toBe(util_1.TerragruntDependencyTypes.terragrunt);
        });
        it('returns TerragruntDependencyTypes.unknown', () => {
            expect(util_1.getTerragruntDependencyType('unknown')).toBe(util_1.TerragruntDependencyTypes.unknown);
        });
        it('returns TerragruntDependencyTypes.unknown on empty string', () => {
            expect(util_1.getTerragruntDependencyType('')).toBe(util_1.TerragruntDependencyTypes.unknown);
        });
        it('returns TerragruntDependencyTypes.unknown on string with random chars', () => {
            expect(util_1.getTerragruntDependencyType('sdfsgdsfadfhfghfhgdfsdf')).toBe(util_1.TerragruntDependencyTypes.unknown);
        });
    });
});
//# sourceMappingURL=util.spec.js.map