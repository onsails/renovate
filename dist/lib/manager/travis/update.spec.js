"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const upath_1 = require("upath");
const update_1 = require("./update");
const content = fs_1.readFileSync(upath_1.resolve('lib/manager/travis/__fixtures__/travis.yml'), 'utf8');
describe('manager/travis/update', () => {
    describe('updateDependency', () => {
        it('updates values', () => {
            // TODO: should be `Upgrade`
            const upgrade = {
                currentValue: ['8', '6', '4'],
                newValue: '6,8',
            };
            const res = update_1.updateDependency({ fileContent: content, upgrade });
            expect(res).toMatchSnapshot();
        });
        it('falls back to 2 spaces', () => {
            // TODO: should be `Upgrade`
            const upgrade = {
                currentValue: [8, 6, 4],
                newValue: '6,8',
            };
            const res = update_1.updateDependency({
                fileContent: 'hello: world',
                upgrade,
            });
            expect(res).toMatchSnapshot();
        });
        it('uses double quotes', () => {
            // TODO: should be `Upgrade`
            const upgrade = {
                currentValue: ['6'],
                newValue: '6,8',
            };
            const res = update_1.updateDependency({
                fileContent: 'node_js:\n  - "6"\n',
                upgrade,
            });
            expect(res).toMatchSnapshot();
        });
        it('returns null if error', () => {
            // TODO: should be `Upgrade`
            const upgrade = {
                currentValue: [8, 6, 4],
                newValue: 6,
            };
            const res = update_1.updateDependency({ fileContent: content, upgrade });
            expect(res).toBeNull();
        });
    });
});
//# sourceMappingURL=update.spec.js.map