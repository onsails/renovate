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
const __1 = require("..");
const httpMock = __importStar(require("../../../test/http-mock"));
const _1 = require(".");
describe('datasource/gitlab-tags', () => {
    beforeEach(() => {
        httpMock.reset();
        httpMock.setup();
    });
    describe('getReleases', () => {
        it('returns tags from custom registry', async () => {
            const body = [
                {
                    name: 'v1.0.0',
                    commit: {
                        created_at: '2020-03-04T12:01:37.000-06:00',
                    },
                },
                {
                    name: 'v1.1.0',
                    commit: {},
                },
                {
                    name: 'v1.1.1',
                },
            ];
            httpMock
                .scope('https://gitlab.company.com')
                .get('/api/v4/projects/some%2Fdep2/repository/tags?per_page=100')
                .reply(200, body);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                registryUrls: ['https://gitlab.company.com/api/v4/'],
                depName: 'some/dep2',
            });
            expect(res).toMatchSnapshot();
            expect(res.releases).toHaveLength(3);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns tags with default registry', async () => {
            const body = [{ name: 'v1.0.0' }, { name: 'v1.1.0' }];
            httpMock
                .scope('https://gitlab.com')
                .get('/api/v4/projects/some%2Fdep2/repository/tags?per_page=100')
                .reply(200, body);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'some/dep2',
            });
            expect(res).toMatchSnapshot();
            expect(res.releases).toHaveLength(2);
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=index.spec.js.map