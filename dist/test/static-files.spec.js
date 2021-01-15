"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const glob = util_1.default.promisify(require('glob'));
const ignoredExtensions = ['js', 'ts', 'md', 'pyc', 'DS_Store', 'map', 'snap'];
function filterFiles(files) {
    return files.filter((file) => ignoredExtensions.every((extension) => !file.endsWith(`.${extension}`)));
}
async function getFiles(dir) {
    return filterFiles(await glob(`${dir}/**/*`, {
        dot: true,
        nodir: true,
        ignore: ['**/__fixtures__/**/*', '**/__mocks__/**/*'],
    })).map((file) => file.replace(`${dir}/`, ''));
}
describe('static-files', () => {
    // workaround for GitHub macOS
    jest.setTimeout(10 * 1000);
    it('has same static files in lib and dist', async () => {
        expect(await getFiles('dist')).toEqual(await getFiles('lib'));
    });
});
//# sourceMappingURL=static-files.spec.js.map