import { i } from "../i";
import { unsubscribeFromWorker } from "./unsubscribeFromWorker";

export function unsubscribeFromAllWorkers(sym: string, wsID: string) {
  let workerIDs = Object.keys(i.workerSubscriptions[sym]?.wsIDs?.[wsID] ?? {});

  workerIDs.forEach((workerID) => {
    unsubscribeFromWorker(sym, wsID, workerID);
  });

  return true;
}
