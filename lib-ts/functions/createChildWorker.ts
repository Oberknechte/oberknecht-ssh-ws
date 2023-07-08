import { i } from "../i";
import { Worker } from "worker_threads";
import { createChildWorkerReturnType } from "../types/createChildWorker";
import path from "path";
import { closeChildWorker } from "./closeChildWorker";
import { returnErr } from "oberknecht-utils";

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
      if (message === "end") return worker.terminate();

      i.oberknechtEmitters[sym].emit(
        [
          "workers:any",
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
      // console.log("worker exited", code);
      i.oberknechtEmitters[sym].emit(
        [
          "workers:any",
          "workers:exit",
          `workers:${workerID}`,
          `workers:${workerID}:exit`,
        ],
        {
          workerID: workerID,
          messageType: "exit",
          message: code,
        }
      );

      closeChildWorker(sym, workerID);
    });

    worker.on("messageerror", (e) => {
      // console.error("worker msgerror", e);
      i.oberknechtEmitters[sym].emit(
        [
          "workers:any",
          "workers:messageerror",
          `workers:${workerID}`,
          `workers:${workerID}:messageerror`,
        ],
        {
          workerID: workerID,
          messageType: "messageerror",
          message: returnErr(e, false, true),
        }
      );
    });

    worker.on("error", (e) => {
      // console.error("worker error", e);
      i.oberknechtEmitters[sym].emit(
        [
          "workers:any",
          "workers:error",
          `workers:${workerID}`,
          `workers:${workerID}:error`,
        ],
        {
          workerID: workerID,
          messageType: "error",
          message: returnErr(e, false, true),
        }
      );
    });

    i.serverData[sym].childWorkersNum++;

    let r: createChildWorkerReturnType = {
      workerID: workerID,
    };

    return resolve(r);
  });
}
