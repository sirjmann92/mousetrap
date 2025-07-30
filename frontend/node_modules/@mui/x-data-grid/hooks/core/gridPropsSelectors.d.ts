import type { GridStateCommunity } from "../../models/gridStateCommunity.js";
import type { GridRowId } from "../../models/gridRows.js";
/**
 * Get the row id for a given row
 * @param apiRef - The grid api reference
 * @param {GridRowModel} row - The row to get the id for
 * @returns {GridRowId} The row id
 */
export declare const gridRowIdSelector: import("@mui/x-data-grid").OutputSelector<GridStateCommunity, import("@mui/x-data-grid").GridValidRowModel, GridRowId>;