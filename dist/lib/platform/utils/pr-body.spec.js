"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const pr_body_1 = require("./pr-body");
describe('platform/utils/pr-body', () => {
    let prBody;
    beforeAll(async () => {
        prBody = await fs_extra_1.default.readFile('lib/platform/utils/__fixtures__/pr-body.txt', 'utf8');
    });
    describe('.smartTruncate', () => {
        it('truncates to 1000', () => {
            const body = pr_body_1.smartTruncate(prBody, 1000);
            expect(body).toMatchSnapshot();
            expect(body.length < prBody.length).toEqual(true);
        });
        it('truncates to 300 not smart', () => {
            const body = pr_body_1.smartTruncate(prBody, 300);
            expect(body).toMatchSnapshot();
            expect(body).toHaveLength(300);
        });
        it('truncates to 10', () => {
            const body = pr_body_1.smartTruncate('Lorem ipsum dolor sit amet', 10);
            expect(body).toEqual('Lorem ipsu');
        });
        it('does not truncate', () => {
            expect(pr_body_1.smartTruncate(prBody, 60000)).toEqual(prBody);
        });
    });
});
//# sourceMappingURL=pr-body.spec.js.map