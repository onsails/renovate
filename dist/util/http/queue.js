"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clear = exports.getQueue = void 0;
const url_1 = __importDefault(require("url"));
const p_queue_1 = __importDefault(require("p-queue"));
const host_rules_1 = require("./host-rules");
const hostQueues = new Map();
function getUrlHost(url) {
    try {
        return url_1.default.parse(url).host;
    }
    catch (e) {
        return null;
    }
}
function getQueue(url) {
    const host = getUrlHost(url);
    if (!host) {
        return null;
    }
    let queue = hostQueues.get(host);
    if (queue === undefined) {
        queue = null; // null represents "no queue", as opposed to undefined
        const concurrency = host_rules_1.getRequestLimit(url);
        if (concurrency) {
            queue = new p_queue_1.default({ concurrency });
        }
    }
    hostQueues.set(host, queue);
    return queue;
}
exports.getQueue = getQueue;
function clear() {
    hostQueues.clear();
}
exports.clear = clear;
//# sourceMappingURL=queue.js.map