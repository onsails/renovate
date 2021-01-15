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
const res1 = `<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="go-import" content="golang.org/x/text git https://go.googlesource.com/text">
<meta name="go-source" content="golang.org/x/text https://github.com/golang/text/ https://github.com/golang/text/tree/master{/dir} https://github.com/golang/text/blob/master{/dir}/{file}#L{line}">
<meta http-equiv="refresh" content="0; url=https://godoc.org/golang.org/x/text">
</head>
<body>
Nothing to see here; <a href="https://godoc.org/golang.org/x/text">move along</a>.
</body>
</html>`;
const resGitHubEnterprise = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">

<title>Go remote import path metadata</title>
<meta name="go-import" content="git.enterprise.com/example/module git https://git.enterprise.com/example/module.git">
</head>

<body>
<!-- Metadata for Go remote import path -->
</body>
</html>`;
describe('datasource/go', () => {
    beforeEach(() => {
        httpMock.setup();
    });
    afterEach(() => {
        httpMock.reset();
    });
    describe('getDigest', () => {
        it('returns null for no go-source tag', async () => {
            httpMock
                .scope('https://golang.org/')
                .get('/y/text?go-get=1')
                .reply(200, '');
            const res = await _1.getDigest({ lookupName: 'golang.org/y/text' }, null);
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for wrong name', async () => {
            httpMock
                .scope('https://golang.org/')
                .get('/y/text?go-get=1')
                .reply(200, res1);
            const res = await _1.getDigest({ lookupName: 'golang.org/y/text' }, null);
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns digest', async () => {
            httpMock
                .scope('https://golang.org/')
                .get('/x/text?go-get=1')
                .reply(200, res1);
            httpMock
                .scope('https://api.github.com/')
                .get('/repos/golang/text/commits?per_page=1')
                .reply(200, [{ sha: 'abcdefabcdefabcdefabcdef' }]);
            const res = await _1.getDigest({ lookupName: 'golang.org/x/text' }, null);
            expect(res).toBe('abcdefabcdefabcdefabcdef');
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
    describe('getReleases', () => {
        it('returns null for empty result', async () => {
            httpMock
                .scope('https://golang.org/')
                .get('/foo/something?go-get=1')
                .reply(200, res1);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'golang.org/foo/something',
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for 404', async () => {
            httpMock
                .scope('https://golang.org/')
                .get('/foo/something?go-get=1')
                .reply(404);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'golang.org/foo/something',
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for unknown error', async () => {
            httpMock
                .scope('https://golang.org/')
                .get('/foo/something?go-get=1')
                .replyWithError('error');
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'golang.org/foo/something',
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('processes real data', async () => {
            httpMock
                .scope('https://golang.org/')
                .get('/x/text?go-get=1')
                .reply(200, res1);
            httpMock
                .scope('https://api.github.com/')
                .get('/repos/golang/text/tags?per_page=100')
                .reply(200, [{ name: 'v1.0.0' }, { name: 'v2.0.0' }])
                .get('/repos/golang/text/releases?per_page=100')
                .reply(200, []);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'golang.org/x/text',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(res).toBeDefined();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('support gitlab', async () => {
            httpMock
                .scope('https://golang.org/')
                .get('/x/text?go-get=1')
                .reply(200, res1.replace('https://github.com/golang/text/', 'https://gitlab.com/golang/text/'));
            httpMock
                .scope('https://gitlab.com/')
                .get('/api/v4/projects/golang%2Ftext/repository/tags?per_page=100')
                .reply(200, [{ name: 'v1.0.0' }, { name: 'v2.0.0' }]);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'golang.org/x/text',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(res).toBeDefined();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('support ghe', async () => {
            httpMock
                .scope('https://git.enterprise.com/')
                .get('/example/module?go-get=1')
                .reply(200, resGitHubEnterprise);
            httpMock
                .scope('https://git.enterprise.com/')
                .get('/api/v3/repos/example/module/tags?per_page=100')
                .reply(200, [{ name: 'v1.0.0' }, { name: 'v2.0.0' }])
                .get('/api/v3/repos/example/module/releases?per_page=100')
                .reply(200, []);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'git.enterprise.com/example/module',
            });
            expect(res).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(res).toBeDefined();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('returns null for go-import prefix mismatch', async () => {
            httpMock
                .scope('https://git.enterprise.com/')
                .get('/example/module?go-get=1')
                .reply(200, resGitHubEnterprise.replace('git.enterprise.com/example/module', 'git.enterprise.com/badexample/badmodule'));
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'git.enterprise.com/example/module',
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('skips wrong package', async () => {
            httpMock
                .scope('https://golang.org/')
                .get('/x/sys?go-get=1')
                .reply(200, res1);
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'golang.org/x/sys',
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('skips unsupported platform', async () => {
            httpMock
                .scope('https://golang.org/')
                .get('/x/text?go-get=1')
                .reply(200, res1.replace('https://github.com/golang/text/', 'https://google.com/golang/text/'));
            const res = await __1.getPkgReleases({
                datasource: _1.id,
                depName: 'golang.org/x/text',
            });
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('works for known servers', async () => {
            httpMock
                .scope('https://api.github.com/')
                .get('/repos/x/text/tags?per_page=100')
                .reply(200, [])
                .get('/repos/x/text/releases?per_page=100')
                .reply(200, [])
                .get('/repos/x/text/tags?per_page=100')
                .reply(200, [])
                .get('/repos/x/text/releases?per_page=100')
                .reply(200, [])
                .get('/repos/go-x/x/tags?per_page=100')
                .reply(200, [])
                .get('/repos/go-x/x/releases?per_page=100')
                .reply(200, []);
            const packages = [
                { datasource: _1.id, depName: 'github.com/x/text' },
                { datasource: _1.id, depName: 'gopkg.in/x/text' },
                { datasource: _1.id, depName: 'gopkg.in/x' },
            ];
            for (const pkg of packages) {
                const res = await __1.getPkgReleases(pkg);
                expect(res.releases).toBeEmpty();
            }
            const httpCalls = httpMock.getTrace();
            expect(httpCalls).toHaveLength(6);
            expect(httpCalls).toMatchSnapshot();
        });
        it('works for nested modules on github', async () => {
            const packages = [
                { datasource: _1.id, depName: 'github.com/x/text/a' },
                { datasource: _1.id, depName: 'github.com/x/text/b' },
            ];
            const tags = [{ name: 'a/v1.0.0' }, { name: 'b/v2.0.0' }];
            for (const pkg of packages) {
                httpMock.setup();
                httpMock
                    .scope('https://api.github.com/')
                    .get('/repos/x/text/tags?per_page=100')
                    .reply(200, tags)
                    .get('/repos/x/text/releases?per_page=100')
                    .reply(200, []);
                const prefix = pkg.depName.split('/')[3];
                const result = await __1.getPkgReleases(pkg);
                expect(result.releases).toHaveLength(1);
                expect(result.releases[0].version.startsWith(prefix)).toBeFalse();
                const httpCalls = httpMock.getTrace();
                expect(httpCalls).toMatchSnapshot();
                httpMock.reset();
            }
        });
        it('falls back to old behaviour', async () => {
            const packages = [
                { datasource: _1.id, depName: 'github.com/x/text/a' },
                { datasource: _1.id, depName: 'github.com/x/text/b' },
            ];
            const tags = [{ name: 'v1.0.0' }, { name: 'v2.0.0' }];
            for (const pkg of packages) {
                httpMock.setup();
                httpMock
                    .scope('https://api.github.com/')
                    .get('/repos/x/text/tags?per_page=100')
                    .reply(200, tags)
                    .get('/repos/x/text/releases?per_page=100')
                    .reply(200, []);
                const result = await __1.getPkgReleases(pkg);
                expect(result.releases).toHaveLength(2);
                expect(result.releases.map(({ version }) => version)).toStrictEqual(tags.map(({ name }) => name));
                const httpCalls = httpMock.getTrace();
                expect(httpCalls).toMatchSnapshot();
                httpMock.reset();
            }
        });
    });
});
//# sourceMappingURL=index.spec.js.map