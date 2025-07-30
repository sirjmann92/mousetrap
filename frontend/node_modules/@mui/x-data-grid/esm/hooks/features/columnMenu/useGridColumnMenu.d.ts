import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { GridStateInitializer } from "../../utils/useGridInitializeState.js";
export declare const columnMenuStateInitializer: GridStateInitializer;
/**
 * @requires useGridColumnResize (event)
 * @requires useGridInfiniteLoader (event)
 */
export declare const useGridColumnMenu: (apiRef: RefObject<GridPrivateApiCommunity>) => void;