"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const configured_1 = require("./configured");
let config;
beforeEach(() => {
    jest.resetAllMocks();
    config = util_1.getConfig();
});
describe('workers/repository/configured', () => {
    describe('checkIfConfigured()', () => {
        it('returns', () => {
            expect(() => configured_1.checkIfConfigured(config)).not.toThrow();
        });
        it('throws if disabled', () => {
            config.enabled = false;
            expect(() => configured_1.checkIfConfigured(config)).toThrow();
        });
        it('throws if unconfigured fork', () => {
            config.enabled = true;
            config.isFork = true;
            config.renovateJsonPresent = false;
            expect(() => configured_1.checkIfConfigured(config)).toThrow();
        });
    });
});
//# sourceMappingURL=configured.spec.js.map