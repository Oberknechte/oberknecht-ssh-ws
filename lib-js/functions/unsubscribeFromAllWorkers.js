"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribeFromAllWorkers = void 0;
const i_1 = require("../i");
const unsubscribeFromWorker_1 = require("./unsubscribeFromWorker");
function unsubscribeFromAllWorkers(sym, wsID) {
    let workerIDs = Object.keys(i_1.i.workerSubscriptions[sym]?.wsIDs?.[wsID] ?? {});
    workerIDs.forEach((workerID) => {
        (0, unsubscribeFromWorker_1.unsubscribeFromWorker)(sym, wsID, workerID);
    });
    return true;
}
exports.unsubscribeFromAllWorkers = unsubscribeFromAllWorkers;
