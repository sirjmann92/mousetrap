import { RefObject } from '@mui/x-internals/types';
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { GridStateInitializer } from "../../utils/useGridInitializeState.js";
export declare const sortingStateInitializer: GridStateInitializer<Pick<DataGridProcessedProps, 'sortModel' | 'initialState' | 'disableMultipleColumnsSorting'>>;
/**
 * @requires useGridRows (event)
 * @requires useGridColumns (event)
 */
export declare const useGridSorting: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "initialState" | "sortModel" | "onSortModelChange" | "sortingOrder" | "sortingMode" | "disableColumnSorting" | "disableMultipleColumnsSorting" | "multipleColumnsSortingMode">) => void;