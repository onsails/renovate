"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const azurePipelines = fs_1.readFileSync('lib/manager/azure-pipelines/__fixtures__/azure-pipelines.yaml', 'utf8');
const azurePipelinesInvalid = fs_1.readFileSync('lib/manager/azure-pipelines/__fixtures__/azure-pipelines-invalid.yaml', 'utf8');
const azurePipelinesNoDependency = fs_1.readFileSync('lib/manager/azure-pipelines/__fixtures__/azure-pipelines-no-dependency.yaml', 'utf8');
describe('manager/azure-pipelines/extract', () => {
    it('should parse a valid azure-pipelines file', () => {
        const file = extract_1.parseAzurePipelines(azurePipelines, 'some-file');
        expect(file).not.toBeNull();
    });
    it('return null on an invalid file', () => {
        const file = extract_1.parseAzurePipelines(azurePipelinesInvalid, 'some-file');
        expect(file).toBeNull();
    });
    describe('extractRepository()', () => {
        it('should extract repository information', () => {
            expect(extract_1.extractRepository({
                type: 'github',
                name: 'user/repo',
                ref: 'refs/tags/v1.0.0',
            })).toMatchSnapshot();
        });
        it('should return null when repository type is not github', () => {
            expect(extract_1.extractRepository({
                type: 'bitbucket',
                name: 'user/repo',
                ref: 'refs/tags/v1.0.0',
            })).toBeNull();
        });
        it('should return null when reference is not defined', () => {
            expect(extract_1.extractRepository({
                type: 'github',
                name: 'user/repo',
                ref: null,
            })).toBeNull();
        });
        it('should return null when reference is invalid tag format', () => {
            expect(extract_1.extractRepository({
                type: 'github',
                name: 'user/repo',
                ref: 'refs/head/master',
            })).toBeNull();
        });
    });
    describe('extractContainer()', () => {
        it('should extract container information', () => {
            expect(extract_1.extractContainer({
                image: 'ubuntu:16.04',
            })).toMatchSnapshot();
        });
        it('should return null if image field is missing', () => {
            expect(extract_1.extractContainer({ image: null })).toBeNull();
        });
    });
    describe('extractPackageFile()', () => {
        it('returns null for invalid azure pipelines files', () => {
            expect(extract_1.extractPackageFile('', 'some-file')).toBeNull();
        });
        it('extracts dependencies', () => {
            const res = extract_1.extractPackageFile(azurePipelines, 'some-file');
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(3);
        });
        it('should return null when there is no dependency found', () => {
            expect(extract_1.extractPackageFile(azurePipelinesNoDependency, 'some-file')).toBeNull();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map