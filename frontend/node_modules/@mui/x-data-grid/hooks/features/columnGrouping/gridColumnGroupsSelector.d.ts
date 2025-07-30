import { GridStateCommunity } from "../../../models/gridStateCommunity.js";
/**
 * @category ColumnGrouping
 * @ignore - do not document.
 */
export declare const gridColumnGroupingSelector: import("@mui/x-data-grid").OutputSelector<GridStateCommunity, unknown, import("@mui/x-data-grid").GridColumnsGroupingState>;
export declare const gridColumnGroupsUnwrappedModelSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => {
  [columnField: string]: string[];
};
export declare const gridColumnGroupsLookupSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("./gridColumnGroupsInterfaces.js").GridColumnGroupLookup;
export declare const gridColumnGroupsHeaderStructureSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("./gridColumnGroupsInterfaces.js").GridGroupingStructure[][];
export declare const gridColumnGroupsHeaderMaxDepthSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;