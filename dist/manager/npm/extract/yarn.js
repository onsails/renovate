"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYarnLock = void 0;
const core_1 = require("@yarnpkg/core");
const parsers_1 = require("@yarnpkg/parsers");
const logger_1 = require("../../../logger");
const fs_1 = require("../../../util/fs");
async function getYarnLock(filePath) {
    const yarnLockRaw = await fs_1.readLocalFile(filePath, 'utf8');
    try {
        const parsed = parsers_1.parseSyml(yarnLockRaw);
        const lockedVersions = {};
        let lockfileVersion;
        for (const [key, val] of Object.entries(parsed)) {
            if (key === '__metadata') {
                // yarn 2
                lockfileVersion = parseInt(val.cacheKey, 10);
            }
            else {
                for (const entry of key.split(', ')) {
                    const { scope, name, range } = core_1.structUtils.parseDescriptor(entry);
                    const packageName = scope ? `@${scope}/${name}` : name;
                    const { selector } = core_1.structUtils.parseRange(range);
                    logger_1.logger.trace({ entry, version: val.version });
                    lockedVersions[packageName + '@' + selector] = parsed[key].version;
                }
            }
        }
        return {
            isYarn1: !('__metadata' in parsed),
            lockfileVersion,
            lockedVersions,
        };
    }
    catch (err) {
        logger_1.logger.debug({ filePath, err }, 'Warning: Exception parsing yarn.lock');
        return { isYarn1: true, lockedVersions: {} };
    }
}
exports.getYarnLock = getYarnLock;
//# sourceMappingURL=yarn.js.map