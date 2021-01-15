"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const host_rules_1 = require("../../util/host-rules");
const host_rules_2 = require("./host-rules");
describe('lib/manager/bundler/host-rules', () => {
    beforeEach(() => {
        host_rules_1.clear();
    });
    describe('getDomain()', () => {
        it('returns the hostName if hostName is present', () => {
            expect(host_rules_2.getDomain({
                hostName: 'api.github.com',
            })).toEqual('api.github.com');
        });
        it('returns the domainName if domainName is present and hostName is not present', () => {
            expect(host_rules_2.getDomain({
                domainName: 'github.com',
            })).toEqual('github.com');
        });
        it('returns the hostName if hostName and domainName are present', () => {
            expect(host_rules_2.getDomain({
                hostName: 'api.github.com',
                domainName: 'github.com',
            })).toEqual('api.github.com');
        });
        it('returns the baseUrl host if hostName and domainName are not present', () => {
            expect(host_rules_2.getDomain({
                baseUrl: 'https://github.com',
            })).toEqual('github.com');
        });
        it('returns undefined if hostName, domainName and baseUrl are not present', () => {
            expect(host_rules_2.getDomain({})).toBeNull();
        });
    });
    describe('getAuthenticationHeaderValue()', () => {
        it('returns the authentication header with the password', () => {
            expect(host_rules_2.getAuthenticationHeaderValue({
                username: 'test',
                password: 'password',
            })).toEqual('test:password');
        });
        it('returns the authentication header with the token', () => {
            expect(host_rules_2.getAuthenticationHeaderValue({
                token: 'token',
            })).toEqual('token');
        });
    });
    describe('findAllAuthenticatable()', () => {
        let hostRule;
        beforeEach(() => {
            hostRule = {
                hostType: 'nuget',
                hostName: 'nuget.org',
                domainName: 'api.nuget.org',
                username: 'root',
                password: 'p4$$w0rd',
                token: 'token',
            };
        });
        it('returns an empty array if domainName, hostName and baseUrl are missing', () => {
            delete hostRule.hostName;
            delete hostRule.domainName;
            host_rules_1.add(hostRule);
            expect(host_rules_2.findAllAuthenticatable({ hostType: 'nuget' })).toEqual([]);
        });
        it('returns an empty array if username is missing and password is present', () => {
            delete hostRule.domainName;
            delete hostRule.username;
            delete hostRule.password;
            delete hostRule.token;
            host_rules_1.add(hostRule);
            expect(host_rules_2.findAllAuthenticatable({ hostType: 'nuget' })).toEqual([]);
        });
        it('returns an empty array if password and token are missing', () => {
            delete hostRule.domainName;
            delete hostRule.password;
            delete hostRule.token;
            host_rules_1.add(hostRule);
            expect(host_rules_2.findAllAuthenticatable({ hostType: 'nuget' })).toEqual([]);
        });
        it('returns the hostRule if using hostName and password', () => {
            delete hostRule.domainName;
            delete hostRule.token;
            host_rules_1.add(hostRule);
            expect(host_rules_2.findAllAuthenticatable({ hostType: 'nuget' })).toEqual([
                hostRule,
            ]);
        });
        it('returns the hostRule if using domainName and password', () => {
            delete hostRule.hostName;
            delete hostRule.token;
            host_rules_1.add(hostRule);
            expect(host_rules_2.findAllAuthenticatable({ hostType: 'nuget' })).toEqual([
                hostRule,
            ]);
        });
        it('returns the hostRule if using hostName and token', () => {
            delete hostRule.domainName;
            delete hostRule.password;
            host_rules_1.add(hostRule);
            expect(host_rules_2.findAllAuthenticatable({ hostType: 'nuget' })).toEqual([
                hostRule,
            ]);
        });
        it('returns the hostRule if using domainName and token', () => {
            delete hostRule.hostName;
            delete hostRule.password;
            host_rules_1.add(hostRule);
            expect(host_rules_2.findAllAuthenticatable({ hostType: 'nuget' })).toEqual([
                hostRule,
            ]);
        });
        it('returns the hostRule if using baseUrl and password', () => {
            hostRule.baseUrl = 'https://nuget.com';
            delete hostRule.domainName;
            delete hostRule.hostName;
            host_rules_1.add(hostRule);
            expect(host_rules_2.findAllAuthenticatable({ hostType: 'nuget' })).toEqual([
                hostRule,
            ]);
        });
        it('returns the hostRule if using baseUrl and token', () => {
            hostRule.baseUrl = 'https://nuget.com';
            delete hostRule.hostName;
            delete hostRule.domainName;
            host_rules_1.add(hostRule);
            expect(host_rules_2.findAllAuthenticatable({ hostType: 'nuget' })).toEqual([
                hostRule,
            ]);
        });
    });
});
//# sourceMappingURL=host-rules.spec.js.map