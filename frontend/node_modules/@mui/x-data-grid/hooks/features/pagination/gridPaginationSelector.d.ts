import { GridStateCommunity } from "../../../models/gridStateCommunity.js";
import { GridRowId } from "../../../models/gridRows.js";
/**
 * @category Pagination
 * @ignore - do not document.
 */
export declare const gridPaginationSelector: import("@mui/x-data-grid").OutputSelector<GridStateCommunity, unknown, import("@mui/x-data-grid").GridPaginationState>;
/**
 * @category Pagination
 * @ignore - do not document.
 */
export declare const gridPaginationEnabledClientSideSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => boolean;
/**
 * Get the pagination model
 * @category Pagination
 */
export declare const gridPaginationModelSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridPaginationModel;
/**
 * Get the row count
 * @category Pagination
 */
export declare const gridPaginationRowCountSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
/**
 * Get the pagination meta
 * @category Pagination
 */
export declare const gridPaginationMetaSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridPaginationMeta;
/**
 * Get the index of the page to render if the pagination is enabled
 * @category Pagination
 */
export declare const gridPageSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
/**
 * Get the maximum amount of rows to display on a single page if the pagination is enabled
 * @category Pagination
 */
export declare const gridPageSizeSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
/**
 * Get the amount of pages needed to display all the rows if the pagination is enabled
 * @category Pagination
 */
export declare const gridPageCountSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
/**
 * Get the index of the first and the last row to include in the current page if the pagination is enabled.
 * @category Pagination
 */
export declare const gridPaginationRowRangeSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => {
  firstRowIndex: number;
  lastRowIndex: number;
} | null;
/**
 * Get the id and the model of each row to include in the current page if the pagination is enabled.
 * @category Pagination
 */
export declare const gridPaginatedVisibleSortedGridRowEntriesSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridRowEntry<import("@mui/x-data-grid").GridValidRowModel>[];
/**
 * Get the id of each row to include in the current page if the pagination is enabled.
 * @category Pagination
 */
export declare const gridPaginatedVisibleSortedGridRowIdsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => GridRowId[];
/**
 * Get the rows, range and rowIndex lookup map after filtering and sorting.
 * Does not contain the collapsed children.
 * @category Pagination
 */
export declare const gridVisibleRowsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => {
  rows: import("@mui/x-data-grid").GridRowEntry<import("@mui/x-data-grid").GridValidRowModel>[];
  range: {
    firstRowIndex: number;
    lastRowIndex: number;
  } | null;
  rowIdToIndexMap: Map<GridRowId, number>;
};