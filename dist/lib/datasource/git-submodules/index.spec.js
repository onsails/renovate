"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const simple_git_1 = __importDefault(require("simple-git"));
const __1 = require("..");
const git_1 = require("../../versioning/git");
const _1 = require(".");
jest.mock('simple-git');
const simpleGit = simple_git_1.default;
const depName = 'https://github.com/example/example.git';
const registryUrls = [depName, 'master'];
describe('datasource/git-submoduless', () => {
    describe('getReleases', () => {
        it('returns null if response is wrong', async () => {
            simpleGit.mockReturnValue({
                listRemote() {
                    return Promise.resolve(null);
                },
            });
            const versions = await __1.getPkgReleases({
                datasource: _1.id,
                versioning: git_1.id,
                depName,
                registryUrls,
            });
            expect(versions).toBeNull();
        });
        it('returns null if remote call throws exception', async () => {
            simpleGit.mockReturnValue({
                listRemote() {
                    throw new Error();
                },
            });
            const versions = await __1.getPkgReleases({
                datasource: _1.id,
                versioning: git_1.id,
                depName,
                registryUrls,
            });
            expect(versions).toBeNull();
        });
        it('returns versions filtered from tags', async () => {
            simpleGit.mockReturnValue({
                listRemote() {
                    return Promise.resolve('commithash1\trefs/heads/master');
                },
            });
            const versions = await __1.getPkgReleases({
                datasource: _1.id,
                versioning: git_1.id,
                depName,
                registryUrls,
            });
            const result = versions.releases.map((x) => x.version).sort();
            expect(result).toEqual(['commithash1']);
        });
    });
    describe('getDigest', () => {
        it('returns null if passed null', async () => {
            const digest = await _1.getDigest({}, null);
            expect(digest).toBeNull();
        });
        it('returns value if passed value', async () => {
            const commitHash = 'commithash1';
            const digest = await _1.getDigest({}, commitHash);
            expect(digest).toEqual(commitHash);
        });
    });
});
//# sourceMappingURL=index.spec.js.map