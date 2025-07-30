import * as React from 'react';
import { PinnedColumnPosition } from "../../internals/constants.js";
interface GridColumnGroupHeaderProps {
  groupId: string | null;
  width: number;
  fields: string[];
  colIndex: number;
  isLastColumn: boolean;
  depth: number;
  maxDepth: number;
  height: number;
  hasFocus?: boolean;
  tabIndex: 0 | -1;
  style?: React.CSSProperties;
  showLeftBorder: boolean;
  showRightBorder: boolean;
  pinnedPosition: PinnedColumnPosition | undefined;
  pinnedOffset?: number;
}
declare function GridColumnGroupHeader(props: GridColumnGroupHeaderProps): React.JSX.Element;
export { GridColumnGroupHeader };