"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const platforms_1 = require("../../constants/platforms");
const auth_1 = require("./auth");
describe(util_1.getName(__filename), () => {
    describe('applyAuthorization', () => {
        it('does nothing', () => {
            const opts = {
                headers: { authorization: 'token' },
                hostname: 'amazon.com',
                href: 'https://amazon.com',
            };
            auth_1.applyAuthorization(opts);
            expect(opts).toMatchInlineSnapshot(`
        Object {
          "headers": Object {
            "authorization": "token",
          },
          "hostname": "amazon.com",
          "href": "https://amazon.com",
        }
      `);
        });
        it('gitea password', () => {
            const opts = {
                headers: {},
                hostType: platforms_1.PLATFORM_TYPE_GITEA,
                password: 'XXXX',
            };
            auth_1.applyAuthorization(opts);
            expect(opts).toMatchInlineSnapshot(`
        Object {
          "headers": Object {
            "authorization": "Basic OlhYWFg=",
          },
          "hostType": "gitea",
          "password": "XXXX",
        }
      `);
        });
        it('gittea token', () => {
            const opts = {
                headers: {},
                token: 'XXXX',
                hostType: platforms_1.PLATFORM_TYPE_GITEA,
            };
            auth_1.applyAuthorization(opts);
            expect(opts).toMatchInlineSnapshot(`
        Object {
          "headers": Object {
            "authorization": "token XXXX",
          },
          "hostType": "gitea",
          "token": "XXXX",
        }
      `);
        });
        it(`gitlab personal access token`, () => {
            const opts = {
                headers: {},
                // Personal Access Token is exactly 20 characters long
                token: '01234567890123456789',
                hostType: platforms_1.PLATFORM_TYPE_GITLAB,
            };
            auth_1.applyAuthorization(opts);
            expect(opts).toMatchInlineSnapshot(`
        Object {
          "headers": Object {
            "Private-token": "01234567890123456789",
          },
          "hostType": "gitlab",
          "token": "01234567890123456789",
        }
      `);
        });
        it(`gitlab oauth token`, () => {
            const opts = {
                headers: {},
                token: 'a40bdd925a0c0b9c4cdd19d101c0df3b2bcd063ab7ad6706f03bcffcec01e863',
                hostType: platforms_1.PLATFORM_TYPE_GITLAB,
            };
            auth_1.applyAuthorization(opts);
            expect(opts).toMatchInlineSnapshot(`
        Object {
          "headers": Object {
            "authorization": "Bearer a40bdd925a0c0b9c4cdd19d101c0df3b2bcd063ab7ad6706f03bcffcec01e863",
          },
          "hostType": "gitlab",
          "token": "a40bdd925a0c0b9c4cdd19d101c0df3b2bcd063ab7ad6706f03bcffcec01e863",
        }
      `);
        });
    });
    describe('removeAuthorization', () => {
        it('no authorization', () => {
            const opts = util_1.partial({
                hostname: 'amazon.com',
                href: 'https://amazon.com',
                search: 'something X-Amz-Algorithm something',
            });
            auth_1.removeAuthorization(opts);
            expect(opts).toEqual({
                hostname: 'amazon.com',
                href: 'https://amazon.com',
                search: 'something X-Amz-Algorithm something',
            });
        });
        it('Amazon', () => {
            const opts = util_1.partial({
                password: 'auth',
                headers: {
                    authorization: 'auth',
                },
                hostname: 'amazon.com',
                href: 'https://amazon.com',
                search: 'something X-Amz-Algorithm something',
            });
            auth_1.removeAuthorization(opts);
            expect(opts).toEqual({
                headers: {},
                hostname: 'amazon.com',
                href: 'https://amazon.com',
                search: 'something X-Amz-Algorithm something',
            });
        });
        it('Amazon ports', () => {
            const opts = util_1.partial({
                password: 'auth',
                headers: {
                    authorization: 'auth',
                },
                hostname: 'amazon.com',
                href: 'https://amazon.com',
                port: 3000,
                search: 'something X-Amz-Algorithm something',
            });
            auth_1.removeAuthorization(opts);
            expect(opts).toEqual({
                headers: {},
                hostname: 'amazon.com',
                href: 'https://amazon.com',
                search: 'something X-Amz-Algorithm something',
            });
        });
        it('Azure blob', () => {
            const opts = util_1.partial({
                password: 'auth',
                headers: {
                    authorization: 'auth',
                },
                hostname: 'store123.blob.core.windows.net',
                href: 'https://<store>.blob.core.windows.net/<some id>//docker/registry/v2/blobs',
            });
            auth_1.removeAuthorization(opts);
            expect(opts).toEqual({
                headers: {},
                hostname: 'store123.blob.core.windows.net',
                href: 'https://<store>.blob.core.windows.net/<some id>//docker/registry/v2/blobs',
            });
        });
        it('keep auth', () => {
            const opts = util_1.partial({
                password: 'auth',
                headers: {
                    authorization: 'auth',
                },
                hostname: 'renovate.com',
                href: 'https://renovate.com',
                search: 'something',
            });
            auth_1.removeAuthorization(opts);
            expect(opts).toEqual({
                password: 'auth',
                headers: {
                    authorization: 'auth',
                },
                hostname: 'renovate.com',
                href: 'https://renovate.com',
                search: 'something',
            });
        });
    });
});
//# sourceMappingURL=auth.spec.js.map