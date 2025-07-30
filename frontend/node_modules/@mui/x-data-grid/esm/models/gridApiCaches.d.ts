import type { GridRowsInternalCache } from "../hooks/features/rows/gridRowsInterfaces.js";
import type { GridRowsMetaInternalCache } from "../hooks/features/rows/gridRowsMetaInterfaces.js";
import type { GridColumnGroupingInternalCache } from "../hooks/features/columnGrouping/gridColumnGroupsInterfaces.js";
import type { GridColDef } from "./colDef/index.js";
export interface GridApiCaches {
  columns: {
    lastColumnsProp: readonly GridColDef[];
  };
  columnGrouping: GridColumnGroupingInternalCache;
  rows: GridRowsInternalCache;
  rowsMeta: GridRowsMetaInternalCache;
}