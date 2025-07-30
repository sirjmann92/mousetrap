import * as React from 'react';
import { GridToolbarContainerProps } from "../containers/GridToolbarContainer.js";
import { GridToolbarExportProps } from "./GridToolbarExport.js";
import { GridToolbarQuickFilterProps } from "./GridToolbarQuickFilter.js";
export interface GridToolbarProps extends GridToolbarContainerProps, GridToolbarExportProps {
  /**
   * Show the quick filter component.
   * @default true
   */
  showQuickFilter?: boolean;
  /**
   * Props passed to the quick filter component.
   */
  quickFilterProps?: GridToolbarQuickFilterProps;
}
/**
 * @deprecated Use the `showToolbar` prop to show the default toolbar instead. This component will be removed in a future major release.
 */
declare const GridToolbar: React.ForwardRefExoticComponent<GridToolbarProps> | React.ForwardRefExoticComponent<GridToolbarProps & React.RefAttributes<HTMLDivElement>>;
export { GridToolbar };