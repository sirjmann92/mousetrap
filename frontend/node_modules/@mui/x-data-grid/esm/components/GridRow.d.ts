import * as React from 'react';
import { GridRowId, GridRowModel } from "../models/gridRows.js";
import { GridPinnedColumns } from "../hooks/features/columns/index.js";
import type { GridStateColDef } from "../models/colDef/gridColDef.js";
export interface GridRowProps extends React.HTMLAttributes<HTMLDivElement> {
  row: GridRowModel;
  rowId: GridRowId;
  selected: boolean;
  /**
   * Index of the row in the whole sorted and filtered dataset.
   * If some rows above have expanded children, this index also take those children into account.
   */
  index: number;
  rowHeight: number | 'auto';
  offsetLeft: number;
  columnsTotalWidth: number;
  firstColumnIndex: number;
  lastColumnIndex: number;
  visibleColumns: GridStateColDef[];
  pinnedColumns: GridPinnedColumns;
  /**
   * Determines which cell has focus.
   * If `null`, no cell in this row has focus.
   */
  focusedColumnIndex: number | undefined;
  isFirstVisible: boolean;
  isLastVisible: boolean;
  isNotVisible: boolean;
  showBottomBorder: boolean;
  scrollbarWidth: number;
  gridHasFiller: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  [x: `data-${string}`]: string;
}
declare const MemoizedGridRow: React.ForwardRefExoticComponent<GridRowProps> | React.ForwardRefExoticComponent<GridRowProps & React.RefAttributes<HTMLDivElement>>;
export { MemoizedGridRow as GridRow };