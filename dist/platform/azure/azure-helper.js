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
exports.getMergeMethod = exports.getProjectAndRepo = exports.getCommitDetails = exports.max4000Chars = exports.getFile = exports.getAzureBranchObj = exports.getRefs = exports.getStorageExtraCloneOpts = void 0;
const GitInterfaces_1 = require("azure-devops-node-api/interfaces/GitInterfaces");
const logger_1 = require("../../logger");
const sanitize_1 = require("../../util/sanitize");
const azureApi = __importStar(require("./azure-got-wrapper"));
const util_1 = require("./util");
const mergePolicyGuid = 'fa4e907d-c16b-4a4c-9dfa-4916e5d171ab'; // Magic GUID for merge strategy policy configurations
function toBase64(from) {
    return Buffer.from(from).toString('base64');
}
function getStorageExtraCloneOpts(config) {
    let authType;
    let authValue;
    if (!config.token && config.username && config.password) {
        authType = 'basic';
        authValue = toBase64(`${config.username}:${config.password}`);
    }
    else if (config.token.length !== 52) {
        authType = 'bearer';
        authValue = config.token;
    }
    else {
        authType = 'basic';
        authValue = toBase64(`:${config.token}`);
    }
    sanitize_1.add(authValue);
    return {
        '-c': `http.extraheader=AUTHORIZATION: ${authType} ${authValue}`,
    };
}
exports.getStorageExtraCloneOpts = getStorageExtraCloneOpts;
async function getRefs(repoId, branchName) {
    logger_1.logger.debug(`getRefs(${repoId}, ${branchName})`);
    const azureApiGit = await azureApi.gitApi();
    const refs = await azureApiGit.getRefs(repoId, undefined, util_1.getBranchNameWithoutRefsPrefix(branchName));
    return refs;
}
exports.getRefs = getRefs;
async function getAzureBranchObj(repoId, branchName, from) {
    const fromBranchName = util_1.getNewBranchName(from);
    const refs = await getRefs(repoId, fromBranchName);
    if (refs.length === 0) {
        logger_1.logger.debug(`getAzureBranchObj without a valid from, so initial commit.`);
        return {
            name: util_1.getNewBranchName(branchName),
            oldObjectId: '0000000000000000000000000000000000000000',
        };
    }
    return {
        name: util_1.getNewBranchName(branchName),
        oldObjectId: refs[0].objectId,
    };
}
exports.getAzureBranchObj = getAzureBranchObj;
async function streamToString(stream) {
    const chunks = [];
    /* eslint-disable promise/avoid-new */
    const p = await new Promise((resolve) => {
        stream.on('data', (chunk) => {
            chunks.push(chunk.toString());
        });
        stream.on('end', () => {
            resolve(chunks.join(''));
        });
    });
    return p;
}
// if no branchName, look globally
async function getFile(repoId, filePath, branchName) {
    logger_1.logger.trace(`getFile(filePath=${filePath}, branchName=${branchName})`);
    const azureApiGit = await azureApi.gitApi();
    const item = await azureApiGit.getItemText(repoId, filePath, undefined, undefined, 0, // because we look for 1 file
    false, false, true, {
        versionType: 0,
        versionOptions: 0,
        version: util_1.getBranchNameWithoutRefsheadsPrefix(branchName),
    });
    if (item === null || item === void 0 ? void 0 : item.readable) {
        const fileContent = await streamToString(item);
        try {
            const jTmp = JSON.parse(fileContent);
            if (jTmp.typeKey === 'GitItemNotFoundException') {
                // file not found
                return null;
            }
            if (jTmp.typeKey === 'GitUnresolvableToCommitException') {
                // branch not found
                return null;
            }
        }
        catch (error) {
            // it 's not a JSON, so I send the content directly with the line under
        }
        return fileContent;
    }
    return null; // no file found
}
exports.getFile = getFile;
function max4000Chars(str) {
    if (str && str.length >= 4000) {
        return str.substring(0, 3999);
    }
    return str;
}
exports.max4000Chars = max4000Chars;
async function getCommitDetails(commit, repoId) {
    logger_1.logger.debug(`getCommitDetails(${commit}, ${repoId})`);
    const azureApiGit = await azureApi.gitApi();
    const results = await azureApiGit.getCommit(commit, repoId);
    return results;
}
exports.getCommitDetails = getCommitDetails;
function getProjectAndRepo(str) {
    logger_1.logger.trace(`getProjectAndRepo(${str})`);
    const strSplit = str.split(`/`);
    if (strSplit.length === 1) {
        return {
            project: str,
            repo: str,
        };
    }
    if (strSplit.length === 2) {
        return {
            project: strSplit[0],
            repo: strSplit[1],
        };
    }
    const msg = `${str} can be only structured this way : 'repository' or 'projectName/repository'!`;
    logger_1.logger.error(msg);
    throw new Error(msg);
}
exports.getProjectAndRepo = getProjectAndRepo;
async function getMergeMethod(repoId, project, branchRef) {
    const isRelevantScope = (scope) => {
        if (scope.repositoryId !== repoId) {
            return false;
        }
        if (!branchRef) {
            return true;
        }
        return scope.matchKind === 'Exact'
            ? scope.refName === branchRef
            : branchRef.startsWith(scope.refName);
    };
    const policyConfigurations = (await (await azureApi.policyApi()).getPolicyConfigurations(project))
        .filter((p) => p.settings.scope.some(isRelevantScope) && p.type.id === mergePolicyGuid)
        .map((p) => p.settings)[0];
    logger_1.logger.trace(`getMergeMethod(${repoId}, ${project}, ${branchRef}) determining mergeMethod from matched policy:\n${JSON.stringify(policyConfigurations, null, 4)}`);
    try {
        return Object.keys(policyConfigurations)
            .map((p) => GitInterfaces_1.GitPullRequestMergeStrategy[p.slice(5)])
            .find((p) => p);
    }
    catch (err) {
        return GitInterfaces_1.GitPullRequestMergeStrategy.NoFastForward;
    }
}
exports.getMergeMethod = getMergeMethod;
//# sourceMappingURL=azure-helper.js.map