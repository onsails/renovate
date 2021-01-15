"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartLinks = void 0;
function smartLinks(body) {
    return body === null || body === void 0 ? void 0 : body.replace(/\]\(\.\.\/pull\//g, '](pulls/');
}
exports.smartLinks = smartLinks;
//# sourceMappingURL=utils.js.map