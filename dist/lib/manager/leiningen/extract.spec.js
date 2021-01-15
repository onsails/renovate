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
/* eslint-disable no-template-curly-in-string */
const fs_1 = require("fs");
const upath_1 = require("upath");
const datasourceClojure = __importStar(require("../../datasource/clojure"));
const extract_1 = require("./extract");
const leinProjectClj = fs_1.readFileSync(upath_1.resolve(__dirname, `./__fixtures__/project.clj`), 'utf8');
describe('manager/clojure/extract', () => {
    it('trimAtKey', () => {
        expect(extract_1.trimAtKey('foo', 'bar')).toBeNull();
        expect(extract_1.trimAtKey(':dependencies    ', 'dependencies')).toBeNull();
        expect(extract_1.trimAtKey(':dependencies \nfoobar', 'dependencies')).toEqual('foobar');
    });
    it('extractFromVectors', () => {
        expect(extract_1.extractFromVectors('')).toEqual([]);
        expect(extract_1.extractFromVectors('[]')).toEqual([]);
        expect(extract_1.extractFromVectors('[[]]')).toEqual([]);
        expect(extract_1.extractFromVectors('[[foo/bar "1.2.3"]]')).toEqual([
            {
                datasource: datasourceClojure.id,
                depName: 'foo:bar',
                currentValue: '1.2.3',
            },
        ]);
        expect(extract_1.extractFromVectors('[\t[foo/bar "1.2.3"]\n["foo/baz"  "4.5.6"] ]')).toEqual([
            {
                datasource: datasourceClojure.id,
                depName: 'foo:bar',
                currentValue: '1.2.3',
            },
            {
                datasource: datasourceClojure.id,
                depName: 'foo:baz',
                currentValue: '4.5.6',
            },
        ]);
    });
    it('extractPackageFile', () => {
        expect(extract_1.extractPackageFile(leinProjectClj)).toMatchSnapshot();
    });
});
//# sourceMappingURL=extract.spec.js.map