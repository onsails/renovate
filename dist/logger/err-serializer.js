"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = __importDefault(require("@sindresorhus/is"));
const utils_1 = __importDefault(require("./utils"));
Error.stackTraceLimit = 20;
function errSerializer(err) {
    const response = utils_1.default(err);
    // already done by `sanitizeValue` ?
    const redactedFields = ['message', 'stack', 'stdout', 'stderr'];
    for (const field of redactedFields) {
        const val = response[field];
        if (is_1.default.string(val)) {
            response[field] = val.replace(/https:\/\/[^@]*?@/g, 'https://**redacted**@');
        }
    }
    return response;
}
exports.default = errSerializer;
//# sourceMappingURL=err-serializer.js.map