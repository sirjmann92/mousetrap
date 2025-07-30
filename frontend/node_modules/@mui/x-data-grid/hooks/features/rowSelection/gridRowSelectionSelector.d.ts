import { GridStateCommunity } from "../../../models/gridStateCommunity.js";
import { GridRowId } from "../../../models/gridRows.js";
export declare const gridRowSelectionStateSelector: import("@mui/x-data-grid").OutputSelector<GridStateCommunity, unknown, import("@mui/x-data-grid").GridRowSelectionModel>;
export declare const gridRowSelectionManagerSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("../../../models/gridRowSelectionManager.js").RowSelectionManager;
export declare const gridRowSelectionCountSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
export declare const gridRowSelectionIdsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => Map<GridRowId, import("@mui/x-data-grid").GridValidRowModel>;