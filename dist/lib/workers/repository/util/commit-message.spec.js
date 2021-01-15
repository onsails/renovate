"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commit_message_1 = require("./commit-message");
describe('workers/repository/util/commit-message', () => {
    describe('COMMIT_MESSAGE_PREFIX_END_CHARACTER', () => {
        it('is a colon character', () => {
            expect(commit_message_1.COMMIT_MESSAGE_PREFIX_SEPARATOR).toBe(':');
        });
    });
    describe('formatCommitMessagePrefix', () => {
        it.each([
            [
                'adds a separator',
                'does not end',
                'RENOV-123',
                `RENOV-123${commit_message_1.COMMIT_MESSAGE_PREFIX_SEPARATOR}`,
            ],
            [
                'does nothing',
                'ends',
                `RENOV-123${commit_message_1.COMMIT_MESSAGE_PREFIX_SEPARATOR}`,
                `RENOV-123${commit_message_1.COMMIT_MESSAGE_PREFIX_SEPARATOR}`,
            ],
        ])('%s when the prefix %s with a separator', (expectedAction, endingState, commitMessagePrefix, expectedPrefix) => {
            expect(commit_message_1.formatCommitMessagePrefix(commitMessagePrefix)).toBe(expectedPrefix);
        });
    });
});
//# sourceMappingURL=commit-message.spec.js.map