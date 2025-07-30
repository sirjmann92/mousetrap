import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
export declare const useGridRowEditing: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "editMode" | "processRowUpdate" | "onRowEditStart" | "onRowEditStop" | "onProcessRowUpdateError" | "rowModesModel" | "onRowModesModelChange" | "signature" | "dataSource">) => void;