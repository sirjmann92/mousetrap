import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
import { GridStateInitializer } from "../../utils/useGridInitializeState.js";
export declare const editingStateInitializer: GridStateInitializer;
export declare const useGridEditing: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "isCellEditable" | "editMode" | "processRowUpdate" | "dataSource" | "onDataSourceError">) => void;