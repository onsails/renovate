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
const languages_1 = require("../constants/languages");
const datasourceDocker = __importStar(require("../datasource/docker"));
const datasourceOrb = __importStar(require("../datasource/orb"));
const package_rules_1 = require("./package-rules");
describe('applyPackageRules()', () => {
    const config1 = {
        foo: 'bar',
        packageRules: [
            {
                packageNames: ['a', 'b'],
                x: 2,
            },
            {
                packagePatterns: ['a', 'b'],
                excludePackageNames: ['aa'],
                excludePackagePatterns: ['d'],
                y: 2,
            },
        ],
    };
    it('applies', () => {
        const config = {
            depName: 'a',
            isBump: true,
            currentValue: '1.0.0',
            packageRules: [
                {
                    packagePatterns: ['*'],
                    matchCurrentVersion: '<= 2.0.0',
                },
                {
                    packageNames: ['b'],
                    matchCurrentVersion: '<= 2.0.0',
                },
                {
                    excludePackagePatterns: ['*'],
                    packageNames: ['b'],
                },
                {
                    updateTypes: ['bump'],
                },
                {
                    excludePackageNames: ['a'],
                    packageNames: ['b'],
                },
                {
                    matchCurrentVersion: '<= 2.0.0',
                },
            ],
        };
        expect(package_rules_1.applyPackageRules(config)).toMatchSnapshot();
    });
    it('applies both rules for a', () => {
        const dep = {
            depName: 'a',
        };
        const res = package_rules_1.applyPackageRules({ ...config1, ...dep });
        expect(res.x).toBe(2);
        expect(res.y).toBe(2);
    });
    it('applies both rules for b', () => {
        const dep = {
            depName: 'b',
        };
        const res = package_rules_1.applyPackageRules({ ...config1, ...dep });
        expect(res.x).toBe(2);
        expect(res.y).toBe(2);
    });
    it('applies the second rule', () => {
        const dep = {
            depName: 'abc',
        };
        const res = package_rules_1.applyPackageRules({ ...config1, ...dep });
        expect(res.x).toBeUndefined();
        expect(res.y).toBe(2);
    });
    it('applies the second second rule', () => {
        const dep = {
            depName: 'bc',
        };
        const res = package_rules_1.applyPackageRules({ ...config1, ...dep });
        expect(res.x).toBeUndefined();
        expect(res.y).toBe(2);
    });
    it('excludes package name', () => {
        const dep = {
            depName: 'aa',
        };
        const res = package_rules_1.applyPackageRules({ ...config1, ...dep });
        expect(res.x).toBeUndefined();
        expect(res.y).toBeUndefined();
    });
    it('excludes package pattern', () => {
        const dep = {
            depName: 'bcd',
        };
        const res = package_rules_1.applyPackageRules({ ...config1, ...dep });
        expect(res.x).toBeUndefined();
        expect(res.y).toBeUndefined();
    });
    it('ignores patterns if lock file maintenance', () => {
        const dep = {
            enabled: true,
            packagePatterns: ['.*'],
            updateType: 'lockFileMaintenance',
            packageRules: [
                {
                    excludePackagePatterns: ['^foo'],
                    enabled: false,
                },
            ],
        };
        const res = package_rules_1.applyPackageRules(dep);
        expect(res.enabled).toBe(true);
        const res2 = package_rules_1.applyPackageRules({ ...dep, depName: 'anything' });
        expect(res2.enabled).toBe(false);
    });
    it('matches anything if missing inclusive rules', () => {
        const config = {
            packageRules: [
                {
                    excludePackageNames: ['foo'],
                    x: 1,
                },
            ],
        };
        const res1 = package_rules_1.applyPackageRules({
            ...config,
            depName: 'foo',
        });
        expect(res1.x).toBeUndefined();
        const res2 = package_rules_1.applyPackageRules({
            ...config,
            depName: 'bar',
        });
        expect(res2.x).toBeDefined();
    });
    it('supports inclusive or', () => {
        const config = {
            packageRules: [
                {
                    packageNames: ['neutrino'],
                    packagePatterns: ['^@neutrino\\/'],
                    x: 1,
                },
            ],
        };
        const res1 = package_rules_1.applyPackageRules({ ...config, depName: 'neutrino' });
        expect(res1.x).toBeDefined();
        const res2 = package_rules_1.applyPackageRules({
            ...config,
            depName: '@neutrino/something',
        });
        expect(res2.x).toBeDefined();
    });
    it('filters requested depType', () => {
        const config = {
            packageRules: [
                {
                    depTypeList: ['dependencies', 'peerDependencies'],
                    packageNames: ['a'],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            depName: 'a',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBe(1);
    });
    it('filters from list of requested depTypes', () => {
        const config = {
            packageRules: [
                {
                    depTypeList: ['test'],
                    packageNames: ['a'],
                    x: 1,
                },
            ],
        };
        const dep = {
            depTypes: ['build', 'test'],
            depName: 'a',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBe(1);
    });
    it('filters managers with matching manager', () => {
        const config = {
            packageRules: [
                {
                    managers: ['npm', 'meteor'],
                    packageNames: ['node'],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            language: languages_1.LANGUAGE_JAVASCRIPT,
            manager: 'meteor',
            depName: 'node',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBe(1);
    });
    it('filters managers with non-matching manager', () => {
        const config = {
            packageRules: [
                {
                    managers: ['dockerfile', 'npm'],
                    packageNames: ['node'],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            language: languages_1.LANGUAGE_PYTHON,
            manager: 'pipenv',
            depName: 'node',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBeUndefined();
    });
    it('filters languages with matching language', () => {
        const config = {
            packageRules: [
                {
                    languages: [languages_1.LANGUAGE_JAVASCRIPT, languages_1.LANGUAGE_NODE],
                    packageNames: ['node'],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            language: languages_1.LANGUAGE_JAVASCRIPT,
            manager: 'meteor',
            depName: 'node',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBe(1);
    });
    it('filters languages with non-matching language', () => {
        const config = {
            packageRules: [
                {
                    languages: [languages_1.LANGUAGE_DOCKER],
                    packageNames: ['node'],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            language: languages_1.LANGUAGE_PYTHON,
            manager: 'pipenv',
            depName: 'node',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBeUndefined();
    });
    it('filters datasources with matching datasource', () => {
        const config = {
            packageRules: [
                {
                    datasources: [datasourceOrb.id, datasourceDocker.id],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            datasource: datasourceOrb.id,
            baseBranch: 'master',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBe(1);
    });
    it('filters branches with matching branch', () => {
        const config = {
            packageRules: [
                {
                    baseBranchList: ['master', 'staging'],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            datasource: datasourceOrb.id,
            baseBranch: 'master',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBe(1);
    });
    it('filters datasources with non-matching datasource', () => {
        const config = {
            packageRules: [
                {
                    datasources: [datasourceOrb.id],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            baseBranch: 'staging',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBeUndefined();
    });
    it('filters branches with non-matching branch', () => {
        const config = {
            packageRules: [
                {
                    baseBranchList: ['master'],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            baseBranch: 'staging',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBeUndefined();
    });
    it('filters updateType', () => {
        const config = {
            packageRules: [
                {
                    updateTypes: ['minor', 'patch'],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            depName: 'a',
            updateType: 'patch',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBe(1);
    });
    it('matches sourceUrlPrefixes', () => {
        const config = {
            packageRules: [
                {
                    sourceUrlPrefixes: [
                        'https://github.com/foo/bar',
                        'https://github.com/renovatebot/',
                    ],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            depName: 'a',
            updateType: 'patch',
            sourceUrl: 'https://github.com/renovatebot/presets',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBe(1);
    });
    it('non-matches sourceUrlPrefixes', () => {
        const config = {
            packageRules: [
                {
                    sourceUrlPrefixes: [
                        'https://github.com/foo/bar',
                        'https://github.com/renovatebot/',
                    ],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            depName: 'a',
            updateType: 'patch',
            sourceUrl: 'https://github.com/vuejs/vue',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBeUndefined();
    });
    it('handles sourceUrlPrefixes when missing sourceUrl', () => {
        const config = {
            packageRules: [
                {
                    sourceUrlPrefixes: [
                        'https://github.com/foo/bar',
                        'https://github.com/renovatebot/',
                    ],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            depName: 'a',
            updateType: 'patch',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBeUndefined();
    });
    it('filters naked depType', () => {
        const config = {
            packageRules: [
                {
                    depTypeList: ['dependencies', 'peerDependencies'],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'dependencies',
            depName: 'a',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBe(1);
    });
    it('filters out unrequested depType', () => {
        const config = {
            packageRules: [
                {
                    depTypeList: ['dependencies', 'peerDependencies'],
                    packageNames: ['a'],
                    x: 1,
                },
            ],
        };
        const dep = {
            depType: 'devDependencies',
            depName: 'a',
        };
        const res = package_rules_1.applyPackageRules({ ...config, ...dep });
        expect(res.x).toBeUndefined();
    });
    it('checks if matchCurrentVersion selector is valid and satisfies the condition on range overlap', () => {
        const config = {
            packageRules: [
                {
                    packageNames: ['test'],
                    matchCurrentVersion: '<= 2.0.0',
                    x: 1,
                },
            ],
        };
        const res1 = package_rules_1.applyPackageRules({
            ...config,
            ...{
                depName: 'test',
                currentValue: '^1.0.0',
                fromVersion: '1.0.3',
            },
        });
        expect(res1.x).toBeDefined();
        const res2 = package_rules_1.applyPackageRules({
            ...config,
            ...{
                depName: 'test',
                currentValue: '^1.0.0',
            },
        });
        expect(res2.x).toBeUndefined();
    });
    it('checks if matchCurrentVersion selector is valid and satisfies the condition on pinned to range overlap', () => {
        const config = {
            packageRules: [
                {
                    packageNames: ['test'],
                    matchCurrentVersion: '>= 2.0.0',
                    x: 1,
                },
            ],
        };
        const res1 = package_rules_1.applyPackageRules({
            ...config,
            ...{
                depName: 'test',
                currentValue: '2.4.6',
                fromVersion: '2.4.6',
            },
        });
        expect(res1.x).toBeDefined();
    });
    it('checks if matchCurrentVersion selector is a version and matches if currentValue is a range', () => {
        const config = {
            packageRules: [
                {
                    packageNames: ['test'],
                    matchCurrentVersion: '2.1.0',
                    x: 1,
                },
            ],
        };
        const res1 = package_rules_1.applyPackageRules({
            ...config,
            ...{
                depName: 'test',
                currentValue: '^2.0.0',
            },
        });
        expect(res1.x).toBeDefined();
        const res2 = package_rules_1.applyPackageRules({
            ...config,
            ...{
                depName: 'test',
                currentValue: '~2.0.0',
            },
        });
        expect(res2.x).toBeUndefined();
    });
    it('checks if matchCurrentVersion selector works with static values', () => {
        const config = {
            packageRules: [
                {
                    packageNames: ['test'],
                    matchCurrentVersion: '4.6.0',
                    x: 1,
                },
            ],
        };
        const res1 = package_rules_1.applyPackageRules({
            ...config,
            ...{
                depName: 'test',
                currentValue: '4.6.0',
                fromVersion: '4.6.0',
            },
        });
        expect(res1.x).toBeDefined();
    });
    it('checks if matchCurrentVersion selector works with regular expressions', () => {
        const config = {
            packageRules: [
                {
                    packageNames: ['test'],
                    matchCurrentVersion: '/^4/',
                    x: 1,
                },
            ],
        };
        const res1 = package_rules_1.applyPackageRules({
            ...config,
            ...{
                depName: 'test',
                currentValue: '4.6.0',
                fromVersion: '4.6.0',
            },
        });
        const res2 = package_rules_1.applyPackageRules({
            ...config,
            ...{
                depName: 'test',
                currentValue: '5.6.0',
                fromVersion: '5.6.0',
            },
        });
        expect(res1.x).toBeDefined();
        expect(res2.x).toBeUndefined();
    });
    it('checks if matchCurrentVersion selector works with negated regular expressions', () => {
        const config = {
            packageRules: [
                {
                    packageNames: ['test'],
                    matchCurrentVersion: '!/^4/',
                    x: 1,
                },
            ],
        };
        const res1 = package_rules_1.applyPackageRules({
            ...config,
            ...{
                depName: 'test',
                currentValue: '4.6.0',
                fromVersion: '4.6.0',
            },
        });
        const res2 = package_rules_1.applyPackageRules({
            ...config,
            ...{
                depName: 'test',
                currentValue: '5.6.0',
                fromVersion: '5.6.0',
            },
        });
        expect(res1.x).toBeUndefined();
        expect(res2.x).toBeDefined();
    });
    it('matches paths', () => {
        const config = {
            packageFile: 'examples/foo/package.json',
            packageRules: [
                {
                    paths: ['examples/**', 'lib/'],
                    x: 1,
                },
            ],
        };
        const res1 = package_rules_1.applyPackageRules({
            ...config,
            depName: 'test',
        });
        expect(res1.x).toBeDefined();
        config.packageFile = 'package.json';
        const res2 = package_rules_1.applyPackageRules({
            ...config,
            depName: 'test',
        });
        expect(res2.x).toBeUndefined();
        config.packageFile = 'lib/a/package.json';
        const res3 = package_rules_1.applyPackageRules({
            ...config,
            depName: 'test',
        });
        expect(res3.x).toBeDefined();
    });
    it('empty rules', () => {
        expect(package_rules_1.applyPackageRules({ ...config1, packageRules: null })).toMatchSnapshot();
    });
});
//# sourceMappingURL=package-rules.spec.js.map