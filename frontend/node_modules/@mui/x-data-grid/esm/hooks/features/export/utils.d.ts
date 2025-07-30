import { RefObject } from '@mui/x-internals/types';
import { GridApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { GridExportOptions, GridCsvGetRowsToExportParams } from "../../../models/gridExport.js";
import { GridStateColDef } from "../../../models/colDef/gridColDef.js";
import { GridRowId } from "../../../models/index.js";
interface GridGetColumnsToExportParams {
  /**
   * The API of the grid.
   */
  apiRef: RefObject<GridApiCommunity>;
  options: GridExportOptions;
}
export declare const getColumnsToExport: ({
  apiRef,
  options
}: GridGetColumnsToExportParams) => GridStateColDef[];
export declare const defaultGetRowsToExport: ({
  apiRef
}: GridCsvGetRowsToExportParams) => GridRowId[];
export {};