import * as React from 'react';
import { GridStateColDef } from "../../models/colDef/gridColDef.js";
import { GridSortDirection } from "../../models/gridSortModel.js";
import { GridColumnHeaderSeparatorProps } from "./GridColumnHeaderSeparator.js";
import { PinnedColumnPosition } from "../../internals/constants.js";
interface GridColumnHeaderItemProps {
  colIndex: number;
  colDef: GridStateColDef;
  columnMenuOpen: boolean;
  headerHeight: number;
  isDragging: boolean;
  isResizing: boolean;
  isLast: boolean;
  sortDirection: GridSortDirection;
  sortIndex?: number;
  filterItemsCounter?: number;
  hasFocus?: boolean;
  tabIndex: 0 | -1;
  disableReorder?: boolean;
  separatorSide?: GridColumnHeaderSeparatorProps['side'];
  pinnedPosition?: PinnedColumnPosition;
  pinnedOffset?: number;
  style?: React.CSSProperties;
  isLastUnpinned: boolean;
  isSiblingFocused: boolean;
  showLeftBorder: boolean;
  showRightBorder: boolean;
}
declare function GridColumnHeaderItem(props: GridColumnHeaderItemProps): React.JSX.Element;
declare namespace GridColumnHeaderItem {
  var propTypes: any;
}
declare const Memoized: typeof GridColumnHeaderItem;
export { Memoized as GridColumnHeaderItem };