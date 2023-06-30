"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChildWorker = void 0;
const i_1 = require("../i");
const worker_threads_1 = require("worker_threads");
const path_1 = __importDefault(require("path"));
function createChildWorker(sym, command, args) {
    return new Promise((resolve, reject) => {
        if (!i_1.i.childWorkers[sym])
            i_1.i.childWorkers[sym] = {};
        if (!i_1.i.serverData[sym].childWorkersNum)
            i_1.i.serverData[sym].childWorkersNum = 0;
        const workerID = i_1.i.serverData[sym].childWorkersNum.toString();
        let worker = new worker_threads_1.Worker(path_1.default.resolve(__dirname, "../workers/childWorker"), {
            workerData: {
                command: command,
                args: args,
            },
        });
        i_1.i.childWorkers[sym][workerID] = worker;
        worker.on("message", (message) => {
            i_1.i.oberknechtEmitters[sym].emit([
                "workers:message",
                `workers:${workerID}`,
                `workers:${workerID}:message`,
            ], {
                workerID: workerID,
                message: message,
            });
        });
        worker.on("exit", (code) => {
            console.log("worker exited", code);
        });
        worker.on("messageerror", (e) => {
            console.error("worker msgerror", e);
        });
        worker.on("error", (e) => {
            console.error("worker error", e);
        });
        i_1.i.serverData[sym].childWorkersNum++;
        let r = {
            workerID: workerID,
        };
        return resolve(r);
    });
}
exports.createChildWorker = createChildWorker;
