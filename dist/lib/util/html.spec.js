"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../test/util");
const html_1 = require("./html");
describe(util_1.getName(__filename), () => {
    it('parses HTML', () => {
        const body = html_1.parse('<div>Hello, world!</div>');
        expect(body.childElementCount).toBe(1);
        const div = body.children[0];
        expect(div.tagName).toBe('DIV');
        expect(div.textContent).toBe('Hello, world!');
    });
    it('returns empty', () => {
        const body = html_1.parse('');
        expect(body.childElementCount).toBe(0);
    });
});
//# sourceMappingURL=html.spec.js.map