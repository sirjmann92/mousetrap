import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import type { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
/**
 * @requires useGridCsvExport (method)
 * @requires useGridSelection (method)
 */
export declare const useGridClipboard: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "ignoreValueFormatterDuringExport" | "onClipboardCopy" | "clipboardCopyCellDelimiter">) => void;