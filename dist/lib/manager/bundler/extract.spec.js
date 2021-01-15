"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("../../../test/util");
const ruby_1 = require("../../versioning/ruby");
const extract_1 = require("./extract");
jest.mock('../../util/fs');
const railsGemfile = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.rails', 'utf8');
const railsGemfileLock = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.rails.lock', 'utf8');
const sourceGroupGemfile = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.sourceGroup', 'utf8');
const webPackerGemfile = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.webpacker', 'utf8');
const webPackerGemfileLock = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.webpacker.lock', 'utf8');
const mastodonGemfile = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.mastodon', 'utf8');
const mastodonGemfileLock = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.mastodon.lock', 'utf8');
const rubyCIGemfileLock = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.rubyci.lock', 'utf8');
const rubyCIGemfile = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.rubyci', 'utf8');
const gitlabFossGemfileLock = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.gitlab-foss.lock', 'utf8');
const gitlabFossGemfile = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.gitlab-foss', 'utf8');
const sourceBlockGemfile = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.sourceBlock', 'utf8');
const sourceBlockWithNewLinesGemfileLock = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.sourceBlockWithNewLines.lock', 'utf8');
const sourceBlockWithNewLinesGemfile = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.sourceBlockWithNewLines', 'utf8');
function validateGems(raw, parsed) {
    const gemfileGemCount = raw.match(/\n\s*gem\s+/g).length;
    const parsedGemCount = parsed.deps.length;
    expect(gemfileGemCount).toEqual(parsedGemCount);
}
describe('lib/manager/bundler/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', async () => {
            expect(await extract_1.extractPackageFile('nothing here', 'Gemfile')).toBeNull();
        });
        it('parses rails Gemfile', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce(railsGemfileLock);
            const res = await extract_1.extractPackageFile(railsGemfile, 'Gemfile');
            expect(res).toMatchSnapshot();
            // couple of dependency of ruby rails are not present in the lock file. Filter out those before processing
            expect(res.deps
                .filter((dep) => Object.prototype.hasOwnProperty.call(dep, 'lockedVersion'))
                .every((dep) => Object.prototype.hasOwnProperty.call(dep, 'lockedVersion') &&
                ruby_1.isValid(dep.lockedVersion))).toBe(true);
            validateGems(railsGemfile, res);
        });
        it('parses sourceGroups', async () => {
            const res = await extract_1.extractPackageFile(sourceGroupGemfile, 'Gemfile');
            expect(res).toMatchSnapshot();
            validateGems(sourceGroupGemfile, res);
        });
        it('parse webpacker Gemfile', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce(webPackerGemfileLock);
            const res = await extract_1.extractPackageFile(webPackerGemfile, 'Gemfile');
            expect(res).toMatchSnapshot();
            expect(res.deps.every((dep) => Object.prototype.hasOwnProperty.call(dep, 'lockedVersion') &&
                ruby_1.isValid(dep.lockedVersion))).toBe(true);
            validateGems(webPackerGemfile, res);
        });
        it('parse mastodon Gemfile', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce(mastodonGemfileLock);
            const res = await extract_1.extractPackageFile(mastodonGemfile, 'Gemfile');
            expect(res).toMatchSnapshot();
            expect(res.deps
                .filter((dep) => Object.prototype.hasOwnProperty.call(dep, 'lockedVersion'))
                .every((dep) => Object.prototype.hasOwnProperty.call(dep, 'lockedVersion') &&
                ruby_1.isValid(dep.lockedVersion))).toBe(true);
            validateGems(mastodonGemfile, res);
        });
        it('parse Ruby CI Gemfile', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce(rubyCIGemfileLock);
            const res = await extract_1.extractPackageFile(rubyCIGemfile, 'Gemfile');
            expect(res).toMatchSnapshot();
            expect(res.deps.every((dep) => Object.prototype.hasOwnProperty.call(dep, 'lockedVersion') &&
                ruby_1.isValid(dep.lockedVersion))).toBe(true);
            validateGems(rubyCIGemfile, res);
        });
    });
    it('parse Gitlab Foss Gemfile', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce(gitlabFossGemfileLock);
        const res = await extract_1.extractPackageFile(gitlabFossGemfile, 'Gemfile');
        expect(res).toMatchSnapshot();
        expect(res.deps.every((dep) => Object.prototype.hasOwnProperty.call(dep, 'lockedVersion') &&
            ruby_1.isValid(dep.lockedVersion))).toBe(true);
        validateGems(gitlabFossGemfile, res);
    });
    it('parse source blocks in Gemfile', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce(sourceBlockGemfile);
        const res = await extract_1.extractPackageFile(sourceBlockGemfile, 'Gemfile');
        expect(res).toMatchSnapshot();
    });
    it('parse source blocks with spaces in Gemfile', async () => {
        util_1.fs.readLocalFile.mockResolvedValueOnce(sourceBlockWithNewLinesGemfileLock);
        const res = await extract_1.extractPackageFile(sourceBlockWithNewLinesGemfile, 'Gemfile');
        expect(res).toMatchSnapshot();
        validateGems(sourceBlockWithNewLinesGemfile, res);
    });
});
//# sourceMappingURL=extract.spec.js.map