"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const utils_1 = require("./utils");
describe('manager/gradle-lite/utils', () => {
    it('versionLikeSubstring', () => {
        [
            '1.2.3',
            'foobar',
            '[1.0,2.0]',
            '(,2.0[',
            '2.1.1.RELEASE',
            '1.0.+',
            'latest',
        ].forEach((input) => {
            expect(utils_1.versionLikeSubstring(input)).toEqual(input);
            expect(utils_1.versionLikeSubstring(`${input}'`)).toEqual(input);
            expect(utils_1.versionLikeSubstring(`${input}"`)).toEqual(input);
            expect(utils_1.versionLikeSubstring(`${input}\n`)).toEqual(input);
            expect(utils_1.versionLikeSubstring(`${input}  `)).toEqual(input);
            expect(utils_1.versionLikeSubstring(`${input}$`)).toEqual(input);
        });
        expect(utils_1.versionLikeSubstring('')).toBeNull();
        expect(utils_1.versionLikeSubstring(undefined)).toBeNull();
        expect(utils_1.versionLikeSubstring(null)).toBeNull();
    });
    it('isDependencyString', () => {
        expect(utils_1.isDependencyString('foo:bar:1.2.3')).toBe(true);
        expect(utils_1.isDependencyString('foo.foo:bar.bar:1.2.3')).toBe(true);
        expect(utils_1.isDependencyString('foo:bar:baz:qux')).toBe(false);
        expect(utils_1.isDependencyString('foo.bar:baz:1.2.3')).toBe(true);
        expect(utils_1.isDependencyString('foo.bar:baz:1.2.+')).toBe(true);
        expect(utils_1.isDependencyString('foo.bar:baz:qux:quux')).toBe(false);
        expect(utils_1.isDependencyString("foo:bar:1.2.3'")).toBe(false);
        expect(utils_1.isDependencyString('foo:bar:1.2.3"')).toBe(false);
        expect(utils_1.isDependencyString('-Xep:ParameterName:OFF')).toBe(false);
    });
    it('parseDependencyString', () => {
        expect(utils_1.parseDependencyString('foo:bar:1.2.3')).toMatchObject({
            depName: 'foo:bar',
            currentValue: '1.2.3',
        });
        expect(utils_1.parseDependencyString('foo.foo:bar.bar:1.2.3')).toMatchObject({
            depName: 'foo.foo:bar.bar',
            currentValue: '1.2.3',
        });
        expect(utils_1.parseDependencyString('foo:bar:baz:qux')).toBeNull();
        expect(utils_1.parseDependencyString('foo.bar:baz:1.2.3')).toMatchObject({
            depName: 'foo.bar:baz',
            currentValue: '1.2.3',
        });
        expect(utils_1.parseDependencyString('foo:bar:1.2.+')).toMatchObject({
            depName: 'foo:bar',
            currentValue: '1.2.+',
        });
        expect(utils_1.parseDependencyString('foo.bar:baz:qux:quux')).toBeNull();
        expect(utils_1.parseDependencyString("foo:bar:1.2.3'")).toBeNull();
        expect(utils_1.parseDependencyString('foo:bar:1.2.3"')).toBeNull();
        expect(utils_1.parseDependencyString('-Xep:ParameterName:OFF')).toBeNull();
    });
    it('interpolateString', () => {
        expect(utils_1.interpolateString([], {})).toBe('');
        expect(utils_1.interpolateString([
            { type: common_1.TokenType.String, value: 'foo' },
            { type: common_1.TokenType.Variable, value: 'bar' },
            { type: common_1.TokenType.String, value: 'baz' },
        ], {
            bar: { value: 'BAR' },
        })).toBe('fooBARbaz');
        expect(utils_1.interpolateString([{ type: common_1.TokenType.Variable, value: 'foo' }], {})).toBeNull();
        expect(utils_1.interpolateString([{ type: common_1.TokenType.UnknownFragment, value: 'foo' }], {})).toBeNull();
    });
    it('reorderFiles', () => {
        expect(utils_1.reorderFiles(['a.gradle', 'b.gradle', 'a.gradle'])).toStrictEqual([
            'a.gradle',
            'a.gradle',
            'b.gradle',
        ]);
        expect(utils_1.reorderFiles([
            'a/b/c/build.gradle',
            'a/build.gradle',
            'a/b/build.gradle',
            'build.gradle',
        ])).toStrictEqual([
            'build.gradle',
            'a/build.gradle',
            'a/b/build.gradle',
            'a/b/c/build.gradle',
        ]);
        expect(utils_1.reorderFiles(['b.gradle', 'c.gradle', 'a.gradle'])).toStrictEqual([
            'a.gradle',
            'b.gradle',
            'c.gradle',
        ]);
        expect(utils_1.reorderFiles(['b.gradle', 'c.gradle', 'a.gradle', 'gradle.properties'])).toStrictEqual(['gradle.properties', 'a.gradle', 'b.gradle', 'c.gradle']);
        expect(utils_1.reorderFiles([
            'a/b/c/gradle.properties',
            'a/b/c/build.gradle',
            'a/build.gradle',
            'a/gradle.properties',
            'a/b/build.gradle',
            'a/b/gradle.properties',
            'build.gradle',
            'gradle.properties',
            'b.gradle',
            'c.gradle',
            'a.gradle',
        ])).toStrictEqual([
            'gradle.properties',
            'a.gradle',
            'b.gradle',
            'build.gradle',
            'c.gradle',
            'a/gradle.properties',
            'a/build.gradle',
            'a/b/gradle.properties',
            'a/b/build.gradle',
            'a/b/c/gradle.properties',
            'a/b/c/build.gradle',
        ]);
    });
    it('getVars', () => {
        const registry = {
            [utils_1.toAbsolutePath('/foo')]: {
                foo: { key: 'foo', value: 'FOO' },
                bar: { key: 'bar', value: 'BAR' },
                baz: { key: 'baz', value: 'BAZ' },
                qux: { key: 'qux', value: 'QUX' },
            },
            [utils_1.toAbsolutePath('/foo/bar')]: {
                foo: { key: 'foo', value: 'foo' },
            },
            [utils_1.toAbsolutePath('/foo/bar/baz')]: {
                bar: { key: 'bar', value: 'bar' },
                baz: { key: 'baz', value: 'baz' },
            },
        };
        const res = utils_1.getVars(registry, '/foo/bar/baz/build.gradle');
        expect(res).toStrictEqual({
            foo: { key: 'foo', value: 'foo' },
            bar: { key: 'bar', value: 'bar' },
            baz: { key: 'baz', value: 'baz' },
            qux: { key: 'qux', value: 'QUX' },
        });
    });
});
//# sourceMappingURL=utils.spec.js.map