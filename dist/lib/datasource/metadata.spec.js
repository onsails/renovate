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
const datasourceMaven = __importStar(require("./maven"));
const metadata_1 = require("./metadata");
const datasourceNpm = __importStar(require("./npm"));
const datasourcePypi = __importStar(require("./pypi"));
describe('datasource/metadata', () => {
    it('Should do nothing if dep is not specified', () => {
        expect(metadata_1.addMetaData()).toBeUndefined();
    });
    it('Should handle manualChangelogUrls', () => {
        const dep = {
            releases: [
                { version: '2.0.0', releaseTimestamp: '2018-07-13T10:14:17' },
                {
                    version: '2.0.0.dev1',
                    releaseTimestamp: '2017-10-24T10:09:16',
                },
                { version: '2.1.0', releaseTimestamp: '2019-01-20T19:59:28' },
                { version: '2.2.0', releaseTimestamp: '2019-07-16T18:29:00' },
            ],
        };
        const datasource = datasourcePypi.id;
        const lookupName = 'django';
        metadata_1.addMetaData(dep, datasource, lookupName);
        expect(dep).toMatchSnapshot();
    });
    it('Should handle manualSourceUrls', () => {
        const dep = {
            releases: [
                { version: '2.0.0', releaseTimestamp: '2018-07-13T10:14:17' },
                {
                    version: '2.0.0.dev1',
                    releaseTimestamp: '2017-10-24T10:09:16',
                },
                { version: '2.1.0', releaseTimestamp: '2019-01-20T19:59:28' },
                { version: '2.2.0', releaseTimestamp: '2019-07-16T18:29:00' },
            ],
        };
        const datasource = datasourcePypi.id;
        const lookupName = 'mkdocs';
        metadata_1.addMetaData(dep, datasource, lookupName);
        expect(dep).toMatchSnapshot();
    });
    it('Should handle parsing of sourceUrls correctly', () => {
        const dep = {
            sourceUrl: 'https://github.com/carltongibson/django-filter/tree/master',
            releases: [
                { version: '2.0.0', releaseTimestamp: '2018-07-13T10:14:17' },
                {
                    version: '2.0.0.dev1',
                    releaseTimestamp: '2017-10-24T10:09:16',
                },
                { version: '2.1.0', releaseTimestamp: '2019-01-20T19:59:28' },
                { version: '2.2.0', releaseTimestamp: '2019-07-16T18:29:00' },
            ],
        };
        const datasource = datasourcePypi.id;
        const lookupName = 'django-filter';
        metadata_1.addMetaData(dep, datasource, lookupName);
        expect(dep).toMatchSnapshot();
    });
    it('Should handle parsing of sourceUrls correctly for GitLab also', () => {
        const dep = {
            sourceUrl: 'https://gitlab.com/meno/dropzone/tree/master',
            releases: [
                { version: '5.7.0', releaseTimestamp: '2020-02-14T13:12:00' },
                {
                    version: '5.6.1',
                    releaseTimestamp: '2020-02-14T10:04:00',
                },
            ],
        };
        const datasource = datasourceNpm.id;
        const lookupName = 'dropzone';
        metadata_1.addMetaData(dep, datasource, lookupName);
        expect(dep).toMatchSnapshot();
    });
    it('Should handle failed parsing of sourceUrls for GitLab', () => {
        const dep = {
            sourceUrl: 'https://gitlab-nope',
            releases: [
                { version: '5.7.0', releaseTimestamp: '2020-02-14T13:12:00' },
                {
                    version: '5.6.1',
                    releaseTimestamp: '2020-02-14T10:04:00',
                },
            ],
        };
        const datasource = datasourceNpm.id;
        const lookupName = 'dropzone';
        metadata_1.addMetaData(dep, datasource, lookupName);
        expect(dep).toMatchSnapshot();
    });
    it('Should handle failed parsing of sourceUrls for other', () => {
        const dep = {
            sourceUrl: 'https://nope-nope-nope',
            releases: [
                { version: '5.7.0', releaseTimestamp: '2020-02-14T13:12:00' },
                {
                    version: '5.6.1',
                    releaseTimestamp: '2020-02-14T10:04:00',
                },
            ],
        };
        const datasource = datasourceNpm.id;
        const lookupName = 'dropzone';
        metadata_1.addMetaData(dep, datasource, lookupName);
        expect(dep).toMatchSnapshot();
    });
    it('Should handle non-url', () => {
        const dep = {
            sourceUrl: 'not-a-url',
            releases: [
                { version: '5.7.0', releaseTimestamp: '2020-02-14T13:12:00' },
                {
                    version: '5.6.1',
                    releaseTimestamp: '2020-02-14T10:04:00',
                },
            ],
        };
        const datasource = datasourceNpm.id;
        const lookupName = 'dropzone';
        metadata_1.addMetaData(dep, datasource, lookupName);
        expect(dep).toMatchSnapshot();
    });
    it('Should handle parsing/converting of GitHub sourceUrls with http and www correctly', () => {
        const dep = {
            sourceUrl: 'http://www.github.com/mockk/mockk/',
            releases: [{ version: '1.9.3' }],
        };
        const datasource = datasourceMaven.id;
        const lookupName = 'io.mockk:mockk';
        metadata_1.addMetaData(dep, datasource, lookupName);
        expect(dep.sourceUrl).toEqual('https://github.com/mockk/mockk');
    });
    it('Should move github homepage to sourceUrl', () => {
        const dep = {
            homepage: 'http://www.github.com/mockk/mockk/',
            releases: [{ version: '1.9.3' }],
            sourceUrl: undefined,
        };
        const datasource = datasourceMaven.id;
        const lookupName = 'io.mockk:mockk';
        metadata_1.addMetaData(dep, datasource, lookupName);
        expect(dep.sourceUrl).toEqual('https://github.com/mockk/mockk');
        expect(dep.homepage).toBeUndefined();
    });
    it('Should handle parsing/converting of GitLab sourceUrls with http and www correctly', () => {
        const dep = {
            sourceUrl: 'http://gitlab.com/meno/dropzone/',
            releases: [{ version: '5.7.0' }],
        };
        const datasource = datasourceMaven.id;
        const lookupName = 'dropzone';
        metadata_1.addMetaData(dep, datasource, lookupName);
        expect(dep.sourceUrl).toEqual('https://gitlab.com/meno/dropzone');
    });
});
//# sourceMappingURL=metadata.spec.js.map