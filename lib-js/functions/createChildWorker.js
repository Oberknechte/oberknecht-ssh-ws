"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChildWorker = void 0;
const i_1 = require("../i");
const worker_threads_1 = require("worker_threads");
const path_1 = __importDefault(require("path"));
const closeChildWorker_1 = require("./closeChildWorker");
const oberknecht_utils_1 = require("oberknecht-utils");
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
            if (message === "end")
                return worker.terminate();
            i_1.i.oberknechtEmitters[sym].emit([
                "workers:any",
                "workers:message",
                `workers:${workerID}`,
                `workers:${workerID}:message`,
            ], {
                workerID: workerID,
                message: message,
            });
        });
        worker.on("exit", (code) => {
            // console.log("worker exited", code);
            i_1.i.oberknechtEmitters[sym].emit([
                "workers:any",
                "workers:exit",
                `workers:${workerID}`,
                `workers:${workerID}:exit`,
            ], {
                workerID: workerID,
                messageType: "exit",
                message: code,
            });
            (0, closeChildWorker_1.closeChildWorker)(sym, workerID);
        });
        worker.on("messageerror", (e) => {
            // console.error("worker msgerror", e);
            i_1.i.oberknechtEmitters[sym].emit([
                "workers:any",
                "workers:messageerror",
                `workers:${workerID}`,
                `workers:${workerID}:messageerror`,
            ], {
                workerID: workerID,
                messageType: "messageerror",
                message: (0, oberknecht_utils_1.returnErr)(e, false, true),
            });
        });
        worker.on("error", (e) => {
            // console.error("worker error", e);
            i_1.i.oberknechtEmitters[sym].emit([
                "workers:any",
                "workers:error",
                `workers:${workerID}`,
                `workers:${workerID}:error`,
            ], {
                workerID: workerID,
                messageType: "error",
                message: (0, oberknecht_utils_1.returnErr)(e, false, true),
            });
        });
        i_1.i.serverData[sym].childWorkersNum++;
        let r = {
            workerID: workerID,
        };
        return resolve(r);
    });
}
exports.createChildWorker = createChildWorker;
