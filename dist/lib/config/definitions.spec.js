"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../test/util");
const definitions_1 = require("./definitions");
jest.mock('../manager', () => ({
    getManagers: jest.fn(() => new Map().set('testManager', {})),
}));
describe(util_1.getName(__filename), () => {
    it('test manager should have no defaultConfig', () => {
        const opts = definitions_1.getOptions();
        expect(opts.filter((o) => o.name === 'testManager')).toEqual([]);
    });
});
//# sourceMappingURL=definitions.spec.js.map