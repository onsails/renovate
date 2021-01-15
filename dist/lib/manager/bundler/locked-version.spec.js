"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const locked_version_1 = require("./locked-version");
const railsGemfileLock = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.rails.lock', 'utf8');
const webPackerGemfileLock = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.webpacker.lock', 'utf8');
const mastodonGemfileLock = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.mastodon.lock', 'utf8');
const rubyCIGemfileLock = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.rubyci.lock', 'utf8');
const gitlabFossGemfileLock = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.gitlab-foss.lock', 'utf8');
describe('/lib/manager/bundler/locked-version', () => {
    test('Parse Rails Gem Lock File', () => {
        const parsedLockEntries = locked_version_1.extractLockFileEntries(railsGemfileLock);
        expect(parsedLockEntries).toMatchSnapshot();
    });
    test('Parse WebPacker Gem Lock File', () => {
        const parsedLockEntries = locked_version_1.extractLockFileEntries(webPackerGemfileLock);
        expect(parsedLockEntries).toMatchSnapshot();
    });
    test('Parse Mastodon Gem Lock File', () => {
        const parsedLockEntries = locked_version_1.extractLockFileEntries(mastodonGemfileLock);
        expect(parsedLockEntries).toMatchSnapshot();
    });
    test('Parse Ruby CI Gem Lock File', () => {
        const parsedLockEntries = locked_version_1.extractLockFileEntries(rubyCIGemfileLock);
        expect(parsedLockEntries).toMatchSnapshot();
    });
    test('Parse Gitlab Foss Gem Lock File', () => {
        const parsedLockEntries = locked_version_1.extractLockFileEntries(gitlabFossGemfileLock);
        expect(parsedLockEntries).toMatchSnapshot();
    });
});
//# sourceMappingURL=locked-version.spec.js.map