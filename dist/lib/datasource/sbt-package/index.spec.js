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
const fs_1 = __importDefault(require("fs"));
const nock_1 = __importDefault(require("nock"));
const upath_1 = __importDefault(require("upath"));
const __1 = require("..");
const mavenVersioning = __importStar(require("../../versioning/maven"));
const common_1 = require("../maven/common");
const util_1 = require("../sbt-plugin/util");
const sbtPlugin = __importStar(require("."));
const mavenIndexHtml = fs_1.default.readFileSync(upath_1.default.resolve(__dirname, `./__fixtures__/maven-index.html`), 'utf8');
const sbtPluginIndex = fs_1.default.readFileSync(upath_1.default.resolve(__dirname, `./__fixtures__/sbt-plugins-index.html`), 'utf8');
describe('datasource/sbt', () => {
    it('parses Maven index directory', () => {
        expect(util_1.parseIndexDir(mavenIndexHtml)).toMatchSnapshot();
    });
    it('parses sbt index directory', () => {
        expect(util_1.parseIndexDir(sbtPluginIndex)).toMatchSnapshot();
    });
    describe('getPkgReleases', () => {
        beforeEach(() => {
            nock_1.default.disableNetConnect();
            nock_1.default('https://failed_repo').get('/maven/org/scalatest/').reply(404, null);
            nock_1.default('https://repo.maven.apache.org')
                .get('/maven2/com/example/')
                .reply(200, '<a href="empty/">empty_2.12/</a>\n');
            nock_1.default('https://repo.maven.apache.org')
                .get('/maven2/com/example/empty/')
                .reply(200, '');
            nock_1.default('https://repo.maven.apache.org')
                .get('/maven2/org/scalatest/')
                .times(3)
                .reply(200, '<a href="scalatest/" title=\'scalatest/\'>scalatest_2.12/</a>\n' +
                '<a href="scalatest_2.12/" title=\'scalatest_2.12/\'>scalatest_2.12/</a>\n' +
                "<a href='scalatest_sjs2.12/'>scalatest_2.12/</a>" +
                "<a href='scalatest_native2.12/'>scalatest_2.12/</a>" +
                '<a href="scalatest-app_2.12/">scalatest-app_2.12</a>' +
                '<a href="scalatest-flatspec_2.12/">scalatest-flatspec_2.12</a>' +
                '<a href="scalatest-matchers-core_2.12/">scalatest-matchers-core_2.12</a>');
            nock_1.default('https://repo.maven.apache.org')
                .get('/maven2/org/scalatest/scalatest/')
                .reply(200, "<a href='1.2.0/'>1.2.0/</a>");
            nock_1.default('https://repo.maven.apache.org')
                .get('/maven2/org/scalatest/scalatest_2.12/')
                .reply(200, "<a href='1.2.3/'>4.5.6/</a>");
            nock_1.default('https://repo.maven.apache.org')
                .get('/maven2/org/scalatest/scalatest-app_2.12/')
                .reply(200, "<a href='6.5.4/'>3.2.1/</a>");
            nock_1.default('https://repo.maven.apache.org')
                .get('/maven2/org/scalatest/scalatest-flatspec_2.12/')
                .reply(200, "<a href='6.5.4/'>3.2.1/</a>");
            nock_1.default('https://repo.maven.apache.org')
                .get('/maven2/org/scalatest/scalatest-matchers-core_2.12/')
                .reply(200, "<a href='6.5.4/'>3.2.1/</a>");
            nock_1.default('https://repo.maven.apache.org')
                .get('/maven2/org/scalatest/scalatest-app_2.12/6.5.4/scalatest-app_2.12-6.5.4.pom')
                .reply(200, '<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://maven.apache.org/POM/4.0.0" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">' +
                '<url>http://www.scalatest.org</url>' +
                '<scm>' +
                '<url>https://github.com/scalatest/scalatest</url>' +
                '</scm>' +
                '</project>');
            nock_1.default('https://repo.maven.apache.org')
                .get('/maven2/org/scalatest/scalatest-flatspec_2.12/6.5.4/scalatest-flatspec_2.12-6.5.4.pom')
                .reply(200, '<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://maven.apache.org/POM/4.0.0" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">' +
                '<scm>' +
                '<url>scm:git:git:git@github.com/scalatest/scalatest</url>' +
                '</scm>' +
                '</project>');
            nock_1.default('https://repo.maven.apache.org')
                .get('/maven2/org/scalatest/scalatest-matchers-core_2.12/6.5.4/scalatest-matchers-core_2.12-6.5.4.pom')
                .reply(200, '<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://maven.apache.org/POM/4.0.0" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">' +
                '<url>http://www.scalatest.org</url>' +
                '</project>');
            nock_1.default('https://dl.bintray.com')
                .get('/sbt/sbt-plugin-releases/com.github.gseitz/')
                .reply(200, '');
            nock_1.default('https://dl.bintray.com')
                .get('/sbt/sbt-plugin-releases/org.foundweekends/sbt-bintray/')
                .reply(200, '<html>\n' +
                '<head>\n' +
                '</head>\n' +
                '<body>\n' +
                '<pre><a href="scala_2.12/">scala_2.12/</a></pre>\n' +
                '</body>\n' +
                '</html>');
            nock_1.default('https://dl.bintray.com')
                .get('/sbt/sbt-plugin-releases/org.foundweekends/sbt-bintray/scala_2.12/')
                .reply(200, '\n' +
                '<html>\n' +
                '<head>\n' +
                '</head>\n' +
                '<body>\n' +
                '<pre><a href="sbt_1.0/">sbt_1.0/</a></pre>\n' +
                '</body>\n' +
                '</html>\n');
            nock_1.default('https://dl.bintray.com')
                .get('/sbt/sbt-plugin-releases/org.foundweekends/sbt-bintray/scala_2.12/sbt_1.0/')
                .reply(200, '\n' +
                '<html>\n' +
                '<head>\n' +
                '</head>\n' +
                '<body>\n' +
                '<pre><a href="0.5.5/">0.5.5/</a></pre>\n' +
                '</body>\n' +
                '</html>\n');
        });
        afterEach(() => {
            nock_1.default.enableNetConnect();
        });
        it('returns null in case of errors', async () => {
            expect(await __1.getPkgReleases({
                versioning: mavenVersioning.id,
                datasource: sbtPlugin.id,
                depName: 'org.scalatest:scalatest',
                registryUrls: ['https://failed_repo/maven'],
            })).toBeNull();
        });
        it('returns null if there is no version', async () => {
            expect(await __1.getPkgReleases({
                versioning: mavenVersioning.id,
                datasource: sbtPlugin.id,
                depName: 'com.example:empty',
                registryUrls: [],
            })).toBeNull();
        });
        it('fetches releases from Maven', async () => {
            expect(await __1.getPkgReleases({
                versioning: mavenVersioning.id,
                datasource: sbtPlugin.id,
                depName: 'org.scalatest:scalatest',
                registryUrls: ['https://failed_repo/maven', common_1.MAVEN_REPO],
            })).toEqual({
                dependencyUrl: 'https://repo.maven.apache.org/maven2/org/scalatest',
                display: 'org.scalatest:scalatest',
                group: 'org.scalatest',
                name: 'scalatest',
                releases: [{ version: '1.2.0' }, { version: '1.2.3' }],
            });
            expect(await __1.getPkgReleases({
                versioning: mavenVersioning.id,
                datasource: sbtPlugin.id,
                depName: 'org.scalatest:scalatest_2.12',
                registryUrls: [],
            })).toEqual({
                dependencyUrl: 'https://repo.maven.apache.org/maven2/org/scalatest',
                display: 'org.scalatest:scalatest_2.12',
                group: 'org.scalatest',
                name: 'scalatest_2.12',
                releases: [{ version: '1.2.3' }],
            });
        });
        it('extracts URL from Maven POM file', async () => {
            expect(await __1.getPkgReleases({
                versioning: mavenVersioning.id,
                datasource: sbtPlugin.id,
                depName: 'org.scalatest:scalatest-app_2.12',
                registryUrls: [],
            })).toEqual({
                dependencyUrl: 'https://repo.maven.apache.org/maven2/org/scalatest',
                display: 'org.scalatest:scalatest-app_2.12',
                group: 'org.scalatest',
                name: 'scalatest-app_2.12',
                releases: [{ version: '6.5.4' }],
                homepage: 'http://www.scalatest.org',
                sourceUrl: 'https://github.com/scalatest/scalatest',
            });
            expect(await __1.getPkgReleases({
                versioning: mavenVersioning.id,
                datasource: sbtPlugin.id,
                depName: 'org.scalatest:scalatest-flatspec_2.12',
                registryUrls: [],
            })).toEqual({
                dependencyUrl: 'https://repo.maven.apache.org/maven2/org/scalatest',
                display: 'org.scalatest:scalatest-flatspec_2.12',
                group: 'org.scalatest',
                name: 'scalatest-flatspec_2.12',
                releases: [{ version: '6.5.4' }],
                sourceUrl: 'https://github.com/scalatest/scalatest',
            });
            expect(await __1.getPkgReleases({
                versioning: mavenVersioning.id,
                datasource: sbtPlugin.id,
                depName: 'org.scalatest:scalatest-matchers-core_2.12',
                registryUrls: [],
            })).toEqual({
                dependencyUrl: 'https://repo.maven.apache.org/maven2/org/scalatest',
                display: 'org.scalatest:scalatest-matchers-core_2.12',
                group: 'org.scalatest',
                name: 'scalatest-matchers-core_2.12',
                releases: [{ version: '6.5.4' }],
                homepage: 'http://www.scalatest.org',
            });
        });
    });
});
//# sourceMappingURL=index.spec.js.map