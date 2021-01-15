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
const fs_1 = require("fs");
const datasourceDocker = __importStar(require("../../datasource/docker"));
const datasourceGitTags = __importStar(require("../../datasource/git-tags"));
const datasourceGitHubTags = __importStar(require("../../datasource/github-tags"));
const dockerVersioning = __importStar(require("../../versioning/docker"));
const extract_1 = require("./extract");
const kustomizeGitSSHBase = fs_1.readFileSync('lib/manager/kustomize/__fixtures__/gitSshBase.yaml', 'utf8');
const kustomizeEmpty = fs_1.readFileSync('lib/manager/kustomize/__fixtures__/kustomizeEmpty.yaml', 'utf8');
const kustomizeGitSSHSubdir = fs_1.readFileSync('lib/manager/kustomize/__fixtures__/gitSubdir.yaml', 'utf8');
const kustomizeHTTP = fs_1.readFileSync('lib/manager/kustomize/__fixtures__/kustomizeHttp.yaml', 'utf8');
const kustomizeWithLocal = fs_1.readFileSync('lib/manager/kustomize/__fixtures__/kustomizeWithLocal.yaml', 'utf8');
const nonKustomize = fs_1.readFileSync('lib/manager/kustomize/__fixtures__/service.yaml', 'utf8');
const gitImages = fs_1.readFileSync('lib/manager/kustomize/__fixtures__/gitImages.yaml', 'utf8');
const kustomizeDepsInResources = fs_1.readFileSync('lib/manager/kustomize/__fixtures__/depsInResources.yaml', 'utf8');
const sha = fs_1.readFileSync('lib/manager/kustomize/__fixtures__/sha.yaml', 'utf8');
describe('manager/kustomize/extract', () => {
    it('should successfully parse a valid kustomize file', () => {
        const file = extract_1.parseKustomize(kustomizeGitSSHBase);
        expect(file).not.toBeNull();
    });
    it('return null on an invalid file', () => {
        const file = extract_1.parseKustomize('');
        expect(file).toBeNull();
    });
    describe('extractBase', () => {
        it('should return null for a local base', () => {
            const res = extract_1.extractBase('./service-1');
            expect(res).toBeNull();
        });
        it('should extract out the version of an http base', () => {
            const base = 'https://github.com/user/test-repo.git';
            const version = 'v1.0.0';
            const sample = {
                currentValue: version,
                datasource: datasourceGitHubTags.id,
                depName: 'user/test-repo',
            };
            const pkg = extract_1.extractBase(`${base}?ref=${version}`);
            expect(pkg).toEqual(sample);
        });
        it('should extract the version of a non http base', () => {
            const pkg = extract_1.extractBase('ssh://git@bitbucket.com/user/test-repo?ref=v1.2.3');
            expect(pkg).toEqual({
                currentValue: 'v1.2.3',
                datasource: datasourceGitTags.id,
                depName: 'bitbucket.com/user/test-repo',
                depNameShort: 'user/test-repo',
                lookupName: 'ssh://git@bitbucket.com/user/test-repo',
            });
        });
        it('should extract the version of a non http base with subdir', () => {
            const pkg = extract_1.extractBase('ssh://git@bitbucket.com/user/test-repo/subdir?ref=v1.2.3');
            expect(pkg).toEqual({
                currentValue: 'v1.2.3',
                datasource: datasourceGitTags.id,
                depName: 'bitbucket.com/user/test-repo',
                depNameShort: 'user/test-repo',
                lookupName: 'ssh://git@bitbucket.com/user/test-repo',
            });
        });
        it('should extract out the version of an github base', () => {
            const base = 'github.com/fluxcd/flux/deploy';
            const version = 'v1.0.0';
            const sample = {
                currentValue: version,
                datasource: datasourceGitHubTags.id,
                depName: 'fluxcd/flux',
            };
            const pkg = extract_1.extractBase(`${base}?ref=${version}`);
            expect(pkg).toEqual(sample);
        });
        it('should extract out the version of a git base', () => {
            const base = 'git@github.com:user/repo.git';
            const version = 'v1.0.0';
            const sample = {
                currentValue: version,
                datasource: datasourceGitHubTags.id,
                depName: 'user/repo',
            };
            const pkg = extract_1.extractBase(`${base}?ref=${version}`);
            expect(pkg).toEqual(sample);
        });
        it('should extract out the version of a git base with subdir', () => {
            const base = 'git@github.com:user/repo.git/subdir';
            const version = 'v1.0.0';
            const sample = {
                currentValue: version,
                datasource: datasourceGitHubTags.id,
                depName: 'user/repo',
            };
            const pkg = extract_1.extractBase(`${base}?ref=${version}`);
            expect(pkg).toEqual(sample);
        });
    });
    describe('image extraction', () => {
        it('should return null on a null input', () => {
            const pkg = extract_1.extractImage({
                name: null,
                newTag: null,
            });
            expect(pkg).toBeNull();
        });
        it('should correctly extract a default image', () => {
            const sample = {
                currentDigest: undefined,
                currentValue: 'v1.0.0',
                datasource: datasourceDocker.id,
                replaceString: 'v1.0.0',
                versioning: dockerVersioning.id,
                depName: 'node',
            };
            const pkg = extract_1.extractImage({
                name: sample.depName,
                newTag: sample.currentValue,
            });
            expect(pkg).toEqual(sample);
        });
        it('should correctly extract an image in a repo', () => {
            const sample = {
                currentDigest: undefined,
                currentValue: 'v1.0.0',
                datasource: datasourceDocker.id,
                replaceString: 'v1.0.0',
                versioning: dockerVersioning.id,
                depName: 'test/node',
            };
            const pkg = extract_1.extractImage({
                name: sample.depName,
                newTag: sample.currentValue,
            });
            expect(pkg).toEqual(sample);
        });
        it('should correctly extract from a different registry', () => {
            const sample = {
                currentDigest: undefined,
                currentValue: 'v1.0.0',
                datasource: datasourceDocker.id,
                replaceString: 'v1.0.0',
                versioning: dockerVersioning.id,
                depName: 'quay.io/repo/image',
            };
            const pkg = extract_1.extractImage({
                name: sample.depName,
                newTag: sample.currentValue,
            });
            expect(pkg).toEqual(sample);
        });
        it('should correctly extract from a different port', () => {
            const sample = {
                currentDigest: undefined,
                currentValue: 'v1.0.0',
                datasource: datasourceDocker.id,
                versioning: dockerVersioning.id,
                replaceString: 'v1.0.0',
                depName: 'localhost:5000/repo/image',
            };
            const pkg = extract_1.extractImage({
                name: sample.depName,
                newTag: sample.currentValue,
            });
            expect(pkg).toEqual(sample);
        });
        it('should correctly extract from a multi-depth registry', () => {
            const sample = {
                currentDigest: undefined,
                currentValue: 'v1.0.0',
                replaceString: 'v1.0.0',
                datasource: datasourceDocker.id,
                versioning: dockerVersioning.id,
                depName: 'localhost:5000/repo/image/service',
            };
            const pkg = extract_1.extractImage({
                name: sample.depName,
                newTag: sample.currentValue,
            });
            expect(pkg).toEqual(sample);
        });
    });
    describe('extractPackageFile()', () => {
        it('returns null for non kustomize kubernetes files', () => {
            expect(extract_1.extractPackageFile(nonKustomize)).toBeNull();
        });
        it('extracts multiple image lines', () => {
            const res = extract_1.extractPackageFile(kustomizeWithLocal);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(2);
        });
        it('extracts ssh dependency', () => {
            const res = extract_1.extractPackageFile(kustomizeGitSSHBase);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(1);
        });
        it('extracts ssh dependency with a subdir', () => {
            const res = extract_1.extractPackageFile(kustomizeGitSSHSubdir);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(1);
        });
        it('extracts http dependency', () => {
            const res = extract_1.extractPackageFile(kustomizeHTTP);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(2);
            expect(res.deps[0].currentValue).toEqual('v0.0.1');
            expect(res.deps[1].currentValue).toEqual('1.19.0');
            expect(res.deps[1].depName).toEqual('fluxcd/flux');
        });
        it('should extract out image versions', () => {
            const res = extract_1.extractPackageFile(gitImages);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(5);
            expect(res.deps[0].currentValue).toEqual('v0.1.0');
            expect(res.deps[1].currentValue).toEqual('v0.0.1');
        });
        it('ignores non-Kubernetes empty files', () => {
            expect(extract_1.extractPackageFile('')).toBeNull();
        });
        it('does nothing with kustomize empty kustomize files', () => {
            expect(extract_1.extractPackageFile(kustomizeEmpty)).toBeNull();
        });
        it('should extract bases from bases block and the resources block', () => {
            const res = extract_1.extractPackageFile(kustomizeDepsInResources);
            expect(res).not.toBeNull();
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(2);
            expect(res.deps[0].currentValue).toEqual('v0.0.1');
            expect(res.deps[1].currentValue).toEqual('1.19.0');
            expect(res.deps[1].depName).toEqual('fluxcd/flux');
        });
        it('extracts sha256 instead of tag', () => {
            expect(extract_1.extractPackageFile(sha)).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map