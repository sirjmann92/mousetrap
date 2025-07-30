import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
export declare const useGridPaginationMeta: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "paginationMeta" | "initialState" | "paginationMode" | "onPaginationMetaChange">) => void;