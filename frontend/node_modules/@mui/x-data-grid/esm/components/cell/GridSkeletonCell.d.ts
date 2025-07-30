import * as React from 'react';
import { GridColType } from "../../models/index.js";
export interface GridSkeletonCellProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: GridColType;
  width?: number | string;
  height?: number | 'auto';
  field?: string;
  align?: string;
  /**
   * If `true`, the cell will not display the skeleton but still reserve the cell space.
   * @default false
   */
  empty?: boolean;
}
declare function GridSkeletonCell(props: GridSkeletonCellProps): React.JSX.Element;
declare namespace GridSkeletonCell {
  var propTypes: any;
}
declare const Memoized: typeof GridSkeletonCell;
export { Memoized as GridSkeletonCell };