"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaults_1 = require("../../config/defaults");
const datasource_1 = require("../../datasource");
const package_1 = require("./package");
const defaultConfig = defaults_1.getConfig();
const getPkgReleases = datasource_1.getPkgReleases;
jest.mock('../../datasource');
describe('lib/manager/travis/package', () => {
    describe('getPackageUpdates', () => {
        // TODO: should be `PackageUpdateConfig`
        let config;
        const RealDate = Date;
        beforeAll(() => {
            global.Date = class FakeDate extends RealDate {
                constructor(arg) {
                    super(arg !== null && arg !== void 0 ? arg : '2020-10-28');
                }
            };
        });
        afterAll(() => {
            global.Date = RealDate;
        });
        beforeEach(() => {
            config = {
                ...defaultConfig,
            };
        });
        it('returns empty if missing supportPolicy', async () => {
            config.currentValue = ['6', '8'];
            expect(await package_1.getPackageUpdates(config)).toEqual([]);
        });
        it('returns empty if invalid supportPolicy', async () => {
            config.currentValue = ['6', '8'];
            config.supportPolicy = ['foo'];
            expect(await package_1.getPackageUpdates(config)).toEqual([]);
        });
        it('returns empty if matching', async () => {
            config.currentValue = ['12', '14'];
            config.supportPolicy = ['lts_active'];
            expect(await package_1.getPackageUpdates(config)).toEqual([]);
        });
        it('returns result if needing updates', async () => {
            config.currentValue = ['6', '8', '10'];
            config.supportPolicy = ['lts'];
            expect(await package_1.getPackageUpdates(config)).toMatchSnapshot();
        });
        it('detects pinning', async () => {
            config.currentValue = ['8.4.0', '10.0.0', '12.0.0'];
            config.supportPolicy = ['lts'];
            getPkgReleases.mockReturnValueOnce({
                releases: [
                    {
                        version: '4.4.4',
                    },
                    {
                        version: '5.5.5',
                    },
                    {
                        version: '6.11.0',
                    },
                    {
                        version: '7.0.0',
                    },
                    {
                        version: '8.9.4',
                    },
                    {
                        version: '9.5.0',
                    },
                    {
                        version: '10.0.1',
                    },
                    {
                        version: '12.3.0',
                    },
                ],
            });
            expect(await package_1.getPackageUpdates(config)).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=package.spec.js.map