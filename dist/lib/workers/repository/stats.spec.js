"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const memCache_ = __importStar(require("../../util/cache/memory"));
const stats_1 = require("./stats");
jest.mock('../../util/cache/memory');
const memCache = memCache_;
describe('workers/repository/stats', () => {
    describe('printRequestStats()', () => {
        it('runs', () => {
            memCache.get = jest.fn(() => [
                {
                    method: 'get',
                    url: 'https://api.github.com/api/v3/user',
                    duration: 100,
                },
                {
                    method: 'post',
                    url: 'https://api.github.com/graphql',
                    duration: 130,
                },
                {
                    method: 'post',
                    url: 'https://api.github.com/graphql',
                    duration: 150,
                },
                {
                    method: 'get',
                    url: 'https://api.github.com/api/v3/repositories',
                    duration: 500,
                },
                { method: 'get', url: 'https://auth.docker.io', duration: 200 },
            ]);
            expect(stats_1.printRequestStats()).toBeUndefined();
        });
    });
});
//# sourceMappingURL=stats.spec.js.map