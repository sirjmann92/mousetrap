import * as React from 'react';
import type { GridSlotProps } from "../../models/gridSlotsComponentsProps.js";
interface GridToolbarColumnsButtonProps {
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
 * @deprecated Use the {@link https://mui.com/x/react-data-grid/components/columns-panel/ Columns Panel Trigger} component instead. This component will be removed in a future major release.
 */
declare const GridToolbarColumnsButton: React.ForwardRefExoticComponent<GridToolbarColumnsButtonProps> | React.ForwardRefExoticComponent<GridToolbarColumnsButtonProps & React.RefAttributes<HTMLButtonElement>>;
export { GridToolbarColumnsButton };