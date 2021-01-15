"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const _1 = require(".");
describe(util_1.getName(__filename), () => {
    describe('readLocalFile', () => {
        it('reads buffer', async () => {
            expect(await _1.readLocalFile(__filename)).toBeInstanceOf(Buffer);
        });
        it('reads string', async () => {
            expect(typeof (await _1.readLocalFile(__filename, 'utf8'))).toBe('string');
        });
        it('does not throw', async () => {
            // Does not work on FreeBSD: https://nodejs.org/docs/latest-v10.x/api/fs.html#fs_fs_readfile_path_options_callback
            expect(await _1.readLocalFile(__dirname)).toBeNull();
        });
    });
});
describe(util_1.getName(__filename), () => {
    describe('localPathExists', () => {
        it('returns true for file', async () => {
            expect(await _1.localPathExists(__filename)).toBe(true);
        });
        it('returns true for directory', async () => {
            expect(await _1.localPathExists(_1.getSubDirectory(__filename))).toBe(true);
        });
        it('returns false', async () => {
            expect(await _1.localPathExists(__filename.replace('.ts', '.txt'))).toBe(false);
        });
    });
});
//# sourceMappingURL=index.spec.js.map