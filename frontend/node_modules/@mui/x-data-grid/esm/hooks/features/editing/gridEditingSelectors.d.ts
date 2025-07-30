import { GridStateCommunity } from "../../../models/gridStateCommunity.js";
import { GridRowId } from "../../../models/gridRows.js";
import { GridEditMode } from "../../../models/gridEditRowModel.js";
/**
 * Select the row editing state.
 */
export declare const gridEditRowsStateSelector: import("@mui/x-data-grid").OutputSelector<GridStateCommunity, unknown, import("@mui/x-data-grid").GridEditingState>;
export declare const gridRowIsEditingSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>, args_1: {
  rowId: GridRowId;
  editMode: GridEditMode;
}) => boolean;
export declare const gridEditCellStateSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>, args_1: {
  rowId: GridRowId;
  field: string;
}) => import("@mui/x-data-grid").GridEditCellProps<any>;