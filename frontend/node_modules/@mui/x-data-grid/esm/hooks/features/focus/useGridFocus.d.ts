import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
import { GridStateInitializer } from "../../utils/useGridInitializeState.js";
export declare const focusStateInitializer: GridStateInitializer;
/**
 * @requires useGridParamsApi (method)
 * @requires useGridRows (method)
 * @requires useGridEditing (event)
 */
export declare const useGridFocus: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "pagination" | "paginationMode">) => void;