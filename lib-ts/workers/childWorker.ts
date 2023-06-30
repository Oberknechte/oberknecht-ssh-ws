import { parentPort, workerData } from "worker_threads";
import { spawn } from "child_process";
import { convertToArray } from "oberknecht-utils";

let child = spawn(workerData.command, convertToArray(workerData.args));
child.stdout.setEncoding("utf-8");
child.stdout.on("data", (data) => {
  parentPort.postMessage(
    JSON.stringify({
      message: data,
    })
  );
});
child.stdout.on("end", () => {
  child.kill();
  parentPort.emit("close");
});

parentPort.on("message", (messageRaw) => {
  let message = JSON.parse(messageRaw);

  switch (message.type) {
    case "send": {
      let sendMessage = message.parameters?.message;
      if (!sendMessage) return;

      child.send(sendMessage);
    }
  }
});

child.on("error", (e) => {
  console.error("child worker error", e);
  parentPort.emit("messageerror", e);
});

parentPort.on("close", () => {
  child.kill();
});
