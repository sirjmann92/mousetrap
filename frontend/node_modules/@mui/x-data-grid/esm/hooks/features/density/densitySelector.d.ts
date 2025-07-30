import { GridStateCommunity } from "../../../models/gridStateCommunity.js";
import { GridDensity } from "../../../models/gridDensity.js";
export declare const COMPACT_DENSITY_FACTOR = 0.7;
export declare const COMFORTABLE_DENSITY_FACTOR = 1.3;
export declare const gridDensitySelector: import("@mui/x-data-grid").OutputSelector<GridStateCommunity, unknown, GridDensity>;
export declare const gridDensityFactorSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;