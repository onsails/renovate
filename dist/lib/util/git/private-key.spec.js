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
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const exec_ = __importStar(require("../exec"));
const private_key_1 = require("./private-key");
jest.mock('fs-extra');
jest.mock('../exec');
const exec = util_1.mocked(exec_);
describe(util_1.getName(__filename), () => {
    describe('writePrivateKey()', () => {
        it('returns if no private key', async () => {
            await expect(private_key_1.writePrivateKey('/tmp/some-repo')).resolves.not.toThrow();
        });
        it('throws error if failing', async () => {
            private_key_1.setPrivateKey('some-key');
            exec.exec.mockResolvedValueOnce({
                stderr: `something wrong`,
                stdout: '',
            });
            await expect(private_key_1.writePrivateKey('/tmp/some-repo')).rejects.toThrow();
        });
        it('imports the private key', async () => {
            private_key_1.setPrivateKey('some-key');
            exec.exec.mockResolvedValueOnce({
                stderr: `gpg: key BADC0FFEE: secret key imported\nfoo\n`,
                stdout: '',
            });
            await expect(private_key_1.writePrivateKey('/tmp/some-repo')).resolves.not.toThrow();
        });
        it('does not import the key again', async () => {
            await expect(private_key_1.writePrivateKey('/tmp/some-repo')).resolves.not.toThrow();
        });
    });
});
//# sourceMappingURL=private-key.spec.js.map