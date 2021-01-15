"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = __importDefault(require("./extract"));
const yamlFile1 = fs_1.readFileSync('lib/manager/ansible/__fixtures__/main1.yaml', 'utf8');
const yamlFile2 = fs_1.readFileSync('lib/manager/ansible/__fixtures__/main2.yaml', 'utf8');
describe('lib/manager/ansible/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.default('nothing here')).toBeNull();
        });
        it('extracts multiple image lines from docker_container', () => {
            const res = extract_1.default(yamlFile1);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(9);
        });
        it('extracts multiple image lines from docker_service', () => {
            const res = extract_1.default(yamlFile2);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(4);
        });
    });
});
//# sourceMappingURL=extract.spec.js.map