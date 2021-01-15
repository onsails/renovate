"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTerragruntProvider = exports.sourceExtractionRegex = void 0;
const util_1 = require("./util");
exports.sourceExtractionRegex = /^(?:(?<hostname>(?:[a-zA-Z0-9]+\.+)+[a-zA-Z0-9]+)\/)?(?:(?<namespace>[^/]+)\/)?(?<type>[^/]+)/;
function extractBracesContent(content) {
    const stack = [];
    let i = 0;
    for (i; i < content.length; i += 1) {
        if (content[i] === '{') {
            stack.push(content[i]);
        }
        else if (content[i] === '}') {
            stack.pop();
            if (stack.length === 0) {
                break;
            }
        }
    }
    return i;
}
function extractTerragruntProvider(startingLine, lines, moduleName) {
    const lineNumber = startingLine;
    let line;
    const deps = [];
    const dep = {
        managerData: {
            moduleName,
            terragruntDependencyType: util_1.TerragruntDependencyTypes.terragrunt,
        },
    };
    const teraformContent = lines
        .slice(lineNumber)
        .join('\n')
        .substring(0, extractBracesContent(lines.slice(lineNumber).join('\n')))
        .split('\n');
    for (let lineNo = 0; lineNo < teraformContent.length; lineNo += 1) {
        line = teraformContent[lineNo];
        const kvMatch = util_1.keyValueExtractionRegex.exec(line);
        if (kvMatch) {
            dep.managerData.source = kvMatch.groups.value;
            dep.managerData.sourceLine = lineNumber + lineNo;
        }
    }
    deps.push(dep);
    return { lineNumber, dependencies: deps };
}
exports.extractTerragruntProvider = extractTerragruntProvider;
//# sourceMappingURL=providers.js.map