"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrace = exports.scope = exports.allUsed = exports.reset = exports.setup = void 0;
const is_1 = __importDefault(require("@sindresorhus/is"));
const language_1 = require("graphql/language");
const nock_1 = __importDefault(require("nock"));
let requestLog = [];
let missingLog = [];
function simplifyGraphqlAST(tree) {
    if (!tree || is_1.default.emptyArray(tree) || is_1.default.emptyObject(tree)) {
        return null;
    }
    if (is_1.default.array(tree)) {
        return tree.map(simplifyGraphqlAST);
    }
    if (is_1.default.object(tree)) {
        return [
            'operation',
            'definitions',
            'selectionSet',
            'arguments',
            'value',
            'alias',
            'directives',
        ].reduce((acc, field) => {
            const value = tree[field];
            let simplifiedValue;
            if (field === 'definitions') {
                return (value || []).reduce((defsAcc, def) => {
                    const name = def === null || def === void 0 ? void 0 : def.operation;
                    const defValue = simplifyGraphqlAST(def);
                    if (name && defValue) {
                        return { ...defsAcc, [name]: defValue };
                    }
                    return defsAcc;
                }, {});
            }
            if (field === 'arguments') {
                const args = (value || []).reduce((argsAcc, arg) => {
                    var _a, _b;
                    const name = (_a = arg === null || arg === void 0 ? void 0 : arg.name) === null || _a === void 0 ? void 0 : _a.value;
                    const argValue = (_b = arg === null || arg === void 0 ? void 0 : arg.value) === null || _b === void 0 ? void 0 : _b.value;
                    if (name && argValue) {
                        return { ...argsAcc, [name]: argValue };
                    }
                    return argsAcc;
                }, {});
                if (!is_1.default.emptyObject(args)) {
                    acc.__args = args;
                }
            }
            else if (field === 'selectionSet') {
                ((value === null || value === void 0 ? void 0 : value.selections) || []).forEach((selection) => {
                    var _a;
                    const name = (_a = selection === null || selection === void 0 ? void 0 : selection.name) === null || _a === void 0 ? void 0 : _a.value;
                    const selValue = simplifyGraphqlAST(selection);
                    if (name && selValue) {
                        acc[name] = is_1.default.emptyObject(selValue) ? null : selValue;
                    }
                });
            }
            else {
                simplifiedValue = simplifyGraphqlAST(value);
                if (simplifiedValue) {
                    acc[`__${field}`] = simplifiedValue;
                }
            }
            return acc;
        }, {});
    }
    return tree;
}
function onMissing(req, opts) {
    if (!opts) {
        missingLog.push(`  ${req.method} ${req.href}`);
    }
    else {
        missingLog.push(`  ${opts.method} ${opts.href}`);
    }
}
function setup() {
    if (!nock_1.default.isActive()) {
        nock_1.default.activate();
    }
    nock_1.default.disableNetConnect();
    nock_1.default.emitter.on('no match', onMissing);
}
exports.setup = setup;
function reset() {
    nock_1.default.emitter.removeListener('no match', onMissing);
    nock_1.default.abortPendingRequests();
    if (nock_1.default.isActive()) {
        nock_1.default.restore();
    }
    nock_1.default.cleanAll();
    requestLog = [];
    missingLog = [];
    nock_1.default.enableNetConnect();
}
exports.reset = reset;
function allUsed() {
    return nock_1.default.isDone();
}
exports.allUsed = allUsed;
function scope(basePath, options) {
    return nock_1.default(basePath, options).on('request', (req) => {
        var _a, _b, _c;
        const { headers, method } = req;
        const url = (_a = req.options) === null || _a === void 0 ? void 0 : _a.href;
        const result = { headers, method, url };
        const body = (_c = (_b = req.requestBodyBuffers) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.toString();
        if (body) {
            try {
                const strQuery = JSON.parse(body).query;
                const rawQuery = language_1.parse(strQuery, {
                    noLocation: true,
                });
                result.graphql = simplifyGraphqlAST(rawQuery);
            }
            catch (ex) {
                result.body = body;
            }
        }
        requestLog.push(result);
    });
}
exports.scope = scope;
function getTrace() {
    const errorLines = [];
    if (missingLog.length) {
        errorLines.push('Missing mocks:');
        errorLines.push(...missingLog);
    }
    if (!nock_1.default.isDone()) {
        errorLines.push('Unused mocks:');
        errorLines.push(...nock_1.default.pendingMocks().map((x) => `  ${x}`));
    }
    if (errorLines.length) {
        throw new Error([
            'Completed requests:',
            ...requestLog.map(({ method, url }) => `  ${method} ${url}`),
            ...errorLines,
        ].join('\n'));
    }
    return requestLog;
}
exports.getTrace = getTrace;
//# sourceMappingURL=http-mock.js.map