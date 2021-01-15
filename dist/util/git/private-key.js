"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configSigningKey = exports.writePrivateKey = exports.setPrivateKey = void 0;
const os_1 = __importDefault(require("os"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const upath_1 = __importDefault(require("upath"));
const error_messages_1 = require("../../constants/error-messages");
const logger_1 = require("../../logger");
const exec_1 = require("../exec");
let gitPrivateKey;
let keyId;
function setPrivateKey(key) {
    gitPrivateKey = key;
}
exports.setPrivateKey = setPrivateKey;
async function importKey() {
    if (keyId) {
        return;
    }
    const keyFileName = upath_1.default.join(os_1.default.tmpdir() + '/git-private.key');
    await fs_extra_1.default.outputFile(keyFileName, gitPrivateKey);
    const { stdout, stderr } = await exec_1.exec(`gpg --import ${keyFileName}`);
    logger_1.logger.debug({ stdout, stderr }, 'Private key import result');
    keyId = (stdout + stderr)
        .split('\n')
        .find((line) => line.includes('secret key imported'))
        .replace('gpg: key ', '')
        .split(':')
        .shift();
    await fs_extra_1.default.remove(keyFileName);
}
async function writePrivateKey() {
    if (!gitPrivateKey) {
        return;
    }
    logger_1.logger.debug('Setting git private key');
    try {
        await importKey();
    }
    catch (err) {
        logger_1.logger.warn({ err }, 'Error writing git private key');
        throw new Error(error_messages_1.PLATFORM_GPG_FAILED);
    }
}
exports.writePrivateKey = writePrivateKey;
async function configSigningKey(cwd) {
    if (!gitPrivateKey) {
        return;
    }
    logger_1.logger.debug('Configuring commits signing');
    try {
        await exec_1.exec(`git config user.signingkey ${keyId}`, { cwd });
        await exec_1.exec(`git config commit.gpgsign true`, { cwd });
    }
    catch (err) {
        logger_1.logger.warn({ err }, 'Error configuring commits signing');
        throw new Error(error_messages_1.PLATFORM_GPG_FAILED);
    }
}
exports.configSigningKey = configSigningKey;
//# sourceMappingURL=private-key.js.map