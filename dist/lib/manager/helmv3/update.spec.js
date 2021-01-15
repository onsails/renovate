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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_yaml_1 = __importDefault(require("js-yaml"));
const helmv3Updater = __importStar(require("./update"));
describe('lib/manager/helmv3/update', () => {
    describe('.bumpPackageVersion()', () => {
        const content = js_yaml_1.default.safeDump({
            apiVersion: 'v2',
            name: 'test',
            version: '0.0.2',
        });
        it('increments', () => {
            const { bumpedContent } = helmv3Updater.bumpPackageVersion(content, '0.0.2', 'patch');
            expect(bumpedContent).toMatchSnapshot();
            expect(bumpedContent).not.toEqual(content);
        });
        it('no ops', () => {
            const { bumpedContent } = helmv3Updater.bumpPackageVersion(content, '0.0.1', 'patch');
            expect(bumpedContent).toEqual(content);
        });
        it('updates', () => {
            const { bumpedContent } = helmv3Updater.bumpPackageVersion(content, '0.0.1', 'minor');
            expect(bumpedContent).toMatchSnapshot();
            expect(bumpedContent).not.toEqual(content);
        });
        it('returns content if bumping errors', () => {
            const { bumpedContent } = helmv3Updater.bumpPackageVersion(content, '0.0.2', true);
            expect(bumpedContent).toEqual(content);
        });
    });
});
//# sourceMappingURL=update.spec.js.map