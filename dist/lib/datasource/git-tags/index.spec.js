"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const simple_git_1 = __importDefault(require("simple-git"));
const __1 = require("..");
const _1 = require(".");
jest.mock('simple-git');
const simpleGit = simple_git_1.default;
const depName = 'https://github.com/example/example.git';
const lsRemote1 = fs_extra_1.default.readFileSync('lib/datasource/git-refs/__fixtures__/ls-remote-1.txt', 'utf8');
describe('datasource/git-tags', () => {
    describe('getReleases', () => {
        it('returns nil if response is wrong', async () => {
            simpleGit.mockReturnValue({
                listRemote() {
                    return Promise.resolve(null);
                },
            });
            const versions = await __1.getPkgReleases({ datasource: _1.id, depName });
            expect(versions).toBeNull();
        });
        it('returns nil if remote call throws exception', async () => {
            simpleGit.mockReturnValue({
                listRemote() {
                    throw new Error();
                },
            });
            const versions = await __1.getPkgReleases({ datasource: _1.id, depName });
            expect(versions).toBeNull();
        });
        it('returns versions filtered from tags', async () => {
            simpleGit.mockReturnValue({
                listRemote() {
                    return Promise.resolve(lsRemote1);
                },
            });
            const versions = await __1.getPkgReleases({
                datasource: _1.id,
                depName,
            });
            expect(versions).toMatchSnapshot();
        });
    });
    describe('getDigest()', () => {
        it('returns null if not found', async () => {
            simpleGit.mockReturnValue({
                listRemote() {
                    return Promise.resolve(lsRemote1);
                },
            });
            const digest = await _1.getDigest({ datasource: _1.id, depName: 'a tag to look up' }, 'notfound');
            expect(digest).toBeNull();
        });
        it('returns digest for tag', async () => {
            simpleGit.mockReturnValue({
                listRemote() {
                    return Promise.resolve(lsRemote1);
                },
            });
            const digest = await _1.getDigest({ datasource: _1.id, depName: 'a tag to look up' }, 'v1.0.2');
            expect(digest).toMatchSnapshot();
        });
        it('returns digest for HEAD', async () => {
            simpleGit.mockReturnValue({
                listRemote() {
                    return Promise.resolve(lsRemote1);
                },
            });
            const digest = await _1.getDigest({ datasource: _1.id, depName: 'another tag to look up' }, undefined);
            expect(digest).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map