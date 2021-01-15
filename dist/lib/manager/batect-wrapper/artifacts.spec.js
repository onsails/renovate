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
const httpMock = __importStar(require("../../../test/http-mock"));
const artifacts_1 = require("./artifacts");
const newVersion = '1.2.3';
const newUnixWrapperContent = `Unix wrapper script for ${newVersion}`;
const newWindowsWrapperContent = `Windows wrapper script for ${newVersion}`;
function artifactForPath(path, toVersion = newVersion) {
    return {
        packageFileName: path,
        updatedDeps: ['batect/batect'],
        newPackageFileContent: 'not used',
        config: {
            toVersion,
        },
    };
}
describe('lib/manager/batect-wrapper/artifacts', () => {
    beforeEach(() => {
        httpMock.setup();
        httpMock
            .scope('https://github.com')
            .get('/batect/batect/releases/download/1.2.3/batect')
            .reply(200, newUnixWrapperContent);
        httpMock
            .scope('https://github.com')
            .get('/batect/batect/releases/download/1.2.3/batect.cmd')
            .reply(200, newWindowsWrapperContent);
        httpMock
            .scope('https://github.com')
            .get('/batect/batect/releases/download/3.4.5/batect')
            .reply(404);
        httpMock
            .scope('https://github.com')
            .get('/batect/batect/releases/download/3.4.5/batect.cmd')
            .reply(418);
    });
    afterEach(() => {
        httpMock.reset();
    });
    describe('updateArtifacts', () => {
        it('returns updated files if the wrapper script is in the root directory', async () => {
            const artifact = artifactForPath('batect');
            const result = await artifacts_1.updateArtifacts(artifact);
            expect(result).toEqual([
                {
                    file: {
                        name: 'batect',
                        contents: newUnixWrapperContent,
                    },
                },
                {
                    file: {
                        name: 'batect.cmd',
                        contents: newWindowsWrapperContent,
                    },
                },
            ]);
        });
        it('returns updated files if the wrapper script is in a subdirectory', async () => {
            const artifact = artifactForPath('some/sub/dir/batect');
            const result = await artifacts_1.updateArtifacts(artifact);
            expect(result).toEqual([
                {
                    file: {
                        name: 'some/sub/dir/batect',
                        contents: newUnixWrapperContent,
                    },
                },
                {
                    file: {
                        name: 'some/sub/dir/batect.cmd',
                        contents: newWindowsWrapperContent,
                    },
                },
            ]);
        });
        it('returns an error if the updated wrapper script cannot be downloaded', async () => {
            const artifact = artifactForPath('batect', '3.4.5');
            const result = await artifacts_1.updateArtifacts(artifact);
            expect(result).toEqual([
                {
                    artifactError: {
                        lockFile: 'batect',
                        stderr: 'HTTP GET https://github.com/batect/batect/releases/download/3.4.5/batect failed: HTTPError: Response code 404 (Not Found)',
                    },
                },
                {
                    artifactError: {
                        lockFile: 'batect.cmd',
                        stderr: "HTTP GET https://github.com/batect/batect/releases/download/3.4.5/batect.cmd failed: HTTPError: Response code 418 (I'm a Teapot)",
                    },
                },
            ]);
        });
    });
});
//# sourceMappingURL=artifacts.spec.js.map