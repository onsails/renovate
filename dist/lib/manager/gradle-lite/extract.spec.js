"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const _1 = require(".");
jest.mock('../../util/fs');
function mockFs(files) {
    util_1.fs.readLocalFile.mockImplementation((fileName) => {
        const content = files === null || files === void 0 ? void 0 : files[fileName];
        return typeof content === 'string'
            ? Promise.resolve(content)
            : Promise.reject(`File not found: ${fileName}`);
    });
}
describe('manager/gradle-lite/extract', () => {
    beforeAll(() => { });
    afterAll(() => {
        jest.resetAllMocks();
    });
    it('returns null', async () => {
        mockFs({
            'gradle.properties': '',
            'build.gradle': '',
        });
        const res = await _1.extractAllPackageFiles({}, [
            'build.gradle',
            'gradle.properties',
        ]);
        expect(res).toBeNull();
    });
    it('works', async () => {
        mockFs({
            'gradle.properties': 'baz=1.2.3',
            'build.gradle': 'url "https://example.com"; "foo:bar:$baz"',
            'settings.gradle': null,
        });
        const res = await _1.extractAllPackageFiles({}, [
            'build.gradle',
            'gradle.properties',
            'settings.gradle',
        ]);
        expect(res).toMatchObject([
            {
                packageFile: 'gradle.properties',
                deps: [
                    {
                        depName: 'foo:bar',
                        currentValue: '1.2.3',
                        registryUrls: ['https://example.com'],
                    },
                ],
            },
            { packageFile: 'build.gradle', deps: [] },
            {
                datasource: 'maven',
                deps: [],
                packageFile: 'settings.gradle',
            },
        ]);
    });
});
//# sourceMappingURL=extract.spec.js.map