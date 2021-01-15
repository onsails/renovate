"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sanitize_1 = require("./sanitize");
describe('util/sanitize', () => {
    beforeEach(() => {
        sanitize_1.clear();
    });
    it('sanitizes empty string', () => {
        expect(sanitize_1.sanitize(null)).toBeNull();
    });
    it('sanitizes secrets from strings', () => {
        const token = 'abc123token';
        const username = 'userabc';
        const password = 'password123';
        sanitize_1.add(token);
        const hashed = Buffer.from(`${username}:${password}`).toString('base64');
        sanitize_1.add(hashed);
        sanitize_1.add(password);
        expect(sanitize_1.sanitize(`My token is ${token}, username is "${username}" and password is "${password}" (hashed: ${hashed})`)).toMatchSnapshot();
    });
});
//# sourceMappingURL=sanitize.spec.js.map