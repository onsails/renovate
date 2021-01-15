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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const luxon_1 = require("luxon");
const httpMock = __importStar(require("../../../../test/http-mock"));
const util_1 = require("../../../../test/util");
const release_notes_1 = require("./release-notes");
const angularJsChangelogMd = fs_extra_1.default.readFileSync('lib/workers/pr/__fixtures__/angular-js.md', 'utf8');
const jestChangelogMd = fs_extra_1.default.readFileSync('lib/workers/pr/__fixtures__/jest.md', 'utf8');
const jsYamlChangelogMd = fs_extra_1.default.readFileSync('lib/workers/pr/__fixtures__/js-yaml.md', 'utf8');
const yargsChangelogMd = fs_extra_1.default.readFileSync('lib/workers/pr/__fixtures__/yargs.md', 'utf8');
const adapterutilsChangelogMd = fs_extra_1.default.readFileSync('lib/workers/pr/__fixtures__/adapter-utils.md', 'utf8');
const gitterWebappChangelogMd = fs_extra_1.default.readFileSync('lib/workers/pr/__fixtures__/gitter-webapp.md', 'utf8');
const githubTreeResponse = {
    tree: [
        { path: 'lib', type: 'tree' },
        { path: 'CHANGELOG.md', type: 'blob', sha: 'abcd' },
        { path: 'README.md', type: 'blob' },
    ],
};
const gitlabTreeResponse = [
    { path: 'lib', type: 'tree' },
    { path: 'CHANGELOG.md', type: 'blob', id: 'abcd' },
    { path: 'README.md', type: 'blob' },
];
describe(util_1.getName(__filename), () => {
    beforeEach(() => {
        httpMock.setup();
    });
    afterEach(() => {
        httpMock.reset();
    });
    describe('releaseNotesCacheMinutes', () => {
        const now = luxon_1.DateTime.local();
        it.each([
            [now, 55],
            [now.minus({ week: 2 }), 1435],
            [now.minus({ year: 1 }), 14495],
        ])('works with string date (%s, %i)', (date, minutes) => {
            expect(release_notes_1.releaseNotesCacheMinutes(date === null || date === void 0 ? void 0 : date.toISO())).toEqual(minutes);
        });
        it('handles date object', () => {
            expect(release_notes_1.releaseNotesCacheMinutes(new Date())).toEqual(55);
        });
        it.each([null, undefined, 'fake', 123])('handles invalid: %s', (date) => {
            expect(release_notes_1.releaseNotesCacheMinutes(date)).toEqual(55);
        });
    });
    describe('addReleaseNotes()', () => {
        it('returns input if invalid', async () => {
            const input = { a: 1 };
            expect(await release_notes_1.addReleaseNotes(input)).toEqual(input);
        });
        it('returns ChangeLogResult', async () => {
            const input = {
                a: 1,
                project: { github: 'https://github.com/nodeca/js-yaml' },
                versions: [{ version: '3.10.0', compare: { url: '' } }],
            };
            expect(await release_notes_1.addReleaseNotes(input)).toMatchSnapshot();
        });
        it('returns ChangeLogResult without release notes', async () => {
            const input = {
                a: 1,
                project: { gitlab: 'https://gitlab.com/gitlab-org/gitter/webapp/' },
                versions: [{ version: '20.26.0', compare: { url: '' } }],
            };
            expect(await release_notes_1.addReleaseNotes(input)).toMatchSnapshot();
        });
    });
    describe('getReleaseList()', () => {
        it('should return empty array if no apiBaseUrl', async () => {
            const res = await release_notes_1.getReleaseList('', 'some/yet-other-repository');
            expect(res).toEqual([]);
        });
        it('should return release list for github repo', async () => {
            httpMock
                .scope('https://api.github.com/')
                .get('/repos/some/yet-other-repository/releases?per_page=100')
                .reply(200, [
                { tag_name: `v1.0.0` },
                {
                    tag_name: `v1.0.1`,
                    body: 'some body #123, [#124](https://github.com/some/yet-other-repository/issues/124)',
                },
            ]);
            const res = await release_notes_1.getReleaseList('https://api.github.com/', 'some/yet-other-repository');
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('should return release list for gitlab.com project', async () => {
            httpMock
                .scope('https://gitlab.com/')
                .get('/api/v4/projects/some%2fyet-other-repository/releases?per_page=100')
                .reply(200, [
                { tag_name: `v1.0.0` },
                {
                    tag_name: `v1.0.1`,
                    body: 'some body #123, [#124](https://gitlab.com/some/yet-other-repository/issues/124)',
                },
            ]);
            const res = await release_notes_1.getReleaseList('https://gitlab.com/api/v4/', 'some/yet-other-repository');
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
    });
    describe('getReleaseNotes()', () => {
        it('should return null for release notes without body', async () => {
            httpMock
                .scope('https://api.github.com/')
                .get('/repos/some/repository/releases?per_page=100')
                .reply(200, [{ tag_name: 'v1.0.0' }, { tag_name: 'v1.0.1' }]);
            const res = await release_notes_1.getReleaseNotes('some/repository', '1.0.0', 'some', 'https://github.com/', 'https://api.github.com/');
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it.each([[''], ['v'], ['other-'], ['other_v'], ['other@']])('gets release notes with body', async (prefix) => {
            httpMock
                .scope('https://api.github.com/')
                .get('/repos/some/other-repository/releases?per_page=100')
                .reply(200, [
                { tag_name: `${prefix}1.0.0` },
                {
                    tag_name: `${prefix}1.0.1`,
                    body: 'some body #123, [#124](https://github.com/some/yet-other-repository/issues/124)',
                },
            ]);
            const res = await release_notes_1.getReleaseNotes('some/other-repository', '1.0.1', 'other', 'https://github.com/', 'https://api.github.com/');
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it.each([[''], ['v'], ['other-']])('gets release notes with body from gitlab repo %s', async (prefix) => {
            httpMock
                .scope('https://api.gitlab.com/')
                .get('/projects/some%2fother-repository/releases?per_page=100')
                .reply(200, [
                { tag_name: `${prefix}1.0.0` },
                {
                    tag_name: `${prefix}1.0.1`,
                    body: 'some body #123, [#124](https://gitlab.com/some/yet-other-repository/issues/124)',
                },
            ]);
            const res = await release_notes_1.getReleaseNotes('some/other-repository', '1.0.1', 'other', 'https://gitlab.com/', 'https://api.gitlab.com/');
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it.each([[''], ['v'], ['other-']])('gets null from repository without gitlab/github in domain %s', async (prefix) => {
            const res = await release_notes_1.getReleaseNotes('some/other-repository', '1.0.1', 'other', 'https://lol.lol/', 'https://api.lol.lol/');
            expect(res).toBeNull();
        });
    });
    describe('getReleaseNotesMd()', () => {
        it('handles not found', async () => {
            const res = await release_notes_1.getReleaseNotesMd('chalk', '2.0.0', 'https://github.com/', 'https://api.github.com/');
            expect(res).toBeNull();
        });
        it('handles files mismatch', async () => {
            httpMock
                .scope('https://api.github.com')
                .get('/repos/chalk')
                .reply(200)
                .get('/repos/chalk/git/trees/master')
                .reply(200, {
                tree: [
                    { name: 'lib', type: 'tree' },
                    { name: 'README.md', type: 'blob' },
                ],
            });
            const res = await release_notes_1.getReleaseNotesMd('chalk', '2.0.0', 'https://github.com/', 'https://api.github.com/');
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('handles wrong format', async () => {
            httpMock
                .scope('https://api.github.com')
                .get('/repos/some/repository1')
                .reply(200)
                .get('/repos/some/repository1/git/trees/master')
                .reply(200, githubTreeResponse)
                .get('/repos/some/repository1/git/blobs/abcd')
                .reply(200, {
                content: Buffer.from('not really markdown').toString('base64'),
            });
            const res = await release_notes_1.getReleaseNotesMd('some/repository1', '1.0.0', 'https://github.com/', 'https://api.github.com/');
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('handles bad markdown', async () => {
            httpMock
                .scope('https://api.github.com')
                .get('/repos/some/repository2')
                .reply(200)
                .get('/repos/some/repository2/git/trees/master')
                .reply(200, githubTreeResponse)
                .get('/repos/some/repository2/git/blobs/abcd')
                .reply(200, {
                content: Buffer.from(`#\nha\nha\n#\nha\nha`).toString('base64'),
            });
            const res = await release_notes_1.getReleaseNotesMd('some/repository2', '1.0.0', 'https://github.com/', 'https://api.github.com/');
            expect(res).toBeNull();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('parses angular.js', async () => {
            httpMock
                .scope('https://api.github.com')
                .get('/repos/angular/angular.js')
                .reply(200)
                .get('/repos/angular/angular.js/git/trees/master')
                .reply(200, githubTreeResponse)
                .get('/repos/angular/angular.js/git/blobs/abcd')
                .reply(200, {
                content: Buffer.from(angularJsChangelogMd).toString('base64'),
            });
            const res = await release_notes_1.getReleaseNotesMd('angular/angular.js', '1.6.9', 'https://github.com/', 'https://api.github.com/');
            expect(res).not.toBeNull();
            expect(res).toMatchSnapshot();
            expect(httpMock.getTrace()).toMatchSnapshot();
        });
        it('parses gitlab.com/gitlab-org/gitter/webapp', async () => {
            jest.setTimeout(0);
            httpMock
                .scope('https://api.gitlab.com/')
                .get('/projects/gitlab-org%2fgitter%2fwebapp/repository/tree?per_page=100')
                .reply(200, gitlabTreeResponse)
                .get('/projects/gitlab-org%2fgitter%2fwebapp/repository/blobs/abcd/raw')
                .reply(200, gitterWebappChangelogMd);
            const res = await release_notes_1.getReleaseNotesMd('gitlab-org/gitter/webapp', '20.26.0', 'https://gitlab.com/', 'https://api.gitlab.com/');
            expect(httpMock.getTrace()).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(res).toMatchSnapshot();
        });
        it('parses jest', async () => {
            httpMock
                .scope('https://api.github.com')
                .get('/repos/facebook/jest')
                .reply(200)
                .get('/repos/facebook/jest/git/trees/master')
                .reply(200, githubTreeResponse)
                .get('/repos/facebook/jest/git/blobs/abcd')
                .reply(200, {
                content: Buffer.from(jestChangelogMd).toString('base64'),
            });
            const res = await release_notes_1.getReleaseNotesMd('facebook/jest', '22.0.0', 'https://github.com/', 'https://api.github.com/');
            expect(httpMock.getTrace()).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(res).toMatchSnapshot();
        });
        it('parses js-yaml', async () => {
            httpMock
                .scope('https://api.github.com')
                .get('/repos/nodeca/js-yaml')
                .reply(200)
                .get('/repos/nodeca/js-yaml/git/trees/master')
                .reply(200, githubTreeResponse)
                .get('/repos/nodeca/js-yaml/git/blobs/abcd')
                .reply(200, {
                content: Buffer.from(jsYamlChangelogMd).toString('base64'),
            });
            const res = await release_notes_1.getReleaseNotesMd('nodeca/js-yaml', '3.10.0', 'https://github.com/', 'https://api.github.com/');
            expect(httpMock.getTrace()).toMatchSnapshot();
            expect(res).not.toBeNull();
            expect(res).toMatchSnapshot();
        });
        describe('ReleaseNotes Correctness', () => {
            let versionOneNotes;
            let versionTwoNotes;
            it('parses yargs 15.3.0', async () => {
                httpMock
                    .scope('https://api.github.com')
                    .get('/repos/yargs/yargs')
                    .reply(200, { default_branch: 'main' })
                    .get('/repos/yargs/yargs/git/trees/main')
                    .reply(200, githubTreeResponse)
                    .get('/repos/yargs/yargs/git/blobs/abcd')
                    .reply(200, {
                    content: Buffer.from(yargsChangelogMd).toString('base64'),
                });
                const res = await release_notes_1.getReleaseNotesMd('yargs/yargs', '15.3.0', 'https://github.com/', 'https://api.github.com/');
                versionOneNotes = res;
                expect(httpMock.getTrace()).toMatchSnapshot();
                expect(res).not.toBeNull();
                expect(res).toMatchSnapshot();
            });
            it('parses yargs 15.2.0', async () => {
                httpMock
                    .scope('https://api.github.com')
                    .get('/repos/yargs/yargs')
                    .reply(200, { default_branch: 'main' })
                    .get('/repos/yargs/yargs/git/trees/main')
                    .reply(200, githubTreeResponse)
                    .get('/repos/yargs/yargs/git/blobs/abcd')
                    .reply(200, {
                    content: Buffer.from(yargsChangelogMd).toString('base64'),
                });
                const res = await release_notes_1.getReleaseNotesMd('yargs/yargs', '15.2.0', 'https://github.com/', 'https://api.github.com/');
                versionTwoNotes = res;
                expect(httpMock.getTrace()).toMatchSnapshot();
                expect(res).not.toBeNull();
                expect(res).toMatchSnapshot();
            });
            it('parses adapter-utils 4.33.0', async () => {
                httpMock
                    .scope('https://gitlab.com/')
                    .get('/api/v4/projects/itentialopensource%2fadapter-utils/repository/tree?per_page=100')
                    .reply(200, gitlabTreeResponse)
                    .get('/api/v4/projects/itentialopensource%2fadapter-utils/repository/blobs/abcd/raw')
                    .reply(200, adapterutilsChangelogMd);
                const res = await release_notes_1.getReleaseNotesMd('itentialopensource/adapter-utils', '4.33.0', 'https://gitlab.com/', 'https://gitlab.com/api/v4/');
                versionTwoNotes = res;
                expect(httpMock.getTrace()).toMatchSnapshot();
                expect(res).not.toBeNull();
                expect(res).toMatchSnapshot();
            });
            it('isUrl', () => {
                expect(versionOneNotes).not.toMatchObject(versionTwoNotes);
            });
            it('15.3.0 is not equal to 15.2.0', () => {
                expect(versionOneNotes).not.toMatchObject(versionTwoNotes);
            });
        });
    });
});
//# sourceMappingURL=release-notes.spec.js.map