"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesPrecommitDependencyHeuristic = exports.matchesPrecommitConfigHeuristic = void 0;
const object_1 = require("../../util/object");
/**
 * Type guard to determine whether the file matches pre-commit configuration format
 * Example original yaml:
 *
 *   repos
 *   - repo: https://github.com/user/repo
 *     rev: v1.0.0
 */
function matchesPrecommitConfigHeuristic(data) {
    return data && typeof data === 'object' && object_1.hasKey('repos', data);
}
exports.matchesPrecommitConfigHeuristic = matchesPrecommitConfigHeuristic;
/**
 * Type guard to determine whether a given repo definition defines a pre-commit Git hook dependency.
 * Example original yaml portion
 *
 *   - repo: https://github.com/user/repo
 *     rev: v1.0.0
 */
function matchesPrecommitDependencyHeuristic(data) {
    return (data &&
        typeof data === 'object' &&
        object_1.hasKey('repo', data) &&
        object_1.hasKey('rev', data));
}
exports.matchesPrecommitDependencyHeuristic = matchesPrecommitDependencyHeuristic;
//# sourceMappingURL=parsing.js.map