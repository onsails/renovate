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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVulnerabilityAlerts = exports.mergePr = exports.updatePr = exports.createPr = exports.ensureCommentRemoval = exports.ensureComment = exports.deleteLabel = exports.addReviewers = exports.addAssignees = exports.ensureIssueClosing = exports.getIssueList = exports.ensureIssue = exports.getPrBody = exports.findIssue = exports.setBranchStatus = exports.getBranchStatusCheck = exports.getBranchStatus = exports.getBranchPr = exports.getPr = exports.findPr = exports.getPrList = exports.getRepoForceRebase = exports.initRepo = exports.getJsonFile = exports.getRepos = exports.initPlatform = void 0;
const url_1 = __importDefault(require("url"));
const is_1 = __importDefault(require("@sindresorhus/is"));
const parse_diff_1 = __importDefault(require("parse-diff"));
const error_messages_1 = require("../../constants/error-messages");
const platforms_1 = require("../../constants/platforms");
const logger_1 = require("../../logger");
const types_1 = require("../../types");
const git = __importStar(require("../../util/git"));
const hostRules = __importStar(require("../../util/host-rules"));
const bitbucket_1 = require("../../util/http/bitbucket");
const sanitize_1 = require("../../util/sanitize");
const pr_body_1 = require("../utils/pr-body");
const read_only_issue_body_1 = require("../utils/read-only-issue-body");
const comments = __importStar(require("./comments"));
const utils = __importStar(require("./utils"));
const bitbucketHttp = new bitbucket_1.BitbucketHttp();
const BITBUCKET_PROD_ENDPOINT = 'https://api.bitbucket.org/';
let config = {};
const defaults = { endpoint: BITBUCKET_PROD_ENDPOINT };
let renovateUserUuid;
async function initPlatform({ endpoint, username, password, }) {
    var _a, _b, _c, _d;
    if (!(username && password)) {
        throw new Error('Init: You must configure a Bitbucket username and password');
    }
    if (endpoint && endpoint !== BITBUCKET_PROD_ENDPOINT) {
        logger_1.logger.warn(`Init: Bitbucket Cloud endpoint should generally be ${BITBUCKET_PROD_ENDPOINT} but is being configured to a different value. Did you mean to use Bitbucket Server?`);
        defaults.endpoint = endpoint;
    }
    bitbucket_1.setBaseUrl(defaults.endpoint);
    renovateUserUuid = null;
    try {
        const { uuid } = (await bitbucketHttp.getJson('/2.0/user', {
            username,
            password,
            useCache: false,
        })).body;
        renovateUserUuid = uuid;
    }
    catch (err) {
        if (err.statusCode === 403 && ((_d = (_c = (_b = (_a = err.body) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.detail) === null || _c === void 0 ? void 0 : _c.required) === null || _d === void 0 ? void 0 : _d.includes('account'))) {
            logger_1.logger.warn(`Bitbucket: missing 'account' scope for password`);
        }
        else {
            logger_1.logger.debug({ err }, 'Unknown error fetching Bitbucket user identity');
        }
    }
    // TODO: Add a connection check that endpoint/username/password combination are valid
    const platformConfig = {
        endpoint: endpoint || BITBUCKET_PROD_ENDPOINT,
    };
    return Promise.resolve(platformConfig);
}
exports.initPlatform = initPlatform;
// Get all repositories that the user has access to
async function getRepos() {
    logger_1.logger.debug('Autodiscovering Bitbucket Cloud repositories');
    try {
        const repos = await utils.accumulateValues(`/2.0/repositories/?role=contributor`);
        return repos.map((repo) => repo.full_name);
    }
    catch (err) /* istanbul ignore next */ {
        logger_1.logger.error({ err }, `bitbucket getRepos error`);
        throw err;
    }
}
exports.getRepos = getRepos;
async function getJsonFile(fileName) {
    try {
        return (await bitbucketHttp.getJson(`/2.0/repositories/${config.repository}/src/${config.defaultBranch}/${fileName}`)).body;
    }
    catch (err) {
        return null;
    }
}
exports.getJsonFile = getJsonFile;
// Initialize bitbucket by getting base branch and SHA
async function initRepo({ repository, localDir, cloneSubmodules, ignorePrAuthor, }) {
    var _a, _b;
    logger_1.logger.debug(`initRepo("${repository}")`);
    const opts = hostRules.find({
        hostType: platforms_1.PLATFORM_TYPE_BITBUCKET,
        url: defaults.endpoint,
    });
    config = {
        repository,
        username: opts.username,
        ignorePrAuthor,
    };
    let info;
    try {
        info = utils.repoInfoTransformer((await bitbucketHttp.getJson(`/2.0/repositories/${repository}`)).body);
        config.defaultBranch = info.mainbranch;
        Object.assign(config, {
            owner: info.owner,
            mergeMethod: info.mergeMethod,
            has_issues: info.has_issues,
        });
        logger_1.logger.debug(`${repository} owner = ${config.owner}`);
    }
    catch (err) /* istanbul ignore next */ {
        if (err.statusCode === 404) {
            throw new Error(error_messages_1.REPOSITORY_NOT_FOUND);
        }
        logger_1.logger.debug({ err }, 'Unknown Bitbucket initRepo error');
        throw err;
    }
    const { hostname } = url_1.default.parse(defaults.endpoint);
    // Converts API hostnames to their respective HTTP git hosts:
    // `api.bitbucket.org`  to `bitbucket.org`
    // `api-staging.<host>` to `staging.<host>`
    const hostnameWithoutApiPrefix = /api[.|-](.+)/.exec(hostname)[1];
    const url = git.getUrl({
        protocol: 'https',
        auth: `${opts.username}:${opts.password}`,
        hostname: hostnameWithoutApiPrefix,
        repository,
    });
    await git.initRepo({
        ...config,
        localDir,
        url,
        gitAuthorName: (_a = global.gitAuthor) === null || _a === void 0 ? void 0 : _a.name,
        gitAuthorEmail: (_b = global.gitAuthor) === null || _b === void 0 ? void 0 : _b.email,
        cloneSubmodules,
    });
    const repoConfig = {
        defaultBranch: info.mainbranch,
        isFork: info.isFork,
    };
    return repoConfig;
}
exports.initRepo = initRepo;
// Returns true if repository has rule enforcing PRs are up-to-date with base branch before merging
function getRepoForceRebase() {
    // BB doesnt have an option to flag staled branches
    return Promise.resolve(false);
}
exports.getRepoForceRebase = getRepoForceRebase;
// istanbul ignore next
function matchesState(state, desiredState) {
    if (desiredState === types_1.PrState.All) {
        return true;
    }
    if (desiredState.startsWith('!')) {
        return state !== desiredState.substring(1);
    }
    return state === desiredState;
}
async function getPrList() {
    logger_1.logger.debug('getPrList()');
    if (!config.prList) {
        logger_1.logger.debug('Retrieving PR list');
        let url = `/2.0/repositories/${config.repository}/pullrequests?`;
        url += utils.prStates.all.map((state) => 'state=' + state).join('&');
        const prs = await utils.accumulateValues(url, undefined, undefined, 50);
        config.prList = prs
            .filter((pr) => {
            var _a;
            const prAuthorId = (_a = pr === null || pr === void 0 ? void 0 : pr.author) === null || _a === void 0 ? void 0 : _a.uuid;
            return renovateUserUuid && prAuthorId && !config.ignorePrAuthor
                ? renovateUserUuid === prAuthorId
                : true;
        })
            .map(utils.prInfo);
        logger_1.logger.debug({ length: config.prList.length }, 'Retrieved Pull Requests');
    }
    return config.prList;
}
exports.getPrList = getPrList;
async function findPr({ branchName, prTitle, state = types_1.PrState.All, }) {
    logger_1.logger.debug(`findPr(${branchName}, ${prTitle}, ${state})`);
    const prList = await getPrList();
    const pr = prList.find((p) => p.sourceBranch === branchName &&
        (!prTitle || p.title === prTitle) &&
        matchesState(p.state, state));
    if (pr) {
        logger_1.logger.debug(`Found PR #${pr.number}`);
    }
    return pr;
}
exports.findPr = findPr;
async function isPrConflicted(prNo) {
    const diff = (await bitbucketHttp.get(`/2.0/repositories/${config.repository}/pullrequests/${prNo}/diff`)).body;
    return utils.isConflicted(parse_diff_1.default(diff));
}
// Gets details for a PR
async function getPr(prNo) {
    const pr = (await bitbucketHttp.getJson(`/2.0/repositories/${config.repository}/pullrequests/${prNo}`)).body;
    // istanbul ignore if
    if (!pr) {
        return null;
    }
    const res = {
        displayNumber: `Pull Request #${pr.id}`,
        ...utils.prInfo(pr),
    };
    if (utils.prStates.open.includes(pr.state)) {
        res.isConflicted = await isPrConflicted(prNo);
        // TODO: Is that correct? Should we check getBranchStatus like gitlab?
        res.canMerge = !res.isConflicted;
    }
    res.hasReviewers = is_1.default.nonEmptyArray(pr.reviewers);
    return res;
}
exports.getPr = getPr;
const escapeHash = (input) => input ? input.replace(/#/g, '%23') : input;
// Return the commit SHA for a branch
async function getBranchCommit(branchName) {
    try {
        const branch = (await bitbucketHttp.getJson(`/2.0/repositories/${config.repository}/refs/branches/${escapeHash(branchName)}`)).body;
        return branch.target.hash;
    }
    catch (err) /* istanbul ignore next */ {
        logger_1.logger.debug({ err }, `getBranchCommit('${branchName}') failed'`);
        return null;
    }
}
// Returns the Pull Request for a branch. Null if not exists.
async function getBranchPr(branchName) {
    logger_1.logger.debug(`getBranchPr(${branchName})`);
    const existingPr = await findPr({
        branchName,
        state: types_1.PrState.Open,
    });
    return existingPr ? getPr(existingPr.number) : null;
}
exports.getBranchPr = getBranchPr;
async function getStatus(branchName, useCache = true) {
    const sha = await getBranchCommit(branchName);
    return utils.accumulateValues(`/2.0/repositories/${config.repository}/commit/${sha}/statuses`, 'get', { useCache });
}
// Returns the combined status for a branch.
async function getBranchStatus(branchName, requiredStatusChecks) {
    logger_1.logger.debug(`getBranchStatus(${branchName})`);
    if (!requiredStatusChecks) {
        // null means disable status checks, so it always succeeds
        logger_1.logger.debug('Status checks disabled = returning "success"');
        return types_1.BranchStatus.green;
    }
    if (requiredStatusChecks.length) {
        // This is Unsupported
        logger_1.logger.warn({ requiredStatusChecks }, `Unsupported requiredStatusChecks`);
        return types_1.BranchStatus.red;
    }
    const statuses = await getStatus(branchName);
    logger_1.logger.debug({ branch: branchName, statuses }, 'branch status check result');
    if (!statuses.length) {
        logger_1.logger.debug('empty branch status check result = returning "pending"');
        return types_1.BranchStatus.yellow;
    }
    const noOfFailures = statuses.filter((status) => status.state === 'FAILED' || status.state === 'STOPPED').length;
    if (noOfFailures) {
        return types_1.BranchStatus.red;
    }
    const noOfPending = statuses.filter((status) => status.state === 'INPROGRESS').length;
    if (noOfPending) {
        return types_1.BranchStatus.yellow;
    }
    return types_1.BranchStatus.green;
}
exports.getBranchStatus = getBranchStatus;
const bbToRenovateStatusMapping = {
    SUCCESSFUL: types_1.BranchStatus.green,
    INPROGRESS: types_1.BranchStatus.yellow,
    FAILED: types_1.BranchStatus.red,
};
async function getBranchStatusCheck(branchName, context) {
    const statuses = await getStatus(branchName);
    const bbState = (statuses.find((status) => status.key === context) || {})
        .state;
    return bbToRenovateStatusMapping[bbState] || null;
}
exports.getBranchStatusCheck = getBranchStatusCheck;
async function setBranchStatus({ branchName, context, description, state, url: targetUrl, }) {
    const sha = await getBranchCommit(branchName);
    // TargetUrl can not be empty so default to bitbucket
    const url = targetUrl || /* istanbul ignore next */ 'http://bitbucket.org';
    const body = {
        name: context,
        state: utils.buildStates[state],
        key: context,
        description,
        url,
    };
    await bitbucketHttp.postJson(`/2.0/repositories/${config.repository}/commit/${sha}/statuses/build`, { body });
    // update status cache
    await getStatus(branchName, false);
}
exports.setBranchStatus = setBranchStatus;
async function findOpenIssues(title) {
    try {
        const filter = encodeURIComponent([
            `title=${JSON.stringify(title)}`,
            '(state = "new" OR state = "open")',
            `reporter.username="${config.username}"`,
        ].join(' AND '));
        return ((await bitbucketHttp.getJson(`/2.0/repositories/${config.repository}/issues?q=${filter}`)).body.values || /* istanbul ignore next */ []);
    }
    catch (err) /* istanbul ignore next */ {
        logger_1.logger.warn({ err }, 'Error finding issues');
        return [];
    }
}
async function findIssue(title) {
    var _a;
    logger_1.logger.debug(`findIssue(${title})`);
    /* istanbul ignore if */
    if (!config.has_issues) {
        logger_1.logger.debug('Issues are disabled - cannot findIssue');
        return null;
    }
    const issues = await findOpenIssues(title);
    if (!issues.length) {
        return null;
    }
    const [issue] = issues;
    return {
        number: issue.id,
        body: (_a = issue.content) === null || _a === void 0 ? void 0 : _a.raw,
    };
}
exports.findIssue = findIssue;
async function closeIssue(issueNumber) {
    await bitbucketHttp.putJson(`/2.0/repositories/${config.repository}/issues/${issueNumber}`, {
        body: { state: 'closed' },
    });
}
function getPrBody(input) {
    // Remove any HTML we use
    return pr_body_1.smartTruncate(input, 50000)
        .replace('you tick the rebase/retry checkbox', 'rename PR to start with "rebase!"')
        .replace(/<\/?summary>/g, '**')
        .replace(/<\/?details>/g, '')
        .replace(new RegExp(`\n---\n\n.*?<!-- rebase-check -->.*?\n`), '')
        .replace(/\]\(\.\.\/pull\//g, '](../../pull-requests/');
}
exports.getPrBody = getPrBody;
async function ensureIssue({ title, reuseTitle, body, }) {
    logger_1.logger.debug(`ensureIssue()`);
    const description = getPrBody(sanitize_1.sanitize(body));
    /* istanbul ignore if */
    if (!config.has_issues) {
        logger_1.logger.warn('Issues are disabled - cannot ensureIssue');
        logger_1.logger.debug({ title }, 'Failed to ensure Issue');
        return null;
    }
    try {
        let issues = await findOpenIssues(title);
        if (!issues.length) {
            issues = await findOpenIssues(reuseTitle);
        }
        if (issues.length) {
            // Close any duplicates
            for (const issue of issues.slice(1)) {
                await closeIssue(issue.id);
            }
            const [issue] = issues;
            if (issue.title !== title ||
                String(issue.content.raw).trim() !== description.trim()) {
                logger_1.logger.debug('Issue updated');
                await bitbucketHttp.putJson(`/2.0/repositories/${config.repository}/issues/${issue.id}`, {
                    body: {
                        content: {
                            raw: read_only_issue_body_1.readOnlyIssueBody(description),
                            markup: 'markdown',
                        },
                    },
                });
                return 'updated';
            }
        }
        else {
            logger_1.logger.info('Issue created');
            await bitbucketHttp.postJson(`/2.0/repositories/${config.repository}/issues`, {
                body: {
                    title,
                    content: {
                        raw: read_only_issue_body_1.readOnlyIssueBody(description),
                        markup: 'markdown',
                    },
                },
            });
            return 'created';
        }
    }
    catch (err) /* istanbul ignore next */ {
        if (err.message.startsWith('Repository has no issue tracker.')) {
            logger_1.logger.debug(`Issues are disabled, so could not create issue: ${err.message}`);
        }
        else {
            logger_1.logger.warn({ err }, 'Could not ensure issue');
        }
    }
    return null;
}
exports.ensureIssue = ensureIssue;
async function getIssueList() {
    logger_1.logger.debug(`getIssueList()`);
    /* istanbul ignore if */
    if (!config.has_issues) {
        logger_1.logger.debug('Issues are disabled - cannot getIssueList');
        return [];
    }
    try {
        const filter = encodeURIComponent([
            '(state = "new" OR state = "open")',
            `reporter.username="${config.username}"`,
        ].join(' AND '));
        return ((await bitbucketHttp.getJson(`/2.0/repositories/${config.repository}/issues?q=${filter}`)).body.values || /* istanbul ignore next */ []);
    }
    catch (err) /* istanbul ignore next */ {
        logger_1.logger.warn({ err }, 'Error finding issues');
        return [];
    }
}
exports.getIssueList = getIssueList;
async function ensureIssueClosing(title) {
    /* istanbul ignore if */
    if (!config.has_issues) {
        logger_1.logger.debug('Issues are disabled - cannot ensureIssueClosing');
        return;
    }
    const issues = await findOpenIssues(title);
    for (const issue of issues) {
        await closeIssue(issue.id);
    }
}
exports.ensureIssueClosing = ensureIssueClosing;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addAssignees(_prNr, _assignees) {
    // Bitbucket supports "participants" and "reviewers" so does not seem to have the concept of "assignee"
    logger_1.logger.warn('Cannot add assignees');
    return Promise.resolve();
}
exports.addAssignees = addAssignees;
async function addReviewers(prId, reviewers) {
    logger_1.logger.debug(`Adding reviewers '${reviewers.join(', ')}' to #${prId}`);
    const { title } = await getPr(prId);
    const body = {
        title,
        reviewers: reviewers.map((username) => ({ username })),
    };
    await bitbucketHttp.putJson(`/2.0/repositories/${config.repository}/pullrequests/${prId}`, {
        body,
    });
}
exports.addReviewers = addReviewers;
function deleteLabel() {
    throw new Error('deleteLabel not implemented');
}
exports.deleteLabel = deleteLabel;
function ensureComment({ number, topic, content, }) {
    // https://developer.atlassian.com/bitbucket/api/2/reference/search?q=pullrequest+comment
    return comments.ensureComment({
        config,
        number,
        topic,
        content: sanitize_1.sanitize(content),
    });
}
exports.ensureComment = ensureComment;
function ensureCommentRemoval({ number: prNo, topic, content, }) {
    return comments.ensureCommentRemoval(config, prNo, topic, content);
}
exports.ensureCommentRemoval = ensureCommentRemoval;
// Creates PR and returns PR number
async function createPr({ sourceBranch, targetBranch, prTitle: title, prBody: description, platformOptions, }) {
    // labels is not supported in Bitbucket: https://bitbucket.org/site/master/issues/11976/ability-to-add-labels-to-pull-requests-bb
    const base = targetBranch;
    logger_1.logger.debug({ repository: config.repository, title, base }, 'Creating PR');
    let reviewers = [];
    if (platformOptions === null || platformOptions === void 0 ? void 0 : platformOptions.bbUseDefaultReviewers) {
        const reviewersResponse = (await bitbucketHttp.getJson(`/2.0/repositories/${config.repository}/default-reviewers`)).body;
        reviewers = reviewersResponse.values.map((reviewer) => ({
            uuid: reviewer.uuid,
        }));
    }
    const body = {
        title,
        description: sanitize_1.sanitize(description),
        source: {
            branch: {
                name: sourceBranch,
            },
        },
        destination: {
            branch: {
                name: base,
            },
        },
        close_source_branch: true,
        reviewers,
    };
    try {
        const prInfo = (await bitbucketHttp.postJson(`/2.0/repositories/${config.repository}/pullrequests`, {
            body,
        })).body;
        // TODO: fix types
        const pr = {
            number: prInfo.id,
            displayNumber: `Pull Request #${prInfo.id}`,
        };
        // istanbul ignore if
        if (config.prList) {
            config.prList.push(pr);
        }
        return pr;
    }
    catch (err) /* istanbul ignore next */ {
        logger_1.logger.warn({ err }, 'Error creating pull request');
        throw err;
    }
}
exports.createPr = createPr;
async function updatePr({ number: prNo, prTitle: title, prBody: description, state, }) {
    logger_1.logger.debug(`updatePr(${prNo}, ${title}, body)`);
    // Updating a PR in Bitbucket will clear the reviewers if reviewers is not present
    const pr = (await bitbucketHttp.getJson(`/2.0/repositories/${config.repository}/pullrequests/${prNo}`)).body;
    await bitbucketHttp.putJson(`/2.0/repositories/${config.repository}/pullrequests/${prNo}`, {
        body: {
            title,
            description: sanitize_1.sanitize(description),
            reviewers: pr.reviewers,
        },
    });
    if (state === types_1.PrState.Closed && pr) {
        await bitbucketHttp.postJson(`/2.0/repositories/${config.repository}/pullrequests/${prNo}/decline`);
    }
}
exports.updatePr = updatePr;
async function mergePr(prNo, branchName) {
    logger_1.logger.debug(`mergePr(${prNo}, ${branchName})`);
    try {
        await bitbucketHttp.postJson(`/2.0/repositories/${config.repository}/pullrequests/${prNo}/merge`, {
            body: {
                close_source_branch: true,
                merge_strategy: 'merge_commit',
                message: 'auto merged',
            },
        });
        logger_1.logger.debug('Automerging succeeded');
    }
    catch (err) /* istanbul ignore next */ {
        return false;
    }
    return true;
}
exports.mergePr = mergePr;
function getVulnerabilityAlerts() {
    return Promise.resolve([]);
}
exports.getVulnerabilityAlerts = getVulnerabilityAlerts;
//# sourceMappingURL=index.js.map