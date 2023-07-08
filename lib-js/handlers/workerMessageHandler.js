"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerMessageHandler = void 0;
const i_1 = require("../i");
function workerMessageHandler(sym) {
    i_1.i.oberknechtEmitters[sym].on("workers:any", workerMessageCallback);
    function workerMessageCallback(data) {
        let { workerID } = data;
        let subscribedWSs = Object.keys(i_1.i.workerSubscriptions[sym]?.workerIDs[workerID]?.wsIDs ?? {});
        i_1.i.oberknechtEmitters[sym].emit(subscribedWSs.map((wsID) => `to-ws:${wsID}`), data);
    }
    return workerMessageCallback;
}
exports.workerMessageHandler = workerMessageHandler;
