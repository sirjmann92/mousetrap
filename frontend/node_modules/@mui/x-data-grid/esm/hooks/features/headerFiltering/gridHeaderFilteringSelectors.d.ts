import { GridStateCommunity } from "../../../models/gridStateCommunity.js";
export declare const gridHeaderFilteringStateSelector: import("@mui/x-data-grid").OutputSelector<GridStateCommunity, unknown, import("../../../models/gridHeaderFilteringModel.js").GridHeaderFilteringState>;
export declare const gridHeaderFilteringEnabledSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => boolean;
export declare const gridHeaderFilteringEditFieldSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => string | null;
export declare const gridHeaderFilteringMenuSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => string | null;