"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const upath_1 = require("upath");
const extract_1 = require("./extract");
const droneYAML = fs_1.readFileSync(upath_1.resolve('lib/manager/droneci/__fixtures__/.drone.yml'), 'utf8');
describe('lib/manager/droneci/extract', () => {
    describe('extractPackageFile()', () => {
        it('returns null for empty', () => {
            expect(extract_1.extractPackageFile('nothing here')).toBeNull();
        });
        it('extracts multiple image lines', () => {
            const res = extract_1.extractPackageFile(droneYAML);
            expect(res.deps).toMatchSnapshot();
            expect(res.deps).toHaveLength(4);
        });
    });
});
//# sourceMappingURL=extract.spec.js.map