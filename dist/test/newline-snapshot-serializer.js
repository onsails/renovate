"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = exports.print = void 0;
let prev;
// this does not work as intended
// see https://jestjs.io/docs/en/configuration#snapshotserializers-arraystring
function print(val) {
    return JSON.stringify(val);
}
exports.print = print;
function test(val) {
    if (['prBody', 'prTitle'].some((str) => str === prev)) {
        return typeof val === 'string' && val.includes('\n');
    }
    prev = val;
    return false;
}
exports.test = test;
//# sourceMappingURL=newline-snapshot-serializer.js.map