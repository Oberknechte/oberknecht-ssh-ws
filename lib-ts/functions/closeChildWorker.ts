import { i } from "../i";
import { unsubscribeFromWorker } from "./unsubscribeFromWorker";

export function closeChildWorker(sym: string, workerID: string) {
  i.childWorkers[sym][workerID]?.terminate();

  const workerWSs = Object.keys(
    i.workerSubscriptions[sym].workerIDs?.[workerID]?.wsIDs ?? {}
  );
  workerWSs.forEach((wsID) => unsubscribeFromWorker(sym, wsID, workerID));

  if (i.childWorkers[sym][workerID]) delete i.childWorkers[sym][workerID];
  if (i.workerSubscriptions[sym].workerIDs[workerID])
    delete i.workerSubscriptions[sym].workerIDs[workerID];

  return true;
}
