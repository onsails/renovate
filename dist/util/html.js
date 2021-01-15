"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const jsdom_1 = require("jsdom");
function parse(html) {
    return new jsdom_1.JSDOM(html).window.document.body;
}
exports.parse = parse;
//# sourceMappingURL=html.js.map