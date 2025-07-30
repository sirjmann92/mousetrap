import { RefObject } from '@mui/x-internals/types';
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { GridStateInitializer } from "../../utils/useGridInitializeState.js";
export declare const rowSelectionStateInitializer: GridStateInitializer<Pick<DataGridProcessedProps, 'rowSelectionModel' | 'rowSelection'>>;
/**
 * @requires useGridRows (state, method) - can be after
 * @requires useGridParamsApi (method) - can be after
 * @requires useGridFocus (state) - can be after
 * @requires useGridKeyboardNavigation (`cellKeyDown` event must first be consumed by it)
 */
export declare const useGridRowSelection: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "checkboxSelection" | "rowSelectionModel" | "onRowSelectionModelChange" | "disableMultipleRowSelection" | "disableRowSelectionOnClick" | "isRowSelectable" | "checkboxSelectionVisibleOnly" | "pagination" | "paginationMode" | "filterMode" | "classes" | "keepNonExistentRowsSelected" | "rowSelection" | "rowSelectionPropagation" | "signature">) => void;