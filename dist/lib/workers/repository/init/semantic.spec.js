"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../test/util");
const semantic_1 = require("./semantic");
jest.mock('../../../util/git');
let config;
beforeEach(() => {
    jest.resetAllMocks();
    config = util_1.getConfig();
    config.errors = [];
    config.warnings = [];
});
describe('workers/repository/init/semantic', () => {
    describe('detectSemanticCommits()', () => {
        it('detects false if unknown', async () => {
            config.semanticCommits = null;
            util_1.git.getCommitMessages.mockResolvedValue(['foo', 'bar']);
            const res = await semantic_1.detectSemanticCommits();
            expect(res).toBe('disabled');
        });
        it('detects true if known', async () => {
            config.semanticCommits = null;
            util_1.git.getCommitMessages.mockResolvedValue(['fix: foo', 'refactor: bar']);
            const res = await semantic_1.detectSemanticCommits();
            expect(res).toBe('enabled');
        });
    });
});
//# sourceMappingURL=semantic.spec.js.map