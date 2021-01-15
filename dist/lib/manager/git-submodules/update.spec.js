"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const simple_git_1 = __importDefault(require("simple-git"));
const tmp_promise_1 = require("tmp-promise");
const update_1 = __importDefault(require("./update"));
jest.mock('simple-git');
const simpleGit = simple_git_1.default;
describe('manager/git-submodules/update', () => {
    describe('updateDependency', () => {
        let upgrade;
        beforeAll(async () => {
            const tmpDir = await tmp_promise_1.dir();
            upgrade = { localDir: tmpDir.path, depName: 'renovate' };
        });
        it('returns null on error', async () => {
            simpleGit.mockReturnValue({
                submoduleUpdate() {
                    throw new Error();
                },
            });
            const update = await update_1.default({
                fileContent: '',
                upgrade,
            });
            expect(update).toBeNull();
        });
        it('returns content on update', async () => {
            simpleGit.mockReturnValue({
                submoduleUpdate() {
                    return Promise.resolve();
                },
                checkout() {
                    return Promise.resolve();
                },
            });
            const update = await update_1.default({
                fileContent: '',
                upgrade,
            });
            expect(update).toEqual('');
        });
    });
});
//# sourceMappingURL=update.spec.js.map