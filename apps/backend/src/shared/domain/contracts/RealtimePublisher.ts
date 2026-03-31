export default interface RealtimePublisher {
  publish(channel: string, event: string, payload: any): void;
}
