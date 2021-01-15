"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const managers_1 = require("./managers");
describe(util_1.getName(__filename), () => {
    it('should have no errors', () => {
        const res = managers_1.check({ resolvedRule: { managers: ['npm'] }, currentPath: '' });
        expect(res).toEqual([]);
    });
});
//# sourceMappingURL=managers.spec.js.map