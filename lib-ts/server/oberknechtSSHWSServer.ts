import { WebSocketServer } from "ws";
import { oberknechtSSHWSServerOptionsType } from "../types/oberknechtSSHWSServer.options";
import { defaults } from "../types/defaults";
import { i } from "../i";
import { oberknechtEmitter } from "oberknecht-emitters";
import { log, regex, returnErr } from "oberknecht-utils";
import { createChildWorker } from "../functions/createChildWorker";
import { subscribeToWorker } from "../functions/subscribeToWorker";
import { workerMessageHandler } from "../handlers/workerMessageHandler";
import { unsubscribeFromAllWorkers } from "../functions/unsubscribeFromAllWorkers";
import { sendToWorker } from "../functions/sendToWorker";
import { closeChildWorker } from "../functions/closeChildWorker";
let serverSymNum = 0;
let wsSymNum = 0;

export class oberknechtSSHWSServer {
  #sym = `oberknechtSSHWSServer-${serverSymNum++}`;
  get symbol() {
    return this.#sym;
  }

  get _options() {
    return i.serverData[this.symbol]._options;
  }

  wsServer: WebSocketServer;
  get oberknechtEmitter(): oberknechtEmitter {
    return i.oberknechtEmitters[this.symbol];
  }

  ha_ha_ha_ha_stayinAlive_stayinAlive = setInterval(() => {}, 696969);

  constructor(options: oberknechtSSHWSServerOptionsType) {
    let _options: oberknechtSSHWSServerOptionsType = options ?? {};
    i.serverData[this.symbol] = {};
    _options.debug = _options.debug ?? 2;
    i.serverData[this.symbol]._options = _options;

    i.oberknechtEmitters[this.symbol] = new oberknechtEmitter();
    workerMessageHandler(this.symbol);
  }

