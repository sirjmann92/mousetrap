import { GridStateCommunity } from "../../../models/gridStateCommunity.js";
export declare const gridDimensionsSelector: import("@mui/x-data-grid").OutputSelector<GridStateCommunity, unknown, import("@mui/x-data-grid").GridDimensions>;
/**
 * Get the summed width of all the visible columns.
 * @category Visible Columns
 */
export declare const gridColumnsTotalWidthSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
export declare const gridRowHeightSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
export declare const gridContentHeightSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
export declare const gridHasScrollXSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => boolean;
export declare const gridHasScrollYSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => boolean;
export declare const gridHasFillerSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => boolean;
export declare const gridHeaderHeightSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
export declare const gridGroupHeaderHeightSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
export declare const gridHeaderFilterHeightSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
export declare const gridHorizontalScrollbarHeightSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
export declare const gridVerticalScrollbarWidthSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
export declare const gridHasBottomFillerSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => boolean;