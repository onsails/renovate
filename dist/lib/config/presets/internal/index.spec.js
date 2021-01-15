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
const massage_1 = require("../../massage");
const validation_1 = require("../../validation");
const internal = __importStar(require("."));
jest.mock('../../../datasource/npm');
const ignoredPresets = ['default:group', 'default:timezone'];
describe('config/presets/internal', () => {
    for (const [groupName, groupPresets] of Object.entries(internal.groups)) {
        for (const [presetName, presetConfig] of Object.entries(groupPresets)) {
            const preset = `${groupName}:${presetName}`;
            if (presetName !== 'description' && !ignoredPresets.includes(preset)) {
                it(`${preset} validates`, async () => {
                    const res = await validation_1.validateConfig(massage_1.massageConfig(presetConfig), true);
                    expect(res.errors).toHaveLength(0);
                    expect(res.warnings).toHaveLength(0);
                });
            }
        }
    }
});
//# sourceMappingURL=index.spec.js.map