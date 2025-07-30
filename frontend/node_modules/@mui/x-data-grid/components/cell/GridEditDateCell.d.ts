import * as React from 'react';
import { GridSlotProps } from "../../models/gridSlotsComponent.js";
import { GridRenderEditCellParams } from "../../models/params/gridCellParams.js";
export interface GridEditDateCellProps extends GridRenderEditCellParams {
  /**
   * Callback called when the value is changed by the user.
   * @param {React.ChangeEvent<HTMLInputElement>} event The event source of the callback.
   * @param {Date | null} newValue The value that is going to be passed to `apiRef.current.setEditCellValue`.
   * @returns {Promise<void> | void} A promise to be awaited before calling `apiRef.current.setEditCellValue`
   */
  onValueChange?: (event: React.ChangeEvent<HTMLInputElement>, newValue: Date | null) => Promise<void> | void;
  slotProps?: {
    root?: Partial<GridSlotProps['baseInput']>;
  };
}
declare function GridEditDateCell(props: GridEditDateCellProps): React.JSX.Element;
declare namespace GridEditDateCell {
  var propTypes: any;
}
export { GridEditDateCell };
export declare const renderEditDateCell: (params: GridRenderEditCellParams) => React.JSX.Element;