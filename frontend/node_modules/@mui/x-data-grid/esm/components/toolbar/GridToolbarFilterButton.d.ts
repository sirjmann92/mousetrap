import * as React from 'react';
import type { GridSlotProps } from "../../models/gridSlotsComponentsProps.js";
export interface GridToolbarFilterButtonProps {
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: {
    button?: Partial<GridSlotProps['baseButton']>;
    tooltip?: Partial<GridSlotProps['baseTooltip']>;
    badge?: Partial<GridSlotProps['baseBadge']>;
  };
}
/**
 * @deprecated Use the {@link https://mui.com/x/react-data-grid/components/filter-panel/ Filter Panel Trigger} component instead. This component will be removed in a future major release.
 */
declare const GridToolbarFilterButton: React.ForwardRefExoticComponent<GridToolbarFilterButtonProps> | React.ForwardRefExoticComponent<GridToolbarFilterButtonProps & React.RefAttributes<HTMLButtonElement>>;
export { GridToolbarFilterButton };