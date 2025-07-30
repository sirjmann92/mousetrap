import { GridStateCommunity } from "../../../models/gridStateCommunity.js";
import { GridColumnLookup, GridPinnedColumnFields } from "./gridColumnsInterfaces.js";
/**
 * Get the columns state
 * @category Columns
 */
export declare const gridColumnsStateSelector: import("@mui/x-data-grid").OutputSelector<GridStateCommunity, unknown, import("@mui/x-data-grid").GridColumnsState>;
/**
 * Get an array of column fields in the order rendered on screen.
 * @category Columns
 */
export declare const gridColumnFieldsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => string[];
/**
 * Get the columns as a lookup (an object containing the field for keys and the definition for values).
 * @category Columns
 */
export declare const gridColumnLookupSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => GridColumnLookup;
/**
 * Get an array of column definitions in the order rendered on screen..
 * @category Columns
 */
export declare const gridColumnDefinitionsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("../../../internals/index.js").GridStateColDef[];
/**
 * Get the column visibility model, containing the visibility status of each column.
 * If a column is not registered in the model, it is visible.
 * @category Visible Columns
 */
export declare const gridColumnVisibilityModelSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridColumnVisibilityModel;
/**
 * Get the "initial" column visibility model, containing the visibility status of each column.
 * It is updated when the `columns` prop is updated or when `updateColumns` API method is called.
 * If a column is not registered in the model, it is visible.
 * @category Visible Columns
 */
export declare const gridInitialColumnVisibilityModelSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("@mui/x-data-grid").GridColumnVisibilityModel;
/**
 * Get the visible columns as a lookup (an object containing the field for keys and the definition for values).
 * @category Visible Columns
 */
export declare const gridVisibleColumnDefinitionsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("../../../internals/index.js").GridStateColDef[];
/**
 * Get the field of each visible column.
 * @category Visible Columns
 */
export declare const gridVisibleColumnFieldsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => string[];
/**
 * Get the visible pinned columns model.
 * @category Visible Columns
 */
export declare const gridPinnedColumnsSelector: import("@mui/x-data-grid").OutputSelector<GridStateCommunity, unknown, GridPinnedColumnFields>;
/**
 * Get all existing pinned columns. Place the columns on the side that depends on the rtl state.
 * @category Pinned Columns
 * @ignore - Do not document
 */
export declare const gridExistingPinnedColumnSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => {
  left: string[];
  right: string[];
};
/**
 * Get the visible pinned columns.
 * @category Visible Columns
 */
export declare const gridVisiblePinnedColumnDefinitionsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => {
  left: import("../../../internals/index.js").GridStateColDef[];
  right: import("../../../internals/index.js").GridStateColDef[];
};
/**
 * Get the left position in pixel of each visible columns relative to the left of the first column.
 * @category Visible Columns
 */
export declare const gridColumnPositionsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => number[];
/**
 * Get the filterable columns as an array.
 * @category Columns
 */
export declare const gridFilterableColumnDefinitionsSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => import("../../../internals/index.js").GridStateColDef[];
/**
 * Get the filterable columns as a lookup (an object containing the field for keys and the definition for values).
 * @category Columns
 */
export declare const gridFilterableColumnLookupSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => GridColumnLookup;
/**
 * Checks if some column has a colSpan field.
 * @category Columns
 * @ignore - Do not document
 */
export declare const gridHasColSpanSelector: (args_0: import("react").RefObject<{
  state: GridStateCommunity;
} | null>) => boolean;