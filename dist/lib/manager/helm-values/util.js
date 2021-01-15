"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesHelmValuesDockerHeuristic = void 0;
const object_1 = require("../../util/object");
/**
 * Type guard to determine whether a given partial Helm values.yaml object potentially
 * defines a Helm Docker dependency.
 *
 * There is no exact standard of how Docker dependencies are defined in Helm
 * values.yaml files (as of January 1st 2020), this function defines a
 * heuristic based on the most commonly used format in the stable Helm charts:
 *
 * image:
 *   repository: 'something'
 *   tag: v1.0.0
 */
function matchesHelmValuesDockerHeuristic(parentKey, data) {
    return (parentKey === 'image' &&
        data &&
        typeof data === 'object' &&
        object_1.hasKey('repository', data) &&
        object_1.hasKey('tag', data));
}
exports.matchesHelmValuesDockerHeuristic = matchesHelmValuesDockerHeuristic;
//# sourceMappingURL=util.js.map