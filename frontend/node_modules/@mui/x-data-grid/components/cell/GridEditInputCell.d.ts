import * as React from 'react';
import { GridSlotProps } from "../../models/gridSlotsComponent.js";
import { GridRenderEditCellParams } from "../../models/params/gridCellParams.js";
export interface GridEditInputCellProps extends GridRenderEditCellParams {
  debounceMs?: number;
  /**
   * Callback called when the value is changed by the user.
   * @param {React.ChangeEvent<HTMLInputElement>} event The event source of the callback.
   * @param {Date | null} newValue The value that is going to be passed to `apiRef.current.setEditCellValue`.
   * @returns {Promise<void> | void} A promise to be awaited before calling `apiRef.current.setEditCellValue`
   */
  onValueChange?: (event: React.ChangeEvent<HTMLInputElement>, newValue: string) => Promise<void> | void;
  slotProps?: {
    root?: Partial<GridSlotProps['baseInput']>;
  };
}
declare const GridEditInputCell: React.ForwardRefExoticComponent<GridEditInputCellProps> | React.ForwardRefExoticComponent<Omit<GridEditInputCellProps, "ref"> & React.RefAttributes<HTMLInputElement>>;
export { GridEditInputCell };
export declare const renderEditInputCell: (params: GridEditInputCellProps) => React.JSX.Element;