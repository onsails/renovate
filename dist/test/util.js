"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBufferSerializer = exports.addReplacingSerializer = exports.replacingSerializer = exports.getName = exports.getConfig = exports.defaultConfig = exports.logger = exports.hostRules = exports.env = exports.platform = exports.git = exports.fs = exports.partial = exports.mocked = void 0;
const crypto_1 = __importDefault(require("crypto"));
const globals_1 = require("@jest/globals");
const defaults_1 = require("../lib/config/defaults");
Object.defineProperty(exports, "getConfig", { enumerable: true, get: function () { return defaults_1.getConfig; } });
const _logger = __importStar(require("../lib/logger"));
const platform_1 = require("../lib/platform");
const _env = __importStar(require("../lib/util/exec/env"));
const _fs = __importStar(require("../lib/util/fs"));
const _git = __importStar(require("../lib/util/git"));
const _hostRules = __importStar(require("../lib/util/host-rules"));
/**
 * Simple wrapper for getting mocked version of a module
 * @param module module which is mocked by `jest.mock`
 */
function mocked(module) {
    return module;
}
exports.mocked = mocked;
/**
 * Simply wrapper to create partial mocks.
 * @param obj Object to cast to final type
 */
function partial(obj) {
    return obj;
}
exports.partial = partial;
exports.fs = mocked(_fs);
exports.git = mocked(_git);
exports.platform = mocked(platform_1.platform);
exports.env = mocked(_env);
exports.hostRules = mocked(_hostRules);
exports.logger = mocked(_logger);
exports.defaultConfig = defaults_1.getConfig();
function getName(file) {
    const [, name] = /lib\/(.*?)\.spec\.ts$/.exec(file.replace(/\\/g, '/'));
    return name;
}
exports.getName = getName;
/**
 * Can be used to search and replace strings in jest snapshots.
 * @example
 * expect.addSnapshotSerializer(
 *     replacingSerializer(upath.toUnix(gradleDir.path), 'localDir')
 * );
 */
const replacingSerializer = (search, replacement) => ({
    test: (value) => typeof value === 'string' && value.includes(search),
    serialize: (val, config, indent, depth, refs, printer) => {
        const replaced = val.replace(search, replacement);
        return printer(replaced, config, indent, depth, refs);
    },
});
exports.replacingSerializer = replacingSerializer;
function addReplacingSerializer(from, to) {
    globals_1.expect.addSnapshotSerializer(exports.replacingSerializer(from, to));
}
exports.addReplacingSerializer = addReplacingSerializer;
function toHash(buf) {
    return crypto_1.default.createHash('sha256').update(buf).digest('hex');
}
const bufferSerializer = {
    test: (value) => Buffer.isBuffer(value),
    serialize: (val, config, indent, depth, refs, printer) => {
        const replaced = toHash(val);
        return printer(replaced, config, indent, depth, refs);
    },
};
function addBufferSerializer() {
    globals_1.expect.addSnapshotSerializer(bufferSerializer);
}
exports.addBufferSerializer = addBufferSerializer;
//# sourceMappingURL=util.js.map