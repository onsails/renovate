import { UpdateType } from '../config';
import {
  LANGUAGE_DOCKER,
  LANGUAGE_JAVASCRIPT,
  LANGUAGE_NODE,
  LANGUAGE_PYTHON,
} from '../constants/languages';

import * as datasourceDocker from '../datasource/docker';
import * as datasourceOrb from '../datasource/orb';
import { Config, applyPackageRules } from './package-rules';

type TestConfig = Config & { x?: number; y?: number };

describe('applyPackageRules()', () => {
  const config1: TestConfig = {
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
    const config: Config = {
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
    expect(applyPackageRules(config)).toMatchSnapshot();
  });
  it('applies both rules for a', () => {
    const dep = {
      depName: 'a',
    };
    const res = applyPackageRules({ ...config1, ...dep });
    expect(res.x).toBe(2);
    expect(res.y).toBe(2);
  });
  it('applies both rules for b', () => {
    const dep = {
      depName: 'b',
    };
    const res = applyPackageRules({ ...config1, ...dep });
    expect(res.x).toBe(2);
    expect(res.y).toBe(2);
  });
  it('applies the second rule', () => {
    const dep = {
      depName: 'abc',
    };
    const res = applyPackageRules({ ...config1, ...dep });
    expect(res.x).toBeUndefined();
    expect(res.y).toBe(2);
  });
  it('applies the second second rule', () => {
    const dep = {
      depName: 'bc',
    };
    const res = applyPackageRules({ ...config1, ...dep });
    expect(res.x).toBeUndefined();
    expect(res.y).toBe(2);
  });
  it('excludes package name', () => {
    const dep = {
      depName: 'aa',
    };
    const res = applyPackageRules({ ...config1, ...dep });
    expect(res.x).toBeUndefined();
    expect(res.y).toBeUndefined();
  });
  it('excludes package pattern', () => {
    const dep = {
      depName: 'bcd',
    };
    const res = applyPackageRules({ ...config1, ...dep });
    expect(res.x).toBeUndefined();
    expect(res.y).toBeUndefined();
  });
  it('ignores patterns if lock file maintenance', () => {
    const dep = {
      enabled: true,
      packagePatterns: ['.*'],
      updateType: 'lockFileMaintenance' as UpdateType,
      packageRules: [
        {
          excludePackagePatterns: ['^foo'],
          enabled: false,
        },
      ],
    };
    const res = applyPackageRules(dep);
    expect(res.enabled).toBe(true);
    const res2 = applyPackageRules({ ...dep, depName: 'anything' });
    expect(res2.enabled).toBe(false);
  });
  it('matches anything if missing inclusive rules', () => {
    const config: TestConfig = {
      packageRules: [
        {
          excludePackageNames: ['foo'],
          x: 1,
        },
      ],
    };
    const res1 = applyPackageRules({
      ...config,
      depName: 'foo',
    });
    expect(res1.x).toBeUndefined();
    const res2 = applyPackageRules({
      ...config,
      depName: 'bar',
    });
    expect(res2.x).toBeDefined();
  });
  it('supports inclusive or', () => {
    const config: TestConfig = {
      packageRules: [
        {
          packageNames: ['neutrino'],
          packagePatterns: ['^@neutrino\\/'],
          x: 1,
        },
      ],
    };
    const res1 = applyPackageRules({ ...config, depName: 'neutrino' });
    expect(res1.x).toBeDefined();
    const res2 = applyPackageRules({
      ...config,
      depName: '@neutrino/something',
    });
    expect(res2.x).toBeDefined();
  });
  it('filters requested depType', () => {
    const config: TestConfig = {
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
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBe(1);
  });
  it('filters from list of requested depTypes', () => {
    const config: TestConfig = {
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
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBe(1);
  });
  it('filters managers with matching manager', () => {
    const config: TestConfig = {
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
      language: LANGUAGE_JAVASCRIPT,
      manager: 'meteor',
      depName: 'node',
    };
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBe(1);
  });
  it('filters managers with non-matching manager', () => {
    const config: TestConfig = {
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
      language: LANGUAGE_PYTHON,
      manager: 'pipenv',
      depName: 'node',
    };
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBeUndefined();
  });
  it('filters languages with matching language', () => {
    const config: TestConfig = {
      packageRules: [
        {
          languages: [LANGUAGE_JAVASCRIPT, LANGUAGE_NODE],
          packageNames: ['node'],
          x: 1,
        },
      ],
    };
    const dep = {
      depType: 'dependencies',
      language: LANGUAGE_JAVASCRIPT,
      manager: 'meteor',
      depName: 'node',
    };
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBe(1);
  });
  it('filters languages with non-matching language', () => {
    const config: TestConfig = {
      packageRules: [
        {
          languages: [LANGUAGE_DOCKER],
          packageNames: ['node'],
          x: 1,
        },
      ],
    };
    const dep = {
      depType: 'dependencies',
      language: LANGUAGE_PYTHON,
      manager: 'pipenv',
      depName: 'node',
    };
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBeUndefined();
  });
  it('filters datasources with matching datasource', () => {
    const config: TestConfig = {
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
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBe(1);
  });
  it('filters branches with matching branch', () => {
    const config: TestConfig = {
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
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBe(1);
  });
  it('filters datasources with non-matching datasource', () => {
    const config: TestConfig = {
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
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBeUndefined();
  });
  it('filters branches with non-matching branch', () => {
    const config: TestConfig = {
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
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBeUndefined();
  });
  it('filters updateType', () => {
    const config: TestConfig = {
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
      updateType: 'patch' as UpdateType,
    };
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBe(1);
  });
  it('matches sourceUrlPrefixes', () => {
    const config: TestConfig = {
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
      updateType: 'patch' as UpdateType,
      sourceUrl: 'https://github.com/renovatebot/presets',
    };
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBe(1);
  });
  it('non-matches sourceUrlPrefixes', () => {
    const config: TestConfig = {
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
      updateType: 'patch' as UpdateType,
      sourceUrl: 'https://github.com/vuejs/vue',
    };
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBeUndefined();
  });
  it('handles sourceUrlPrefixes when missing sourceUrl', () => {
    const config: TestConfig = {
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
      updateType: 'patch' as UpdateType,
    };
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBeUndefined();
  });
  it('filters naked depType', () => {
    const config: TestConfig = {
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
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBe(1);
  });
  it('filters out unrequested depType', () => {
    const config: TestConfig = {
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
    const res = applyPackageRules({ ...config, ...dep });
    expect(res.x).toBeUndefined();
  });
  it('checks if matchCurrentVersion selector is valid and satisfies the condition on range overlap', () => {
    const config: TestConfig = {
      packageRules: [
        {
          packageNames: ['test'],
          matchCurrentVersion: '<= 2.0.0',
          x: 1,
        },
      ],
    };
    const res1 = applyPackageRules({
      ...config,
      ...{
        depName: 'test',
        currentValue: '^1.0.0',
        fromVersion: '1.0.3',
      },
    });
    expect(res1.x).toBeDefined();
    const res2 = applyPackageRules({
      ...config,
      ...{
        depName: 'test',
        currentValue: '^1.0.0',
      },
    });
    expect(res2.x).toBeUndefined();
  });
  it('checks if matchCurrentVersion selector is valid and satisfies the condition on pinned to range overlap', () => {
    const config: TestConfig = {
      packageRules: [
        {
          packageNames: ['test'],
          matchCurrentVersion: '>= 2.0.0',
          x: 1,
        },
      ],
    };
    const res1 = applyPackageRules({
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
    const config: TestConfig = {
      packageRules: [
        {
          packageNames: ['test'],
          matchCurrentVersion: '2.1.0',
          x: 1,
        },
      ],
    };
    const res1 = applyPackageRules({
      ...config,
      ...{
        depName: 'test',
        currentValue: '^2.0.0',
      },
    });
    expect(res1.x).toBeDefined();
    const res2 = applyPackageRules({
      ...config,
      ...{
        depName: 'test',
        currentValue: '~2.0.0',
      },
    });
    expect(res2.x).toBeUndefined();
  });
  it('checks if matchCurrentVersion selector works with static values', () => {
    const config: TestConfig = {
      packageRules: [
        {
          packageNames: ['test'],
          matchCurrentVersion: '4.6.0',
          x: 1,
        },
      ],
    };
    const res1 = applyPackageRules({
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
    const config: TestConfig = {
      packageRules: [
        {
          packageNames: ['test'],
          matchCurrentVersion: '/^4/',
          x: 1,
        },
      ],
    };
    const res1 = applyPackageRules({
      ...config,
      ...{
        depName: 'test',
        currentValue: '4.6.0',
        fromVersion: '4.6.0',
      },
    });
    const res2 = applyPackageRules({
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
    const config: TestConfig = {
      packageRules: [
        {
          packageNames: ['test'],
          matchCurrentVersion: '!/^4/',
          x: 1,
        },
      ],
    };
    const res1 = applyPackageRules({
      ...config,
      ...{
        depName: 'test',
        currentValue: '4.6.0',
        fromVersion: '4.6.0',
      },
    });
    const res2 = applyPackageRules({
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
    const config: TestConfig = {
      packageFile: 'examples/foo/package.json',
      packageRules: [
        {
          paths: ['examples/**', 'lib/'],
          x: 1,
        },
      ],
    };
    const res1 = applyPackageRules({
      ...config,
      depName: 'test',
    });
    expect(res1.x).toBeDefined();
    config.packageFile = 'package.json';
    const res2 = applyPackageRules({
      ...config,
      depName: 'test',
    });
    expect(res2.x).toBeUndefined();
    config.packageFile = 'lib/a/package.json';
    const res3 = applyPackageRules({
      ...config,
      depName: 'test',
    });
    expect(res3.x).toBeDefined();
  });
  it('empty rules', () => {
    expect(
      applyPackageRules({ ...config1, packageRules: null })
    ).toMatchSnapshot();
  });
});
