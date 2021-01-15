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
exports.generateBranchName = void 0;
const clean_git_ref_1 = require("clean-git-ref");
const slugify_1 = __importDefault(require("slugify"));
const logger_1 = require("../../../logger");
const template = __importStar(require("../../../util/template"));
/**
 * Clean git branch name
 *
 * Remove what clean-git-ref fails to:
 * - leading dot/leading dot after slash
 * - trailing dot
 * - whitespace
 */
function cleanBranchName(branchName) {
    return clean_git_ref_1.clean(branchName)
        .replace(/^\.|\.$/, '') // leading or trailing dot
        .replace(/\/\./g, '/') // leading dot after slash
        .replace(/\s/g, ''); // whitespace
}
/* eslint-disable no-param-reassign */
function generateBranchName(update) {
    // Check whether to use a group name
    if (update.groupName) {
        logger_1.logger.debug('Using group branchName template');
        logger_1.logger.debug(`Dependency ${update.depName} is part of group ${update.groupName}`);
        update.groupSlug = slugify_1.default(update.groupSlug || update.groupName, {
            lower: true,
        });
        if (update.updateType === 'major' && update.separateMajorMinor) {
            if (update.separateMultipleMajor) {
                const newMajor = String(update.newMajor);
                update.groupSlug = `major-${newMajor}-${update.groupSlug}`;
            }
            else {
                update.groupSlug = `major-${update.groupSlug}`;
            }
        }
        if (update.updateType === 'patch') {
            update.groupSlug = `patch-${update.groupSlug}`;
        }
        update.branchTopic = update.group.branchTopic || update.branchTopic;
        update.branchName = template.compile(update.group.branchName || update.branchName, update);
    }
    else {
        update.branchName = template.compile(update.branchName, update);
    }
    // Compile extra times in case of nested templates
    update.branchName = template.compile(update.branchName, update);
    update.branchName = cleanBranchName(template.compile(update.branchName, update));
}
exports.generateBranchName = generateBranchName;
//# sourceMappingURL=branch-name.js.map