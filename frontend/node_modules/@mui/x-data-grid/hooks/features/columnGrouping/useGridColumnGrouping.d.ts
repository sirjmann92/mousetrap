import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
import { GridStateInitializer } from "../../utils/useGridInitializeState.js";
export declare const columnGroupsStateInitializer: GridStateInitializer<Pick<DataGridProcessedProps, 'columnGroupingModel'>>;
/**
 * @requires useGridColumns (method, event)
 * @requires useGridParamsApi (method)
 */
export declare const useGridColumnGrouping: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "columnGroupingModel">) => void;