import { RefObject } from '@mui/x-internals/types';
import { EventListenerOptions } from '@mui/x-internals/EventManager';
import { GridEventListener, GridEvents } from "../../models/events/index.js";
import { TimerBasedCleanupTracking } from "../../utils/cleanupTracking/TimerBasedCleanupTracking.js";
import { FinalizationRegistryBasedCleanupTracking } from "../../utils/cleanupTracking/FinalizationRegistryBasedCleanupTracking.js";
import type { GridApiCommon } from "../../models/index.js";
export declare function useGridEvent<Api extends GridApiCommon, E extends GridEvents>(apiRef: RefObject<Api>, eventName: E, handler?: GridEventListener<E>, options?: EventListenerOptions): void;
export declare function useGridEventPriority<Api extends GridApiCommon, E extends GridEvents>(apiRef: RefObject<Api>, eventName: E, handler?: GridEventListener<E>): void;
export declare function unstable_resetCleanupTracking(): void;
export declare const internal_registryContainer: {
  current: TimerBasedCleanupTracking | FinalizationRegistryBasedCleanupTracking;
};