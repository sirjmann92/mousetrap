import { RefObject } from '@mui/x-internals/types';
import { GridStateInitializer } from "../../utils/useGridInitializeState.js";
import type { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
import type { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
export declare const columnResizeStateInitializer: GridStateInitializer;
/**
 * @requires useGridColumns (method, event)
 * TODO: improve experience for last column
 */
export declare const useGridColumnResize: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "autosizeOptions" | "autosizeOnMount" | "disableAutosize" | "onColumnResize" | "onColumnWidthChange" | "disableVirtualization">) => void;