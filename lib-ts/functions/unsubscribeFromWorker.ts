import { i } from "../i";

export function unsubscribeFromWorker(
  sym: string,
  wsID: string,
  workerID: string
) {
  if (i.workerSubscriptions[sym]?.workerIDs?.[workerID]?.wsIDs?.[wsID])
    delete i.workerSubscriptions[sym].workerIDs[workerID].wsIDs[wsID];

  if (i.workerSubscriptions[sym]?.wsIDs?.[wsID]?.workerIDs?.[workerID])
    delete i.workerSubscriptions[sym].wsIDs[wsID].workerIDs[workerID];
}
