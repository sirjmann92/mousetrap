import * as React from 'react';
import type { GridSlotProps } from "../../models/gridSlotsComponentsProps.js";
import { GridCsvExportOptions, GridPrintExportOptions } from "../../models/gridExport.js";
export interface GridExportDisplayOptions {
  /**
   * If `true`, this export option will be removed from the GridToolbarExport menu.
   * @default false
   */
  disableToolbarButton?: boolean;
}
export interface GridExportMenuItemProps<Options extends {}> {
  hideMenu?: () => void;
  options?: Options & GridExportDisplayOptions;
}
export type GridCsvExportMenuItemProps = GridExportMenuItemProps<GridCsvExportOptions>;
export type GridPrintExportMenuItemProps = GridExportMenuItemProps<GridPrintExportOptions>;
export interface GridToolbarExportProps {
  csvOptions?: GridCsvExportOptions & GridExportDisplayOptions;
  printOptions?: GridPrintExportOptions & GridExportDisplayOptions;
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: {
    button?: Partial<GridSlotProps['baseButton']>;
    tooltip?: Partial<GridSlotProps['baseTooltip']>;
  };
  [x: `data-${string}`]: string;
}
declare function GridCsvExportMenuItem(props: GridCsvExportMenuItemProps): React.JSX.Element;
declare namespace GridCsvExportMenuItem {
  var propTypes: any;
}
declare function GridPrintExportMenuItem(props: GridPrintExportMenuItemProps): React.JSX.Element;
declare namespace GridPrintExportMenuItem {
  var propTypes: any;
}
/**
 * @deprecated Use the {@link https://mui.com/x/react-data-grid/components/export/ Export} components instead. This component will be removed in a future major release.
 */
declare const GridToolbarExport: React.ForwardRefExoticComponent<GridToolbarExportProps> | React.ForwardRefExoticComponent<GridToolbarExportProps & React.RefAttributes<HTMLButtonElement>>;
export { GridToolbarExport, GridCsvExportMenuItem, GridPrintExportMenuItem };