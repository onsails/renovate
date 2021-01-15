"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const gomod1 = fs_1.readFileSync('lib/manager/gomod/__fixtures__/1/go.mod', 'utf8');
const gomod2 = fs_1.readFileSync('lib/manager/gomod/__fixtures__/2/go.mod', 'utf8');
const gomod3 = fs_1.readFileSync('lib/manager/gomod/__fixtures__/3/go.mod', 'utf8');
describe('lib/manager/gomod/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile('nothing here')).toBeNull();
        });
        it('extracts single-line requires', () => {
            const res = extract_1.extractPackageFile(gomod1).deps;
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(8);
            expect(res.filter((e) => e.skipReason)).toHaveLength(1);
            expect(res.filter((e) => e.depType === 'replace')).toHaveLength(1);
        });
        it('extracts constraints', () => {
            const res = extract_1.extractPackageFile(gomod3);
            expect(res).toMatchSnapshot();
            expect(res.constraints.go).toEqual('1.13');
        });
        it('extracts multi-line requires', () => {
            const res = extract_1.extractPackageFile(gomod2).deps;
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(58);
            expect(res.filter((e) => e.skipReason)).toHaveLength(0);
        });
    });
});
//# sourceMappingURL=extract.spec.js.map