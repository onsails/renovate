"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const proxy_1 = require("./proxy");
describe('proxy', () => {
    const httpProxy = 'http://example.org/http-proxy';
    const httpsProxy = 'http://example.org/https-proxy';
    const noProxy = 'http://example.org/no-proxy';
    beforeEach(() => {
        delete process.env.HTTP_PROXY;
        delete process.env.HTTPS_PROXY;
        delete process.env.NO_PROXY;
        delete process.env.no_proxy;
    });
    it('respects HTTP_PROXY', () => {
        process.env.HTTP_PROXY = httpProxy;
        proxy_1.bootstrap();
        expect(proxy_1.hasProxy()).toBeTrue();
    });
    it('respects HTTPS_PROXY', () => {
        process.env.HTTPS_PROXY = httpsProxy;
        proxy_1.bootstrap();
        expect(proxy_1.hasProxy()).toBeTrue();
    });
    it('does nothing', () => {
        process.env.no_proxy = noProxy;
        proxy_1.bootstrap();
        expect(proxy_1.hasProxy()).toBeFalse();
    });
});
//# sourceMappingURL=proxy.spec.js.map