"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnboardingConfig = void 0;
const local_1 = require("../../../../config/presets/local");
const util_1 = require("../../../../config/presets/util");
const logger_1 = require("../../../../logger");
const clone_1 = require("../../../../util/clone");
async function getOnboardingConfig(config) {
    let onboardingConfig = clone_1.clone(config.onboardingConfig);
    let orgPreset;
    logger_1.logger.debug('Checking if this org/owner has a default Renovate preset which can be used.');
    const orgName = config.repository.split('/')[0];
    // Check for org/renovate-config
    try {
        const packageName = `${orgName}/renovate-config`;
        await local_1.getPreset({ packageName, baseConfig: config });
        orgPreset = `local>${packageName}`;
    }
    catch (err) {
        if (err.message !== util_1.PRESET_DEP_NOT_FOUND &&
            !err.message.startsWith('Unsupported platform')) {
            logger_1.logger.warn({ err }, 'Unknown error fetching default owner preset');
        }
    }
    if (!orgPreset) {
        // Check for org/.{{platform}}
        try {
            const packageName = `${orgName}/.${config.platform}`;
            const presetName = 'renovate-config';
            await local_1.getPreset({
                packageName,
                presetName,
                baseConfig: config,
            });
            orgPreset = `local>${packageName}:${presetName}`;
        }
        catch (err) {
            if (err.message !== util_1.PRESET_DEP_NOT_FOUND &&
                !err.message.startsWith('Unsupported platform')) {
                logger_1.logger.warn({ err }, 'Unknown error fetching default owner preset');
            }
        }
    }
    if (orgPreset) {
        onboardingConfig = {
            $schema: 'https://docs.renovatebot.com/renovate-schema.json',
            extends: [orgPreset],
        };
    }
    else {
        // Organization preset did not exist
        logger_1.logger.debug('No default org/owner preset found, so the default onboarding config will be used instead. Note: do not be concerned with any 404 messages that preceded this.');
    }
    logger_1.logger.debug({ config: onboardingConfig }, 'onboarding config');
    return JSON.stringify(onboardingConfig, null, 2) + '\n';
}
exports.getOnboardingConfig = getOnboardingConfig;
//# sourceMappingURL=config.js.map