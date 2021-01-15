"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleSize = exports.setUtilConfig = void 0;
const exec_1 = require("./exec");
const fs_1 = require("./fs");
async function setUtilConfig(config) {
    await exec_1.setExecConfig(config);
    fs_1.setFsConfig(config);
}
exports.setUtilConfig = setUtilConfig;
function sampleSize(array, n) {
    const length = array == null ? 0 : array.length;
    if (!length || n < 1) {
        return [];
    }
    // eslint-disable-next-line no-param-reassign
    n = n > length ? length : n;
    let index = 0;
    const lastIndex = length - 1;
    const result = [...array];
    while (index < n) {
        const rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
        [result[rand], result[index]] = [result[index], result[rand]];
        index += 1;
    }
    return result.slice(0, n);
}
exports.sampleSize = sampleSize;
//# sourceMappingURL=index.js.map