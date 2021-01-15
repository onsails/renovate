"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvalidReviewers = exports.isInvalidReviewersResponse = exports.accumulateValues = exports.prInfo = void 0;
// SEE for the reference https://github.com/renovatebot/renovate/blob/c3e9e572b225085448d94aa121c7ec81c14d3955/lib/platform/bitbucket/utils.js
const url_1 = __importDefault(require("url"));
const types_1 = require("../../types");
const bitbucket_server_1 = require("../../util/http/bitbucket-server");
const BITBUCKET_INVALID_REVIEWERS_EXCEPTION = 'com.atlassian.bitbucket.pull.InvalidPullRequestReviewersException';
const bitbucketServerHttp = new bitbucket_server_1.BitbucketServerHttp();
// https://docs.atlassian.com/bitbucket-server/rest/6.0.0/bitbucket-rest.html#idp250
const prStateMapping = {
    MERGED: types_1.PrState.Merged,
    DECLINED: types_1.PrState.Closed,
    OPEN: types_1.PrState.Open,
};
function prInfo(pr) {
    return {
        version: pr.version,
        number: pr.id,
        body: pr.description,
        sourceBranch: pr.fromRef.displayId,
        targetBranch: pr.toRef.displayId,
        title: pr.title,
        state: prStateMapping[pr.state],
        createdAt: pr.createdDate,
    };
}
exports.prInfo = prInfo;
const addMaxLength = (inputUrl, limit = 100) => {
    const { search, ...parsedUrl } = url_1.default.parse(inputUrl, true); // eslint-disable-line @typescript-eslint/no-unused-vars
    const maxedUrl = url_1.default.format({
        ...parsedUrl,
        query: { ...parsedUrl.query, limit },
    });
    return maxedUrl;
};
function callApi(apiUrl, method, options) {
    /* istanbul ignore next */
    switch (method.toLowerCase()) {
        case 'post':
            return bitbucketServerHttp.postJson(apiUrl, options);
        case 'put':
            return bitbucketServerHttp.putJson(apiUrl, options);
        case 'patch':
            return bitbucketServerHttp.patchJson(apiUrl, options);
        case 'head':
            return bitbucketServerHttp.headJson(apiUrl, options);
        case 'delete':
            return bitbucketServerHttp.deleteJson(apiUrl, options);
        case 'get':
        default:
            return bitbucketServerHttp.getJson(apiUrl, options);
    }
}
async function accumulateValues(reqUrl, method = 'get', options, limit) {
    let accumulator = [];
    let nextUrl = addMaxLength(reqUrl, limit);
    while (typeof nextUrl !== 'undefined') {
        // TODO: fix typing
        const { body } = await callApi(nextUrl, method, options);
        accumulator = [...accumulator, ...body.values];
        if (body.isLastPage !== false) {
            break;
        }
        const { search, ...parsedUrl } = url_1.default.parse(nextUrl, true); // eslint-disable-line @typescript-eslint/no-unused-vars
        nextUrl = url_1.default.format({
            ...parsedUrl,
            query: {
                ...parsedUrl.query,
                start: body.nextPageStart,
            },
        });
    }
    return accumulator;
}
exports.accumulateValues = accumulateValues;
function isInvalidReviewersResponse(err) {
    var _a, _b;
    const errors = ((_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.errors) || [];
    return (errors.length > 0 &&
        errors.every((error) => error.exceptionName === BITBUCKET_INVALID_REVIEWERS_EXCEPTION));
}
exports.isInvalidReviewersResponse = isInvalidReviewersResponse;
function getInvalidReviewers(err) {
    var _a, _b, _c;
    const errors = ((_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.errors) || [];
    let invalidReviewers = [];
    for (const error of errors) {
        if (error.exceptionName === BITBUCKET_INVALID_REVIEWERS_EXCEPTION) {
            invalidReviewers = invalidReviewers.concat(((_c = error.reviewerErrors) === null || _c === void 0 ? void 0 : _c.map(({ context }) => context)) || []);
        }
    }
    return invalidReviewers;
}
exports.getInvalidReviewers = getInvalidReviewers;
//# sourceMappingURL=utils.js.map