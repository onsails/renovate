"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranch = exports.getCombinedCommitStatus = exports.renovateToGiteaStatusMapping = exports.giteaToRenovateStatusMapping = exports.createCommitStatus = exports.getComments = exports.deleteComment = exports.updateComment = exports.createComment = exports.unassignLabel = exports.getOrgLabels = exports.getRepoLabels = exports.searchIssues = exports.closeIssue = exports.updateIssue = exports.createIssue = exports.searchPRs = exports.requestPrReviewers = exports.getPR = exports.mergePR = exports.closePR = exports.updatePR = exports.createPR = exports.getRepoContents = exports.getRepo = exports.searchRepos = exports.getCurrentUser = void 0;
const url_1 = require("url");
const types_1 = require("../../types");
const gitea_1 = require("../../util/http/gitea");
const giteaHttp = new gitea_1.GiteaHttp();
const urlEscape = (raw) => encodeURIComponent(raw);
const commitStatusStates = [
    'unknown',
    'success',
    'pending',
    'warning',
    'failure',
    'error',
];
function queryParams(params) {
    const usp = new url_1.URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (Array.isArray(v)) {
            for (const item of v) {
                usp.append(k, item.toString());
            }
        }
        else {
            usp.append(k, v.toString());
        }
    }
    return usp;
}
async function getCurrentUser(options) {
    const url = 'user';
    const res = await giteaHttp.getJson(url, options);
    return res.body;
}
exports.getCurrentUser = getCurrentUser;
async function searchRepos(params, options) {
    const query = queryParams(params).toString();
    const url = `repos/search?${query}`;
    const res = await giteaHttp.getJson(url, {
        ...options,
        paginate: true,
    });
    if (!res.body.ok) {
        throw new Error('Unable to search for repositories, ok flag has not been set');
    }
    return res.body.data;
}
exports.searchRepos = searchRepos;
async function getRepo(repoPath, options) {
    const url = `repos/${repoPath}`;
    const res = await giteaHttp.getJson(url, options);
    return res.body;
}
exports.getRepo = getRepo;
async function getRepoContents(repoPath, filePath, ref, options) {
    const query = queryParams(ref ? { ref } : {}).toString();
    const url = `repos/${repoPath}/contents/${urlEscape(filePath)}?${query}`;
    const res = await giteaHttp.getJson(url, options);
    if (res.body.content) {
        res.body.contentString = Buffer.from(res.body.content, 'base64').toString();
    }
    return res.body;
}
exports.getRepoContents = getRepoContents;
async function createPR(repoPath, params, options) {
    const url = `repos/${repoPath}/pulls`;
    const res = await giteaHttp.postJson(url, {
        ...options,
        body: params,
    });
    return res.body;
}
exports.createPR = createPR;
async function updatePR(repoPath, idx, params, options) {
    const url = `repos/${repoPath}/pulls/${idx}`;
    const res = await giteaHttp.patchJson(url, {
        ...options,
        body: params,
    });
    return res.body;
}
exports.updatePR = updatePR;
async function closePR(repoPath, idx, options) {
    await updatePR(repoPath, idx, {
        ...options,
        state: types_1.PrState.Closed,
    });
}
exports.closePR = closePR;
async function mergePR(repoPath, idx, method, options) {
    const params = { Do: method };
    const url = `repos/${repoPath}/pulls/${idx}/merge`;
    await giteaHttp.postJson(url, {
        ...options,
        body: params,
    });
}
exports.mergePR = mergePR;
async function getPR(repoPath, idx, options) {
    const url = `repos/${repoPath}/pulls/${idx}`;
    const res = await giteaHttp.getJson(url, options);
    return res.body;
}
exports.getPR = getPR;
async function requestPrReviewers(repoPath, idx, params, options) {
    const url = `repos/${repoPath}/pulls/${idx}/requested_reviewers`;
    await giteaHttp.postJson(url, {
        ...options,
        body: params,
    });
}
exports.requestPrReviewers = requestPrReviewers;
async function searchPRs(repoPath, params, options) {
    const query = queryParams(params).toString();
    const url = `repos/${repoPath}/pulls?${query}`;
    const res = await giteaHttp.getJson(url, {
        ...options,
        paginate: true,
    });
    return res.body;
}
exports.searchPRs = searchPRs;
async function createIssue(repoPath, params, options) {
    const url = `repos/${repoPath}/issues`;
    const res = await giteaHttp.postJson(url, {
        ...options,
        body: params,
    });
    return res.body;
}
exports.createIssue = createIssue;
async function updateIssue(repoPath, idx, params, options) {
    const url = `repos/${repoPath}/issues/${idx}`;
    const res = await giteaHttp.patchJson(url, {
        ...options,
        body: params,
    });
    return res.body;
}
exports.updateIssue = updateIssue;
async function closeIssue(repoPath, idx, options) {
    await updateIssue(repoPath, idx, {
        ...options,
        state: 'closed',
    });
}
exports.closeIssue = closeIssue;
async function searchIssues(repoPath, params, options) {
    const query = queryParams({ ...params, type: 'issues' }).toString();
    const url = `repos/${repoPath}/issues?${query}`;
    const res = await giteaHttp.getJson(url, {
        ...options,
        paginate: true,
    });
    return res.body;
}
exports.searchIssues = searchIssues;
async function getRepoLabels(repoPath, options) {
    const url = `repos/${repoPath}/labels`;
    const res = await giteaHttp.getJson(url, options);
    return res.body;
}
exports.getRepoLabels = getRepoLabels;
async function getOrgLabels(orgName, options) {
    const url = `orgs/${orgName}/labels`;
    const res = await giteaHttp.getJson(url, options);
    return res.body;
}
exports.getOrgLabels = getOrgLabels;
async function unassignLabel(repoPath, issue, label, options) {
    const url = `repos/${repoPath}/issues/${issue}/labels/${label}`;
    await giteaHttp.deleteJson(url, options);
}
exports.unassignLabel = unassignLabel;
async function createComment(repoPath, issue, body, options) {
    const params = { body };
    const url = `repos/${repoPath}/issues/${issue}/comments`;
    const res = await giteaHttp.postJson(url, {
        ...options,
        body: params,
    });
    return res.body;
}
exports.createComment = createComment;
async function updateComment(repoPath, idx, body, options) {
    const params = { body };
    const url = `repos/${repoPath}/issues/comments/${idx}`;
    const res = await giteaHttp.patchJson(url, {
        ...options,
        body: params,
    });
    return res.body;
}
exports.updateComment = updateComment;
async function deleteComment(repoPath, idx, options) {
    const url = `repos/${repoPath}/issues/comments/${idx}`;
    await giteaHttp.deleteJson(url, options);
}
exports.deleteComment = deleteComment;
async function getComments(repoPath, issue, options) {
    const url = `repos/${repoPath}/issues/${issue}/comments`;
    const res = await giteaHttp.getJson(url, options);
    return res.body;
}
exports.getComments = getComments;
async function createCommitStatus(repoPath, branchCommit, params, options) {
    const url = `repos/${repoPath}/statuses/${branchCommit}`;
    const res = await giteaHttp.postJson(url, {
        ...options,
        body: params,
    });
    return res.body;
}
exports.createCommitStatus = createCommitStatus;
exports.giteaToRenovateStatusMapping = {
    unknown: types_1.BranchStatus.yellow,
    success: types_1.BranchStatus.green,
    pending: types_1.BranchStatus.yellow,
    warning: types_1.BranchStatus.red,
    failure: types_1.BranchStatus.red,
    error: types_1.BranchStatus.red,
};
exports.renovateToGiteaStatusMapping = {
    green: 'success',
    yellow: 'pending',
    red: 'failure',
};
function filterStatus(data) {
    const ret = {};
    for (const i of data) {
        if (!ret[i.context] ||
            new Date(ret[i.context].created_at) < new Date(i.created_at)) {
            ret[i.context] = i;
        }
    }
    return Object.values(ret);
}
async function getCombinedCommitStatus(repoPath, branchName, options) {
    const url = `repos/${repoPath}/commits/${urlEscape(branchName)}/statuses`;
    const res = await giteaHttp.getJson(url, {
        ...options,
        paginate: true,
    });
    let worstState = 0;
    for (const cs of filterStatus(res.body)) {
        worstState = Math.max(worstState, commitStatusStates.indexOf(cs.status));
    }
    return {
        worstStatus: commitStatusStates[worstState],
        statuses: res.body,
    };
}
exports.getCombinedCommitStatus = getCombinedCommitStatus;
async function getBranch(repoPath, branchName, options) {
    const url = `repos/${repoPath}/branches/${urlEscape(branchName)}`;
    const res = await giteaHttp.getJson(url, options);
    return res.body;
}
exports.getBranch = getBranch;
//# sourceMappingURL=gitea-helper.js.map