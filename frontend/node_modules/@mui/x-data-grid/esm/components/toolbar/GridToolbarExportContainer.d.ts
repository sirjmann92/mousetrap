import * as React from 'react';
import type { GridSlotProps } from "../../models/gridSlotsComponentsProps.js";
interface GridToolbarExportContainerProps {
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: {
    button?: Partial<GridSlotProps['baseButton']>;
    tooltip?: Partial<GridSlotProps['baseTooltip']>;
  };
}
declare const GridToolbarExportContainer: React.ForwardRefExoticComponent<React.PropsWithChildren<GridToolbarExportContainerProps>> | React.ForwardRefExoticComponent<GridToolbarExportContainerProps & {
  children?: React.ReactNode | undefined;
} & React.RefAttributes<HTMLButtonElement>>;
export { GridToolbarExportContainer };