"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const result_1 = require("./result");
let config;
beforeEach(() => {
    jest.resetAllMocks();
    config = util_1.getConfig();
});
describe('workers/repository/result', () => {
    describe('processResult()', () => {
        it('runs', () => {
            const result = result_1.processResult(config, 'done');
            expect(result).not.toBeNil();
        });
    });
});
//# sourceMappingURL=result.spec.js.map