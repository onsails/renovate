"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../test/util");
const cache_1 = require("./cache");
describe('workers/repository/init/cache', () => {
    describe('initializeCaches()', () => {
        let config;
        beforeEach(() => {
            config = { ...util_1.getConfig() };
        });
        it('initializes', async () => {
            expect(await cache_1.initializeCaches(config)).toBeUndefined();
        });
    });
});
//# sourceMappingURL=cache.spec.js.map