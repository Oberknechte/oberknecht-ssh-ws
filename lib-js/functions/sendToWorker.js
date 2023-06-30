"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToWorker = void 0;
const i_1 = require("../i");
function sendToWorker(sym, workerID, message) {
    i_1.i.childWorkers[sym][workerID]?.postMessage(JSON.stringify({
        type: "send",
        parameters: {
            message: message,
        },
    }));
    return true;
}
exports.sendToWorker = sendToWorker;
