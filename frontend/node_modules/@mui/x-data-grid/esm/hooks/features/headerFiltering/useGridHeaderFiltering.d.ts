import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
import { GridStateInitializer } from "../../utils/useGridInitializeState.js";
export declare const headerFilteringStateInitializer: GridStateInitializer;
export declare const useGridHeaderFiltering: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "signature" | "headerFilters">) => void;