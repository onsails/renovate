"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const upath_1 = require("upath");
const extract_1 = require("./extract");
const sbt = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/sample.sbt`), 'utf8');
const sbtScalaVersionVariable = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/scala-version-variable.sbt`), 'utf8');
const sbtMissingScalaVersion = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/missing-scala-version.sbt`), 'utf8');
const sbtDependencyFile = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/dependency-file.scala`), 'utf8');
const sbtPrivateVariableDependencyFile = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/private-variable-dependency-file.scala`), 'utf8');
describe('lib/manager/sbt/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile(null)).toBeNull();
            expect(extract_1.extractPackageFile('non-sense')).toBeNull();
            expect(extract_1.extractPackageFile('libraryDependencies += "foo" % "bar" % ???')).toBeNull();
            expect(extract_1.extractPackageFile('libraryDependencies += "foo" % "bar" %% "baz"')).toBeNull();
            expect(extract_1.extractPackageFile('libraryDependencies += ??? % "bar" % "baz"')).toBeNull();
            expect(extract_1.extractPackageFile('libraryDependencies += "foo" % ??? % "baz"')).toBeNull();
            expect(extract_1.extractPackageFile('libraryDependencies += ')).toBeNull();
            expect(extract_1.extractPackageFile('libraryDependencies += "foo"')).toBeNull();
            expect(extract_1.extractPackageFile('libraryDependencies += "foo" % "bar" %')).toBeNull();
            expect(extract_1.extractPackageFile('libraryDependencies += "foo" % "bar" % "baz" %%')).toBeNull();
        });
        it('extracts deps for generic use-cases', () => {
            expect(extract_1.extractPackageFile(sbt)).toMatchSnapshot();
        });
        it('extracts deps when scala version is defined in a variable', () => {
            expect(extract_1.extractPackageFile(sbtScalaVersionVariable)).toMatchSnapshot();
        });
        it('skips deps when scala version is missing', () => {
            expect(extract_1.extractPackageFile(sbtMissingScalaVersion)).toMatchSnapshot();
        });
        it('extract deps from native scala file with variables', () => {
            expect(extract_1.extractPackageFile(sbtDependencyFile)).toMatchSnapshot();
        });
        it('extracts deps when scala version is defined with a trailing comma', () => {
            const content = `
        lazy val commonSettings = Seq(
          scalaVersion := "2.12.10",
        )
        libraryDependencies += "org.example" %% "bar" % "0.0.2"
      `;
            expect(extract_1.extractPackageFile(content)).toMatchSnapshot();
        });
        it('extracts deps when scala version is defined in a variable with a trailing comma', () => {
            const content = `
        val ScalaVersion = "2.12.10"
        lazy val commonSettings = Seq(
          scalaVersion := ScalaVersion,
        )
        libraryDependencies += "org.example" %% "bar" % "0.0.2"
      `;
            expect(extract_1.extractPackageFile(content)).toMatchSnapshot();
        });
        it('extract deps from native scala file with private variables', () => {
            expect(extract_1.extractPackageFile(sbtPrivateVariableDependencyFile)).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map