import { RefObject } from '@mui/x-internals/types';
import { DataGridProcessedProps } from "../../models/props/DataGridProps.js";
import type { GridApiCommon } from "../../models/index.js";
export declare const getVisibleRows: <Api extends GridApiCommon>(apiRef: RefObject<Api>, props?: Pick<DataGridProcessedProps, "pagination" | "paginationMode">) => {
  rows: import("@mui/x-data-grid").GridRowEntry<import("@mui/x-data-grid").GridValidRowModel>[];
  range: {
    firstRowIndex: number;
    lastRowIndex: number;
  } | null;
  rowIdToIndexMap: Map<import("@mui/x-data-grid").GridRowId, number>;
};
/**
 * Computes the list of rows that are reachable by scroll.
 * Depending on whether pagination is enabled, it will return the rows in the current page.
 * - If the pagination is disabled or in server mode, it equals all the visible rows.
 * - If the row tree has several layers, it contains up to `state.pageSize` top level rows and all their descendants.
 * - If the row tree is flat, it only contains up to `state.pageSize` rows.
 */
export declare const useGridVisibleRows: <Api extends GridApiCommon>(apiRef: RefObject<Api>, props?: Pick<DataGridProcessedProps, "pagination" | "paginationMode">) => {
  rows: import("@mui/x-data-grid").GridRowEntry<import("@mui/x-data-grid").GridValidRowModel>[];
  range: {
    firstRowIndex: number;
    lastRowIndex: number;
  } | null;
  rowIdToIndexMap: Map<import("@mui/x-data-grid").GridRowId, number>;
};