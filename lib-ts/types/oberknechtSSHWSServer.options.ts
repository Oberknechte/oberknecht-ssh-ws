import { WebSocketServer, ServerOptions } from "ws";

export type oberknechtSSHWSServerOptionsType = {
  wsServer?: WebSocketServer;
  wsServerOptions?: ServerOptions;
  serverPassword?: string;
  maxPingsPending?: number;
  heartbeatInterval?: number;
  debug?: number;
};
