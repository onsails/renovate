"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../test/util");
const migrate_validate_1 = require("./migrate-validate");
let config;
beforeEach(() => {
    jest.resetAllMocks();
    config = util_1.getConfig();
});
describe('config/migrate-validate', () => {
    describe('migrateAndValidate()', () => {
        it('handles empty', async () => {
            const res = await migrate_validate_1.migrateAndValidate(config, {});
            expect(res).toMatchSnapshot();
        });
        it('handles migration', async () => {
            const input = { automerge: 'none' };
            const res = await migrate_validate_1.migrateAndValidate(config, input);
            expect(res).toMatchSnapshot();
        });
        it('handles invalid', async () => {
            const input = { foo: 'none' };
            const res = await migrate_validate_1.migrateAndValidate(config, input);
            expect(res).toMatchSnapshot();
            expect(res.errors).toHaveLength(1);
        });
        it('isOnboarded', async () => {
            const input = {};
            const res = await migrate_validate_1.migrateAndValidate({ ...config, repoIsOnboarded: true, warnings: undefined }, input);
            expect(res.warnings).toBeUndefined();
            expect(res).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=migrate-validate.spec.js.map