  connectServer = () => {
    if (this.wsServer) return;
    let this_ = this;

    this.wsServer =
      this._options.wsServer ??
      new WebSocketServer(
        this._options.wsServerOptions ?? defaults.defaultWSServerOptions
      );

    this.wsServer.on("listening", () => {
      if (this_._options.debug > 2)
        log(
          1,
          // @ts-ignore
          `WSServer Listening on ${this.wsServer.address().address} (${
            // @ts-ignore
            this.wsServer.address().family
            // @ts-ignore
          }) port ${this.wsServer.address().port}`
        );

      this.oberknechtEmitter.emit(
        ["wsserver", "wsserver:listening"],
        "Listening"
      );
    });

    this.wsServer.on("error", (e) => {
      process.emitWarning(e);
      this.oberknechtEmitter.emitError(["wsserver", "wsserver:error"], e);
    });

    this.wsServer.on("connection", (ws) => {
      const wsSym = `wsserver-ws-${wsSymNum++}`;
      let wsData: Record<string, any> = {
        heartbeat: {
          lastPing: -1,
          lastPong: -1,
          pingsPending: 0,
        },
        loggedIn: false,
        messageSymNum: 0,
      };

      function closeWS() {
        ws.close();
        if (wsData.heartbeat.heartbeatInterval)
          clearInterval(wsData.heartbeat.heartbeatInterval);

        removeEmitterCallback();
        removeWorkerCallbacks();
        // closeChildWorker()
      }

      function heartbeatPing() {
        if (
          wsData.heartbeat.pingsPending >=
          (this_._options.maxPingsPending ?? defaults.maxPingsPending)
        )
          return closeWS();
        ws.ping();
        wsData.heartbeat.lastPing = Date.now();
        wsData.heartbeat.pingsPending++;
      }

      function heartbeatPong() {
        wsData.heartbeat.lastPong = Date.now();
        wsData.heartbeat.pingsPending = 0;
      }

      function _sendWC(stuff, status?: number) {
        let stuff_: Record<string, any> = {};

        if (typeof stuff !== "object") stuff_.data = stuff;
        else stuff_ = { ...stuff };
        stuff_.status = status ?? 200;
        if (stuff instanceof Error || stuff.error)
          stuff_.error = returnErr(stuff?.error ?? stuff);

        ws.send(JSON.stringify(stuff_));
      }

      const emitterEventName = `to-ws:${wsSym}`;
      this.oberknechtEmitter.on(emitterEventName, emitterCallback);

      function emitterCallback(data) {
        let { workerID, message } = data;

        _sendWC({
          type: "workerMessage",
          workerID: workerID,
          message: message,
          workerMessage: data,
        });
      }

      function removeEmitterCallback() {
        this_.oberknechtEmitter.removeListener(
          emitterEventName,
          emitterCallback
        );
      }

      function removeWorkerCallbacks() {
        unsubscribeFromAllWorkers(this_.symbol, wsSym);
      }

      wsData.heartbeat.heartbeatInterval = setInterval(
        heartbeatPing,
        this_._options.heartbeatInterval ?? defaults.heartbeatInterval
      );

      ws.on("pong", () => {
        this.oberknechtEmitter.emit(
          [
            "wsserver-ws",
            "wsserver-ws:pong",
            `wsserver-ws-${wsSym}`,
            `wsserver-ws-${wsSym}:pong`,
          ],
          ""
        );

        heartbeatPong();
      });

      ws.on("message", async (rawMessage_) => {
        this.oberknechtEmitter.emit(
          [
            "wsserver-ws",
            "wsserver-ws:message",
            `wsserver-ws-${wsSym}`,
            `wsserver-ws-${wsSym}:message`,
          ],
          rawMessage_
        );

        // @ts-ignore
        const rawMessage = Buffer.from(rawMessage_).toString("utf-8");
        const messageID = `ws-message:${wsData.messageSymNum++}`;
        let pass;
        let type;

        function sendWC(stuff, status?: number) {
          let stuff_ = {
            ...stuff,
            messageID: messageID,
            ...(type !== undefined ? { type: type } : {}),
            ...(pass !== undefined ? { pass: pass } : {}),
          };

          return _sendWC(stuff_, status);
        }

        let message: Record<string, any>;
        try {
          if (!regex.jsonreg().test(rawMessage))
            return sendWC({
              error: Error("message does not match json regex"),
            });

          message = JSON.parse(rawMessage);
        } catch (e) {
          return sendWC({
            error: Error("Could not parse Raw Message as JSON"),
          });
        }

        type = message.type;
        pass = message.pass;

        let params = message.params ?? {};

        if (!type)
          return sendWC({
            error: Error("message.type is undefined"),
          });

        if (
          !["login"].includes(type) &&
          this._options.serverPassword &&
          !wsData.loggedIn
        )
          return sendWC({ error: Error("Login required") }, 401);

        switch (type) {
          case "test": {
            return sendWC({});
          }

          case "login": {
            let password = params.password;
            if (
              this._options.serverPassword &&
              (!password || password !== this._options.serverPassword)
            )
              return sendWC(
                {
                  error: Error(
                    "password is not defined or does not match server password"
                  ),
                },
                498
              );

            wsData.loggedIn = true;

            return sendWC({
              message: "Success",
            });
          }

          case "getChildren":
          case "getWorkers": {
            return sendWC({
              wsWorkerIDs: Object.keys(
                i.workerSubscriptions[this.symbol]?.wsIDs?.[wsSym]?.workerIDs ??
                  {}
              ),
              workerIDs: Object.keys(
                i.workerSubscriptions[this.symbol]?.workerIDs ?? {}
              ),
            });
          }

          case "createChild":
          case "createWorker": {
            let command = params.command;
            let args = params.args;

            if (!command)
              return sendWC({
                error: Error("command is undefined"),
              });

            let childWorker = await createChildWorker(
              this.symbol,
              command,
              args
            );

            subscribeToWorker(this.symbol, wsSym, childWorker.workerID);

            return sendWC({
              message: "Success",
              workerID: childWorker.workerID,
            });
          }

          case "closeChild":
          case "closeWorker": {
            let workerID = params.workerID;

            if (!workerID)
              return sendWC({ error: Error("param workerID is undefined") });

            closeChildWorker(this_.symbol, workerID);

            return sendWC({
              message: "Success",
            });
          }

          case "subscribeToChild":
          case "subscribeToWorker": {
            let workerID = params.workerID;

            if (!workerID)
              return sendWC({
                error: Error("parameter workerID is undefined"),
              });

            subscribeToWorker(this_.symbol, wsSym, workerID);

            sendWC({
              message: "Success",
              workerID: workerID,
            });
          }

          case "sendToChild":
          case "sendToWorker": {
            let message = params.message;
            let workerID = params.workerID;

            if (!message || !workerID)
              return sendWC({
                error: Error("parameter message or workerID is undefined"),
              });

            sendToWorker(this_.symbol, workerID, message);

            return sendWC({
              message: "Success",
              workerID: workerID,
            });
          }

          default: {
            return sendWC({ error: Error("type not found") }, 404);
          }
        }
      });

      ws.on("close", (code, reason) => {
        this.oberknechtEmitter.emit(
          [
            "wsserver-ws",
            "wsserver-ws:close",
            `wsserver-ws-${wsSym}`,
            `wsserver-ws-${wsSym}:close`,
          ],
          [code, reason]
        );
      });
    });
  };
}
