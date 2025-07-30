import * as React from 'react';
import type { GridSlotProps } from "../../models/gridSlotsComponentsProps.js";
interface GridToolbarDensitySelectorProps {
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: {
    button?: Partial<GridSlotProps['baseButton']>;
    tooltip?: Partial<GridSlotProps['baseTooltip']>;
  };
}
/**
 * @deprecated See {@link https://mui.com/x/react-data-grid/accessibility/#set-the-density-programmatically Accessibility—Set the density programmatically} for an example of adding a density selector to the toolbar. This component will be removed in a future major release.
 */
declare const GridToolbarDensitySelector: React.ForwardRefExoticComponent<GridToolbarDensitySelectorProps> | React.ForwardRefExoticComponent<GridToolbarDensitySelectorProps & React.RefAttributes<HTMLButtonElement>>;
export { GridToolbarDensitySelector };