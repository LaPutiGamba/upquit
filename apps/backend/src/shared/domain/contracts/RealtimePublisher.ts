import { RealtimePayload } from "./RealtimePayload.js";

export default interface RealtimePublisher {
  publish<T = Record<string, unknown>>(channel: string, event: string, payload: RealtimePayload<T>): void;
}
