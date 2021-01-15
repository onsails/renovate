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
const massage = __importStar(require("./massage"));
describe('config/massage', () => {
    describe('massageConfig', () => {
        it('returns empty', () => {
            const config = {};
            const res = massage.massageConfig(config);
            expect(res).toMatchSnapshot();
        });
        it('massages strings to array', () => {
            const config = {
                schedule: 'before 5am',
            };
            const res = massage.massageConfig(config);
            expect(Array.isArray(res.schedule)).toBe(true);
        });
        it('massages npmToken', () => {
            const config = {
                npmToken: 'some-token',
            };
            expect(massage.massageConfig(config)).toMatchSnapshot();
        });
        it('massages packageRules updateTypes', () => {
            const config = {
                packageRules: [
                    {
                        packageNames: ['foo'],
                        minor: {
                            semanticCommitType: 'feat',
                        },
                        patch: {
                            semanticCommitType: 'fix',
                        },
                    },
                ],
            };
            const res = massage.massageConfig(config);
            expect(res).toMatchSnapshot();
            expect(res.packageRules).toHaveLength(3);
        });
    });
});
//# sourceMappingURL=massage.spec.js.map