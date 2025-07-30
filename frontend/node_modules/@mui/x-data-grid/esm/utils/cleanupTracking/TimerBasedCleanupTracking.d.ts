import { CleanupTracking, UnregisterToken, UnsubscribeFn } from "./CleanupTracking.js";
export declare class TimerBasedCleanupTracking implements CleanupTracking {
  timeouts?: Map<number, number> | undefined;
  cleanupTimeout: number;
  constructor(timeout?: number);
  register(object: any, unsubscribe: UnsubscribeFn, unregisterToken: UnregisterToken): void;
  unregister(unregisterToken: UnregisterToken): void;
  reset(): void;
}