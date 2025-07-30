import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import type { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
/**
 * @requires useGridColumns (state)
 * @requires useGridFilter (state)
 * @requires useGridSorting (state)
 * @requires useGridSelection (state)
 * @requires useGridParamsApi (method)
 */
export declare const useGridCsvExport: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "ignoreValueFormatterDuringExport">) => void;