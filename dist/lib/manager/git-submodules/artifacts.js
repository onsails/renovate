"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../logger");
function updateArtifacts({ updatedDeps, }) {
    const res = [];
    updatedDeps.forEach((dep) => {
        logger_1.logger.info('Updating submodule ' + dep);
        res.push({
            file: {
                name: dep,
                contents: '',
            },
        });
    });
    return res;
}
exports.default = updateArtifacts;
//# sourceMappingURL=artifacts.js.map