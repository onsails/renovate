"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const extract_1 = require("./extract");
const pipfile1 = fs_1.default.readFileSync('lib/manager/pipenv/__fixtures__/Pipfile1', 'utf8');
const pipfile2 = fs_1.default.readFileSync('lib/manager/pipenv/__fixtures__/Pipfile2', 'utf8');
const pipfile3 = fs_1.default.readFileSync('lib/manager/pipenv/__fixtures__/Pipfile3', 'utf8');
const pipfile4 = fs_1.default.readFileSync('lib/manager/pipenv/__fixtures__/Pipfile4', 'utf8');
const pipfile5 = fs_1.default.readFileSync('lib/manager/pipenv/__fixtures__/Pipfile5', 'utf8');
describe('lib/manager/pipenv/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile('[packages]\r\n')).toBeNull();
        });
        it('returns null for invalid toml file', () => {
            expect(extract_1.extractPackageFile('nothing here')).toBeNull();
        });
        it('extracts dependencies', () => {
            const res = extract_1.extractPackageFile(pipfile1);
            expect(res).toMatchSnapshot();
            expect(res.deps).toHaveLength(6);
            expect(res.deps.filter((dep) => !dep.skipReason)).toHaveLength(4);
        });
        it('marks packages with "extras" as skipReason === any-version', () => {
            const res = extract_1.extractPackageFile(pipfile3);
            expect(res.deps.filter((r) => !r.skipReason)).toHaveLength(0);
            expect(res.deps.filter((r) => r.skipReason)).toHaveLength(6);
        });
        it('extracts multiple dependencies', () => {
            const res = extract_1.extractPackageFile(pipfile2);
            expect(res).toMatchSnapshot();
            expect(res.deps).toHaveLength(5);
        });
        it('ignores git dependencies', () => {
            const content = '[packages]\r\nflask = {git = "https://github.com/pallets/flask.git"}\r\nwerkzeug = ">=0.14"';
            const res = extract_1.extractPackageFile(content);
            expect(res.deps.filter((r) => !r.skipReason)).toHaveLength(1);
        });
        it('ignores invalid package names', () => {
            const content = '[packages]\r\nfoo = "==1.0.0"\r\n_invalid = "==1.0.0"';
            const res = extract_1.extractPackageFile(content);
            expect(res.deps).toHaveLength(2);
            expect(res.deps.filter((dep) => !dep.skipReason)).toHaveLength(1);
        });
        it('ignores relative path dependencies', () => {
            const content = '[packages]\r\nfoo = "==1.0.0"\r\ntest = {path = "."}';
            const res = extract_1.extractPackageFile(content);
            expect(res.deps.filter((r) => !r.skipReason)).toHaveLength(1);
        });
        it('ignores invalid versions', () => {
            const content = '[packages]\r\nfoo = "==1.0.0"\r\nsome-package = "==0 0"';
            const res = extract_1.extractPackageFile(content);
            expect(res.deps).toHaveLength(2);
            expect(res.deps.filter((dep) => !dep.skipReason)).toHaveLength(1);
        });
        it('extracts all sources', () => {
            const content = '[[source]]\r\nurl = "source-url"\r\n' +
                '[[source]]\r\nurl = "other-source-url"\r\n' +
                '[packages]\r\nfoo = "==1.0.0"\r\n';
            const res = extract_1.extractPackageFile(content);
            expect(res.registryUrls).toEqual(['source-url', 'other-source-url']);
        });
        it('extracts example pipfile', () => {
            const res = extract_1.extractPackageFile(pipfile4);
            expect(res).toMatchSnapshot();
        });
        it('supports custom index', () => {
            const res = extract_1.extractPackageFile(pipfile5);
            expect(res).toMatchSnapshot();
            expect(res.registryUrls).toBeDefined();
            expect(res.registryUrls).toHaveLength(2);
            expect(res.deps[0].registryUrls).toBeDefined();
            expect(res.deps[0].registryUrls).toHaveLength(1);
        });
        it('gets python constraint from python_version', () => {
            const content = '[packages]\r\nfoo = "==1.0.0"\r\n' +
                '[requires]\r\npython_version = "3.8"';
            const res = extract_1.extractPackageFile(content);
            expect(res.constraints.python).toEqual('== 3.8.*');
        });
        it('gets python constraint from python_full_version', () => {
            const content = '[packages]\r\nfoo = "==1.0.0"\r\n' +
                '[requires]\r\npython_full_version = "3.8.6"';
            const res = extract_1.extractPackageFile(content);
            expect(res.constraints.python).toEqual('== 3.8.6');
        });
        it('gets pipenv constraint from packages', () => {
            const content = '[packages]\r\npipenv = "==2020.8.13"';
            const res = extract_1.extractPackageFile(content);
            expect(res.constraints.pipenv).toEqual('==2020.8.13');
        });
        it('gets pipenv constraint from dev-packages', () => {
            const content = '[dev-packages]\r\npipenv = "==2020.8.13"';
            const res = extract_1.extractPackageFile(content);
            expect(res.constraints.pipenv).toEqual('==2020.8.13');
        });
    });
});
//# sourceMappingURL=extract.spec.js.map