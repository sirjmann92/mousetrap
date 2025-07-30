import * as React from 'react';
import { GridSlotProps } from "../models/index.js";
import { GridSortDirection } from "../models/gridSortModel.js";
export type GridColumnSortButtonProps = GridSlotProps['baseIconButton'] & {
  field: string;
  direction: GridSortDirection;
  index?: number;
  sortingOrder: readonly GridSortDirection[];
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};
declare function GridColumnSortButton(props: GridColumnSortButtonProps): React.JSX.Element | null;
declare namespace GridColumnSortButton {
  var propTypes: any;
}
export { GridColumnSortButton };