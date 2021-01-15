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
const platforms_1 = require("../constants/platforms");
const datasourceNuget = __importStar(require("../datasource/nuget"));
const host_rules_1 = require("./host-rules");
describe('util/host-rules', () => {
    beforeEach(() => {
        host_rules_1.clear();
    });
    describe('add()', () => {
        it('throws if both domainName and hostName', () => {
            expect(() => host_rules_1.add({
                hostType: platforms_1.PLATFORM_TYPE_AZURE,
                domainName: 'github.com',
                hostName: 'api.github.com',
            })).toThrow('hostRules cannot contain both a domainName and hostName');
        });
        it('throws if both domainName and baseUrl', () => {
            expect(() => host_rules_1.add({
                hostType: platforms_1.PLATFORM_TYPE_AZURE,
                domainName: 'github.com',
                baseUrl: 'https://api.github.com',
            })).toThrow('hostRules cannot contain both a domainName and baseUrl');
        });
        it('throws if both hostName and baseUrl', () => {
            expect(() => host_rules_1.add({
                hostType: platforms_1.PLATFORM_TYPE_AZURE,
                hostName: 'api.github.com',
                baseUrl: 'https://api.github.com',
            })).toThrow('hostRules cannot contain both a hostName and baseUrl');
        });
        it('supports baseUrl-only', () => {
            host_rules_1.add({
                baseUrl: 'https://some.endpoint',
                username: 'user1',
                password: 'pass1',
            });
            expect(host_rules_1.find({ url: 'https://some.endpoint/v3/' })).toMatchSnapshot();
        });
    });
    describe('find()', () => {
        it('warns and returns empty for bad search', () => {
            expect(host_rules_1.find({ abc: 'def' })).toEqual({});
        });
        it('needs exact host matches', () => {
            host_rules_1.add({
                hostType: datasourceNuget.id,
                hostName: 'nuget.org',
                username: 'root',
                password: 'p4$$w0rd',
                token: undefined,
            });
            expect(host_rules_1.find({ hostType: datasourceNuget.id })).toMatchSnapshot();
            expect(host_rules_1.find({ hostType: datasourceNuget.id, url: 'https://nuget.org' })).not.toEqual({});
            expect(host_rules_1.find({ hostType: datasourceNuget.id, url: 'https://not.nuget.org' })).toEqual({});
            expect(host_rules_1.find({ hostType: datasourceNuget.id, url: 'https://not-nuget.org' })).toEqual({});
        });
        it('matches on empty rules', () => {
            host_rules_1.add({
                json: true,
            });
            expect(host_rules_1.find({ hostType: datasourceNuget.id, url: 'https://api.github.com' })).toEqual({ json: true });
        });
        it('matches on hostType', () => {
            host_rules_1.add({
                hostType: datasourceNuget.id,
                token: 'abc',
            });
            expect(host_rules_1.find({ hostType: datasourceNuget.id, url: 'https://nuget.local/api' })).toMatchSnapshot();
        });
        it('matches on domainName', () => {
            host_rules_1.add({
                domainName: 'github.com',
                token: 'def',
            });
            expect(host_rules_1.find({ hostType: datasourceNuget.id, url: 'https://api.github.com' })
                .token).toEqual('def');
        });
        it('matches on hostName', () => {
            host_rules_1.add({
                hostName: 'nuget.local',
                token: 'abc',
            });
            expect(host_rules_1.find({ hostType: datasourceNuget.id, url: 'https://nuget.local/api' })).toMatchSnapshot();
        });
        it('matches on hostType and endpoint', () => {
            host_rules_1.add({
                hostType: datasourceNuget.id,
                baseUrl: 'https://nuget.local/api',
                token: 'abc',
            });
            expect(host_rules_1.find({ hostType: datasourceNuget.id, url: 'https://nuget.local/api' })
                .token).toEqual('abc');
        });
        it('matches on endpoint subresource', () => {
            host_rules_1.add({
                hostType: datasourceNuget.id,
                baseUrl: 'https://nuget.local/api',
                token: 'abc',
            });
            expect(host_rules_1.find({
                hostType: datasourceNuget.id,
                url: 'https://nuget.local/api/sub-resource',
            })).toMatchSnapshot();
        });
        it('returns hosts', () => {
            host_rules_1.add({
                hostType: datasourceNuget.id,
                token: 'aaaaaa',
            });
            host_rules_1.add({
                hostType: datasourceNuget.id,
                baseUrl: 'https://nuget.local/api',
                token: 'abc',
            });
            host_rules_1.add({
                hostType: datasourceNuget.id,
                hostName: 'my.local.registry',
                token: 'def',
            });
            const res = host_rules_1.hosts({
                hostType: datasourceNuget.id,
            });
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(2);
        });
    });
    describe('findAll()', () => {
        it('warns and returns empty for bad search', () => {
            expect(host_rules_1.findAll({ abc: 'def' })).toEqual([]);
        });
        it('needs exact host matches', () => {
            const hostRule = {
                hostType: 'nuget',
                hostName: 'nuget.org',
                username: 'root',
                password: 'p4$$w0rd',
                token: undefined,
            };
            host_rules_1.add(hostRule);
            expect(host_rules_1.findAll({ hostType: 'nuget' })).toHaveLength(1);
            expect(host_rules_1.findAll({ hostType: 'nuget' })[0]).toEqual(hostRule);
        });
    });
});
//# sourceMappingURL=host-rules.spec.js.map