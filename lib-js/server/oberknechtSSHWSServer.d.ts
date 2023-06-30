/// <reference types="node" />
import { WebSocketServer } from "ws";
import { oberknechtSSHWSServerOptionsType } from "../types/oberknechtSSHWSServer.options";
import { oberknechtEmitter } from "oberknecht-emitters";
export declare class oberknechtSSHWSServer {
    #private;
    get symbol(): string;
    get _options(): any;
    wsServer: WebSocketServer;
    get oberknechtEmitter(): oberknechtEmitter;
    ha_ha_ha_ha_stayinAlive_stayinAlive: NodeJS.Timer;
    constructor(options: oberknechtSSHWSServerOptionsType);
    connectServer: () => void;
}
