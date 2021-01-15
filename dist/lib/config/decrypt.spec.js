"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const decrypt_1 = require("./decrypt");
const privateKey = fs_1.default.readFileSync('lib/config/keys/__fixtures__/private.pem');
describe('config/decrypt', () => {
    describe('decryptConfig()', () => {
        let config;
        beforeEach(() => {
            config = {};
        });
        it('returns empty with no privateKey', () => {
            delete config.encrypted;
            const res = decrypt_1.decryptConfig(config);
            expect(res).toMatchObject(config);
        });
        it('warns if no privateKey found', () => {
            config.encrypted = { a: '1' };
            const res = decrypt_1.decryptConfig(config);
            expect(res.encrypted).not.toBeDefined();
            expect(res.a).not.toBeDefined();
        });
        it('handles invalid encrypted type', () => {
            config.encrypted = 1;
            config.privateKey = privateKey;
            const res = decrypt_1.decryptConfig(config, privateKey);
            expect(res.encrypted).not.toBeDefined();
        });
        it('handles invalid encrypted value', () => {
            config.encrypted = { a: 1 };
            config.privateKey = privateKey;
            expect(() => decrypt_1.decryptConfig(config, privateKey)).toThrow(Error('config-validation'));
        });
        it('replaces npm token placeholder in npmrc', () => {
            config.privateKey = privateKey;
            config.npmrc =
                '//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n'; // eslint-disable-line no-template-curly-in-string
            config.encrypted = {
                npmToken: 'FLA9YHIzpE7YetAg/P0X46npGRCMqn7hgyzwX5ZQ9wYgu9BRRbTiBVsUIFTyM5BuP1Q22slT2GkWvFvum7GU236Y6QiT7Nr8SLvtsJn2XUuq8H7REFKzdy3+wqyyWbCErYTFyY1dcPM7Ht+CaGDWdd8u/FsoX7AdMRs/X1jNUo6iSmlUiyGlYDKF+QMnCJom1VPVgZXWsGKdjI2MLny991QMaiv0VajmFIh4ENv4CtXOl/1twvIl/6XTXAaqpJJKDTPZEuydi+PHDZmal2RAOfrkH4m0UURa7SlfpUlIg+EaqbNGp85hCYXLwRcEET1OnYr3rH1oYkcYJ40any1tvQ==',
            };
            const res = decrypt_1.decryptConfig(config, privateKey);
            expect(res.encrypted).not.toBeDefined();
            expect(res.npmToken).not.toBeDefined();
            expect(res.npmrc).toEqual('//registry.npmjs.org/:_authToken=abcdef-ghijklm-nopqf-stuvwxyz\n//registry.npmjs.org/:_authToken=abcdef-ghijklm-nopqf-stuvwxyz\n');
        });
        it('appends npm token in npmrc', () => {
            config.privateKey = privateKey;
            config.npmrc = 'foo=bar\n'; // eslint-disable-line no-template-curly-in-string
            config.encrypted = {
                npmToken: 'FLA9YHIzpE7YetAg/P0X46npGRCMqn7hgyzwX5ZQ9wYgu9BRRbTiBVsUIFTyM5BuP1Q22slT2GkWvFvum7GU236Y6QiT7Nr8SLvtsJn2XUuq8H7REFKzdy3+wqyyWbCErYTFyY1dcPM7Ht+CaGDWdd8u/FsoX7AdMRs/X1jNUo6iSmlUiyGlYDKF+QMnCJom1VPVgZXWsGKdjI2MLny991QMaiv0VajmFIh4ENv4CtXOl/1twvIl/6XTXAaqpJJKDTPZEuydi+PHDZmal2RAOfrkH4m0UURa7SlfpUlIg+EaqbNGp85hCYXLwRcEET1OnYr3rH1oYkcYJ40any1tvQ==',
            };
            const res = decrypt_1.decryptConfig(config, privateKey);
            expect(res.encrypted).not.toBeDefined();
            expect(res.npmToken).not.toBeDefined();
            expect(res.npmrc).toMatchSnapshot();
        });
        it('decrypts nested', () => {
            config.privateKey = privateKey;
            config.packageFiles = [
                {
                    packageFile: 'package.json',
                    devDependencies: {
                        encrypted: {
                            branchPrefix: 'FLA9YHIzpE7YetAg/P0X46npGRCMqn7hgyzwX5ZQ9wYgu9BRRbTiBVsUIFTyM5BuP1Q22slT2GkWvFvum7GU236Y6QiT7Nr8SLvtsJn2XUuq8H7REFKzdy3+wqyyWbCErYTFyY1dcPM7Ht+CaGDWdd8u/FsoX7AdMRs/X1jNUo6iSmlUiyGlYDKF+QMnCJom1VPVgZXWsGKdjI2MLny991QMaiv0VajmFIh4ENv4CtXOl/1twvIl/6XTXAaqpJJKDTPZEuydi+PHDZmal2RAOfrkH4m0UURa7SlfpUlIg+EaqbNGp85hCYXLwRcEET1OnYr3rH1oYkcYJ40any1tvQ==',
                            npmToken: 'FLA9YHIzpE7YetAg/P0X46npGRCMqn7hgyzwX5ZQ9wYgu9BRRbTiBVsUIFTyM5BuP1Q22slT2GkWvFvum7GU236Y6QiT7Nr8SLvtsJn2XUuq8H7REFKzdy3+wqyyWbCErYTFyY1dcPM7Ht+CaGDWdd8u/FsoX7AdMRs/X1jNUo6iSmlUiyGlYDKF+QMnCJom1VPVgZXWsGKdjI2MLny991QMaiv0VajmFIh4ENv4CtXOl/1twvIl/6XTXAaqpJJKDTPZEuydi+PHDZmal2RAOfrkH4m0UURa7SlfpUlIg+EaqbNGp85hCYXLwRcEET1OnYr3rH1oYkcYJ40any1tvQ==',
                        },
                    },
                },
                'backend/package.json',
            ];
            const res = decrypt_1.decryptConfig(config, privateKey);
            expect(res.encrypted).not.toBeDefined();
            expect(res.packageFiles[0].devDependencies.encrypted).not.toBeDefined();
            expect(res.packageFiles[0].devDependencies.branchPrefix).toEqual('abcdef-ghijklm-nopqf-stuvwxyz');
            expect(res.packageFiles[0].devDependencies.npmToken).not.toBeDefined();
            expect(res.packageFiles[0].devDependencies.npmrc).toEqual('//registry.npmjs.org/:_authToken=abcdef-ghijklm-nopqf-stuvwxyz\n');
        });
    });
});
//# sourceMappingURL=decrypt.spec.js.map