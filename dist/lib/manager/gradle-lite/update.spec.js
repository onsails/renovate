"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const update_1 = require("./update");
describe('manager/gradle-lite/update', () => {
    it('replaces', () => {
        expect(update_1.updateDependency({
            fileContent: '___1.2.3___',
            upgrade: {
                currentValue: '1.2.3',
                newValue: '1.2.4',
                managerData: {
                    fileReplacePosition: 3,
                },
            },
        })).toEqual('___1.2.4___');
    });
    it('groups', () => {
        expect(update_1.updateDependency({
            fileContent: '___1.2.4___',
            upgrade: {
                currentValue: '1.2.3',
                newValue: '1.2.5',
                groupName: 'group',
                managerData: {
                    fileReplacePosition: 3,
                },
            },
        })).toEqual('___1.2.5___');
    });
    it('returns same content', () => {
        const fileContent = '___1.2.4___';
        expect(update_1.updateDependency({
            fileContent,
            upgrade: {
                currentValue: '1.2.3',
                newValue: '1.2.4',
                managerData: {
                    fileReplacePosition: 3,
                },
            },
        })).toBe(fileContent);
    });
    it('returns null', () => {
        expect(update_1.updateDependency({
            fileContent: '___1.3.0___',
            upgrade: {
                currentValue: '1.2.3',
                newValue: '1.2.4',
                managerData: {
                    fileReplacePosition: 3,
                },
            },
        })).toBeNull();
        expect(update_1.updateDependency({
            fileContent: '',
            upgrade: {
                currentValue: '1.2.3',
                newValue: '1.2.4',
                managerData: {
                    fileReplacePosition: 3,
                },
            },
        })).toBeNull();
    });
});
//# sourceMappingURL=update.spec.js.map