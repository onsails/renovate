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
const datasourceMaven = __importStar(require("../../../datasource/maven"));
const datasourceNpm = __importStar(require("../../../datasource/npm"));
const _npm = __importStar(require("../../../manager/npm"));
const fetch_1 = require("./fetch");
const lookup = __importStar(require("./lookup"));
const npm = _npm;
const lookupUpdates = util_1.mocked(lookup).lookupUpdates;
jest.mock('./lookup');
describe('workers/repository/process/fetch', () => {
    describe('fetchUpdates()', () => {
        let config;
        beforeEach(() => {
            jest.resetAllMocks();
            config = util_1.getConfig();
        });
        it('handles empty deps', async () => {
            const packageFiles = {
                npm: [{ packageFile: 'package.json', deps: [] }],
            };
            await fetch_1.fetchUpdates(config, packageFiles);
            expect(packageFiles).toMatchSnapshot();
        });
        it('handles ignored, skipped and disabled', async () => {
            config.ignoreDeps = ['abcd'];
            config.packageRules = [
                {
                    packageNames: ['foo'],
                    enabled: false,
                },
            ];
            const packageFiles = {
                npm: [
                    {
                        packageFile: 'package.json',
                        deps: [
                            { depName: 'abcd' },
                            { depName: 'foo' },
                            { depName: 'skipped', skipReason: 'some-reason' },
                        ],
                    },
                ],
            };
            await fetch_1.fetchUpdates(config, packageFiles);
            expect(packageFiles).toMatchSnapshot();
            expect(packageFiles.npm[0].deps[0].skipReason).toEqual('ignored');
            expect(packageFiles.npm[0].deps[0].updates).toHaveLength(0);
            expect(packageFiles.npm[0].deps[1].skipReason).toEqual('disabled');
            expect(packageFiles.npm[0].deps[1].updates).toHaveLength(0);
        });
        it('fetches updates', async () => {
            config.rangeStrategy = 'auto';
            const packageFiles = {
                maven: [
                    {
                        packageFile: 'pom.xml',
                        deps: [{ datasource: datasourceMaven.id, depName: 'bbb' }],
                    },
                ],
                npm: [
                    {
                        packageFile: 'package.json',
                        packageJsonType: 'app',
                        deps: [
                            {
                                datasource: datasourceNpm.id,
                                depName: 'aaa',
                                depType: 'devDependencies',
                            },
                            { depName: 'bbb', depType: 'dependencies' },
                        ],
                    },
                ],
            };
            // TODO: fix types
            npm.getPackageUpdates = jest.fn((_) => ['a', 'b']);
            lookupUpdates.mockResolvedValue({ updates: ['a', 'b'] });
            await fetch_1.fetchUpdates(config, packageFiles);
            expect(packageFiles).toMatchSnapshot();
            expect(packageFiles.npm[0].deps[0].skipReason).toBeUndefined();
            expect(packageFiles.npm[0].deps[0].updates).toHaveLength(2);
        });
    });
});
//# sourceMappingURL=fetch.spec.js.map