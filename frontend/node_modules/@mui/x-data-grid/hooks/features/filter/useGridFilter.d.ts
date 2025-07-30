import { RefObject } from '@mui/x-internals/types';
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { GridStateInitializer } from "../../utils/useGridInitializeState.js";
export declare const filterStateInitializer: GridStateInitializer<Pick<DataGridProcessedProps, 'filterModel' | 'initialState' | 'disableMultipleColumnsFiltering'>>;
/**
 * @requires useGridColumns (method, event)
 * @requires useGridParamsApi (method)
 * @requires useGridRows (event)
 */
export declare const useGridFilter: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "rows" | "initialState" | "filterModel" | "getRowId" | "onFilterModelChange" | "filterMode" | "disableMultipleColumnsFiltering" | "slots" | "slotProps" | "disableColumnFilter" | "disableEval" | "ignoreDiacritics">) => void;