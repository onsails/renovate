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
const mockdate_1 = __importDefault(require("mockdate"));
const schedule = __importStar(require("./schedule"));
describe('workers/branch/schedule', () => {
    describe('hasValidTimezone(schedule)', () => {
        it('returns false for invalid timezone', () => {
            expect(schedule.hasValidTimezone('Asia')[0]).toBe(false);
        });
        it('returns true for valid timezone', () => {
            expect(schedule.hasValidTimezone('Asia/Singapore')[0]).toBe(true);
        });
    });
    describe('hasValidSchedule(schedule)', () => {
        beforeEach(() => {
            jest.resetAllMocks();
        });
        it('returns true for null', () => {
            expect(schedule.hasValidSchedule(null)[0]).toBe(true);
        });
        it('returns true for at any time', () => {
            expect(schedule.hasValidSchedule('at any time')[0]).toBe(true);
        });
        it('returns false for invalid schedule', () => {
            expect(schedule.hasValidSchedule(['foo'])[0]).toBe(false);
        });
        it('returns false if any schedule fails to parse', () => {
            expect(schedule.hasValidSchedule(['after 5:00pm', 'foo'])[0]).toBe(false);
        });
        it('returns false if using minutes', () => {
            expect(schedule.hasValidSchedule(['every 15 mins every weekday'])[0]).toBe(false);
        });
        it('returns false if schedules have no days or time range', () => {
            expect(schedule.hasValidSchedule(['at 5:00pm'])[0]).toBe(false);
        });
        it('returns false if any schedule has no days or time range', () => {
            expect(schedule.hasValidSchedule(['at 5:00pm', 'on saturday'])[0]).toBe(false);
        });
        it('returns false for every xday', () => {
            expect(schedule.hasValidSchedule(['every friday'])[0]).toBe(false);
        });
        it('returns true if schedule has days of week', () => {
            expect(schedule.hasValidSchedule(['on friday and saturday'])[0]).toBe(true);
        });
        it('returns true for multi day schedules', () => {
            expect(schedule.hasValidSchedule(['after 5:00pm on wednesday and thursday'])[0]).toBe(true);
        });
        it('returns true if schedule has a start time', () => {
            expect(schedule.hasValidSchedule(['after 8:00pm'])[0]).toBe(true);
        });
        it('returns true for first day of the month', () => {
            expect(schedule.hasValidSchedule(['on the first day of the month'])[0]).toBe(true);
        });
        it('returns true for schedules longer than 1 month', () => {
            expect(schedule.hasValidSchedule(['every 3 months'])[0]).toBe(true);
            expect(schedule.hasValidSchedule(['every 6 months'])[0]).toBe(true);
            expect(schedule.hasValidSchedule(['every 12 months'])[0]).toBe(true);
        });
        it('returns true if schedule has an end time', () => {
            expect(schedule.hasValidSchedule(['before 6:00am'])[0]).toBe(true);
        });
        it('returns true if schedule has a start and end time', () => {
            expect(schedule.hasValidSchedule(['after 11:00pm and before 6:00am'])[0]).toBe(true);
        });
        it('returns true if schedule has days and a start and end time', () => {
            expect(schedule.hasValidSchedule([
                'after 11:00pm and before 6:00am every weekday',
            ])[0]).toBe(true);
        });
        it('massages schedules', () => {
            expect(schedule.hasValidSchedule([
                'before 3am on the first day of the month',
            ])[0]).toBe(true);
            expect(schedule.hasValidSchedule(['every month'])[0]).toBe(true);
        });
        it('supports hours shorthand', () => {
            const [res] = schedule.hasValidSchedule([
                'after 11pm and before 6am every weekend',
                'after 11pm',
                'after 10pm and before 5:00am',
                'after 10pm and before 5am every weekday',
                'after 11pm and before 6am',
                'after 9pm on friday and saturday',
                'before 5am every weekday',
                'every weekend',
            ]);
            expect(res).toBe(true);
        });
    });
    describe('isScheduledNow(config)', () => {
        let config;
        beforeEach(() => {
            mockdate_1.default.set('2017-06-30T10:50:00.000'); // Locally 2017-06-30 10:50am
            jest.resetAllMocks();
            config = {};
        });
        it('returns true if no schedule', () => {
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('returns true if at any time', () => {
            config.schedule = 'at any time';
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('returns true if at any time array', () => {
            config.schedule = ['at any time'];
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('returns true if invalid schedule', () => {
            config.schedule = ['every 15 minutes'];
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('returns true if invalid timezone', () => {
            config.schedule = ['after 4:00pm'];
            config.timezone = 'Asia';
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('supports before hours true', () => {
            config.schedule = ['before 4:00pm'];
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('supports before hours false', () => {
            config.schedule = ['before 4:00am'];
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(false);
        });
        it('massages string', () => {
            config.schedule = 'before 4:00am';
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(false);
        });
        it('supports outside hours', () => {
            config.schedule = ['after 4:00pm'];
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(false);
        });
        it('supports timezone', () => {
            config.schedule = ['after 4:00pm'];
            config.timezone = 'Asia/Singapore';
            mockdate_1.default.set('2017-06-30T10:50:00.000Z'); // Globally 2017-06-30 10:50am
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('supports multiple schedules', () => {
            config.schedule = ['after 4:00pm', 'before 11:00am'];
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('supports day match', () => {
            config.schedule = ['on friday and saturday'];
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('supports day mismatch', () => {
            config.schedule = ['on monday and tuesday'];
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(false);
        });
        it('supports every weekday', () => {
            config.schedule = ['every weekday'];
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('supports every weekend', () => {
            config.schedule = ['every weekend'];
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(false);
        });
        it('supports every weekday with time', () => {
            config.schedule = ['before 11:00am every weekday'];
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('supports o every weekday', () => {
            config.schedule = ['before 11:00am on inevery weekday'];
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('rejects first day of the month', () => {
            config.schedule = ['before 11am on the first day of the month'];
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(false);
        });
        it('approves first day of the month', () => {
            config.schedule = ['before 11am on the first day of the month'];
            mockdate_1.default.set('2017-10-01T05:26:06.000'); // Locally Sunday, 1 October 2017 05:26:06
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('approves valid weeks of year', () => {
            config.schedule = ['every 2 weeks of the year before 08:00 on Monday'];
            mockdate_1.default.set('2017-01-02T06:00:00.000'); // Locally Monday, 2 January 2017 6am (first Monday of the year)
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('rejects on weeks of year', () => {
            config.schedule = ['every 2 weeks of the year before 08:00 on Monday'];
            mockdate_1.default.set('2017-01-09T06:00:00.000'); // Locally Monday, 2 January 2017 6am (second Monday of the year)
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(false);
        });
        it('approves on months of year', () => {
            config.schedule = ['of January'];
            mockdate_1.default.set('2017-01-02T06:00:00.000'); // Locally Monday, 2 January 2017 6am
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('rejects on months of year', () => {
            config.schedule = ['of January'];
            mockdate_1.default.set('2017-02-02T06:00:00.000'); // Locally Thursday, 2 February 2017 6am
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(false);
        });
        it('approves schedule longer than 1 month', () => {
            config.schedule = ['every 3 months'];
            mockdate_1.default.set('2017-07-01T06:00:00.000'); // Locally Saturday, 1 July 2017 6am
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('rejects schedule longer than 1 month', () => {
            config.schedule = ['every 6 months'];
            mockdate_1.default.set('2017-02-01T06:00:00.000'); // Locally Thursday, 2 February 2017 6am
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(false);
        });
        it('approves schedule longer than 1 month with day of month', () => {
            config.schedule = ['every 3 months on the first day of the month'];
            mockdate_1.default.set('2017-07-01T06:00:00.000'); // Locally Saturday, 1 July 2017 6am
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(true);
        });
        it('rejects schedule longer than 1 month with day of month', () => {
            config.schedule = ['every 3 months on the first day of the month'];
            mockdate_1.default.set('2017-02-01T06:00:00.000'); // Locally Thursday, 2 February 2017 6am
            const res = schedule.isScheduledNow(config);
            expect(res).toBe(false);
        });
    });
});
//# sourceMappingURL=schedule.spec.js.map