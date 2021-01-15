"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFileContainsDependency = exports.getTerragruntDependencyType = exports.TerragruntResourceTypes = exports.TerragruntDependencyTypes = exports.keyValueExtractionRegex = void 0;
exports.keyValueExtractionRegex = /^\s*source\s+=\s+"(?<value>[^"]+)"\s*$/;
var TerragruntDependencyTypes;
(function (TerragruntDependencyTypes) {
    TerragruntDependencyTypes["unknown"] = "unknown";
    TerragruntDependencyTypes["terragrunt"] = "terraform";
})(TerragruntDependencyTypes = exports.TerragruntDependencyTypes || (exports.TerragruntDependencyTypes = {}));
var TerragruntResourceTypes;
(function (TerragruntResourceTypes) {
    TerragruntResourceTypes["unknown"] = "unknown";
    /**
     * https://www.terraform.io/docs/providers/docker/r/container.html
     */
})(TerragruntResourceTypes = exports.TerragruntResourceTypes || (exports.TerragruntResourceTypes = {}));
function getTerragruntDependencyType(value) {
    switch (value) {
        case 'terraform': {
            return TerragruntDependencyTypes.terragrunt;
        }
        default: {
            return TerragruntDependencyTypes.unknown;
        }
    }
}
exports.getTerragruntDependencyType = getTerragruntDependencyType;
function checkFileContainsDependency(content, checkList) {
    return checkList.some((check) => content.includes(check));
}
exports.checkFileContainsDependency = checkFileContainsDependency;
//# sourceMappingURL=util.js.map