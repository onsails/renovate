"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractContraints = exports.getConstraint = exports.composerVersioningId = void 0;
const logger_1 = require("../../logger");
const composer_1 = require("../../versioning/composer");
Object.defineProperty(exports, "composerVersioningId", { enumerable: true, get: function () { return composer_1.id; } });
function getConstraint(config) {
    const { constraints = {} } = config;
    const { composer } = constraints;
    if (composer) {
        logger_1.logger.debug('Using composer constraint from config');
        return composer;
    }
    return null;
}
exports.getConstraint = getConstraint;
function extractContraints(composerJson, lockParsed) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const res = { composer: '1.*' };
    // extract php
    if ((_a = composerJson.require) === null || _a === void 0 ? void 0 : _a.php) {
        res.php = (_b = composerJson.require) === null || _b === void 0 ? void 0 : _b.php;
    }
    // extract direct composer dependency
    if ((_c = composerJson.require) === null || _c === void 0 ? void 0 : _c['composer/composer']) {
        res.composer = (_d = composerJson.require) === null || _d === void 0 ? void 0 : _d['composer/composer'];
    }
    else if ((_e = composerJson['require-dev']) === null || _e === void 0 ? void 0 : _e['composer/composer']) {
        res.composer = (_f = composerJson['require-dev']) === null || _f === void 0 ? void 0 : _f['composer/composer'];
    }
    // check last used composer version
    else if (lockParsed === null || lockParsed === void 0 ? void 0 : lockParsed['plugin-api-version']) {
        const major = composer_1.api.getMajor(lockParsed === null || lockParsed === void 0 ? void 0 : lockParsed['plugin-api-version']);
        res.composer = `${major}.*`;
    }
    // check composer api dependency
    else if ((_g = composerJson.require) === null || _g === void 0 ? void 0 : _g['composer-runtime-api']) {
        const major = composer_1.api.getMajor((_h = composerJson.require) === null || _h === void 0 ? void 0 : _h['composer-runtime-api']);
        res.composer = `${major}.*`;
    }
    return res;
}
exports.extractContraints = extractContraints;
//# sourceMappingURL=utils.js.map