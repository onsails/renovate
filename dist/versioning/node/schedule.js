"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPolicies = exports.nodeSchedule = void 0;
const data_files_generated_1 = __importDefault(require("../../data-files.generated"));
exports.nodeSchedule = JSON.parse(data_files_generated_1.default.get('node-js-schedule.json'));
function getPolicies() {
    const policies = {
        all: [],
        lts: [],
        active: [],
        lts_active: [],
        lts_latest: [],
        current: [],
    };
    const now = new Date();
    for (const [vRelease, data] of Object.entries(exports.nodeSchedule)) {
        const isAlive = new Date(data.start) < now && new Date(data.end) > now;
        if (isAlive) {
            const release = parseInt(vRelease.replace(/^v/, ''), 10);
            policies.all.push(release);
            const isMaintenance = data.maintenance && new Date(data.maintenance) < now;
            if (!isMaintenance) {
                policies.active.push(release);
            }
            const isLts = data.lts && new Date(data.lts) < now;
            if (isLts) {
                policies.lts.push(release);
                if (!isMaintenance) {
                    policies.lts_active.push(release);
                }
            }
        }
    }
    policies.current.push(policies.active[policies.active.length - 1]);
    policies.lts_latest.push(policies.lts[policies.lts.length - 1]);
    return policies;
}
exports.getPolicies = getPolicies;
//# sourceMappingURL=schedule.js.map