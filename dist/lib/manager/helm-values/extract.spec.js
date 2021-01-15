"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const helmDefaultChartInitValues = fs_1.readFileSync('lib/manager/helm-values/__fixtures__/default_chart_init_values.yaml', 'utf8');
const helmMultiAndNestedImageValues = fs_1.readFileSync('lib/manager/helm-values/__fixtures__/multi_and_nested_image_values.yaml', 'utf8');
describe('lib/manager/helm-values/extract', () => {
    describe('extractPackageFile()', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });
        it('returns null for invalid yaml file content', () => {
            const result = extract_1.extractPackageFile('nothing here: [');
            expect(result).toBeNull();
        });
        it('returns null for empty yaml file content', () => {
            const result = extract_1.extractPackageFile('');
            expect(result).toBeNull();
        });
        it('returns null for no file content', () => {
            const result = extract_1.extractPackageFile(null);
            expect(result).toBeNull();
        });
        it('extracts from values.yaml correctly with same structure as "helm create"', () => {
            const result = extract_1.extractPackageFile(helmDefaultChartInitValues);
            expect(result).toMatchSnapshot();
        });
        it('extracts from complex values file correctly"', () => {
            const result = extract_1.extractPackageFile(helmMultiAndNestedImageValues);
            expect(result).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map