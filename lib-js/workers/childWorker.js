"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const child_process_1 = require("child_process");
const oberknecht_utils_1 = require("oberknecht-utils");
let child = (0, child_process_1.spawn)(worker_threads_1.workerData.command, (0, oberknecht_utils_1.convertToArray)(worker_threads_1.workerData.args));
child.stdout.setEncoding("utf-8");
child.stdout.on("data", (data) => {
    worker_threads_1.parentPort.postMessage(JSON.stringify({
        message: data,
    }));
});
child.stdout.on("end", () => {
    child.kill();
    worker_threads_1.parentPort.emit("close");
});
worker_threads_1.parentPort.on("message", (messageRaw) => {
    let message = JSON.parse(messageRaw);
    switch (message.type) {
        case "send": {
            let sendMessage = message.parameters?.message;
            if (!sendMessage)
                return;
            child.send(sendMessage);
        }
    }
});
child.on("error", (e) => {
    console.error("child worker error", e);
    worker_threads_1.parentPort.emit("messageerror", e);
});
worker_threads_1.parentPort.on("close", () => {
    child.kill();
});
