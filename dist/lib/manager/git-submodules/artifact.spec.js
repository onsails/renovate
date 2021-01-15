"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const artifacts_1 = __importDefault(require("./artifacts"));
describe('lib/manager/gitsubmodules/artifacts', () => {
    describe('updateArtifacts()', () => {
        it('returns empty content', () => {
            expect(artifacts_1.default({
                packageFileName: '',
                updatedDeps: [''],
                newPackageFileContent: '',
                config: {},
            })).toMatchSnapshot();
        });
        it('returns two modules', () => {
            expect(artifacts_1.default({
                packageFileName: '',
                updatedDeps: ['renovate', 'renovate-pro'],
                newPackageFileContent: '',
                config: {},
            })).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=artifact.spec.js.map