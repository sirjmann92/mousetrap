import { GridRowId } from "../../../models/gridRows.js";
import { GridStateCommunity } from "../../../models/gridStateCommunity.js";
export declare const gridRowsStateSelector: import("@mui/x-data-grid").OutputSelector<GridStateCommunity, unknown, import("@mui/x-data-grid").GridRowsState>;
export declare const gridRowCountSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
export declare const gridRowsLoadingSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => boolean | undefined;
export declare const gridTopLevelRowCountSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
export declare const gridRowsLookupSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridRowIdToModelLookup<import("@mui/x-data-grid").GridValidRowModel>;
export declare const gridRowSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>, id: GridRowId) => import("@mui/x-data-grid").GridValidRowModel;
export declare const gridRowTreeSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridRowTreeConfig;
export declare const gridRowNodeSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>, rowId: GridRowId) => import("@mui/x-data-grid").GridTreeNode;
export declare const gridRowGroupsToFetchSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => GridRowId[] | undefined;
export declare const gridRowGroupingNameSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => string;
export declare const gridRowTreeDepthsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("./gridRowsInterfaces.js").GridTreeDepths;
export declare const gridRowMaximumTreeDepthSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;
export declare const gridDataRowIdsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => GridRowId[];
export declare const gridDataRowsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridValidRowModel[];
/**
 * @ignore - do not document.
 */
export declare const gridAdditionalRowGroupsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => {
  pinnedRows?: import("./gridRowsInterfaces.js").GridPinnedRowsState;
} | undefined;
/**
 * @ignore - do not document.
 */
export declare const gridPinnedRowsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => {
  bottom: {
    id: GridRowId;
    model: import("@mui/x-data-grid").GridValidRowModel;
  }[];
  top: {
    id: GridRowId;
    model: import("@mui/x-data-grid").GridValidRowModel;
  }[];
};
/**
 * @ignore - do not document.
 */
export declare const gridPinnedRowsCountSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number;