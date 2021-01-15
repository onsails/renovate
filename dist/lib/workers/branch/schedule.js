"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isScheduledNow = exports.hasValidSchedule = exports.hasValidTimezone = void 0;
const later_1 = __importDefault(require("@breejs/later"));
const is_1 = __importDefault(require("@sindresorhus/is"));
const luxon_1 = require("luxon");
const logger_1 = require("../../logger");
const scheduleMappings = {
    'every month': 'before 3am on the first day of the month',
    monthly: 'before 3am on the first day of the month',
};
function fixShortHours(input) {
    return input.replace(/( \d?\d)((a|p)m)/g, '$1:00$2');
}
function hasValidTimezone(timezone) {
    if (!luxon_1.DateTime.local().setZone(timezone).isValid) {
        return [false, `Invalid schedule: Unsupported timezone ${timezone}`];
    }
    return [true];
}
exports.hasValidTimezone = hasValidTimezone;
function hasValidSchedule(schedule) {
    let message;
    if (!schedule ||
        schedule === 'at any time' ||
        schedule[0] === 'at any time') {
        return [true];
    }
    // check if any of the schedules fail to parse
    const hasFailedSchedules = schedule.some((scheduleText) => {
        const massagedText = fixShortHours(scheduleMappings[scheduleText] || scheduleText);
        const parsedSchedule = later_1.default.parse.text(massagedText);
        if (parsedSchedule.error !== -1) {
            message = `Invalid schedule: Failed to parse "${scheduleText}"`;
            // It failed to parse
            return true;
        }
        if (parsedSchedule.schedules.some((s) => s.m)) {
            message = `Invalid schedule: "${scheduleText}" should not specify minutes`;
            return true;
        }
        if (!parsedSchedule.schedules.some((s) => s.M || s.d !== undefined || s.D || s.t_a !== undefined || s.t_b)) {
            message = `Invalid schedule: "${scheduleText}" has no months, days of week or time of day`;
            return true;
        }
        // It must be OK
        return false;
    });
    if (hasFailedSchedules) {
        // If any fail then we invalidate the whole thing
        return [false, message];
    }
    return [true, ''];
}
exports.hasValidSchedule = hasValidSchedule;
function isScheduledNow(config) {
    let configSchedule = config.schedule;
    logger_1.logger.debug(`Checking schedule(${String(configSchedule)}, ${config.timezone})`);
    if (!configSchedule ||
        configSchedule.length === 0 ||
        configSchedule[0] === '' ||
        configSchedule === 'at any time' ||
        configSchedule[0] === 'at any time') {
        logger_1.logger.debug('No schedule defined');
        return true;
    }
    if (!is_1.default.array(configSchedule)) {
        logger_1.logger.warn(`config schedule is not an array: ${JSON.stringify(configSchedule)}`);
        configSchedule = [configSchedule];
    }
    const [validSchedule, errorMessage] = hasValidSchedule(configSchedule);
    if (!validSchedule) {
        logger_1.logger.warn(errorMessage);
        return true;
    }
    let now = luxon_1.DateTime.local();
    logger_1.logger.trace(`now=${now.toISO()}`);
    // Adjust the time if repo is in a different timezone to renovate
    if (config.timezone) {
        logger_1.logger.debug({ timezone: config.timezone }, 'Found timezone');
        const [validTimezone, error] = hasValidTimezone(config.timezone);
        if (!validTimezone) {
            logger_1.logger.warn(error);
            return true;
        }
        logger_1.logger.debug('Adjusting now for timezone');
        now = now.setZone(config.timezone);
        logger_1.logger.trace(`now=${now.toISO()}`);
    }
    const currentDay = now.weekday;
    logger_1.logger.trace(`currentDay=${currentDay}`);
    // Get the number of seconds since midnight
    const currentSeconds = now
        .startOf('second')
        .diff(now.startOf('day'), 'seconds').seconds;
    logger_1.logger.trace(`currentSeconds=${currentSeconds}`);
    // Support a single string but massage to array for processing
    logger_1.logger.debug(`Checking ${configSchedule.length} schedule(s)`);
    // We run if any schedule matches
    const isWithinSchedule = configSchedule.some((scheduleText) => {
        const massagedText = scheduleMappings[scheduleText] || scheduleText;
        const parsedSchedule = later_1.default.parse.text(fixShortHours(massagedText));
        logger_1.logger.debug({ parsedSchedule }, `Checking schedule "${scheduleText}"`);
        // Later library returns array of schedules
        return parsedSchedule.schedules.some((schedule) => {
            // Check if months are defined
            if (schedule.M) {
                const currentMonth = now.month;
                if (!schedule.M.includes(currentMonth)) {
                    logger_1.logger.debug(`Does not match schedule because ${currentMonth} is not in ${String(schedule.M)}`);
                    return false;
                }
            }
            // Check if days are defined
            if (schedule.d) {
                // We need to map because 'luxon' uses monday as first day
                // and later uses sundays as first day of week
                // http://bunkat.github.io/later/time-periods.html#day-of-week
                const dowMap = [6, 7, 1, 2, 3, 4, 5, 6];
                const scheduledDays = schedule.d.map((day) => dowMap[day]);
                logger_1.logger.trace({ scheduledDays }, `scheduledDays`);
                if (!scheduledDays.includes(currentDay)) {
                    logger_1.logger.debug(`Does not match schedule because ${currentDay} is not in ${String(scheduledDays)}`);
                    return false;
                }
            }
            if (schedule.D) {
                logger_1.logger.debug({ schedule_D: schedule.D }, `schedule.D`);
                const currentDayOfMonth = now.day;
                if (!schedule.D.includes(currentDayOfMonth)) {
                    return false;
                }
            }
            // Check for start time
            if (schedule.t_a) {
                const startSeconds = schedule.t_a[0];
                if (currentSeconds < startSeconds) {
                    logger_1.logger.debug(`Does not match schedule because ${currentSeconds} is earlier than ${startSeconds}`);
                    return false;
                }
            }
            // Check for end time
            if (schedule.t_b) {
                const endSeconds = schedule.t_b[0];
                if (currentSeconds > endSeconds) {
                    logger_1.logger.debug(`Does not match schedule because ${currentSeconds} is later than ${endSeconds}`);
                    return false;
                }
            }
            // Check for week of year
            if (schedule.wy && !schedule.wy.includes(now.weekNumber)) {
                return false;
            }
            logger_1.logger.debug(`Matches schedule ${scheduleText}`);
            return true;
        });
    });
    if (!isWithinSchedule) {
        logger_1.logger.debug('Package not scheduled');
        return false;
    }
    return true;
}
exports.isScheduledNow = isScheduledNow;
//# sourceMappingURL=schedule.js.map