"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const upath_1 = require("upath");
const util_1 = require("../../../test/util");
const _1 = require(".");
const dockerfileContent = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/Dockerfile`), 'utf8');
const ansibleYamlContent = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/ansible.yml`), 'utf8');
const exampleJsonContent = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/example.json`), 'utf8');
describe(util_1.getName(__filename), () => {
    it('has default config', () => {
        expect(_1.defaultConfig).toEqual({
            pinDigests: false,
        });
    });
    it('extracts multiple dependencies', async () => {
        const config = {
            matchStrings: [
                'ENV .*?_VERSION=(?<currentValue>.*) # (?<datasource>.*?)/(?<depName>[^&]*?)(\\&versioning=(?<versioning>[^&]*?))?\\s',
            ],
            versioningTemplate: '{{#if versioning}}{{versioning}}{{else}}semver{{/if}}',
        };
        const res = await _1.extractPackageFile(dockerfileContent, 'Dockerfile', config);
        expect(res).toMatchSnapshot();
        expect(res.deps).toHaveLength(8);
        expect(res.deps.find((dep) => dep.depName === 'yarn').versioning).toEqual('semver');
        expect(res.deps.find((dep) => dep.depName === 'gradle').versioning).toEqual('maven');
    });
    it('returns null if no dependencies found', async () => {
        const config = {
            matchStrings: [
                'ENV .*?_VERSION=(?<currentValue>.*) # (?<datasource>.*?)/(?<depName>[^&]*?)(\\&versioning=(?<versioning>[^&]*?))?\\s',
            ],
            versioningTemplate: '{{#if versioning}}{{versioning}}{{else}}semver{{/if}}',
        };
        const res = await _1.extractPackageFile('', 'Dockerfile', config);
        expect(res).toBeNull();
    });
    it('returns null if invalid template', async () => {
        const config = {
            matchStrings: [
                'ENV .*?_VERSION=(?<currentValue>.*) # (?<datasource>.*?)/(?<depName>[^&]*?)(\\&versioning=(?<versioning>[^&]*?))?\\s',
            ],
            versioningTemplate: '{{#if versioning}}{{versioning}}{{else}}semver',
        };
        const res = await _1.extractPackageFile(dockerfileContent, 'Dockerfile', config);
        expect(res).toBeNull();
    });
    it('extracts extractVersion', async () => {
        const config = {
            matchStrings: [
                'ENV NGINX_MODULE_HEADERS_MORE_VERSION=(?<currentValue>.*) # (?<datasource>.*?)/(?<depName>.*?)(\\&versioning=(?<versioning>.*?))?(\\&extractVersion=(?<extractVersion>.*?))?\\s',
            ],
        };
        const res = await _1.extractPackageFile(dockerfileContent, 'Dockerfile', config);
        expect(res).toMatchSnapshot();
        expect(res.deps).toHaveLength(1);
        expect(res.deps.find((dep) => dep.depName === 'openresty/headers-more-nginx-module').extractVersion).toEqual('^v(?<version>.*)$');
    });
    it('extracts registryUrl', async () => {
        const config = {
            matchStrings: [
                'chart:\n *repository: (?<registryUrl>.*?)\n *name: (?<depName>.*?)\n *version: (?<currentValue>.*)\n',
            ],
            datasourceTemplate: 'helm',
        };
        const res = await _1.extractPackageFile(`
      apiVersion: helm.fluxcd.io/v1
      kind: HelmRelease
      metadata:
        name: prometheus-operator
        namespace: monitoring
      spec:
        releaseName: prometheus-operator
        chart:
          repository: https://charts.helm.sh/stable
          name: prometheus-operator
          version: 8.12.13
      `, 'Dockerfile', config);
        expect(res).toMatchSnapshot();
    });
    it('extracts multiple dependencies with multiple matchStrings', async () => {
        const config = {
            matchStrings: [
                'ENV GRADLE_VERSION=(?<currentValue>.*) # (?<datasource>.*?)/(?<depName>.*?)(\\&versioning=(?<versioning>.*?))?\\s',
                'ENV NODE_VERSION=(?<currentValue>.*) # (?<datasource>.*?)/(?<depName>.*?)(\\&versioning=(?<versioning>.*?))?\\s',
            ],
            versioningTemplate: '{{#if versioning}}{{versioning}}{{else}}semver{{/if}}',
        };
        const res = await _1.extractPackageFile(dockerfileContent, 'Dockerfile', config);
        expect(res).toMatchSnapshot();
        expect(res.deps).toHaveLength(2);
        expect(res.deps.find((dep) => dep.depName === 'nodejs/node').versioning).toEqual('node');
        expect(res.deps.find((dep) => dep.depName === 'gradle').versioning).toEqual('maven');
    });
    it('extracts with combination strategy', async () => {
        const config = {
            matchStrings: [
                'prometheus_image:\\s*"(?<depName>.*)"\\s*\\/\\/',
                'prometheus_version:\\s*"(?<currentValue>.*)"\\s*\\/\\/',
            ],
            matchStringsStrategy: 'combination',
            datasourceTemplate: 'docker',
        };
        const res = await _1.extractPackageFile(ansibleYamlContent, 'ansible.yml', config);
        expect(res).toMatchSnapshot();
        expect(res.deps).toHaveLength(1);
    });
    it('extracts with combination strategy and multiple matches', async () => {
        const config = {
            matchStrings: [
                '.*_image:\\s*"(?<depName>.*)"\\s*\\/\\/',
                '.*_version:\\s*"(?<currentValue>.*)"\\s*\\/\\/',
            ],
            matchStringsStrategy: 'combination',
            datasourceTemplate: 'docker',
        };
        const res = await _1.extractPackageFile(ansibleYamlContent, 'ansible.yml', config);
        expect(res).toMatchSnapshot();
        expect(res.deps).toHaveLength(1);
    });
    it('extracts with recursive strategy and single match', async () => {
        const config = {
            matchStrings: [
                '"group1":\\s*\\{[^}]*}',
                '"name":\\s*"(?<depName>.*)"[^"]*"type":\\s*"(?<datasource>.*)"[^"]*"value":\\s*"(?<currentValue>.*)"',
            ],
            matchStringsStrategy: 'recursive',
        };
        const res = await _1.extractPackageFile(exampleJsonContent, 'example.json', config);
        expect(res).toMatchSnapshot();
        expect(res.deps).toHaveLength(1);
    });
    it('extracts with recursive strategy and multiple matches', async () => {
        const config = {
            matchStrings: [
                '"group.{1}":\\s*\\{[^}]*}',
                '"name":\\s*"(?<depName>.*)"[^"]*"type":\\s*"(?<datasource>.*)"[^"]*"value":\\s*"(?<currentValue>.*)"',
            ],
            matchStringsStrategy: 'recursive',
        };
        const res = await _1.extractPackageFile(exampleJsonContent, 'example.json', config);
        expect(res).toMatchSnapshot();
        expect(res.deps).toHaveLength(2);
    });
    it('extracts with recursive strategy and multiple layers ', async () => {
        const config = {
            matchStrings: [
                '"backup":\\s*{[^}]*}',
                '"test":\\s*\\{[^}]*}',
                '"name":\\s*"(?<depName>.*)"[^"]*"type":\\s*"(?<datasource>.*)"[^"]*"value":\\s*"(?<currentValue>.*)"',
            ],
            matchStringsStrategy: 'recursive',
        };
        const res = await _1.extractPackageFile(exampleJsonContent, 'example.json', config);
        expect(res).toMatchSnapshot();
        expect(res.deps).toHaveLength(1);
    });
    it('extracts with recursive strategy and fail because of not sufficient regexes', async () => {
        const config = {
            matchStrings: ['"group.{1}":\\s*\\{[^}]*}'],
            matchStringsStrategy: 'recursive',
        };
        const res = await _1.extractPackageFile(exampleJsonContent, 'example.json', config);
        expect(res).toMatchSnapshot();
        expect(res).toBeNull();
    });
    it('extracts with recursive strategy and fail because there is no match', async () => {
        const config = {
            matchStrings: ['"trunk.{1}":\\s*\\{[^}]*}'],
            matchStringsStrategy: 'recursive',
        };
        const res = await _1.extractPackageFile(exampleJsonContent, 'example.json', config);
        expect(res).toMatchSnapshot();
        expect(res).toBeNull();
    });
});
//# sourceMappingURL=index.spec.js.map