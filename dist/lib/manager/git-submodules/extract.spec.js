"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_mock_extended_1 = require("jest-mock-extended");
const simple_git_1 = __importDefault(require("simple-git"));
const util_1 = require("../../../test/util");
const extract_1 = __importDefault(require("./extract"));
jest.mock('simple-git');
const simpleGit = simple_git_1.default;
const Git = jest.requireActual('simple-git');
const localDir = `${__dirname}/__fixtures__`;
describe('lib/manager/gitsubmodules/extract', () => {
    beforeAll(() => {
        simpleGit.mockImplementation((basePath) => {
            const git = Git(basePath);
            return {
                subModule() {
                    return util_1.partial(Promise.resolve('4b825dc642cb6eb9a060e54bf8d69288fbee4904'));
                },
                raw(options) {
                    if (options.includes('remote.origin.url')) {
                        return util_1.partial(Promise.resolve('https://github.com/renovatebot/renovate.git'));
                    }
                    return git.raw(options);
                },
                listRemote() {
                    return util_1.partial(Promise.resolve('ref: refs/heads/main  HEAD\n5701164b9f5edba1f6ca114c491a564ffb55a964        HEAD'));
                },
                ...jest_mock_extended_1.mock(),
            };
        });
    });
    describe('extractPackageFile()', () => {
        it('extracts submodules', async () => {
            let res;
            expect(await extract_1.default('', '.gitmodules.1', { localDir })).toBeNull();
            res = await extract_1.default('', '.gitmodules.2', { localDir });
            expect(res.deps).toHaveLength(1);
            expect(res.deps[0].registryUrls[1]).toEqual('main');
            res = await extract_1.default('', '.gitmodules.3', { localDir });
            expect(res.deps).toHaveLength(1);
            res = await extract_1.default('', '.gitmodules.4', { localDir });
            expect(res.deps).toHaveLength(1);
            res = await extract_1.default('', '.gitmodules.5', { localDir });
            expect(res.deps).toHaveLength(3);
            expect(res.deps[2].registryUrls[0]).toEqual('https://github.com/renovatebot/renovate-config.git');
        });
    });
});
//# sourceMappingURL=extract.spec.js.map