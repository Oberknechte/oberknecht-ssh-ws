"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeChildWorker = void 0;
const i_1 = require("../i");
const unsubscribeFromWorker_1 = require("./unsubscribeFromWorker");
function closeChildWorker(sym, workerID) {
    i_1.i.childWorkers[sym][workerID]?.terminate();
    const workerWSs = Object.keys(i_1.i.workerSubscriptions[sym].workerIDs?.[workerID]?.wsIDs ?? {});
    workerWSs.forEach((wsID) => (0, unsubscribeFromWorker_1.unsubscribeFromWorker)(sym, wsID, workerID));
    if (i_1.i.childWorkers[sym][workerID])
        delete i_1.i.childWorkers[sym][workerID];
    if (i_1.i.workerSubscriptions[sym].workerIDs[workerID])
        delete i_1.i.workerSubscriptions[sym].workerIDs[workerID];
    return true;
}
exports.closeChildWorker = closeChildWorker;
