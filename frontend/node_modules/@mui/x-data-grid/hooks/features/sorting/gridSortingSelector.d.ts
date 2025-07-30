import { GridSortDirection, GridSortModel } from "../../../models/gridSortModel.js";
import type { GridValidRowModel, GridRowEntry, GridRowId } from "../../../models/gridRows.js";
import { GridStateCommunity } from "../../../models/gridStateCommunity.js";
/**
 * Get the id of the rows after the sorting process.
 * @category Sorting
 */
export declare const gridSortedRowIdsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => GridRowId[];
/**
 * Get the id and the model of the rows after the sorting process.
 * @category Sorting
 */
export declare const gridSortedRowEntriesSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => GridRowEntry<GridValidRowModel>[];
/**
 * Get the current sorting model.
 * @category Sorting
 */
export declare const gridSortModelSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => GridSortModel;
export type GridSortColumnLookup = Record<string, {
  sortDirection: GridSortDirection;
  sortIndex?: number;
}>;
/**
 * @category Sorting
 * @ignore - do not document.
 */
export declare const gridSortColumnLookupSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => GridSortColumnLookup;
/**
 * @category Sorting
 * @ignore - do not document.
 */
export declare const gridSortedRowIndexLookupSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => Record<GridRowId, number>;