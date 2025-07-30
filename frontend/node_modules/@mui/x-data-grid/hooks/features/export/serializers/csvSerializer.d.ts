import { RefObject } from '@mui/x-internals/types';
import type { GridCsvExportOptions, GridRowId } from "../../../../models/index.js";
import type { GridCellParams } from "../../../../models/params/gridCellParams.js";
import type { GridStateColDef } from "../../../../models/colDef/gridColDef.js";
import type { GridApiCommunity } from "../../../../models/api/gridApiCommunity.js";
export declare const serializeCellValue: (cellParams: GridCellParams, options: {
  csvOptions: CSVOptions;
  ignoreValueFormatter: boolean;
}) => string;
type CSVOptions = Required<Pick<GridCsvExportOptions, 'delimiter' | 'shouldAppendQuotes' | 'escapeFormulas'>>;
interface BuildCSVOptions {
  columns: GridStateColDef[];
  rowIds: GridRowId[];
  csvOptions: Required<Pick<GridCsvExportOptions, 'delimiter' | 'includeColumnGroupsHeaders' | 'includeHeaders' | 'shouldAppendQuotes' | 'escapeFormulas'>>;
  ignoreValueFormatter: boolean;
  apiRef: RefObject<GridApiCommunity>;
}
export declare function buildCSV(options: BuildCSVOptions): string;
export {};