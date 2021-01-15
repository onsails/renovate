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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const upath_1 = __importDefault(require("upath"));
const defaults_1 = require("../../../config/defaults");
const _fs = __importStar(require("../../../util/fs"));
const npmExtract = __importStar(require("."));
const fs = _fs;
// TODO: fix types
const defaultConfig = defaults_1.getConfig();
function readFixture(fixture) {
    return fs_1.readFileSync(upath_1.default.resolve(__dirname, `../__fixtures__/${fixture}`), 'utf8');
}
const input01Content = readFixture('inputs/01.json');
const workspacesContent = readFixture('inputs/workspaces.json');
const workspacesSimpleContent = readFixture('inputs/workspaces-simple.json');
const vendorisedContent = readFixture('is-object.json');
const invalidNameContent = readFixture('invalid-name.json');
describe('manager/npm/extract', () => {
    describe('.extractPackageFile()', () => {
        beforeEach(() => {
            fs.readLocalFile = jest.fn(() => null);
        });
        it('returns null if cannot parse', async () => {
            const res = await npmExtract.extractPackageFile('not json', 'package.json', defaultConfig);
            expect(res).toBeNull();
        });
        it('catches invalid names', async () => {
            const res = await npmExtract.extractPackageFile(invalidNameContent, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
        it('ignores vendorised package.json', async () => {
            const res = await npmExtract.extractPackageFile(vendorisedContent, 'package.json', defaultConfig);
            expect(res).toBeNull();
        });
        it('throws error if non-root renovate config', async () => {
            await expect(npmExtract.extractPackageFile('{ "renovate": {} }', 'backend/package.json', defaultConfig)).rejects.toThrow();
        });
        it('returns null if no deps', async () => {
            const res = await npmExtract.extractPackageFile('{ "renovate": {} }', 'package.json', defaultConfig);
            expect(res).toBeNull();
        });
        it('handles invalid', async () => {
            const res = await npmExtract.extractPackageFile('{"dependencies": true, "devDependencies": []}', 'package.json', defaultConfig);
            expect(res).toBeNull();
        });
        it('returns an array of dependencies', async () => {
            const res = await npmExtract.extractPackageFile(input01Content, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
        it('finds a lock file', async () => {
            fs.readLocalFile = jest.fn((fileName) => {
                if (fileName === 'yarn.lock') {
                    return '# yarn.lock';
                }
                return null;
            });
            const res = await npmExtract.extractPackageFile(input01Content, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
        it('finds and filters .npmrc', async () => {
            fs.readLocalFile = jest.fn((fileName) => {
                if (fileName === '.npmrc') {
                    return 'save-exact = true\npackage-lock = false\n';
                }
                return null;
            });
            const res = await npmExtract.extractPackageFile(input01Content, 'package.json', { global: {} });
            expect(res.npmrc).toBeDefined();
        });
        it('finds and discards .npmrc', async () => {
            fs.readLocalFile = jest.fn((fileName) => {
                if (fileName === '.npmrc') {
                    // eslint-disable-next-line
                    return '//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}\n';
                }
                return null;
            });
            const res = await npmExtract.extractPackageFile(input01Content, 'package.json', { global: {} });
            expect(res.npmrc).toBeUndefined();
        });
        it('finds lerna', async () => {
            fs.readLocalFile = jest.fn((fileName) => {
                if (fileName === 'lerna.json') {
                    return '{}';
                }
                return null;
            });
            const res = await npmExtract.extractPackageFile(input01Content, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
        it('finds "npmClient":"npm" in lerna.json', async () => {
            fs.readLocalFile = jest.fn((fileName) => {
                if (fileName === 'lerna.json') {
                    return '{ "npmClient": "npm" }';
                }
                return null;
            });
            const res = await npmExtract.extractPackageFile(input01Content, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
        it('finds "npmClient":"yarn" in lerna.json', async () => {
            fs.readLocalFile = jest.fn((fileName) => {
                if (fileName === 'lerna.json') {
                    return '{ "npmClient": "yarn" }';
                }
                return null;
            });
            const res = await npmExtract.extractPackageFile(input01Content, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
        it('finds simple yarn workspaces', async () => {
            fs.readLocalFile = jest.fn((fileName) => {
                if (fileName === 'lerna.json') {
                    return '{}';
                }
                return null;
            });
            const res = await npmExtract.extractPackageFile(workspacesSimpleContent, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
        it('finds simple yarn workspaces with lerna.json and useWorkspaces: true', async () => {
            fs.readLocalFile = jest.fn((fileName) => {
                if (fileName === 'lerna.json') {
                    return '{"useWorkspaces": true}';
                }
                return null;
            });
            const res = await npmExtract.extractPackageFile(workspacesSimpleContent, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
        it('finds complex yarn workspaces', async () => {
            fs.readLocalFile = jest.fn((fileName) => {
                if (fileName === 'lerna.json') {
                    return '{}';
                }
                return null;
            });
            const res = await npmExtract.extractPackageFile(workspacesContent, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
        it('extracts engines', async () => {
            const pJson = {
                dependencies: {
                    angular: '1.6.0',
                },
                devDependencies: {
                    '@angular/cli': '1.6.0',
                    foo: '*',
                    bar: 'file:../foo/bar',
                    baz: '',
                    other: 'latest',
                },
                engines: {
                    atom: '>=1.7.0 <2.0.0',
                    node: '>= 8.9.2',
                    npm: '^8.0.0',
                    pnpm: '^1.2.0',
                    yarn: 'disabled',
                    vscode: '>=1.49.3',
                },
                main: 'index.js',
            };
            const pJsonStr = JSON.stringify(pJson);
            const res = await npmExtract.extractPackageFile(pJsonStr, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
        it('extracts volta', async () => {
            const pJson = {
                main: 'index.js',
                engines: {
                    node: '8.9.2',
                },
                volta: {
                    node: '8.9.2',
                    yarn: '1.12.3',
                    npm: '5.9.0',
                },
            };
            const pJsonStr = JSON.stringify(pJson);
            const res = await npmExtract.extractPackageFile(pJsonStr, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
        it('extracts volta yarn unknown-version', async () => {
            const pJson = {
                main: 'index.js',
                engines: {
                    node: '8.9.2',
                },
                volta: {
                    node: '8.9.2',
                    yarn: 'unknown',
                },
            };
            const pJsonStr = JSON.stringify(pJson);
            const res = await npmExtract.extractPackageFile(pJsonStr, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
        it('extracts non-npmjs', async () => {
            const pJson = {
                dependencies: {
                    a: 'github:owner/a',
                    b: 'github:owner/b#master',
                    c: 'github:owner/c#v1.1.0',
                    d: 'github:owner/d#a7g3eaf',
                    e: 'github:owner/e#49b5aca613b33c5b626ae68c03a385f25c142f55',
                    f: 'owner/f#v2.0.0',
                    g: 'gitlab:owner/g#v1.0.0',
                    h: 'github:-hello/world#v1.0.0',
                    i: '@foo/bar#v2.0.0',
                    j: 'github:frank#v0.0.1',
                    k: 'github:owner/k#49b5aca',
                    l: 'github:owner/l.git#abcdef0',
                    m: 'https://github.com/owner/m.git#v1.0.0',
                    n: 'git+https://github.com/owner/n#v2.0.0',
                },
            };
            const pJsonStr = JSON.stringify(pJson);
            const res = await npmExtract.extractPackageFile(pJsonStr, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
        it('extracts npm package alias', async () => {
            const pJson = {
                dependencies: {
                    a: 'npm:foo@1',
                    b: 'npm:@foo/bar@1.2.3',
                    c: 'npm:foo',
                },
            };
            const pJsonStr = JSON.stringify(pJson);
            const res = await npmExtract.extractPackageFile(pJsonStr, 'package.json', defaultConfig);
            expect(res).toMatchSnapshot();
        });
    });
    describe('.postExtract()', () => {
        it('runs', async () => {
            await expect(npmExtract.postExtract([])).resolves.not.toThrow();
        });
    });
});
//# sourceMappingURL=index.spec.js.map