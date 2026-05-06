export interface RealtimePayload<T = Record<string, unknown>> {
  data: T;
  timestamp: string;
}
