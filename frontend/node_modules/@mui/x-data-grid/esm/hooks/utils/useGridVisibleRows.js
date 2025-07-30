import { gridVisibleRowsSelector } from "../features/pagination/gridPaginationSelector.js";
import { useGridSelector } from "./index.js";
export const getVisibleRows = (apiRef, props) => {
  return gridVisibleRowsSelector(apiRef);
};

/**
 * Computes the list of rows that are reachable by scroll.
 * Depending on whether pagination is enabled, it will return the rows in the current page.
 * - If the pagination is disabled or in server mode, it equals all the visible rows.
 * - If the row tree has several layers, it contains up to `state.pageSize` top level rows and all their descendants.
 * - If the row tree is flat, it only contains up to `state.pageSize` rows.
 */

export const useGridVisibleRows = (apiRef, props) => {
  return useGridSelector(apiRef, gridVisibleRowsSelector);
};