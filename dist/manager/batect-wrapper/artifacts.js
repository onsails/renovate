"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateArtifacts = void 0;
const logger_1 = require("../../logger");
const http_1 = require("../../util/http");
const http = new http_1.Http('batect-wrapper');
async function updateArtifact(path, fileName, version) {
    const url = `https://github.com/batect/batect/releases/download/${version}/${fileName}`;
    try {
        const response = await http.get(url);
        const contents = response.body;
        return {
            file: {
                name: path,
                contents,
            },
        };
    }
    catch (err) {
        const errorDescription = err.toString();
        return {
            artifactError: {
                lockFile: path,
                stderr: `HTTP GET ${url} failed: ${errorDescription}`,
            },
        };
    }
}
async function updateArtifacts({ packageFileName, config, }) {
    const version = config.toVersion;
    logger_1.logger.debug({ version, packageFileName }, 'Updating Batect wrapper scripts');
    return [
        await updateArtifact(packageFileName, 'batect', version),
        await updateArtifact(`${packageFileName}.cmd`, 'batect.cmd', version),
    ];
}
exports.updateArtifacts = updateArtifacts;
//# sourceMappingURL=artifacts.js.map