"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitbucketServerHttp = exports.setBaseUrl = void 0;
const platforms_1 = require("../../constants/platforms");
const url_1 = require("../url");
const _1 = require(".");
let baseUrl;
const setBaseUrl = (url) => {
    baseUrl = url;
};
exports.setBaseUrl = setBaseUrl;
class BitbucketServerHttp extends _1.Http {
    constructor(options) {
        super(platforms_1.PLATFORM_TYPE_BITBUCKET_SERVER, options);
    }
    request(path, options) {
        const url = url_1.resolveBaseUrl(baseUrl, path);
        const opts = {
            baseUrl,
            ...options,
        };
        opts.headers = {
            ...opts.headers,
            'X-Atlassian-Token': 'no-check',
        };
        return super.request(url, opts);
    }
}
exports.BitbucketServerHttp = BitbucketServerHttp;
//# sourceMappingURL=bitbucket-server.js.map