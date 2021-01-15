"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const kubernetesImagesFile = fs_1.readFileSync('lib/manager/kubernetes/__fixtures__/kubernetes.yaml', 'utf8');
const kubernetesConfigMapFile = fs_1.readFileSync('lib/manager/kubernetes/__fixtures__/configmap.yaml', 'utf8');
const kubernetesArraySyntaxFile = fs_1.readFileSync('lib/manager/kubernetes/__fixtures__/array-syntax.yaml', 'utf8');
const otherYamlFile = fs_1.readFileSync('lib/manager/kubernetes/__fixtures__/gitlab-ci.yaml', 'utf8');
describe('lib/manager/kubernetes/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile(kubernetesConfigMapFile)).toBeNull();
        });
        it('extracts multiple image lines', () => {
            const res = extract_1.extractPackageFile(kubernetesImagesFile);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(2);
        });
        it('extracts image line in a YAML array', () => {
            const res = extract_1.extractPackageFile(kubernetesArraySyntaxFile);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(1);
        });
        it('ignores non-Kubernetes YAML files', () => {
            expect(extract_1.extractPackageFile(otherYamlFile)).toBeNull();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map