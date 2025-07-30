import { GridStateCommunity } from "../../../models/gridStateCommunity.js";
import { GridFocusState, GridTabIndexState } from "./gridFocusState.js";
export declare const gridFocusStateSelector: import("@mui/x-data-grid").OutputSelector<GridStateCommunity, unknown, GridFocusState>;
export declare const gridFocusCellSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridCellCoordinates | null;
export declare const gridFocusColumnHeaderSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridColumnIdentifier | null;
export declare const gridFocusColumnHeaderFilterSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridColumnIdentifier | null;
export declare const gridFocusColumnGroupHeaderSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridColumnGroupIdentifier | null;
export declare const gridTabIndexStateSelector: import("@mui/x-data-grid").OutputSelector<GridStateCommunity, unknown, GridTabIndexState>;
export declare const gridTabIndexCellSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridCellCoordinates | null;
export declare const gridTabIndexColumnHeaderSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridColumnIdentifier | null;
export declare const gridTabIndexColumnHeaderFilterSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridColumnIdentifier | null;
export declare const gridTabIndexColumnGroupHeaderSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridColumnGroupIdentifier | null;