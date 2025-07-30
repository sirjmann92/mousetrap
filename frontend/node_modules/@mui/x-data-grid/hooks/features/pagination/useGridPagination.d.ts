import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
import { GridStateInitializer } from "../../utils/useGridInitializeState.js";
export declare const paginationStateInitializer: GridStateInitializer<Pick<DataGridProcessedProps, 'paginationModel' | 'rowCount' | 'initialState' | 'autoPageSize' | 'signature' | 'paginationMeta' | 'pagination' | 'paginationMode'>>;
/**
 * @requires useGridFilter (state)
 * @requires useGridDimensions (event) - can be after
 */
export declare const useGridPagination: (apiRef: RefObject<GridPrivateApiCommunity>, props: DataGridProcessedProps) => void;