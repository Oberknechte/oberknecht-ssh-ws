import { oberknechtEmitter } from "oberknecht-emitters";
import { Worker } from "worker_threads";

export class i {
  static serverData = {};
  static oberknechtEmitters: Record<string, oberknechtEmitter> = {};
  static childWorkers: Record<string, Record<string, Worker>> = {};
  static workerSubscriptions = {};
}
