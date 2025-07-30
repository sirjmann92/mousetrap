import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
export declare const useGridCellEditing: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "editMode" | "processRowUpdate" | "onCellEditStart" | "onCellEditStop" | "cellModesModel" | "onCellModesModelChange" | "onProcessRowUpdateError" | "signature" | "dataSource">) => void;