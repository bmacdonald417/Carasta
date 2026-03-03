import { EventEmitter } from "events";
import type { ActivityEvent } from "./pusher";

export const activityEmitter = new EventEmitter();
activityEmitter.setMaxListeners(100);

export function emitActivity(event: ActivityEvent): void {
  activityEmitter.emit("activity", event);
}
