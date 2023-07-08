import { i } from "../i";

export function workerMessageHandler(sym: string) {
  i.oberknechtEmitters[sym].on("workers:any", workerMessageCallback);

  function workerMessageCallback(data) {
    let { workerID } = data;

    let subscribedWSs = Object.keys(
      i.workerSubscriptions[sym]?.workerIDs[workerID]?.wsIDs ?? {}
    );

    i.oberknechtEmitters[sym].emit(
      subscribedWSs.map((wsID) => `to-ws:${wsID}`),
      data
    );
  }

  return workerMessageCallback;
}
