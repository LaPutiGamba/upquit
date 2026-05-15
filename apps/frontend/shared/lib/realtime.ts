type BroadcastPayloadEnvelope<T> = {
  data: T;
  timestamp?: string;
};

function isBroadcastPayloadEnvelope<T>(
  payload: T | BroadcastPayloadEnvelope<T>
): payload is BroadcastPayloadEnvelope<T> {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

export function unwrapBroadcastPayload<T>(payload: T | BroadcastPayloadEnvelope<T>): T {
  return isBroadcastPayloadEnvelope(payload) ? payload.data : payload;
}
