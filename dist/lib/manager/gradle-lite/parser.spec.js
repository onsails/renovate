"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const common_1 = require("./common");
const parser_1 = require("./parser");
function getGradleFile(fileName) {
    return fs_1.readFileSync(path_1.default.resolve(__dirname, fileName), 'utf8');
}
describe('manager/gradle-lite/parser', () => {
    it('handles end of input', () => {
        expect(parser_1.parseGradle('version = ').deps).toBeEmpty();
        expect(parser_1.parseGradle('id "foo.bar" version').deps).toBeEmpty();
    });
    it('parses variables', () => {
        let deps;
        ({ deps } = parser_1.parseGradle('\nversion = "1.2.3"\n"foo:bar:$version"\nversion = "3.2.1"'));
        expect(deps).toMatchObject([
            {
                depName: 'foo:bar',
                currentValue: '1.2.3',
            },
        ]);
        ({ deps } = parser_1.parseGradle('version = "1.2.3"\n"foo:bar:$version@@@"'));
        expect(deps).toBeEmpty();
    });
    it('parses registryUrls', () => {
        let urls;
        ({ urls } = parser_1.parseGradle('url ""'));
        expect(urls).toBeEmpty();
        ({ urls } = parser_1.parseGradle('url "#!@"'));
        expect(urls).toBeEmpty();
        ({ urls } = parser_1.parseGradle('url "https://example.com"'));
        expect(urls).toStrictEqual(['https://example.com']);
        ({ urls } = parser_1.parseGradle('url("https://example.com")'));
        expect(urls).toStrictEqual(['https://example.com']);
        ({ urls } = parser_1.parseGradle('uri "https://example.com"'));
        expect(urls).toStrictEqual(['https://example.com']);
        ({ urls } = parser_1.parseGradle('mavenCentral(); uri("https://example.com"); jcenter(); google();'));
        expect(urls).toStrictEqual([
            common_1.MAVEN_REPO,
            'https://example.com',
            common_1.JCENTER_REPO,
            common_1.GOOGLE_REPO,
        ]);
    });
    it('parses long form deps', () => {
        let deps;
        ({ deps } = parser_1.parseGradle('group: "com.example", name: "my.dependency", version: "1.2.3"'));
        expect(deps).toMatchObject([
            {
                depName: 'com.example:my.dependency',
                currentValue: '1.2.3',
            },
        ]);
        ({ deps } = parser_1.parseGradle('group: "com.example", name: "my.dependency", version: depVersion'));
        expect(deps).toBeEmpty();
        ({ deps } = parser_1.parseGradle('depVersion = "1.2.3"\ngroup: "com.example", name: "my.dependency", version: depVersion'));
        expect(deps).toMatchObject([
            {
                depName: 'com.example:my.dependency',
                currentValue: '1.2.3',
            },
        ]);
        ({ deps } = parser_1.parseGradle('("com.example", "my.dependency", "1.2.3")'));
        expect(deps).toMatchObject([
            {
                depName: 'com.example:my.dependency',
                currentValue: '1.2.3',
            },
        ]);
        ({ deps } = parser_1.parseGradle('(group = "com.example", name = "my.dependency", version = "1.2.3")'));
        expect(deps).toMatchObject([
            {
                depName: 'com.example:my.dependency',
                currentValue: '1.2.3',
            },
        ]);
    });
    it('parses plugin', () => {
        let deps;
        ({ deps } = parser_1.parseGradle('id "foo.bar" version "1.2.3"'));
        expect(deps).toMatchObject([
            {
                depName: 'foo.bar',
                lookupName: 'foo.bar:foo.bar.gradle.plugin',
                currentValue: '1.2.3',
            },
        ]);
        ({ deps } = parser_1.parseGradle('id("foo.bar") version "1.2.3"'));
        expect(deps).toMatchObject([
            {
                depName: 'foo.bar',
                lookupName: 'foo.bar:foo.bar.gradle.plugin',
                currentValue: '1.2.3',
            },
        ]);
        ({ deps } = parser_1.parseGradle('kotlin("jvm") version "1.3.71"'));
        expect(deps).toMatchObject([
            {
                depName: 'org.jetbrains.kotlin.jvm',
                lookupName: 'org.jetbrains.kotlin.jvm:org.jetbrains.kotlin.jvm.gradle.plugin',
                currentValue: '1.3.71',
            },
        ]);
    });
    it('parses fixture from "gradle" manager', () => {
        const content = getGradleFile(`../gradle/__fixtures__/build.gradle.example1`);
        const { deps } = parser_1.parseGradle(content, {}, 'build.gradle');
        deps.forEach((dep) => {
            expect(content
                .slice(dep.managerData.fileReplacePosition)
                .indexOf(dep.currentValue)).toEqual(0);
        });
        expect(deps).toMatchSnapshot();
    });
    it('calculates offset', () => {
        const content = "'foo:bar:1.2.3'";
        const { deps } = parser_1.parseGradle(content);
        const res = deps[0];
        expect(content.slice(res.managerData.fileReplacePosition).indexOf('1.2.3')).toEqual(0);
    });
    it('gradle.properties', () => {
        expect(parser_1.parseProps('foo=bar')).toMatchObject({
            vars: {
                foo: {
                    fileReplacePosition: 4,
                    key: 'foo',
                    value: 'bar',
                },
            },
            deps: [],
        });
        expect(parser_1.parseProps(' foo = bar ')).toMatchObject({
            vars: {
                foo: { key: 'foo', value: 'bar', fileReplacePosition: 7 },
            },
            deps: [],
        });
        expect(parser_1.parseProps('foo.bar=baz')).toMatchObject({
            vars: {
                'foo.bar': { key: 'foo.bar', value: 'baz', fileReplacePosition: 8 },
            },
            deps: [],
        });
        expect(parser_1.parseProps('foo=foo\nbar=bar')).toMatchObject({
            vars: {
                foo: { key: 'foo', value: 'foo', fileReplacePosition: 4 },
                bar: { key: 'bar', value: 'bar', fileReplacePosition: 12 },
            },
            deps: [],
        });
        expect(parser_1.parseProps('x=foo:bar:baz', 'x/gradle.properties')).toMatchObject({
            vars: {},
            deps: [
                {
                    currentValue: 'baz',
                    depName: 'foo:bar',
                    managerData: {
                        fileReplacePosition: 10,
                        packageFile: 'x/gradle.properties',
                    },
                },
            ],
        });
    });
});
//# sourceMappingURL=parser.spec.js.map