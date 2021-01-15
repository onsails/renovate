"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jest_mock_extended_1 = require("jest-mock-extended");
const util_1 = require("../../../test/util");
const code_owners_1 = require("./code-owners");
jest.mock('../../util/fs');
jest.mock('../../util/git');
describe('workers/pr/code-owners', () => {
    describe('codeOwnersForPr', () => {
        let pr;
        beforeEach(() => {
            jest.resetAllMocks();
            pr = jest_mock_extended_1.mock();
        });
        it('returns global code owner', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce(['* @jimmy'].join('\n'));
            util_1.git.getBranchFiles.mockResolvedValueOnce(['README.md']);
            const codeOwners = await code_owners_1.codeOwnersForPr(pr);
            expect(codeOwners).toEqual(['@jimmy']);
        });
        it('returns more specific code owners', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce(['* @jimmy', 'package.json @john @maria'].join('\n'));
            util_1.git.getBranchFiles.mockResolvedValueOnce(['package.json']);
            const codeOwners = await code_owners_1.codeOwnersForPr(pr);
            expect(codeOwners).toEqual(['@john', '@maria']);
        });
        it('ignores comments and leading/trailing whitespace', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce([
                '# comment line',
                '    \t    ',
                '   * @jimmy     ',
                '        # comment line with leading whitespace',
                ' package.json @john @maria  ',
            ].join('\n'));
            util_1.git.getBranchFiles.mockResolvedValueOnce(['package.json']);
            const codeOwners = await code_owners_1.codeOwnersForPr(pr);
            expect(codeOwners).toEqual(['@john', '@maria']);
        });
        it('returns empty array when no code owners set', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce(null);
            util_1.git.getBranchFiles.mockResolvedValueOnce(['package.json']);
            const codeOwners = await code_owners_1.codeOwnersForPr(pr);
            expect(codeOwners).toEqual([]);
        });
        it('returns empty array when no code owners match', async () => {
            util_1.fs.readLocalFile.mockResolvedValueOnce(['package-lock.json @mike'].join('\n'));
            util_1.git.getBranchFiles.mockResolvedValueOnce(['yarn.lock']);
            const codeOwners = await code_owners_1.codeOwnersForPr(pr);
            expect(codeOwners).toEqual([]);
        });
        it('returns empty array when error occurs', async () => {
            util_1.fs.readLocalFile.mockImplementationOnce((_, __) => {
                throw new Error();
            });
            const codeOwners = await code_owners_1.codeOwnersForPr(pr);
            expect(codeOwners).toEqual([]);
        });
        const codeOwnerFilePaths = [
            'CODEOWNERS',
            '.github/CODEOWNERS',
            '.gitlab/CODEOWNERS',
            'docs/CODEOWNERS',
        ];
        codeOwnerFilePaths.forEach((codeOwnerFilePath) => {
            it(`detects code owner file at '${codeOwnerFilePath}'`, async () => {
                util_1.fs.readLocalFile.mockImplementation((path, _) => {
                    if (path === codeOwnerFilePath) {
                        return Promise.resolve(['* @mike'].join('\n'));
                    }
                    return Promise.resolve(null);
                });
                util_1.git.getBranchFiles.mockResolvedValueOnce(['README.md']);
                const codeOwners = await code_owners_1.codeOwnersForPr(pr);
                expect(codeOwners).toEqual(['@mike']);
            });
        });
    });
});
//# sourceMappingURL=code-owners.spec.js.map