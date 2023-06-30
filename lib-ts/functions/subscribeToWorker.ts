import { i } from "../i";

export function subscribeToWorker(sym: string, wsID: string, workerID: string) {
  if (!i.workerSubscriptions[sym])
    i.workerSubscriptions[sym] = { workerIDs: {}, wsIDs: {} };

  if (!i.workerSubscriptions[sym].workerIDs[workerID])
    i.workerSubscriptions[sym].workerIDs[workerID] = { wsIDs: {} };

  if (!i.workerSubscriptions[sym].wsIDs[wsID])
    i.workerSubscriptions[sym].wsIDs[wsID] = { workerIDs: {} };

  i.workerSubscriptions[sym].workerIDs[workerID].wsIDs[wsID] = {};
  i.workerSubscriptions[sym].wsIDs[wsID].workerIDs[workerID] = {};

  return true;
}
