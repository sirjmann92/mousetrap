import { RefObject } from '@mui/x-internals/types';
import type { GridCallbackDetails } from "./api/gridCallbackDetails.js";
import type { GridEventLookup, GridControlledStateEventLookup } from "./events/index.js";
import type { OutputSelector } from "../utils/createSelector.js";
import type { GridStateCommunity } from "./gridStateCommunity.js";
export interface GridControlStateItem<State extends GridStateCommunity, Args, E extends keyof GridControlledStateEventLookup> {
  stateId: string;
  propModel?: GridEventLookup[E]['params'];
  stateSelector: OutputSelector<State, Args, GridControlledStateEventLookup[E]['params']> | ((apiRef: RefObject<{
    state: State;
  }>) => GridControlledStateEventLookup[E]['params']);
  propOnChange?: (model: GridControlledStateEventLookup[E]['params'], details: GridCallbackDetails) => void;
  changeEvent: E;
}