"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("./url");
describe('util/url', () => {
    test.each([
        ['http://foo.io', '', 'http://foo.io'],
        ['http://foo.io/', '', 'http://foo.io'],
        ['http://foo.io', '/', 'http://foo.io/'],
        ['http://foo.io/', '/', 'http://foo.io/'],
        ['http://foo.io', '/aaa', 'http://foo.io/aaa'],
        ['http://foo.io', 'aaa', 'http://foo.io/aaa'],
        ['http://foo.io/', '/aaa', 'http://foo.io/aaa'],
        ['http://foo.io/', 'aaa', 'http://foo.io/aaa'],
        ['http://foo.io', '/aaa/', 'http://foo.io/aaa/'],
        ['http://foo.io', 'aaa/', 'http://foo.io/aaa/'],
        ['http://foo.io/', '/aaa/', 'http://foo.io/aaa/'],
        ['http://foo.io/', 'aaa/', 'http://foo.io/aaa/'],
        ['http://foo.io/aaa', '/bbb', 'http://foo.io/aaa/bbb'],
        ['http://foo.io/aaa', 'bbb', 'http://foo.io/aaa/bbb'],
        ['http://foo.io/aaa/', '/bbb', 'http://foo.io/aaa/bbb'],
        ['http://foo.io/aaa/', 'bbb', 'http://foo.io/aaa/bbb'],
        ['http://foo.io/aaa', '/bbb/', 'http://foo.io/aaa/bbb/'],
        ['http://foo.io/aaa', 'bbb/', 'http://foo.io/aaa/bbb/'],
        ['http://foo.io/aaa/', '/bbb/', 'http://foo.io/aaa/bbb/'],
        ['http://foo.io/aaa/', 'bbb/', 'http://foo.io/aaa/bbb/'],
        ['http://foo.io', 'http://bar.io/bbb', 'http://bar.io/bbb'],
        ['http://foo.io/', 'http://bar.io/bbb', 'http://bar.io/bbb'],
        ['http://foo.io/aaa', 'http://bar.io/bbb', 'http://bar.io/bbb'],
        ['http://foo.io/aaa/', 'http://bar.io/bbb', 'http://bar.io/bbb'],
        ['http://foo.io', 'http://bar.io/bbb/', 'http://bar.io/bbb/'],
        ['http://foo.io/', 'http://bar.io/bbb/', 'http://bar.io/bbb/'],
        ['http://foo.io/aaa', 'http://bar.io/bbb/', 'http://bar.io/bbb/'],
        ['http://foo.io/aaa/', 'http://bar.io/bbb/', 'http://bar.io/bbb/'],
        ['http://foo.io', 'aaa?bbb=z', 'http://foo.io/aaa?bbb=z'],
        ['http://foo.io', '/aaa?bbb=z', 'http://foo.io/aaa?bbb=z'],
        ['http://foo.io/', 'aaa?bbb=z', 'http://foo.io/aaa?bbb=z'],
        ['http://foo.io/', '/aaa?bbb=z', 'http://foo.io/aaa?bbb=z'],
        ['http://foo.io', 'aaa/?bbb=z', 'http://foo.io/aaa?bbb=z'],
    ])('%s + %s => %s', (baseUrl, x, result) => {
        expect(url_1.resolveBaseUrl(baseUrl, x)).toBe(result);
    });
});
//# sourceMappingURL=url.spec.js.map