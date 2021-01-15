"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flatten_1 = require("./flatten");
describe('workers/repository/init/flatten', () => {
    describe('flattenPackageRules()', () => {
        it('returns empty', () => {
            expect(flatten_1.flattenPackageRules([])).toEqual([]);
        });
        it('flattens some and returns others', () => {
            const packageRules = [
                {
                    a: 1,
                },
                {
                    a: 2,
                    packageRules: [
                        {
                            b: 1,
                        },
                        {
                            b: 2,
                        },
                    ],
                },
                {
                    b: 3,
                },
            ];
            const res = flatten_1.flattenPackageRules(packageRules);
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(4);
            expect(res[0].a).toBeDefined();
            expect(res[0].b).toBeUndefined();
            expect(res[1].a).toBeDefined();
            expect(res[1].b).toBeDefined();
            expect(res[2].a).toBeDefined();
            expect(res[2].b).toBeDefined();
            expect(res[3].a).toBeUndefined();
            expect(res[3].b).toBeDefined();
        });
    });
});
//# sourceMappingURL=flatten.spec.js.map