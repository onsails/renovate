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
const upath = __importStar(require("upath"));
const extract_1 = require("./extract");
describe('lib/manager/nuget/extract', () => {
    describe('extractPackageFile()', () => {
        let config;
        beforeEach(() => {
            config = {
                localDir: upath.resolve('lib/manager/nuget/__fixtures__'),
            };
        });
        it('returns empty for invalid csproj', async () => {
            expect(await extract_1.extractPackageFile('nothing here', 'bogus', config)).toMatchSnapshot();
        });
        it('extracts package version dependency', async () => {
            const packageFile = 'with-centralized-package-versions/Directory.Packages.props';
            const sample = fs_1.readFileSync(upath.join(config.localDir, packageFile), 'utf8');
            const res = await extract_1.extractPackageFile(sample, packageFile, config);
            expect(res.deps).toMatchSnapshot();
        });
        it('extracts all dependencies', async () => {
            const packageFile = 'sample.csproj';
            const sample = fs_1.readFileSync(upath.join(config.localDir, packageFile), 'utf8');
            const res = await extract_1.extractPackageFile(sample, packageFile, config);
            expect(res.deps).toMatchSnapshot();
        });
        it('extracts all dependencies from global packages file', async () => {
            const packageFile = 'packages.props';
            const sample = fs_1.readFileSync(upath.join(config.localDir, packageFile), 'utf8');
            const res = await extract_1.extractPackageFile(sample, packageFile, config);
            expect(res.deps).toMatchSnapshot();
        });
        it('considers NuGet.config', async () => {
            const packageFile = 'with-config-file/with-config-file.csproj';
            const contents = fs_1.readFileSync(upath.join(config.localDir, packageFile), 'utf8');
            expect(await extract_1.extractPackageFile(contents, packageFile, config)).toMatchSnapshot();
        });
        it('considers lower-case nuget.config', async () => {
            const packageFile = 'with-lower-case-config-file/with-lower-case-config-file.csproj';
            const contents = fs_1.readFileSync(upath.join(config.localDir, packageFile), 'utf8');
            expect(await extract_1.extractPackageFile(contents, packageFile, config)).toMatchSnapshot();
        });
        it('considers pascal-case NuGet.Config', async () => {
            const packageFile = 'with-pascal-case-config-file/with-pascal-case-config-file.csproj';
            const contents = fs_1.readFileSync(upath.join(config.localDir, packageFile), 'utf8');
            expect(await extract_1.extractPackageFile(contents, packageFile, config)).toMatchSnapshot();
        });
        it('handles malformed NuGet.config', async () => {
            const packageFile = 'with-malformed-config-file/with-malformed-config-file.csproj';
            const contents = fs_1.readFileSync(upath.join(config.localDir, packageFile), 'utf8');
            expect(await extract_1.extractPackageFile(contents, packageFile, config)).toMatchSnapshot();
        });
        it('handles NuGet.config without package sources', async () => {
            const packageFile = 'without-package-sources/without-package-sources.csproj';
            const contents = fs_1.readFileSync(upath.join(config.localDir, packageFile), 'utf8');
            expect(await extract_1.extractPackageFile(contents, packageFile, config)).toMatchSnapshot();
        });
        it('ignores local feed in NuGet.config', async () => {
            const packageFile = 'with-local-feed-in-config-file/with-local-feed-in-config-file.csproj';
            const contents = fs_1.readFileSync(upath.join(config.localDir, packageFile), 'utf8');
            expect(await extract_1.extractPackageFile(contents, packageFile, config)).toMatchSnapshot();
        });
        it('extracts registry URLs independently', async () => {
            const packageFile = 'multiple-package-files/one/one.csproj';
            const contents = fs_1.readFileSync(upath.join(config.localDir, packageFile), 'utf8');
            const otherPackageFile = 'multiple-package-files/two/two.csproj';
            const otherContents = fs_1.readFileSync(upath.join(config.localDir, packageFile), 'utf8');
            expect(await extract_1.extractPackageFile(contents, packageFile, config)).toMatchSnapshot();
            expect(await extract_1.extractPackageFile(otherContents, otherPackageFile, config)).toMatchSnapshot();
        });
        describe('.config/dotnet-tools.json', () => {
            const packageFile = '.config/dotnet-tools.json';
            const contents = `{
  "version": 1,
  "isRoot": true,
  "tools": {
    "minver-cli": {
      "version": "2.0.0",
      "commands": ["minver"]
    }
  }
}`;
            it('works', async () => {
                expect(await extract_1.extractPackageFile(contents, packageFile, config)).toMatchSnapshot();
            });
            it('with-config', async () => {
                expect(await extract_1.extractPackageFile(contents, `with-config-file/${packageFile}`, config)).toMatchSnapshot();
            });
            it('wrong version', async () => {
                expect(await extract_1.extractPackageFile(contents.replace('"version": 1,', '"version": 2,'), packageFile, config)).toBeNull();
            });
            it('does not throw', async () => {
                expect(await extract_1.extractPackageFile('{{', packageFile, config)).toBeNull();
            });
        });
    });
});
//# sourceMappingURL=extract.spec.js.map