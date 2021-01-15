"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const queue_1 = require("./queue");
describe(util_1.getName(__filename), () => {
    it('returns null for invalid URL', () => {
        expect(queue_1.getQueue(null)).toBeNull();
    });
});
//# sourceMappingURL=queue.spec.js.map