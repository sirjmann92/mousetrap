import { RefObject } from '@mui/x-internals/types';
import { CreateSelectorFunction } from '@mui/x-internals/store';
export interface OutputSelector<State, Args, Result> {
  (apiRef: RefObject<{
    state: State;
  } | null>, args?: Args): Result;
}
export declare const createSelector: CreateSelectorFunction;
export declare const createSelectorMemoized: CreateSelectorFunction;
/**
 * Used to create the root selector for a feature. It assumes that the state is already initialized
 * and strips from the types the possibility of `apiRef` being `null`.
 * Users are warned about this in our documentation https://mui.com/x/react-data-grid/state/#direct-selector-access
 */
export declare const createRootSelector: <State, Args, Result>(fn: (state: State, args: Args) => Result) => OutputSelector<State, Args, Result>;