import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
import { GridPaginationState } from "./gridPaginationInterfaces.js";
import { GridPaginationModel } from "../../../models/gridPaginationProps.js";
export declare const getDerivedPaginationModel: (paginationState: GridPaginationState, signature: DataGridProcessedProps["signature"], paginationModelProp?: GridPaginationModel) => GridPaginationModel;
/**
 * @requires useGridFilter (state)
 * @requires useGridDimensions (event) - can be after
 */
export declare const useGridPaginationModel: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "paginationModel" | "onPaginationModelChange" | "autoPageSize" | "initialState" | "paginationMode" | "pagination" | "signature" | "rowHeight">) => void;