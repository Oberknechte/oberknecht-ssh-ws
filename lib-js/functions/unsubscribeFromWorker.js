"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribeFromWorker = void 0;
const i_1 = require("../i");
function unsubscribeFromWorker(sym, wsID, workerID) {
    if (i_1.i.workerSubscriptions[sym]?.workerIDs?.[workerID]?.wsIDs?.[wsID])
        delete i_1.i.workerSubscriptions[sym].workerIDs[workerID].wsIDs[wsID];
    if (i_1.i.workerSubscriptions[sym]?.wsIDs?.[wsID]?.workerIDs?.[workerID])
        delete i_1.i.workerSubscriptions[sym].wsIDs[wsID].workerIDs[workerID];
}
exports.unsubscribeFromWorker = unsubscribeFromWorker;
