"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const extract_1 = require("./extract");
const yamlFile = fs_1.default.readFileSync('lib/manager/gitlabci-include/__fixtures__/gitlab-ci.1.yaml', 'utf8');
const yamlLocal = fs_1.default.readFileSync('lib/manager/gitlabci-include/__fixtures__/gitlab-ci.2.yaml', 'utf8');
const yamlLocalBlock = fs_1.default.readFileSync('lib/manager/gitlabci-include/__fixtures__/gitlab-ci.3.yaml', 'utf8');
describe('lib/manager/gitlabci-include/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', async () => {
            expect(await extract_1.extractPackageFile('nothing here', '.gitlab-ci.yml', {})).toBeNull();
        });
        it('extracts multiple include blocks', async () => {
            const res = await extract_1.extractPackageFile(yamlFile, '.gitlab-ci.yml', {});
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(3);
        });
        it('extracts local include block', async () => {
            const res = await extract_1.extractPackageFile(yamlLocal, '.gitlab-ci.yml', {});
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(1);
        });
        it('extracts multiple local include blocks', async () => {
            const res = await extract_1.extractPackageFile(yamlLocalBlock, '.gitlab-ci.yml', {});
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(2);
        });
        it('normalizes configured endpoints', async () => {
            const endpoints = [
                'http://gitlab.test/api/v4',
                'http://gitlab.test/api/v4/',
            ];
            for (const endpoint of endpoints) {
                const res = await extract_1.extractPackageFile(yamlFile, '.gitlab-ci.yml', {
                    endpoint,
                });
                expect(res.deps[0].registryUrls[0]).toEqual('http://gitlab.test');
            }
        });
    });
});
//# sourceMappingURL=extract.spec.js.map