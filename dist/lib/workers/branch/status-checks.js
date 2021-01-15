"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStability = void 0;
const logger_1 = require("../../logger");
const platform_1 = require("../../platform");
const types_1 = require("../../types");
async function setStatusCheck(branchName, context, description, state, url) {
    const existingState = await platform_1.platform.getBranchStatusCheck(branchName, context);
    if (existingState === state) {
        logger_1.logger.debug(`Status check ${context} is already up-to-date`);
    }
    else {
        logger_1.logger.debug(`Updating ${context} status check state to ${state}`);
        await platform_1.platform.setBranchStatus({
            branchName,
            context,
            description,
            state,
            url,
        });
    }
}
async function setStability(config) {
    if (!config.stabilityStatus) {
        return;
    }
    const context = `renovate/stability-days`;
    const description = config.stabilityStatus === types_1.BranchStatus.green
        ? 'Updates have met stability days requirement'
        : 'Updates have not met stability days requirement';
    await setStatusCheck(config.branchName, context, description, config.stabilityStatus, config.productLinks.documentation);
}
exports.setStability = setStability;
//# sourceMappingURL=status-checks.js.map