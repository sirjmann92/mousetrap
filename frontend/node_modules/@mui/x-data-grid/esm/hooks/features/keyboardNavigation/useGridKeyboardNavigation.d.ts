import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
/**
 * @requires useGridSorting (method) - can be after
 * @requires useGridFilter (state) - can be after
 * @requires useGridColumns (state, method) - can be after
 * @requires useGridDimensions (method) - can be after
 * @requires useGridFocus (method) - can be after
 * @requires useGridScroll (method) - can be after
 * @requires useGridColumnSpanning (method) - can be after
 */
export declare const useGridKeyboardNavigation: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "pagination" | "paginationMode" | "getRowId" | "signature" | "headerFilters">) => void;