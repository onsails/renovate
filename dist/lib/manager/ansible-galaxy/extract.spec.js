"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = __importDefault(require("./extract"));
const yamlFile1 = fs_1.readFileSync('lib/manager/ansible-galaxy/__fixtures__/requirements01.yml', 'utf8');
const yamlFile2 = fs_1.readFileSync('lib/manager/ansible-galaxy/__fixtures__/requirements02.yml', 'utf8');
const helmRequirements = fs_1.readFileSync('lib/manager/ansible-galaxy/__fixtures__/helmRequirements.yml', 'utf8');
describe('lib/manager/ansible-galaxy/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.default('nothing here')).toBeNull();
        });
        it('extracts multiple dependencies from requirements.yml', () => {
            const res = extract_1.default(yamlFile1);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(10);
        });
        it('extracts dependencies from a not beautified requirements file', () => {
            const res = extract_1.default(yamlFile2);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(2);
        });
        it('check if an empty file returns null', () => {
            const res = extract_1.default('\n');
            expect(res).toBeNull();
        });
        it('check if a requirements file of other systems returns null', () => {
            const res = extract_1.default(helmRequirements);
            expect(res).toBeNull();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map