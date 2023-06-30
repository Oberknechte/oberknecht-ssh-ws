import { i } from "../i";
import { Worker } from "worker_threads";
import { createChildWorkerReturnType } from "../types/createChildWorker";
import path from "path";

export function createChildWorker(
  sym: string,
  command: string,
  args?: string[]
) {
  return new Promise<createChildWorkerReturnType>((resolve, reject) => {
    if (!i.childWorkers[sym]) i.childWorkers[sym] = {};
    if (!i.serverData[sym].childWorkersNum)
      i.serverData[sym].childWorkersNum = 0;

    const workerID = i.serverData[sym].childWorkersNum.toString();

    let worker = new Worker(path.resolve(__dirname, "../workers/childWorker"), {
      workerData: {
        command: command,
        args: args,
      },
    });

    i.childWorkers[sym][workerID] = worker;

    worker.on("message", (message) => {
      i.oberknechtEmitters[sym].emit(
        [
          "workers:message",
          `workers:${workerID}`,
          `workers:${workerID}:message`,
        ],
        {
          workerID: workerID,
          message: message,
        }
      );
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

    i.serverData[sym].childWorkersNum++;

    let r: createChildWorkerReturnType = {
      workerID: workerID,
    };

    return resolve(r);
  });
}
