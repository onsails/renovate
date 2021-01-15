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
const util_1 = require("../../../../test/util");
const datasource = __importStar(require("../../../datasource"));
const dockerVersioning = __importStar(require("../../../versioning/docker"));
const npmVersioning = __importStar(require("../../../versioning/npm"));
const releases = __importStar(require("./releases"));
jest.mock('../../../datasource');
const ds = util_1.mocked(datasource);
describe(util_1.getName(__filename), () => {
    describe('getReleaseNotes()', () => {
        beforeEach(() => {
            ds.getPkgReleases.mockResolvedValueOnce({
                releases: [
                    {
                        version: '1.0.0',
                    },
                    {
                        version: '1.0.1-rc0',
                    },
                    {
                        version: '1.0.1-rc1',
                    },
                    {
                        version: '1.0.1',
                    },
                    {
                        version: '1.1.0-rc0',
                    },
                    {
                        version: '1.1.0',
                    },
                    {
                        version: '1.2.0-rc0',
                    },
                    {
                        version: '1.2.0-rc1',
                    },
                ],
            });
        });
        it('should contain only stable', async () => {
            const config = util_1.partial({
                datasource: 'some-datasource',
                depName: 'some-depname',
                versioning: npmVersioning.id,
                fromVersion: '1.0.0',
                toVersion: '1.1.0',
            });
            const res = await releases.getInRangeReleases(config);
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(3);
        });
        it('should contain fromVersion unstable', async () => {
            const config = util_1.partial({
                datasource: 'some-datasource',
                depName: 'some-depname',
                versioning: npmVersioning.id,
                fromVersion: '1.0.1-rc0',
                toVersion: '1.1.0',
            });
            const res = await releases.getInRangeReleases(config);
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(4);
        });
        it('should contain toVersion unstable', async () => {
            const config = util_1.partial({
                datasource: 'some-datasource',
                depName: 'some-depname',
                versioning: npmVersioning.id,
                fromVersion: '1.0.1',
                toVersion: '1.2.0-rc1',
            });
            const res = await releases.getInRangeReleases(config);
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(4);
        });
        it('should contain both fromVersion toVersion unstable', async () => {
            const config = util_1.partial({
                datasource: 'some-datasource',
                depName: 'some-depname',
                versioning: npmVersioning.id,
                fromVersion: '1.0.1-rc0',
                toVersion: '1.2.0-rc1',
            });
            const res = await releases.getInRangeReleases(config);
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(6);
        });
        it('should valueToVersion', async () => {
            const config = util_1.partial({
                datasource: 'some-datasource',
                depName: 'some-depname',
                versioning: dockerVersioning.id,
                fromVersion: '1.0.1-rc0',
                toVersion: '1.2.0-rc0',
            });
            const res = await releases.getInRangeReleases(config);
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(3);
        });
    });
});
//# sourceMappingURL=releases.spec.js.map