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
const memCache = __importStar(require("."));
describe('getRepoCache', () => {
    it('returns undefined if not init', () => {
        expect(memCache.get('key1')).toBeUndefined();
    });
    it('sets and gets repo cache', () => {
        memCache.init();
        memCache.set('key2', 'value');
        expect(memCache.get('key2')).toEqual('value');
    });
    it('resets', () => {
        memCache.init();
        memCache.set('key3', 'value');
        memCache.reset();
        expect(memCache.get('key3')).toBeUndefined();
    });
});
//# sourceMappingURL=index.spec.js.map