"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPackageFile = void 0;
const logger_1 = require("../../logger");
const modules_1 = require("./modules");
const util_1 = require("./util");
const dependencyBlockExtractionRegex = /^\s*(?<type>[a-z_]+)\s+{\s*$/;
const contentCheckList = ['terraform {'];
function extractPackageFile(content) {
    logger_1.logger.trace({ content }, 'terragrunt.extractPackageFile()');
    if (!util_1.checkFileContainsDependency(content, contentCheckList)) {
        return null;
    }
    let deps = [];
    try {
        const lines = content.split('\n');
        for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
            const line = lines[lineNumber];
            const terragruntDependency = dependencyBlockExtractionRegex.exec(line);
            if (terragruntDependency) {
                logger_1.logger.trace(`Matched ${terragruntDependency.groups.type} on line ${lineNumber}`);
                const tfDepType = util_1.getTerragruntDependencyType(terragruntDependency.groups.type);
                let result = null;
                switch (tfDepType) {
                    case util_1.TerragruntDependencyTypes.terragrunt: {
                        result = modules_1.extractTerragruntModule(lineNumber, lines);
                        break;
                    }
                    /* istanbul ignore next */
                    default:
                        logger_1.logger.trace(`Could not identify TerragruntDependencyType ${terragruntDependency.groups.type} on line ${lineNumber}.`);
                        break;
                }
                if (result) {
                    lineNumber = result.lineNumber;
                    deps = deps.concat(result.dependencies);
                    result = null;
                }
            }
        }
    }
    catch (err) /* istanbul ignore next */ {
        logger_1.logger.warn({ err }, 'Error extracting terragrunt plugins');
    }
    deps.forEach((dep) => {
        switch (dep.managerData.terragruntDependencyType) {
            case util_1.TerragruntDependencyTypes.terragrunt:
                modules_1.analyseTerragruntModule(dep);
                break;
            /* istanbul ignore next */
            default:
        }
        // eslint-disable-next-line no-param-reassign
        delete dep.managerData;
    });
    return { deps };
}
exports.extractPackageFile = extractPackageFile;
//# sourceMappingURL=extract.js.map