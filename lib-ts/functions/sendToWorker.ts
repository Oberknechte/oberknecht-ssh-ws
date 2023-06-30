import { i } from "../i";

export function sendToWorker(sym: string, workerID: string, message: string) {
  i.childWorkers[sym][workerID]?.postMessage(
    JSON.stringify({
      type: "send",
      parameters: {
        message: message,
      },
    })
  );

  return true;
}
