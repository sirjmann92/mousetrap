import * as React from 'react';
import { GridSlotProps } from "../../models/gridSlotsComponentsProps.js";
interface GridToolbarInternalProps {
  additionalItems?: React.ReactNode;
  additionalExportMenuItems?: (onMenuItemClick: () => void) => React.ReactNode;
}
export type GridToolbarProps = GridSlotProps['toolbar'] & GridToolbarInternalProps;
declare function GridToolbarDivider(props: GridSlotProps['baseDivider']): React.JSX.Element;
declare namespace GridToolbarDivider {
  var propTypes: any;
}
declare function GridToolbarLabel(props: React.HTMLAttributes<HTMLSpanElement>): React.JSX.Element;
declare function GridToolbar(props: GridToolbarProps): React.JSX.Element;
declare namespace GridToolbar {
  var propTypes: any;
}
export { GridToolbar, GridToolbarDivider, GridToolbarLabel };