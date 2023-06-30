"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeToWorker = void 0;
const i_1 = require("../i");
function subscribeToWorker(sym, wsID, workerID) {
    if (!i_1.i.workerSubscriptions[sym])
        i_1.i.workerSubscriptions[sym] = { workerIDs: {}, wsIDs: {} };
    if (!i_1.i.workerSubscriptions[sym].workerIDs[workerID])
        i_1.i.workerSubscriptions[sym].workerIDs[workerID] = { wsIDs: {} };
    if (!i_1.i.workerSubscriptions[sym].wsIDs[wsID])
        i_1.i.workerSubscriptions[sym].wsIDs[wsID] = { workerIDs: {} };
    i_1.i.workerSubscriptions[sym].workerIDs[workerID].wsIDs[wsID] = {};
    i_1.i.workerSubscriptions[sym].wsIDs[wsID].workerIDs[workerID] = {};
    return true;
}
exports.subscribeToWorker = subscribeToWorker;
