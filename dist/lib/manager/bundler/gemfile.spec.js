"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const locked_version_1 = require("./locked-version");
const gemLockFile = fs_1.readFileSync('lib/manager/bundler/__fixtures__/Gemfile.rails.lock', 'utf8');
describe('extract lib/manager/bundler/gemfile.rails.lock', () => {
    it('matches the expected output', () => {
        expect(locked_version_1.extractLockFileEntries(gemLockFile)).toMatchSnapshot();
    });
});
//# sourceMappingURL=gemfile.spec.js.map