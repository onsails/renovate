"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const read_only_issue_body_1 = require("./read-only-issue-body");
describe('platform/utils/read-only-issue-body', () => {
    let issueBody;
    beforeAll(async () => {
        issueBody = await fs_extra_1.default.readFile('lib/platform/utils/__fixtures__/issue-body.txt', 'utf8');
    });
    describe('.readOnlyIssueBody', () => {
        it('removes all checkbox formatting', () => {
            expect(read_only_issue_body_1.readOnlyIssueBody(issueBody)).toEqual(expect.not.stringContaining('[ ] <!--'));
        });
        it('removes all checkbox-related instructions', () => {
            expect(read_only_issue_body_1.readOnlyIssueBody(issueBody)).toEqual(expect.not.stringMatching(/click (?:(?:on |)a|their) checkbox|check the box below/gi));
        });
    });
});
//# sourceMappingURL=read-only-issue-body.spec.js.map